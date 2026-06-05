import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BRANDS = ["Google", "Meta", "Amazon", "Netflix", "Apple", "Stripe", "Spotify", "Airbnb"];

const CTA = () => {
  const navigate = useNavigate();

  const styleBlock = `
    @keyframes marquee-brands {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee-brands {
      animation: marquee-brands 20s linear infinite;
    }
  `;

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: styleBlock }} />

      {/* Futuristic Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] grid-bg" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[48px] p-10 md:p-20 text-center border border-white/60 bg-white/70 backdrop-blur-xl shadow-2xl shadow-blue-500/[0.04]"
        >
          {/* Deep pulsing gradient mesh background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-[120px] pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.1, 0.9, 1.1],
              x: [0, -30, 0],
              y: [0, 25, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-[120px] pointer-events-none"
          />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] mb-6 leading-tight">
              Stop being filtered out. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-650 to-cyan-500 bg-clip-text text-transparent">Start getting hired.</span>
            </h2>

            <p className="text-base md:text-lg font-semibold text-[var(--text-2)] mb-10 max-w-xl mx-auto leading-relaxed">
              ATSify helps you optimize your resume to bypass automated filters and get noticed by recruiters.
            </p>

            {/* Glowing Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 mb-16 max-w-md mx-auto sm:max-w-none">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="group px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-500/25 overflow-hidden relative glow-button text-center cursor-pointer"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-d))" }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Get Started for Free</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/pricing")}
                className="px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-[var(--text)] border border-white/60 bg-white/75 backdrop-blur-md hover:bg-white/95 hover:border-slate-350 transition-all shadow-sm hover:shadow text-center cursor-pointer"
              >
                Review Plans
              </motion.button>
            </div>

            {/* Recruiter Grayscale Marquee */}
            <div className="pt-10 border-t border-slate-100/50">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-3)] mb-6">
                Trusted by candidates at
              </p>
              
              <div className="relative flex overflow-hidden w-full max-w-xl mx-auto pointer-events-none">
                <div className="flex gap-16 min-w-max animate-marquee-brands opacity-40 grayscale py-1">
                  {[...Array(4)].flatMap(() => BRANDS).map((n, idx) => (
                    <span
                      key={`${n}-${idx}`}
                      className="text-sm md:text-base font-black tracking-tighter text-[var(--text-3)]"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                {/* Grayscale marquee side masks */}
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white/70 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/70 to-transparent z-10" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
