import { useNavigate } from "react-router";
import { Sparkles, Brain, Rocket } from "lucide-react";
import { motion } from "motion/react";

export function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center"
      >
        <div className="relative inline-block mb-8">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-50"
          />
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-3xl">
            <Brain className="w-24 h-24 text-white" />
          </div>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            HireTwin AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-300 text-xl mb-2"
        >
          Your AI Career Operating System
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-slate-400 mb-12 max-w-md mx-auto"
        >
          From Zero Experience to Dream Job — Powered by AI
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-4 max-w-sm mx-auto"
        >
          <button
            onClick={() => navigate("/onboarding")}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2 text-white">
              Get Started
              <Rocket className="w-5 h-5" />
            </span>
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
          >
            Sign In
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-slate-400 text-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Smart Insights</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
