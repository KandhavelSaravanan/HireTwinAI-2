import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Target, TrendingUp, Clock, CheckCircle2, XCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RoleData {
  currentSkills: string[];
  missingSkills: { name: string; priority: "High" | "Medium" | "Low"; timeToLearn: string }[];
  timeToReady: string;
  learningPath: { month: string; title: string; desc: string; gradient: string }[];
  matchScore: number;
}

const roleDatabase: Record<string, RoleData> = {
  "AI Engineer": {
    matchScore: 62,
    currentSkills: ["Python", "Machine Learning", "TensorFlow", "React", "Node.js", "MongoDB", "Git"],
    missingSkills: [
      { name: "PyTorch", priority: "High", timeToLearn: "4 weeks" },
      { name: "Docker", priority: "High", timeToLearn: "2 weeks" },
      { name: "Kubernetes", priority: "Medium", timeToLearn: "6 weeks" },
      { name: "MLOps", priority: "High", timeToLearn: "8 weeks" },
      { name: "Apache Spark", priority: "Medium", timeToLearn: "5 weeks" },
      { name: "AWS/GCP ML", priority: "Medium", timeToLearn: "6 weeks" },
    ],
    timeToReady: "6",
    learningPath: [
      { month: "Month 1", title: "Foundation Phase", desc: "Docker, PyTorch basics, containerization", gradient: "from-blue-500 to-purple-500" },
      { month: "Month 2–4", title: "Advanced Skills", desc: "MLOps, Kubernetes, Cloud platforms", gradient: "from-purple-500 to-pink-500" },
      { month: "Month 5–6", title: "Real Projects", desc: "Build portfolio projects, Apache Spark", gradient: "from-green-500 to-emerald-500" },
    ],
  },
  "Data Scientist": {
    matchScore: 55,
    currentSkills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Git", "Data Analysis"],
    missingSkills: [
      { name: "R Programming", priority: "High", timeToLearn: "3 weeks" },
      { name: "Statistics & Probability", priority: "High", timeToLearn: "6 weeks" },
      { name: "Power BI / Tableau", priority: "Medium", timeToLearn: "3 weeks" },
      { name: "Feature Engineering", priority: "High", timeToLearn: "4 weeks" },
      { name: "A/B Testing", priority: "Medium", timeToLearn: "2 weeks" },
      { name: "Hadoop / Hive", priority: "Low", timeToLearn: "5 weeks" },
    ],
    timeToReady: "5",
    learningPath: [
      { month: "Month 1", title: "Statistics Mastery", desc: "Advanced stats, probability, hypothesis testing", gradient: "from-blue-500 to-cyan-500" },
      { month: "Month 2–3", title: "Data Tools", desc: "R, Tableau, Power BI dashboards", gradient: "from-purple-500 to-indigo-500" },
      { month: "Month 4–5", title: "Applied Projects", desc: "End-to-end data science projects, A/B testing", gradient: "from-green-500 to-teal-500" },
    ],
  },
  "ML Engineer": {
    matchScore: 58,
    currentSkills: ["Python", "TensorFlow", "Machine Learning", "Git", "Docker", "MongoDB"],
    missingSkills: [
      { name: "Model Serving (TorchServe)", priority: "High", timeToLearn: "3 weeks" },
      { name: "CI/CD for ML", priority: "High", timeToLearn: "4 weeks" },
      { name: "Feature Stores", priority: "Medium", timeToLearn: "3 weeks" },
      { name: "Monitoring (Evidently AI)", priority: "Medium", timeToLearn: "2 weeks" },
      { name: "Kubeflow / MLflow", priority: "High", timeToLearn: "5 weeks" },
      { name: "ONNX", priority: "Low", timeToLearn: "2 weeks" },
    ],
    timeToReady: "4",
    learningPath: [
      { month: "Month 1", title: "MLOps Foundations", desc: "MLflow, CI/CD pipelines, model serving", gradient: "from-orange-500 to-red-500" },
      { month: "Month 2–3", title: "Production Systems", desc: "Kubeflow, feature stores, monitoring", gradient: "from-purple-500 to-pink-500" },
      { month: "Month 4", title: "Optimization", desc: "ONNX, model compression, real deployments", gradient: "from-green-500 to-emerald-500" },
    ],
  },
  "Full Stack Developer": {
    matchScore: 72,
    currentSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Git", "HTML/CSS", "REST APIs"],
    missingSkills: [
      { name: "TypeScript", priority: "High", timeToLearn: "3 weeks" },
      { name: "GraphQL", priority: "Medium", timeToLearn: "2 weeks" },
      { name: "Redis / Caching", priority: "Medium", timeToLearn: "2 weeks" },
      { name: "Docker / Kubernetes", priority: "High", timeToLearn: "4 weeks" },
      { name: "System Design", priority: "High", timeToLearn: "6 weeks" },
      { name: "CI/CD (GitHub Actions)", priority: "Medium", timeToLearn: "2 weeks" },
    ],
    timeToReady: "3",
    learningPath: [
      { month: "Month 1", title: "TypeScript & Advanced JS", desc: "TypeScript, GraphQL, advanced React patterns", gradient: "from-blue-500 to-cyan-500" },
      { month: "Month 2", title: "DevOps Basics", desc: "Docker, CI/CD, Redis caching strategies", gradient: "from-yellow-500 to-orange-500" },
      { month: "Month 3", title: "System Design", desc: "Scalable architecture, distributed systems", gradient: "from-green-500 to-emerald-500" },
    ],
  },
};

const roleOptions = Object.keys(roleDatabase);

export function SkillGapAnalyzer() {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState(() => {
    const raw = localStorage.getItem("hiretwin_target_role") || "AI Engineer";
    if (raw.includes("AI / ML") || raw.toLowerCase().includes("ml engineer")) return "ML Engineer";
    if (raw.includes("AI") || raw.includes("ML") || raw.includes("Machine")) return "AI Engineer";
    if (raw.toLowerCase().includes("data scientist")) return "Data Scientist";
    if (raw.toLowerCase().includes("full stack") || raw.toLowerCase().includes("developer")) return "Full Stack Developer";
    return "AI Engineer";
  });

  const [roleData, setRoleData] = useState<RoleData>({
    currentSkills: [],
    missingSkills: [],
    timeToReady: "0",
    learningPath: [],
    matchScore: 0,
  });

  useEffect(() => {
    let skillsStr = localStorage.getItem("hiretwin_skills") || "";

    const resumeStr = localStorage.getItem("hiretwin_resume");
    if (resumeStr) {
      try {
        const resume = JSON.parse(resumeStr);
        if (resume.formData?.skills) skillsStr = resume.formData.skills;
      } catch (e) {}
    } else {
      const profileStr = localStorage.getItem("hiretwin_profile");
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile[2]) {
            const skillsArr = Array.isArray(profile[2]) ? profile[2] : [];
            const langArr = Array.isArray(profile[4]) ? profile[4] : [];
            skillsStr = [...skillsArr, ...langArr].join(", ");
          }
        } catch (e) {}
      }
    }

    const userSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
    const baseData = roleDatabase[targetRole] || roleDatabase["AI Engineer"];

    const requiredSkills = [
      ...baseData.currentSkills,
      ...baseData.missingSkills.map(ms => ms.name)
    ];

    let current = userSkills.filter(s => 
      requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
    );
    if (current.length === 0 && userSkills.length > 0) {
      current = userSkills.slice(0, 5);
    }

    const missing = baseData.missingSkills.filter(ms => 
      !userSkills.some(s => s.toLowerCase() === ms.name.toLowerCase())
    );

    const matchScore = requiredSkills.length > 0 
      ? Math.min(100, Math.round((current.length / requiredSkills.length) * 100))
      : 50;

    const timeToReady = Math.max(1, Math.round(missing.length * 1.2)).toString();

    setRoleData({
      currentSkills: current.length > 0 ? current : ["Python", "JavaScript"],
      missingSkills: missing.length > 0 ? missing : [
        { name: "Docker", priority: "High", timeToLearn: "2 weeks" },
        { name: "Kubernetes", priority: "Medium", timeToLearn: "4 weeks" }
      ],
      timeToReady,
      learningPath: baseData.learningPath,
      matchScore: matchScore > 0 ? matchScore : 60,
    });
  }, [targetRole]);

  const data = roleData;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-semibold">Skill Gap Analyzer</h3>
              <p className="text-slate-400 text-sm">Live analysis based on your target role</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Target Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-white font-semibold mb-4">Select Your Target Role</h3>
            <div className="flex flex-wrap gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    targetRole === role
                      ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-900/20"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={targetRole}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Match Score Banner */}
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-purple-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Your match score for</p>
                  <h2 className="text-white text-2xl font-bold">{targetRole}</h2>
                </div>
                <div className="text-right">
                  <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - data.matchScore / 100) }}
                        transition={{ duration: 1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{data.matchScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-slate-400 text-sm">Skills You Have</span>
                  </div>
                  <p className="text-white text-4xl font-bold mb-1">{data.currentSkills.length}</p>
                  <p className="text-green-400 text-sm">Strong foundation</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-slate-400 text-sm">Skills to Learn</span>
                  </div>
                  <p className="text-white text-4xl font-bold mb-1">{data.missingSkills.length}</p>
                  <p className="text-orange-400 text-sm">To reach target role</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-400 text-sm">Time to Ready</span>
                  </div>
                  <p className="text-white text-4xl font-bold mb-1">{data.timeToReady}</p>
                  <p className="text-blue-400 text-sm">months estimated</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Skills */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">Your Current Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {data.currentSkills.map((skill, index) => (
                      <motion.div key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {skill}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Missing Skills */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Target className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-semibold">Skills Gap for {targetRole}</h3>
                  </div>
                  <div className="space-y-3">
                    {data.missingSkills.map((skill, index) => (
                      <motion.div key={skill.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.08 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400" />
                            <h4 className="text-white text-sm font-medium">{skill.name}</h4>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            skill.priority === "High" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : skill.priority === "Medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          }`}>
                            {skill.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Est. time: {skill.timeToLearn}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Learning Timeline */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recommended Learning Path for {targetRole}
                </h3>
                <div className="space-y-4">
                  {data.learningPath.map((phase, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-24 text-center shrink-0">
                        <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${phase.gradient} rounded-full flex items-center justify-center mb-2`}>
                          <span className="text-white text-xs font-semibold text-center leading-tight px-1">{phase.month}</span>
                        </div>
                      </div>
                      <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <h4 className="text-white font-medium mb-1">{phase.title}</h4>
                        <p className="text-slate-400 text-sm">{phase.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-8">
                <button
                  onClick={() => navigate("/learning-roadmap")}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-purple-900/30"
                >
                  Generate Personalized Learning Roadmap →
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
