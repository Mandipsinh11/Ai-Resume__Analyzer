import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Linkedin, Play, Pause, RotateCcw, AlertCircle, Sparkles, CheckCircle } from "lucide-react";

/* ── Raw Resume Mockup (Before Optimization) ── */
const ResumeCardRaw = () => {
  return (
    <div
      className="w-full h-full bg-slate-900 border border-red-950/40 rounded-2xl p-5 text-left flex flex-col justify-between select-none relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="absolute inset-0 bg-red-950/[0.03] rounded-2xl pointer-events-none" />
      
      <div>
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-400">Alex Johnson</h4>
            <p className="text-[9px] font-black text-red-505 uppercase tracking-wider">Software Engineer</p>
          </div>
          <div className="text-[8px] text-slate-500 text-right leading-relaxed font-mono">
            <div>alex@email.com</div>
            <div>linkedin.com/in/alex</div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <h5 className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-1">Summary</h5>
          <p className="text-[9px] leading-relaxed text-slate-550 border border-dashed border-red-550/20 p-1.5 rounded bg-red-950/15">
            Developer with experience in building web apps. Looking for a new role to improve systems.
            <span className="block text-[6.5px] font-bold text-red-400 mt-1 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle size={8} /> Vague & lacks target keywords
            </span>
          </p>
        </div>

        {/* Experience */}
        <div className="mb-3">
          <h5 className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-2">Experience</h5>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                <span>Developer <span className="text-slate-500 font-medium">· Vercel</span></span>
                <span className="text-slate-500 scale-90">2022 - Pres</span>
              </div>
              <ul className="space-y-1">
                <li className="text-[9px] text-slate-500 leading-snug pl-2 border-l border-red-500/30 bg-red-950/5 rounded-r p-0.5 border border-dashed border-red-500/10">
                  Worked on database to make it run faster.
                  <span className="block text-[6.5px] font-black text-red-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <AlertCircle size={8} /> No quantified metrics / Weak verb
                  </span>
                </li>
                <li className="text-[9px] text-slate-550 leading-snug pl-2 border-l border-red-500/20">
                  Responsible for frontend codebase and migrations.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                <span>Developer <span className="text-slate-500 font-medium">· Stripe</span></span>
                <span className="text-slate-500 scale-90">2020 - 2022</span>
              </div>
              <ul className="space-y-1">
                <li className="text-[9px] text-slate-500 leading-snug pl-2 border-l border-red-500/30 bg-red-950/5 rounded-r p-0.5 border border-dashed border-red-500/10">
                  Helped built checkout service to process payments.
                  <span className="block text-[6.5px] font-black text-red-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <AlertCircle size={8} /> Typo ('built') / Passive voice
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="border-t border-slate-800 pt-2.5">
        <h5 className="text-[7.5px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Skills</h5>
        <div className="flex flex-wrap gap-1">
          {["React", "JavaScript", "HTML", "SQL"].map((s) => (
            <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-slate-950 text-slate-600 border-slate-800">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Optimized Resume Mockup (After AI Tailoring) ── */
const ResumeCardOptimized = () => {
  return (
    <div
      className="w-full h-full bg-white border border-emerald-500/30 rounded-2xl p-5 text-left flex flex-col justify-between select-none relative shadow-[0_20px_40px_rgba(16,185,129,0.05)]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="absolute inset-0 bg-emerald-500/[0.01] rounded-2xl pointer-events-none" />
      
      <div>
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-3">
          <div>
            <h4 className="text-sm font-black text-slate-800">Alex Johnson</h4>
            <p className="text-[9px] font-black text-blue-650 uppercase tracking-wider">Senior Full Stack Engineer</p>
          </div>
          <div className="text-[8px] text-slate-500 text-right leading-relaxed font-mono flex flex-col gap-0.5">
            <span className="flex items-center gap-1 justify-end"><Mail size={8} className="text-slate-400" /> alex.j@dev.com</span>
            <span className="flex items-center gap-1 justify-end"><Linkedin size={8} className="text-slate-400" /> linkedin.com/in/alex-j</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <h5 className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Summary</h5>
          <p className="text-[9px] leading-relaxed text-slate-600 border border-emerald-500/20 p-1.5 rounded bg-emerald-50/50">
            High-impact Software Engineer with 6+ years of experience. Expert in React, Node.js, and AWS. Specialized in optimizing system performance and developer experience.
            <span className="block text-[6.5px] font-black text-emerald-600 mt-1 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={8} /> ATS Optimized summary
            </span>
          </p>
        </div>

        {/* Experience */}
        <div className="mb-3">
          <h5 className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-2">Experience</h5>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[9px] font-black text-slate-700 mb-1">
                <span>Lead Developer <span className="text-slate-400 font-bold">· Vercel</span></span>
                <span className="text-slate-400 font-bold scale-90">2022 - Pres</span>
              </div>
              <ul className="space-y-1">
                <li className="text-[9px] text-slate-650 leading-snug pl-2 border-l-2 border-emerald-500 bg-emerald-50/60 rounded-r p-0.5">
                  🚀 <span className="font-extrabold text-slate-800">Optimized PostgreSQL query latency</span> by <span className="font-extrabold text-emerald-700 bg-emerald-100/50 px-1 rounded">60%</span>.
                  <span className="block text-[6.5px] font-black text-emerald-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <CheckCircle size={8} /> Metric & Latency Keywords added
                  </span>
                </li>
                <li className="text-[9px] text-slate-600 leading-snug pl-2 border-l-2 border-emerald-500 bg-emerald-50/20 rounded-r p-0.5 mt-1">
                  🚀 Spearheaded frontend migration to <span className="font-bold text-slate-800">React 18</span>, slashing page load by <span className="font-extrabold text-emerald-700 bg-emerald-100/50 px-1 rounded">42%</span>.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex justify-between text-[9px] font-black text-slate-700 mb-1">
                <span>Developer <span className="text-slate-400 font-bold">· Stripe</span></span>
                <span className="text-slate-400 font-bold scale-90">2020 - 2022</span>
              </div>
              <ul className="space-y-1">
                <li className="text-[9px] text-slate-650 leading-snug pl-2 border-l-2 border-emerald-500 bg-emerald-50/60 rounded-r p-0.5">
                  🚀 Engineered Stripe checkout, securing <span className="font-bold text-slate-800">99.99% uptime</span> for <span className="font-extrabold text-emerald-700 bg-emerald-100/50 px-1 rounded">$4M+</span> daily volume.
                  <span className="block text-[6.5px] font-black text-emerald-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <CheckCircle size={8} /> Active voice & scale numbers fixed
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="border-t border-slate-100 pt-2.5">
        <h5 className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mb-1">Skills</h5>
        <div className="flex flex-wrap gap-1">
          {["React 18", "Node.js", "AWS Cloud", "PostgreSQL", "Next.js"].map((s) => (
            <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200/60">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Main Cinematic Optimizer Simulator Component ── */
const BeforeAfterSlider = () => {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(false);
  const consoleContainerRef = useRef(null);

  // Auto playback animation cycle
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 1;
      });
    }, 45); // Completes scan in ~4.5 seconds
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keep console log scrolled to the bottom
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [progress]);

  const handlePlayPause = () => {
    if (progress >= 100) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Interpolated stats
  const currentScore = Math.min(94, Math.round(42 + (progress / 100) * 52));

  // Console terminal log parser
  const getLogs = (p) => {
    const lines = [];
    lines.push("⚡ [SYSTEM] Booting ATSify Deep Scan Core v4.0...");
    if (p > 5) lines.push("🔍 [PARSER] Loading raw resume DOM nodes...");
    if (p > 15) lines.push("🔍 [PARSER] Found: Alex Johnson - Software Engineer");
    if (p > 22) lines.push("⚠️ [WARNING] No quantified metrics found in experience history.");
    if (p > 30) lines.push("⚠️ [WARNING] Detected weak action verb: 'Worked on'.");
    if (p > 38) lines.push("⚠️ [WARNING] Passive phrasing found in Stripe bullet point.");
    if (p > 45) lines.push("📡 [NET] Fetching target keyword list matching: Full Stack...");
    if (p > 52) lines.push("🚀 [REWRITE] Rephrasing Vercel bullet: injecting database latency metrics...");
    if (p > 60) lines.push("🚀 [REWRITE] Updated Vercel latency: 'slashed database latency by 60%'.");
    if (p > 68) lines.push("🚀 [REWRITE] Rephrasing Stripe bullet: passive voice resolved to active scale.");
    if (p > 75) lines.push("🚀 [REWRITE] Injected critical skills: 'React 18', 'GraphQL', 'AWS Cloud'.");
    if (p > 82) lines.push("⚙️ [INDEXER] Re-indexing resume keywords against 45 recruiter parser checkpoints...");
    if (p > 90) lines.push("📊 [COMPUTING] Calculating ATS Match Index Score...");
    if (p >= 100) {
      lines.push("✨ [SUCCESS] Optimization complete!");
      lines.push("✨ [SUCCESS] Match Score jumped: 42% -> 94%");
      lines.push("💡 [SUCCESS] Final checklist passed. Ready to download.");
    }
    return lines;
  };

  const logs = getLogs(progress);

  return (
    <section
      id="before-after"
      className="py-20 lg:py-28 relative overflow-hidden flex items-center min-h-[90dvh]"
      style={{ background: "#020408" }}
    >
      {/* Glowing Mesh Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-[0.07] -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{
            background: "radial-gradient(circle, #00d8f6 0%, #4f46e5 100%)"
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 text-[10px] md:text-xs font-black uppercase tracking-[0.25em] mb-4"
          >
            <Sparkles size={12} className="text-cyan-400 animate-pulse" />
            Live AI Scan Simulator
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-5 leading-tight"
          >
            Watch the <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Transformation</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-semibold leading-relaxed"
          >
            Scrub the timeline or click run to watch the real-time conversion as raw bullet points morph under the laser scanner into quantified, high-impact statements.
          </motion.p>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-12 lg:gap-16">
          
          {/* Left Column — Morphing Canvas */}
          <div className="w-full flex flex-col items-center justify-center relative overflow-visible py-4">
            <div className="scanner-card-container">
              <div className="scanner-card rounded-2xl border border-slate-900/60 bg-slate-950/95 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.85)]">
                
                {/* Raw Resume (Bottom Layer) */}
                <div className="absolute inset-0">
                  <ResumeCardRaw />
                </div>

                {/* Optimized Resume (Top Layer, Clipped) */}
                <div
                  className="absolute inset-0 z-20"
                  style={{
                    clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`
                  }}
                >
                  <ResumeCardOptimized />
                </div>

                {/* Glowing Laser Sweeper Bar */}
                <div
                  className="absolute top-0 bottom-0 w-[2.5px] bg-cyan-400 z-30 pointer-events-none"
                  style={{
                    left: `${progress}%`,
                    boxShadow: "0 0 14px 4px rgba(34, 211, 238, 0.9), 0 0 28px 8px rgba(34, 211, 238, 0.4)",
                    opacity: progress > 0 && progress < 100 ? 1 : 0,
                    transition: "opacity 0.2s"
                  }}
                >
                  {/* Glowing laser heads */}
                  <div className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                  <div className="absolute -bottom-1.5 -left-1 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                </div>
              </div>
            </div>
            
            {/* Timeline Scrubbing Bar */}
            <div className="w-full max-w-[390px] mt-6 bg-slate-950/90 p-4 rounded-xl border border-slate-800 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.5)] relative z-25">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                <span>Original</span>
                <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">Scrub Sweep: {progress}%</span>
                <span>Optimized</span>
              </div>
              <div className="relative flex items-center group">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setProgress(Number(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                  style={{ 
                    outline: "none", 
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
                    touchAction: "none", // Prevent page scroll jumping on touch screens
                    overscrollBehavior: "contain"
                  }}
                  aria-label="Scan progress bar"
                />
                {/* Glowing track overlay */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg pointer-events-none"
                  style={{ width: `${progress}%`, opacity: 0.85, boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)" }}
                />
              </div>
            </div>
          </div>

          {/* Right Column — AI Diagnostics Panel */}
          <div className="w-full">
            <div
              className="rounded-3xl border border-slate-900/80 p-6 md:p-8 flex flex-col justify-between gap-6 relative overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
              style={{ background: "rgba(10, 12, 22, 0.82)", backdropFilter: "blur(20px)" }}
            >
              {/* Digital Grid overlay behind text */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] grid-bg" />

              <div>
                {/* Top Section */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-900/60 pb-4 relative z-10">
                  <div>
                    <h3 className="text-lg font-black text-white leading-none mb-1">ATS Optimization Engine</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Module 4.0 - Live Analyzer</p>
                  </div>
                  
                  {/* Score circle */}
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#101322" strokeWidth="3" />
                      <motion.circle
                        cx="18" cy="18" r="16" fill="none"
                        stroke="url(#simGrad)" strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeDasharray="100"
                        animate={{ strokeDashoffset: 100 - currentScore }}
                        transition={{ duration: 0.1 }}
                      />
                      <defs>
                        <linearGradient id="simGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-white leading-none">{currentScore}%</span>
                      <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider scale-90 mt-0.5">Match</span>
                    </div>
                  </div>
                </div>

                {/* Live Console Window */}
                <div className="mb-6 relative z-10">
                  <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    <span>Diagnostic Logs</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-cyan-400/70 font-mono">SYS_OK</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                    </div>
                  </div>
                  
                  <div className="relative rounded-xl overflow-hidden border border-slate-900">
                    {/* Retro scanner grid mesh lines for terminal */}
                    <div className="absolute inset-0 bg-slate-950 pointer-events-none" />
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-[0.03]"
                      style={{
                        backgroundImage: "linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px)",
                        backgroundSize: "100% 4px"
                      }}
                    />
                    
                    <div
                      ref={consoleContainerRef}
                      className="relative z-10 font-mono text-[10px] text-cyan-400 p-4 h-[140px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent overscroll-contain"
                    >
                      {logs.map((log, idx) => (
                        <div key={idx} className="mb-1 last:mb-0 opacity-90">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scan Control Action Row */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <button
                    onClick={handlePlayPause}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-200 hover:text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98"
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={12} className="text-cyan-400 fill-cyan-400 animate-pulse" /> Pause Simulation
                      </>
                    ) : (
                      <>
                        <Play size={12} className="text-cyan-400 fill-cyan-400" /> {progress >= 100 ? "Run Scan Again" : "Run AI Scan"}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
                    title="Reset Simulation"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom CTA Block */}
              <div className="border-t border-slate-900 pt-5 mt-2 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => (window.location.href = "/login")}
                  className="w-full py-4 rounded-xl font-black text-xs md:text-sm text-white shadow-xl shadow-cyan-500/10 cursor-pointer transition-all glow-button"
                  style={{
                    background: "linear-gradient(135deg, #0891b2, #0284c7)"
                  }}
                >
                  Optimize Your Resume Now — Free
                </motion.button>
                <p className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-3">
                  Parsed instantly · 100% Free trial
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
