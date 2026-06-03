import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Globe, Eye, Sparkles, ExternalLink, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { fetchPortfolio, savePortfolio } from "../../utils/api";

export function PortfolioGenerator() {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [userData, setUserData] = React.useState({
    name: "Kandhavel Saravanan",
    role: "AI Engineer & ML Specialist",
    bio: "Passionate AI Engineer specializing in machine learning, deep learning, and building intelligent systems that solve real-world problems.",
    about: "Results-driven AI Engineer with expertise in developing and deploying machine learning models that drive business value. Experienced in building scalable ML systems, implementing MLOps best practices, and creating full-stack applications.",
    skillsGroup: [
      { category: "Languages", skills: ["Python", "JavaScript", "Java", "C++"] },
      { category: "ML/AI", skills: ["TensorFlow", "PyTorch", "Scikit-learn", "Keras"] },
      { category: "Web Dev", skills: ["React", "Node.js", "Express", "MongoDB"] },
      { category: "Tools", skills: ["Docker", "Git", "AWS", "GCP"] },
    ],
    projects: [
      {
        title: "Sentiment Analysis Model",
        description: "Advanced NLP model using BERT achieving 92% accuracy on social media sentiment analysis",
        tags: ["Python", "PyTorch", "BERT"],
        color: "from-blue-500 to-purple-500"
      },
      {
        title: "AI Recommendation System",
        description: "Collaborative filtering engine improving user engagement by 35% using deep learning",
        tags: ["TensorFlow", "Spark", "Redis"],
        color: "from-green-500 to-emerald-500"
      }
    ],
    email: "kandhavel@example.com",
    github: "github.com/kandhavel",
    linkedin: "linkedin.com/in/kandhavel",
  });

  React.useEffect(() => {
    let name = "Kandhavel Saravanan";
    let role = "AI Engineer & ML Specialist";
    let email = "kandhavel@example.com";
    let github = "github.com/kandhavel";
    let linkedin = "linkedin.com/in/kandhavel";
    let skillsStr = "Python, Machine Learning, React, Node.js, TensorFlow, Docker";
    let projectsList = [
      {
        title: "Sentiment Analysis Model",
        description: "Advanced NLP model using BERT achieving 92% accuracy on social media sentiment analysis",
        tags: ["Python", "PyTorch", "BERT"],
        color: "from-blue-500 to-purple-500"
      },
      {
        title: "AI Recommendation System",
        description: "Collaborative filtering engine improving user engagement by 35% using deep learning",
        tags: ["TensorFlow", "Spark", "Redis"],
        color: "from-green-500 to-emerald-500"
      }
    ];

    const userStr = localStorage.getItem("hiretwin_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) name = u.name;
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadPortfolioData() {
      // 1. Try to load from database/backend first
      if (email) {
        const fetched = await fetchPortfolio(email);
        if (fetched) {
          setUserData(fetched);
          return;
        }
      }

      // 2. Fall back to local storage and profile if database has no portfolio saved
      const resumeStr = localStorage.getItem("hiretwin_resume");
      if (resumeStr) {
        try {
          const resume = JSON.parse(resumeStr);
          if (resume.formData?.fullName) name = resume.formData.fullName;
          if (resume.formData?.targetRole) role = resume.formData.targetRole;
          if (resume.formData?.email) email = resume.formData.email;
          if (resume.formData?.github) github = resume.formData.github;
          if (resume.formData?.linkedin) linkedin = resume.formData.linkedin;
          if (resume.formData?.skills) skillsStr = resume.formData.skills;
          if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
            projectsList = resume.projects.map((p: any, idx: number) => ({
              title: p.title || "Key Project",
              description: p.description || "Developed key components and optimized systems performance.",
              tags: idx === 0 ? ["React", "Node.js", "MySQL"] : ["Python", "TensorFlow"],
              color: idx % 2 === 0 ? "from-blue-500 to-purple-500" : "from-green-500 to-emerald-500"
            }));
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
            if (profile[7]) {
              projectsList = [
                {
                  title: profile[7],
                  description: `Successfully built and deployed ${profile[7]} with optimal efficiency and robust architecture.`,
                  tags: ["Python", "TensorFlow", "React"],
                  color: "from-blue-500 to-purple-500"
                }
              ];
            }
          } catch (e) {}
        }
      }

      const allSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
      const languages = allSkills.filter(s => ["python", "javascript", "typescript", "java", "c++", "c", "go", "rust", "kotlin", "swift", "php", "ruby"].includes(s.toLowerCase()));
      const otherSkills = allSkills.filter(s => !languages.includes(s));

      const skillsGroup = [
        { category: "Languages", skills: languages.length > 0 ? languages.slice(0, 4) : ["Python", "JavaScript"] },
        { category: "Core Expertise", skills: otherSkills.length > 0 ? otherSkills.slice(0, 4) : ["Machine Learning", "Software Engineering"] },
        { category: "Tools", skills: ["Git", "Docker", "AWS", "VS Code"].slice(0, 4) }
      ];

      setUserData({
        name,
        role,
        bio: `Passionate ${role} specializing in building intelligent systems that solve real-world problems.`,
        about: `Results-driven ${role} with expertise in developing and deploying models and applications that drive business value. Experienced in building scalable systems, implementing best practices, and creating full-stack applications.`,
        skillsGroup,
        projects: projectsList,
        email,
        github,
        linkedin
      });
    }

    loadPortfolioData();
  }, []);

  const handleSave = async (silent = false) => {
    setIsSaving(true);
    const userStr = localStorage.getItem("hiretwin_user");
    let email = "kandhavel@example.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }
    const success = await savePortfolio(email, userData);
    setIsSaving(false);
    if (success && !silent) {
      setPreviewMode(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">Portfolio Generator</h3>
              <p className="text-slate-400 text-sm">AI-generated professional portfolio website</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              <Globe className="w-4 h-4" />
              {isSaving ? "Saving..." : "Publish Portfolio"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {previewMode ? (
            <>
              {/* Portfolio Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Portfolio Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 px-12 py-16 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl"
                  >
                    <p className="text-blue-200 mb-2">{userData.role}</p>
                    <h1 className="text-6xl mb-4 font-extrabold">
                      {userData.name}
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                      {userData.bio}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const el = document.getElementById("featured-projects");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-6 py-3 bg-white text-purple-600 rounded-xl hover:scale-105 transition-all font-semibold"
                      >
                        View Projects
                      </button>
                      <button
                        onClick={() => {
                          const el = document.getElementById("connect-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl hover:bg-white/20 transition-all"
                      >
                        Contact Me
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* About Section */}
                <div className="px-12 py-12 bg-slate-50">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl text-slate-900 mb-6 font-bold">About Me</h2>
                    <p className="text-slate-700 text-lg leading-relaxed max-w-3xl">
                      {userData.about}
                    </p>
                  </motion.div>
                </div>

                {/* Skills Section */}
                <div className="px-12 py-12 bg-white border-b border-slate-100">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-3xl text-slate-900 mb-8 font-bold">Skills & Expertise</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {userData.skillsGroup.map((group) => (
                        <div key={group.category} className="p-4 bg-slate-50 rounded-xl">
                          <h3 className="text-slate-900 mb-3 font-semibold text-lg border-b border-slate-200 pb-2">{group.category}</h3>
                          <div className="space-y-2">
                            {group.skills.map((skill) => (
                              <div key={skill} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                <span className="text-slate-700 font-medium">{skill}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Projects Section */}
                <div id="featured-projects" className="px-12 py-12 bg-slate-50">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h2 className="text-3xl text-slate-900 mb-8 font-bold">Featured Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userData.projects.map((proj, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 flex flex-col justify-between">
                          <div>
                            <div className={`h-48 bg-gradient-to-br ${proj.color || "from-blue-500 to-purple-500"}`} />
                            <div className="p-6">
                              <h3 className="text-xl text-slate-900 mb-2 font-semibold">
                                {proj.title}
                              </h3>
                              <p className="text-slate-600 mb-4">
                                {proj.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {proj.tags?.map((t) => (
                                  <span key={t} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="px-6 pb-6 pt-0">
                            <button className="text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold">
                              View Project <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Contact Section */}
                <div id="connect-section" className="px-12 py-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                  >
                    <h2 className="text-3xl mb-4 font-bold">Let's Connect</h2>
                    <p className="text-slate-300 mb-8 text-lg">
                      Interested in working together? Let's discuss how I can help with your project.
                    </p>
                    <div className="flex justify-center gap-4">
                      <a href={`mailto:${userData.email}`} className="px-8 py-4 bg-white text-slate-900 rounded-xl hover:scale-105 transition-all font-semibold flex items-center justify-center">
                        Send Message
                      </a>
                      <button
                        onClick={() => window.print()}
                        className="px-8 py-4 bg-white/10 border-2 border-white text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
                      >
                        Print Portfolio
                      </button>
                    </div>

                    <div className="mt-8 flex justify-center gap-6 text-slate-400">
                      <a href={`mailto:${userData.email}`} className="hover:text-white transition-colors">Email</a>
                      <span>•</span>
                      <a href={userData.linkedin.startsWith("http") ? userData.linkedin : `https://${userData.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                      <span>•</span>
                      <a href={userData.github.startsWith("http") ? userData.github : `https://${userData.github}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Customization Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI-Generated Portfolio
                    </h3>
                    <p className="text-slate-300">
                      Your portfolio is ready! Customize colors, sections, and content, then publish to your custom domain.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewMode(false)}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                    >
                      Customize Details
                    </button>
                    <button
                      onClick={() => alert("Domain service is currently being provisioned!")}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:scale-105 transition-all font-medium"
                    >
                      Get Custom Domain
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            /* Editing Layout */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-8 text-white"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Customize Portfolio
                </h2>
                <p className="text-slate-400 text-sm">Edit your profile and project details below, then save to update your portfolio website.</p>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2 text-slate-300">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      placeholder="e.g. Kandhavel Saravanan"
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400">Professional Role</label>
                    <input
                      type="text"
                      value={userData.role}
                      onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                      placeholder="e.g. AI Engineer & ML Specialist"
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-400">Short Bio</label>
                  <textarea
                    value={userData.bio}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    placeholder="Brief intro for the hero section..."
                    rows={2}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-400">About Me</label>
                  <textarea
                    value={userData.about}
                    onChange={(e) => setUserData({ ...userData, about: e.target.value })}
                    placeholder="Detailed about paragraph..."
                    rows={4}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Social / Contact Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2 text-slate-300">Contact & Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400">GitHub Profile URL</label>
                    <input
                      type="text"
                      value={userData.github}
                      onChange={(e) => setUserData({ ...userData, github: e.target.value })}
                      placeholder="github.com/username"
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={userData.linkedin}
                      onChange={(e) => setUserData({ ...userData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Groups */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="text-lg font-semibold text-slate-300">Skills & Technical Expertise</h3>
                  <button
                    onClick={() => {
                      const newGroups = [...userData.skillsGroup, { category: "New Category", skills: ["Skill 1", "Skill 2"] }];
                      setUserData({ ...userData, skillsGroup: newGroups });
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.skillsGroup.map((group, index) => (
                    <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 relative">
                      <button
                        onClick={() => {
                          const newGroups = userData.skillsGroup.filter((_, i) => i !== index);
                          setUserData({ ...userData, skillsGroup: newGroups });
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-400">Category Name</label>
                        <input
                          type="text"
                          value={group.category}
                          onChange={(e) => {
                            const newGroups = [...userData.skillsGroup];
                            newGroups[index].category = e.target.value;
                            setUserData({ ...userData, skillsGroup: newGroups });
                          }}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-400">Skills (comma-separated)</label>
                        <textarea
                          value={group.skills.join(", ")}
                          onChange={(e) => {
                            const newGroups = [...userData.skillsGroup];
                            newGroups[index].skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                            setUserData({ ...userData, skillsGroup: newGroups });
                          }}
                          rows={2}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="text-lg font-semibold text-slate-300">Featured Projects</h3>
                  <button
                    onClick={() => {
                      const newProjects = [
                        ...userData.projects,
                        {
                          title: "New Project",
                          description: "Short description of what you built and the impact it created.",
                          tags: ["React", "TypeScript"],
                          color: "from-blue-500 to-purple-500",
                        },
                      ];
                      setUserData({ ...userData, projects: newProjects });
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userData.projects.map((proj, index) => (
                    <div key={index} className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-4 relative">
                      <button
                        onClick={() => {
                          const newProjects = userData.projects.filter((_, i) => i !== index);
                          setUserData({ ...userData, projects: newProjects });
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-400">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const newProjects = [...userData.projects];
                            newProjects[index].title = e.target.value;
                            setUserData({ ...userData, projects: newProjects });
                          }}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-400">Description</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const newProjects = [...userData.projects];
                            newProjects[index].description = e.target.value;
                            setUserData({ ...userData, projects: newProjects });
                          }}
                          rows={3}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-400">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={proj.tags?.join(", ") || ""}
                          onChange={(e) => {
                            const newProjects = [...userData.projects];
                            newProjects[index].tags = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                            setUserData({ ...userData, projects: newProjects });
                          }}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-400">Background Gradient Class (Tailwind CSS)</label>
                        <input
                          type="text"
                          value={proj.color}
                          onChange={(e) => {
                            const newProjects = [...userData.projects];
                            newProjects[index].color = e.target.value;
                            setUserData({ ...userData, projects: newProjects });
                          }}
                          placeholder="e.g. from-blue-500 to-purple-500"
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 mt-6 border-t border-white/10 pt-6">
                <button
                  onClick={() => setPreviewMode(true)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all text-sm font-medium border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:scale-105 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save & Preview"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
