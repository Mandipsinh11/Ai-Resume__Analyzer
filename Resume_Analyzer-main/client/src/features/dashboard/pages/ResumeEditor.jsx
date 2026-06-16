import React, { useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import jsPDF from "jspdf";
import { templates } from "../../../data/templates";

// Robust parsers to split text blocks into structured arrays
const parseExperience = (text) => {
  if (!text) return [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const entries = [];
  let currentEntry = null;

  lines.forEach(line => {
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, "");
      if (currentEntry) {
        currentEntry.highlights.push(cleanBullet);
      } else {
        currentEntry = { title: "", company: "", dates: "", highlights: [cleanBullet] };
        entries.push(currentEntry);
      }
    } else {
      let dates = "";
      let headerText = line;
      
      const dateMatch = line.match(/\(([^)]+)\)/);
      if (dateMatch) {
        dates = dateMatch[1];
        headerText = line.replace(/\(([^)]+)\)/, "").trim();
      } else {
        const datePattern = /(\d{4}\s*-\s*(?:\d{4}|[Pp]resent|[Cc]urrent))/;
        const fallbackMatch = line.match(datePattern);
        if (fallbackMatch) {
          dates = fallbackMatch[1];
          headerText = line.replace(datePattern, "").trim();
        }
      }

      let title = headerText;
      let company = "";
      const splitWord = headerText.includes(" at ") ? " at " : headerText.includes(" | ") ? " | " : headerText.includes(" - ") ? " - " : "";
      if (splitWord) {
        const parts = headerText.split(splitWord);
        title = parts[0].trim();
        company = parts.slice(1).join(splitWord).trim();
      }

      currentEntry = {
        title,
        company,
        dates,
        highlights: []
      };
      entries.push(currentEntry);
    }
  });

  return entries;
};

const parseEducation = (text) => {
  if (!text) return [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    let dates = "";
    let headerText = line;
    const dateMatch = line.match(/\(([^)]+)\)/);
    if (dateMatch) {
      dates = dateMatch[1];
      headerText = line.replace(/\(([^)]+)\)/, "").trim();
    }
    
    let degree = headerText;
    let school = "";
    const splitWord = headerText.includes(" - ") ? " - " : headerText.includes(" at ") ? " at " : headerText.includes(" | ") ? " | " : "";
    if (splitWord) {
      const parts = headerText.split(splitWord);
      degree = parts[0].trim();
      school = parts.slice(1).join(splitWord).trim();
    }
    
    return { degree, school, dates };
  });
};

const parseProjects = (text) => {
  if (!text) return [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const entries = [];
  let currentEntry = null;

  lines.forEach(line => {
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, "");
      if (currentEntry) {
        currentEntry.highlights.push(cleanBullet);
      } else {
        currentEntry = { name: "Project", highlights: [cleanBullet] };
        entries.push(currentEntry);
      }
    } else {
      currentEntry = { name: line, highlights: [] };
      entries.push(currentEntry);
    }
  });

  return entries;
};

const ResumeEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const resumeRef = useRef();

  // Find the selected template configuration by matching ID or fallback
  const template = templates.find((t) => t.id === parseInt(templateId)) || templates[0];

  // Map each of the 16 template images to their respective structural layouts
  const getLayoutType = (tmpl) => {
    if (!tmpl || !tmpl.img) return "single-column-classic";
    const match = tmpl.img.match(/template(\d+)\.png/);
    const num = match ? parseInt(match[1]) : 2;

    if (num === 13) return "top-banner-photo";
    if (num === 14 || num === 15) return "green-header-split";
    if (num === 2 || num === 10) return "two-column-dark-sidebar";
    if (num === 3 || num === 9) return "two-column-grey-sidebar";
    if (num === 12) return "two-column-serif";
    if (num === 6 || num === 8) return "two-column-split-line";
    if (num === 11) return "neon-startup-gold";
    if (num === 4) return "single-column-border";
    if (num === 1 || num === 5) return "single-column-centered";
    return "single-column-classic";
  };

  const layoutType = getLayoutType(template);

  // Configure typography, color palettes, spacing and layout options for all 16 template variants
  const getTemplateConfig = (tmpl) => {
    const layout = getLayoutType(tmpl);
    const match = tmpl?.img?.match(/template(\d+)\.png/);
    const num = match ? parseInt(match[1]) : 2;

    const defaultConf = {
      layout,
      font: "helvetica",
      primaryColor: [37, 99, 235], // Blue [R,G,B]
      primaryHex: "#2563eb",
      sidebarBg: "#f8fafc",
      sidebarBgRGB: [248, 250, 252],
      skillsFormat: "list",
      isDarkSidebar: false,
    };

    if (num === 1) {
      return { ...defaultConf, primaryHex: "#1e3a8a", primaryColor: [30, 58, 138] };
    }
    if (num === 2) {
      return {
        ...defaultConf,
        primaryHex: "#1e3a8a",
        primaryColor: [30, 58, 138],
        sidebarBg: "#1e3a8a",
        sidebarBgRGB: [30, 58, 138],
        isDarkSidebar: true,
        skillsFormat: "progress"
      };
    }
    if (num === 3) {
      return {
        ...defaultConf,
        primaryHex: "#0f172a",
        primaryColor: [15, 23, 42],
        sidebarBg: "#f8fafc",
        sidebarBgRGB: [248, 250, 252]
      };
    }
    if (num === 4) {
      return { ...defaultConf, primaryHex: "#0f172a", primaryColor: [15, 23, 42] };
    }
    if (num === 5) {
      return { ...defaultConf, primaryHex: "#0284c7", primaryColor: [2, 132, 199], skillsFormat: "tags" };
    }
    if (num === 6) {
      return { ...defaultConf, primaryHex: "#7c3aed", primaryColor: [124, 58, 237], skillsFormat: "tags" };
    }
    if (num === 7) {
      return { ...defaultConf, primaryHex: "#1e293b", primaryColor: [30, 41, 59] };
    }
    if (num === 8) {
      return { ...defaultConf, primaryHex: "#1e3a8a", primaryColor: [30, 58, 138] };
    }
    if (num === 9) {
      return {
        ...defaultConf,
        primaryHex: "#0f172a",
        primaryColor: [15, 23, 42],
        sidebarBg: "#f1f5f9",
        sidebarBgRGB: [241, 245, 249]
      };
    }
    if (num === 10) {
      return {
        ...defaultConf,
        primaryHex: "#f59e0b",
        primaryColor: [245, 158, 11],
        sidebarBg: "#0f172a",
        sidebarBgRGB: [15, 23, 42],
        isDarkSidebar: true,
        skillsFormat: "tags"
      };
    }
    if (num === 11) {
      return { ...defaultConf, primaryHex: "#d97706", primaryColor: [217, 119, 6] };
    }
    if (num === 12) {
      return {
        ...defaultConf,
        font: "times",
        primaryHex: "#1e293b",
        primaryColor: [30, 41, 59],
        sidebarBg: "#f8fafc",
        sidebarBgRGB: [248, 250, 252],
        skillsFormat: "progress"
      };
    }
    if (num === 13) {
      return {
        ...defaultConf,
        primaryHex: "#d97706",
        primaryColor: [217, 119, 6],
        skillsFormat: "progress"
      };
    }
    if (num === 14) {
      return {
        ...defaultConf,
        primaryHex: "#0d9488",
        primaryColor: [13, 148, 136],
        sidebarBg: "#f8fafc",
        sidebarBgRGB: [248, 250, 252]
      };
    }
    if (num === 15) {
      return {
        ...defaultConf,
        primaryHex: "#15803d",
        primaryColor: [21, 128, 61]
      };
    }
    if (num === 16) {
      return { ...defaultConf, primaryHex: "#334155", primaryColor: [51, 65, 85] };
    }

    return defaultConf;
  };

  const config = getTemplateConfig(template);

  const initialResumeData = location.state?.generatedResume || {
    fullName: "Jane Doe",
    targetRole: "AI/ML Intern",
    email: "jane.doe@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/janedoe",
    github: "github.com/janedoe",

    professionalSummary:
      "Passionate AI/ML enthusiast with experience building predictive models and intelligent applications.",

    skills: "Python, TensorFlow, PyTorch, Scikit-Learn, SQL",

    certifications: "Google Data Analytics, AWS Cloud Practitioner",

    experience: "Senior AI Engineer at Google (2022 - Present)\n• Led team of 5 researchers to optimize Gemini inference architectures, saving 35% memory bandwidth.\n• Deployed custom PyTorch pipelines reducing latency in automated document parsing setups.\n\nML Engineer Intern at Meta (2020 - 2022)\n• Built predictive classification algorithms using Scikit-Learn to filter spam reviews.",

    education: "M.S. in Computer Science at Stanford University (2018 - 2020)\nB.S. in Computer Science at UC Berkeley (2014 - 2018)",

    projects: "ATSify Intelligence Engine (2023)\n• Constructed an end-to-end ATS score parser matching candidate keywords to target job descriptions.\n• Reduced parser processing times by 50% through smart local vector caches.",
  };

  const [resumeData, setResumeData] = useState(initialResumeData);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setResumeData({
      ...resumeData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : {};
    const plan = userObj.subscription?.plan || "free";
    const existingResumes = JSON.parse(localStorage.getItem("savedResumes")) || [];

    const isNew = !resumeData.id;

    if (isNew) {
      if (plan === "free") {
        alert("Please upgrade to a Basic or Pro plan to save a new resume!");
        navigate("/dashboard?upgrade=all");
        return;
      }
      if (plan === "basic" && existingResumes.length >= 4) {
        alert("You have reached the limit of 4 saved resumes on the Basic plan. Please upgrade to Pro for unlimited resume creation!");
        navigate("/dashboard?upgrade=pro");
        return;
      }
    }

    setIsSaving(true);
    console.log("Saving updated resume data to history...", resumeData);

    const newResume = {
      id: resumeData.id || Date.now(),
      ...resumeData,
      createdAt: resumeData.createdAt || new Date().toISOString(),
    };

    const index = existingResumes.findIndex((r) => r.id === newResume.id);
    if (index !== -1) {
      existingResumes[index] = newResume;
    } else {
      existingResumes.push(newResume);
    }

    localStorage.setItem("savedResumes", JSON.stringify(existingResumes));

    setTimeout(() => {
      setIsSaving(false);
      alert("Changes saved successfully!");
    }, 1000);
  };

  // PDF Compiling engine configured for high-fidelity exact visual duplication of layout profiles
  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageHeight = 297;
      const pageWidth = 210;

      // Auto paging space calculator
      const ensurePageSpace = (currentY, requiredHeight = 10, pageResetX = 15, isSidebar = false) => {
        if (currentY + requiredHeight > pageHeight - 15) {
          pdf.addPage();
          if (isSidebar) {
            pdf.setFillColor(config.sidebarBgRGB[0], config.sidebarBgRGB[1], config.sidebarBgRGB[2]);
            pdf.rect(0, 0, 75, 297, "F");
          }
          return 15;
        }
        return currentY;
      };

      const customFont = config.font === "times" ? "times" : "helvetica";
      pdf.setFont(customFont);

      const parsedExp = parseExperience(resumeData.experience);
      const parsedEdu = parseEducation(resumeData.education);
      const parsedProj = parseProjects(resumeData.projects);
      const skillsList = resumeData.skills ? resumeData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

      if (config.layout === "top-banner-photo") {
        // --- TOP BANNER PHOTO PDF ---
        let y = 15;
        pdf.setFillColor(236, 244, 248);
        pdf.rect(0, 0, pageWidth, 48, "F");
        
        pdf.setFont(customFont, "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(15, 23, 42);
        pdf.text((resumeData.fullName || "Jane Doe").toUpperCase(), 15, y + 8);

        pdf.setFont(customFont, "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.text(resumeData.targetRole || "Target Profession", 15, y + 15);

        pdf.setFont(customFont, "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        const contactLine = `${resumeData.email}  |  ${resumeData.phone}  |  ${resumeData.location}  |  ${resumeData.linkedin}`;
        pdf.text(contactLine, 15, y + 21);

        // Circular initials avatar card
        pdf.setFillColor(250, 235, 232);
        pdf.circle(180, y + 10, 11, "F");
        pdf.setFont(customFont, "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(15, 23, 42);
        const initials = resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "JD";
        pdf.text(initials, 180, y + 11, { align: "center" });

        y = 58;

        const addTimelineSection = (title, items, isExp = true) => {
          if (items.length === 0) return;
          y = ensurePageSpace(y, 15);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text(title, 15, y);
          y += 2;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(15, y, pageWidth - 15, y);
          y += 6;

          items.forEach(item => {
            const heading = isExp ? `${item.title} ${item.company ? `at ${item.company}` : ""}` : item.name;
            const dates = isExp ? item.dates : "PROJECT";
            
            y = ensurePageSpace(y, 12);
            pdf.setFont(customFont, "bold");
            pdf.setFontSize(9.5);
            pdf.setTextColor(15, 23, 42);
            pdf.text(dates, 15, y);
            pdf.text(heading, 60, y);
            y += 4.5;

            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(71, 85, 105);

            if (item.highlights && item.highlights.length > 0) {
              item.highlights.forEach(hl => {
                const lines = pdf.splitTextToSize(`• ${hl}`, 135);
                lines.forEach(ln => {
                  y = ensurePageSpace(y, 5);
                  pdf.text(ln, 60, y);
                  y += 4.5;
                });
              });
            }
            y += 2.5;
          });
          y += 3;
        };

        addTimelineSection("WORK EXPERIENCE", parsedExp, true);
        addTimelineSection("KEY PROJECTS", parsedProj, false);

        if (resumeData.professionalSummary) {
          y = ensurePageSpace(y, 16);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text("PROFESSIONAL SUMMARY", 15, y);
          y += 2;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(15, y, pageWidth - 15, y);
          y += 5;

          pdf.setFont(customFont, "normal");
          pdf.setFontSize(9.5);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(resumeData.professionalSummary, 180);
          lines.forEach(ln => {
            y = ensurePageSpace(y, 5);
            pdf.text(ln, 15, y);
            y += 4.5;
          });
          y += 4;
        }

        if (skillsList.length > 0) {
          y = ensurePageSpace(y, 18);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text("CORE SKILLS", 15, y);
          y += 2;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(15, y, pageWidth - 15, y);
          y += 6;

          skillsList.forEach((sk, i) => {
            y = ensurePageSpace(y, 6);
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(15, 23, 42);
            pdf.text(sk, 15, y);

            pdf.setDrawColor(230, 230, 230);
            pdf.line(75, y - 1, 145, y - 1);
            pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
            pdf.line(75, y - 1, 75 + (i % 2 === 0 ? 55 : 45), y - 1);
            y += 5.5;
          });
        }

        if (parsedEdu.length > 0) {
          y = ensurePageSpace(y, 16);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text("EDUCATION", 15, y);
          y += 2;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(15, y, pageWidth - 15, y);
          y += 6;

          parsedEdu.forEach(edu => {
            y = ensurePageSpace(y, 12);
            pdf.setFont(customFont, "bold");
            pdf.setFontSize(9.5);
            pdf.setTextColor(15, 23, 42);
            pdf.text(edu.dates || "", 15, y);
            pdf.text(`${edu.degree} — ${edu.school}`, 60, y);
            y += 6;
          });
        }

        if (resumeData.certifications) {
          y = ensurePageSpace(y, 16);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text("CERTIFICATIONS", 15, y);
          y += 2;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(15, y, pageWidth - 15, y);
          y += 5;

          pdf.setFont(customFont, "normal");
          pdf.setFontSize(9.5);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(resumeData.certifications, 180);
          lines.forEach(ln => {
            y = ensurePageSpace(y, 5);
            pdf.text(ln, 15, y);
            y += 4.5;
          });
        }

        pdf.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.rect(0, pageHeight - 5, pageWidth, 5, "F");

      } else if (config.layout === "green-header-split") {
        // --- GREEN HEADER SPLIT ---
        pdf.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 42, "F");

        pdf.setFont(customFont, "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text(resumeData.fullName || "Jane Doe", 15, 20);

        pdf.setFont(customFont, "normal");
        pdf.setFontSize(10.5);
        pdf.setTextColor(230, 242, 235);
        pdf.text(resumeData.targetRole || "Target Profession", 15, 27);

        // Sidebar Background Left
        pdf.setFillColor(config.sidebarBgRGB[0], config.sidebarBgRGB[1], config.sidebarBgRGB[2]);
        pdf.rect(0, 42, 75, 255, "F");

        let leftY = 52;
        let rightY = 52;

        const addLeftHeader = (title) => {
          leftY = ensurePageSpace(leftY, 15, 12, false);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(10.5);
          pdf.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.text(title, 12, leftY);
          leftY += 2;
          pdf.setDrawColor(210, 225, 218);
          pdf.line(12, leftY, 68, leftY);
          leftY += 5;
        };

        addLeftHeader("CONTACT");
        pdf.setFont(customFont, "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(71, 85, 105);
        if (resumeData.email) { pdf.text(resumeData.email, 12, leftY); leftY += 4.5; }
        if (resumeData.phone) { pdf.text(resumeData.phone, 12, leftY); leftY += 4.5; }
        if (resumeData.location) { pdf.text(resumeData.location, 12, leftY); leftY += 4.5; }
        if (resumeData.linkedin) { pdf.text(resumeData.linkedin, 12, leftY); leftY += 4.5; }
        if (resumeData.github) { pdf.text(resumeData.github, 12, leftY); leftY += 6; }

        if (skillsList.length > 0) {
          addLeftHeader("CORE SKILLS");
          skillsList.forEach(sk => {
            leftY = ensurePageSpace(leftY, 5, 12, false);
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(8.5);
            pdf.setTextColor(71, 85, 105);
            pdf.text(`• ${sk}`, 12, leftY);
            leftY += 4.5;
          });
          leftY += 2;
        }

        if (resumeData.certifications) {
          addLeftHeader("CERTIFICATIONS");
          pdf.setFont(customFont, "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(resumeData.certifications, 55);
          lines.forEach(ln => {
            leftY = ensurePageSpace(leftY, 4.5, 12, false);
            pdf.text(ln, 12, leftY);
            leftY += 4;
          });
        }

        const addRightSection = (title, contentLinesCallback) => {
          rightY = ensurePageSpace(rightY, 15, 83, false);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text(title, 83, rightY);
          rightY += 2;
          pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.line(83, rightY, 195, rightY);
          rightY += 5;
          contentLinesCallback();
          rightY += 4;
        };

        if (resumeData.professionalSummary) {
          addRightSection("PROFESSIONAL SUMMARY", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(71, 85, 105);
            const lines = pdf.splitTextToSize(resumeData.professionalSummary, 112);
            lines.forEach(ln => {
              rightY = ensurePageSpace(rightY, 5, 83, false);
              pdf.text(ln, 83, rightY);
              rightY += 4.5;
            });
          });
        }

        if (parsedExp.length > 0) {
          addRightSection("WORK EXPERIENCE", () => {
            parsedExp.forEach(exp => {
              rightY = ensurePageSpace(rightY, 12, 83, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(`${exp.title} ${exp.company ? `at ${exp.company}` : ""}`, 83, rightY);
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(100, 116, 139);
              pdf.text(exp.dates || "", 195, rightY, { align: "right" });
              rightY += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(71, 85, 105);
              if (exp.highlights && exp.highlights.length > 0) {
                exp.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, 112);
                  lines.forEach(ln => {
                    rightY = ensurePageSpace(rightY, 5, 83, false);
                    pdf.text(ln, 83, rightY);
                    rightY += 4.5;
                  });
                });
              }
              rightY += 2;
            });
          });
        }

        if (parsedProj.length > 0) {
          addRightSection("KEY PROJECTS", () => {
            parsedProj.forEach(proj => {
              rightY = ensurePageSpace(rightY, 12, 83, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(proj.name, 83, rightY);
              rightY += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(71, 85, 105);
              if (proj.highlights && proj.highlights.length > 0) {
                proj.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, 112);
                  lines.forEach(ln => {
                    rightY = ensurePageSpace(rightY, 5, 83, false);
                    pdf.text(ln, 83, rightY);
                    rightY += 4.5;
                  });
                });
              }
              rightY += 2;
            });
          });
        }

        if (parsedEdu.length > 0) {
          addRightSection("EDUCATION", () => {
            parsedEdu.forEach(edu => {
              rightY = ensurePageSpace(rightY, 10, 83, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(edu.degree, 83, rightY);
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(100, 116, 139);
              pdf.text(edu.dates || "", 195, rightY, { align: "right" });
              rightY += 4.5;
              if (edu.school) {
                pdf.setFont(customFont, "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(71, 85, 105);
                pdf.text(edu.school, 83, rightY);
                rightY += 4.5;
              }
              rightY += 1.5;
            });
          });
        }

      } else if (config.layout.startsWith("two-column")) {
        // --- TWO COLUMN (DARK / GREY / SERIF) ---
        const isDark = config.isDarkSidebar;
        pdf.setFillColor(config.sidebarBgRGB[0], config.sidebarBgRGB[1], config.sidebarBgRGB[2]);
        pdf.rect(0, 0, 75, 297, "F");

        let leftY = 15;
        let rightY = 15;

        // Visual profile circle in sidebar
        pdf.setFillColor(isDark ? 30 : 255, isDark ? 41 : 255, isDark ? 59 : 255);
        pdf.circle(37.5, leftY + 12, 11, "F");
        pdf.setFont(customFont, "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(isDark ? config.primaryColor[0] : 15, isDark ? config.primaryColor[1] : 23, isDark ? config.primaryColor[2] : 42);
        const initials = resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "JD";
        pdf.text(initials, 37.5, leftY + 13, { align: "center" });

        leftY += 30;

        const addLeftSection = (title, contentLinesCallback) => {
          leftY = ensurePageSpace(leftY, 15, 12, true);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(10.5);
          pdf.setTextColor(isDark ? config.primaryColor[0] : 30, isDark ? config.primaryColor[1] : 41, isDark ? config.primaryColor[2] : 59);
          pdf.text(title, 12, leftY);
          leftY += 2;
          pdf.setDrawColor(isDark ? 50 : 200, isDark ? 65 : 200, isDark ? 85 : 200);
          pdf.line(12, leftY, 68, leftY);
          leftY += 5;
          contentLinesCallback();
          leftY += 4;
        };

        addLeftSection("CONTACT", () => {
          pdf.setFont(customFont, "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(isDark ? 220 : 71, isDark ? 225 : 85, isDark ? 230 : 105);
          if (resumeData.email) { pdf.text(resumeData.email, 12, leftY); leftY += 4.5; }
          if (resumeData.phone) { pdf.text(resumeData.phone, 12, leftY); leftY += 4.5; }
          if (resumeData.location) { pdf.text(resumeData.location, 12, leftY); leftY += 4.5; }
          if (resumeData.linkedin) { pdf.text(resumeData.linkedin, 12, leftY); leftY += 4.5; }
          if (resumeData.github) { pdf.text(resumeData.github, 12, leftY); }
        });

        if (skillsList.length > 0) {
          addLeftSection("CORE SKILLS", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(8.5);
            pdf.setTextColor(isDark ? 220 : 71, isDark ? 225 : 85, isDark ? 230 : 105);
            skillsList.forEach(sk => {
              leftY = ensurePageSpace(leftY, 5, 12, true);
              if (config.skillsFormat === "progress") {
                pdf.text(sk, 12, leftY);
                pdf.setDrawColor(isDark ? 40 : 220, isDark ? 50 : 220, isDark ? 65 : 220);
                pdf.line(12, leftY + 2, 68, leftY + 2);
                pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
                pdf.line(12, leftY + 2, 45, leftY + 2);
                leftY += 5.5;
              } else {
                pdf.text(`• ${sk}`, 12, leftY);
                leftY += 4.5;
              }
            });
          });
        }

        if (parsedEdu.length > 0) {
          addLeftSection("EDUCATION", () => {
            parsedEdu.forEach(edu => {
              leftY = ensurePageSpace(leftY, 12, 12, true);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(8.5);
              pdf.setTextColor(isDark ? 255 : 30, isDark ? 255 : 41, isDark ? 255 : 59);
              pdf.text(edu.degree, 12, leftY);
              leftY += 4;
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8);
              pdf.setTextColor(isDark ? 200 : 80, isDark ? 200 : 80, isDark ? 200 : 80);
              if (edu.school) { pdf.text(edu.school, 12, leftY); leftY += 4; }
              if (edu.dates) { pdf.text(edu.dates, 12, leftY); leftY += 4; }
            });
          });
        }

        // Right Main Column details
        pdf.setFont(customFont, "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(15, 23, 42);
        pdf.text((resumeData.fullName || "Jane Doe").toUpperCase(), 83, rightY + 8);

        pdf.setFont(customFont, "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.text(resumeData.targetRole || "Target Profession", 83, rightY + 14);

        rightY += 22;

        const addRightSection = (title, contentLinesCallback) => {
          rightY = ensurePageSpace(rightY, 15, 83, false);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text(title, 83, rightY);
          rightY += 2;
          pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.line(83, rightY, 195, rightY);
          rightY += 5;
          contentLinesCallback();
          rightY += 4;
        };

        if (resumeData.professionalSummary) {
          addRightSection("PROFESSIONAL SUMMARY", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(71, 85, 105);
            const lines = pdf.splitTextToSize(resumeData.professionalSummary, 112);
            lines.forEach(ln => {
              rightY = ensurePageSpace(rightY, 5, 83, false);
              pdf.text(ln, 83, rightY);
              rightY += 4.5;
            });
          });
        }

        if (parsedExp.length > 0) {
          addRightSection("WORK EXPERIENCE", () => {
            parsedExp.forEach(exp => {
              rightY = ensurePageSpace(rightY, 12, 83, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(`${exp.title} ${exp.company ? `at ${exp.company}` : ""}`, 83, rightY);
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(100, 116, 139);
              pdf.text(exp.dates || "", 195, rightY, { align: "right" });
              rightY += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(71, 85, 105);
              if (exp.highlights && exp.highlights.length > 0) {
                exp.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, 112);
                  lines.forEach(ln => {
                    rightY = ensurePageSpace(rightY, 5, 83, false);
                    pdf.text(ln, 83, rightY);
                    rightY += 4.5;
                  });
                });
              }
              rightY += 2;
            });
          });
        }

        if (parsedProj.length > 0) {
          addRightSection("KEY PROJECTS", () => {
            parsedProj.forEach(proj => {
              rightY = ensurePageSpace(rightY, 12, 83, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(proj.name, 83, rightY);
              rightY += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(71, 85, 105);
              if (proj.highlights && proj.highlights.length > 0) {
                proj.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, 112);
                  lines.forEach(ln => {
                    rightY = ensurePageSpace(rightY, 5, 83, false);
                    pdf.text(ln, 83, rightY);
                    rightY += 4.5;
                  });
                });
              }
              rightY += 2;
            });
          });
        }

        if (resumeData.certifications) {
          addRightSection("CERTIFICATIONS", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(71, 85, 105);
            const lines = pdf.splitTextToSize(resumeData.certifications, 112);
            lines.forEach(ln => {
              rightY = ensurePageSpace(rightY, 5, 83, false);
              pdf.text(ln, 83, rightY);
              rightY += 4.5;
            });
          });
        }

      } else if (config.layout === "two-column-split-line") {
        // --- TWO COLUMN SPLIT LINE ---
        let y = 15;
        pdf.setFont(customFont, "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(15, 23, 42);
        pdf.text(resumeData.fullName || "Jane Doe", 15, y);

        pdf.setFont(customFont, "normal");
        pdf.setFontSize(10.5);
        pdf.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.text(resumeData.targetRole || "Target Profession", 15, y + 6);

        pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.setLineWidth(0.8);
        pdf.line(15, y + 10, pageWidth - 15, y + 10);

        y += 18;

        // Split columns: left columns x = 15 to 100, right column x = 110 to 195
        let leftY = y;
        let rightY = y;

        // Draw vertical split line
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.4);
        pdf.line(105, y, 105, pageHeight - 15);

        const addLeftSplitSection = (title, contentLinesCallback) => {
          leftY = ensurePageSpace(leftY, 15, 15, false);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text(title, 15, leftY);
          leftY += 2;
          pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.line(15, leftY, 98, leftY);
          leftY += 5;
          contentLinesCallback();
          leftY += 4;
        };

        if (resumeData.professionalSummary) {
          addLeftSplitSection("SUMMARY", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(71, 85, 105);
            const lines = pdf.splitTextToSize(resumeData.professionalSummary, 83);
            lines.forEach(ln => {
              leftY = ensurePageSpace(leftY, 5, 15, false);
              pdf.text(ln, 15, leftY);
              leftY += 4;
            });
          });
        }

        if (parsedExp.length > 0) {
          addLeftSplitSection("EXPERIENCE", () => {
            parsedExp.forEach(exp => {
              leftY = ensurePageSpace(leftY, 12, 15, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9);
              pdf.setTextColor(15, 23, 42);
              pdf.text(exp.title, 15, leftY);
              leftY += 4.5;
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(100, 116, 139);
              pdf.text(`${exp.company || ""}  (${exp.dates || ""})`, 15, leftY);
              leftY += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(71, 85, 105);
              if (exp.highlights && exp.highlights.length > 0) {
                exp.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, 83);
                  lines.forEach(ln => {
                    leftY = ensurePageSpace(leftY, 5, 15, false);
                    pdf.text(ln, 15, leftY);
                    leftY += 4.5;
                  });
                });
              }
              leftY += 2;
            });
          });
        }

        const addRightSplitSection = (title, contentLinesCallback) => {
          rightY = ensurePageSpace(rightY, 15, 110, false);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text(title, 110, rightY);
          rightY += 2;
          pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.line(110, rightY, 195, rightY);
          rightY += 5;
          contentLinesCallback();
          rightY += 4;
        };

        addRightSplitSection("CONTACT", () => {
          pdf.setFont(customFont, "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(71, 85, 105);
          if (resumeData.email) { pdf.text(`✉ ${resumeData.email}`, 110, rightY); rightY += 4.5; }
          if (resumeData.phone) { pdf.text(`📞 ${resumeData.phone}`, 110, rightY); rightY += 4.5; }
          if (resumeData.location) { pdf.text(`📍 ${resumeData.location}`, 110, rightY); rightY += 4.5; }
          if (resumeData.linkedin) { pdf.text(`🔗 ${resumeData.linkedin}`, 110, rightY); rightY += 4.5; }
          if (resumeData.github) { pdf.text(`📂 ${resumeData.github}`, 110, rightY); }
        });

        if (skillsList.length > 0) {
          addRightSplitSection("SKILLS", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(8.5);
            pdf.setTextColor(71, 85, 105);
            skillsList.forEach(sk => {
              rightY = ensurePageSpace(rightY, 5, 110, false);
              pdf.text(`• ${sk}`, 110, rightY);
              rightY += 4.5;
            });
          });
        }

        if (parsedEdu.length > 0) {
          addRightSplitSection("EDUCATION", () => {
            parsedEdu.forEach(edu => {
              rightY = ensurePageSpace(rightY, 12, 110, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9);
              pdf.setTextColor(15, 23, 42);
              pdf.text(edu.degree, 110, rightY);
              rightY += 4;
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(71, 85, 105);
              if (edu.school) { pdf.text(edu.school, 110, rightY); rightY += 4; }
              if (edu.dates) { pdf.text(edu.dates, 110, rightY); rightY += 4; }
            });
          });
        }

        if (parsedProj.length > 0) {
          addRightSplitSection("PROJECTS", () => {
            parsedProj.forEach(proj => {
              rightY = ensurePageSpace(rightY, 12, 110, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9);
              pdf.setTextColor(15, 23, 42);
              pdf.text(proj.name, 110, rightY);
              rightY += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(71, 85, 105);
              if (proj.highlights && proj.highlights.length > 0) {
                proj.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, 85);
                  lines.forEach(ln => {
                    rightY = ensurePageSpace(rightY, 5, 110, false);
                    pdf.text(ln, 110, rightY);
                    rightY += 4.5;
                  });
                });
              }
              rightY += 2;
            });
          });
        }

      } else {
        // --- SINGLE COLUMN LAYOUTS (CLASSIC / CENTERED / BORDER / NEON-STARTUP-GOLD) ---
        let y = 15;
        const isCentered = config.layout === "single-column-centered";
        const hasBorder = config.layout === "single-column-border";
        const isNeon = config.layout === "neon-startup-gold";

        // Draw left gold bar for neon-startup
        if (isNeon) {
          pdf.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.rect(0, 0, 6, 297, "F");
        }

        // Draw outer box borders for border layout
        if (hasBorder) {
          pdf.setDrawColor(15, 23, 42);
          pdf.setLineWidth(0.8);
          pdf.rect(6, 6, pageWidth - 12, pageHeight - 12, "D");
        }

        const startX = isNeon ? 18 : 15;
        const widthBound = isNeon ? 177 : 180;

        if (isCentered) {
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(22);
          pdf.setTextColor(15, 23, 42);
          pdf.text((resumeData.fullName || "Jane Doe").toUpperCase(), pageWidth / 2, y, { align: "center" });

          pdf.setFont(customFont, "normal");
          pdf.setFontSize(10.5);
          pdf.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.text(resumeData.targetRole || "Target Profession", pageWidth / 2, y + 6, { align: "center" });

          pdf.setFont(customFont, "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(100, 116, 139);
          const contactLine = [resumeData.email, resumeData.phone, resumeData.location, resumeData.linkedin, resumeData.github].filter(Boolean).join("   |   ");
          pdf.text(contactLine, pageWidth / 2, y + 12, { align: "center" });
          y += 20;
        } else {
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(22);
          pdf.setTextColor(15, 23, 42);
          pdf.text((resumeData.fullName || "Jane Doe").toUpperCase(), startX, y);

          pdf.setFont(customFont, "normal");
          pdf.setFontSize(10.5);
          pdf.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          pdf.text(resumeData.targetRole || "Target Profession", startX, y + 6);

          pdf.setFont(customFont, "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(100, 116, 139);
          const contactLine = [resumeData.email, resumeData.phone, resumeData.location, resumeData.linkedin, resumeData.github].filter(Boolean).join("   |   ");
          pdf.text(contactLine, startX, y + 12);
          y += 20;
        }

        pdf.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        pdf.setLineWidth(0.6);
        pdf.line(startX, y - 4, pageWidth - (isNeon ? 12 : 15), y - 4);

        const addSingleColumnSection = (title, contentCallback) => {
          y = ensurePageSpace(y, 18, startX, false);
          pdf.setFont(customFont, "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          
          if (isCentered) {
            pdf.text(title, pageWidth / 2, y, { align: "center" });
            y += 2;
            pdf.setDrawColor(220, 220, 220);
            pdf.line(40, y, pageWidth - 40, y);
            y += 5;
          } else {
            pdf.text(title, startX, y);
            y += 2;
            pdf.setDrawColor(220, 220, 220);
            pdf.line(startX, y, pageWidth - (isNeon ? 12 : 15), y);
            y += 5;
          }

          contentCallback();
          y += 4;
        };

        if (resumeData.professionalSummary) {
          addSingleColumnSection("PROFESSIONAL SUMMARY", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(71, 85, 105);
            const lines = pdf.splitTextToSize(resumeData.professionalSummary, widthBound);
            lines.forEach(ln => {
              y = ensurePageSpace(y, 5, startX, false);
              pdf.text(ln, isCentered ? pageWidth / 2 : startX, y, { align: isCentered ? "center" : "left" });
              y += 4.5;
            });
          });
        }

        if (skillsList.length > 0) {
          addSingleColumnSection("CORE SKILLS", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(71, 85, 105);
            const skillsStr = skillsList.join(", ");
            const lines = pdf.splitTextToSize(skillsStr, widthBound);
            lines.forEach(ln => {
              y = ensurePageSpace(y, 5, startX, false);
              pdf.text(ln, isCentered ? pageWidth / 2 : startX, y, { align: isCentered ? "center" : "left" });
              y += 4.5;
            });
          });
        }

        if (parsedExp.length > 0) {
          addSingleColumnSection("WORK EXPERIENCE", () => {
            parsedExp.forEach(exp => {
              y = ensurePageSpace(y, 12, startX, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(`${exp.title} ${exp.company ? `at ${exp.company}` : ""}`, startX, y);
              
              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(100, 116, 139);
              pdf.text(exp.dates || "", pageWidth - (isNeon ? 12 : 15), y, { align: "right" });
              y += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(71, 85, 105);
              if (exp.highlights && exp.highlights.length > 0) {
                exp.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, widthBound);
                  lines.forEach(ln => {
                    y = ensurePageSpace(y, 5, startX, false);
                    pdf.text(ln, startX, y);
                    y += 4.5;
                  });
                });
              }
              y += 2.5;
            });
          });
        }

        if (parsedProj.length > 0) {
          addSingleColumnSection("KEY PROJECTS", () => {
            parsedProj.forEach(proj => {
              y = ensurePageSpace(y, 12, startX, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(proj.name, startX, y);
              y += 4.5;

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(71, 85, 105);
              if (proj.highlights && proj.highlights.length > 0) {
                proj.highlights.forEach(hl => {
                  const lines = pdf.splitTextToSize(`• ${hl}`, widthBound);
                  lines.forEach(ln => {
                    y = ensurePageSpace(y, 5, startX, false);
                    pdf.text(ln, startX, y);
                    y += 4.5;
                  });
                });
              }
              y += 2.5;
            });
          });
        }

        if (parsedEdu.length > 0) {
          addSingleColumnSection("EDUCATION", () => {
            parsedEdu.forEach(edu => {
              y = ensurePageSpace(y, 10, startX, false);
              pdf.setFont(customFont, "bold");
              pdf.setFontSize(9.5);
              pdf.setTextColor(15, 23, 42);
              pdf.text(edu.degree, startX, y);

              pdf.setFont(customFont, "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(100, 116, 139);
              pdf.text(edu.dates || "", pageWidth - (isNeon ? 12 : 15), y, { align: "right" });
              y += 4.5;
              if (edu.school) {
                pdf.setFont(customFont, "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(71, 85, 105);
                pdf.text(edu.school, startX, y);
                y += 4.5;
              }
              y += 1.5;
            });
          });
        }

        if (resumeData.certifications) {
          addSingleColumnSection("CERTIFICATIONS", () => {
            pdf.setFont(customFont, "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(71, 85, 105);
            const lines = pdf.splitTextToSize(resumeData.certifications, widthBound);
            lines.forEach(ln => {
              y = ensurePageSpace(y, 5, startX, false);
              pdf.text(ln, isCentered ? pageWidth / 2 : startX, y, { align: isCentered ? "center" : "left" });
              y += 4.5;
            });
          });
        }
      }

      const fileName = resumeData.fullName?.trim().replace(/\s+/g, "_") || "ATSify";
      pdf.save(`${fileName}_Resume.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  const getFontClass = () => {
    if (config.font === "times") return "font-serif";
    return "font-sans";
  };

  // Live Screen Renderer with 100% equivalent visual rendering models
  const renderPreviewContent = () => {
    const fontClass = getFontClass();
    const parsedExp = parseExperience(resumeData.experience);
    const parsedEdu = parseEducation(resumeData.education);
    const parsedProj = parseProjects(resumeData.projects);
    const skillsList = resumeData.skills ? resumeData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

    const renderSkills = (isDark = false) => {
      if (skillsList.length === 0) return null;
      if (config.skillsFormat === "tags") {
        return (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skillsList.map((sk, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm"
                style={{
                  background: isDark ? "#1e293b" : "#f1f5f9",
                  color: config.primaryHex,
                  borderColor: config.primaryHex + "25"
                }}
              >
                {sk}
              </span>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-2 mt-2">
          {skillsList.map((sk, i) => (
            <div key={i} className="text-[11px] flex flex-col">
              <span className={isDark ? "text-slate-350" : "text-slate-600"}>{sk}</span>
              {config.skillsFormat === "progress" && (
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: isDark ? "#334155" : "#e2e8f0" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ background: config.primaryHex, width: i % 2 === 0 ? "85%" : i % 3 === 0 ? "70%" : "90%" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };

    switch (config.layout) {
      case "top-banner-photo":
        return (
          <div className={`${fontClass} text-slate-800 flex flex-col min-h-[750px] bg-white text-left relative pb-12 rounded-3xl overflow-hidden shadow-inner`}>
            {/* Header split banner */}
            <div className="flex border-b border-slate-200 min-h-[150px] shrink-0">
              <div className="w-[65%] bg-[#ecf4f8] p-8 flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                    {resumeData.fullName || "Jane Doe"}
                  </h1>
                  <p className="text-xs font-black uppercase tracking-widest mt-1.5" style={{ color: config.primaryHex }}>
                    {resumeData.targetRole || "Target Profession"}
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-1.5 mt-4 font-semibold">
                  {resumeData.email && <div>✉ {resumeData.email}</div>}
                  {resumeData.phone && <div>📞 {resumeData.phone}</div>}
                  {resumeData.location && <div>📍 {resumeData.location}</div>}
                  {resumeData.linkedin && <div className="truncate">🔗 {resumeData.linkedin}</div>}
                  {resumeData.github && <div className="truncate">📂 {resumeData.github}</div>}
                </div>
              </div>
              <div className="w-[35%] bg-[#faebe8] flex items-center justify-center p-6 shrink-0 relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white/90 flex items-center justify-center">
                  <span className="text-slate-800 font-black text-3xl">
                    {resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "JD"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-7 flex-1">
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-1.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>
                    👤 Professional Summary
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                </div>
              )}

              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-1.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>
                    💼 Work Experience
                  </h3>
                  <div className="space-y-5">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="grid grid-cols-10 gap-4 text-xs">
                        <div className="col-span-3 text-slate-400 font-bold uppercase tracking-wider">{exp.dates || "Present"}</div>
                        <div className="col-span-7 space-y-1">
                          <div className="font-bold text-slate-900 text-sm">{exp.title}</div>
                          {exp.company && <div className="text-slate-500 font-bold" style={{ color: config.primaryHex }}>{exp.company}</div>}
                          {exp.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-1 text-slate-600 mt-2 font-medium">
                              {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-1.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>
                    🛠 Key Projects
                  </h3>
                  <div className="space-y-5">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="grid grid-cols-10 gap-4 text-xs">
                        <div className="col-span-3 text-slate-400 font-bold uppercase tracking-wider">PROJECT</div>
                        <div className="col-span-7 space-y-1">
                          <div className="font-bold text-slate-900 text-sm">{proj.name}</div>
                          {proj.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-1 text-slate-600 mt-2 font-medium">
                              {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.skills && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-1.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>
                    📊 Core Skills
                  </h3>
                  {renderSkills(false)}
                </div>
              )}

              {parsedEdu.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-1.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>
                    🎓 Education
                  </h3>
                  <div className="space-y-4">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx} className="grid grid-cols-10 gap-4 text-xs">
                        <div className="col-span-3 text-slate-400 font-bold uppercase tracking-wider">{edu.dates || ""}</div>
                        <div className="col-span-7">
                          <div className="font-bold text-slate-900">{edu.degree}</div>
                          {edu.school && <div className="text-slate-500 font-bold mt-0.5">{edu.school}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.certifications && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-1.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>
                    🎖 Certifications
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{resumeData.certifications}</p>
                </div>
              )}
            </div>
            {/* Gold bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-4" style={{ background: config.primaryHex }} />
          </div>
        );

      case "green-header-split":
        return (
          <div className={`${fontClass} text-slate-800 flex flex-col min-h-[750px] bg-white text-left relative rounded-3xl overflow-hidden shadow-lg`}>
            {/* Green / Teal header banner */}
            <div className="p-8 flex items-center justify-between border-b text-white shrink-0 shadow-md" style={{ background: config.primaryHex }}>
              <div className="space-y-1.5">
                <h1 className="text-3xl font-black tracking-tight uppercase">{resumeData.fullName || "Jane Doe"}</h1>
                <p className="text-xs font-black uppercase tracking-widest text-white/90">{resumeData.targetRole || "Target Profession"}</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-2xl">{resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "JD"}</span>
              </div>
            </div>
            
            {/* Split layout Columns */}
            <div className="flex flex-row flex-1">
              <div className="w-[35%] p-6 bg-slate-50 border-r border-slate-150 flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex }}>Contact</h4>
                  <div className="text-[10px] space-y-2 text-slate-600 break-all font-semibold">
                    {resumeData.email && <div>✉ {resumeData.email}</div>}
                    {resumeData.phone && <div>📞 {resumeData.phone}</div>}
                    {resumeData.location && <div>📍 {resumeData.location}</div>}
                    {resumeData.linkedin && <div>🔗 {resumeData.linkedin}</div>}
                    {resumeData.github && <div>📂 {resumeData.github}</div>}
                  </div>
                </div>
                {resumeData.skills && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex }}>Skills</h4>
                    {renderSkills(false)}
                  </div>
                )}
                {resumeData.certifications && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex }}>Certifications</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">{resumeData.certifications}</p>
                  </div>
                )}
              </div>
              <div className="w-[65%] p-7 space-y-6 flex-grow">
                {resumeData.professionalSummary && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Professional Summary</h3>
                    <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                  </div>
                )}
                {parsedExp.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Experience</h3>
                    <div className="space-y-4">
                      {parsedExp.map((exp, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                            <span className="text-slate-400 font-bold">{exp.dates}</span>
                          </div>
                          {exp.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1 font-medium">
                              {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {parsedProj.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Projects</h3>
                    <div className="space-y-4">
                      {parsedProj.map((proj, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <div className="font-bold text-slate-900">{proj.name}</div>
                          {proj.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1 font-medium">
                              {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {parsedEdu.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Education</h3>
                    <div className="space-y-3">
                      {parsedEdu.map((edu, idx) => (
                        <div key={idx} className="text-xs flex justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{edu.degree}</span>
                            {edu.school && <span className="text-slate-500 font-bold"> — {edu.school}</span>}
                          </div>
                          <span className="text-slate-400 font-bold">{edu.dates}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "two-column-dark-sidebar":
        return (
          <div className={`${fontClass} text-slate-900 flex flex-row min-h-[750px] bg-white gap-6 text-left rounded-3xl overflow-hidden shadow-lg border`}>
            <div className="w-[65%] p-8 flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase leading-none">{resumeData.fullName || "Jane Doe"}</h1>
                <p className="text-sm font-black mt-2 uppercase tracking-widest" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
              </div>
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Professional Summary</h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                </div>
              )}
              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Experience</h3>
                  <div className="space-y-4">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                          <span className="text-slate-400 font-bold">{exp.dates}</span>
                        </div>
                        {exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Projects</h3>
                  <div className="space-y-4">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Dark Sidebar */}
            <div className="w-[35%] p-7 flex flex-col gap-6" style={{ background: config.sidebarBg, color: "#f8fafc" }}>
              <div className="flex flex-col items-center mb-3">
                <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl shadow-xl bg-slate-900/40" style={{ color: config.primaryHex, border: `3px solid ${config.primaryHex}` }}>
                  {resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "JD"}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#334155" }}>Contact</h4>
                <div className="text-[10px] space-y-2 break-all text-slate-300 font-semibold">
                  {resumeData.email && <div>✉ {resumeData.email}</div>}
                  {resumeData.phone && <div>📞 {resumeData.phone}</div>}
                  {resumeData.location && <div>📍 {resumeData.location}</div>}
                  {resumeData.linkedin && <div>🔗 {resumeData.linkedin}</div>}
                  {resumeData.github && <div>📂 {resumeData.github}</div>}
                </div>
              </div>
              {resumeData.skills && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#334155" }}>Skills</h4>
                  {renderSkills(true)}
                </div>
              )}
              {parsedEdu.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#334155" }}>Education</h4>
                  <div className="text-[10px] space-y-3.5 text-slate-350 font-semibold">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-bold text-white leading-tight">{edu.degree}</div>
                        {edu.school && <div className="text-slate-400">{edu.school}</div>}
                        {edu.dates && <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{edu.dates}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.certifications && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2" style={{ color: config.primaryHex, borderColor: "#334155" }}>Certifications</h4>
                  <div className="text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed font-semibold">{resumeData.certifications}</div>
                </div>
              )}
            </div>
          </div>
        );

      case "two-column-grey-sidebar":
      case "two-column-serif":
        return (
          <div className={`${fontClass} text-slate-900 flex flex-row min-h-[750px] bg-white gap-6 text-left rounded-3xl overflow-hidden shadow-lg border`}>
            {/* Light Grey Sidebar */}
            <div className="w-[35%] p-7 flex flex-col gap-6" style={{ background: config.sidebarBg, color: "#1e293b", borderColor: "#e2e8f0" }}>
              <div className="flex flex-col items-center mb-3">
                <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl shadow-md bg-white" style={{ color: config.primaryHex, border: `2px solid ${config.primaryHex}` }}>
                  {resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "JD"}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Contact</h4>
                <div className="text-[10px] space-y-2 break-all text-slate-500 font-bold">
                  {resumeData.email && <div>✉ {resumeData.email}</div>}
                  {resumeData.phone && <div>📞 {resumeData.phone}</div>}
                  {resumeData.location && <div>📍 {resumeData.location}</div>}
                  {resumeData.linkedin && <div>🔗 {resumeData.linkedin}</div>}
                  {resumeData.github && <div>📂 {resumeData.github}</div>}
                </div>
              </div>
              {resumeData.skills && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Skills</h4>
                  {renderSkills(false)}
                </div>
              )}
              {parsedEdu.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Education</h4>
                  <div className="text-[10px] space-y-3.5 text-slate-600 font-bold">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-bold text-slate-800 leading-tight">{edu.degree}</div>
                        {edu.school && <div className="text-slate-500">{edu.school}</div>}
                        {edu.dates && <div className="text-[9px] text-slate-450">{edu.dates}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-[65%] p-8 flex flex-col gap-6 flex-grow">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase leading-none">{resumeData.fullName || "Jane Doe"}</h1>
                <p className="text-sm font-black mt-2 uppercase tracking-widest" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
              </div>
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Professional Summary</h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                </div>
              )}
              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Experience</h3>
                  <div className="space-y-4">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                          <span className="text-slate-400 font-bold">{exp.dates}</span>
                        </div>
                        {exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Projects</h3>
                  <div className="space-y-4">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.certifications && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Certifications</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold">{resumeData.certifications}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "two-column-split-line":
        return (
          <div className={`${fontClass} text-slate-900 flex flex-col min-h-[750px] bg-white text-left p-8 rounded-3xl border shadow-lg`}>
            <div className="border-b-2 pb-4 mb-6" style={{ borderColor: config.primaryHex }}>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{resumeData.fullName || "Jane Doe"}</h1>
              <p className="text-sm font-black uppercase tracking-widest mt-1.5" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 flex-1">
              {/* Left Column Split */}
              <div className="border-r border-slate-150 pr-6 space-y-6">
                {resumeData.professionalSummary && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Professional Summary</h3>
                    <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                  </div>
                )}
                {parsedExp.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Experience</h3>
                    <div className="space-y-4">
                      {parsedExp.map((exp, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <div className="font-bold text-slate-900 leading-tight">{exp.title} {exp.company && `at ${exp.company}`}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{exp.dates}</div>
                          {exp.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1.5 font-medium">
                              {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column Split */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Contact Details</h3>
                  <div className="text-[10px] space-y-2 text-slate-600 font-bold">
                    {resumeData.email && <div>✉ {resumeData.email}</div>}
                    {resumeData.phone && <div>📞 {resumeData.phone}</div>}
                    {resumeData.location && <div>📍 {resumeData.location}</div>}
                    {resumeData.linkedin && <div>🔗 {resumeData.linkedin}</div>}
                    {resumeData.github && <div>📂 {resumeData.github}</div>}
                  </div>
                </div>
                {resumeData.skills && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Core Skills</h3>
                    {renderSkills(false)}
                  </div>
                )}
                {parsedEdu.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Education</h3>
                    <div className="space-y-3">
                      {parsedEdu.map((edu, idx) => (
                        <div key={idx} className="text-xs space-y-0.5">
                          <div className="font-bold text-slate-900 leading-tight">{edu.degree}</div>
                          {edu.school && <div className="text-slate-550">{edu.school}</div>}
                          {edu.dates && <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{edu.dates}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {parsedProj.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Projects</h3>
                    <div className="space-y-3">
                      {parsedProj.map((proj, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <div className="font-bold text-slate-900">{proj.name}</div>
                          {proj.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-650 font-medium">
                              {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "neon-startup-gold":
        return (
          <div className={`${fontClass} text-slate-900 flex flex-col min-h-[750px] bg-white text-left p-8 border-l-[10px] border-amber-500 relative rounded-r-3xl shadow-xl border-t border-b border-r`}>
            {/* Centered Top Header Banner */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-6 w-full shrink-0">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-4 shrink-0">
                <span className="text-slate-800 font-black text-2xl">{resumeData.fullName ? resumeData.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "JD"}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase leading-none">{resumeData.fullName || "Jane Doe"}</h1>
              <p className="text-xs font-black uppercase tracking-widest mt-1.5" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
              
              <div className="flex flex-wrap justify-center gap-3.5 text-[9px] text-slate-500 font-bold uppercase mt-4">
                {resumeData.email && <span>✉ {resumeData.email}</span>}
                {resumeData.phone && <span>• 📞 {resumeData.phone}</span>}
                {resumeData.location && <span>• 📍 {resumeData.location}</span>}
                {resumeData.linkedin && <span>• 🔗 {resumeData.linkedin}</span>}
                {resumeData.github && <span>• 📂 {resumeData.github}</span>}
              </div>
            </div>
            
            <div className="space-y-6 flex-1">
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Professional Summary</h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                </div>
              )}
              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Work Experience</h3>
                  <div className="space-y-4">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                          <span className="text-slate-400 font-bold">{exp.dates}</span>
                        </div>
                        {exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1.5 font-medium">
                            {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Key Projects</h3>
                  <div className="space-y-4">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1.5 font-medium">
                            {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.skills && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Core Skills</h3>
                  {renderSkills(false)}
                </div>
              )}
              {parsedEdu.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Education</h3>
                  <div className="space-y-3">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx} className="text-xs flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{edu.degree}</div>
                          {edu.school && <div className="text-slate-550 font-bold">{edu.school}</div>}
                        </div>
                        <span className="text-slate-400 font-bold">{edu.dates}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.certifications && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Certifications</h3>
                  <p className="text-xs text-slate-655 leading-relaxed font-semibold">{resumeData.certifications}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "single-column-border":
        return (
          <div className={`${fontClass} text-slate-900 p-8 flex flex-col gap-6 text-center border-4 border-slate-950 rounded-2xl shadow-xl min-h-[750px]`}>
            <div className="pb-4 border-b border-slate-900">
              <h1 className="text-4xl font-black tracking-widest text-slate-900 uppercase leading-none">{resumeData.fullName || "Jane Doe"}</h1>
              <p className="text-xs font-black tracking-widest uppercase mt-2" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
              
              <div className="flex flex-wrap justify-center gap-3.5 text-[9px] text-slate-500 font-bold uppercase mt-3.5">
                {resumeData.email && <span>{resumeData.email}</span>}
                {resumeData.phone && <span>• {resumeData.phone}</span>}
                {resumeData.location && <span>• {resumeData.location}</span>}
                {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                {resumeData.github && <span>• {resumeData.github}</span>}
              </div>
            </div>
            
            <div className="space-y-6 text-left flex-grow">
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-2.5 text-center" style={{ color: config.primaryHex }}>Professional Summary</h3>
                  <p className="text-xs text-slate-650 leading-relaxed text-center whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                </div>
              )}
              {resumeData.skills && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-2.5 text-center" style={{ color: config.primaryHex }}>Core Skills</h3>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {skillsList.map((sk, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider border" style={{ color: config.primaryHex, borderColor: config.primaryHex + "20" }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}
              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-3 text-center" style={{ color: config.primaryHex }}>Experience</h3>
                  <div className="space-y-4">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                          <span className="text-slate-400 font-bold">{exp.dates}</span>
                        </div>
                        {exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-3 text-center" style={{ color: config.primaryHex }}>Projects</h3>
                  <div className="space-y-4">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedEdu.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-2.5 text-center" style={{ color: config.primaryHex }}>Education</h3>
                  <div className="space-y-2 text-center">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx} className="text-xs font-medium">
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        {edu.school && <span className="text-slate-500 font-bold"> — {edu.school}</span>}
                        {edu.dates && <span className="text-slate-400 font-bold"> ({edu.dates})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.certifications && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 text-center" style={{ color: config.primaryHex }}>Certifications</h3>
                  <p className="text-xs text-slate-650 leading-relaxed text-center font-semibold">{resumeData.certifications}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "single-column-centered":
        return (
          <div className={`${fontClass} text-slate-900 p-6 flex flex-col gap-6 text-center shadow-lg rounded-3xl min-h-[750px] border bg-white`}>
            <div className="pb-4" style={{ borderBottom: `2px solid ${config.primaryHex}` }}>
              <h1 className="text-4xl font-black tracking-widest text-slate-900 uppercase leading-none">{resumeData.fullName || "Jane Doe"}</h1>
              <p className="text-xs font-black tracking-widest uppercase mt-2.5" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
              
              <div className="flex flex-wrap justify-center gap-3 text-[9px] text-slate-400 font-bold uppercase mt-3">
                {resumeData.email && <span>{resumeData.email}</span>}
                {resumeData.phone && <span>• {resumeData.phone}</span>}
                {resumeData.location && <span>• {resumeData.location}</span>}
                {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                {resumeData.github && <span>• {resumeData.github}</span>}
              </div>
            </div>
            
            <div className="space-y-6 text-left flex-grow">
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5 text-center" style={{ color: config.primaryHex, borderColor: "#e2e8f0" }}>Professional Summary</h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-center whitespace-pre-wrap font-medium">{resumeData.professionalSummary}</p>
                </div>
              )}
              {resumeData.skills && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5 text-center" style={{ color: config.primaryHex, borderColor: "#e2e8f0" }}>Core Skills</h3>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {skillsList.map((sk, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider border" style={{ color: config.primaryHex, borderColor: config.primaryHex + "20" }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}
              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3 text-center" style={{ color: config.primaryHex, borderColor: "#e2e8f0" }}>Experience</h3>
                  <div className="space-y-4">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                          <span className="text-slate-400 font-bold">{exp.dates}</span>
                        </div>
                        {exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-3 text-center" style={{ color: config.primaryHex, borderColor: "#e2e8f0" }}>Projects</h3>
                  <div className="space-y-4">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedEdu.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2.5 text-center" style={{ color: config.primaryHex, borderColor: "#e2e8f0" }}>Education</h3>
                  <div className="space-y-2 text-center text-xs font-medium">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx}>
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        {edu.school && <span className="text-slate-500 font-bold"> — {edu.school}</span>}
                        {edu.dates && <span className="text-slate-400 font-bold"> ({edu.dates})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.certifications && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2 text-center" style={{ color: config.primaryHex, borderColor: "#e2e8f0" }}>Certifications</h3>
                  <p className="text-xs text-slate-650 leading-relaxed text-center font-semibold">{resumeData.certifications}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "single-column-classic":
      default:
        return (
          <div className={`${fontClass} text-slate-900 p-6 flex flex-col gap-6 text-left shadow-lg rounded-3xl min-h-[750px] border bg-white`}>
            <div className="pb-4" style={{ borderBottom: `2px solid ${config.primaryHex}` }}>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase leading-none">{resumeData.fullName || "Jane Doe"}</h1>
              <p className="text-sm font-black uppercase tracking-wider mt-1.5" style={{ color: config.primaryHex }}>{resumeData.targetRole || "Target Profession"}</p>
              
              <div className="flex flex-wrap gap-3.5 text-[9px] text-slate-400 font-bold uppercase mt-3">
                {resumeData.email && <span>✉ {resumeData.email}</span>}
                {resumeData.phone && <span>📞 {resumeData.phone}</span>}
                {resumeData.location && <span>📍 {resumeData.location}</span>}
                {resumeData.linkedin && <span>🔗 {resumeData.linkedin}</span>}
                {resumeData.github && <span>📂 {resumeData.github}</span>}
              </div>
            </div>
            
            <div className="space-y-6 flex-grow">
              {resumeData.professionalSummary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Professional Summary</h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap font-medium">{resumeData.professionalSummary}</p>
                </div>
              )}
              {resumeData.skills && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Skills</h3>
                  {renderSkills(false)}
                </div>
              )}
              {parsedExp.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Experience</h3>
                  <div className="space-y-4">
                    {parsedExp.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.title} {exp.company && `at ${exp.company}`}</span>
                          <span className="text-slate-400 font-bold">{exp.dates}</span>
                        </div>
                        {exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-medium">
                            {exp.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedProj.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-3" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Projects</h3>
                  <div className="space-y-4">
                    {parsedProj.map((proj, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-650 font-medium">
                            {proj.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedEdu.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2.5" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Education</h3>
                  <div className="space-y-2.5 text-xs font-medium">
                    {parsedEdu.map((edu, idx) => (
                      <div key={idx} className="flex justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree}</span>
                          {edu.school && <span className="text-slate-500 font-bold"> — {edu.school}</span>}
                        </div>
                        <span className="text-slate-400 font-bold">{edu.dates}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.certifications && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1 mb-2" style={{ color: config.primaryHex, borderColor: "#cbd5e1" }}>Certifications</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold">{resumeData.certifications}</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const inputClasses =
    "w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium";
  const textareaClasses =
    "w-full rounded-xl bg-white border border-slate-200 p-4 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all text-sm font-medium";
  const labelClasses =
    "text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Editor Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Resume Workspace
            </h1>
            <p className="text-sm text-[var(--text-3)] font-semibold mt-1">
              Refine and customize your AI-generated layout using <span style={{ color: "var(--primary)" }}>{template.name}</span> styles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-3 rounded-xl border border-[var(--border)] font-black text-xs uppercase tracking-wider hover:bg-[var(--bg-2)] transition-all active:scale-95 cursor-pointer bg-white"
            >
              Exit Editor
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-green-600/10 cursor-pointer"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Dual Panel Split Workspace */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="space-y-5 p-8 rounded-3xl bg-[var(--bg-2)] border border-[var(--border)] shadow-xl shadow-black/5">
            <h2 className="text-lg font-black border-b border-[var(--border)] pb-3 mb-2 flex items-center gap-2">
              📝 Content Fields
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={resumeData.fullName || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Target Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={resumeData.targetRole || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={resumeData.email || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={resumeData.phone || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={resumeData.location || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>LinkedIn</label>
                <input
                  type="text"
                  name="linkedin"
                  value={resumeData.linkedin || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={resumeData.github || ""}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Core Skills (Comma separated)</label>
              <input
                type="text"
                name="skills"
                value={resumeData.skills || ""}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Professional Summary</label>
              <textarea
                name="professionalSummary"
                value={resumeData.professionalSummary || ""}
                onChange={handleChange}
                rows={3}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Work Experience (Format: Title at Company (Dates) \n • Highlight)</label>
              <textarea
                name="experience"
                value={resumeData.experience || ""}
                onChange={handleChange}
                rows={6}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Key Projects (Format: Project Name \n • Highlight)</label>
              <textarea
                name="projects"
                value={resumeData.projects || ""}
                onChange={handleChange}
                rows={4}
                className={textareaClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Education (Format: Degree at Institution (Dates))</label>
              <textarea
                name="education"
                value={resumeData.education || ""}
                onChange={handleChange}
                rows={3}
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
          </div>

          {/* Right Column: Live Dynamic Preview */}
          <div
            className="sticky top-8 rounded-3xl shadow-xl min-h-[600px] flex flex-col justify-between"
          >
            <div ref={resumeRef} className="rounded-3xl overflow-hidden bg-white border border-slate-200 p-2 shadow-2xl">
              {renderPreviewContent()}
            </div>

            {/* Print / Export Footer Notice */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
              <p className="font-sans text-[10px] text-slate-400 tracking-widest font-black uppercase">
                {template.name} Layout • Optimised for ATS Scan Systems
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
