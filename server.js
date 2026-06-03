// Local MySQL backend server for HireTwin AI
// Replaces the Supabase Edge Function with a local Express + MySQL2 server
// Run with: node server.js

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const scryptAsync = promisify(scrypt);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Simple logger middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MySQL connection pool (assigned after database initialization)
let pool;

// ─── Password Helpers ─────────────────────────────────────

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, hash) {
  const [salt, keyHex] = hash.split(":");
  const derivedKey = await scryptAsync(password, salt, 64);
  const keyBuffer = Buffer.from(keyHex, "hex");
  return timingSafeEqual(derivedKey, keyBuffer);
}

// ─── Database Initialisation ──────────────────────────────

// Auto-create database and table on startup
async function initDatabase() {
  try {
    // Create a temporary connection without specifying DB to create it
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    const dbName = process.env.DB_NAME || "hiretwin_db";
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConn.query(`USE \`${dbName}\``);

    // KV store table (existing)
    await tempConn.query(`
      CREATE TABLE IF NOT EXISTS kv_store (
        \`key\` VARCHAR(512) NOT NULL PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Users table (new — for auth)
    await tempConn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(512) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Check and update table schema if it already exists
    const [tables] = await tempConn.query("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      // 1. Delete user accounts created via social logins (which have NULL password_hash)
      await tempConn.query("DELETE FROM users WHERE password_hash IS NULL");

      // 2. Describe columns to check for 'provider' column
      const [columns] = await tempConn.query("SHOW COLUMNS FROM users");
      const hasProvider = columns.some(c => c.Field === "provider");
      if (hasProvider) {
        console.log("Updating 'users' table schema: dropping 'provider' column...");
        await tempConn.query("ALTER TABLE users DROP COLUMN provider");
      }

      // 3. Make password_hash NOT NULL if it is currently nullable
      const pwdCol = columns.find(c => c.Field === "password_hash");
      if (pwdCol && pwdCol.Null === "YES") {
        console.log("Updating 'users' table schema: modifying 'password_hash' to NOT NULL...");
        await tempConn.query("ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(512) NOT NULL");
      }
    }

    await tempConn.end();

    // Initialize connection pool once database and tables exist
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log(`✅ Database '${dbName}' and tables 'kv_store', 'users' ready.`);
  } catch (err) {
    console.error("❌ Failed to initialize database:", err.message);
    console.error("   Make sure MySQL is running and credentials in .env are correct.");
    process.exit(1);
  }
}

// KV Store helpers
async function kvGet(key) {
  const [rows] = await pool.execute(
    "SELECT `value` FROM kv_store WHERE `key` = ?",
    [key]
  );
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].value);
  } catch {
    return rows[0].value;
  }
}

async function kvSet(key, value) {
  const json = JSON.stringify(value);
  await pool.execute(
    "INSERT INTO kv_store (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
    [key, json, json]
  );
}

// ─── Routes ───────────────────────────────────────────────

const PREFIX = "/make-server-c646ecc8";

// Health check
app.get(`${PREFIX}/health`, (_req, res) => {
  res.json({ status: "ok", database: "mysql", timestamp: new Date().toISOString() });
});

// ─── Auth ─────────────────────────────────────────────────

// GET /auth/check/:email — check if email is already registered
app.get(`${PREFIX}/auth/check/:email`, async (req, res) => {
  try {
    const [existing] = await pool.execute(
      "SELECT id, name FROM users WHERE email = ?",
      [req.params.email.trim().toLowerCase()]
    );
    return res.json({ success: true, exists: existing.length > 0, name: existing.length > 0 ? existing[0].name : null });
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /auth/register — create a new user with email + password
app.post(`${PREFIX}/auth/register`, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required." });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: "An account with this email already exists. Please sign in." });
    }

    const password_hash = await hashPassword(password);
    await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password_hash]
    );

    return res.json({ success: true, user: { name, email } });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, error: "Registration failed. Please try again." });
  }
});

// POST /auth/login — sign in with email + password
app.post(`${PREFIX}/auth/login`, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "No account found with this email. Please register first." });
    }

    const user = rows[0];

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Incorrect password. Please try again." });
    }

    return res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Login failed. Please try again." });
  }
});



// ─── Profile ──────────────────────────────────────────────

// GET profile
app.get(`${PREFIX}/profile/:email`, async (req, res) => {
  try {
    const profile = await kvGet(`profile:${req.params.email}`);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST profile
app.post(`${PREFIX}/profile`, async (req, res) => {
  try {
    const { email, profile } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });
    await kvSet(`profile:${email}`, profile);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Resume ───────────────────────────────────────────────

// GET resume
app.get(`${PREFIX}/resume/:email`, async (req, res) => {
  try {
    const resume = await kvGet(`resume:${req.params.email}`);
    res.json({ success: true, data: resume });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST resume
app.post(`${PREFIX}/resume`, async (req, res) => {
  try {
    const { email, resume } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });
    await kvSet(`resume:${email}`, resume);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Interview ────────────────────────────────────────────

// GET interviews
app.get(`${PREFIX}/interview/:email`, async (req, res) => {
  try {
    const interviews = await kvGet(`interview:${req.params.email}`) || [];
    res.json({ success: true, data: interviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST interview
app.post(`${PREFIX}/interview`, async (req, res) => {
  try {
    const { email, interview } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });
    const existing = await kvGet(`interview:${email}`) || [];
    existing.push(interview);
    await kvSet(`interview:${email}`, existing);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Roadmap ──────────────────────────────────────────────

// GET roadmap
app.get(`${PREFIX}/roadmap/:email`, async (req, res) => {
  try {
    const roadmap = await kvGet(`roadmap:${req.params.email}`);
    res.json({ success: true, data: roadmap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST roadmap
app.post(`${PREFIX}/roadmap`, async (req, res) => {
  try {
    const { email, roadmap } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });
    await kvSet(`roadmap:${email}`, roadmap);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Portfolio ────────────────────────────────────────────

// GET portfolio
app.get(`${PREFIX}/portfolio/:email`, async (req, res) => {
  try {
    const portfolio = await kvGet(`portfolio:${req.params.email}`);
    res.json({ success: true, data: portfolio });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST portfolio
app.post(`${PREFIX}/portfolio`, async (req, res) => {
  try {
    const { email, portfolio } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });
    await kvSet(`portfolio:${email}`, portfolio);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── LinkedIn ─────────────────────────────────────────────

// GET linkedin
app.get(`${PREFIX}/linkedin/:email`, async (req, res) => {
  try {
    const linkedin = await kvGet(`linkedin:${req.params.email}`);
    res.json({ success: true, data: linkedin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST linkedin
app.post(`${PREFIX}/linkedin`, async (req, res) => {
  try {
    const { email, linkedin } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });
    await kvSet(`linkedin:${email}`, linkedin);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ─── Dashboard Stats & Streak ─────────────────────────────

// GET dashboard-stats
app.get(`${PREFIX}/dashboard-stats/:email`, async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    // 1. Calculate Resume Strength
    const resume = await kvGet(`resume:${email}`);
    let resumeStrength = 0;
    if (resume) {
      let points = 0;
      const fd = resume.formData || {};
      if (fd.fullName) points += 15;
      if (fd.email) points += 10;
      if (fd.phone) points += 10;
      if (fd.linkedin) points += 5;
      if (fd.github) points += 5;
      if (fd.education) points += 15;
      
      if (fd.skills) {
        const skillsList = fd.skills.split(",").map(s => s.trim()).filter(Boolean);
        points += Math.min(20, skillsList.length * 4); // max 20%
      }
      
      const exp = resume.experience || [];
      if (Array.isArray(exp) && exp.length > 0) {
        points += Math.min(10, exp.length * 5); // max 10%
      }
      
      const proj = resume.projects || [];
      if (Array.isArray(proj) && proj.length > 0) {
        points += Math.min(10, proj.length * 5); // max 10%
      }
      resumeStrength = Math.min(100, points);
    }

    // 2. Fetch Learning Streak
    const streakObj = await kvGet(`streak:${email}`);
    let learningStreak = 0;
    if (streakObj && streakObj.count !== undefined) {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastUpdatedStr = streakObj.lastUpdated;
      
      if (lastUpdatedStr) {
        const lastDate = new Date(lastUpdatedStr);
        const currentDate = new Date(todayStr);
        const utc1 = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const utc2 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          learningStreak = streakObj.count;
        } else {
          learningStreak = 0;
        }
      }
    }

    // 3. Calculate Interview Stats
    const interviews = await kvGet(`interview:${email}`) || [];
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.score !== undefined).length;

    // 4. Calculate Roadmap Progress & Skills Mastered
    const roadmap = await kvGet(`roadmap:${email}`);
    let roadmapProgress = 0;
    let completedGoalsCount = 0;
    if (roadmap && Array.isArray(roadmap)) {
      let totalGoals = 0;
      let completedGoals = 0;
      roadmap.forEach(phase => {
        if (phase && Array.isArray(phase.goals)) {
          phase.goals.forEach(goal => {
            totalGoals++;
            if (goal.status === "completed") {
              completedGoals++;
              completedGoalsCount++;
            }
          });
        }
      });
      if (totalGoals > 0) {
        roadmapProgress = Math.round((completedGoals / totalGoals) * 100);
      }
    }

    // Calculate Skills Mastered dynamically
    let skillsMastered = 0;
    if (resume && resume.formData && resume.formData.skills) {
      const skillsList = resume.formData.skills.split(",").map(s => s.trim()).filter(Boolean);
      skillsMastered += skillsList.length;
    }
    skillsMastered += completedGoalsCount;
    if (skillsMastered === 0) {
      skillsMastered = 5; // default starting point
    }

    // 5. Calculate Career Score
    let interviewAvgScore = 0;
    if (totalInterviews > 0) {
      const scores = interviews.map(i => i.score).filter(s => s !== undefined);
      if (scores.length > 0) {
        interviewAvgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    }
    
    let careerScore = 15; // default base score
    if (resumeStrength > 0 || totalInterviews > 0 || roadmapProgress > 0) {
      careerScore = Math.round((resumeStrength * 0.4) + (interviewAvgScore * 0.4) + (roadmapProgress * 0.2));
      careerScore = Math.max(15, Math.min(100, careerScore));
    }

    res.json({
      success: true,
      data: {
        careerScore,
        resumeStrength,
        learningStreak,
        totalInterviews,
        completedInterviews,
        roadmapProgress,
        skillsMastered
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST learning-streak/increment
app.post(`${PREFIX}/learning-streak/increment`, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const today = new Date().toISOString().split("T")[0];
    let streakObj = await kvGet(`streak:${email}`);
    
    if (!streakObj) {
      streakObj = { count: 1, lastUpdated: today };
    } else {
      const lastDate = new Date(streakObj.lastUpdated);
      const currentDate = new Date(today);
      const utc1 = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const utc2 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakObj.count += 1;
        streakObj.lastUpdated = today;
      } else if (diffDays > 1) {
        streakObj.count = 1;
        streakObj.lastUpdated = today;
      }
    }
    
    await kvSet(`streak:${email}`, streakObj);
    res.json({ success: true, streak: streakObj.count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Tailored Interview Questions Bank ────────────────────

const QUESTION_BANK = {
  hr: {
    general: [
      { id: 1, category: "Behavioral", question: "Tell me about yourself and your background.", difficulty: "Easy", hint: "Focus on your professional journey and relevance to your career goals.", sampleAnswer: "Start with your current role/studies, outline 2-3 key achievements, and mention why you want to grow in this field." },
      { id: 2, category: "Conflict Resolution", question: "Describe a time you had a disagreement with a team member. How did you resolve it?", difficulty: "Medium", hint: "Use the STAR method. Focus on communication, collaboration, and objective criteria.", sampleAnswer: "Explain the situation, how you talked privately, analyzed the alternatives objectively, and reached a compromise." },
      { id: 3, category: "Failure & Resilience", question: "Tell me about a time you made a mistake or failed. What did you learn?", difficulty: "Medium", hint: "Take ownership, explain how you corrected it, and how it helped you improve.", sampleAnswer: "Discuss a specific error, the solution you implemented, and the precautions you took to prevent it from happening again." },
      { id: 4, category: "Leadership", question: "How do you prioritize your tasks when handling multiple projects with tight deadlines?", difficulty: "Easy", hint: "Discuss planning, prioritization tools, and stakeholder communication.", sampleAnswer: "Explain how you assess impact/urgency, update project tracking tools, and align expectations with key stakeholders." },
      { id: 5, category: "Career Alignment", question: "Where do you see yourself in five years? How does this role align with that?", difficulty: "Easy", hint: "Align your professional development goals with the path this domain offers.", sampleAnswer: "Discuss mastering the current domain, taking on system design or leadership responsibilities, and contributing to core projects." }
    ]
  },
  technical: {
    developer: [
      { id: 1, category: "Frontend", question: "What is the Virtual DOM in React, and how does it optimize rendering performance?", difficulty: "Medium", hint: "Think about reconciliation, diffing algorithms, and batch updates.", sampleAnswer: "The Virtual DOM is a lightweight representation of the real DOM in memory. React compares it with the previous state (diffing) and batches updates to minimize expensive manipulations of the real DOM." },
      { id: 2, category: "Backend", question: "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?", difficulty: "Medium", hint: "Think about schemas, scaling, and relationship complexity.", sampleAnswer: "SQL databases are relational, table-based, and have strict schemas (great for transactional consistency). NoSQL databases are non-relational, document/key-value/graph-based, and scale horizontally (great for unstructured data and high write loads)." },
      { id: 3, category: "Security", question: "What is JWT (JSON Web Token) and how is it used for secure authentication?", difficulty: "Medium", hint: "Think about header, payload, signature, and stateless sessions.", sampleAnswer: "JWT is a stateless token format used to securely transmit client identities. It consists of a header, payload (claims), and signature. The server signs it, and the client sends it in headers to authenticate subsequent requests." },
      { id: 4, category: "Architecture", question: "What are microservices, and how do they differ from monolithic architectures?", difficulty: "Hard", hint: "Consider scalability, deployment independence, and service boundaries.", sampleAnswer: "A monolith has all components in a single codebase/deployment. Microservices break the application into independent, loosely coupled services communicating via APIs/message brokers, making it easier to scale and deploy separately." },
      { id: 5, category: "Algorithms", question: "How do you handle asynchronous operations in JavaScript? Compare Promises and Async/Await.", difficulty: "Easy", hint: "Think about readability, error handling (try/catch), and callback hell.", sampleAnswer: "Promises represent values that will resolve in the future. Async/Await is syntactic sugar built on Promises, making asynchronous code look synchronous and easier to read with standard try/catch blocks." }
    ],
    ai_ml: [
      { id: 1, category: "Deep Learning", question: "Explain the vanishing gradient problem and how techniques like residual connections resolve it.", difficulty: "Hard", hint: "Think about backpropagation chain rule and gradient flow in ResNets.", sampleAnswer: "Vanishing gradients occur when gradients shrink during backpropagation in deep networks, halting training. Residual connections (ResNets) solve this by providing identity shortcuts that allow gradients to flow directly without multiplication." },
      { id: 2, category: "Data Science", question: "What is overfitting, and how do you detect and prevent it in predictive models?", difficulty: "Medium", hint: "Consider train/test splits, regularization, and ensemble techniques.", sampleAnswer: "Overfitting is when a model performs well on training data but poorly on unseen data. Detect it via train/test score divergence. Prevent it using cross-validation, L1/L2 regularization, dropout, pruning, or training more data." },
      { id: 3, category: "System Design", question: "Describe how you would design a real-time face recognition feature for a web app.", difficulty: "Hard", hint: "Consider client-side detection (MediaPipe/TensorFlow) vs backend embedding matching.", sampleAnswer: "Client side does face detection & cropping using MediaPipe. cropped face is sent to backend which uses a deep learning model (e.g. DeepFace) to extract embeddings, matching them with a database (e.g. Milvus vector DB) to recognize the user." },
      { id: 4, category: "NLP", question: "What is the difference between supervised and unsupervised learning? Give examples of each.", difficulty: "Easy", hint: "Consider labeled vs unlabeled training data.", sampleAnswer: "Supervised learning uses labeled training data (e.g., classification, regression). Unsupervised learning finds hidden patterns in unlabeled data (e.g., clustering with K-Means, dimensionality reduction with PCA)." },
      { id: 5, category: "Infrastructure", question: "How do you deploy and monitor ML models in production to detect data drift?", difficulty: "Hard", hint: "Think about containerization, API serving, and statistical drift tests.", sampleAnswer: "Deploy model as a REST API containerized with Docker/Kubernetes. Monitor drift by saving input data and using statistical tests (like KS-test or PSI) to check if incoming feature distributions differ from the training set." }
    ],
    devops: [
      { id: 1, category: "Containers", question: "What is the difference between a container (Docker) and a Virtual Machine?", difficulty: "Easy", hint: "Think about OS virtualization, shared kernels, and overhead.", sampleAnswer: "VMs virtualize hardware and run a complete guest OS, which has high overhead. Containers share the host OS kernel and isolate user space, making them lightweight and fast to boot." },
      { id: 2, category: "Orchestration", question: "Explain how Kubernetes manages scaling and self-healing for containerized apps.", difficulty: "Hard", hint: "Think about replication controllers, pod health checks, and HPA.", sampleAnswer: "Kubernetes uses ReplicaSets to ensure the requested number of pods are running. It restarts failed pods via liveness/readiness probes (self-healing) and uses Horizontal Pod Autoscaler (HPA) to scale pods based on CPU/memory usage." },
      { id: 3, category: "CI/CD", question: "Describe a complete CI/CD pipeline you would set up for a React and Node application.", difficulty: "Medium", hint: "Think about linting, testing, docker build, registry push, and deploy stages.", sampleAnswer: "Pipeline stages: 1) Trigger on git push, 2) Lint and run unit tests, 3) Build Docker images, 4) Push images to registry (e.g., Docker Hub), 5) Deploy to staging/production server (e.g., ECS or Kubernetes) and run smoke tests." },
      { id: 4, category: "IaC", question: "What is Infrastructure as Code (IaC) and when would you use Terraform over Ansible?", difficulty: "Medium", hint: "Think about provisioning infrastructure vs configuring servers.", sampleAnswer: "IaC manages infrastructure using config files. Terraform is declarative and best for provisioning resources (VMs, networks, databases), while Ansible is procedural and best for server configuration and software installation." },
      { id: 5, category: "Security", question: "How do you securely manage secrets and API keys in a cloud deployment?", difficulty: "Medium", hint: "Think about environmental variables and KMS services.", sampleAnswer: "Avoid hardcoding secrets in git. Use cloud secrets managers (e.g., AWS Secrets Manager, HashiCorp Vault) or injected environment variables, and encrypt them using Key Management Service (KMS) at rest." }
    ]
  },
  mlai: {
    general: [
      { id: 1, category: "Machine Learning", question: "Explain the difference between bagging and boosting algorithms. When would you use each?", difficulty: "Medium", hint: "Think about parallel training to reduce variance vs sequential training to reduce bias.", sampleAnswer: "Bagging (e.g., Random Forest) trains models in parallel to reduce variance (helps with overfitting). Boosting (e.g., XGBoost) trains models sequentially, where each corrects previous errors, to reduce bias (helps with underfitting)." },
      { id: 2, category: "Deep Learning", question: "What is the vanishing gradient problem, and how do you resolve it in deep networks?", difficulty: "Medium", hint: "Consider activation functions and residual skips.", sampleAnswer: "Vanishing gradients occur when gradients shrink to zero during backpropagation in deep networks. Resolve by using ReLU activations, batch normalization, Xavier weight initialization, and residual skip connections." },
      { id: 3, category: "MLOps", question: "How do you detect and manage concept drift or data drift for an ML model deployed in production?", difficulty: "Hard", hint: "Think about feature distribution shifts over time.", sampleAnswer: "Monitor incoming data distributions vs training data distributions using tests like Kolmogorov-Smirnov (KS). If drift is detected, trigger retraining pipeline with newly labeled data." },
      { id: 4, category: "LLMs", question: "Explain the self-attention mechanism in Transformer architectures.", difficulty: "Hard", hint: "Q, K, V projections and scaling.", sampleAnswer: "Self-attention computes relative importance weights between all tokens in a sequence. It uses Query, Key, and Value vectors: Attention(Q, K, V) = Softmax(Q * K^T / sqrt(d_k)) * V." },
      { id: 5, category: "System Design", question: "How would you design a real-time recommendation system for an e-commerce platform?", difficulty: "Hard", hint: "Candidate retrieval followed by candidate ranking.", sampleAnswer: "Use a two-stage design: 1) Retrieval (collaborative filtering or vector search) to fetch ~100 candidate items, 2) Ranking (deep neural network or boosted trees) to score and sort candidates based on user real-time context." }
    ]
  }
};

// GET /interview-questions/:type/:email
app.get(`${PREFIX}/interview-questions/:type/:email`, async (req, res) => {
  try {
    const { type, email } = req.params;
    if (!type || !email) {
      return res.status(400).json({ success: false, error: "Type and email are required." });
    }

    let targetRole = "AI Engineer";
    
    // 1. Fetch user's targetRole from MySQL database
    const resume = await kvGet(`resume:${email}`);
    if (resume && resume.formData && resume.formData.targetRole) {
      targetRole = resume.formData.targetRole;
    } else {
      const profile = await kvGet(`profile:${email}`);
      if (profile && (profile["3"] || profile[3])) {
        targetRole = profile["3"] || profile[3];
      }
    }

    const normalizedRole = targetRole.toLowerCase();

    // 2. Select questions based on interview type & role
    let questions = [];
    if (type === "hr") {
      questions = QUESTION_BANK.hr.general;
    } else if (type === "mlai") {
      questions = QUESTION_BANK.mlai.general;
    } else if (type === "technical") {
      if (normalizedRole.includes("devops") || normalizedRole.includes("cloud") || normalizedRole.includes("infrastructure")) {
        questions = QUESTION_BANK.technical.devops;
      } else if (normalizedRole.includes("develop") || normalizedRole.includes("stack") || normalizedRole.includes("frontend") || normalizedRole.includes("backend")) {
        questions = QUESTION_BANK.technical.developer;
      } else {
        questions = QUESTION_BANK.technical.ai_ml; // default for AI, ML, Data Science, etc.
      }
    } else {
      return res.status(400).json({ success: false, error: "Invalid interview type." });
    }

    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 HireTwin AI MySQL server running at http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}${PREFIX}/health`);
    console.log(`   Auth endpoints:`);
    console.log(`     POST http://localhost:${PORT}${PREFIX}/auth/register`);
    console.log(`     POST http://localhost:${PORT}${PREFIX}/auth/login`);
  });
});
