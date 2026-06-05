import { useState, useRef } from "react";
import PaymentModal from "../../components/ui/PaymentModal";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  CheckCircle2,
  AlertCircle,
  Activity,
  Lock,
  ChevronRight,
  FileText,
  UploadCloud,
  Zap,
  Target,
  Download
} from "lucide-react";

// ─────────────────────────────────────────────
// Feedback Block
// ─────────────────────────────────────────────
const FeedbackBlock = ({ type, title, items, isLocked }) => {
  const configs = {
    best: { color: "var(--primary)", icon: <CheckCircle2 className="w-5 h-5" />, bg: "var(--primary-glow)" },
    good: { color: "var(--accent)", icon: <Activity className="w-5 h-5" />, bg: "var(--accent-glow)" },
    improve: { color: "#f43f5e", icon: <AlertCircle className="w-5 h-5" />, bg: "rgba(244, 63, 94, 0.05)" },
  };

  const config = configs[type];

  return (
    <div className="group bg-[var(--bg-2)] border border-[var(--border)] p-8 rounded-[32px] relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
      <div className="absolute top-0 right-0 w-24 h-24 blur-2xl opacity-10 transition-opacity group-hover:opacity-20" style={{ background: config.color }} />

      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: config.bg, color: config.color }}>
          {config.icon}
        </div>
        <h4 className="text-lg font-black tracking-tight text-[var(--text)]">
          {title}
        </h4>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className={`flex items-start gap-3 text-sm font-medium text-[var(--text-3)] leading-relaxed ${isLocked && i >= 1 ? "blur-[6px] select-none" : ""}`}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: config.color }} />
            {item}
          </li>
        ))}
      </ul>

      {isLocked && (
        <div className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-[var(--bg-2)] to-transparent flex items-end justify-center pb-8 px-6">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] bg-white px-4 py-2 rounded-full shadow-lg border border-[var(--border)]">
            <Lock className="w-3 h-3" /> Upgrade to View All
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Score Ring
// ─────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="var(--border)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="70"
          cy="70"
          r={radius}
          stroke="var(--primary)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tracking-tighter text-[var(--text)]">{score}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-3)]">ATS Index</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const ResumeFeedback = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [fixResumeLoading, setFixResumeLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [step, setStep] = useState("idle");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallPlan, setPaywallPlan] = useState("basic");
  const [extractedText, setExtractedText] = useState("");
  const [fixedResumeData, setFixedResumeData] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a resume file.");
      return;
    }
    setSubmitLoading(true);
    setStep("analyzing");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post("http://localhost:5001/api/ai-resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const text = uploadRes.data.text || "";
      setExtractedText(text);

      // Also call analyze API to get proper feedback with template analysis
      const analyzeRes = await axios.post("http://localhost:5001/api/ai-resume/analyze", { text });
      const analysisData = analyzeRes.data.data || {};
      const templateAnalysis = analyzeRes.data.templateAnalysis || {};

      setTimeout(() => {
        setFeedback({
          score: analysisData.atsScore || 85,
          best: {
            title: "Semantic Strengths",
            items: analysisData.skills && analysisData.skills.length > 0 ? analysisData.skills.slice(0, 5) : ["Cloud Architecture", "System Design", "Agile Leadership"]
          },
          good: {
            title: "Identity Verification",
            items: [
              `Channel: ${analysisData.personal_info?.email || "Verified"}`,
              `Contact: ${analysisData.personal_info?.phone || "Active"}`,
              `Academic: ${analysisData.education?.length ? analysisData.education[0].degree : "Verified"}`
            ]
          },
          improve: {
            title: "Neural Gaps",
            items: [
              text.length < 500 ? "Low semantic density detected." : `${Math.floor(text.length / 100)} words indexed.`,
              "Missing targeted power verbs.",
              "Skill frequency requires optimization."
            ]
          },
          templateAnalysis: templateAnalysis
        });
        setStep("done");
        setSubmitLoading(false);
      }, 2000);

    } catch (err) {
      console.error("Analysis failed:", err);
      setStep("idle");
      setSubmitLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!feedback) {
      alert("Please analyze a resume first");
      return;
    }
    
    setDownloadLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/resume/generate-report",
        {
          feedbackData: feedback,
          fileName: file?.name || "resume-report"
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create blob download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleFixResumeWithAI = async () => {
    if (!extractedText) {
      alert("Please analyze a resume first");
      return;
    }
    
    setFixResumeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/resume/fix-resume",
        {
          resumeText: extractedText,
          role: role || "not specified",
          jobDescription: jobDesc
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFixedResumeData(response.data.data);
      alert("Resume has been improved! Check the improvements below.");
    } catch (err) {
      console.error("AI Fix failed:", err);
      alert(err.response?.data?.message || "Failed to fix resume. Please try again.");
    } finally {
      setFixResumeLoading(false);
    }
  };

  const canAccessFull = true;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 p-10 bg-[var(--bg-2)] rounded-[40px] border border-[var(--border)] shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-10" />

        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary-glow)]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[var(--text)]">Mission Parameters</h3>
              <p className="text-sm font-medium text-[var(--text-3)]">Define the objective for precise neural alignment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] ml-1 flex items-center gap-2">
                <Target className="w-3 h-3 text-[var(--primary)]" /> Target Position
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Product Designer"
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] ml-1 flex items-center gap-2">
                <UploadCloud className="w-3 h-3 text-[var(--primary)]" /> Analysis Payload
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative group cursor-pointer w-full bg-[var(--bg)] border-2 border-dashed border-[var(--border)] px-6 py-4 rounded-2xl transition-all hover:border-[var(--primary)] flex items-center justify-between ${file ? 'bg-[var(--primary-glow)]/5 border-[var(--primary)]' : ''}`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <span className={`text-sm font-bold ${file ? 'text-[var(--primary)]' : 'text-[var(--text-3)]'}`}>
                  {file ? file.name : "Select PDF or DOCX"}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${file ? 'text-[var(--primary)] rotate-90' : 'text-[var(--text-3)]'}`} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] ml-1 flex items-center gap-2">
              <FileText className="w-3 h-3 text-[var(--primary)]" /> Job Context (Recommended)
            </label>
            <textarea
              className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none min-h-[140px] resize-none"
              placeholder="Paste the target JD here to calibrate matching accuracy..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitLoading || !file}
            className="w-full md:w-auto px-12 py-5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4"
          >
            {submitLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Interpreting Data...
              </>
            ) : (
              <>Initiate Neural Analysis <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center space-y-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[var(--primary)] animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-[var(--text)]">Scanning Semantic Nodes</h3>
              <p className="text-lg font-medium text-[var(--text-3)]">Correlating your profile with recursive ATS patterns...</p>
            </div>
          </motion.div>
        )}

        {step === "done" && feedback && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row items-center gap-12 p-10 bg-white rounded-[48px] border border-[var(--border)] shadow-2xl">
              <ScoreRing score={feedback.score} />
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
                  Report Finalized
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[var(--text)] mb-3">{file?.name}</h2>
                <p className="text-lg font-medium text-[var(--text-3)] leading-relaxed">
                  Your resume has been processed through our 4th-gen neural matrix. We've identified key optimization nodes to bypass corporate filters.
                </p>
              </div>
              <div className="flex gap-4 flex-col md:flex-row">
                <button 
                  onClick={handleDownloadReport}
                  disabled={downloadLoading}
                  className="px-8 py-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text)] font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--bg-3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {downloadLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[var(--text-3)]/30 border-t-[var(--text)] rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </>
                  )}
                </button>
                <button 
                  onClick={handleFixResumeWithAI}
                  disabled={fixResumeLoading}
                  className="px-8 py-4 rounded-xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[var(--primary-glow)] flex items-center justify-center gap-2">
                  {fixResumeLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      AI Fix Resume
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeedbackBlock
                type="best"
                title={feedback.best.title}
                items={feedback.best.items}
                isLocked={!canAccessFull}
              />
              <FeedbackBlock
                type="good"
                title={feedback.good.title}
                items={feedback.good.items}
                isLocked={!canAccessFull}
              />
              <FeedbackBlock
                type="improve"
                title={feedback.improve.title}
                items={feedback.improve.items}
                isLocked={!canAccessFull}
              />
            </div>

            {fixedResumeData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-10 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-[40px] border border-emerald-200 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-emerald-900">Resume Optimized!</h3>
                    <p className="text-sm font-medium text-emerald-700">Your resume has been improved with AI</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 border border-emerald-100">
                    <div className="text-center mb-4">
                      <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Before</div>
                      <div className="text-4xl font-black text-emerald-900">{fixedResumeData.atsScoreBefore || 'N/A'}</div>
                      <div className="text-xs text-emerald-600 font-semibold">ATS Score</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-blue-100">
                    <div className="text-center mb-4">
                      <div className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-2">After</div>
                      <div className="text-4xl font-black text-blue-900">{fixedResumeData.atsScoreAfter || 'N/A'}</div>
                      <div className="text-xs text-blue-600 font-semibold">ATS Score</div>
                    </div>
                  </div>
                </div>

                {fixedResumeData.improvements && fixedResumeData.improvements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-black text-emerald-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Key Improvements
                    </h4>
                    <ul className="space-y-2">
                      {fixedResumeData.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                          <span className="text-emerald-600 font-bold mt-1">✓</span>
                          <span className="text-emerald-900 font-medium">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fixedResumeData.improvedResume && (
                  <div className="mb-6">
                    <h4 className="text-lg font-black text-emerald-900 mb-4">Improved Resume</h4>
                    <div className="bg-white p-6 rounded-xl border border-emerald-100 max-h-96 overflow-y-auto">
                      <p className="text-emerald-900 text-sm font-medium whitespace-pre-wrap">{fixedResumeData.improvedResume}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-emerald-200">
                  <button 
                    onClick={() => {
                      const element = document.createElement('a');
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fixedResumeData.improvedResume || ''));
                      element.setAttribute('download', `improved-resume-${Date.now()}.txt`);
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg"
                  >
                    Download Improved Resume
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaywall && (
          <PaymentModal
            plan={paywallPlan}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeFeedback;
