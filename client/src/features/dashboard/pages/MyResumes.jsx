import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { DashboardNavbar } from "./Dashboard";

const MyResumes = () => {
  const navigate = useNavigate();
  const displayName = useMemo(() => {
    const r = localStorage.getItem("user");
    if (!r) return "User";
    try {
      const p = JSON.parse(r);
      return p.name || p.username || "User";
    } catch {
      return "User";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24 overflow-x-hidden relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }} />
      </div>

      <DashboardNavbar displayName={displayName} onLogout={handleLogout} />

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-40 px-6 md:px-12 max-w-7xl mx-auto w-full"
      >
        <div className="p-8 md:p-12 bg-[var(--bg-2)] rounded-[40px] border border-[var(--border)] shadow-xl min-h-[600px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-glow)] rounded-full blur-[120px] opacity-10 -mr-32 -mt-32" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[var(--text)] mb-3">
                  My Resumes
                </h1>
                <p className="text-lg font-medium text-[var(--text-3)] max-w-xl leading-relaxed">
                  Manage and organize your professional arsenal. Track performance and iterate on your drafts.
                </p>
              </div>
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> New Resume
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Empty State placeholder for now but styled */}
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--border)] rounded-[32px] bg-[var(--bg)]/50 group hover:bg-[var(--bg)] transition-all">
                <div className="w-20 h-20 rounded-[28px] bg-[var(--bg-2)] border border-[var(--border)] flex items-center justify-center mb-8 text-[var(--text-3)] group-hover:scale-110 transition-transform">
                  <FileText className="w-10 h-10 opacity-40" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-[var(--text)] mb-4">No documents yet</h3>
                <p className="text-lg font-medium text-[var(--text-3)] max-w-sm mb-8">
                  Start your first AI analysis to generate a high-performance resume draft.
                </p>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-[var(--border)]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-3)] mb-8">Upcoming Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[var(--text-2)]">
                {[
                  { title: "Direct PDF Export", desc: "Print-ready professional layouts with single-click export." },
                  { title: "A/B Performance Tracking", desc: "See which versions get the best response from recruiters." },
                  { title: "Smart Version History", desc: "Never lose a great bullet point with full iteration logs." }
                ].map((feature, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <p className="text-lg font-bold text-[var(--text)]">{feature.title}</p>
                    <p className="text-sm font-medium leading-relaxed opacity-60">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default MyResumes;
