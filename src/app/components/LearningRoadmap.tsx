import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, CheckCircle2, Circle, TrendingUp, Award, BookOpen, Play, RotateCcw, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchRoadmap, saveRoadmap } from "../../utils/api";

type GoalStatus = "completed" | "in-progress" | "pending";

interface Goal {
  title: string;
  status: GoalStatus;
  time: string;
  duration: string;
}

interface Phase {
  duration: string;
  title: string;
  gradient: string;
  goals: Goal[];
}

const roadmapDatabases: Record<string, Phase[]> = {
  "AI Engineer": [
    {
      duration: "30 Days",
      title: "Foundation Phase",
      gradient: "from-blue-500 to-cyan-500",
      goals: [
        { title: "Master Docker Fundamentals", status: "completed", time: "Week 1–2", duration: "~10 hrs" },
        { title: "PyTorch Basics & Neural Networks", status: "completed", time: "Week 2–3", duration: "~15 hrs" },
        { title: "Build First Containerized ML App", status: "in-progress", time: "Week 3–4", duration: "~8 hrs" },
        { title: "Complete Docker Certification", status: "pending", time: "Week 4", duration: "~4 hrs" },
      ],
    },
    {
      duration: "90 Days",
      title: "Advanced Skills Development",
      gradient: "from-purple-500 to-pink-500",
      goals: [
        { title: "MLOps Best Practices", status: "in-progress", time: "Month 2", duration: "~20 hrs" },
        { title: "Kubernetes for ML Deployment", status: "pending", time: "Month 2–3", duration: "~18 hrs" },
        { title: "AWS/GCP ML Services", status: "pending", time: "Month 3", duration: "~15 hrs" },
        { title: "CI/CD for ML Pipelines", status: "pending", time: "Month 3", duration: "~12 hrs" },
      ],
    },
    {
      duration: "6 Months",
      title: "Production Projects & Mastery",
      gradient: "from-green-500 to-emerald-500",
      goals: [
        { title: "Apache Spark for Big Data ML", status: "pending", time: "Month 4–5", duration: "~20 hrs" },
        { title: "Build End-to-End ML Platform", status: "pending", time: "Month 5", duration: "~30 hrs" },
        { title: "Deploy Production ML System", status: "pending", time: "Month 5–6", duration: "~25 hrs" },
        { title: "AWS ML Specialty Certification", status: "pending", time: "Month 6", duration: "~20 hrs" },
      ],
    },
  ],
  "Data Scientist": [
    {
      duration: "30 Days",
      title: "Foundation Phase",
      gradient: "from-blue-500 to-cyan-500",
      goals: [
        { title: "Master Python Data Stack (Pandas & NumPy)", status: "completed", time: "Week 1–2", duration: "~12 hrs" },
        { title: "SQL for Data Science & Relational DBs", status: "completed", time: "Week 2–3", duration: "~10 hrs" },
        { title: "Exploratory Data Analysis (EDA) Projects", status: "in-progress", time: "Week 3–4", duration: "~15 hrs" },
        { title: "Statistics & Probability Basics", status: "pending", time: "Week 4", duration: "~8 hrs" },
      ],
    },
    {
      duration: "90 Days",
      title: "Advanced Model Building",
      gradient: "from-purple-500 to-pink-500",
      goals: [
        { title: "Supervised & Unsupervised ML Algorithms", status: "in-progress", time: "Month 2", duration: "~25 hrs" },
        { title: "Feature Engineering & Data Preprocessing", status: "pending", time: "Month 2–3", duration: "~18 hrs" },
        { title: "A/B Testing & Hypothesis Evaluation", status: "pending", time: "Month 3", duration: "~12 hrs" },
        { title: "Data Visualization (Tableau & Power BI)", status: "pending", time: "Month 3", duration: "~15 hrs" },
      ],
    },
    {
      duration: "6 Months",
      title: "Production Data Systems",
      gradient: "from-green-500 to-emerald-500",
      goals: [
        { title: "Introduction to Deep Learning models", status: "pending", time: "Month 4", duration: "~20 hrs" },
        { title: "Big Data Processing (Apache Spark & Hadoop)", status: "pending", time: "Month 4–5", duration: "~25 hrs" },
        { title: "Cloud Data Platforms (Snowflake & AWS Glue)", status: "pending", time: "Month 5", duration: "~20 hrs" },
        { title: "Complete End-to-End Capstone Project", status: "pending", time: "Month 5–6", duration: "~30 hrs" },
      ],
    },
  ],
  "Full Stack Developer": [
    {
      duration: "30 Days",
      title: "Foundation Phase",
      gradient: "from-blue-500 to-cyan-500",
      goals: [
        { title: "Master TypeScript & React Core", status: "completed", time: "Week 1–2", duration: "~14 hrs" },
        { title: "Backend API Frameworks (Node & Express)", status: "completed", time: "Week 2–3", duration: "~16 hrs" },
        { title: "Relational & NoSQL Database Design", status: "in-progress", time: "Week 3–4", duration: "~12 hrs" },
        { title: "Git Workflows & Team Collaboration", status: "pending", time: "Week 4", duration: "~6 hrs" },
      ],
    },
    {
      duration: "90 Days",
      title: "Advanced Integration",
      gradient: "from-purple-500 to-pink-500",
      goals: [
        { title: "Redis Caching & Session Management", status: "in-progress", time: "Month 2", duration: "~10 hrs" },
        { title: "GraphQL API Design & Apollo Client", status: "pending", time: "Month 2–3", duration: "~18 hrs" },
        { title: "CI/CD Pipelines (GitHub Actions)", status: "pending", time: "Month 3", duration: "~10 hrs" },
        { title: "Containerizing Apps with Docker", status: "pending", time: "Month 3", duration: "~12 hrs" },
      ],
    },
    {
      duration: "6 Months",
      title: "Scale, Security & Mastery",
      gradient: "from-green-500 to-emerald-500",
      goals: [
        { title: "System Design for High Concurrency", status: "pending", time: "Month 4", duration: "~20 hrs" },
        { title: "OAuth, JWT & Advanced Security", status: "pending", time: "Month 4–5", duration: "~15 hrs" },
        { title: "Cloud Hosting & Serverless (AWS/GCP)", status: "pending", time: "Month 5", duration: "~18 hrs" },
        { title: "Full Stack Portfolio Capstone App", status: "pending", time: "Month 5–6", duration: "~35 hrs" },
      ],
    },
  ],
  "DevOps / Cloud Engineer": [
    {
      duration: "30 Days",
      title: "Foundation Phase",
      gradient: "from-blue-500 to-cyan-500",
      goals: [
        { title: "Master Linux Command Line & Scripting", status: "completed", time: "Week 1–2", duration: "~15 hrs" },
        { title: "Networking Fundamentals & Cloud Basics", status: "completed", time: "Week 2–3", duration: "~12 hrs" },
        { title: "Docker Containerization Essentials", status: "in-progress", time: "Week 3–4", duration: "~10 hrs" },
        { title: "Git & Version Control best practices", status: "pending", time: "Week 4", duration: "~6 hrs" },
      ],
    },
    {
      duration: "90 Days",
      title: "Advanced DevOps Practices",
      gradient: "from-purple-500 to-pink-500",
      goals: [
        { title: "Jenkins & GitHub Actions CI/CD pipelines", status: "in-progress", time: "Month 2", duration: "~20 hrs" },
        { title: "Infrastructure as Code (Terraform basics)", status: "pending", time: "Month 2–3", duration: "~18 hrs" },
        { title: "Kubernetes Orchestration Foundations", status: "pending", time: "Month 3", duration: "~20 hrs" },
        { title: "Application Monitoring & Logging (ELK Stack)", status: "pending", time: "Month 3", duration: "~15 hrs" },
      ],
    },
    {
      duration: "6 Months",
      title: "Orchestration & Cloud Security",
      gradient: "from-green-500 to-emerald-500",
      goals: [
        { title: "Helm, Ingress & Advanced Kubernetes", status: "pending", time: "Month 4", duration: "~22 hrs" },
        { title: "Cloud Security Scanners & Hardening", status: "pending", time: "Month 4–5", duration: "~15 hrs" },
        { title: "AWS Multi-Region High-Availability setup", status: "pending", time: "Month 5", duration: "~25 hrs" },
        { title: "DevOps Capstone: Automated cloud environment", status: "pending", time: "Month 5–6", duration: "~30 hrs" },
      ],
    },
  ]
};

const STATUS_CYCLE: Record<GoalStatus, GoalStatus> = {
  pending: "in-progress",
  "in-progress": "completed",
  completed: "pending",
};

const getGoalRoute = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes("docker") || t.includes("container")) {
    return "/course-detail?id=docker";
  }
  if (t.includes("pytorch") || t.includes("neural") || t.includes("deep learning")) {
    return "/course-detail?id=pytorch";
  }
  if (t.includes("project") || t.includes("portfolio") || t.includes("platform") || t.includes("mastery")) {
    return "/portfolio";
  }
  if (t.includes("interview") || t.includes("prep") || t.includes("certification") || t.includes("specialty")) {
    return "/interview-prep";
  }
  if (t.includes("mlops") || t.includes("pipeline") || t.includes("kubernetes") || t.includes("aws") || t.includes("gcp") || t.includes("cloud")) {
    return "/course-detail?id=pytorch";
  }
  return "/course-detail?id=pytorch";
};

export function LearningRoadmap() {
  const navigate = useNavigate();
  const [phases, setPhases] = useState<Phase[]>(roadmapDatabases["AI Engineer"]);
  const [targetRoleLabel, setTargetRoleLabel] = useState("AI Engineer");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    let raw = localStorage.getItem("hiretwin_target_role") || "AI Engineer";
    const resumeStr = localStorage.getItem("hiretwin_resume");
    if (resumeStr) {
      try {
        const resume = JSON.parse(resumeStr);
        if (resume.formData?.targetRole) raw = resume.formData.targetRole;
      } catch (e) {}
    } else {
      const profileStr = localStorage.getItem("hiretwin_profile");
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile[3]) raw = profile[3];
        } catch (e) {}
      }
    }

    let matchedLabel = "AI Engineer";
    if (raw.includes("AI / ML") || raw.toLowerCase().includes("ml engineer")) matchedLabel = "AI Engineer";
    else if (raw.toLowerCase().includes("data scientist")) matchedLabel = "Data Scientist";
    else if (raw.toLowerCase().includes("full stack") || raw.toLowerCase().includes("developer") || raw.toLowerCase().includes("frontend") || raw.toLowerCase().includes("backend")) matchedLabel = "Full Stack Developer";
    else if (raw.toLowerCase().includes("devops") || raw.toLowerCase().includes("cloud")) matchedLabel = "DevOps / Cloud Engineer";
    setTargetRoleLabel(raw);

    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadRoadmap() {
      const saved = await fetchRoadmap(email);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setPhases(saved);
      } else {
        const initial = roadmapDatabases[matchedLabel] || roadmapDatabases["AI Engineer"];
        setPhases(initial);
        await saveRoadmap(email, initial);
      }
    }
    loadRoadmap();
  }, []);

  const toggleGoal = (phaseIndex: number, goalIndex: number) => {
    let updatedPhases: Phase[] = [];
    setPhases((prev) => {
      const next = prev.map((p, pi) => ({
        ...p,
        goals: p.goals.map((g, gi) => {
          if (pi === phaseIndex && gi === goalIndex) {
            const nextStatus = STATUS_CYCLE[g.status];
            return { ...g, status: nextStatus };
          }
          return g;
        }),
      }));
      updatedPhases = next;
      return next;
    });

    const goal = phases[phaseIndex].goals[goalIndex];
    const nextStatus = STATUS_CYCLE[goal.status];

    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    setTimeout(() => {
      saveRoadmap(email, updatedPhases);
    }, 100);

    const msgs: Record<GoalStatus, string> = {
      "in-progress": `Started: ${goal.title}`,
      completed: `Completed: ${goal.title}! Great work!`,
      pending: `Reset: ${goal.title}`,
    };
    setNotification(msgs[nextStatus]);
    setTimeout(() => setNotification(""), 2500);

    // Navigate to the relevant learning or practice page after a short delay
    const targetRoute = getGoalRoute(goal.title);
    setTimeout(() => {
      navigate(targetRoute);
    }, 400);
  };

  const stats = useMemo(() => {
    const allGoals = phases.flatMap((p) => p.goals);
    const completed = allGoals.filter((g) => g.status === "completed").length;
    const inProgress = allGoals.filter((g) => g.status === "in-progress").length;
    const total = allGoals.length;
    const overall = Math.round((completed / total) * 100);
    return { completed, inProgress, total, overall };
  }, [phases]);

  const phaseProgress = (phase: Phase) => {
    const completed = phase.goals.filter((g) => g.status === "completed").length;
    return Math.round((completed / phase.goals.length) * 100);
  };

  const buttonLabel = (status: GoalStatus) => {
    if (status === "completed") return "Completed ✓";
    if (status === "in-progress") return "Mark Done";
    return "Start";
  };

  const buttonClass = (status: GoalStatus) => {
    if (status === "completed") return "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30";
    if (status === "in-progress") return "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30";
    return "bg-white/5 border border-white/10 text-white hover:bg-white/10";
  };

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm backdrop-blur-xl shadow-xl"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-semibold">Learning Roadmap</h3>
              <p className="text-slate-400 text-sm">Your personalized path to {targetRoleLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Overall</p>
              <p className="text-white font-bold text-xl">{stats.overall}%</p>
            </div>
            <div className="w-12 h-12 relative">
              <svg className="-rotate-90" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <motion.circle
                  cx="25" cy="25" r="20" fill="none" stroke="#8b5cf6" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 20}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - stats.overall / 100) }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-1">Your Career Transformation Journey</h2>
                <p className="text-slate-300 text-sm">From Current State → {targetRoleLabel} in 6 months</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-1">Overall Progress</p>
                <motion.p
                  key={stats.overall}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-white text-4xl font-bold"
                >
                  {stats.overall}%
                </motion.p>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mb-6 h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${stats.overall}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs">Completed</span>
                </div>
                <motion.p key={stats.completed} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-white text-2xl font-bold">
                  {stats.completed}
                </motion.p>
                <p className="text-green-400 text-xs">learning goals</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs">In Progress</span>
                </div>
                <motion.p key={stats.inProgress} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-white text-2xl font-bold">
                  {stats.inProgress}
                </motion.p>
                <p className="text-blue-400 text-xs">active goals</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Remaining</span>
                </div>
                <motion.p key={stats.total - stats.completed} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-white text-2xl font-bold">
                  {stats.total - stats.completed}
                </motion.p>
                <p className="text-purple-400 text-xs">goals to go</p>
              </div>
            </div>
          </motion.div>

          {/* Roadmap Phases */}
          <div className="space-y-8">
            {phases.map((phase, phaseIndex) => {
              const progress = phaseProgress(phase);
              return (
                <motion.div
                  key={phase.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + phaseIndex * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center`}>
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">{phase.duration}</p>
                        <h3 className="text-white font-semibold">{phase.title}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm mb-2">Phase Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full bg-gradient-to-r ${phase.gradient}`}
                          />
                        </div>
                        <motion.span key={progress} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-white font-medium text-sm w-10">
                          {progress}%
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {phase.goals.map((goal, goalIndex) => {
                      const StatusIcon = goal.status === "completed" ? CheckCircle2 : goal.status === "in-progress" ? TrendingUp : Circle;
                      const statusColor = goal.status === "completed" ? "text-green-400" : goal.status === "in-progress" ? "text-blue-400" : "text-slate-500";
                      const bgColor = goal.status === "completed"
                        ? "bg-green-500/8 border-green-500/20"
                        : goal.status === "in-progress"
                        ? "bg-blue-500/8 border-blue-500/20"
                        : "bg-white/3 border-white/8";

                      return (
                        <motion.div
                          key={goal.title}
                          layout
                          className={`p-4 border rounded-xl transition-colors ${bgColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`w-5 h-5 ${statusColor} shrink-0`} />
                              <div>
                                <h4 className={`text-sm font-medium ${goal.status === "completed" ? "text-slate-300 line-through decoration-green-500/50" : "text-white"}`}>
                                  {goal.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-slate-500 text-xs">{goal.time}</p>
                                  <div className="flex items-center gap-1 text-slate-600 text-xs">
                                    <Clock className="w-3 h-3" />
                                    {goal.duration}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {goal.status === "in-progress" && (
                                <span className="text-xs text-blue-400 flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  Active
                                </span>
                              )}
                              <button
                                onClick={() => toggleGoal(phaseIndex, goalIndex)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 ${buttonClass(goal.status)}`}
                              >
                                {goal.status === "completed" ? (
                                  <span className="flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                  </span>
                                ) : buttonLabel(goal.status)}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recommended Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Recommended Learning Resources</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "PyTorch Deep Learning Course", desc: "Comprehensive PyTorch fundamentals and neural networks", platform: "Udemy • 40 hours", color: "from-blue-500/10 to-purple-500/10", border: "border-blue-500/20", textColor: "text-blue-400", btn: "bg-blue-600 hover:bg-blue-700", route: "/course-detail?id=pytorch" },
                { title: "Docker Mastery", desc: "Complete Docker for DevOps and ML Engineers", platform: "Coursera • 20 hours", color: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20", textColor: "text-green-400", btn: "bg-green-600 hover:bg-green-700", route: "/course-detail?id=docker" },
                { title: "MLOps Specialization", desc: "Production ML systems and deployment strategies", platform: "Coursera • 60 hours", color: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20", textColor: "text-purple-400", btn: "bg-purple-600 hover:bg-purple-700", route: "/course-detail?id=pytorch" },
                { title: "AWS ML Specialty", desc: "Prepare for AWS Machine Learning certification", platform: "A Cloud Guru • 30 hours", color: "from-orange-500/10 to-red-500/10", border: "border-orange-500/20", textColor: "text-orange-400", btn: "bg-orange-600 hover:bg-orange-700", route: "/course-detail?id=docker" },
              ].map((course) => (
                <div key={course.title} className={`p-4 bg-gradient-to-br ${course.color} border ${course.border} rounded-xl`}>
                  <h4 className="text-white font-medium mb-1">{course.title}</h4>
                  <p className="text-slate-400 text-sm mb-3">{course.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className={`${course.textColor} text-sm`}>{course.platform}</span>
                    <button
                      onClick={() => navigate(course.route)}
                      className={`px-3 py-1.5 ${course.btn} rounded-lg text-white text-xs font-medium transition-colors`}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => navigate("/interview-prep")}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-purple-900/30"
            >
              Start Interview Preparation
            </button>
            <button
              onClick={() => navigate("/career-growth")}
              className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
              View Career Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
