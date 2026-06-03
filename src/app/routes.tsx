import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { SplashScreen } from "./components/SplashScreen";
import { Onboarding } from "./components/Onboarding";
import { Auth } from "./components/Auth";
import { CareerQuestionnaire } from "./components/CareerQuestionnaire";
import { Dashboard } from "./components/Dashboard";
import { ResumeGenerator } from "./components/ResumeGenerator";
import { ResumePreview } from "./components/ResumePreview";
import { ATSAnalyzer } from "./components/ATSAnalyzer";
import { CareerPrediction } from "./components/CareerPrediction";
import { SkillGapAnalyzer } from "./components/SkillGapAnalyzer";
import { LearningRoadmap } from "./components/LearningRoadmap";
import { PortfolioGenerator } from "./components/PortfolioGenerator";
import { LinkedInGenerator } from "./components/LinkedInGenerator";
import { InterviewPreparation } from "./components/InterviewPreparation";
import { CareerGrowthDashboard } from "./components/CareerGrowthDashboard";
import { PremiumSubscription } from "./components/PremiumSubscription";
import { TechnicalInterview } from "./components/TechnicalInterview";
import { HRInterview } from "./components/HRInterview";
import { MLAIInterview } from "./components/MLAIInterview";
import { AIMockInterview } from "./components/AIMockInterview";
import { CourseDetail } from "./components/CourseDetail";
import { AICoach } from "./components/AICoach";
import { Profile } from "./components/Profile";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: SplashScreen },
      { path: "onboarding", Component: Onboarding },
      { path: "auth", Component: Auth },
      { path: "questionnaire", Component: CareerQuestionnaire },
      { path: "dashboard", Component: Dashboard },
      { path: "resume-generator", Component: ResumeGenerator },
      { path: "resume-preview", Component: ResumePreview },
      { path: "ats-analyzer", Component: ATSAnalyzer },
      { path: "career-prediction", Component: CareerPrediction },
      { path: "skill-gap", Component: SkillGapAnalyzer },
      { path: "learning-roadmap", Component: LearningRoadmap },
      { path: "portfolio", Component: PortfolioGenerator },
      { path: "linkedin", Component: LinkedInGenerator },
      { path: "interview-prep", Component: InterviewPreparation },
      { path: "technical-interview", Component: TechnicalInterview },
      { path: "hr-interview", Component: HRInterview },
      { path: "mlai-interview", Component: MLAIInterview },
      { path: "ai-mock-interview", Component: AIMockInterview },
      { path: "course-detail", Component: CourseDetail },
      { path: "ai-coach", Component: AICoach },
      { path: "profile", Component: Profile },
      { path: "career-growth", Component: CareerGrowthDashboard },
      { path: "premium", Component: PremiumSubscription },
      { path: "*", Component: NotFound },
    ],
  },
]);
