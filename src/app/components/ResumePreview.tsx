import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Download, Edit, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { fetchResume } from "../../utils/api";

export function ResumePreview() {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const atsScore = 85;

  useEffect(() => {
    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadResume() {
      try {
        const res = await fetchResume(email);
        if (res) {
          setResumeData(res);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, []);

  const handleDownload = () => {
    const name = resumeData?.formData?.fullName || "KANDHAVEL SARAVANAN";
    const role = resumeData?.formData?.targetRole || "AI Engineer | Machine Learning Specialist";
    const email = resumeData?.formData?.email || "kandhavel@example.com";
    const phone = resumeData?.formData?.phone || "+91 98765 43210";
    const linkedin = resumeData?.formData?.linkedin || "linkedin.com/in/kandhavel";
    const github = resumeData?.formData?.github || "github.com/kandhavel";
    const education = resumeData?.formData?.education || "B.Tech Computer Science, Anna University";
    const skills = resumeData?.formData?.skills || "Python, Machine Learning, React, Node.js, TensorFlow, Docker";
    
    const projectsList = resumeData?.projects || [
      { title: "Sentiment Analysis Model", description: "Developed ML model achieving 92% accuracy using BERT and PyTorch" }
    ];
    const expList = resumeData?.experience || [
      { role: "ML Intern", company: "Tech Corp", description: "Built data pipelines and trained classification models" }
    ];

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} - Resume</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.5;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
    }
    h1 {
      margin: 0 0 5px 0;
      color: #0f172a;
      font-size: 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .role {
      font-size: 18px;
      color: #4f46e5;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .contact-info {
      font-size: 13px;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 25px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    .item {
      margin-bottom: 15px;
    }
    .item-header {
      font-weight: 600;
      color: #1e293b;
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .item-company {
      color: #4f46e5;
      font-weight: 500;
    }
    p {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #334155;
    }
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <div class="role">${role}</div>
  <div class="contact-info">
    Email: ${email} | Phone: ${phone} | LinkedIn: ${linkedin} | GitHub: ${github}
  </div>

  <div class="section-title">Professional Summary</div>
  <p>
    Results-driven professional with expertise in target domain. Proven track record in developing high-quality software systems, analyzing requirements, and implementing optimized workflows to drive business success.
  </p>

  <div class="section-title">Education</div>
  <div class="item">
    <div class="item-header">
      <span>${education}</span>
    </div>
  </div>

  <div class="section-title">Technical Skills</div>
  <p>${skills}</p>

  <div class="section-title">Projects</div>
  ${projectsList.map((p: any) => `
    <div class="item">
      <div class="item-header">
        <span>${p.title}</span>
      </div>
      <p>${p.description}</p>
    </div>
  `).join("")}

  <div class="section-title">Professional Experience</div>
  ${expList.map((e: any) => `
    <div class="item">
      <div class="item-header">
        <span>${e.role}</span>
        <span class="item-company">${e.company}</span>
      </div>
      <p>${e.description}</p>
    </div>
  `).join("")}
</body>
</html>
    `;

    // Create a hidden iframe to perform print
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          // Remove the iframe after a short delay
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/resume-generator")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">Resume Preview</h3>
              <p className="text-slate-400 text-sm">Review and download your resume</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/resume-generator")}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Resume
            </button>
            <button 
              onClick={handleDownload}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Document */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-12 text-slate-900"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-200 pb-6 mb-6">
                <h1 className="text-4xl mb-2" style={{ fontWeight: 700 }}>
                  {resumeData?.formData?.fullName || "KANDHAVEL SARAVANAN"}
                </h1>
                <p className="text-lg text-slate-600 mb-3">
                  {resumeData?.formData?.targetRole || "AI Engineer | Machine Learning Specialist"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>{resumeData?.formData?.email || "kandhavel@example.com"}</span>
                  <span>•</span>
                  <span>{resumeData?.formData?.phone || "+91 98765 43210"}</span>
                  <span>•</span>
                  <span>{resumeData?.formData?.linkedin || "linkedin.com/in/kandhavel"}</span>
                  <span>•</span>
                  <span>{resumeData?.formData?.github || "github.com/kandhavel"}</span>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h2 className="text-xl mb-3" style={{ fontWeight: 700 }}>PROFESSIONAL SUMMARY</h2>
                <p className="text-slate-700 leading-relaxed">
                  Results-driven {(resumeData?.formData?.targetRole || "AI Engineer")} with expertise in target domain.
                  Proven track record in developing and deploying high-quality software systems, analyzing requirements, and implementing optimized workflows to drive business success.
                </p>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h2 className="text-xl mb-3" style={{ fontWeight: 700 }}>EDUCATION</h2>
                <div className="mb-2">
                  <h3 className="text-lg" style={{ fontWeight: 600 }}>
                    {resumeData?.formData?.education || "Bachelor of Technology in Computer Science"}
                  </h3>
                  <p className="text-slate-600">Anna University | 2020 - 2024</p>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h2 className="text-xl mb-3" style={{ fontWeight: 700 }}>TECHNICAL SKILLS</h2>
                <p className="text-slate-700">
                  {resumeData?.formData?.skills || "Python, Machine Learning, React, Node.js, TensorFlow, Docker"}
                </p>
              </div>

              {/* Projects */}
              <div className="mb-6">
                <h2 className="text-xl mb-3" style={{ fontWeight: 700 }}>PROJECTS</h2>
                {resumeData?.projects && resumeData.projects.length > 0 ? (
                  resumeData.projects.map((proj: any, index: number) => (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg" style={{ fontWeight: 600 }}>{proj.title || "Sentiment Analysis Model"}</h3>
                      <p className="text-slate-700 mt-2">{proj.description || "Developed ML model achieving 92% accuracy using BERT and PyTorch"}</p>
                    </div>
                  ))
                ) : (
                  <div className="mb-4">
                    <h3 className="text-lg" style={{ fontWeight: 600 }}>Sentiment Analysis Model</h3>
                    <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-700">
                      <li>Developed advanced sentiment analysis model using BERT architecture achieving 92% accuracy on social media text</li>
                      <li>Implemented data preprocessing pipeline processing 100K+ tweets daily using Python and Pandas</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h2 className="text-xl mb-3" style={{ fontWeight: 700 }}>PROFESSIONAL EXPERIENCE</h2>
                {resumeData?.experience && resumeData.experience.length > 0 ? (
                  resumeData.experience.map((exp: any, index: number) => (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg" style={{ fontWeight: 600 }}>{exp.role || "Machine Learning Intern"}</h3>
                      <p className="text-slate-600">{exp.company || "Tech Corp"}</p>
                      <p className="text-slate-700 mt-2">{exp.description || "Built data pipelines and trained classification models"}</p>
                    </div>
                  ))
                ) : (
                  <div className="mb-4">
                    <h3 className="text-lg" style={{ fontWeight: 600 }}>Machine Learning Intern</h3>
                    <p className="text-slate-600">Tech Corp | June 2023 - August 2023</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-700">
                      <li>Designed and implemented data pipelines for ETL processes handling 500GB+ daily data volume</li>
                      <li>Trained classification models achieving 88% precision for customer churn prediction</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="mb-6">
                <h2 className="text-xl mb-3" style={{ fontWeight: 700 }}>CERTIFICATIONS & ACHIEVEMENTS</h2>
                <ul className="list-disc ml-5 space-y-1 text-slate-700">
                  <li>AWS Certified Machine Learning - Specialty</li>
                  <li>TensorFlow Developer Certificate</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* ATS Analysis Sidebar */}
          <div className="space-y-6">
            {/* ATS Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-4">ATS Score</h3>

              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - atsScore / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl text-white" style={{ fontWeight: 700 }}>{atsScore}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Keywords</span>
                  <span className="text-green-400">Excellent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Formatting</span>
                  <span className="text-green-400">Excellent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Impact</span>
                  <span className="text-yellow-400">Good</span>
                </div>
              </div>
            </motion.div>

            {/* Missing Skills */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Suggested Improvements
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <p className="text-orange-400 text-sm" style={{ fontWeight: 600 }}>Add Keywords</p>
                  <p className="text-slate-300 text-sm mt-1">Include: Kubernetes, MLOps, CI/CD</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-400 text-sm" style={{ fontWeight: 600 }}>Quantify More</p>
                  <p className="text-slate-300 text-sm mt-1">Add more metrics and percentages</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/ats-analyzer")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:scale-105 transition-all text-sm"
                >
                  Improve ATS Score
                </button>
                <button
                  onClick={() => navigate("/portfolio")}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all text-sm"
                >
                  Generate Portfolio
                </button>
                <button
                  onClick={() => navigate("/career-prediction")}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all text-sm"
                >
                  View Career Predictions
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
