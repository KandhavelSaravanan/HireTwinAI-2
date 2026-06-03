import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MessageSquare, Code, Briefcase, Brain, TrendingUp, Award, Play } from "lucide-react";
import { motion } from "motion/react";
import { fetchInterviews } from "../../utils/api";

const interviewTypes = [
  {
    icon: Code,
    title: "Technical Interview",
    description: "Data structures, algorithms, and coding challenges",
    gradient: "from-blue-500 to-cyan-500",
    questions: 150,
    completed: 45,
    route: "/technical-interview",
  },
  {
    icon: Briefcase,
    title: "HR Interview",
    description: "Behavioral questions and company fit assessment",
    gradient: "from-purple-500 to-pink-500",
    questions: 80,
    completed: 30,
    route: "/hr-interview",
  },
  {
    icon: Brain,
    title: "ML/AI Interview",
    description: "Machine learning concepts and system design",
    gradient: "from-green-500 to-emerald-500",
    questions: 120,
    completed: 38,
    route: "/mlai-interview",
  },
  {
    icon: MessageSquare,
    title: "AI Mock Interview",
    description: "Practice with AI interviewer and get real-time feedback",
    gradient: "from-orange-500 to-red-500",
    sessions: 12,
    completed: 5,
    route: "/ai-mock-interview",
  },
];

export function InterviewPreparation() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [questionsList, setQuestionsList] = useState<string[]>([
    "Explain the difference between supervised and unsupervised learning",
    "How do you handle overfitting in machine learning models?",
    "Describe your experience with deploying ML models to production",
    "Walk me through a challenging ML project you've worked on",
    "How do you stay updated with the latest AI/ML developments?",
  ]);

  useEffect(() => {
    let role = localStorage.getItem("hiretwin_target_role") || "AI Engineer";
    const resumeStr = localStorage.getItem("hiretwin_resume");
    if (resumeStr) {
      try {
        const resume = JSON.parse(resumeStr);
        if (resume.formData?.targetRole) role = resume.formData.targetRole;
      } catch (e) {}
    } else {
      const profileStr = localStorage.getItem("hiretwin_profile");
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile[3]) role = profile[3];
        } catch (e) {}
      }
    }
    setTargetRole(role);

    const isDeveloper = role.toLowerCase().includes("develop") || role.toLowerCase().includes("stack") || role.toLowerCase().includes("frontend") || role.toLowerCase().includes("backend");
    const isData = role.toLowerCase().includes("data") || role.toLowerCase().includes("analyst");
    const isDevOps = role.toLowerCase().includes("devops") || role.toLowerCase().includes("cloud");

    if (isDeveloper) {
      setQuestionsList([
        "Explain the difference between SQL and NoSQL databases.",
        "How do you optimize the performance of a web application?",
        "Describe your experience with RESTful APIs and microservices.",
        "Walk me through a challenging web development project you've worked on.",
        "How do you handle authentication and state management in React?",
      ]);
    } else if (isData) {
      setQuestionsList([
        "What is the difference between supervised and unsupervised learning?",
        "Explain how A/B testing works and how you evaluate metrics.",
        "How do you handle missing values or outliers in a dataset?",
        "Describe your experience with SQL joins and window functions.",
        "What is overfitting and how can it be prevented?",
      ]);
    } else if (isDevOps) {
      setQuestionsList([
        "What is CI/CD and how have you implemented it using GitHub Actions or Jenkins?",
        "Explain the difference between a container (Docker) and a virtual machine.",
        "How does Kubernetes manage load balancing and scaling?",
        "What is Infrastructure as Code (IaC) and what are its benefits?",
        "How do you secure secrets and credentials in a cloud environment?",
      ]);
    }

    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadSessions() {
      try {
        const list = await fetchInterviews(email);
        setSessions(list || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      if (diffMins < 60) {
        return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
      } else if (diffHours < 24) {
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      } else if (diffDays < 7) {
        return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
      } else {
        return d.toLocaleDateString();
      }
    } catch (e) {
      return dateStr;
    }
  };

  const getMetrics = () => {
    if (sessions.length === 0) {
      return [
        { label: "Confidence Score", value: 0, color: "from-blue-500 to-cyan-500" },
        { label: "Communication", value: 0, color: "from-purple-500 to-pink-500" },
        { label: "Technical Skills", value: 0, color: "from-green-500 to-emerald-500" },
        { label: "Problem Solving", value: 0, color: "from-orange-500 to-red-500" },
      ];
    }
    
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalTechnical = 0;
    let totalClarity = 0;
    
    sessions.forEach((s: any) => {
      const m = s.metrics || {};
      totalConfidence += m.confidence || s.score || 80;
      totalCommunication += m.communication || s.score || 80;
      totalTechnical += m.technical || s.score || 80;
      totalClarity += m.clarity || s.score || 80;
    });
    
    const count = sessions.length;
    return [
      { label: "Confidence Score", value: Math.round(totalConfidence / count), color: "from-blue-500 to-cyan-500" },
      { label: "Communication", value: Math.round(totalCommunication / count), color: "from-purple-500 to-pink-500" },
      { label: "Technical Skills", value: Math.round(totalTechnical / count), color: "from-green-500 to-emerald-500" },
      { label: "Problem Solving", value: Math.round(totalClarity / count), color: "from-orange-500 to-red-500" },
    ];
  };

  const performanceMetrics = getMetrics();

  const getDisplaySessions = () => {
    if (sessions.length === 0) {
      return [];
    }

    return [...sessions].reverse().slice(0, 5).map((s: any) => {
      let grad = "from-green-500 to-emerald-500";
      if (s.type === "Technical Interview") grad = "from-blue-500 to-cyan-500";
      if (s.type === "HR Interview") grad = "from-purple-500 to-pink-500";
      if (s.type === "ML/AI Interview") grad = "from-green-500 to-emerald-500";

      return {
        type: s.type || "AI Mock Interview",
        date: formatDate(s.date),
        score: s.score || 80,
        feedback: s.feedback || "Completed session. Good work!",
        gradient: grad,
      };
    });
  };

  const displaySessions = getDisplaySessions();

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
              <h3 className="text-white">Interview Preparation</h3>
              <p className="text-slate-400 text-sm">Practice and ace your interviews with AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-white mb-6">Your Interview Performance</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                >
                  <p className="text-slate-400 text-sm mb-3">{metric.label}</p>
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={`url(#grad-metric-${index})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - metric.value / 100) }}
                        transition={{ duration: 1.5, delay: 0.2 + index * 0.1 }}
                      />
                      <defs>
                        <linearGradient id={`grad-metric-${index}`} x1="0%" y1="0%" x2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-2xl text-white" style={{ fontWeight: 700 }}>{metric.value}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Interview Types */}
          <div className="mb-8">
            <h3 className="text-white mb-6">Choose Interview Type</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interviewTypes.map((type, index) => {
                const Icon = type.icon;
                const completedCount = sessions.filter((s: any) => s.type === type.title).length;
                return (
                  <motion.div
                    key={type.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => setSelectedType(index)}
                    className={`group text-left bg-white/5 backdrop-blur-sm border rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer ${
                      selectedType === index ? "border-purple-500" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(type.route);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 hover:scale-105"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    </div>

                    <h4 className="text-white text-xl mb-2">{type.title}</h4>
                    <p className="text-slate-400 mb-4">{type.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">
                          {type.questions ? `${type.questions} questions` : `${type.sessions} sessions`}
                        </span>
                        <span className="text-green-400">
                          {completedCount} completed
                        </span>
                      </div>
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(completedCount / (type.questions || type.sessions!)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${type.gradient}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Practice Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Recent Practice Sessions</h3>
              <button className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
            </div>

            <div className="space-y-4">
              {displaySessions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-slate-400 text-sm mb-1">No practice sessions completed yet.</p>
                  <p className="text-slate-500 text-xs">Select an interview type above to start practicing and build your real metrics!</p>
                </div>
              ) : (
                displaySessions.map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-white">{session.type}</h4>
                        <p className="text-slate-400 text-sm">{session.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">Score</p>
                          <p className="text-white text-xl" style={{ fontWeight: 700 }}>{session.score}%</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.gradient} flex items-center justify-center`}>
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{session.feedback}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Common Interview Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-6">Top Interview Questions for {targetRole}</h3>

            <div className="space-y-3">
              {questionsList.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.05 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300">{question}</p>
                    <button className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Practice
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <button
              onClick={() => navigate("/career-growth")}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              View Career Growth Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
