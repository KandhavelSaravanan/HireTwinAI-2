import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Github, Eye, EyeOff, AlertCircle, Loader2, Sparkles, Star, ArrowRight, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchProfile, fetchResume, fetchInterviews, fetchRoadmap } from "../../utils/api";

const API_BASE = "http://localhost:3001/make-server-c646ecc8";



// ─── Main Auth Component ──────────────────────────────────────────────────────

export function Auth() {
  const navigate = useNavigate();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [returningUser, setReturningUser] = useState<{ name: string; email: string } | null>(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("hiretwin_user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setIsReturningUser(true);
        setReturningUser(parsed);
        setIsSignUp(false);
        setFormData((prev) => ({ ...prev, email: parsed.email || "" }));
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsReturningUser(false);
      setIsSignUp(true);
    }
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8;

  const handleEmailCheck = async (email: string) => {
    if (!email.trim() || !validateEmail(email.trim())) return;
    
    try {
      const res = await fetch(`${API_BASE}/auth/check/${encodeURIComponent(email.trim().toLowerCase())}`);
      const data = await res.json();
      if (data.success) {
        if (data.exists) {
          setIsSignUp(false);
          setReturningUser({ name: data.name || "User", email: email.trim().toLowerCase() });
          setIsReturningUser(true);
        } else {
          setIsSignUp(true);
          setIsReturningUser(false);
        }
      }
    } catch (e) {
      console.warn("Failed to check email with backend, fallback to manual mode", e);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
    setError("");
  };

  const handleAuth = async () => {
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };

    if (!isReturningUser) {
      if (isSignUp && !formData.name.trim()) newErrors.name = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email address is required";
      else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address";
      if (isSignUp && formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password)) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e !== "")) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isSignUp ? "/auth/register" : "/auth/login";
      const body: Record<string, string> = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      if (isSignUp) body.name = formData.name.trim();

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Authentication failed. Please try again.");
        return;
      }

      // Save user to localStorage
      localStorage.setItem("hiretwin_user", JSON.stringify(data.user));

      // Fetch other user details from database and populate localStorage
      try {
        await Promise.all([
          fetchProfile(data.user.email),
          fetchResume(data.user.email),
          fetchInterviews(data.user.email),
          fetchRoadmap(data.user.email)
        ]);
      } catch (err) {
        console.warn("Failed to retrieve user details from DB:", err);
      }

      navigate(isSignUp ? "/questionnaire" : "/dashboard");
    } catch {
      setError(
        "Cannot connect to the backend server. Please make sure it is running:\n  node server.js"
      );
    } finally {
      setLoading(false);
    }
  };



  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({ name: "", email: "", password: "", confirmPassword: "" });
    setError("");
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const benefits = [
    "AI-generated resumes in seconds",
    "Real-time ATS optimization scoring",
    "Personalized learning roadmaps",
    "Mock interviews with voice AI",
  ];

  return (
    <>


      <div className="min-h-screen flex">
        {/* Left Panel — branding + benefits (hidden on small screens) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900/60 via-purple-900/50 to-slate-900 flex-col justify-between p-12 border-r border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_60%)]" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">HireTwin AI</span>
            </div>

            <div className="mb-12">
              <h1 className="text-white text-5xl font-bold leading-tight mb-6">
                {isSignUp ? "Start your career\ntransformation" : "Welcome back\nto your future"}
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                {isSignUp
                  ? "Build your complete career identity with AI — no resume needed to get started."
                  : "Your AI-powered career co-pilot is ready to help you land your next role."}
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-slate-300">{b}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-slate-300 text-sm ml-2">4.9 / 5 from 12,000+ users</span>
            </div>
            <p className="text-slate-400 text-sm italic">
              "HireTwin helped me land my dream AI Engineer role in 3 weeks."
            </p>
            <p className="text-slate-500 text-sm mt-1">— Priya R., AI Engineer at Google</p>
          </div>
        </div>

        {/* Right Panel — auth form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xl font-bold">HireTwin AI</span>
            </div>

            <div className="mb-8">
              {isSignUp ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Create your free account
                  </div>
                  <h2 className="text-white text-3xl font-bold mb-2">Get started today</h2>
                  <p className="text-slate-400">Build your AI-powered career profile in minutes.</p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/15 border border-green-500/30 rounded-full text-green-300 text-sm mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isReturningUser ? "Welcome back!" : "Sign in to your account"}
                  </div>
                  <h2 className="text-white text-3xl font-bold mb-2">
                    {isReturningUser ? "Good to see you again" : "Sign in"}
                  </h2>
                  <p className="text-slate-400">
                    {isReturningUser
                      ? "Your career journey continues where you left off."
                      : "Enter your credentials to access your dashboard."}
                  </p>
                </>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isReturningUser ? (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase shrink-0">
                    {returningUser?.name?.charAt(0) || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-white font-bold text-lg truncate">Welcome back, {returningUser?.name}!</h4>
                    <p className="text-slate-400 text-xs truncate">{returningUser?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full px-5 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-slate-600 focus:outline-none transition-colors ${
                        errors.password ? "border-red-500" : "border-white/10 focus:border-purple-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end mb-4">
                  <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button
                  onClick={handleAuth}
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:scale-[1.02] transition-all mb-5 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing you in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("hiretwin_user");
                    setIsReturningUser(false);
                    setIsSignUp(true);
                    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  }}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                >
                  Use a different account / Register new profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4 mb-5">
                  {isSignUp && (
                    <div>
                      <label className="block text-slate-300 text-sm mb-1.5 ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Kandhavel Saravanan"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-5 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-slate-600 focus:outline-none transition-colors ${
                          errors.name ? "border-red-500" : "border-white/10 focus:border-purple-500"
                        }`}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleEmailCheck(formData.email)}
                      className={`w-full px-5 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-slate-600 focus:outline-none transition-colors ${
                        errors.email ? "border-red-500" : "border-white/10 focus:border-purple-500"
                      }`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={isSignUp ? "Min. 8 characters" : "Enter your password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`w-full px-5 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-slate-600 focus:outline-none transition-colors ${
                          errors.password ? "border-red-500" : "border-white/10 focus:border-purple-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-slate-300 text-sm mb-1.5 ml-1">Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`w-full px-5 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-slate-600 focus:outline-none transition-colors ${
                          errors.confirmPassword ? "border-red-500" : "border-white/10 focus:border-purple-500"
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}
                </div>

                {!isSignUp && (
                  <div className="flex justify-end mb-4">
                    <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAuth}
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:scale-[1.02] transition-all mb-5 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isSignUp ? "Creating your account..." : "Signing you in..."}
                    </>
                  ) : (
                    <>
                      {isSignUp ? "Create Free Account" : "Sign In"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>



                <p className="text-center text-slate-400 text-sm">
                  {isSignUp ? "Already have an account?" : "New to HireTwin AI?"}{" "}
                  <button onClick={switchMode} className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                    {isSignUp ? "Sign in instead" : "Create a free account"}
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
