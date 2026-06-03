import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { saveResume, fetchProfile } from "../../utils/api";

export function ResumeGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "Kandhavel Saravanan",
    email: "kandhavel@example.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/kandhavel",
    github: "github.com/kandhavel",
    education: "B.Tech Computer Science, Anna University",
    skills: "Python, Machine Learning, React, Node.js, TensorFlow, Docker",
    targetRole: "AI Engineer",
  });

  const [projects, setProjects] = useState([
    {
      title: "Sentiment Analysis Model",
      description: "Developed ML model achieving 92% accuracy using BERT and PyTorch",
    },
  ]);

  const [experience, setExperience] = useState([
    {
      role: "ML Intern",
      company: "Tech Corp",
      description: "Built data pipelines and trained classification models",
    },
  ]);

  useEffect(() => {
    // Load logged in user details
    const userStr = localStorage.getItem("hiretwin_user");
    let emailStr = "kandhavel@example.com";
    let nameStr = "Kandhavel Saravanan";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) emailStr = u.email;
        if (u.name) nameStr = u.name;
      } catch (e) {}
    }

    setFormData((prev) => ({
      ...prev,
      fullName: nameStr,
      email: emailStr,
    }));

    // Fetch profile questionnaire answers to populate target role, skills, education, projects
    async function loadProfileData() {
      const profile = await fetchProfile(emailStr);
      if (profile) {
        // profile is answers object: { 1: education, 2: [skills], 3: role, 4: [languages], 7: project }
        const edu = profile[1] || "";
        const skillsArr = Array.isArray(profile[2]) ? profile[2] : [];
        const langArr = Array.isArray(profile[4]) ? profile[4] : [];
        const mergedSkills = [...skillsArr, ...langArr].join(", ");
        const target = profile[3] || "AI Engineer";
        const projName = profile[7] || "Sentiment Analysis with PyTorch & BERT";

        setFormData((prev) => ({
          ...prev,
          education: edu ? `${edu}, Computer Science` : prev.education,
          skills: mergedSkills || prev.skills,
          targetRole: target,
        }));

        if (profile[7]) {
          setProjects([
            {
              title: projName,
              description: `Worked on implementing and deploying ${projName} with focus on performance optimization and reliability.`,
            },
          ]);
        }
      }
    }
    loadProfileData();
  }, []);

  const addProject = () => {
    setProjects([...projects, { title: "", description: "" }]);
  };

  const addExperience = () => {
    setExperience([...experience, { role: "", company: "", description: "" }]);
  };

  const handleGenerate = async () => {
    // Save target role & skills to localStorage
    localStorage.setItem("hiretwin_target_role", formData.targetRole);
    localStorage.setItem("hiretwin_skills", formData.skills);

    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    // Save full resume to backend/localStorage
    const resumeData = {
      formData,
      projects,
      experience,
    };
    await saveResume(email, resumeData);

    navigate("/resume-preview");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">Resume Generator</h3>
              <p className="text-slate-400 text-sm">Create your ATS-optimized resume</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Resume
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm">
                1
              </div>
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Full Name"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="LinkedIn URL"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="GitHub URL"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="Target Role"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-sm">
                2
              </div>
              Education
            </h3>

            <textarea
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="Your education details..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                3
              </div>
              Skills
            </h3>

            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="List your skills separated by commas..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </motion.div>

          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-sm">
                  4
                </div>
                Projects
              </h3>
              <button
                onClick={addProject}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => {
                      const newProjects = [...projects];
                      newProjects[index].title = e.target.value;
                      setProjects(newProjects);
                    }}
                    placeholder="Project Title"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = [...projects];
                      newProjects[index].description = e.target.value;
                      setProjects(newProjects);
                    }}
                    placeholder="Project Description"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-sm">
                  5
                </div>
                Experience
              </h3>
              <button
                onClick={addExperience}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[index].role = e.target.value;
                        setExperience(newExp);
                      }}
                      placeholder="Role"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[index].company = e.target.value;
                        setExperience(newExp);
                      }}
                      placeholder="Company"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index].description = e.target.value;
                      setExperience(newExp);
                    }}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
