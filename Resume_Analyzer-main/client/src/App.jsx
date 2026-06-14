import { Routes, Route } from "react-router-dom";
import LandingPage from "./features/landing/LandingPage";
import Login from "./features/auth/pages/Login";
import SignUpPage from "./features/auth/pages/SignUp";
import DashboardPage from "./features/dashboard/pages/Dashboard";
import TemplatesPage from "./features/templates/pages/TemplatesPage";
import FAQ from "./features/landing/components/FAQ";
import MyResumes from "./features/dashboard/pages/MyResumes";
import Settings from "./features/dashboard/pages/Settings";
import ResumeAnalyzer from "./features/resume-analyzer/ResumeAnalyzer";
import OAuthCallback from "./features/auth/pages/OAuthCallback";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { ToastProvider } from "./components/ui/Toast";
import OptimizationHistory from "./features/dashboard/pages/OptimizationHistory";
import ATSResumeBuilder from "./features/dashboard/pages/ATSResumeBuilder";
import ResumeEditor from "./features/dashboard/pages/ResumeEditor";

function App() {
  return (
    <ToastProvider>
      <CustomCursor />
      {/* Accessibility: Skip to content link */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <ScrollToTop />
      <div className="relative z-10" id="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/analyze/:templateId" element={<ResumeAnalyzer />} />
          <Route path="/create-ats-resume" element={<ATSResumeBuilder />} />
          <Route
            path="/optimization-history"
            element={<OptimizationHistory />}
          />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/templates/all" element={<TemplatesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:category" element={<TemplatesPage />} />
          <Route path="/my-resumes" element={<MyResumes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/resume-editor" element={<ResumeEditor />} />
          <Route path="/editor/:templateId" element={<ResumeEditor />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;

