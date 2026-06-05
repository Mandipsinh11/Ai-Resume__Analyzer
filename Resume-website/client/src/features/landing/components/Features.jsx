import { motion } from "framer-motion";
import { useState, useRef } from "react";

const icons = {
  score: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  keyword: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6" /><path d="M11 8v6" />
    </svg>
  ),
  format: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
    </svg>
  ),
  ai: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" />
    </svg>
  ),
  match: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  export: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

const FEATURES = [
  { title: "AI Resume Score", desc: "Instant ATS score check based on recruiter algorithms.", icon: "score", gradient: "from-blue-500 to-indigo-600" },
  { title: "Keyword Scanner", desc: "Find and insert missing industry-specific keywords.", icon: "keyword", gradient: "from-sky-400 to-cyan-600" },
  { title: "Format Scanner", desc: "Ensure layout parses correctly in every major ATS.", icon: "format", gradient: "from-violet-500 to-purple-600" },
  { title: "Live AI Editor", desc: "Contextual advice to rewrite bullet points instantly.", icon: "ai", gradient: "from-emerald-400 to-teal-600" },
  { title: "JD Alignment", desc: "Compare resume to specific jobs and find gaps.", icon: "match", gradient: "from-amber-400 to-orange-500" },
  { title: "ATS-Safe Export", desc: "Download in 100% parse-friendly PDF format.", icon: "export", gradient: "from-pink-500 to-rose-600" },
];

const SKILL_BARS = [
  { label: "Keyword Match", value: 95, color: "#3b82f6", delay: 0.2 },
  { label: "Formatting", value: 92, color: "#8b5cf6", delay: 0.35 },
  { label: "Experience", value: 96, color: "#10b981", delay: 0.5 },
  { label: "Readability", value: 96, color: "#f59e0b", delay: 0.65 },
];

const SUGGESTIONS = [
  { icon: "✦", text: "Add quantified metrics to \"Led team…\" bullet", type: "improve", delay: 0.4 },
  { icon: "✓", text: "Strong action verb detected: \"Architected\"", type: "pass", delay: 0.7 },
  { icon: "✦", text: "Missing keyword: \"cross-functional\"", type: "improve", delay: 1.0 },
];

const TYPING_TEXT = "Built 3 web apps used by 100+ users, improving load speed by 75%.";

function LiveFeedbackPanel() {
  const [score, setScore] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBars, setShowBars] = useState(false);
  const hasStarted = useRef(false);

  const startAnimation = () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Type text
    let i = 0;
    const typeInterval = setInterval(() => {
      setTypedText(TYPING_TEXT.slice(0, i + 1));
      i++;
      if (i >= TYPING_TEXT.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowBars(true);
          setShowSuggestions(true);
          let s = 0;
          const scoreInterval = setInterval(() => {
            s += 2;
            setScore(s);
            if (s >= 96) clearInterval(scoreInterval);
          }, 22);
        }, 300);
      }
    }, 28);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={startAnimation}
      className="relative w-full max-w-md mx-auto lg:max-w-none select-none"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Glow */}
      <div className="absolute -inset-8 rounded-full blur-[80px] opacity-[0.07] pointer-events-none" style={{ background: "var(--primary)" }} />

      {/* Main dashboard card */}
      <div className="relative z-10 rounded-[20px] overflow-hidden border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_32px_80px_-16px_rgba(15,23,42,0.08)]">

        {/* Title bar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100/50 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/90 shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 tracking-wide">ATSify — Live Analysis</span>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"
            />
            <span className="text-[9px] font-black text-emerald-600 tracking-wide">LIVE</span>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {/* Editable bullet simulation */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Bullet Point Editor</p>
            <div className="relative rounded-xl border border-slate-150 p-2.5 text-[11px] font-semibold text-gray-700 leading-relaxed min-h-[44px] bg-white/50 backdrop-blur-sm">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-sm"
                style={{ background: "var(--primary)" }}
              />
            </div>
          </div>

          {/* Score + Bars row */}
          <div className="flex gap-2.5">
            {/* Radial score */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-white/60 flex-shrink-0">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(224, 231, 255, 0.5)" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.9" fill="none"
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: showBars ? 4 : 100 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ stroke: "url(#fg)" }}
                  />
                  <defs>
                    <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-blue-600">{score}</span>
                  <span className="text-[7px] font-bold text-gray-400">/100</span>
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">ATS Score</p>
            </div>

            {/* Skill bars */}
            <div className="flex-1 flex flex-col gap-1.5 justify-center">
              {SKILL_BARS.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-0">
                    <span className="text-[9px] font-bold text-gray-500">{bar.label}</span>
                    <span className="text-[9px] font-black" style={{ color: bar.color }}>{bar.value}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: showBars ? `${bar.value}%` : 0 }}
                      transition={{ duration: 0.9, delay: bar.delay, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI suggestions */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">AI Suggestions</p>
            <div className="flex flex-col gap-1">
              {SUGGESTIONS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: showSuggestions ? 1 : 0, x: showSuggestions ? 0 : 12 }}
                  transition={{ delay: s.delay, type: "spring", stiffness: 260, damping: 22 }}
                  className={`flex items-start gap-2 px-3 py-1.5 rounded-lg text-[10.5px] font-semibold leading-snug border transition-all duration-300 ${
                    s.type === "pass"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 backdrop-blur-md"
                      : "bg-blue-500/10 border-blue-500/20 text-blue-800 backdrop-blur-md"
                  }`}
                >
                  <span className="font-black flex-shrink-0 mt-px">{s.icon}</span>
                  {s.text}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating top-left card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -left-3 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-blue-100/60"
      >
        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 11l2 2 4-4" /><circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none">Real‑time</p>
          <p className="text-[10px] font-black text-blue-600 leading-none mt-0.5">Live Scoring</p>
        </div>
      </motion.div>

      {/* Floating bottom-right badge */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-3 -right-3 z-20 px-2.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-emerald-100/60 flex items-center gap-2"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
          <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none">Verified</p>
          <p className="text-[10px] font-black text-emerald-600 leading-none mt-0.5">ATS‑Ready</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const Features = () => (
  <section id="features" className="py-8 lg:py-12 min-h-[100dvh] lg:h-screen lg:min-h-0 flex items-center relative overflow-hidden" style={{ background: "var(--bg-2)" }}>
    {/* Ambient radial blur glows */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[20%] left-[-15%] w-[45%] h-[60%] rounded-full opacity-[0.08] blur-[120px]" style={{ background: "var(--primary)" }} />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[60%] rounded-full opacity-[0.06] blur-[120px]" style={{ background: "var(--secondary)" }} />
    </div>

    <div className="w-full max-w-6xl mx-auto px-6 md:px-10 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-[11fr_13fr] items-center gap-8 lg:gap-12">
        {/* Left — Text with Asymmetrical Grid */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-150 bg-blue-50/90 text-[var(--primary)] text-[9px] font-black uppercase tracking-[0.22em] mb-3.5 shadow-sm backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            Powerful intelligence
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-[var(--text)] mb-3 leading-tight"
          >
            Features built for{" "}
            <span className="text-[var(--primary)]">ATS dominance</span>
          </motion.h2>

          <p className="text-[13px] md:text-[14px] text-[var(--text-2)] font-semibold leading-relaxed mb-5 max-w-xl">
            ATSify doesn&apos;t just check spelling. It analyzes your resume&apos;s structure, semantics, and impact using data from thousands of successful job applications.
          </p>

          {/* Bento-style Layout (Compact 3x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {FEATURES.map((f, i) => {
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3.5 rounded-xl border border-white/50 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-blue-200 transition-all duration-300 group glow-card shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                      {icons[f.icon]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-xs md:text-sm font-black text-[var(--text)]">{f.title}</h3>
                      </div>
                      <p className="text-[10.5px] lg:text-[11px] text-[var(--text-2)] font-semibold leading-tight">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — Animated Live Feedback Panel */}
        <div className="w-full relative flex flex-col justify-center py-4">
          <LiveFeedbackPanel />
        </div>
      </div>
    </div>
  </section>
);

export default Features;