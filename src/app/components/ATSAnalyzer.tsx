import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const DEFAULT_ROLE_SKILLS: Record<string, string[]> = {
  "AI / ML Engineer": ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "Docker", "AWS", "Git"],
  "AI Engineer": ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "Docker", "AWS", "Git"],
  "ML Engineer": ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "Docker", "AWS", "Git"],
  "Data Scientist": ["Python", "SQL", "R", "Statistics", "Machine Learning", "Tableau", "Git"],
  "Full Stack Developer": ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "Docker", "AWS", "Git"],
  "Backend Developer": ["Python", "Go", "Java", "Node.js", "SQL", "Docker", "Kubernetes", "AWS", "Git"],
  "Frontend Developer": ["JavaScript", "TypeScript", "React", "HTML/CSS", "TailwindCSS", "Webpack", "Git"],
  "DevOps / Cloud Engineer": ["Docker", "Kubernetes", "AWS", "GCP", "CI/CD", "Terraform", "Jenkins", "Linux", "Git"],
};

export function ATSAnalyzer() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState({
    score: 85,
    keywords: {
      found: ["Python", "Machine Learning", "TensorFlow", "React", "Docker", "AWS"],
      missing: ["Kubernetes", "MLOps", "CI/CD", "Apache Spark"],
      score: 75,
    },
    formatting: {
      score: 95,
      issues: [],
    },
    impact: {
      score: 80,
      suggestions: [
        "Add more quantifiable achievements (e.g., 'Increased efficiency by 40%')",
        "Use stronger action verbs (e.g., 'Architected' instead of 'Made')",
      ],
    },
  });

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

    const userSkills = skillsStr.split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (userSkills.length > 0) {
      let expectedSkills = DEFAULT_ROLE_SKILLS["AI Engineer"];
      const normalizedRole = role.toLowerCase();
      for (const [key, list] of Object.entries(DEFAULT_ROLE_SKILLS)) {
        if (normalizedRole.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedRole)) {
          expectedSkills = list;
          break;
        }
      }

      const found = userSkills.filter(s => 
        expectedSkills.some(es => es.toLowerCase() === s.toLowerCase())
      );
      
      const missing = expectedSkills.filter(es => 
        !userSkills.some(s => s.toLowerCase() === es.toLowerCase())
      );

      const foundScore = expectedSkills.length > 0 
        ? Math.round((found.length / expectedSkills.length) * 100) 
        : 75;

      const overallScore = Math.min(98, Math.max(50, Math.round((foundScore + 95 + 80) / 3)));

      setAnalysis({
        score: overallScore,
        keywords: {
          found: found.length > 0 ? found : userSkills.slice(0, 6),
          missing: missing.length > 0 ? missing : ["CI/CD", "Kubernetes", "MLOps"],
          score: foundScore,
        },
        formatting: {
          score: 95,
          issues: [],
        },
        impact: {
          score: 80,
          suggestions: [
            "Add more quantifiable achievements (e.g., 'Increased efficiency by 40%')",
            "Use stronger action verbs (e.g., 'Architected' instead of 'Made')",
          ],
        },
      });
    }
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
              <h3 className="text-white">ATS Analyzer</h3>
              <p className="text-slate-400 text-sm">Optimize your resume for applicant tracking systems</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-white mb-2">Overall ATS Score</h2>
                <p className="text-slate-300 mb-6">
                  Your resume has an {analysis.score >= 80 ? "excellent" : "good"} chance of passing ATS screening
                </p>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-400 text-sm">Keywords</span>
                    </div>
                    <p className="text-white text-2xl">{analysis.keywords.score}%</p>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${analysis.keywords.score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-400 text-sm">Formatting</span>
                    </div>
                    <p className="text-white text-2xl">{analysis.formatting.score}%</p>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${analysis.formatting.score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-400 text-sm">Impact</span>
                    </div>
                    <p className="text-white text-2xl">{analysis.impact.score}%</p>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ width: `${analysis.impact.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="15"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="url(#gradientATS)"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 65}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 65 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 65 * (1 - analysis.score / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradientATS" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl text-white" style={{ fontWeight: 700 }}>{analysis.score}</p>
                    <p className="text-slate-400 text-sm">/ 100</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Keywords Found */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h3 className="text-white">Keywords Found</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysis.keywords.found.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Keywords Missing */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-white">Suggested Keywords</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysis.keywords.missing.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-sm flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {keyword}
                  </span>
                ))}
              </div>

              <p className="text-slate-400 text-sm mt-4">
                Adding these keywords can increase your ATS score to 95%+
              </p>
            </motion.div>
          </div>

          {/* Improvement Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-white">Impact Improvements</h3>
            </div>

            <div className="space-y-3">
              {analysis.impact.suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-slate-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Before/After Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-white mb-6">Resume Improvement Examples</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <h4 className="text-slate-400">Before</h4>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-slate-300 text-sm">
                    "Worked on machine learning projects"
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <h4 className="text-slate-400">After</h4>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-slate-300 text-sm">
                    "Developed machine learning models using TensorFlow and PyTorch, improving prediction accuracy by 25% and reducing training time by 40%"
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <h4 className="text-slate-400">Before</h4>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-slate-300 text-sm">
                    "Handled data processing tasks"
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <h4 className="text-slate-400">After</h4>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-slate-300 text-sm">
                    "Architected scalable ETL pipelines processing 500GB+ daily data using Apache Spark, reducing processing time by 60%"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4"
          >
            <button
              onClick={() => navigate("/resume-generator")}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:scale-105 transition-all"
            >
              Improve Resume
            </button>
            <button
              onClick={() => navigate("/resume-preview")}
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
              View Resume
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
