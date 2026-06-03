import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, Target, Briefcase, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface Prediction {
  role: string;
  probability: number;
  salary: string;
  gradient: string;
  skills: string[];
  growth: string;
}

const DEFAULT_PREDICTIONS: Prediction[] = [
  {
    role: "AI Engineer",
    probability: 82,
    salary: "$120K - $160K",
    gradient: "from-blue-500 to-cyan-500",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps"],
    growth: "+15%",
  },
  {
    role: "Data Scientist",
    probability: 76,
    salary: "$110K - $145K",
    gradient: "from-purple-500 to-pink-500",
    skills: ["Python", "R", "Statistics", "SQL"],
    growth: "+12%",
  },
  {
    role: "Machine Learning Engineer",
    probability: 74,
    salary: "$115K - $150K",
    gradient: "from-green-500 to-emerald-500",
    skills: ["Python", "Scikit-learn", "Docker", "Kubernetes"],
    growth: "+18%",
  },
  {
    role: "Full Stack Developer",
    probability: 68,
    salary: "$95K - $130K",
    gradient: "from-orange-500 to-red-500",
    skills: ["React", "Node.js", "MongoDB", "AWS"],
    growth: "+10%",
  },
  {
    role: "Product Manager (AI/ML)",
    probability: 61,
    salary: "$130K - $180K",
    gradient: "from-indigo-500 to-purple-500",
    skills: ["Strategy", "Analytics", "Communication", "ML Basics"],
    growth: "+20%",
  },
];

export function CareerPrediction() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>(DEFAULT_PREDICTIONS);
  const [topMatch, setTopMatch] = useState<Prediction>(DEFAULT_PREDICTIONS[0]);

  useEffect(() => {
    let role = localStorage.getItem("hiretwin_target_role") || "AI Engineer";
    let skillsStr = localStorage.getItem("hiretwin_skills") || "";

    const resumeStr = localStorage.getItem("hiretwin_resume");
    if (resumeStr) {
      try {
        const resume = JSON.parse(resumeStr);
        if (resume.formData?.targetRole) role = resume.formData.targetRole;
        if (resume.formData?.skills) skillsStr = resume.formData.skills;
      } catch (e) {}
    } else {
      const profileStr = localStorage.getItem("hiretwin_profile");
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile[3]) role = profile[3];
          if (profile[2]) {
            const skillsArr = Array.isArray(profile[2]) ? profile[2] : [];
            const langArr = Array.isArray(profile[4]) ? profile[4] : [];
            skillsStr = [...skillsArr, ...langArr].join(", ");
          }
        } catch (e) {}
      }
    }

    const userSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);

    const isDeveloper = role.toLowerCase().includes("develop") || role.toLowerCase().includes("stack") || role.toLowerCase().includes("frontend") || role.toLowerCase().includes("backend");
    const isData = role.toLowerCase().includes("data") || role.toLowerCase().includes("analyst");
    const isDevOps = role.toLowerCase().includes("devops") || role.toLowerCase().includes("cloud") || role.toLowerCase().includes("site");

    let roleList: { role: string; salary: string; gradient: string; skills: string[]; growth: string }[] = [];

    if (isDeveloper) {
      roleList = [
        { role: role, salary: "$105K - $140K", gradient: "from-blue-500 to-cyan-500", skills: userSkills.slice(0, 4), growth: "+14%" },
        { role: "Backend Developer", salary: "$110K - $145K", gradient: "from-purple-500 to-pink-500", skills: ["Node.js", "SQL", "Docker", "REST APIs"], growth: "+12%" },
        { role: "Frontend Developer", salary: "$95K - $130K", gradient: "from-green-500 to-emerald-500", skills: ["React", "TypeScript", "TailwindCSS"], growth: "+10%" },
        { role: "DevOps / Cloud Engineer", salary: "$120K - $155K", gradient: "from-orange-500 to-red-500", skills: ["Docker", "Kubernetes", "AWS", "CI/CD"], growth: "+16%" },
        { role: "Product Manager (Technical)", salary: "$130K - $175K", gradient: "from-indigo-500 to-purple-500", skills: ["Strategy", "Agile", "Roadmaps"], growth: "+18%" }
      ];
    } else if (isData) {
      roleList = [
        { role: role, salary: "$110K - $145K", gradient: "from-blue-500 to-cyan-500", skills: userSkills.slice(0, 4), growth: "+12%" },
        { role: "Data Analyst", salary: "$85K - $110K", gradient: "from-purple-500 to-pink-500", skills: ["SQL", "Excel", "Tableau", "Python"], growth: "+8%" },
        { role: "AI / ML Engineer", salary: "$125K - $165K", gradient: "from-green-500 to-emerald-500", skills: ["Python", "TensorFlow", "PyTorch", "MLOps"], growth: "+18%" },
        { role: "Database Administrator", salary: "$95K - $125K", gradient: "from-orange-500 to-red-500", skills: ["SQL", "Postgres", "Performance Tuning"], growth: "+6%" },
        { role: "Business Intelligence Developer", salary: "$100K - $135K", gradient: "from-indigo-500 to-purple-500", skills: ["Power BI", "Data Modeling", "ETL"], growth: "+11%" }
      ];
    } else if (isDevOps) {
      roleList = [
        { role: role, salary: "$120K - $155K", gradient: "from-blue-500 to-cyan-500", skills: userSkills.slice(0, 4), growth: "+16%" },
        { role: "Cloud Architect", salary: "$140K - $185K", gradient: "from-purple-500 to-pink-500", skills: ["AWS", "GCP", "Enterprise System Design"], growth: "+22%" },
        { role: "Backend Developer", salary: "$110K - $145K", gradient: "from-green-500 to-emerald-500", skills: ["Python", "Go", "Docker", "APIs"], growth: "+12%" },
        { role: "Security Analyst", salary: "$115K - $150K", gradient: "from-orange-500 to-red-500", skills: ["Cloud Security", "Firewalls", "Compliance"], growth: "+14%" },
        { role: "Site Reliability Engineer", salary: "$130K - $170K", gradient: "from-indigo-500 to-purple-500", skills: ["Kubernetes", "Prometheus", "Linux", "Automation"], growth: "+19%" }
      ];
    } else {
      roleList = [
        { role: role, salary: "$120K - $160K", gradient: "from-blue-500 to-cyan-500", skills: userSkills.slice(0, 4), growth: "+15%" },
        { role: "Data Scientist", salary: "$110K - $145K", gradient: "from-purple-500 to-pink-500", skills: ["Python", "Statistics", "SQL"], growth: "+12%" },
        { role: "Machine Learning Engineer", salary: "$115K - $150K", gradient: "from-green-500 to-emerald-500", skills: ["Python", "TensorFlow", "PyTorch", "Docker"], growth: "+18%" },
        { role: "Full Stack Developer", salary: "$95K - $130K", gradient: "from-orange-500 to-red-500", skills: ["React", "Node.js", "MongoDB"], growth: "+10%" },
        { role: "Product Manager (AI/ML)", salary: "$130K - $180K", gradient: "from-indigo-500 to-purple-500", skills: ["Strategy", "ML Basics", "Communication"], growth: "+20%" }
      ];
    }

    const generated: Prediction[] = roleList.map((item, idx) => {
      let prob = 85 - idx * 6 - Math.round(Math.random() * 3);
      if (idx === 0) prob = 88 + Math.round(Math.random() * 4);
      return {
        role: item.role,
        probability: prob,
        salary: item.salary,
        gradient: item.gradient,
        skills: item.skills.length > 0 ? item.skills : ["Python", "JavaScript", "SQL", "Git"],
        growth: item.growth,
      };
    });

    setPredictions(generated);
    setTopMatch(generated[0]);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">Career Prediction</h3>
              <p className="text-slate-400 text-sm">AI-powered career path analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-white mb-2">Your Career Trajectory</h2>
                <p className="text-slate-300 text-lg mb-6">
                  Based on your skills, education, and experience, here are your top career matches
                </p>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Top Match</span>
                    </div>
                    <p className="text-white text-xl">{topMatch.role}</p>
                    <p className="text-green-400">{topMatch.probability}% Match</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Salary Range</span>
                    </div>
                    <p className="text-white text-xl">{topMatch.salary}</p>
                    <p className="text-blue-400">Annual</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Market Growth</span>
                    </div>
                    <p className="text-white text-xl">{topMatch.growth}</p>
                    <p className="text-purple-400">Next 5 years</p>
                  </div>
                </div>
              </div>

              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="url(#gradientCareer)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - topMatch.probability / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradientCareer" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl text-white" style={{ fontWeight: 700 }}>{topMatch.probability}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Career Predictions */}
          <div className="mb-8">
            <h3 className="text-white mb-6">Predicted Career Paths</h3>

            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${prediction.gradient} flex items-center justify-center`}>
                        <Briefcase className="w-8 h-8 text-white" />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-white text-lg mb-1">{prediction.role}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400">{prediction.salary}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {prediction.growth} growth
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="relative w-24 h-24">
                        <svg className="transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={`url(#grad-${index})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - prediction.probability / 100)}
                          />
                          <defs>
                            <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-2xl text-white" style={{ fontWeight: 700 }}>{prediction.probability}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-slate-400 text-sm">Required Skills:</span>
                    {prediction.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => navigate("/skill-gap")}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:scale-105 transition-all"
            >
              Analyze Skill Gaps
            </button>
            <button
              onClick={() => navigate("/learning-roadmap")}
              className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
              View Learning Roadmap
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
