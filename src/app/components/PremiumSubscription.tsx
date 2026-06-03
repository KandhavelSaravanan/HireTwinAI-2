import { useNavigate } from "react-router";
import { ArrowLeft, Crown, Check, Sparkles, Zap, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    gradient: "from-slate-700 to-slate-600",
    features: [
      { text: "3 resumes per month", included: true },
      { text: "Basic ATS analysis", included: true },
      { text: "Career predictions", included: true },
      { text: "5 mock interviews", included: true },
      { text: "Portfolio generator", included: false },
      { text: "LinkedIn optimization", included: false },
      { text: "Unlimited resumes", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
    ],
    popular: false,
    cta: "Current Plan",
  },
  {
    name: "Premium",
    price: "$19",
    period: "per month",
    description: "For serious job seekers",
    gradient: "from-blue-600 to-purple-600",
    features: [
      { text: "Unlimited resumes", included: true },
      { text: "Advanced ATS analysis", included: true },
      { text: "Detailed career predictions", included: true },
      { text: "20 mock interviews", included: true },
      { text: "Portfolio generator", included: true },
      { text: "LinkedIn optimization", included: true },
      { text: "Skill gap analysis", included: true },
      { text: "Learning roadmap", included: true },
      { text: "Email support", included: true },
    ],
    popular: true,
    cta: "Upgrade to Premium",
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For career transformation",
    gradient: "from-yellow-500 to-orange-500",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Unlimited mock interviews", included: true },
      { text: "1-on-1 AI career coaching", included: true },
      { text: "Custom portfolio domain", included: true },
      { text: "Interview guarantee program", included: true },
      { text: "Job application tracking", included: true },
      { text: "Salary negotiation AI", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "Career success metrics", included: true },
    ],
    popular: false,
    cta: "Upgrade to Pro",
  },
];

export function PremiumSubscription() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem("hiretwin_user");
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePlanSelect = (plan: any) => {
    if (plan.name === "Free") {
      if (user) {
        const updated = { ...user, subscriptionStatus: "Free" };
        localStorage.setItem("hiretwin_user", JSON.stringify(updated));
      }
      toast.success("Subscribed to Free Plan!");
      navigate("/profile");
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePay = () => {
    if (paymentMethod === "card") {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc) {
        toast.error("Please fill in all card details.");
        return;
      }
    } else {
      if (!upiId) {
        toast.error("Please enter your UPI ID.");
        return;
      }
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      
      if (user) {
        const updatedUser = { ...user, subscriptionStatus: selectedPlan.name };
        localStorage.setItem("hiretwin_user", JSON.stringify(updatedUser));
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      toast.success(`Welcome to ${selectedPlan.name}!`);
    }, 2500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white">Premium Plans</h3>
              <p className="text-slate-400 text-sm">Unlock your full career potential</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white mb-6">
              <Crown className="w-4 h-4" />
              <span className="text-sm">Limited Time Offer: 50% Off First Month</span>
            </div>

            <h1 className="text-5xl text-white mb-4" style={{ fontWeight: 800 }}>
              Choose Your Career Growth Plan
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of professionals who landed their dream jobs with HireTwin AI
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative bg-white/5 backdrop-blur-sm border rounded-3xl p-8 ${
                  plan.popular
                    ? "border-purple-500 shadow-2xl shadow-purple-500/20 scale-105"
                    : "border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} mb-4`}>
                    {index === 0 && <Zap className="w-8 h-8 text-white" />}
                    {index === 1 && <Crown className="w-8 h-8 text-white" />}
                    {index === 2 && <Rocket className="w-8 h-8 text-white" />}
                  </div>

                  <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

                  <div className="mb-2">
                    <span className="text-5xl text-white" style={{ fontWeight: 800 }}>
                      {plan.price}
                    </span>
                    <span className="text-slate-400 ml-2">{plan.period}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full px-6 py-4 rounded-2xl mb-8 transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105"
                      : index === 0
                      ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      : "bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:scale-105"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {plan.cta}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-500"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span
                        className={`text-sm ${
                          feature.included ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-12"
          >
            <h2 className="text-white text-center mb-8" style={{ fontWeight: 700 }}>
              Why Upgrade to Premium?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white mb-2">AI-Powered Insights</h3>
                <p className="text-slate-400 text-sm">
                  Get personalized career recommendations and insights powered by advanced AI
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white mb-2">3x Faster Results</h3>
                <p className="text-slate-400 text-sm">
                  Premium members land interviews 3x faster with optimized resumes and preparation
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white mb-2">Interview Guarantee</h3>
                <p className="text-slate-400 text-sm">
                  Get interviews or your money back with our Pro plan guarantee program
                </p>
              </div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-white text-center mb-8" style={{ fontWeight: 700 }}>
              Success Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah Chen",
                  role: "ML Engineer at Google",
                  image: "👩‍💻",
                  quote: "HireTwin AI helped me land my dream job at Google. The mock interviews were game-changing!",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Data Scientist at Meta",
                  image: "👨‍💼",
                  quote: "Went from student to Data Scientist in 4 months. The career roadmap was incredibly valuable.",
                },
                {
                  name: "Priya Sharma",
                  role: "AI Engineer at Amazon",
                  image: "👩‍🔬",
                  quote: "The ATS optimization increased my interview callbacks by 400%. Absolutely worth it!",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <h4 className="text-white">{testimonial.name}</h4>
                      <p className="text-slate-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-white text-center mb-8" style={{ fontWeight: 700 }}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! You can cancel your subscription at any time with no cancellation fees.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and offer invoicing for annual plans.",
                },
                {
                  q: "Is there a money-back guarantee?",
                  a: "Yes! We offer a 30-day money-back guarantee on all paid plans.",
                },
                {
                  q: "Can I upgrade or downgrade my plan?",
                  a: "Absolutely! You can change your plan at any time and we'll prorate the difference.",
                },
              ].map((faq, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h4 className="text-white mb-2" style={{ fontWeight: 600 }}>
                    {faq.q}
                  </h4>
                  <p className="text-slate-400 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !processing && !paymentSuccess && setShowCheckout(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-xl bg-slate-900/95 border border-white/10 rounded-3xl p-8 shadow-2xl z-10"
          >
            {/* Success State */}
            {paymentSuccess ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl text-white font-extrabold mb-3">Payment Successful!</h2>
                <p className="text-slate-300 mb-8 max-w-sm mx-auto">
                  Thank you for upgrading. Your account is now active on the <span className="text-purple-400 font-semibold">{selectedPlan.name}</span> plan.
                </p>
                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setPaymentSuccess(false);
                    navigate("/profile");
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold hover:scale-[1.02] transition-transform"
                >
                  Go to Profile
                </button>
              </div>
            ) : (
              <div>
                {/* Close Button */}
                {!processing && (
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors text-2xl"
                  >
                    &times;
                  </button>
                )}

                {/* Header */}
                <div className="mb-6">
                  <span className={`inline-flex px-3 py-1 bg-gradient-to-r ${selectedPlan.gradient} rounded-full text-xs font-bold text-white mb-2`}>
                    {selectedPlan.name} Plan
                  </span>
                  <h3 className="text-2xl text-white font-bold">Secure Checkout</h3>
                  <p className="text-slate-400 text-sm">Upgrade to unlock all premium capabilities</p>
                </div>

                {/* Plan Summary Card */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-6 flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-bold">{selectedPlan.name} Membership</h4>
                    <p className="text-slate-400 text-xs">Billed monthly. Cancel anytime.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl text-white font-extrabold">{selectedPlan.price}</span>
                    <span className="text-slate-400 text-xs block">/ month</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`py-3.5 rounded-xl font-semibold border flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "card"
                        ? "bg-purple-500/10 border-purple-500 text-purple-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>💳</span> Stripe (Card)
                  </button>
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-3.5 rounded-xl font-semibold border flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "upi"
                        ? "bg-purple-500/10 border-purple-500 text-purple-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>⚡</span> Razorpay (UPI)
                  </button>
                </div>

                {/* Payment Form */}
                {paymentMethod === "card" ? (
                  <div className="space-y-4 mb-8">
                    {/* Card Mockup */}
                    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border border-white/10 rounded-2xl p-6 shadow-xl mb-6 overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex justify-between items-start mb-10">
                        <span className="text-slate-300 text-sm font-semibold tracking-widest">SECURE CARD</span>
                        <Crown className="w-6 h-6 text-yellow-300" />
                      </div>
                      <div className="text-white text-xl tracking-widest font-mono mb-6">
                        {cardData.number || "•••• •••• •••• ••••"}
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-[10px] text-slate-300 block uppercase">Card Holder</span>
                          <span className="text-sm text-white font-bold tracking-wide truncate max-w-[200px] block">
                            {cardData.name || "YOUR NAME"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-300 block uppercase">Expires</span>
                          <span className="text-sm text-white font-mono font-bold">
                            {cardData.expiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div>
                      <label className="block text-slate-300 text-xs mb-1.5 ml-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors front-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs mb-1.5 ml-1">Card Holder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 text-xs mb-1.5 ml-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          disabled={processing}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-xs mb-1.5 ml-1">CVC / CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                          disabled={processing}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 mb-8 text-center">
                    {/* QR Code Mockup */}
                    <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-lg flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-full border-4 border-slate-900 rounded-lg flex flex-col justify-between p-1">
                        <div className="flex justify-between">
                          <div className="w-10 h-10 border-4 border-slate-900 bg-slate-900" />
                          <div className="w-10 h-10 border-4 border-slate-900 bg-slate-900" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-900 tracking-wider">RAZORPAY SECURE</div>
                        <div className="flex justify-between items-end">
                          <div className="w-10 h-10 border-4 border-slate-900 bg-slate-900" />
                          <div className="w-8 h-8 bg-slate-300 border border-slate-400" />
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs max-w-xs mx-auto">
                      Scan the QR code using any UPI app or enter your UPI ID below.
                    </p>

                    <div className="text-left">
                      <label className="block text-slate-300 text-xs mb-1.5 ml-1">UPI ID</label>
                      <input
                        type="text"
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-center"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Secured Payment...
                    </>
                  ) : (
                    <>Pay {selectedPlan.price} Now</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
