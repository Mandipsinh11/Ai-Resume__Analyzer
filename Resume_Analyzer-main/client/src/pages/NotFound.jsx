import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full opacity-[0.06] blur-[140px]"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-5%] w-[55%] h-[70%] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "var(--secondary)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(var(--primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Animated 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <span
            className="text-[160px] md:text-[200px] font-black leading-none tracking-tighter select-none"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--accent) 50%, var(--primary-d) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 0.15,
            }}
          >
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="-mt-24"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text)] mb-3">
            Page not found
          </h1>
          <p className="text-base md:text-lg font-medium text-[var(--text-2)] mb-10 leading-relaxed max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-blue-500/20 overflow-hidden relative"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-d))",
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 12H5m7-7l-7 7 7 7" />
                  </svg>
                  Back to Home
                </span>
              </motion.button>
            </Link>

            <Link to="/resume-analyzer">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl font-black text-sm text-[var(--text)] border-2 border-[var(--border)] bg-white hover:border-blue-200 hover:shadow-lg transition-all"
              >
                Try Resume Analyzer
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
