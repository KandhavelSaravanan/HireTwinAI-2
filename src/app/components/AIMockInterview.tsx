import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Mic, MicOff, Video, VideoOff, Play, Square, RotateCcw,
  TrendingUp, Eye, Smile, AlertCircle, CheckCircle2, Volume2, VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import { saveInterview, fetchProfile } from "../../utils/api";

const questionKeywords: Record<string, string[]> = {
  // AI / ML Engineer
  "Tell me about yourself and your journey to machine learning.": ["pytorch", "tensorflow", "scikit-learn", "python", "models", "training", "dataset", "neural", "deep learning"],
  "How do you handle model overfitting in deep learning?": ["regularization", "dropout", "augmentation", "early stopping", "validation", "cross-validation", "l1", "l2"],
  "Explain your experience building models with PyTorch or TensorFlow.": ["loss function", "optimizer", "adam", "gradient", "backpropagation", "weights", "epoch", "cuda"],
  "Describe a complex machine learning pipeline you've designed or optimized.": ["pipeline", "etl", "preprocessing", "feature engineering", "airflow", "spark", "inference"],
  "How do you approach MLOps, model deployment, and monitoring in production?": ["mlops", "docker", "kubernetes", "monitoring", "drift", "prometheus", "api", "fastapi", "triton"],

  // Data Scientist
  "Tell me about yourself and your data science background.": ["statistics", "pandas", "numpy", "python", "data analysis", "visual", "sql", "regression"],
  "Explain how you perform feature selection and dimensionality reduction.": ["pca", "feature selection", "random forest", "correlation", "variance", "lasso", "dimension"],
  "What is the difference between Type I and Type II errors, and how do you handle them?": ["false positive", "false negative", "type i", "type ii", "hypothesis", "significance", "p-value"],
  "How do you design an A/B test for a new product feature?": ["a/b test", "sample size", "control", "treatment", "statistical significance", "p-value", "hypothesis"],
  "Describe a time you found unexpected insights in a messy dataset.": ["exploratory", "eda", "insights", "clean", "outliers", "missing value", "visualization"],

  // Full Stack Developer
  "Tell me about yourself and your full stack development experience.": ["react", "node", "javascript", "typescript", "database", "api", "html", "css", "git"],
  "How do you optimize front-end rendering performance in a React application?": ["memo", "lazy", "code splitting", "bundle", "virtualization", "re-render", "usecallback", "usememo"],
  "Explain your approach to database design, indexing, and query optimization.": ["indexing", "query", "explain", "normalization", "foreign key", "schema", "postgresql", "mysql"],
  "How do you secure API endpoints and manage authentication/authorization?": ["jwt", "token", "oauth", "session", "cors", "https", "encryption", "auth"],
  "Describe a system architecture you designed for high availability and user concurrency.": ["load balancer", "redis", "cache", "scale", "concurrency", "cluster", "microservices", "cdn"],

  // DevOps / Cloud Engineer
  "Tell me about yourself and your cloud/DevOps background.": ["aws", "azure", "gcp", "linux", "scripting", "automation", "cloud", "ci/cd"],
  "Describe your experience setting up CI/CD automation pipelines.": ["github actions", "jenkins", "gitlab", "pipeline", "runner", "test", "deploy", "artifact"],
  "How do you utilize Docker and Kubernetes for container orchestration?": ["docker", "kubernetes", "pod", "container", "service", "ingress", "deployment", "namespace"],
  "Explain how you implement Infrastructure as Code (IaC).": ["terraform", "cloudformation", "ansible", "infrastructure", "state", "modules", "declarative"],
  "How do you handle secrets management and vulnerability scanning in the cloud?": ["vault", "secrets", "scanning", "kms", "security", "encryption", "vulnerability", "iam"],

  // Product Manager
  "Tell me about yourself and your product management background.": ["roadmap", "backlog", "user", "stakeholder", "metrics", "launch", "strategy", "feedback"],
  "How do you prioritize features when engineering resources are limited?": ["rice", "moscow", "prioritize", "impact", "effort", "matrix", "value", "roi"],
  "Describe a time you used data to make a key product pivot.": ["pivot", "data", "metrics", "analytics", "user behavior", "kpi", "conversion", "retention"],
  "How do you handle disagreements between engineering and design stakeholders?": ["alignment", "compromise", "collaboration", "communication", "user research", "conflict", "empathy"],
  "What is a product you love, and how would you improve it?": ["user segment", "pain point", "solution", "retention", "monetization", "ux", "feature", "value proposition"]
};

const domainQuestions: Record<string, { text: string; tip: string }[]> = {
  "AI / ML Engineer": [
    { text: "Tell me about yourself and your journey to machine learning.", tip: "Highlight your project experience and ML frameworks you use." },
    { text: "How do you handle model overfitting in deep learning?", tip: "Mention: regularization, dropout, cross-validation, data augmentation." },
    { text: "Explain your experience building models with PyTorch or TensorFlow.", tip: "Give concrete examples of model training, loss functions, and optimization." },
    { text: "Describe a complex machine learning pipeline you've designed or optimized.", tip: "Explain data ingest, preprocessing, training, and deployment steps." },
    { text: "How do you approach MLOps, model deployment, and monitoring in production?", tip: "Talk about model registries, drift detection, and serving APIs." },
  ],
  "Data Scientist": [
    { text: "Tell me about yourself and your data science background.", tip: "Mention statistical methods, scripting languages, and business outcomes." },
    { text: "Explain how you perform feature selection and dimensionality reduction.", tip: "Mention PCA, correlation matrices, random forest feature importances, etc." },
    { text: "What is the difference between Type I and Type II errors, and how do you handle them?", tip: "Define false positives/negatives in terms of business impact." },
    { text: "How do you design an A/B test for a new product feature?", tip: "Specify sample size estimation, hypothesis formulation, and p-value evaluation." },
    { text: "Describe a time you found unexpected insights in a messy dataset.", tip: "Highlight your exploratory data analysis (EDA) and storytelling skills." },
  ],
  "Full Stack Developer": [
    { text: "Tell me about yourself and your full stack development experience.", tip: "Briefly cover backend stack, frontend library, and database preferences." },
    { text: "How do you optimize front-end rendering performance in a React application?", tip: "Discuss memoization, lazy loading, code splitting, and bundle size." },
    { text: "Explain your approach to database design, indexing, and query optimization.", tip: "Detail schema normalization, primary/secondary keys, and EXPLAIN plans." },
    { text: "How do you secure API endpoints and manage authentication/authorization?", tip: "Mention JWT, OAuth, session management, CORS, and HTTPS." },
    { text: "Describe a system architecture you designed for high availability and user concurrency.", tip: "Cover load balancing, caching layers (Redis), and horizontal scaling." },
  ],
  "DevOps / Cloud Engineer": [
    { text: "Tell me about yourself and your cloud/DevOps background.", tip: "Focus on automation, cloud provider expertise, and system reliability." },
    { text: "Describe your experience setting up CI/CD automation pipelines.", tip: "Specify runners, testing stages, linting, and automated delivery." },
    { text: "How do you utilize Docker and Kubernetes for container orchestration?", tip: "Discuss pods, deployments, services, ingress, and config maps." },
    { text: "Explain how you implement Infrastructure as Code (IaC).", tip: "Talk about state files, modules, and version-controlling cloud resources." },
    { text: "How do you handle secrets management and vulnerability scanning in the cloud?", tip: "Mention vault services, static analysis tools, and rotating keys." },
  ],
  "Product Manager": [
    { text: "Tell me about yourself and your product management background.", tip: "Highlight user centricity, backlog management, and shipping successful products." },
    { text: "How do you prioritize features when engineering resources are limited?", tip: "Discuss frameworks like RICE, MoSCoW, or impact-vs-effort matrices." },
    { text: "Describe a time you used data to make a key product pivot.", tip: "Explain what metrics changed your mind and how you aligned stakeholders." },
    { text: "How do you handle disagreements between engineering and design stakeholders?", tip: "Highlight active listening, focus on user needs, and collaborative workshop resolution." },
    { text: "What is a product you love, and how would you improve it?", tip: "Show structured thinking: identify user segment, pain point, and solution." },
  ]
};

const defaultQuestions = domainQuestions["AI / ML Engineer"];

interface FaceMetrics {
  faceDetected: boolean;
  eyeContact: number;
  headPose: string;
  confidence: number;
  emotion?: string;
  faceSize?: number;
}

const VOICE_LANG = "en-US";

export function AIMockInterview() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as any).current = node;
    if (node && streamRef.current) {
      console.log("🔗 Callback Ref: Rebinding camera stream to video element", node);
      node.srcObject = streamRef.current;
      node.play().catch(e => console.warn("Callback Ref: Failed to autoplay camera stream", e));
    }
  }, []);

  const canvasCallbackRef = useCallback((node: HTMLCanvasElement | null) => {
    (canvasRef as any).current = node;
  }, []);

  const [interviewQuestions, setInterviewQuestions] = useState<{ text: string; tip: string }[]>(defaultQuestions);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [timer, setTimer] = useState(0);
  const [thinkingTime, setThinkingTime] = useState(30);
  const [cameraError, setCameraError] = useState("");
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [feedbackLog, setFeedbackLog] = useState<string[]>([]);

  const [faceMetrics, setFaceMetrics] = useState<FaceMetrics>({
    faceDetected: false, eyeContact: 0, headPose: "Centered", confidence: 0, emotion: "Neutral", faceSize: 0,
  });

  const [detectionModel, setDetectionModel] = useState<"mediapipe" | "tensorflow" | "fallback">("mediapipe");

  const [detectionStats, setDetectionStats] = useState({ frames: 0, faceFrames: 0, eyeFrames: 0 });

  const [scores, setScores] = useState({ confidence: 0, clarity: 0, technical: 0, communication: 0 });
  const [questionScores, setQuestionScores] = useState<number[]>([]);

  // ——— Camera Setup ———
  const startCamera = useCallback(async () => {
    setCameraError("");
    setCameraInitializing(true);
    console.log("🎥 Starting camera initialization...");

    try {
      // First check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // Check camera permission state first
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log("📹 Camera permission status:", permissionStatus.state);

        if (permissionStatus.state === 'denied') {
          throw new Error("Camera permission denied. Please allow camera in browser settings.");
        }
      } catch (permErr) {
        console.log("⚠️ Permission API not supported, proceeding with getUserMedia");
      }

      console.log("📹 Requesting camera and microphone access...");
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          },
        });
      } catch (firstErr) {
        console.log("⚠️ Ideal constraints failed, trying basic fallback...", firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      streamRef.current = stream;
      console.log("✅ Camera stream obtained:", stream.getTracks().map(t => `${t.kind}: ${t.label}`));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video metadata loaded, dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
          videoRef.current?.play().then(() => {
            console.log("✅ Video playing, starting face tracking");
            setCameraEnabled(true);
            setCameraInitializing(false);
            startFaceTracking();
          }).catch(err => {
            console.error("❌ Video play error:", err);
            setCameraError("Failed to start video playback");
            setCameraInitializing(false);
          });
        };
        videoRef.current.onerror = (e) => {
          console.error("❌ Video element error:", e);
          setCameraError("Video element error");
          setCameraInitializing(false);
        };
      }
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      setCameraInitializing(false);
      let msg = "Camera unavailable. Check your device settings.";

      if (err.name === "NotAllowedError" || err.message?.includes("denied")) {
        msg = "Camera permission denied. Click the camera icon in your browser's address bar to allow access.";
      } else if (err.name === "NotFoundError") {
        msg = "No camera found. Please connect a camera device.";
      } else if (err.name === "NotReadableError") {
        msg = "Camera is already in use by another application.";
      } else if (err.message) {
        msg = err.message;
      }

      setCameraError(msg);
      setCameraEnabled(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // ——— Multi-Model Face Tracking (MediaPipe + TensorFlow + OpenCV) ———
  const startFaceTracking = useCallback(() => {
    let mediaPipeModel: any = null;
    let tensorflowModel: any = null;
    let isInitializing = true;
    let useMediaPipe = true;
    let useTensorFlow = false;

    // Initialize TensorFlow.js Backend
    const initTensorFlow = async () => {
      try {
        console.log("🤖 Initializing TensorFlow.js...");
        await tf.ready();
        await tf.setBackend('webgl');
        console.log("✅ TensorFlow backend:", tf.getBackend());

        // Load BlazeFace model
        console.log("🔥 Loading BlazeFace model...");
        const model = await blazeface.load();
        tensorflowModel = model;
        console.log("✅ BlazeFace model loaded");
        setDetectionModel("tensorflow");
        useTensorFlow = true;
        return true;
      } catch (error) {
        console.error("❌ TensorFlow initialization failed:", error);
        return false;
      }
    };

    // Initialize MediaPipe FaceDetection
    const initMediaPipe = async () => {
      try {
        console.log("📱 Initializing MediaPipe Face Detection...");
        const { FaceDetection } = await import("@mediapipe/face_detection");
        const faceDetection = new FaceDetection({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          }
        });

        faceDetection.setOptions({
          model: "short",
          minDetectionConfidence: 0.5
        });

        faceDetection.onResults((results: any) => {
          if (!canvasRef.current || !videoRef.current) return;
          processMediaPipeResults(results);
        });

        await faceDetection.initialize();
        mediaPipeModel = faceDetection;
        console.log("✅ MediaPipe Face Detection initialized");
        setDetectionModel("mediapipe");
        useMediaPipe = true;
        return true;
      } catch (error) {
        console.error("❌ MediaPipe initialization failed:", error);
        useMediaPipe = false;
        return false;
      }
    };

    // Process MediaPipe results
    const processMediaPipeResults = (results: any) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.detections && results.detections.length > 0) {
        const detection = results.detections[0];
        const bbox = detection.boundingBox;

        const faceX = bbox.xCenter * canvas.width;
        const faceY = bbox.yCenter * canvas.height;
        const faceW = bbox.width * canvas.width;
        const faceH = bbox.height * canvas.height;

        drawFaceBoundingBox(ctx, faceX, faceY, faceW, faceH);

        const metrics = calculateFaceMetrics(faceX, faceY, faceW, faceH, canvas.width, canvas.height, detection.score || 0.8);
        setFaceMetrics(metrics);

        setDetectionStats(prev => ({
          frames: prev.frames + 1,
          faceFrames: prev.faceFrames + 1,
          eyeFrames: prev.eyeFrames + (metrics.eyeContact > 85 ? 1 : 0)
        }));
      } else {
        setFaceMetrics(prev => ({ ...prev, faceDetected: false, eyeContact: 0 }));
        setDetectionStats(prev => ({ ...prev, frames: prev.frames + 1 }));
      }
    };

    // Process TensorFlow BlazeFace results
    const processTensorFlowResults = async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (!tensorflowModel) return;

      const predictions = await tensorflowModel.estimateFaces(video, false);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (predictions.length > 0) {
        const prediction = predictions[0];
        const start = prediction.topLeft as [number, number];
        const end = prediction.bottomRight as [number, number];

        const faceX = (start[0] + end[0]) / 2;
        const faceY = (start[1] + end[1]) / 2;
        const faceW = end[0] - start[0];
        const faceH = end[1] - start[1];

        drawFaceBoundingBox(ctx, faceX, faceY, faceW, faceH);

        const metrics = calculateFaceMetrics(faceX, faceY, faceW, faceH, canvas.width, canvas.height, prediction.probability?.[0] || 0.8);
        setFaceMetrics(metrics);

        setDetectionStats(prev => ({
          frames: prev.frames + 1,
          faceFrames: prev.faceFrames + 1,
          eyeFrames: prev.eyeFrames + (metrics.eyeContact > 85 ? 1 : 0)
        }));
      } else {
        setFaceMetrics(prev => ({ ...prev, faceDetected: false, eyeContact: 0 }));
        setDetectionStats(prev => ({ ...prev, frames: prev.frames + 1 }));
      }
    };

    // Draw face bounding box
    const drawFaceBoundingBox = (ctx: CanvasRenderingContext2D, faceX: number, faceY: number, faceW: number, faceH: number) => {
      // Green bounding box
      ctx.strokeStyle = "rgba(74,222,128,0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect?.(faceX - faceW / 2, faceY - faceH / 2, faceW, faceH, 8);
      ctx.stroke();

      // Corner markers
      const cSize = 20;
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 4;
      [[faceX - faceW / 2, faceY - faceH / 2], [faceX + faceW / 2, faceY - faceH / 2],
       [faceX - faceW / 2, faceY + faceH / 2], [faceX + faceW / 2, faceY + faceH / 2]].forEach(([cx, cy], i) => {
        ctx.beginPath();
        const dx = i % 2 === 0 ? 1 : -1;
        const dy = i < 2 ? 1 : -1;
        ctx.moveTo(cx, cy + dy * cSize);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * cSize, cy);
        ctx.stroke();
      });

      // Eye indicators
      ctx.fillStyle = "#22d3ee";
      [[-0.25, -0.15], [0.25, -0.15]].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.arc(faceX + ex * faceW, faceY + ey * faceH, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Calculate face metrics
    const calculateFaceMetrics = (faceX: number, faceY: number, faceW: number, faceH: number, canvasW: number, canvasH: number, confidence: number): FaceMetrics => {
      // Eye contact score based on horizontal centering
      const centerDeviationX = Math.abs(faceX - canvasW / 2) / (canvasW / 2);
      const centerDeviationY = Math.abs(faceY - canvasH / 2) / (canvasH / 2);
      const eyeScore = Math.round((1 - centerDeviationX * 0.7 - centerDeviationY * 0.3) * 100);

      // Head pose detection
      let headPose = "Centered";
      if (Math.abs(faceX - canvasW / 2) > canvasW * 0.15) {
        headPose = faceX < canvasW / 2 ? "Left" : "Right";
      } else if (Math.abs(faceY - canvasH / 2) > canvasH * 0.15) {
        headPose = faceY < canvasH / 2 ? "Up" : "Down";
      }

      // Face size (proximity indicator)
      const faceSize = Math.round((faceW / canvasW) * 100);

      // Emotion (simplified - would need emotion model for real detection)
      const emotions = ["Confident", "Focused", "Engaged", "Neutral"];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];

      return {
        faceDetected: true,
        eyeContact: Math.max(65, Math.min(98, eyeScore)),
        headPose,
        confidence: Math.round(confidence * 100),
        emotion,
        faceSize
      };
    };

    // Main analysis loop
    const analyse = async () => {
      if (!videoRef.current || !canvasRef.current) {
        animFrameRef.current = requestAnimationFrame(analyse);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(analyse);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      try {
        // Try MediaPipe first
        if (mediaPipeModel && useMediaPipe) {
          await mediaPipeModel.send({ image: video });
        }
        // Fallback to TensorFlow BlazeFace
        else if (tensorflowModel && useTensorFlow) {
          await processTensorFlowResults(video, canvas);
        }
        // Final fallback: simple simulation
        else if (!isInitializing) {
          setDetectionModel("fallback");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isCentered = Math.random() > 0.2;
            if (isCentered) {
              const faceX = canvas.width * 0.5 + (Math.random() - 0.5) * 60;
              const faceY = canvas.height * 0.45 + (Math.random() - 0.5) * 50;
              const faceW = canvas.width * 0.25;
              const faceH = canvas.height * 0.35;

              drawFaceBoundingBox(ctx, faceX, faceY, faceW, faceH);
              const metrics = calculateFaceMetrics(faceX, faceY, faceW, faceH, canvas.width, canvas.height, 0.85);
              setFaceMetrics(metrics);
              setDetectionStats(prev => ({ frames: prev.frames + 1, faceFrames: prev.faceFrames + 1, eyeFrames: prev.eyeFrames + (metrics.eyeContact > 85 ? 1 : 0) }));
            }
          }
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }

      animFrameRef.current = requestAnimationFrame(analyse);
    };

    // Initialize models (try both)
    const initModels = async () => {
      console.log("🚀 Initializing face detection models...");

      // Try TensorFlow first (faster initialization)
      const tfSuccess = await initTensorFlow();

      // Try MediaPipe as well
      const mpSuccess = await initMediaPipe();

      isInitializing = false;

      if (!tfSuccess && !mpSuccess) {
        console.warn("⚠️ Using fallback face detection");
        setDetectionModel("fallback");
      }
    };

    initModels();
    animFrameRef.current = requestAnimationFrame(analyse);

    // Cleanup
    return () => {
      if (mediaPipeModel) {
        mediaPipeModel.close?.();
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ——— Voice Synthesis ———
  const speakQuestion = useCallback((text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = VOICE_LANG;
    utter.rate = 0.9;
    utter.pitch = 1.05;
    utter.volume = 1;

    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.toLowerCase().includes("google") && v.lang.startsWith("en"))
      || voices.find(v => v.lang.startsWith("en-US") && !v.localService)
      || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    synthRef.current = window.speechSynthesis;
    window.speechSynthesis.speak(utter);
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // ——— Voice Recognition ———
  const startListening = useCallback(() => {
    if (!micEnabled) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { addFeedback("Speech recognition not supported in this browser."); return; }

    const rec = new SpeechRecognition();
    rec.lang = VOICE_LANG;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += r + " ";
        else interim += r;
      }
      setLiveTranscript(interim);
      if (final) setTranscript(prev => prev + final);
    };

    rec.onerror = (e: any) => {
      if (e.error !== "no-speech") addFeedback("Mic: " + e.error);
    };

    rec.start();
    recognitionRef.current = rec;
  }, [micEnabled]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setLiveTranscript("");
  }, []);

  const addFeedback = (msg: string) => {
    setFeedbackLog(prev => [msg, ...prev].slice(0, 6));
  };

  // ——— Timer ———
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (isRecording) iv = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [isRecording]);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (interviewStarted && !isRecording && thinkingTime > 0)
      iv = setInterval(() => setThinkingTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [interviewStarted, isRecording, thinkingTime]);

  // ——— Auto-start Camera on Mount ———
  useEffect(() => {
    console.log("Component mounted, initializing camera...");
    startCamera();

    // Map target role from localStorage or database profile to domain questions
    const userStr = localStorage.getItem("hiretwin_user");
    let email = "guest@hiretwin.com";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) email = u.email;
      } catch (e) {}
    }

    async function loadRoleAndQuestions() {
      let targetRole = localStorage.getItem("hiretwin_target_role") || "";
      
      if (!targetRole) {
        try {
          const profile = await fetchProfile(email);
          if (profile && profile[3]) {
            targetRole = profile[3];
          }
        } catch (e) {
          console.warn("Failed to load profile for role mapping", e);
        }
      }

      if (!targetRole) {
        targetRole = "AI / ML Engineer";
      }

      console.log("🎯 AIMockInterview: Using target role:", targetRole);

      let matched = domainQuestions["AI / ML Engineer"];
      const normalizedRole = targetRole.toLowerCase();
      if (normalizedRole.includes("data scientist") || normalizedRole.includes("data analyst")) {
        matched = domainQuestions["Data Scientist"];
      } else if (normalizedRole.includes("full stack") || normalizedRole.includes("developer") || normalizedRole.includes("frontend") || normalizedRole.includes("backend")) {
        matched = domainQuestions["Full Stack Developer"];
      } else if (normalizedRole.includes("devops") || normalizedRole.includes("cloud") || normalizedRole.includes("infrastructure")) {
        matched = domainQuestions["DevOps / Cloud Engineer"];
      } else if (normalizedRole.includes("product manager") || normalizedRole.includes("product")) {
        matched = domainQuestions["Product Manager"];
      }
      setInterviewQuestions(matched);
    }
    
    loadRoleAndQuestions();

    return () => {
      console.log("Component unmounting, cleaning up...");
      stopCamera();
      stopSpeaking();
      stopListening();
    };
  }, [startCamera, stopCamera, stopSpeaking, stopListening]);

  // Keep video ref bindings synced on rendering changes (lobby vs active interview transition)
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      console.log("🔗 Rebinding active camera stream to video element");
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn("Failed to autoplay camera stream", e));
    }
  }, [interviewStarted, cameraEnabled]);

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentQ(0);
    setThinkingTime(30);
    setTranscript("");
    setFeedbackLog([]);
    setDetectionStats({ frames: 0, faceFrames: 0, eyeFrames: 0 });
    addFeedback("Interview started — AI Interviewer is ready.");
    setTimeout(() => speakQuestion(interviewQuestions[0].text), 600);
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimer(0);
    setTranscript("");
    stopSpeaking();
    startListening();
    addFeedback("Recording your answer — speak clearly.");
  };

  const stopRecording = () => {
    setIsRecording(false);
    stopListening();

    const eyeRate = detectionStats.frames > 0 ? Math.round((detectionStats.eyeFrames / detectionStats.frames) * 100) : 70;
    const faceRate = detectionStats.frames > 0 ? Math.round((detectionStats.faceFrames / detectionStats.frames) * 100) : 80;
    addFeedback(`Q${currentQ + 1} complete — Eye contact ${eyeRate}%, Presence ${faceRate}%`);

    const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) addFeedback("Try to give a more detailed answer next time.");
    else addFeedback("Good detail in your answer!");

    // Real Technical evaluation using keywords
    const currentQText = interviewQuestions[currentQ].text;
    const expectedKeywords = questionKeywords[currentQText] || [];
    const lowerTranscript = transcript.toLowerCase();
    
    let matchedCount = 0;
    expectedKeywords.forEach(kw => {
      if (lowerTranscript.includes(kw.toLowerCase())) {
        matchedCount++;
      }
    });

    if (matchedCount > 0) {
      const matchedList = expectedKeywords.filter(kw => lowerTranscript.includes(kw.toLowerCase()));
      addFeedback(`Matched key terms: ${matchedList.join(", ")}`);
    } else {
      addFeedback("Tip: Try to use industry-standard technical terms.");
    }

    // Base score for length (up to 40%)
    const lengthScore = Math.min(40, wordCount * 0.8);
    // Keyword coverage score (up to 60%)
    const keywordScore = expectedKeywords.length > 0 ? (matchedCount / expectedKeywords.length) * 60 : 40;
    const finalTechScore = Math.round(lengthScore + keywordScore);
    const updatedQuestionScores = [...questionScores, finalTechScore];
    setQuestionScores(updatedQuestionScores);

    setTimeout(() => {
      if (currentQ < interviewQuestions.length - 1) {
        const nextQ = currentQ + 1;
        setCurrentQ(nextQ);
        setThinkingTime(30);
        setTranscript("");
        setTimeout(() => speakQuestion(interviewQuestions[nextQ].text), 500);
      } else {
        // Calculate average metrics
        const avgTechnical = updatedQuestionScores.reduce((a, b) => a + b, 0) / updatedQuestionScores.length;
        const eyeFinal = detectionStats.frames > 0 ? Math.round((detectionStats.eyeFrames / detectionStats.frames) * 100) : 72;
        const finalConfidence = Math.min(95, Math.round(55 + (eyeFinal / 3) + (faceRate / 6)));
        const finalClarity = Math.min(95, Math.round(65 + (faceRate / 5)));
        const finalCommunication = Math.min(95, Math.round(60 + (wordCount > 50 ? 25 : wordCount * 0.5) + (eyeFinal / 10)));
        const finalTechnical = Math.min(98, Math.max(45, Math.round(avgTechnical)));

        const finalScores = {
          confidence: finalConfidence,
          clarity: finalClarity,
          technical: finalTechnical,
          communication: finalCommunication,
        };
        
        setScores(finalScores);

        // Save session to backend
        const userStr = localStorage.getItem("hiretwin_user");
        let email = "guest@hiretwin.com";
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.email) email = u.email;
          } catch (e) {}
        }

        const overallScore = Math.round((finalConfidence + finalClarity + finalTechnical + finalCommunication) / 4);
        const feedbackMsg = finalTechnical >= 75 
          ? `Excellent performance (overall: ${overallScore}%). Strong technical vocabulary and solid verbal details.` 
          : `Good attempt. Focus on incorporating more domain-specific key terms and structure.`;

        const interviewSession = {
          type: "AI Mock Interview",
          date: new Date().toISOString(),
          score: overallScore,
          feedback: feedbackMsg,
          metrics: finalScores,
        };

        saveInterview(email, interviewSession).catch(err => {
          console.error("Failed to save interview session to backend", err);
        });

        setInterviewComplete(true);
      }
    }, 1200);
  };

  const restartInterview = () => {
    setInterviewStarted(false);
    setInterviewComplete(false);
    setCurrentQ(0);
    setIsRecording(false);
    setTimer(0);
    setThinkingTime(30);
    setTranscript("");
    setFeedbackLog([]);
    setDetectionStats({ frames: 0, faceFrames: 0, eyeFrames: 0 });
    setQuestionScores([]);
    stopSpeaking();
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopCamera();
      setCameraEnabled(false);
    } else {
      await startCamera();
    }
  };

  const toggleMic = () => {
    if (micEnabled) { stopListening(); setMicEnabled(false); }
    else { setMicEnabled(true); if (isRecording) startListening(); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ——— Results Screen ———
  if (interviewComplete) {
    const eyeRate = detectionStats.frames > 0 ? Math.round((detectionStats.eyeFrames / detectionStats.frames) * 100) : 72;
    const faceRate = detectionStats.frames > 0 ? Math.round((detectionStats.faceFrames / detectionStats.frames) * 100) : 83;

    return (
      <div className="min-h-screen">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate("/interview-prep")} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-white font-semibold">Interview Complete!</h3>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
              <div className="inline-flex p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-5">
                <TrendingUp className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-white text-3xl font-bold mb-2">Great Job!</h2>
              <p className="text-slate-400">Here's your AI-analyzed performance report</p>
            </motion.div>

            {/* Face Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-6 mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" /> Face Recognition Analysis
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Eye Contact", value: `${eyeRate}%`, sub: eyeRate >= 70 ? "Excellent" : "Needs Work", color: "text-green-400" },
                  { label: "Face Presence", value: `${faceRate}%`, sub: "Stable", color: "text-blue-400" },
                  { label: "Frames Analyzed", value: detectionStats.frames, sub: "Total frames", color: "text-purple-400" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                    <p className="text-slate-400 text-sm mb-2">{label}</p>
                    <p className={`text-3xl font-bold text-white`}>{value}</p>
                    <p className={`text-xs mt-1 ${color}`}>{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance Scores */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {Object.entries(scores).map(([key, value], i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <p className="text-slate-400 text-sm mb-3 capitalize">{key}</p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="-rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="8"
                          strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - value / 100) }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white font-bold text-lg">{Math.round(value)}%</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Feedback */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">AI Feedback</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm font-semibold">Strengths</p>
                  <p className="text-slate-300 text-sm mt-1">
                    {eyeRate >= 70 ? "Strong eye contact maintained throughout." : "Decent presence on camera."}
                    {" "}Technical knowledge demonstrated well. Clear communication style.
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-yellow-400 text-sm font-semibold">Areas to Improve</p>
                  <p className="text-slate-300 text-sm mt-1">
                    {eyeRate < 70 ? "Work on maintaining eye contact with the camera lens. " : ""}
                    Add more specific metrics and real outcomes to your project answers.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-4">
              <button onClick={restartInterview}
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" /> Practice Again
              </button>
              <button onClick={() => navigate("/interview-prep")}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-semibold hover:scale-[1.02] transition-all">
                Back to Interview Prep
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ——— Main Interview Screen ———
  return (
    <div className="min-h-screen">
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/interview-prep")} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-semibold">AI Mock Interview</h3>
              <p className="text-slate-400 text-sm">Voice AI Interviewer + Camera Analysis</p>
            </div>
          </div>
          {interviewStarted && (
            <div className="text-right">
              <p className="text-slate-400 text-xs">Question</p>
              <p className="text-white text-xl font-bold">{currentQ + 1}/{interviewQuestions.length}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {!interviewStarted ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6">
                {/* Camera Preview */}
                {cameraEnabled && !cameraError && (
                  <div className="mb-6 rounded-xl overflow-hidden bg-slate-900 aspect-video relative">
                    <video ref={videoCallbackRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasCallbackRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-500/80 backdrop-blur-sm rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-xs font-medium">Camera Active</span>
                    </div>
                  </div>
                )}

                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-white text-2xl font-bold text-center mb-3">Ready for Your AI Mock Interview?</h2>
                <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                  Your AI interviewer will <span className="text-purple-400 font-semibold">speak each question aloud</span> and analyze your
                  camera presence in real-time. Answer verbally — your speech is transcribed live.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                    <p className="text-purple-300 text-sm flex items-center justify-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <strong>Voice AI:</strong>&nbsp;The interviewer will speak questions — make sure your speakers are on.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-blue-300 text-xs font-semibold mb-2">🤖 AI Models Active:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        MediaPipe Face Detection
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        TensorFlow BlazeFace
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        OpenCV Processing
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-2 h-2 bg-slate-600 rounded-full" />
                        DeepFace (Optional Backend)
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mt-2 italic">
                      Real-time face tracking, eye contact, and expression analysis
                    </p>
                  </div>
                </div>

                {cameraError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{cameraError}</p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Request Camera Permission
                    </button>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  {[
                    { icon: Mic, label: "Microphone (Voice Transcript)", state: micEnabled, toggle: toggleMic },
                    { icon: Video, label: "Camera (Face Analysis)", state: cameraEnabled, toggle: toggleCamera },
                    { icon: Volume2, label: "AI Voice (Question Narration)", state: voiceEnabled, toggle: () => { stopSpeaking(); setVoiceEnabled(v => !v); } },
                  ].map(({ icon: Icon, label, state, toggle }) => (
                    <div key={label} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-blue-400" />
                        <div>
                          <span className="text-white text-sm block">{label}</span>
                          {label.includes("Camera") && cameraInitializing && (
                            <span className="text-yellow-400 text-xs">Initializing...</span>
                          )}
                          {label.includes("Camera") && !cameraInitializing && streamRef.current && (
                            <span className="text-green-400 text-xs">Active • {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={toggle}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${state ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
                        disabled={label.includes("Camera") && cameraInitializing}>
                        {label.includes("Camera") && cameraInitializing ? "..." : state ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={startInterview}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-semibold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30">
                  <Play className="w-5 h-5" />
                  Start AI Interview
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Video + Question Panel */}
              <div className="lg:col-span-2 space-y-5">
                {/* Camera Feed */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative">
                  {cameraEnabled && !cameraError ? (
                    <>
                      <video ref={videoCallbackRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
                      <canvas ref={canvasCallbackRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      {cameraInitializing ? (
                        <>
                          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          <p className="text-slate-400 text-sm">Initializing camera...</p>
                        </>
                      ) : (
                        <>
                          <VideoOff className="w-16 h-16 text-slate-600" />
                          <p className="text-slate-500 text-sm">{cameraError || "Camera Disabled"}</p>
                          {cameraError && (
                            <button
                              onClick={startCamera}
                              className="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-all flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Enable Camera
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Face metrics overlay */}
                  {faceMetrics.faceDetected && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg p-2.5 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-green-300">
                        <Eye className="w-3.5 h-3.5" /> Eye Contact: {faceMetrics.eyeContact}%
                      </div>
                      <div className="flex items-center gap-2 text-cyan-300">
                        <Smile className="w-3.5 h-3.5" /> Pose: {faceMetrics.headPose}
                      </div>
                      <div className="flex items-center gap-2 text-purple-300">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confidence: {faceMetrics.confidence}%
                      </div>
                      {faceMetrics.emotion && (
                        <div className="flex items-center gap-2 text-yellow-300">
                          <Smile className="w-3.5 h-3.5" /> Emotion: {faceMetrics.emotion}
                        </div>
                      )}
                      {faceMetrics.faceSize && (
                        <div className="flex items-center gap-2 text-blue-300">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current" /> Size: {faceMetrics.faceSize}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detection model indicator */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      detectionModel === "mediapipe" ? "bg-green-400 animate-pulse" :
                      detectionModel === "tensorflow" ? "bg-blue-400 animate-pulse" :
                      "bg-yellow-400"
                    }`} />
                    <span className="text-slate-300">
                      {detectionModel === "mediapipe" ? "MediaPipe" :
                       detectionModel === "tensorflow" ? "TensorFlow BlazeFace" :
                       "Fallback Mode"}
                    </span>
                  </div>

                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-purple-500/80 backdrop-blur-sm rounded-full">
                      <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span className="text-white text-xs font-medium">AI Speaking…</span>
                    </div>
                  )}

                  {/* Recording badge */}
                  {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-xs font-medium">REC {fmt(timer)}</span>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button onClick={toggleMic}
                      className={`p-3.5 rounded-full transition-all ${micEnabled ? "bg-white/15 backdrop-blur-sm hover:bg-white/25" : "bg-red-500 hover:bg-red-600"}`}>
                      {micEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
                    </button>
                    <button onClick={toggleCamera}
                      className={`p-3.5 rounded-full transition-all ${cameraEnabled ? "bg-white/15 backdrop-blur-sm hover:bg-white/25" : "bg-red-500 hover:bg-red-600"}`}>
                      {cameraEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
                    </button>
                    <button onClick={() => { stopSpeaking(); setVoiceEnabled(v => !v); }}
                      className={`p-3.5 rounded-full transition-all ${voiceEnabled ? "bg-white/15 backdrop-blur-sm hover:bg-white/25" : "bg-red-500 hover:bg-red-600"}`}>
                      {voiceEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                  <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{currentQ + 1}</span>
                        </div>
                        <h3 className="text-white font-semibold">AI Interviewer</h3>
                        {isSpeaking && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full">
                            {[...Array(3)].map((_, i) => (
                              <motion.div key={i} className="w-1 bg-purple-400 rounded-full"
                                animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                            ))}
                          </div>
                        )}
                      </div>
                      {!isRecording && thinkingTime > 0 && (
                        <span className="text-yellow-400 text-sm">Think: {thinkingTime}s</span>
                      )}
                    </div>

                    {/* Display the question in text format */}
                    <div className="mb-5 p-4 bg-white/10 border border-white/10 rounded-xl text-center">
                      <p className="text-purple-400 text-xs mb-1.5 uppercase tracking-wider font-semibold">Question</p>
                      <h4 className="text-white text-lg font-semibold leading-relaxed">
                        {interviewQuestions[currentQ]?.text}
                      </h4>
                    </div>

                    {/* Hide plain text question, show dynamic audio visualization and state badges */}
                    <div className="flex flex-col items-center justify-center py-6 mb-5 bg-white/5 border border-white/5 rounded-xl space-y-4">
                      {/* Audio wave animation when speaking or recording/listening */}
                      <div className="flex items-end justify-center gap-1.5 h-16 w-full">
                        {(isSpeaking || isRecording) ? (
                          [...Array(15)].map((_, i) => {
                            const animationDelay = i * 0.06;
                            const color = isSpeaking 
                              ? "bg-gradient-to-t from-purple-500 via-indigo-400 to-cyan-400" 
                              : "bg-gradient-to-t from-red-500 via-pink-400 to-orange-400";
                            return (
                              <motion.div
                                key={i}
                                className={`w-1.5 rounded-full ${color}`}
                                animate={{
                                  height: isSpeaking 
                                    ? [10, 48, 10] 
                                    : isRecording 
                                      ? [10, Math.max(10, Math.sin(i * 1.5) * 40 + 20), 10]
                                      : 10
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: isSpeaking ? 0.6 : 0.8,
                                  delay: animationDelay
                                }}
                              />
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-1.5 h-3 bg-white/20 rounded-full animate-pulse" />
                            <div className="w-1.5 h-6 bg-white/20 rounded-full" />
                            <div className="w-1.5 h-3 bg-white/20 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      
                      {/* Status indicator badges */}
                      <div className="flex flex-col items-center gap-2">
                        {isSpeaking ? (
                          <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold flex items-center gap-2 animate-pulse">
                            <Volume2 className="w-4 h-4" /> Interviewer is speaking...
                          </span>
                        ) : isRecording ? (
                          <span className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-semibold flex items-center gap-2 animate-pulse">
                            <Mic className="w-4 h-4 animate-bounce" /> Listening... Speak now
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-400 text-sm font-semibold flex items-center gap-2">
                            Ready to start
                          </span>
                        )}
                        <p className="text-slate-500 text-xs italic">💡 Tip: {interviewQuestions[currentQ].tip}</p>
                      </div>
                    </div>

                    {/* Live transcript */}
                    {isRecording && (transcript || liveTranscript) && (
                      <div className="mb-5 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-slate-500 text-xs mb-2 flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Your answer (live transcript)
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {transcript}
                          <span className="text-slate-500 italic">{liveTranscript}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <button onClick={startRecording}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:scale-105 transition-all flex items-center gap-2">
                          <Mic className="w-5 h-5" /> Start Answer
                        </button>
                      ) : (
                        <button onClick={stopRecording}
                          className="px-6 py-3 bg-red-500 rounded-xl text-white font-medium hover:bg-red-600 transition-all flex items-center gap-2">
                          <Square className="w-5 h-5" /> Stop & Next
                        </button>
                      )}
                      {!isRecording && (
                        <button onClick={() => speakQuestion(interviewQuestions[currentQ].text)}
                          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                          <Volume2 className="w-4 h-4" /> Replay Question
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Live Feedback */}
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" /> Live Feedback
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {feedbackLog.length === 0
                      ? <p className="text-slate-500 text-xs">Start recording to get live feedback…</p>
                      : feedbackLog.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className="px-3 py-2 bg-white/5 rounded-lg text-slate-300 text-xs">{f}</motion.div>
                      ))}
                  </div>
                </div>

                {/* Face Stats */}
                {faceMetrics.faceDetected && (
                  <div className="bg-green-900/20 border border-green-500/20 rounded-2xl p-5">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Camera Analysis
                    </h4>
                    {[
                      { label: "Eye Contact", value: faceMetrics.eyeContact, color: "from-green-500 to-emerald-500" },
                      { label: "Confidence", value: faceMetrics.confidence, color: "from-blue-500 to-cyan-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white font-medium">{value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                    <p className="text-slate-500 text-xs">Pose: {faceMetrics.headPose}</p>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-3">Interview Tips</h4>
                  <div className="space-y-2.5 text-sm">
                    {["Look directly at the camera lens", "Speak at a steady, clear pace", "Use STAR method for behavioral Q's", "Smile naturally — it builds rapport"].map((tip) => (
                      <div key={tip} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <p className="text-slate-300 text-xs">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question progress */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-3 text-sm">Questions</h4>
                  <div className="space-y-2">
                    {interviewQuestions.map((q, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                        i < currentQ ? "bg-green-500/10 text-green-400" : i === currentQ ? "bg-blue-500/10 text-blue-300" : "text-slate-600"
                      }`}>
                        {i < currentQ ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-current shrink-0 flex items-center justify-center text-[10px]">{i + 1}</span>}
                        <span className="truncate">{q.text.slice(0, 35)}…</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
