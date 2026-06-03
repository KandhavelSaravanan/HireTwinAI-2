import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, TrendingUp, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const slides = [
  {
    icon: FileText,
    title: "Generate Resumes Instantly",
    description: "AI-powered resume builder that creates ATS-optimized resumes tailored to your target role in seconds.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Predict Future Careers",
    description: "Advanced AI analyzes your skills and experience to predict your best career paths with accuracy scores.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: MessageSquare,
    title: "AI Interview Coach",
    description: "Practice with AI-powered mock interviews, get real-time feedback, and boost your confidence.",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12">
      <button
        onClick={() => navigate("/auth")}
        className="self-end text-slate-400 hover:text-white transition-colors"
      >
        Skip
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center text-center max-w-md"
        >
          <div className={`relative mb-12`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} rounded-full blur-3xl opacity-30`} />
            <div className={`relative bg-gradient-to-r ${slide.gradient} p-12 rounded-3xl`}>
              <Icon className="w-24 h-24 text-white" />
            </div>
          </div>

          <h2 className="text-white mb-4">{slide.title}</h2>
          <p className="text-slate-400 text-lg">{slide.description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-md">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-gradient-to-r from-blue-500 to-purple-500"
                  : "w-2 bg-slate-600"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <button
            onClick={nextSlide}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            {currentSlide < slides.length - 1 ? "Next" : "Start Journey"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
