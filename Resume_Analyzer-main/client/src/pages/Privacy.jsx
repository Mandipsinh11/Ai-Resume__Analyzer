import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, Database, RefreshCw } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--bg)" }} className="min-h-screen text-[var(--text)] relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-10 blur-[140px]"
          style={{
            background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-5 blur-[120px]"
          style={{
            background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          }}
        />
      </div>

      <main className="flex-grow max-w-4xl mx-auto px-6 md:px-12 pt-32 pb-24 w-full relative z-10">
        {/* Navigation & Title */}
        <div className="flex flex-col items-start gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:-translate-x-1 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>

          <div className="max-w-2xl mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 bg-blue-50 text-[var(--primary)] border border-blue-100">
              <Shield size={12} /> Privacy Protocols
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text)] mb-4">
              Privacy <span style={{ color: "var(--primary)" }}>Policy</span>
            </h1>
            <p className="text-[var(--text-3)] text-sm font-semibold">
              Last Updated: June 11, 2026
            </p>
          </div>
        </div>

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12 bg-white rounded-[40px] border border-[var(--border)] shadow-xl space-y-8 text-[var(--text-2)] text-base leading-relaxed"
        >
          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <Eye className="text-[var(--primary)]" size={20} /> 1. Information We Collect
            </h2>
            <p>
              We collect information that you directly provide to us when using ATSify.ai, including registration details (name, email address) and any resume content or work experience data you upload. We also gather automated technical usage data (IP address, browser type, device information) to monitor and optimize performance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <Database className="text-[var(--primary)]" size={20} /> 2. How We Use Your Data
            </h2>
            <p>
              Your personal data and uploaded resumes are used strictly to provide the core resume optimization, analyzer, and builder features. This includes feeding resume content to our AI parser and LLM engines to calculate score details. We do not sell or trade your personal resume data to third-party advertisers or recruitment agencies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <Lock className="text-[var(--primary)]" size={20} /> 3. Data Protection and Security
            </h2>
            <p>
              We implement industry-standard encryption protocols (SSL/TLS) for data transmission and protect stored credentials. Although we take extensive security measures, no electronic storage or internet transmission is completely secure, and we cannot guarantee absolute data protection.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <RefreshCw className="text-[var(--primary)]" size={20} /> 4. Data Retention and Erasure
            </h2>
            <p>
              We retain user profile data and saved resumes for as long as your account remains active. You can delete your saved resumes directly inside the Dashboard, or permanently request account closure and deletion of all linked personal metadata by contacting support in the Settings page.
            </p>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
