import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  {
    step: "01", title: "Upload Resume", desc: "Drag and drop your PDF or Word document. Our AI instantly parses your entire career history.", gradient: "from-blue-500 to-indigo-600",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
  },
  {
    step: "02", title: "AI Deep Scan", desc: "Our engine compares your data against 500+ industry-specific ATS checkpoints and recruiter benchmarks.", gradient: "from-violet-500 to-purple-600",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
  },
  {
    step: "03", title: "Get Results", desc: "Receive a detailed breakdown of your score, missing keywords, and actionable rewriting tips.", gradient: "from-emerald-500 to-teal-600",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  },
];

const KEYWORDS = [
  { label: "React.js", color: "bg-blue-50 text-blue-600 border-blue-200", delay: 0.5 },
  { label: "Node.js", color: "bg-violet-50 text-violet-600 border-violet-200", delay: 0.8 },
  { label: "TypeScript", color: "bg-emerald-50 text-emerald-600 border-emerald-200", delay: 1.1 },
  { label: "AWS", color: "bg-orange-50 text-orange-600 border-orange-200", delay: 1.4 },
  { label: "REST API", color: "bg-pink-50 text-pink-600 border-pink-200", delay: 1.7 },
  { label: "Docker", color: "bg-cyan-50 text-cyan-600 border-cyan-200", delay: 2.0 },
];

const CHECKS = [
  { label: "Keyword Density", pass: true, delay: 0.3 },
  { label: "ATS Formatting", pass: true, delay: 0.6 },
  { label: "Action Verbs", pass: true, delay: 0.9 },
  { label: "Quantified Impact", pass: true, delay: 1.2 },
];

const HowItWorksResume = ({ scanning, done }) => {
  return (
    <div className="flex flex-col gap-2.5 text-left h-full select-none justify-between pt-1">
      {/* Resume Header */}
      <div className="border-b pb-2 border-slate-200/50 flex-shrink-0">
        <div className="text-[11.5px] font-black text-slate-800 tracking-tight leading-none">
          CANDIDATE NAME
        </div>
        <div className="text-[8px] font-bold text-slate-400 mt-1 leading-none">Senior Software Engineer</div>
      </div>

      {/* Experience Section */}
      <div className="space-y-1 flex-1 flex flex-col justify-center">
        <div className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest leading-none">Experience</div>
        
        <div className="space-y-2 border-l border-indigo-100 pl-2 py-0.5">
          <div>
            <div className="flex justify-between text-[7.5px] font-bold text-slate-700 leading-none">
              <span>Lead Backend Engineer</span>
              <span className="text-slate-400 font-medium scale-90 origin-right">2023 - Pres</span>
            </div>
            
            {/* Morphing bullet point */}
            <div className="min-h-[26px] relative mt-0.5">
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.p
                    key="raw"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[7px] text-red-500 font-bold leading-normal bg-red-50/80 border border-red-100/50 rounded px-1.5 py-0.5"
                  >
                    Worked on database queries to make it fast.
                  </motion.p>
                ) : (
                  <motion.p
                    key="optimized"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[7px] text-emerald-700 font-bold leading-normal bg-emerald-50/80 border border-emerald-100/50 rounded px-1.5 py-0.5"
                  >
                    🚀 <span className="underline decoration-emerald-300">Optimized SQL queries</span>, slashing database search latency by <span className="font-black text-emerald-800">45%</span>.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[7.5px] font-bold text-slate-700 leading-none">
              <span>Software Engineer</span>
              <span className="text-slate-400 font-medium scale-90 origin-right">2021 - 2023</span>
            </div>
            
            {/* Second morphing bullet point */}
            <div className="min-h-[26px] relative mt-0.5">
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.p
                    key="raw2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[7px] text-amber-600 font-bold leading-normal bg-amber-50/80 border border-amber-100/50 rounded px-1.5 py-0.5"
                  >
                    Responsible for the frontend migration.
                  </motion.p>
                ) : (
                  <motion.p
                    key="optimized2"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[7px] text-blue-700 font-bold leading-normal bg-blue-50/80 border border-blue-100/50 rounded px-1.5 py-0.5"
                  >
                    ⚡ <span className="font-black text-blue-800">Spearheaded</span> React migration, improving load speed by <span className="font-black text-blue-800">60%</span>.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-1.5 flex-shrink-0">
        <div className="text-[8px] font-black text-indigo-650 uppercase tracking-widest leading-none">Core Technical Skills</div>
        <div className="flex flex-wrap gap-0.5">
          {[
            { name: "React", active: done },
            { name: "Node.js", active: done },
            { name: "Python", active: done },
            { name: "PostgreSQL", active: done }
          ].map((skill, idx) => (
            <motion.span
              key={skill.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: skill.active ? 1.05 : 1, 
                opacity: 1,
                backgroundColor: skill.active ? "#e0e7ff" : "#f1f5f9",
                color: skill.active ? "#4338ca" : "#64748b",
                borderColor: skill.active ? "#c7d2fe" : "#e2e8f0"
              }}
              transition={{ delay: idx * 0.1 }}
              className="text-[7px] font-black px-1.5 py-0.5 rounded border leading-none"
            >
              {skill.name}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step1UploadAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    setProgress(0);
    setUploaded(false);
    
    // Simulate drop delay, then upload progress
    const timer1 = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploaded(true);
            return 100;
          }
          return prev + 5;
        });
      }, 40);
      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none min-h-[320px]">
      {/* Drop zone container */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[320px] rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/10 p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-inner backdrop-blur-sm"
      >
        {/* Floating PDF Icon */}
        <AnimatePresence mode="wait">
          {!uploaded ? (
            <motion.div
              key="pdf-icon"
              initial={{ y: -60, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="w-12 h-12 rounded-xl bg-red-550 text-white flex items-center justify-center shadow-lg shadow-red-500/10 z-10"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="success-icon"
              initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <p className="text-xs font-black text-slate-700">
            {uploaded ? "Upload Complete!" : "Drag & Drop Resume"}
          </p>
          <p className="text-[10px] text-slate-400 font-bold leading-none">
            {uploaded ? "resume_ayush_2025.pdf" : "PDF or DOCX (Max 5MB)"}
          </p>
        </div>

        {/* Upload bar */}
        <div className="w-full mt-2">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden w-full relative">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1.5 leading-none">
            <span>{uploaded ? "1.2 MB" : "Uploading..."}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Step2ScanAnimation = () => {
  const [activeCheck, setActiveCheck] = useState(-1);
  const [activeTag, setActiveTag] = useState(-1);

  const tags = ["React.js", "Node.js", "TypeScript", "AWS"];

  useEffect(() => {
    setActiveCheck(-1);
    setActiveTag(-1);

    // Sequential checking items & tags popping in
    const t1 = setTimeout(() => setActiveCheck(0), 500);
    const t2 = setTimeout(() => { setActiveCheck(1); setActiveTag(0); }, 1000);
    const t3 = setTimeout(() => { setActiveCheck(2); setActiveTag(1); }, 1500);
    const t4 = setTimeout(() => { setActiveCheck(3); setActiveTag(2); }, 2000);
    const t5 = setTimeout(() => { setActiveTag(3); }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div className="flex gap-0 h-full select-none min-h-[320px]">
      {/* Resume Scan Panel */}
      <div className="relative flex-1 p-4 overflow-hidden bg-slate-50/50 backdrop-blur-sm">
        {/* Scanning laser beam */}
        <motion.div
          animate={{
            top: ["0%", "100%", "0%"]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, #3b82f6, #22d3ee, #3b82f6, transparent)",
            boxShadow: "0 0 12px 3px #22d3eeaa"
          }}
        />

        {/* Dotted target boxes */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="h-3 w-3/4 rounded-md bg-slate-200/80 animate-pulse" />
          <div className="h-2 w-2/5 rounded-md bg-slate-200/60 mb-2" />
          
          <div className="space-y-2.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-2 rounded-md bg-slate-200/50 w-full relative">
                {/* Visual "found keyword" highlights */}
                {i % 2 === 0 && activeTag >= i/2 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="absolute inset-0 bg-blue-400/20 border border-blue-400/30 rounded-md origin-left"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side checklist panel */}
      <div className="w-[150px] border-l flex flex-col p-3.5 gap-3.5 flex-shrink-0 bg-white/70 backdrop-blur-md" style={{ borderColor: "var(--border)" }}>
        <p className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 leading-none">AI Deep Scan</p>
        
        <div className="flex flex-col gap-2">
          {CHECKS.map((c, i) => {
            const passed = activeCheck >= i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.5, x: 5 }}
                animate={{ opacity: passed ? 1 : 0.5, x: 0 }}
                className="flex items-center gap-1.5"
              >
                <motion.div
                  animate={{
                    scale: passed ? [1, 1.2, 1] : 1,
                    backgroundColor: passed ? "#10b981" : "#e5e7eb"
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  {passed ? (
                    <svg width="7" height="7" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
                  )}
                </motion.div>
                <span className="text-[9px] font-bold text-slate-500 leading-tight truncate">{c.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Floating tags area */}
        <div className="mt-auto pt-2 border-t border-slate-100/50">
          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Extracted</p>
          <div className="flex flex-wrap gap-0.5 max-h-[48px] overflow-hidden">
            {tags.map((t, idx) => (
              activeTag >= idx && (
                <motion.span
                  key={t}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[7px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100"
                >
                  {t}
                </motion.span>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Step3ResultsAnimation = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    setScore(0);
    let s = 0;
    const interval = setInterval(() => {
      s += 2;
      setScore(s);
      if (s >= 96) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-0 h-full select-none min-h-[320px]">
      {/* Resume optimized preview */}
      <div className="relative flex-1 p-4 overflow-hidden bg-slate-50/50 backdrop-blur-sm">
        <HowItWorksResume done={true} />
      </div>

      {/* Score panel */}
      <div className="w-[150px] border-l flex flex-col p-3.5 gap-3.5 justify-center items-center flex-shrink-0 bg-white/70 backdrop-blur-md" style={{ borderColor: "var(--border)" }}>
        <p className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 leading-none">ATS SCORE</p>
        
        <div className="relative w-20 h-20 mt-1">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.2" />
            <motion.circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="url(#scoreGradHIW)" strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 4 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGradHIW" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-slate-800 leading-none">{score}</span>
          </div>
        </div>

        <div className="text-center space-y-0.5 mt-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 leading-none block">
            Highly Optimized
          </span>
          <span className="text-[7.5px] font-bold text-slate-400 leading-none block">
            Strong Match
          </span>
        </div>
      </div>
    </div>
  );
};

function AnimatedScanner({ activeStep }) {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Glow */}
      <div className="absolute -inset-8 rounded-full blur-[80px] opacity-10 pointer-events-none" style={{ background: "var(--primary)" }} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 rounded-3xl overflow-hidden border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_32px_80px_-16px_rgba(15,23,42,0.08)]"
      >
        {/* Header bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100/50 bg-white/50 backdrop-blur-md" style={{ borderColor: "var(--border)" }}>
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-[11px] font-bold text-gray-400 tracking-wide">
            {activeStep === 0 && "Upload Center"}
            {activeStep === 1 && "ATS Scan Simulator"}
            {activeStep === 2 && "Optimized Results"}
          </span>
        </div>

        <div className="relative overflow-hidden bg-white/10" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <Step1UploadAnimation />
              </motion.div>
            )}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <Step2ScanAnimation />
              </motion.div>
            )}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <Step3ResultsAnimation />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating score badge for Step 3 */}
      {activeStep === 2 && (
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-5 -right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-xl border border-emerald-100 flex items-center"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Score</p>
            <p className="text-xs font-black text-emerald-600 leading-none mt-0.5">96/100</p>
          </div>
        </motion.div>
      )}

      {/* Floating AI badge */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute -bottom-5 -left-4 z-20 px-3 py-2 rounded-2xl bg-white shadow-xl border border-blue-100 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ background: "var(--primary)" }}>
          <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">AI Core</p>
          <p className="text-[11px] font-black leading-none mt-0.5" style={{ color: "var(--primary)" }}>Active</p>
        </div>
      </motion.div>
    </div>
  );
}

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  // Auto transition steps every 8s unless clicked
  useEffect(() => {
    if (!isAuto) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuto]);

  const handleStepClick = (idx) => {
    setActiveStep(idx);
    setIsAuto(false); // Stop auto-advancing once user clicks
  };

  return (
    <section id="how" className="py-20 min-h-[100dvh] flex items-center relative overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Background radial meshes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.06] -translate-y-1/2" style={{ background: "var(--primary)" }} />
        <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] rounded-full blur-[120px] opacity-[0.04]" style={{ background: "var(--secondary)" }} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[11fr_13fr] items-center gap-12 lg:gap-16">
          {/* Left */}
          <div className="w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-150 bg-blue-50/90 text-[var(--primary)] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-5 shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" /> The Process
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight">
              How it works in <br /><span className="bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">3 Simple Steps</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-[var(--text-2)] text-base md:text-lg mb-10 font-semibold leading-relaxed max-w-xl">
              Getting past the ATS shouldn't be a mystery. We've simplified the process into a streamlined pipeline.
            </motion.p>

            {/* Glowing vertical timeline flow container */}
            <div className="relative pl-8 sm:pl-10 flex flex-col gap-6">
              
              {/* Dynamic vertical connection line */}
              <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-slate-200/60 rounded-full overflow-hidden">
                {/* Active segment glow */}
                <motion.div
                  className="absolute w-[2px] bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-400 rounded-full"
                  initial={{ top: "0%", bottom: "100%" }}
                  animate={{
                    top: `${(activeStep / STEPS.length) * 100}%`,
                    bottom: `${100 - ((activeStep + 1) / STEPS.length) * 100}%`
                  }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
                
                {/* Laser running dot */}
                <motion.div
                  className="absolute left-0 w-full h-8 rounded-full bg-gradient-to-b from-cyan-400 to-indigo-500 blur-[2px]"
                  animate={{
                    top: ["0%", "100%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {STEPS.map((s, i) => {
                const isActive = activeStep === i;
                return (
                  <div key={s.step} className="relative">
                    {/* Node bubble dot on the vertical line */}
                    <div 
                      className="absolute left-[-24px] sm:left-[-26px] top-7 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white flex items-center justify-center z-15 transition-all duration-300"
                      style={{
                        borderColor: isActive ? "#3b82f6" : "#e2e8f0",
                        boxShadow: isActive ? "0 0 12px #3b82f6" : "none"
                      }}
                    >
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + 0.2 }}
                      whileHover={{ x: 6, transition: { duration: 0.2 } }}
                      onClick={() => handleStepClick(i)}
                      className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border transition-all group cursor-pointer ${
                        isActive
                          ? "border-blue-150 bg-white shadow-xl shadow-blue-500/[0.04]"
                          : "border-transparent bg-white/40 hover:border-blue-100 hover:bg-white/80"
                      }`}
                    >
                      {/* Step Indicator Badge */}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative`}>
                        {s.icon}
                        
                        {/* Neon glow step label in corner */}
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[8px] font-black text-white bg-slate-900 rounded-full leading-none shadow-sm scale-90 border border-white/20">
                          {s.step}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-base md:text-lg font-black mb-1 group-hover:text-[var(--primary)] transition-colors ${
                          isActive ? "text-[var(--primary)]" : "text-[var(--text)]"
                        }`}>
                          {s.title}
                        </h3>
                        <p className="text-xs md:text-sm text-[var(--text-2)] font-semibold leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — Interactive Animated Scanner */}
          <div className="w-full flex items-center justify-center py-8">
            <AnimatedScanner activeStep={activeStep} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
