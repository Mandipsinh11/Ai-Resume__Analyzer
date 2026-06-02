import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    id: 1,
    q: "What makes a resume truly 'ATS-friendly'?",
    a: "An ATS-friendly resume avoids complex elements like text boxes, graphics, multi-column tables, and non-standard fonts that screeners cannot parse. It prioritizes clean chronological layouts, standard headings (e.g., 'Work Experience', 'Education'), and web-safe typography (e.g., Inter, Arial). All ATSify templates are engineered to ensure 100% compliance with these systems."
  },
  {
    id: 2,
    q: "What is a good ATS score to aim for before applying?",
    a: "A score of 80% or above is considered excellent and generally indicates a strong match for corporate roles. Reaching 100% is rarely necessary, as your goal is to pass initial automated filters and present keywords naturally. Focus on high-impact keywords and structural completeness."
  },
  {
    id: 3,
    q: "How should I customize my resume for different job applications?",
    a: "The most effective approach is to paste the job description into ATSify's scanner. Our AI detects missing keywords, action verbs, and skill requirements, allowing you to tailor your experience bullets and skills list specifically to the job within seconds."
  },
  {
    id: 4,
    q: "How does the AI optimize my bullet points without altering my real experience?",
    a: "Our AI reframes your existing bullet points by suggesting stronger action verbs, incorporating missing keywords, and prompting you to quantify results (e.g., adding percentages or revenue metrics). It reframes *how* you write about your experience to maximize impact, without fabrication."
  },
  {
    id: 5,
    q: "Does exporting my resume as a PDF affect its ATS compliance?",
    a: "No, provided the PDF is exported from our editor. ATSify generates structured PDFs where the text is fully highlightable and readable by parsers, unlike scanned images or certain graphic-heavy layouts. PDF is the recommended format for corporate portals."
  },
  {
    id: 6,
    q: "Are the resume templates certified recruiter-approved?",
    a: "Yes. Our library is designed in collaboration with hiring managers, recruiters, and HR professionals across tech, finance, and marketing. They follow the exact structural patterns that corporate recruiters prefer to see during manual reviews."
  },
  {
    id: 7,
    q: "Can I use these templates if I am a fresher or making a career pivot?",
    a: "Absolutely. We offer templates specifically structured for entry-level graduates (emphasizing education and projects over corporate history) and skills-based structures that highlight transferable skills for career changers."
  },
  {
    id: 8,
    q: "Can I customize the layout, colors, and margins of the templates?",
    a: "Yes. The ATSify editor gives you full control over text spacing, font sizes, margins, and accent colors, while maintaining the underlying grid structure. This ensures your resume remains ATS-compliant no matter how much you customize the design."
  }
];

export default function FAQ() {
  const [openId, setOpenId] = useState(1);
  return (
    <section id="faq" className="py-20 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full blur-[140px] opacity-[0.06]"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--primary)] text-xs font-black uppercase tracking-[0.3em] mb-4 bg-blue-50/95 border border-blue-150/80 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm shadow-sm"
          >
            Support
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight text-center animate-text-gradient"
          >
            Questions we get <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">Asked all the time</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqData.map((f, i) => {
            const isOpen = openId === f.id;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-[24px] overflow-hidden transition-all duration-300 border ${
                  isOpen 
                    ? "border-blue-200/90 bg-white/90 shadow-[0_16px_32px_rgba(37,99,235,0.05)]" 
                    : "border-white/50 bg-white/60 backdrop-blur-md shadow-[0_8px_20px_rgba(37,99,235,0.015)] hover:bg-white/85 hover:border-slate-200"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 sm:px-8 py-6 text-left cursor-pointer"
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${f.id}`}
                >
                  <span className={`font-bold text-sm sm:text-base transition-colors ${isOpen ? "text-blue-600" : "text-[var(--text)]"}`}>
                    {f.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
                    style={{
                      background: isOpen ? "var(--primary)" : "rgba(226, 232, 240, 0.8)",
                      color: isOpen ? "#fff" : "var(--text-2)",
                    }}
                    aria-hidden="true"
                  >
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${f.id}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 sm:px-8 pb-6 border-t border-slate-100/50 pt-4">
                        <p className="text-xs sm:text-sm leading-relaxed font-semibold text-[var(--text-2)]">
                          {f.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
