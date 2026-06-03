import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, Target, FileText, MessageSquare, Award, DollarSign, Calendar, Flame } from "lucide-react";
import { motion } from "motion/react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { fetchProfile, fetchResume, fetchDashboardStats } from "../../utils/api";

const skillGrowthData = [
  { month: "Jan", skills: 12 },
  { month: "Feb", skills: 15 },
  { month: "Mar", skills: 18 },
  { month: "Apr", skills: 22 },
  { month: "May", skills: 26 },
  { month: "Jun", skills: 30 },
];

const careerProbabilityData = [
  { month: "Jan", probability: 65 },
  { month: "Feb", probability: 70 },
  { month: "Mar", probability: 74 },
  { month: "Apr", probability: 78 },
  { month: "May", probability: 80 },
  { month: "Jun", probability: 82 },
];

const activityData = [
  { week: "Week 1", resumes: 2, interviews: 1, learning: 8 },
  { week: "Week 2", resumes: 1, interviews: 2, learning: 10 },
  { week: "Week 3", resumes: 3, interviews: 1, learning: 12 },
  { week: "Week 4", resumes: 2, interviews: 3, learning: 9 },
];

export function CareerGrowthDashboard() {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [startPoint, setStartPoint] = useState("Student");
  const [resumeScore, setResumeScore] = useState(85);
  const [mockInterviews, setMockInterviews] = useState(24);
  const [learningStreak, setLearningStreak] = useState(42);
  const [skillsMastered, setSkillsMastered] = useState(30);
  const [skillRadarData, setSkillRadarData] = useState([
    { skill: "Coding", current: 78, target: 90 },
    { skill: "Design", current: 70, target: 88 },
    { skill: "Databases", current: 65, target: 85 },
    { skill: "Communication", current: 82, target: 90 },
    { skill: "Leadership", current: 60, target: 75 },
    { skill: "DevOps", current: 55, target: 80 },
  ]);
  
  useEffect(() => {
    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadDreamRole() {
      let role = localStorage.getItem("hiretwin_target_role") || "";
      let skillsStr = localStorage.getItem("hiretwin_skills") || "";
      let expText = "";

      const resumeStr = localStorage.getItem("hiretwin_resume");
      if (resumeStr) {
        try {
          const resume = JSON.parse(resumeStr);
          if (resume.formData?.targetRole) role = resume.formData.targetRole;
          if (resume.formData?.skills) skillsStr = resume.formData.skills;
          if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
            expText = resume.experience[0].role || "";
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
            if (profile[6]) expText = profile[6];
          } catch (e) {}
        }
      }

      if (!role) {
        try {
          const profile = await fetchProfile(email);
          if (profile) {
            role = profile["3"] || profile[3] || "";
            if (profile[6]) expText = profile[6];
          }
        } catch (e) {}
      }

      if (role) {
        setTargetRole(role);
      }

      if (expText) {
        if (expText.toLowerCase().includes("fresher") || expText.toLowerCase().includes("no experience")) {
          setStartPoint("Student");
        } else if (expText.toLowerCase().includes("intern")) {
          setStartPoint("Intern");
        } else if (expText.toLowerCase().includes("years") || expText.toLowerCase().includes("senior") || expText.toLowerCase().includes("engineer") || expText.toLowerCase().includes("developer")) {
          setStartPoint("Developer");
        } else {
          setStartPoint("Student");
        }
      }

      const allSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
      if (allSkills.length > 0) {
        setSkillRadarData([
          { skill: allSkills[0] || "Coding", current: 85, target: 95 },
          { skill: allSkills[1] || "Design", current: 75, target: 90 },
          { skill: allSkills[2] || "Databases", current: 70, target: 85 },
          { skill: allSkills[3] || "Cloud/DevOps", current: 65, target: 80 },
          { skill: "Communication", current: 80, target: 90 },
          { skill: "Leadership", current: 60, target: 75 },
        ]);
      }
    }

    async function loadStats() {
      if (email && email !== "guest@hiretwin.com") {
        try {
          const stats = await fetchDashboardStats(email);
          if (stats) {
            setResumeScore(stats.resumeStrength);
            setMockInterviews(stats.completedInterviews);
            setLearningStreak(stats.learningStreak);
            setSkillsMastered(stats.skillsMastered);
          }
        } catch (e) {
          console.error("Failed to load dashboard stats in career growth dashboard", e);
        }
      }
    }

    loadDreamRole();
    loadStats();
  }, []);

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
              <h3 className="text-white">Career Growth Dashboard</h3>
              <p className="text-slate-400 text-sm">Track your career transformation journey</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/premium")}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Award className="w-4 h-4" />
            Upgrade
          </button>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-slate-400 mb-1 text-sm">Resume Score</p>
                <h4 className="text-white font-semibold text-base mb-1">Match Strength</h4>
                <p className="text-green-400 text-xs">+8% optimization</p>
              </div>
              <div className="relative w-16 h-16 shrink-0">
                <svg className="-rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - resumeScore / 100) }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{resumeScore}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-slate-400 mb-1">Mock Interviews</p>
              <p className="text-white text-4xl mb-2" style={{ fontWeight: 700 }}>{mockInterviews}</p>
              <p className="text-green-400 text-sm">completed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-slate-400 mb-1">Learning Streak</p>
              <p className="text-white text-4xl mb-2" style={{ fontWeight: 700 }}>{learningStreak}</p>
              <p className="text-green-400 text-sm">days in a row</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-orange-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-slate-400 mb-1">Skills Mastered</p>
              <p className="text-white text-4xl mb-2" style={{ fontWeight: 700 }}>{skillsMastered}</p>
              <p className="text-green-400 text-sm">skills acquired</p>
            </motion.div>
          </div>

          {/* Career Transformation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-white mb-6">Career Transformation Progress</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Current</p>
                    <p className="text-white text-xl">{startPoint}</p>
                  </div>
                </div>
                <p className="text-slate-400">Starting Point</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative w-full">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "82%" }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    />
                  </div>
                  <div className="absolute -top-8 left-[82%] transform -translate-x-1/2">
                    <div className="px-3 py-1 bg-purple-600 rounded-lg text-white text-sm whitespace-nowrap">
                      82% Complete
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Target</p>
                    <p className="text-white text-xl">{targetRole}</p>
                  </div>
                </div>
                <p className="text-slate-400">Dream Role</p>
              </div>
            </div>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Career Probability Growth */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-6">{targetRole} Probability Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={careerProbabilityData}>
                  <defs>
                    <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="probability"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProb)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Skills Growth */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-6">Skills Acquisition Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={skillGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="skills"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Weekly Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-6">Weekly Activity Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="resumes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="interviews" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="learning" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-slate-400 text-sm">Resumes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  <span className="text-slate-400 text-sm">Interviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-slate-400 text-sm">Learning (hrs)</span>
                </div>
              </div>
            </motion.div>

            {/* Skill Radar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-6">Skills: Current vs Target</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={skillRadarData}>
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#94a3b8" />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-slate-400 text-sm">Current Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  <span className="text-slate-400 text-sm">Target Level</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Salary Projection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm">Projected Salary Range</span>
                </div>
                <h2 className="text-white mb-2">$120K - $160K</h2>
                <p className="text-slate-300">Based on your skills and market trends for {targetRole}s</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-400 mb-2 justify-end">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Time to Ready</span>
                </div>
                <p className="text-white text-4xl mb-1" style={{ fontWeight: 700 }}>2</p>
                <p className="text-green-400">months remaining</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-slate-400 text-sm mb-1">Entry Level</p>
                <p className="text-white text-xl">$95K</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <p className="text-green-400 text-sm mb-1">Your Projected Range</p>
                <p className="text-white text-xl">$120K - $160K</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-slate-400 text-sm mb-1">Senior Level</p>
                <p className="text-white text-xl">$180K+</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
