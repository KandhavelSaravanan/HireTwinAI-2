import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Play, CheckCircle2, Clock, Award, Book, Video, FileText, Code } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const courses = {
  pytorch: {
    title: "PyTorch Deep Learning Course",
    instructor: "Dr. Andrew Ng",
    platform: "Udemy",
    duration: "40 hours",
    level: "Intermediate",
    rating: 4.8,
    students: 125000,
    gradient: "from-blue-500 to-purple-500",
    description: "Master PyTorch from fundamentals to advanced neural networks. Build production-ready deep learning models.",
    skills: ["PyTorch", "Neural Networks", "Deep Learning", "Computer Vision", "NLP"],
    modules: [
      {
        title: "Introduction to PyTorch",
        lessons: 8,
        duration: "2h 30m",
        completed: true,
        topics: [
          { name: "PyTorch Tensors", duration: "15m", completed: true, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Autograd Mechanics", duration: "20m", completed: true, videoUrl: "https://www.youtube.com/embed/M0f8y_8wV4s" },
          { name: "Building Neural Networks", duration: "25m", completed: true, videoUrl: "https://www.youtube.com/embed/c36lUUr864M" },
          { name: "Training Loop Basics", duration: "30m", completed: true, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
        ],
      },
      {
        title: "Convolutional Neural Networks",
        lessons: 12,
        duration: "4h 15m",
        completed: true,
        topics: [
          { name: "CNN Architecture", duration: "25m", completed: true, videoUrl: "https://www.youtube.com/embed/c36lUUr864M" },
          { name: "Image Classification", duration: "35m", completed: true, videoUrl: "https://www.youtube.com/embed/c36lUUr864M" },
          { name: "Transfer Learning", duration: "40m", completed: true, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Object Detection", duration: "45m", completed: true, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
        ],
      },
      {
        title: "Recurrent Neural Networks",
        lessons: 10,
        duration: "3h 45m",
        completed: false,
        topics: [
          { name: "RNN Fundamentals", duration: "20m", completed: true, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "LSTM and GRU", duration: "30m", completed: true, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Sequence-to-Sequence", duration: "35m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Attention Mechanisms", duration: "40m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
        ],
      },
      {
        title: "Transformers and Modern Architectures",
        lessons: 15,
        duration: "5h 30m",
        completed: false,
        topics: [
          { name: "Self-Attention", duration: "25m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Transformer Architecture", duration: "40m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "BERT and GPT", duration: "45m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Fine-tuning Techniques", duration: "50m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
        ],
      },
      {
        title: "Advanced Topics",
        lessons: 18,
        duration: "6h 20m",
        completed: false,
        topics: [
          { name: "GANs", duration: "35m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Reinforcement Learning", duration: "40m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Model Optimization", duration: "30m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
          { name: "Deployment", duration: "45m", completed: false, videoUrl: "https://www.youtube.com/embed/V_xro1bcAuA" },
        ],
      },
    ],
  },
  docker: {
    title: "Docker Mastery",
    instructor: "Bret Fisher",
    platform: "Coursera",
    duration: "20 hours",
    level: "Beginner",
    rating: 4.9,
    students: 98000,
    gradient: "from-green-500 to-emerald-500",
    description: "Complete Docker for DevOps and ML Engineers. Learn containerization from basics to production deployment.",
    skills: ["Docker", "Containers", "DevOps", "CI/CD", "Kubernetes Basics"],
    modules: [
      {
        title: "Docker Fundamentals",
        lessons: 6,
        duration: "2h 00m",
        completed: true,
        topics: [
          { name: "What is Docker?", duration: "10m", completed: true, videoUrl: "https://www.youtube.com/embed/3c-iBgEXNEc" },
          { name: "Images and Containers", duration: "15m", completed: true, videoUrl: "https://www.youtube.com/embed/3c-iBgEXNEc" },
          { name: "Dockerfile Basics", duration: "20m", completed: true, videoUrl: "https://www.youtube.com/embed/3c-iBgEXNEc" },
          { name: "Docker Compose", duration: "25m", completed: true, videoUrl: "https://www.youtube.com/embed/3c-iBgEXNEc" },
        ],
      },
    ],
  },
};

export function CourseDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id") || "pytorch";
  const course = courses[courseId as keyof typeof courses] || courses.pytorch;

  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons, 0);
  const completedModules = course.modules.filter(m => m.completed).length;
  const progressPercentage = Math.round((completedModules / course.modules.length) * 100);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/learning-roadmap")}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h3 className="text-white">{course.title}</h3>
            <p className="text-slate-400 text-sm">{course.instructor} • {course.platform}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-8 mb-8 text-white`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>{course.title}</h1>
                    <p className="text-blue-100 text-lg mb-4">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Award className="w-5 h-5" />
                    <span className="text-xl">{course.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Duration</p>
                    <p className="text-xl" style={{ fontWeight: 600 }}>{course.duration}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Level</p>
                    <p className="text-xl" style={{ fontWeight: 600 }}>{course.level}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Students</p>
                    <p className="text-xl" style={{ fontWeight: 600 }}>{course.students.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              {/* Course Modules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-white mb-6">Course Content</h3>

                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {module.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-white/20 rounded-full" />
                          )}
                          <div className="text-left">
                            <h4 className="text-white">{module.title}</h4>
                            <p className="text-slate-400 text-sm">
                              {module.lessons} lessons • {module.duration}
                            </p>
                          </div>
                        </div>
                        <Play className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedModule === index ? "rotate-90" : ""
                        }`} />
                      </button>

                      {expandedModule === index && (
                        <div className="px-6 pb-4 space-y-2">
                          {module.topics.map((topic, topicIndex) => (
                            <button
                              key={topicIndex}
                              onClick={() => {
                                if ((topic as any).videoUrl) {
                                  setActiveVideo({ url: (topic as any).videoUrl, title: topic.name });
                                }
                              }}
                              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                {topic.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Play className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                                <span className={`text-sm ${topic.completed ? "text-slate-400" : "text-slate-300"}`}>
                                  {topic.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-400 text-sm">{topic.duration}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <h4 className="text-white mb-4">Your Progress</h4>

                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#gradientProgress)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - progressPercentage / 100) }}
                      transition={{ duration: 1.5 }}
                    />
                    <defs>
                      <linearGradient id="gradientProgress" x1="0%" y1="0%" x2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-4xl text-white" style={{ fontWeight: 700 }}>{progressPercentage}%</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-white">{completedModules}/{course.modules.length} modules</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Lessons</span>
                    <span className="text-white">{totalLessons}</span>
                  </div>
                </div>
              </motion.div>

              {/* Skills You'll Gain */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <h4 className="text-white mb-4">Skills You'll Gain</h4>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Continue Learning
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0c0e16] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <h4 className="text-white font-bold text-lg truncate">{activeVideo.title}</h4>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium px-3 py-1 bg-white/5 rounded-lg border border-white/10"
                >
                  Close
                </button>
              </div>
              
              {/* Video Embed Frame */}
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={activeVideo.url}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
