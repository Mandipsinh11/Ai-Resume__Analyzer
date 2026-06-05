import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PHRASES = [
  "gets you past ATS.",
  "lands more interviews.",
  "impresses recruiters.",
  "is optimized by AI.",
];


const TypeWriter = () => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[idx];
    let t;
    if (!del && text.length < phrase.length) {
      t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 52);
    } else if (!del && text.length === phrase.length) {
      t = setTimeout(() => setDel(true), 2000);
    } else if (del && text.length > 0) {
      t = setTimeout(() => setText(text.slice(0, -1)), 26);
    } else if (del) {
      setDel(false);
      setIdx((i) => (i + 1) % PHRASES.length);
    }
    return () => clearTimeout(t);
  }, [text, del, idx]);

  return (
    <span className="relative inline-block" style={{ fontSize: "calc(1em - 5px)" }}>
      <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent font-black">{text || "\u00A0"}</span>
      <span
        className="animate-pulse ml-0.5 text-cyan-400 font-extrabold"
      >
        |
      </span>
    </span>
  );
};

const MiniResume = () => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/50 shadow-[0_8px_32px_rgba(37,99,235,0.03)] flex flex-col gap-2.5 text-left h-[200px] overflow-hidden relative group"
    >
      {/* Decorative Scanner beam that runs periodically */}
      <motion.div
        animate={{
          top: ["-10%", "110%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 z-10 pointer-events-none"
        style={{ boxShadow: "0 0 10px 2px #22d3ee" }}
      />

      {/* Candidate Header */}
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100/50 flex-shrink-0">
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
            P
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white animate-pulse" />
        </div>
        <div>
          <h4 className="text-[11px] font-black text-slate-800 leading-none">Candidate Name</h4>
          <p className="text-[8.5px] font-semibold text-slate-400 mt-0.5 leading-none">Full-Stack Engineer</p>
        </div>
      </div>

      {/* Animated Resume Sections */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Dynamic Experience Item */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider">Experience</span>
            <span className="text-[7.5px] font-semibold text-slate-400">SF, CA</span>
          </div>
          
          <div className="relative pl-2 border-l border-blue-500/30">
            <p className="text-[8.5px] font-bold text-slate-700 leading-tight">Senior React Engineer @ TechHive</p>
            {activeSection === 0 && (
              <motion.p
                key="exp-0"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[7.5px] text-slate-500 leading-snug mt-0.5 font-medium"
              >
                🚀 <span className="text-blue-600 font-bold">Spearheaded</span> React 19 migration, boosting rendering efficiency by <span className="text-emerald-600 font-bold">42%</span>.
              </motion.p>
            )}
            {activeSection === 1 && (
              <motion.p
                key="exp-1"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[7.5px] text-slate-500 leading-snug mt-0.5 font-medium"
              >
                ⚡ <span className="text-blue-600 font-bold">Optimized</span> GraphQL APIs, slashing client-side load time by <span className="text-emerald-600 font-bold">1.2s</span>.
              </motion.p>
            )}
            {activeSection === 2 && (
              <motion.p
                key="exp-2"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[7.5px] text-slate-500 leading-snug mt-0.5 font-medium"
              >
                💡 <span className="text-blue-600 font-bold">Architected</span> reusable UI library, cutting development cycles by <span className="text-emerald-600 font-bold">25%</span>.
              </motion.p>
            )}
          </div>
        </div>

        {/* Dynamic Skills Grid */}
        <div className="space-y-1">
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider block">Key Expertise</span>
          <div className="flex flex-wrap gap-1">
            {[
              { name: "React.js", active: activeSection === 0 },
              { name: "TypeScript", active: activeSection === 0 },
              { name: "GraphQL", active: activeSection === 1 },
              { name: "Node.js", active: activeSection === 1 },
              { name: "Next.js", active: activeSection === 2 },
              { name: "Tailwind CSS", active: activeSection === 2 },
            ].map((skill, i) => (
              <motion.span
                key={skill.name}
                animate={{
                  scale: skill.active ? 1.05 : 1,
                  backgroundColor: skill.active ? "#eff6ff" : "#f8fafc",
                  borderColor: skill.active ? "#bfdbfe" : "#f1f5f9",
                  color: skill.active ? "#2563eb" : "#64748b",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="text-[7px] font-bold px-2 py-0.5 rounded-full border leading-none"
              >
                {skill.name}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opac = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden grid-bg"
      style={{ background: "var(--bg)" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Pulsing ambient mesh glows */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-20%] left-[-10%] w-[65%] h-[80%] rounded-full opacity-[0.16] blur-[150px]"
          style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)" }}
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[75%] rounded-full opacity-[0.12] blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 100%)" }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-28 pb-24 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        {/* LEFT COLUMN — Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-blue-50/90 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-8 shadow-sm backdrop-blur-sm"
            style={{ borderColor: "rgba(37,99,235,0.18)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-[var(--primary)]" />
            </span>
            Trusted by Job Seekers
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-[-0.04em] leading-tight mb-4 text-[var(--text)] h-[110px] sm:h-[120px] lg:h-[145px] xl:h-[175px] overflow-hidden"
          >
            Your dream job
            <br />
            <TypeWriter />
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg max-w-lg mb-6 leading-relaxed font-semibold text-[var(--text-2)]"
          >
            ATSify is the world's most advanced AI resume checker. Scan, score,
            and optimize your way to more interviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="group px-9 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-blue-500/25 overflow-hidden relative glow-button text-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-d))",
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                Analyze My Resume — Free
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/templates")}
              className="px-9 py-4 rounded-2xl font-black text-sm text-[var(--text)] border border-white/60 bg-white/75 backdrop-blur-md hover:bg-white/95 hover:border-blue-300 hover:shadow-md transition-all text-center"
            >
              View Templates
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-0 mt-4 p-1 rounded-2xl border border-[var(--border)] bg-white/65 backdrop-blur-md shadow-sm w-fit"
          >
            {[
              { value: "96%", label: "ATS Pass Rate" },
              { value: "5×", label: "More Interviews" },
              { value: "100+", label: "Resumes Optimized" },
            ].map((stat, idx) => (
              <div key={stat.label} className="flex items-center">
                <div className="text-center px-5 py-2">
                  <p className="text-2xl font-black text-[var(--primary)]">
                    {stat.value}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-3)] mt-0.5">
                    {stat.label}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="w-px h-8 bg-[var(--border)]" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN — Simplified App Preview */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: y2, opacity: opac }}
          className="relative hidden lg:flex items-center justify-end"
        >
          <motion.div
            whileHover={{ rotateY: 8, rotateX: -4, scale: 1.02 }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              rotateY: { type: "spring", stiffness: 100, damping: 20 },
              rotateX: { type: "spring", stiffness: 100, damping: 20 },
              scale: { type: "spring", stiffness: 120, damping: 20 }
            }}
            style={{ transformStyle: "preserve-3d", perspective: 1200 }}
            className="relative w-full max-w-[540px]"
          >
            {/* Card background */}
            <div className="rounded-[32px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_32px_80px_-16px_rgba(15,23,42,0.12)] overflow-hidden">
              {/* Top bar with avatar and basic info */}
              <div className="px-8 pt-8 pb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    P
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900 leading-none mb-1">
                      Candidate Name
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      Role • Skills • Location
                    </p>
                  </div>
                </div>
                {/* ATS badge in top-right */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/90 border border-emerald-100/80 backdrop-blur-sm">
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow-sm">
                    96
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-black tracking-[0.14em] text-emerald-600 uppercase">
                      ATS Score
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      Strong match
                    </span>
                  </div>
                </div>
              </div>

              {/* Fake resume preview */}
              <div className="px-8 pb-8 space-y-5">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black tracking-[0.24em] text-slate-400 uppercase">
                    Resume Overview
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    Keyword optimized
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </span>
                </div>

                {/* Two-column resume layout */}
                <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">
                  {/* Left column */}
                  <MiniResume />

                  {/* Right column – score breakdown */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-100/60 bg-white/60 backdrop-blur-md px-4 py-3.5 shadow-sm">
                      <p className="text-xs font-bold text-slate-500 mb-2 leading-none">
                        Match breakdown
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: "Keywords", value: 95 },
                          { label: "Formatting", value: 92 },
                          { label: "Experience", value: 96 },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs font-medium text-slate-500">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                  style={{ width: `${item.value}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                {item.value}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-50/60 bg-blue-50/40 backdrop-blur-md px-4 py-3.5 flex items-center justify-between gap-3 shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-600 leading-tight mb-0.5">
                          Next best action
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 leading-snug">
                          Add 2 more React projects to your resume.
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-md">
                        AI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>


    </section>
  );
};

export default Hero;