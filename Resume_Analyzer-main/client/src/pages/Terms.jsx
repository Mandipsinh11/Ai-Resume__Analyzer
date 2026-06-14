import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Terms = () => {
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
              <Scale size={12} /> Legal Framework
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text)] mb-4">
              Terms of <span style={{ color: "var(--primary)" }}>Service</span>
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
              <FileText className="text-[var(--primary)]" size={20} /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using <strong>ATSify.ai</strong> ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Our services are available only to individuals who are at least 18 years old or the age of majority in their jurisdiction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <CheckCircle2 className="text-[var(--primary)]" size={20} /> 2. Description of Service
            </h2>
            <p>
              ATSify.ai provides an AI-powered resume analyzer, builder, and optimization service. We use automated algorithms and machine learning models to review, analyze, and generate professional resume suggestions optimized for applicant tracking systems. We do not guarantee employment, interviews, or specific career outcomes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <ShieldAlert className="text-[var(--primary)]" size={20} /> 3. User Accounts and Content
            </h2>
            <p>
              To access certain features, you must register for an account. You are responsible for keeping your account credentials secure. You retain all ownership rights to any resumes, text, or profile information you upload ("User Content"). By uploading content, you grant us a worldwide, non-exclusive license to process your content solely to deliver the services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <Scale className="text-[var(--primary)]" size={20} /> 4. Acceptable Use Policy
            </h2>
            <p>
              You agree not to use the Platform to upload any malicious, infringing, offensive, or inaccurate content. Scraping, reverse engineering, or attempting to compromise the security or infrastructure of the Platform is strictly prohibited and will result in immediate termination of access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text)] flex items-center gap-3">
              <FileText className="text-[var(--primary)]" size={20} /> 5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, ATSify.ai and its creators shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including but not limited to loss of career opportunities, data loss, or server downtime.
            </p>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
