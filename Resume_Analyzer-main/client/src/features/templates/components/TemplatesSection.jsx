import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ExternalLink, Eye } from "lucide-react";

const templates = [
  { id: 1, name: "Modern Professional", img: "/templates/template1.png", tag: "Most Popular" },
  { id: 2, name: "Executive Suite", img: "/templates/template2.png", tag: "Corporate" },
  { id: 3, name: "Creative Edge", img: "/templates/template3.png", tag: "Designer" },
  { id: 4, name: "Minimalist", img: "/templates/template4.png", tag: "Clean" },
  { id: 5, name: "Tech Lead", img: "/templates/template5.png", tag: "Developer" },
  { id: 6, name: "Bold Impact", img: "/templates/template6.png", tag: "Sales" },
];

const TemplateCard = ({ t, i, setPreviewId, navigate }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Smooth rotation angles
    const rX = -(mouseY / height) * 14;
    const rY = (mouseX / width) * 14;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
      className="min-w-[300px] md:min-w-[340px] rounded-[32px] overflow-hidden bg-white/75 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-[0_32px_80px_rgba(37,99,235,0.06)] hover:border-blue-200 transition-all duration-300 group relative flex flex-col justify-between"
    >
      {/* Perspective Card Shimmer */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out z-10" />
      
      <div className="relative h-[360px] md:h-[400px] overflow-hidden bg-slate-100/50">
        <img
          src={t.img}
          alt={t.name}
          className="w-full h-full object-cover object-top transition-transform duration-750 group-hover:scale-[1.04]"
        />

        {/* Frosted overlay backdrop with single-click details display */}
        <div 
          className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[4px] cursor-pointer z-10"
          onClick={() => setPreviewId(t.id)}
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-xl backdrop-blur-md"
          >
            <Eye size={24} />
          </motion.div>
          <span className="px-5 py-2.5 rounded-xl bg-white/95 text-[var(--primary)] font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white transition-all">
            Quick Preview
          </span>
        </div>

        {t.tag && (
          <div className="absolute top-6 left-6 z-10">
            <span className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-[var(--primary)] shadow-sm border border-white/30">
              {t.tag}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex items-center justify-between border-t border-slate-100/50 bg-white/40 relative z-10">
        <div>
          <h3 className="text-xl font-black text-[var(--text)] tracking-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
            {t.name}
          </h3>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-3)]">
            Professional Layout
          </p>
        </div>
        <button 
          onClick={() => navigate(`/editor/${t.id}`)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-250 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:shadow-md transition-all shrink-0 cursor-pointer"
          title="Use Template"
        >
          <ExternalLink size={18} />
        </button>
      </div>
    </motion.div>
  );
};

const TemplatesSection = () => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState(null);

  const scroll = (dir) =>
    ref.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });

  const previewTemplate = templates.find((t) => t.id === previewId);

  return (
    <section id="templates" className="py-20 bg-[var(--bg)] relative overflow-hidden">
      {/* Ambient gradient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.06]" style={{ background: "var(--primary)" }} />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.04]" style={{ background: "var(--secondary)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 bg-blue-50/90 backdrop-blur-sm text-[var(--primary)] border border-blue-100/80 shadow-sm">
              Library
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight">
              ATS-optimized designs <br />
              <span className="text-[var(--primary)]">that actually get seen</span>
            </h2>
            <p className="text-[var(--text-2)] text-base md:text-lg font-semibold leading-relaxed">
              Choose from our collection of field-tested templates, designed in collaboration with top recruiters.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm hover:shadow-md cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm hover:shadow-md cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={() => navigate("/templates")}
              className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border border-slate-200 text-[var(--text)] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              Browse All
            </button>
          </div>
        </motion.div>

        <div
          ref={ref}
          className="flex gap-8 overflow-x-auto scroll-smooth no-scrollbar pb-10 overscroll-contain"
        >
          {templates.map((t, i) => (
            <TemplateCard
              key={t.id}
              t={t}
              i={i}
              setPreviewId={setPreviewId}
              navigate={navigate}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {previewId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white/60 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-md flex items-center justify-center text-slate-650 hover:text-slate-800 transition-all z-10 cursor-pointer shadow-sm"
                onClick={() => setPreviewId(null)}
              >
                <X size={24} />
              </button>

              <div className="md:w-1/2 h-[200px] sm:h-[260px] md:h-auto overflow-hidden bg-slate-100/50 flex items-center justify-center p-6 border-r border-slate-100/80">
                <img
                  src={previewTemplate?.img}
                  alt={previewTemplate?.name}
                  className="w-auto h-full max-h-[165px] sm:max-h-[220px] md:max-h-none md:w-full md:object-cover md:object-top shadow-lg rounded-xl border border-white"
                />
              </div>

              <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col overflow-y-auto">
                <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  Preview Mode
                </span>
                <h2 className="text-3xl font-black text-[var(--text)] tracking-tight mb-6">
                  {previewTemplate?.name}
                </h2>
                <div className="flex-1">
                  <p className="text-[var(--text-2)] text-sm md:text-base mb-8 leading-relaxed font-medium">
                    This template prioritizes whitespace and clean typography to ensure your skills and experience stand out to both AI and human recruiters.
                  </p>
                  <ul className="space-y-4 mb-10">
                    {[
                      "Recruiter-approved structure",
                      "Fully ATS-compliant formatting",
                      "Customizable color schemes",
                      "Export as high-quality PDF"
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3 text-[var(--text-2)] font-semibold text-xs md:text-sm">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      navigate(`/editor/${previewId}`);
                      setPreviewId(null);
                    }}
                    className="w-full py-4.5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer glow-button text-center"
                  >
                    Start with this Template
                  </button>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="w-full py-4.5 rounded-2xl bg-slate-100/80 border border-slate-200/50 text-[var(--text)] font-black text-xs uppercase tracking-widest hover:bg-slate-200/80 transition-all cursor-pointer text-center"
                  >
                    Keep Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TemplatesSection;
