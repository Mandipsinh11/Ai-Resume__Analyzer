import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const ResumeEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobDescription = location.state?.jobDescription || "";
  const resumeRef = useRef();

  const selectedTemplate = location.state?.template || "modern";

  const isDarkTemplate = selectedTemplate === "tech";
  const templateStyles = {
    modern: "bg-white text-slate-800 border border-slate-200",
    professional: "bg-white text-gray-900 border-2 border-gray-300",
    executive: "bg-slate-50 text-slate-900 border-l-8 border-slate-800",
    minimal: "bg-white text-black",
    tech: "bg-slate-900 text-white border border-cyan-500",
  };

  // Fallback default state if page is refreshed directly
  const initialResumeData = location.state?.generatedResume || {
    fullName: "Jane Doe",
    targetRole: "AI/ML Intern",

    professionalSummary:
      "Passionate AI/ML enthusiast with experience building predictive models and intelligent applications.",

    skills: "Python, TensorFlow, PyTorch, Scikit-Learn, SQL",

    certifications: "Google Data Analytics, AWS Cloud Practitioner",

    experience: "Developed predictive models using Python and Scikit-Learn.",

    education: "B.S. in Computer Science",

    projects: "Built an end-to-end ATS resume analysis platform.",
  };

  const [resumeData, setResumeData] = useState(initialResumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [atsIssues, setAtsIssues] = useState([]);
  const [jobMatchScore, setJobMatchScore] = useState(0);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const scoreColor =
    atsScore >= 80
      ? "text-green-600"
      : atsScore >= 60
        ? "text-yellow-600"
        : "text-red-600";

  const handleChange = (e) => {
    setResumeData({
      ...resumeData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateATSScore = () => {
    let score = 0;
    const issues = [];

    if (resumeData.fullName) {
      score += 10;
    } else {
      issues.push("Missing Full Name");
    }

    if (resumeData.targetRole) {
      score += 10;
    } else {
      issues.push("Missing Target Role");
    }

    if (resumeData.professionalSummary) {
      score += 20;
    } else {
      issues.push("Add Professional Summary");
    }

    if (resumeData.skills) {
      score += 20;
    } else {
      issues.push("Add Core Skills");
    }

    if (resumeData.certifications) {
      score += 10;
    } else {
      issues.push("Add Certifications");
    }

    if (resumeData.experience) {
      score += 15;
    } else {
      issues.push("Add Experience");
    }

    if (resumeData.projects) {
      score += 10;
    } else {
      issues.push("Add Projects");
    }

    if (resumeData.education) {
      score += 5;
    } else {
      issues.push("Add Education");
    }

    setAtsScore(Math.min(score, 100));
    setAtsIssues(issues);
  };

  useEffect(() => {
    calculateATSScore();
  }, [resumeData]);

  const calculateJobMatch = () => {
    if (!jobDescription) return;

    const resumeText = `
    ${resumeData.skills}
    ${resumeData.experience}
    ${resumeData.projects}
    ${resumeData.professionalSummary}
  `.toLowerCase();

    const keywords = jobDescription.toLowerCase().match(/\b[a-zA-Z]{4,}\b/g);

    if (!keywords) return;

    const uniqueKeywords = [...new Set(keywords)];

    const matched = uniqueKeywords.filter((word) => resumeText.includes(word));

    const missing = uniqueKeywords.filter((word) => !resumeText.includes(word));

    const score = Math.round((matched.length / uniqueKeywords.length) * 100);

    setJobMatchScore(score);
    setMissingKeywords(missing.slice(0, 10));
  };
  useEffect(() => {
    calculateJobMatch();
  }, [resumeData]);

  const handleSave = () => {
    setIsSaving(true);
    console.log("Saving updated resume data to history...", resumeData);
    const existingResumes =
      JSON.parse(localStorage.getItem("savedResumes")) || [];

    const resumeId = location.state?.generatedResume?.resumeId || Date.now();

    const newResume = {
      resumeId,
      version: Date.now(),
      ...resumeData,
      createdAt: new Date().toISOString(),
    };

    existingResumes.push(newResume);

    localStorage.setItem("savedResumes", JSON.stringify(existingResumes));

    // Simulate API persistence
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Changes saved successfully!");
    }, 1000);
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageHeight = 297;
      const pageWidth = 210;
      const margin = 20;
      let y = 20;

      const ensurePageSpace = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      };

      const addSection = (title, content) => {
        if (!content?.trim()) return;

        ensurePageSpace(15);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(37, 99, 235);

        pdf.text(title, margin, y);

        y += 4;

        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, y, pageWidth - margin, y);

        y += 6;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(40, 40, 40);

        const lines = pdf.splitTextToSize(content, pageWidth - margin * 2);

        lines.forEach((line) => {
          ensurePageSpace(6);
          pdf.text(line, margin, y);
          y += 5;
        });

        y += 4;
      };

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(15, 23, 42);

      pdf.text((resumeData.fullName || "Your Name").toUpperCase(), margin, y);

      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(37, 99, 235);

      pdf.text(resumeData.targetRole || "Target Profession", margin, y);

      y += 8;

      pdf.setDrawColor(100, 116, 139);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);

      y += 10;

      // Sections
      addSection("TECHNICAL SKILLS", resumeData.skills);
      addSection("CERTIFICATIONS", resumeData.certifications);
      addSection("PROFESSIONAL EXPERIENCE", resumeData.experience);
      addSection("KEY TECHNICAL PROJECTS", resumeData.projects);
      addSection("EDUCATION", resumeData.education);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);

      pdf.text(
        "Generated by ATSify AI Resume Builder",
        margin,
        pageHeight - 10,
      );

      const fileName =
        resumeData.fullName?.trim().replace(/\s+/g, "_") || "ATSify";

      pdf.save(`${fileName}_Resume.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF.");
    }
  };

  const inputClasses =
    "w-full h-14 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";
  const textareaClasses =
    "w-full rounded-2xl bg-white border border-slate-200 p-5 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all";
  const labelClasses =
    "text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5 block";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Editor Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Resume Workspace
            </h1>
            <p className="text-sm text-[var(--text-3)]">
              Refine and customize your AI-generated layout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] font-semibold text-sm hover:bg-[var(--bg-2)] transition-all active:scale-95"
            >
              Exit Editor
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-blue-500/10 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all active:scale-95"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Dual Panel Split Workspace */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="space-y-5 p-6 rounded-3xl bg-[var(--bg-2)] border border-[var(--border)] shadow-xl shadow-black/5">
            <h2 className="text-lg font-black border-b border-[var(--border)] pb-3 mb-2">
              Edit Fields
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={resumeData.fullName}
                  onChange={handleChange}
                  className={textareaClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Target Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={resumeData.targetRole}
                  onChange={handleChange}
                  className={textareaClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Core Skills</label>
              <input
                type="text"
                name="skills"
                value={resumeData.skills}
                onChange={handleChange}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Certifications</label>
              <textarea
                name="certifications"
                value={resumeData.certifications || ""}
                onChange={handleChange}
                rows={3}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Professional Experience</label>
              <textarea
                name="experience"
                value={resumeData.experience}
                onChange={handleChange}
                rows={4}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Key Projects</label>
              <textarea
                name="projects"
                value={resumeData.projects}
                onChange={handleChange}
                rows={4}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Education</label>
              <textarea
                name="education"
                value={resumeData.education}
                onChange={handleChange}
                rows={3}
                className={textareaClasses}
              />
            </div>
          </div>

          {/* Right Column: Live Dynamic Preview */}
          {/* Right Column: Live Dynamic Preview */}
          <div>
            {/* ATS Score Card */}
            <div className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-blue-900">ATS Score Analyzer</h3>

                <span className={`text-2xl font-black ${scoreColor}`}>
                  {atsScore}/100
                </span>
              </div>

              <div className="mt-2 w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${atsScore}%` }}
                />
              </div>

              {atsIssues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase mb-2 text-red-600">
                    Improvement Suggestions
                  </h4>

                  <ul className="space-y-1">
                    {atsIssues.map((issue, index) => (
                      <li key={index} className="text-xs text-red-500">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Job Match Score Card */}
            <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-green-900">Job Match Score</h3>

                <span className="text-2xl font-black text-green-600">
                  {jobMatchScore}%
                </span>
              </div>

              <div className="mt-3 w-full h-3 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${jobMatchScore}%` }}
                />
              </div>

              {missingKeywords.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase mb-2 text-red-600">
                    Missing Keywords
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resume Preview */}
            <div
              ref={resumeRef}
              className={`sticky top-8 p-8 rounded-3xl shadow-xl min-h-[600px] flex flex-col justify-between ${templateStyles[selectedTemplate]}`}
            >
              {/* Document Header */}
              <div
                className={`text-center border-b-2 pb-4 mb-6 ${
                  isDarkTemplate ? "border-slate-600" : "border-slate-800"
                }`}
              >
                <h2
                  className={`text-3xl font-bold tracking-wide uppercase ${
                    isDarkTemplate ? "text-white" : "text-slate-900"
                  }`}
                >
                  {resumeData.fullName || "Your Name"}
                </h2>
                <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mt-1 font-sans">
                  {resumeData.targetRole || "Target Profession"}
                </p>
              </div>

              {/* Document Body Segments */}
              <div
                className={`space-y-5 text-sm leading-relaxed ${
                  isDarkTemplate ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {resumeData.professionalSummary && (
                  <div>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5 ${
                        isDarkTemplate
                          ? "text-white border-slate-700"
                          : "text-slate-900 border-slate-200"
                      }`}
                    >
                      Professional Summary
                    </h3>

                    <p className="whitespace-pre-wrap text-xs">
                      {resumeData.professionalSummary}
                    </p>
                  </div>
                )}

                {resumeData.skills && (
                  <div>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5 ${
                        isDarkTemplate
                          ? "text-white border-slate-700"
                          : "text-slate-900 border-slate-200"
                      }`}
                    >
                      Core Skills
                    </h3>
                    <p className="whitespace-pre-wrap text-xs">
                      {resumeData.skills}
                    </p>
                  </div>
                )}

                {resumeData.certifications && (
                  <div>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5 ${
                        isDarkTemplate
                          ? "text-white border-slate-700"
                          : "text-slate-900 border-slate-200"
                      }`}
                    >
                      Certifications
                    </h3>

                    <p className="whitespace-pre-wrap text-xs">
                      {resumeData.certifications}
                    </p>
                  </div>
                )}

                {resumeData.experience && (
                  <div>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5 ${
                        isDarkTemplate
                          ? "text-white border-slate-700"
                          : "text-slate-900 border-slate-200"
                      }`}
                    >
                      Work Experience
                    </h3>
                    <p className="whitespace-pre-wrap text-xs">
                      {resumeData.experience}
                    </p>
                  </div>
                )}

                {resumeData.projects && (
                  <div>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5 ${
                        isDarkTemplate
                          ? "text-white border-slate-700"
                          : "text-slate-900 border-slate-200"
                      }`}
                    >
                      Key Technical Projects
                    </h3>
                    <p className="whitespace-pre-wrap text-xs">
                      {resumeData.projects}
                    </p>
                  </div>
                )}

                {resumeData.education && (
                  <div>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5 ${
                        isDarkTemplate
                          ? "text-white border-slate-700"
                          : "text-slate-900 border-slate-200"
                      }`}
                    >
                      Education
                    </h3>
                    <p className="whitespace-pre-wrap text-xs">
                      {resumeData.education}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Print / Export Footer Notice */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="font-sans text-[10px] text-slate-400 tracking-wider uppercase">
                A4 Document Parsing Format • Optimised for ATS Scan Systems
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
