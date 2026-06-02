import { useParams, useNavigate } from "react-router-dom";
import { templates } from "../../../data/templates";
import { useState } from "react";
import { X, ArrowLeft, Search, Eye, Sparkles, Layers, Briefcase, FileText, Award } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { name: "All Templates", value: "all", icon: Layers },
  { name: "Simple", value: "simple", icon: FileText },
  { name: "Modern", value: "modern", icon: Sparkles },
  { name: "Professional", value: "professional", icon: Award },
  { name: "Role-Based", value: "role-based", icon: Briefcase },
];

const TemplatesPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const activeCategory = category || "all";

  // Filter templates based on category parameter and search query
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      activeCategory === "all" || template.category === activeCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.role && template.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (template.tag && template.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: "var(--bg)" }} className="min-h-screen text-[var(--text)] relative overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 w-full relative z-10">
        {/* Navigation & Title Block */}
        <div className="flex flex-col items-start gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:-translate-x-1 shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          <div className="max-w-2xl mt-4">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 bg-blue-50 text-[var(--primary)] border border-blue-100">
              Library
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] mb-4">
              Explore our <span style={{ color: "var(--primary)" }}>Templates</span>
            </h1>
            <p className="text-[var(--text-2)] text-lg font-semibold leading-relaxed">
              Recruiter-approved templates engineered to help you stand out. Filter by style or search for your specific role.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b border-[var(--border)] pb-8">
          {/* Categories Filter list */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() =>
                    cat.value === "all"
                      ? navigate("/templates")
                      : navigate(`/templates/${cat.value}`)
                  }
                  className={`flex items-center gap-2 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full border transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-blue-500/20"
                      : "bg-white hover:bg-slate-50 text-[var(--text-2)] border-[var(--border)]"
                  }`}
                >
                  <Icon size={14} />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search templates or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--border)] rounded-2xl text-sm font-semibold focus:outline-none focus:border-[var(--primary)] shadow-sm focus:ring-1 focus:ring-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Templates Grid - Clean 3-column layout */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTemplates.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-[32px] border border-[var(--border)] overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 group transition-all duration-500 cursor-pointer flex flex-col h-full"
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Visual Area */}
                <div className="relative h-[340px] overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6">
                  <img
                    src={template.img}
                    alt={template.name}
                    className="w-auto h-full max-h-[290px] object-contain shadow-md rounded-md group-hover:scale-[1.03] transition-transform duration-500"
                  />

                  {/* Actions overlay on hover */}
                  <div className="absolute inset-0 bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-white text-[var(--primary)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Eye size={20} />
                    </div>
                    <span className="px-5 py-2.5 rounded-xl bg-white text-[var(--primary)] font-black text-[10px] uppercase tracking-wider shadow-md hover:scale-105 transition-transform">
                      Preview Template
                    </span>
                  </div>

                  {/* Tag badge in top-left */}
                  {template.tag && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-[var(--primary)] shadow-sm border border-blue-50">
                        {template.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Footer */}
                <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-[var(--text)] tracking-tight mb-2">
                      {template.name}
                    </h3>
                    <p className="text-[var(--text-3)] text-[10px] font-black uppercase tracking-widest mb-3">
                      {template.category === "role-based" ? `Role: ${template.role}` : `${template.category} Layout`}
                    </p>
                    <p className="text-sm font-medium text-[var(--text-2)] leading-relaxed">
                      {template.desc || "A professional template structure designed to yield interview invites."}
                    </p>
                  </div>

                  <button className="w-full bg-[var(--bg-2)] hover:bg-[var(--primary)] text-[var(--text)] hover:text-white border border-[var(--border)] hover:border-[var(--primary)] py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm transition-all duration-300">
                    Use Template
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[var(--border)]">
            <p className="text-[var(--text-2)] text-lg font-semibold mb-2">No templates found matching your query.</p>
            <p className="text-[var(--text-3)] text-sm font-semibold">Try searching for generic terms or reset the filters.</p>
            <button
              onClick={() => { setSearchQuery(""); navigate("/templates"); }}
              className="mt-6 px-6 py-3 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:scale-102 transition-transform"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-900/5 hover:bg-slate-900/10 flex items-center justify-center text-slate-800 hover:scale-105 transition-all z-10"
                onClick={() => setSelectedTemplate(null)}
              >
                <X size={20} />
              </button>

              {/* Left Column: Template Visual */}
              <div className="md:w-1/2 h-[200px] sm:h-[260px] md:h-auto overflow-hidden bg-slate-50 flex items-center justify-center p-4 border-r border-slate-100">
                <img
                  src={selectedTemplate.img}
                  alt={selectedTemplate.name}
                  className="w-auto h-full max-h-[165px] sm:max-h-[220px] md:max-h-[380px] object-contain shadow-xl rounded-md"
                />
              </div>

              {/* Right Column: Actions & Details */}
              <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                <div className="flex-1">
                  <span className="inline-block text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.25em] mb-3">
                    {selectedTemplate.category === "role-based" ? "Role Specific Layout" : "Standard Design Layout"}
                  </span>
                  <h2 className="text-3xl font-black text-[var(--text)] tracking-tight mb-4">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-[var(--text-2)] text-base font-semibold leading-relaxed mb-6">
                    {selectedTemplate.desc || "This template prioritizes clean space, strong typography hierarchy, and standard layouts to capture attention."}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Fully ATS-compliant formatting & syntax",
                      "Recruiter-vetted layout hierarchy",
                      "Customizable colors and typography parameters",
                      "One-click high-quality PDF downloads"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[var(--text-2)]">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      navigate(`/editor/${selectedTemplate.id}`);
                    }}
                    className="w-full py-4.5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      navigate(`/analyze/${selectedTemplate.id}`);
                    }}
                    className="w-full py-4.5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/15 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Analyze Resume
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="w-full py-4.5 rounded-2xl bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] font-black text-xs uppercase tracking-widest hover:bg-[var(--bg-2)] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplatesPage;
