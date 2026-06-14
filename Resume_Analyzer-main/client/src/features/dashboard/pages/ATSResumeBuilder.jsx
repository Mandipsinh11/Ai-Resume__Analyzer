import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ATSResumeBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal"); // personal | experience | optimization
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    targetRole: "",
    professionalSummary: "",
    experience: "",
    skills: "",
    certifications: "",
    education: "",
    projects: "",
    jobDescription: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.targetRole) {
      alert("Please provide at least your Name and Target Role.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/ai-resume/generate-ats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Resume generation failed");
      }

      const generatedResume = await response.json();

      navigate("/resume-editor", {
        state: {
          generatedResume,
          template: selectedTemplate,
        },
      });
    } catch (error) {
      console.error("Resume generation error:", error);
      alert("Failed to generate Resume with ATS.");
    } finally {
      setIsGenerating(false);
    }
  };

  const inputClasses =
    "w-full h-14 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";
  const textareaClasses =
    "w-full rounded-2xl bg-white border border-slate-200 p-5 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all";
  const labelClasses =
    "text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2 block";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Navigation Header */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--text-3)] bg-clip-text text-transparent">
              Create Resume with ATS
            </h1>
            <p className="text-[var(--text-3)] mt-1">
              Build an optimized, machine-readable resume from scratch with AI.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] font-semibold transition-all hover:bg-[var(--bg)] active:scale-95 text-sm"
          >
            Cancel
          </Link>
        </div>

        {/* Multi-Step Tab Navigation Bar */}
        <div className="flex border-b border-[var(--border)] mb-8 p-1 bg-[var(--bg-2)] rounded-2xl">
          {[
            { id: "personal", label: "👤 Personal Info" },
            { id: "experience", label: "💼 Professional Details" },
            { id: "optimization", label: "🎯 ATS Targeting" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/10"
                  : "text-[var(--text-3)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Form Container Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-lg">
          {/* Step 1: Personal Info */}
          {activeTab === "personal" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-black mb-4">
                Identity & Target Role
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g., John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={textareaClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Target Role</label>
                  <input
                    type="text"
                    name="targetRole"
                    placeholder="e.g., AI/ML Intern"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className={textareaClasses}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveTab("experience")}
                  className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Continue to Experience
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {activeTab === "experience" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-black mb-4">
                Background & Core Competencies
              </h2>

              <div>
                <label className={labelClasses}>
                  Experience Level / Summary
                </label>
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g., Entry-level, 2 years academic projects..."
                  value={formData.experience}
                  onChange={handleChange}
                  className={textareaClasses}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Skills & Technologies</label>
                  <textarea
                    name="skills"
                    placeholder="List languages, frameworks, or databases (comma-separated)..."
                    value={formData.skills}
                    onChange={handleChange}
                    rows={5}
                    className={textareaClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Education Summary</label>
                  <textarea
                    name="education"
                    placeholder="Degree, Institution, Graduation Year..."
                    value={formData.education}
                    onChange={handleChange}
                    rows={5}
                    className={textareaClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Key Projects</label>
                <textarea
                  name="projects"
                  placeholder="Detail significant tech stacks used, scope, and engineering metrics accomplished..."
                  value={formData.projects}
                  onChange={handleChange}
                  rows={4}
                  className={textareaClasses}
                />
              </div>

              {/* Resume Template */}
              <div>
                <label className={labelClasses}>Resume Template</label>

                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className={textareaClasses}
                >
                  <option value="modern">Modern ATS</option>
                  <option value="professional">Professional</option>
                  <option value="executive">Executive</option>
                  <option value="minimal">Minimal</option>
                  <option value="tech">Tech Resume</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setActiveTab("personal")}
                  className="px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-sm transition-all active:scale-95"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab("optimization")}
                  className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Continue to Target Job
                </button>
              </div>
            </div>
          )}

          {/* Step 3: ATS Targeting */}
          {activeTab === "optimization" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="mb-4">
                <h2 className="text-xl font-black">
                  Tailor for the Application
                </h2>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Providing a target description allows the AI to systematically
                  inject mandatory contextual keywords.
                </p>
              </div>

              <div>
                <label className={labelClasses}>
                  Target Job Description (Optional)
                </label>
                <textarea
                  name="jobDescription"
                  placeholder="Paste the full job listing description details text here..."
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows={7}
                  className={textareaClasses}
                />
              </div>

              <div className="pt-4 flex justify-between items-center gap-4">
                <button
                  onClick={() => setActiveTab("experience")}
                  className="px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-sm transition-all active:scale-95"
                  disabled={isGenerating}
                >
                  Back
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isGenerating
                      ? "bg-blue-500/50 text-white/70 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/10 active:scale-95"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Parsing Metrics...
                    </>
                  ) : (
                    "✨ Generate Resume with ATS"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSResumeBuilder;
