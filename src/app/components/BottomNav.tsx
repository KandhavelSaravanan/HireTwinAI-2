import { useNavigate, useLocation } from "react-router";
import { Home, Brain, BarChart3, User } from "lucide-react";

interface BottomNavProps {
  activeTab?: "home" | "ai" | "career" | "profile";
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Home", route: "/dashboard" },
    { id: "ai", icon: Brain, label: "AI Coach", route: "/ai-coach" },
    { id: "career", icon: BarChart3, label: "Career", route: "/career-growth" },
    { id: "profile", icon: User, label: "Profile", route: "/profile" },
  ];

  // Determine current active based on route or prop
  const currentActive = activeTab || (() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "home";
    if (path.includes("/ai-coach")) return "ai";
    if (path.includes("/career-growth")) return "career";
    if (path.includes("/profile")) return "profile";
    return "home";
  })();

  return (
    <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 px-6 py-3 shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map(({ id, icon: Icon, label, route }) => {
            const isActive = currentActive === id;
            return (
              <button
                key={id}
                onClick={() => navigate(route)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                <span className={`text-xs ${isActive ? "text-white" : "text-slate-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
