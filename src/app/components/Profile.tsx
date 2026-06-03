import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, CheckCircle2, Award, Star, Bell, Shield, Settings, Crown, ChevronRight, ArrowLeft, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { BottomNav } from "./BottomNav";
import { fetchProfile } from "../../utils/api";
import { toast } from "sonner";

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Kandhavel Saravanan", email: "kandhavel@example.com", subscriptionStatus: "Free" });
  const [profileData, setProfileData] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem("hiretwin_user");
    localStorage.removeItem("hiretwin_profile");
    localStorage.removeItem("hiretwin_resume");
    localStorage.removeItem("hiretwin_interviews");
    localStorage.removeItem("hiretwin_roadmap");
    toast.success("Successfully logged out.");
    navigate("/auth");
  };

  const handleItemClick = (item: any) => {
    if (item.id === "logout") {
      handleLogout();
    } else if (item.id === "upgrade") {
      navigate("/premium");
    } else {
      toast.info(`${item.label} settings are currently up to date!`);
    }
  };

  useEffect(() => {
    // Load auth user
    const localUser = localStorage.getItem("hiretwin_user");
    let email = "kandhavel@example.com";
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        setUser(u);
        email = u.email;
      } catch (e) {
        console.error(e);
      }
    }

    // Load backend profile
    fetchProfile(email).then((data) => {
      if (data) {
        setProfileData(data);
      } else {
        // Fallback to questionnaire answers in localStorage
        const quest = localStorage.getItem("hiretwin_profile");
        if (quest) {
          try {
            setProfileData(JSON.parse(quest));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    // Load resume data for percentage score
    const res = localStorage.getItem("hiretwin_resume");
    if (res) {
      try {
        setResumeData(JSON.parse(res));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getProfileVal = (key: string, fallback: string) => {
    if (!profileData) return fallback;
    return profileData[key] || fallback;
  };

  // Profile data mappings from Questionnaire questions
  const education = getProfileVal("1", "B.Tech Computer Science, Anna University");
  const skillsList = getProfileVal("2", ["Python", "Machine Learning", "React", "Node.js"]);
  const targetRole = getProfileVal("3", "AI / ML Engineer");
  const certifications = getProfileVal("5", "AWS Certified Machine Learning - Specialty");
  const experience = getProfileVal("6", "1 – 2 years");

  // Calculate Resume Score or display 85% as default
  const resumeScore = resumeData?.atsScore || 85;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h3 className="text-white font-semibold">User Profile</h3>
            <p className="text-slate-400 text-sm">Manage your career identity</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-8 mb-6 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-white text-2xl font-bold mb-1 flex items-center justify-center gap-2">
              {user.name}
              {user.subscriptionStatus === "Pro" && (
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg shadow-yellow-500/20">PRO</span>
              )}
              {user.subscriptionStatus === "Premium" && (
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-xs font-bold shadow-lg shadow-purple-500/20">PREMIUM</span>
              )}
              {(!user.subscriptionStatus || user.subscriptionStatus === "Free" || user.subscriptionStatus === "free") && (
                <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-slate-400 text-xs font-bold border border-white/5">FREE</span>
              )}
            </h2>
            <p className="text-purple-400 font-medium mb-1">{targetRole} Candidate</p>
            <p className="text-slate-400 text-sm">{user.email}</p>

            <div className="flex items-center justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
              ))}
              <span className="text-slate-400 text-sm ml-1">Career Score 78%</span>
            </div>

            <button
              onClick={() => navigate("/questionnaire")}
              className="mt-5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:scale-105 transition-all"
            >
              Rebuild AI Profile
            </button>
          </motion.div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Resume Strength", value: `${resumeScore}%`, color: "text-blue-400", icon: FileText },
              { label: "Skills Selected", value: Array.isArray(skillsList) ? skillsList.length : 8, color: "text-green-400", icon: CheckCircle2 },
              { label: "Certifications", value: certifications.toLowerCase().includes("no") ? "0" : "1", color: "text-purple-400", icon: Award },
            ].map(({ label, value, color, icon: Icon }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-1">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Profile Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
            <h3 className="text-white font-semibold mb-4">Professional Info</h3>
            <div className="space-y-4">
              {[
                { label: "Education", value: education },
                { label: "Target Role", value: targetRole },
                { label: "Experience", value: experience },
                { label: "Skills Set", value: Array.isArray(skillsList) ? skillsList.join(", ") : skillsList },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0 gap-4">
                  <span className="text-slate-400 text-sm shrink-0">{label}</span>
                  <span className="text-white text-sm font-medium text-right leading-relaxed">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Settings links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
            {[
              { id: "notifications", icon: Bell, label: "Notifications", desc: "Job alerts & reminders" },
              { id: "privacy", icon: Shield, label: "Privacy & Security", desc: "Account security settings" },
              { id: "preferences", icon: Settings, label: "Preferences", desc: "Theme, language, region" },
              { id: "upgrade", icon: Crown, label: user.subscriptionStatus === "Pro" ? "Manage Subscription" : "Upgrade to Pro", desc: user.subscriptionStatus === "Pro" ? "You have unlocked all features" : "Unlock all AI features", accent: true },
              { id: "logout", icon: LogOut, label: "Logout", desc: "Sign out of your account", danger: true },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${item.accent ? "bg-yellow-500/5" : ""} ${item.danger ? "hover:bg-red-500/5" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.accent ? "bg-yellow-500/20" : item.danger ? "bg-red-500/20" : "bg-white/5"}`}>
                    <Icon className={`w-4 h-4 ${item.accent ? "text-yellow-400" : item.danger ? "text-red-400" : "text-slate-400"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${item.accent ? "text-yellow-300" : item.danger ? "text-red-300" : "text-white"}`}>{item.label}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="profile" />
    </div>
  );
}
