import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Circle, Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchInterviewQuestions, saveInterview } from "../../utils/api";

const defaultQuestions = [
  {
    id: 1,
    category: "Data Structures",
    question: "Explain the difference between an Array and a Linked List. When would you use each?",
    difficulty: "Easy",
    hint: "Think about memory allocation, insertion/deletion complexity, and access time.",
    sampleAnswer: "Arrays store elements in contiguous memory locations, offering O(1) random access but O(n) insertion/deletion. Linked Lists store elements with pointers, providing O(1) insertion/deletion at known positions but O(n) access time. Use arrays for frequent random access and linked lists for frequent insertions/deletions.",
  },
  {
    id: 2,
    category: "Algorithms",
    question: "What is the time complexity of Binary Search? Explain how it works.",
    difficulty: "Easy",
    hint: "Consider how the search space reduces with each comparison.",
    sampleAnswer: "Binary search has O(log n) time complexity. It works by repeatedly dividing the sorted array in half, comparing the middle element with the target. If the target is smaller, search the left half; if larger, search the right half. This continues until the element is found or the search space is exhausted.",
  },
  {
    id: 3,
    category: "System Design",
    question: "How would you design a URL shortening service like bit.ly?",
    difficulty: "Medium",
    hint: "Consider encoding schemes, database design, caching, and scalability.",
    sampleAnswer: "Key components: 1) Hash function to generate short URLs (Base62 encoding), 2) Database to store mappings (NoSQL for horizontal scaling), 3) Caching layer (Redis) for frequently accessed URLs, 4) Load balancer for distribution, 5) Analytics service for tracking. Handle collisions with counter-based approach.",
  },
  {
    id: 4,
    category: "Object-Oriented Programming",
    question: "Explain the four pillars of OOP with real-world examples.",
    difficulty: "Medium",
    hint: "Think about Encapsulation, Abstraction, Inheritance, and Polymorphism.",
    sampleAnswer: "1) Encapsulation: Bundling data and methods (Car class with private engine details), 2) Abstraction: Hiding complexity (Payment interface hiding different payment methods), 3) Inheritance: Child classes inherit from parent (ElectricCar extends Car), 4) Polymorphism: Same interface, different implementations (Different animals implementing speak() differently).",
  },
  {
    id: 5,
    category: "Database",
    question: "Explain ACID properties in databases with examples.",
    difficulty: "Medium",
    hint: "Consider transaction guarantees in banking systems.",
    sampleAnswer: "ACID ensures reliable transactions: 1) Atomicity: All or nothing (bank transfer completes fully or rolls back), 2) Consistency: Database remains in valid state (account balances stay positive), 3) Isolation: Concurrent transactions don't interfere (multiple withdrawals handled correctly), 4) Durability: Committed changes persist (transactions survive system crashes).",
  },
];

export function TechnicalInterview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>(defaultQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
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
        const list = await fetchInterviewQuestions("technical", userEmail);
        if (list && list.length > 0) {
          setQuestions(list);
        }
      } catch (e) {
        console.error("Failed to load technical interview questions", e);
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
        feedback = `Excellent performance! Answered ${answeredCount} of ${questions.length} questions with highly detailed responses. Great technical clarity and communication.`;
      } else if (averageScore >= 60) {
        feedback = `Good job! Answered ${answeredCount} of ${questions.length} questions with solid responses. Try to add more specific details or examples in your answers.`;
      } else {
        feedback = `Practice session completed. Answered ${answeredCount} of ${questions.length} questions. Focus on structuring your answers using the STAR method.`;
      }

      const session = {
        type: "Technical Interview",
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
    // In a real app, this would start/stop voice recording
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
              <h3 className="text-white">Technical Interview Practice</h3>
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
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                  {question.category}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm ${
                  question.difficulty === "Easy"
                    ? "bg-green-500/20 text-green-400"
                    : question.difficulty === "Medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
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
                  {showHint ? "Hide Hint" : "Need a Hint?"}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                    >
                      <p className="text-yellow-400 text-sm">💡 {question.hint}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sample Answer */}
              <div>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  {showAnswer ? "Hide Sample Answer" : "View Sample Answer"}
                </button>
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                    >
                      <p className="text-green-400 text-sm">{question.sampleAnswer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:scale-105 transition-all"
            >
              {currentQuestion === questions.length - 1 ? "Complete Practice" : "Next Question"}
            </button>
          </div>

          {/* Question List */}
          <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h4 className="text-white mb-4">All Questions</h4>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => changeQuestion(index)}
                  className={`p-3 rounded-xl transition-all ${
                    index === currentQuestion
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : completedQuestions.includes(index)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{index + 1}</span>
                    {completedQuestions.includes(index) && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
