import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveProfile } from "../../utils/api";

interface Question {
  id: number;
  text: string;
  type: "single" | "multi" | "text";
  options?: string[];
  placeholder?: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What's your highest level of education?",
    type: "single",
    options: ["High School / 10+2", "Diploma / Polytechnic", "Bachelor's Degree (B.E / B.Tech / B.Sc)", "Master's Degree (M.E / M.Tech / M.Sc)", "MBA / PGDM", "PhD / Doctorate"],
  },
  {
    id: 2,
    text: "Which technical skills do you currently have?",
    type: "multi",
    options: ["Python", "Java", "JavaScript", "React", "Node.js", "Machine Learning", "Data Analysis", "SQL", "TensorFlow", "Docker", "AWS", "Flutter", "C / C++", "Kotlin", "Go"],
  },
  {
    id: 3,
    text: "What is your target job role or career goal?",
    type: "single",
    options: ["AI / ML Engineer", "Data Scientist", "Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps / Cloud Engineer", "Cybersecurity Analyst", "Product Manager", "Android / iOS Developer", "Data Analyst"],
  },
  {
    id: 4,
    text: "Which programming languages are you most proficient in?",
    type: "multi",
    options: ["Python", "Java", "JavaScript / TypeScript", "C / C++", "Go (Golang)", "Rust", "Kotlin", "Swift", "R", "MATLAB", "Dart", "PHP", "Ruby", "Scala"],
  },
  {
    id: 5,
    text: "Do you have any certifications or notable achievements?",
    type: "single",
    options: ["Yes — industry certifications (AWS, GCP, Azure, etc.)", "Yes — platform certificates (Coursera, Udemy, etc.)", "Yes — hackathon / competition wins", "Yes — open source contributions", "No certifications yet", "Currently pursuing certification"],
  },
  {
    id: 6,
    text: "Do you have any internships or work experience?",
    type: "single",
    options: ["No experience yet (fresher)", "Less than 6 months", "6 months – 1 year", "1 – 2 years", "2 – 5 years", "5+ years"],
  },
  {
    id: 7,
    text: "Tell us about a key project you've worked on:",
    type: "text",
    placeholder: "e.g., E-commerce Full Stack Web Application: Developed using React, Node.js, and MongoDB. Implemented stripe payments and user authentication...",
  },
];

export function CareerQuestionnaire() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [textInput, setTextInput] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [completed, setCompleted] = useState(false);

  const current = questions[currentIndex];

  const isAnswered = () => {
    if (current.type === "text") return textInput.trim().length > 3;
    const ans = answers[current.id];
    if (current.type === "single") return !!ans;
    if (current.type === "multi") return Array.isArray(ans) && ans.length > 0;
    return false;
  };

  const toggleSingle = (option: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
  };

  const toggleMulti = (option: string) => {
    setAnswers((prev) => {
      const existing = (prev[current.id] as string[]) || [];
      const next = existing.includes(option) ? existing.filter((o) => o !== option) : [...existing, option];
      return { ...prev, [current.id]: next };
    });
  };

  const handleNext = () => {
    let updatedAnswers = { ...answers };
    if (current.type === "text") {
      updatedAnswers = { ...answers, [current.id]: textInput };
      setAnswers(updatedAnswers);
    }

    const nextIndex = currentIndex + 1;
    const completion = Math.round((nextIndex / questions.length) * 100);
    setProfileCompletion(completion);

    if (nextIndex >= questions.length) {
      // Get current logged-in user email
      const userStr = localStorage.getItem("hiretwin_user");
      let email = "guest@hiretwin.com";
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.email) email = u.email;
        } catch (e) {}
      }

      // Save answers via API
      saveProfile(email, updatedAnswers);

      setCompleted(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      setCurrentIndex(nextIndex);
      setTextInput("");
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-3">Profile Built!</h2>
          <p className="text-slate-400">Taking you to your career dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Career Profile Builder</h3>
              <p className="text-slate-400 text-xs">Question {currentIndex + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
            <span className="text-white text-sm font-medium">{profileCompletion}%</span>
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div className="px-6 pt-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : i === currentIndex
                  ? "bg-purple-400"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-2">
                <span className="text-purple-400 text-sm font-medium">Step {currentIndex + 1}</span>
              </div>
              <h2 className="text-white text-2xl font-bold mb-8">{current.text}</h2>

              {/* Single select */}
              {current.type === "single" && current.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleSingle(opt)}
                        className={`flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all ${
                          selected
                            ? "bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-900/20"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>{opt}</span>
                        {selected && <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi select */}
              {current.type === "multi" && current.options && (
                <>
                  <p className="text-slate-400 text-sm mb-4">Select all that apply</p>
                  <div className="flex flex-wrap gap-3">
                    {current.options.map((opt) => {
                      const selected = ((answers[current.id] as string[]) || []).includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleMulti(opt)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                            selected
                              ? "bg-blue-500/20 border-blue-500 text-blue-300"
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Text input */}
              {current.type === "text" && (
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={current.placeholder}
                  rows={5}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-base leading-relaxed"
                />
              )}

              {/* Next button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!isAnswered()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 shadow-lg shadow-purple-900/30"
                >
                  {currentIndex === questions.length - 1 ? "Build My Profile" : "Next"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
