import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState, useRef } from "react";

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
};

const FEATURES = [
  { title: "AI Resume Scoring", desc: "Get an instant ATS score based on real-world recruiter algorithms.", icon: "score", gradient: "from-blue-500 to-indigo-600" },
  { title: "Keyword Optimization", desc: "Automatically detect and insert missing high-impact keywords.", icon: "keyword", gradient: "from-sky-400 to-cyan-600" },
  { title: "Format Analysis", desc: "Ensure your resume is readable by every major ATS system.", icon: "format", gradient: "from-violet-500 to-purple-600" },
  { title: "Live AI Feedback", desc: "Contextual suggestions to rewrite bullet points for maximum impact.", icon: "ai", gradient: "from-emerald-400 to-teal-600" },
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
  { icon: "✓", text: "ATS-safe font and layout confirmed", type: "pass", delay: 1.3 },
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
      <div className="relative z-10 rounded-[28px] overflow-hidden border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_32px_80px_-16px_rgba(15,23,42,0.08)]">

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/50 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/90 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-sm" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 tracking-wide">ATSify — Live Analysis</span>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"
            />
            <span className="text-[10px] font-black text-emerald-600 tracking-wide">LIVE</span>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Editable bullet simulation */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Bullet Point Editor</p>
            <div className="relative rounded-xl border border-slate-150 p-3 text-[12px] font-semibold text-gray-700 leading-relaxed min-h-[52px] bg-white/50 backdrop-blur-sm">
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
          <div className="flex gap-3">
            {/* Radial score */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/60 flex-shrink-0">
              <div className="relative w-16 h-16">
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
                  <span className="text-xl font-black text-blue-600">{score}</span>
                  <span className="text-[8px] font-bold text-gray-400">/100</span>
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">ATS Score</p>
            </div>

            {/* Skill bars */}
            <div className="flex-1 flex flex-col gap-2 justify-center">
              {SKILL_BARS.map((bar, i) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] font-bold text-gray-500">{bar.label}</span>
                    <span className="text-[9px] font-black" style={{ color: bar.color }}>{bar.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100/80 overflow-hidden">
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
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">AI Suggestions</p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: showSuggestions ? 1 : 0, x: showSuggestions ? 0 : 12 }}
                  transition={{ delay: s.delay, type: "spring", stiffness: 260, damping: 22 }}
                  className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold leading-snug border transition-all duration-300 ${
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
        className="absolute -top-4 -left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-blue-100/60"
      >
        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 11l2 2 4-4" /><circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Real‑time</p>
          <p className="text-[11px] font-black text-blue-600 leading-none mt-0.5">Live Scoring</p>
        </div>
      </motion.div>

      {/* Floating bottom-right badge */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -right-4 z-20 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-emerald-100/60 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
          <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Verified</p>
          <p className="text-[11px] font-black text-emerald-600 leading-none mt-0.5">ATS‑Ready</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const Features = () => (
  <section id="features" className="py-20 min-h-[100dvh] flex items-center relative overflow-hidden" style={{ background: "var(--bg-2)" }}>
    {/* Ambient radial blur glows */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[20%] left-[-15%] w-[45%] h-[60%] rounded-full opacity-[0.08] blur-[120px]" style={{ background: "var(--primary)" }} />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[60%] rounded-full opacity-[0.06] blur-[120px]" style={{ background: "var(--secondary)" }} />
    </div>

    <div className="w-full max-w-6xl mx-auto px-6 md:px-10 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-[11fr_13fr] items-center gap-12 lg:gap-16 mb-16">
        {/* Left — Text with Asymmetrical Grid */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-150 bg-blue-50/90 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.22em] mb-5 shadow-sm backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            Powerful intelligence
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight"
          >
            Features built for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">ATS dominance</span>
          </motion.h2>

          <p className="text-sm md:text-base text-[var(--text-2)] font-semibold leading-relaxed mb-8 max-w-xl">
            ATSify doesn&apos;t just check spelling. It analyzes your resume&apos;s structure, semantics, and impact using data from thousands of successful job applications.
          </p>

          {/* Asymmetric Bento-style Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const isFeatured = i === 0 || i === 3;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 group glow-card ${
                    isFeatured
                      ? "sm:col-span-2 bg-gradient-to-br from-white/90 via-blue-50/30 to-indigo-50/20 border-blue-200/80 shadow-[0_12px_32px_rgba(37,99,235,0.04)]"
                      : "bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white hover:border-blue-200"
                  }`}
                >
                  <div className={`flex flex-col ${isFeatured ? "sm:flex-row sm:items-center" : "items-start"} gap-4`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                      {icons[f.icon]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm md:text-base font-black text-[var(--text)]">{f.title}</h3>
                        {isFeatured && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 leading-none">
                            {i === 0 ? "Core Engine" : "Live Assistant"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] lg:text-xs text-[var(--text-2)] font-semibold leading-relaxed">
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
        <div className="w-full relative flex flex-col justify-center py-8">
          <LiveFeedbackPanel />
        </div>
      </div>

      {/* Small supporting cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "👥", gradient: "from-blue-400 to-indigo-500", title: "Human‑in‑the‑loop", desc: "Models trained and validated with real recruiter feedback." },
          { icon: "📄", gradient: "from-violet-400 to-purple-500", title: "Template library", desc: "Best‑practice resume layouts for tech, product, and more." },
          { icon: "🌍", gradient: "from-emerald-400 to-teal-500", title: "Global reach", desc: "Optimizing resumes across roles and countries worldwide." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="group cursor-default"
          >
            <div className="relative h-32 lg:h-40 rounded-2xl lg:rounded-3xl overflow-hidden mb-3 border border-white/50 bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />
              <motion.span
                className="text-5.5xl relative z-10 filter drop-shadow-[0_8px_16px_rgba(37,99,235,0.12)]"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              >
                {item.icon}
              </motion.span>
            </div>
            <h4 className="text-sm font-black text-[var(--text)] mb-0.5">{item.title}</h4>
            <p className="text-[11px] lg:text-xs text-[var(--text-3)] font-medium leading-snug">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;