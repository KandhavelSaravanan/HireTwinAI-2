import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Bot, Send, Zap, BookOpen, Target, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { BottomNav } from "./BottomNav";

interface CoachMessage {
  role: "ai" | "user";
  text: string;
}

const aiCoachMessages = [
  { role: "ai" as const, text: "Hi! I've analyzed your profile and I'm ready to act as your personalized career co-pilot. Want to close your skill gaps faster?" },
  { role: "ai" as const, text: "I recommend completing Docker Fundamentals and PyTorch training - they have a very high impact for target tech roles." },
  { role: "ai" as const, text: "What career challenge or interview prep question can I help you solve today?" },
];

export function AICoach() {
  const navigate = useNavigate();
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(aiCoachMessages);
  const [coachInput, setCoachInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages]);

  const sendCoachMessage = () => {
    if (!coachInput.trim()) return;
    const userMsg = coachInput.trim();
    setCoachInput("");
    setCoachMessages((prev) => [...prev, { role: "user" as const, text: userMsg }]);
    setTimeout(() => {
      const responses = [
        "Great question! Focusing on containerization and cloud deployment is highly recommended to improve your career score.",
        "Your profile shows strong potential. Preparing structured answers using the STAR method will give you a significant edge in technical interviews.",
        "Based on recent hiring trends, adding automated CI/CD pipeline skills will make your resume standout to 90% of tech recruiters.",
        "That's a key milestone! Completing your current learning roadmap milestones will prepare you for senior roles within 6 months.",
      ];
      setCoachMessages((prev) => [
        ...prev,
        { role: "ai" as const, text: responses[Math.floor(Math.random() * responses.length)] },
      ]);
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl leading-tight">AI Career Coach</h2>
                <p className="text-slate-400 text-sm">Personalized guidance powered by AI</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs">Active</span>
          </div>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col px-6 py-6 overflow-hidden max-w-3xl mx-auto w-full">
        {/* Coach capabilities */}
        <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
          {[
            { icon: Zap, label: "Career Strategy", color: "text-yellow-400" },
            { icon: BookOpen, label: "Learning Plans", color: "text-blue-400" },
            { icon: Target, label: "Job Matching", color: "text-purple-400" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-slate-300 text-xs text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin">
          {coachMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-sm px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-white/8 border border-white/10 text-slate-200"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts */}
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {["What skills should I learn next?", "Review my career readiness score", "How to prepare for Technical interviews"].map((q) => (
            <button
              key={q}
              onClick={() => setCoachInput(q)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 text-xs hover:bg-white/10 hover:text-white transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Text Input area */}
        <div className="flex gap-3 shrink-0">
          <input
            type="text"
            value={coachInput}
            onChange={(e) => setCoachInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendCoachMessage()}
            placeholder="Ask your AI coach anything..."
            className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
          />
          <button
            onClick={sendCoachMessage}
            disabled={!coachInput.trim()}
            className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:scale-105 transition-all disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="ai" />
    </div>
  );
}
