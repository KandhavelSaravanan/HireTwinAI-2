import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Target,
  TrendingUp,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Globe,
  Linkedin,
  BarChart3,
  Crown,
  Flame,
  ArrowRight,
  Brain,
} from "lucide-react";
import { motion } from "motion/react";
import { BottomNav } from "./BottomNav";
import { fetchDashboardStats, incrementLearningStreak } from "../../utils/api";


const features = [
  { icon: FileText, title: "Generate Resume", description: "Create ATS-optimized resumes", gradient: "from-blue-500 to-cyan-500", route: "/resume-generator" },
  { icon: Target, title: "ATS Analyzer", description: "Optimize for applicant tracking", gradient: "from-purple-500 to-pink-500", route: "/ats-analyzer" },
  { icon: TrendingUp, title: "Career Prediction", description: "AI-powered career insights", gradient: "from-green-500 to-emerald-500", route: "/career-prediction" },
  { icon: Globe, title: "Portfolio Builder", description: "Generate professional website", gradient: "from-orange-500 to-red-500", route: "/portfolio" },
  { icon: Linkedin, title: "LinkedIn Generator", description: "Optimize your LinkedIn profile", gradient: "from-blue-600 to-blue-400", route: "/linkedin" },
  { icon: Briefcase, title: "Skill Gap Analyzer", description: "Identify missing skills", gradient: "from-yellow-500 to-orange-500", route: "/skill-gap" },
  { icon: GraduationCap, title: "Learning Roadmap", description: "Personalized learning path", gradient: "from-indigo-500 to-purple-500", route: "/learning-roadmap" },
  { icon: MessageSquare, title: "Interview Prep", description: "AI mock interviews", gradient: "from-pink-500 to-rose-500", route: "/interview-prep" },
  { icon: BarChart3, title: "Career Growth", description: "Track your progress", gradient: "from-teal-500 to-cyan-500", route: "/career-growth" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Kandhavel");
  const [careerScore, setCareerScore] = useState(78);
  const [resumeScore, setResumeScore] = useState(84);
  const [learningStreak, setLearningStreak] = useState(12);
  const [totalInterviews, setTotalInterviews] = useState(8);
  const [completedInterviews, setCompletedInterviews] = useState(3);
  const [targetRole, setTargetRole] = useState("AI Engineer");

  useEffect(() => {
    // Load auth user
    const localUser = localStorage.getItem("hiretwin_user");
    let email = "";
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        if (u.name) {
          setUserName(u.name.split(" ")[0]);
        }
        if (u.email) {
          email = u.email;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load target role from profile
    const quest = localStorage.getItem("hiretwin_profile");
    if (quest) {
      try {
        const parsed = JSON.parse(quest);
        const roleAns = parsed["3"] || parsed["targetRole"];
        if (roleAns) {
          if (roleAns === "AI / ML Engineer") setTargetRole("AI Engineer");
          else setTargetRole(roleAns);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load stats from backend if email is available
    if (email) {
      async function loadDashboardStats() {
        try {
          // Increment streak for today's visit
          await incrementLearningStreak(email);
          
          // Fetch stats from MySQL database
          const stats = await fetchDashboardStats(email);
          if (stats) {
            setCareerScore(stats.careerScore);
            setResumeScore(stats.resumeStrength);
            setLearningStreak(stats.learningStreak);
            setTotalInterviews(stats.totalInterviews);
            setCompletedInterviews(stats.completedInterviews);

            // Sync with local storage for other views
            localStorage.setItem("hiretwin_career_score", String(stats.careerScore));
            localStorage.setItem("hiretwin_streak", String(stats.learningStreak));
          }
        } catch (err) {
          console.error("Failed to load dashboard stats from backend:", err);
        }
      }
      loadDashboardStats();
    } else {
      // Fallback local load for offline/non-auth
      const res = localStorage.getItem("hiretwin_resume");
      if (res) {
        try {
          const r = JSON.parse(res);
          if (r.atsScore) setResumeScore(r.atsScore);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Welcome back, {userName}</h3>
              <p className="text-slate-400 text-sm">Let's continue building your career</p>
            </div>
            <button
              onClick={() => navigate("/premium")}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white flex items-center gap-2 hover:scale-105 transition-all text-sm font-medium"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-6 py-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-b border-white/10 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Career Score</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white text-3xl font-bold">{careerScore}%</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${careerScore}%` }} />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Resume Strength</span>
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-white text-3xl font-bold">{resumeScore}%</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${resumeScore}%` }} />
                </div>
                <p className="text-slate-500 text-xs mt-1">ATS-optimized score</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Learning Streak</span>
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-white text-3xl font-bold">{learningStreak}</p>
                <p className="text-slate-500 text-sm mt-2">days in a row</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Interviews</span>
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-white text-3xl font-bold">{totalInterviews}</p>
                <p className="text-slate-500 text-sm mt-2">{completedInterviews} completed</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scrollable features */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-white text-xl font-bold mb-1">Career Tools</h2>
              <p className="text-slate-400 text-sm">Choose a tool to continue building your career</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => navigate(feature.route)}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                    <div className="mt-4 flex items-center text-purple-400 text-sm">
                      <span>Launch</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium">Update your resume for {targetRole} role</p>
                    <p className="text-slate-400 text-xs">82% match probability</p>
                  </div>
                  <button onClick={() => navigate("/resume-generator")} className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition-colors">
                    Start
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium">Complete courses in target roadmap</p>
                    <p className="text-slate-400 text-xs">Close skill gap for target role</p>
                  </div>
                  <button onClick={() => navigate("/learning-roadmap")} className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition-colors">
                    Learn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Bottom Nav */}
      <BottomNav activeTab="home" />
    </div>
  );
}
