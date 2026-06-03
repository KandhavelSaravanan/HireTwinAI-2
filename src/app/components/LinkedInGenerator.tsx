import { useNavigate } from "react-router";
import { ArrowLeft, Linkedin, Copy, CheckCircle2, Sparkles, Eye, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { fetchLinkedIn, saveLinkedIn } from "../../utils/api";

export function LinkedInGenerator() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const [linkedInContent, setLinkedInContent] = useState({
    headline: "AI Engineer | Machine Learning Specialist | Building Intelligent Systems to Solve Real-World Problems",
    summary: `Passionate AI Engineer with expertise in machine learning, deep learning, and full-stack development. I specialize in building scalable ML systems that drive business value and solve complex real-world challenges.

🎯 Core Expertise:
• Machine Learning & Deep Learning (TensorFlow, PyTorch, Scikit-learn)
• MLOps & Model Deployment (Docker, Kubernetes, AWS, GCP)
• Full-Stack Development (React, Node.js, MongoDB)
• Data Engineering & Big Data (Apache Spark, ETL Pipelines)

🚀 Key Achievements:
• Developed sentiment analysis models achieving 92% accuracy using BERT and PyTorch
• Built scalable recommendation systems improving user engagement by 35%
• Deployed production ML systems processing 500GB+ daily data
• Published research on deep learning for image classification

💡 Currently exploring MLOps best practices and building end-to-end AI solutions.

Let's connect if you're interested in AI, ML, or building innovative tech solutions!`,
    experience: {
      title: "Machine Learning Intern",
      company: "Tech Corp",
      description: `• Designed and implemented ETL pipelines processing 500GB+ daily data volume
• Trained classification models achieving 88% precision for customer churn prediction
• Collaborated with cross-functional teams to integrate ML models into production systems
• Optimized model performance reducing training time by 30% through hyperparameter tuning
• Built real-time monitoring dashboards for model performance tracking`,
    },
    skills: [
      "Machine Learning",
      "Deep Learning",
      "Python",
      "TensorFlow",
      "PyTorch",
      "MLOps",
      "Docker",
      "Kubernetes",
      "AWS",
      "React",
      "Node.js",
      "Data Science",
    ],
  });

  useEffect(() => {
    let email = "kandhavel@example.com";
    const userStr = localStorage.getItem("hiretwin_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadLinkedInData() {
      // 1. Try to load from database first
      if (email) {
        const fetched = await fetchLinkedIn(email);
        if (fetched) {
          setLinkedInContent(fetched);
          return;
        }
      }

      // 2. Fall back to local resume/profile generation
      let role = "AI Engineer";
      let skillsStr = "Python, Machine Learning, Deep Learning, MLOps, AWS";
      let expTitle = "Machine Learning Intern";
      let expCompany = "Tech Corp";
      let expDesc = `• Designed and implemented ETL pipelines
• Trained classification models achieving 88% precision
• Collaborated with cross-functional teams to integrate ML models`;

      const resumeStr = localStorage.getItem("hiretwin_resume");
      if (resumeStr) {
        try {
          const resume = JSON.parse(resumeStr);
          if (resume.formData?.targetRole) role = resume.formData.targetRole;
          if (resume.formData?.skills) skillsStr = resume.formData.skills;
          if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
            expTitle = resume.experience[0].role || expTitle;
            expCompany = resume.experience[0].company || expCompany;
            expDesc = resume.experience[0].description || expDesc;
          }
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

      const allSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);

      setLinkedInContent({
        headline: `${role} | Building Solutions & Solving Real-World Problems with Technology`,
        summary: `Passionate ${role} with expertise in building innovative systems. I specialize in driving business value and solving complex real-world challenges.

🎯 Core Expertise:
${allSkills.slice(0, 5).map(s => `• ${s}`).join("\n")}

💡 Currently exploring industry best practices and building end-to-end solutions.

Let's connect if you're interested in ${role} roles or building innovative tech solutions!`,
        experience: {
          title: expTitle,
          company: expCompany,
          description: expDesc,
        },
        skills: allSkills.length > 0 ? allSkills : ["Software Engineering", "Problem Solving", "Git"],
      });
    }

    loadLinkedInData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    let email = "kandhavel@example.com";
    const userStr = localStorage.getItem("hiretwin_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }
    const success = await saveLinkedIn(email, linkedInContent);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">LinkedIn Profile Generator</h3>
              <p className="text-slate-400 text-sm">AI-optimized LinkedIn content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              {isEditing ? "Preview" : "Edit Details"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Notification */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Changes Saved!</h4>
                <p className="text-slate-300 text-sm">Your optimized LinkedIn profile content has been stored in the database.</p>
              </div>
            </motion.div>
          )}

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white mb-2">AI-Generated LinkedIn Profile</h3>
                <p className="text-slate-300">
                  Your LinkedIn profile content has been optimized for maximum visibility and engagement.
                  Copy each section and paste directly into your LinkedIn profile.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Headline</h3>
              {!isEditing && (
                <button
                  onClick={() => handleCopy(linkedInContent.headline, "headline")}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  {copied === "headline" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={linkedInContent.headline}
                onChange={(e) => setLinkedInContent({ ...linkedInContent, headline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                rows={2}
                maxLength={220}
              />
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-slate-300">{linkedInContent.headline}</p>
              </div>
            )}
            <p className="text-slate-500 text-sm mt-2">Character count: {linkedInContent.headline.length}/220</p>
          </motion.div>

          {/* Summary/About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">About / Summary</h3>
              {!isEditing && (
                <button
                  onClick={() => handleCopy(linkedInContent.summary, "summary")}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  {copied === "summary" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={linkedInContent.summary}
                onChange={(e) => setLinkedInContent({ ...linkedInContent, summary: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none text-slate-300"
                rows={10}
                maxLength={2600}
              />
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-slate-300 whitespace-pre-line">{linkedInContent.summary}</p>
              </div>
            )}
            <p className="text-slate-500 text-sm mt-2">Character count: {linkedInContent.summary.length}/2600</p>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Experience Description</h3>
              {!isEditing && (
                <button
                  onClick={() => handleCopy(linkedInContent.experience.description, "experience")}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  {copied === "experience" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Job Title</label>
                    <input
                      type="text"
                      value={linkedInContent.experience.title}
                      onChange={(e) => setLinkedInContent({
                        ...linkedInContent,
                        experience: { ...linkedInContent.experience, title: e.target.value }
                      })}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Company</label>
                    <input
                      type="text"
                      value={linkedInContent.experience.company}
                      onChange={(e) => setLinkedInContent({
                        ...linkedInContent,
                        experience: { ...linkedInContent.experience, company: e.target.value }
                      })}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Description</label>
                  <textarea
                    value={linkedInContent.experience.description}
                    onChange={(e) => setLinkedInContent({
                      ...linkedInContent,
                      experience: { ...linkedInContent.experience, description: e.target.value }
                    })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none text-slate-300 text-sm"
                    rows={6}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h4 className="text-white mb-1">{linkedInContent.experience.title}</h4>
                <p className="text-slate-400 text-sm mb-3">{linkedInContent.experience.company}</p>
                <p className="text-slate-300 whitespace-pre-line">{linkedInContent.experience.description}</p>
              </div>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-4">Recommended Skills</h3>
            {isEditing ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={linkedInContent.skills.join(", ")}
                  onChange={(e) => setLinkedInContent({
                    ...linkedInContent,
                    skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex flex-wrap gap-2">
                  {linkedInContent.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
            {!isEditing && (
              <p className="text-slate-400 text-sm mt-4">
                Add these skills to your LinkedIn profile and ask connections to endorse them.
              </p>
            )}
          </motion.div>

          {/* Optimization Tips */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-4">Optimization Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-green-400 mb-1 text-sm font-semibold">Professional Photo</h4>
                    <p className="text-slate-300 text-sm">
                      Profiles with photos get 21x more views. Use a professional headshot with good lighting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 mb-1 text-sm font-semibold">Custom URL</h4>
                    <p className="text-slate-300 text-sm">
                      Customize your LinkedIn URL to linkedin.com/in/yourname for better SEO and professionalism.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-purple-400 mb-1 text-sm font-semibold">Regular Activity</h4>
                    <p className="text-slate-300 text-sm">
                      Post or share content 2-3 times per week to stay visible in your network's feed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-orange-400 mb-1 text-sm font-semibold">Get Recommendations</h4>
                    <p className="text-slate-300 text-sm">
                      Request recommendations from managers and colleagues to boost your credibility.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:scale-105 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 text-sm"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.open("https://linkedin.com", "_blank")}
                  className="px-6 py-4 bg-[#0077B5] rounded-2xl text-white hover:scale-105 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <Linkedin className="w-5 h-5" />
                  Open LinkedIn
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all font-medium text-sm"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
