import { motion } from "framer-motion";
import { Target, ShieldCheck, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  {
    title: "Land More Interviews",
    icon: <Target size={22} className="text-blue-500" />,
    desc: "Resumes optimized with relevant keywords get up to 3x more recruiter callbacks. We help you align your experience directly with what companies search for.",
  },
  {
    title: "Zero Formatting Errors",
    icon: <ShieldCheck size={22} className="text-orange-500" />,
    desc: "Avoid automatic rejection caused by unreadable tables, multi-column blocks, legacy fonts, or hidden fields that trip up resume parsers.",
  },
  {
    title: "Scanner Approved",
    icon: <CheckCircle2 size={22} className="text-emerald-500" />,
    desc: "100% compatible and pre-tested to parse perfectly through Workday, Greenhouse, Taleo, Lever, and 100+ other major corporate hiring platforms.",
  },
];

const Compatibility = () => {
  return (
    <section
      id="why-atsify"
      className="py-20 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] grid-bg" />

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] pointer-events-none rounded-full blur-[150px] opacity-[0.08]"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--primary)] text-xs font-black uppercase tracking-[0.3em] mb-4 bg-blue-50/95 border border-blue-150/80 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm shadow-sm"
          >
            Why Choose Us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight"
          >
            Built to get you <span className="text-[var(--primary)]">hired</span>, not filtered
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-2)] text-base md:text-lg max-w-xl mx-auto font-semibold leading-relaxed"
          >
            Simple, automated resume optimization designed to bypass bot filters and stand out to hiring managers.
          </motion.p>
        </div>

        {/* 3 Outcome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="flex flex-col p-8 rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-md shadow-[0_16px_36px_rgba(37,99,235,0.02)] hover:border-blue-200 hover:bg-white hover:shadow-[0_20px_48px_rgba(37,99,235,0.05)] transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                {b.icon}
              </div>
              
              <h3 className="text-lg font-black text-[var(--text)] mb-3">{b.title}</h3>
              <p className="text-[13px] md:text-sm text-[var(--text-2)] font-semibold leading-relaxed">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Compatibility;
