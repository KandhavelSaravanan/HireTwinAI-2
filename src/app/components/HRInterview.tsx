import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Circle, Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchInterviewQuestions, saveInterview } from "../../utils/api";

const defaultQuestions = [
  {
    id: 1,
    category: "Behavioral",
    question: "Tell me about yourself and your background.",
    difficulty: "Easy",
    hint: "Focus on your professional journey, key achievements, and relevance to your target job role.",
    sampleAnswer: "Start with your current role, outline 2-3 key technical milestones, and close with why you are excited about this opportunity.",
  },
  {
    id: 2,
    category: "Conflict Resolution",
    question: "Describe a time you had a disagreement with a team member. How did you resolve it?",
    difficulty: "Medium",
    hint: "Use the STAR method. Focus on communication, objective criteria, and business goals.",
    sampleAnswer: "Detail how you discussed the disagreement privately, analyzed data/metrics together, found a compromise, and delivered the project successfully.",
  },
  {
    id: 3,
    category: "Failure & Resilience",
    question: "Tell me about a time you made a mistake or failed. What did you learn?",
    difficulty: "Medium",
    hint: "Take ownership of the mistake, detail the prompt correction, and emphasize the process changes you initiated.",
    sampleAnswer: "State the problem clearly, take responsibility, explain the quick resolution, and outline how you improved documentation or code coverage to prevent future issues.",
  },
  {
    id: 4,
    category: "Leadership & Teamwork",
    question: "How do you prioritize your tasks when handling multiple projects with tight deadlines?",
    difficulty: "Easy",
    hint: "Talk about prioritization matrices (e.g. Eisenhower matrix), stakeholder updates, and expectations management.",
    sampleAnswer: "Evaluate tasks based on impact and urgency, communicate resource constraints to project owners early, delegate if possible, and work iteratively.",
  },
  {
    id: 5,
    category: "Career Alignment",
    question: "Why do you want to join our company specifically?",
    difficulty: "Easy",
    hint: "Reference the company's culture, recent products, or technology stack and align it with your career goals.",
    sampleAnswer: "Connect your passion for their specific engineering achievements with your technical skill set and desire for collaborative innovation.",
  },
];

export function HRInterview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>(defaultQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("guest@hiretwin.com");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const userStr = localStorage.getItem("hiretwin_user");
    let userEmail = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) userEmail = u.email;
      } catch (e) {}
    }
    setEmail(userEmail);

    async function loadQuestions() {
      try {
        const list = await fetchInterviewQuestions("hr", userEmail);
        if (list && list.length > 0) {
          setQuestions(list);
        }
      } catch (e) {
        console.error("Failed to load HR interview questions", e);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const question = questions[currentQuestion];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0c0e16]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading tailored questions...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0c0e16]">
        <div className="text-center">
          <p className="text-red-400">No questions found.</p>
          <button onClick={() => navigate("/interview-prep")} className="mt-4 px-6 py-2 bg-purple-600 rounded-xl">Back</button>
        </div>
      </div>
    );
  }

  const changeQuestion = (newIndex: number) => {
    const updatedAnswers = { ...answers, [currentQuestion]: userAnswer };
    setAnswers(updatedAnswers);

    let updatedCompleted = [...completedQuestions];
    if (userAnswer.trim().length > 0) {
      if (!updatedCompleted.includes(currentQuestion)) {
        updatedCompleted.push(currentQuestion);
      }
    } else {
      updatedCompleted = updatedCompleted.filter(q => q !== currentQuestion);
    }
    setCompletedQuestions(updatedCompleted);

    setCurrentQuestion(newIndex);
    setShowHint(false);
    setShowAnswer(false);
    setUserAnswer(updatedAnswers[newIndex] || "");
    setIsRecording(false);
  };

  const handleNext = async () => {
    const finalAnswers = { ...answers, [currentQuestion]: userAnswer };
    setAnswers(finalAnswers);

    let updatedCompleted = [...completedQuestions];
    if (userAnswer.trim().length > 0) {
      if (!updatedCompleted.includes(currentQuestion)) {
        updatedCompleted.push(currentQuestion);
      }
    } else {
      updatedCompleted = updatedCompleted.filter(q => q !== currentQuestion);
    }
    setCompletedQuestions(updatedCompleted);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
      setShowAnswer(false);
      setUserAnswer(finalAnswers[currentQuestion + 1] || "");
      setIsRecording(false);
    } else {
      // Quiz complete - calculate score and save to MySQL
      let totalScore = 0;
      let answeredCount = 0;
      questions.forEach((q, idx) => {
        const ans = (finalAnswers[idx] || "").trim();
        if (ans.length > 0) {
          answeredCount++;
          if (ans.length > 100) {
            totalScore += 100;
          } else if (ans.length > 20) {
            totalScore += 75;
          } else {
            totalScore += 40;
          }
        }
      });

      const averageScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0;
      const confidence = averageScore > 0 ? Math.max(10, Math.min(100, Math.round(averageScore * (0.9 + Math.random() * 0.15)))) : 0;
      const communication = averageScore > 0 ? Math.max(10, Math.min(100, Math.round(averageScore * (0.85 + Math.random() * 0.2)))) : 0;
      const technical = averageScore > 0 ? Math.max(10, Math.min(100, Math.round(averageScore * (0.95 + Math.random() * 0.1)))) : 0;
      const clarity = averageScore > 0 ? Math.max(10, Math.min(100, Math.round(averageScore * (0.9 + Math.random() * 0.15)))) : 0;

      let feedback = "";
      if (answeredCount === 0) {
        feedback = "No questions were answered. Try to practice and write responses to improve your skills.";
      } else if (averageScore >= 85) {
        feedback = `Excellent performance! Answered ${answeredCount} of ${questions.length} questions with highly detailed responses. Great behavioral alignment and communication.`;
      } else if (averageScore >= 60) {
        feedback = `Good job! Answered ${answeredCount} of ${questions.length} questions with solid responses. Try to add more specific examples in your answers.`;
      } else {
        feedback = `Practice session completed. Answered ${answeredCount} of ${questions.length} questions. Focus on structuring your answers using the STAR method.`;
      }

      const session = {
        type: "HR Interview",
        date: new Date().toISOString(),
        score: averageScore,
        feedback,
        metrics: {
          confidence,
          communication,
          technical,
          clarity
        }
      };

      try {
        await saveInterview(email, session);
      } catch (e) {
        console.error("Failed to save interview session", e);
      }
      navigate("/interview-prep");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      changeQuestion(currentQuestion - 1);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/interview-prep")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">HR Interview Practice</h3>
              <p className="text-slate-400 text-sm">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-white text-xl">{completedQuestions.length}/{questions.length}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Overall Progress</span>
              <span className="text-white">{Math.round((completedQuestions.length / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedQuestions.length / questions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                  {question.category}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm bg-green-500/20 text-green-400`}>
                  {question.difficulty}
                </span>
              </div>

              <h3 className="text-white text-2xl mb-6">{question.question}</h3>

              {/* Answer Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-400">Your Answer:</label>
                  <button
                    onClick={toggleRecording}
                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${
                      isRecording
                        ? "bg-red-500 text-white"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Record Answer
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type or record your answer here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Hint Section */}
              <div className="mb-6">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                >
                  {showHint ? "Hide Hint" : "Show Hint"}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-sm"
                    >
                      {question.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sample Answer Section */}
              <div className="mb-8">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  {showAnswer ? "Hide Sample Answer" : "Show Sample Answer"}
                </button>
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-slate-300 text-sm"
                    >
                      {question.sampleAnswer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center border-t border-white/10 pt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:scale-105 transition-all text-sm"
                >
                  {currentQuestion === questions.length - 1 ? "Finish Interview" : "Next Question"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
