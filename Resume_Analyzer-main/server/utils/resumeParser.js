import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import fs from "fs";
import mammoth from "mammoth";
import { execSync } from "child_process";
import path from "path";
import { scoreResume } from "./atsScorer.js";

// Canonical Schema Synonyms
const SECTION_ALIASES = {
  summary: ["summary", "professional summary", "profile", "professional profile", "about me", "objective", "career objective", "career summary", "summary of qualifications", "qualifications summary"],
  education: ["education", "academics", "academic background", "academic profile", "academic qualifications", "education details", "educational background", "educational qualifications"],
  experience: ["experience", "work experience", "employment", "professional experience", "work history", "employment history", "career history", "relevant experience", "experience history"],
  projects: ["projects", "personal projects", "technical projects", "academic projects", "project experience", "key projects", "major projects"],
  skills: ["skills", "technical skills", "core skills", "key skills", "technologies", "core competencies", "skills & expertise", "tools", "professional skills", "technical expertise", "core technologies", "key technologies"],
  certifications: ["certifications", "licenses", "certifications & licenses", "courses", "professional development", "credentials"],
  languages: ["languages", "language proficiency"],
  achievements: ["achievements", "awards", "honors"],
  hobbies: ["hobbies", "interests", "extracurricular activities", "extracurriculars"]
};

/**
 * Normalizes any unknown value to a string according to specifications.
 * Enforces:
 * string -> string
 * array -> joined string
 * object -> serialized
 * null -> empty string
 * undefined -> empty string
 */
export function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalize).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    try {
      const vals = Object.values(value).map(normalize).filter(Boolean);
      return vals.join(" ");
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function safeTrim(value) {
  return normalize(value).trim();
}

export function safeSplit(value, separator) {
  return normalize(value).split(separator);
}

export function safeMap(value, callback) {
  if (Array.isArray(value)) {
    return value.map(callback);
  }
  if (value == null) {
    return [];
  }
  return [value].map(callback);
}

const looksLikeName = (line) => {
  const normalized = line.replace(/[^a-zA-Z\s.'-]/g, "").trim();
  if (!normalized) return false;

  const lower = normalized.toLowerCase();
  const stopwords = new Set(["resume", "curriculum vitae", "cv", "profile", "summary", "objective", "experience", "education", "skills", "projects", "certifications", "hobbies", "languages", "achievements", "interests"]);
  if (stopwords.has(lower)) return false;
  if (/@|\d{3,}|https?:\/\//i.test(line)) return false;

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;

  return words.every((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w));
};

const extractName = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 15);
  const candidate = lines.find(looksLikeName);
  if (candidate) return candidate.substring(0, 80);
  return lines[0] ? lines[0].substring(0, 80) : "Anonymous";
};

const extractEmail = (text) => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
};

const extractPhone = (text) => {
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : "";
};

const extractLocation = (text) => {
  const match = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/);
  return match ? match[0] : "";
};

const extractUrls = (text) => {
  const urls = text.match(/\bhttps?:\/\/[^\s()<>]+/gi) || [];
  const linkedin = urls.find(u => /linkedin\.com/i.test(u)) || text.match(/linkedin\.com\/in\/[A-Za-z0-9\-_%]+/i)?.[0] || "";
  const github = urls.find(u => /github\.com/i.test(u)) || text.match(/github\.com\/[A-Za-z0-9\-_]+/i)?.[0] || "";
  const portfolio = urls.find(u => !/linkedin\.com|github\.com/i.test(u)) || "";
  return { linkedin, github, portfolio };
};

/**
 * Robustly parses raw text into a canonical Structured Resume JSON schema.
 * Operates block-by-block and prevents cross-section leakage.
 *
 * @param {string} rawText - Clean raw text from document parser.
 * @returns {object} Canonical Structured Resume JSON.
 */
export function parseResumeToStructured(rawText) {
  const text = normalize(rawText);
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const rawSections = {
    header: [],
    summary: [],
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
    achievements: [],
    hobbies: []
  };

  let currentSection = "header";

  const getSectionHeaderKey = (line) => {
    if (line.length > 50) return null;
    const cleanLine = line.replace(/[:\-\s•*#]+$/, "").replace(/^[:\-\s•*#]+/, "").trim().toLowerCase();
    
    for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
      if (aliases.includes(cleanLine)) {
        return key;
      }
    }
    return null;
  };

  // 1. Group lines by synonymous section headers
  for (const line of lines) {
    const key = getSectionHeaderKey(line);
    if (key) {
      currentSection = key;
    } else {
      rawSections[currentSection].push(line);
    }
  }

  // 2. Prevent leakage in header section
  const refinedHeaderLines = [];
  for (const line of rawSections.header) {
    const lowerLine = line.toLowerCase();
    
    // Reroute leaked education
    const eduKeywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.sc", "m.sc", "b.e", "m.b.a", "degree", "diploma", "gpa", "cgpa", "university", "college", "school", "institute"];
    const hasEduKeyword = eduKeywords.some(kw => lowerLine.includes(kw)) || /\b(20\d{2}|19\d{2})\b/.test(line);

    // Reroute leaked languages
    const langKeywords = ["english", "hindi", "gujarati", "spanish", "french", "german", "languages"];
    const hasLangKeyword = langKeywords.some(kw => lowerLine.includes(kw)) && line.length < 50;

    // Reroute leaked hobbies
    const hobbyKeywords = ["hobby", "hobbies", "reading", "traveling", "playing", "music", "sports"];
    const hasHobbyKeyword = hobbyKeywords.some(kw => lowerLine.includes(kw));

    // Reroute leaked certifications
    const certKeywords = ["certified", "certification", "aws", "gcp", "azure", "coursera", "udemy"];
    const hasCertKeyword = certKeywords.some(kw => lowerLine.includes(kw)) && !lowerLine.includes("github.com") && !lowerLine.includes("linkedin.com");

    if (hasEduKeyword) {
      rawSections.education.push(line);
    } else if (hasLangKeyword) {
      rawSections.languages.push(line);
    } else if (hasHobbyKeyword) {
      rawSections.hobbies.push(line);
    } else if (hasCertKeyword) {
      rawSections.certifications.push(line);
    } else {
      refinedHeaderLines.push(line);
    }
  }
  rawSections.header = refinedHeaderLines;

  // 3. Extract and structure specific fields
  const headerBlock = rawSections.header.join("\n");
  const urls = extractUrls(headerBlock);

  const structured = {
    header: {
      name: extractName(headerBlock),
      email: extractEmail(headerBlock),
      phone: extractPhone(headerBlock),
      location: extractLocation(headerBlock),
      linkedin: urls.linkedin,
      github: urls.github,
      portfolio: urls.portfolio
    },
    summary: rawSections.summary.join("\n").trim(),
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
    achievements: [],
    hobbies: []
  };

  // 4. Parse education entries
  const rawEduText = rawSections.education.join("\n");
  const eduBlocks = rawEduText.split(/(?=\b(?:bachelor|master|phd|b\.tech|m\.tech|b\.sc|m\.sc|b\.e|m\.b.a|diploma)\b)/i).filter(Boolean);
  for (const block of eduBlocks) {
    const blockLines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 0) continue;

    const degreeLine = blockLines[0] || "";
    const instKeywords = ["university", "college", "institute", "school", "iit", "nit", "bits", "vit", "gcet"];
    const institutionLine = blockLines.find(l => instKeywords.some(kw => l.toLowerCase().includes(kw))) || blockLines[1] || "";
    
    const blockText = blockLines.join(" ");
    const gpaMatch = blockText.match(/cgpa[:\s]*(\d+\.?\d*)|gpa[:\s]*(\d+\.?\d*)|grade[:\s]*(\d+\.?\d*%?)/i);
    const dateMatch = blockText.match(/\b(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/i) || blockText.match(/\b(20\d{2}|19\d{2})\b/g);

    structured.education.push({
      institution: institutionLine,
      degree: degreeLine,
      fieldOfStudy: "",
      startDate: dateMatch?.[0] || "",
      endDate: dateMatch?.[1] || "",
      gpa: gpaMatch?.[0] || "",
      location: ""
    });
  }
  // Fallback if no specific degrees matched but raw text exists
  if (structured.education.length === 0 && rawEduText.trim().length > 0) {
    structured.education.push({
      institution: "Education Detail",
      degree: rawEduText,
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      gpa: "",
      location: ""
    });
  }

  // 5. Parse experience entries
  const rawExpText = rawSections.experience.join("\n");
  const expBlocks = rawExpText.split(/\n(?=[A-Za-z0-9\s,&]+ at [A-Za-z0-9\s,&]+|\b(?:software engineer|developer|manager|intern|analyst|engineer|designer)\b)/i).filter(Boolean);
  
  for (const block of expBlocks) {
    const blockLines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 0) continue;

    const firstLine = blockLines[0] || "";
    let company = "";
    let position = firstLine;
    if (firstLine.includes(" at ")) {
      const parts = firstLine.split(" at ");
      position = parts[0]?.trim();
      company = parts[1]?.trim();
    } else if (firstLine.includes(" - ")) {
      const parts = firstLine.split(" - ");
      position = parts[0]?.trim();
      company = parts[1]?.trim();
    }

    const blockText = blockLines.join(" ");
    const dateMatch = blockText.match(/\b(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/i);

    const highlights = blockLines.slice(1).filter(l => l.startsWith("•") || l.startsWith("-") || l.startsWith("*")).map(l => l.replace(/^[•\-*\s]+/, ""));

    structured.experience.push({
      company,
      position,
      location: "",
      startDate: dateMatch?.[1] || "",
      endDate: dateMatch?.[2] || "",
      highlights: highlights.length > 0 ? highlights : blockLines.slice(1)
    });
  }
  if (structured.experience.length === 0 && rawExpText.trim().length > 0) {
    structured.experience.push({
      company: "Work History",
      position: "Details",
      location: "",
      startDate: "",
      endDate: "",
      highlights: rawExpText.split("\n").map(l => l.replace(/^[•\-*\s]+/, ""))
    });
  }

  // 6. Parse projects entries
  const rawProjText = rawSections.projects.join("\n");
  const projBlocks = rawProjText.split(/\n(?=[A-Za-z0-9\s,&]{3,50}(?:\s*[\-–:]|\n))/).filter(Boolean);
  for (const block of projBlocks) {
    const blockLines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 0) continue;

    const name = blockLines[0]?.replace(/^[•\-*\s]+/, "") || "";
    const highlights = blockLines.slice(1).filter(l => l.startsWith("•") || l.startsWith("-") || l.startsWith("*")).map(l => l.replace(/^[•\-*\s]+/, ""));
    const tech = [];
    const techStackMatch = blockLines.join(" ").match(/skills|technologies|built with|stack[:\s]*([a-zA-Z0-9,\s]+)/i);
    if (techStackMatch) {
      techStackMatch[1].split(",").forEach(t => tech.push(t.trim()));
    }

    structured.projects.push({
      name,
      description: blockLines.slice(1).filter(l => !l.startsWith("•") && !l.startsWith("-") && !l.startsWith("*")).join(" "),
      technologies: tech,
      highlights: highlights.length > 0 ? highlights : blockLines.slice(1),
      url: ""
    });
  }
  if (structured.projects.length === 0 && rawProjText.trim().length > 0) {
    structured.projects.push({
      name: "Project",
      description: rawProjText,
      technologies: [],
      highlights: [],
      url: ""
    });
  }

  // 7. Parse skills
  structured.skills = rawSections.skills.join("\n").split(/,|\n|•|\|/).map(s => s.replace(/^[•\-*\s]+/, "").trim()).filter(Boolean);

  // 8. Other sections
  structured.certifications = rawSections.certifications.join("\n").split(/\n/).map(s => s.replace(/^[•\-*\s]+/, "").trim()).filter(Boolean);
  structured.languages = rawSections.languages.join("\n").split(/,|\n/).map(s => s.replace(/^[•\-*\s]+/, "").trim()).filter(Boolean);
  structured.achievements = rawSections.achievements.join("\n").split(/\n/).map(s => s.replace(/^[•\-*\s]+/, "").trim()).filter(Boolean);
  structured.hobbies = rawSections.hobbies.join("\n").split(/,|\n/).map(s => s.replace(/^[•\-*\s]+/, "").trim()).filter(Boolean);

  return structured;
}

/**
 * Backward compatibility: parses rawText to flat section formats
 */
export function parseSections(rawText) {
  const structured = parseResumeToStructured(rawText);
  return serializeStructuredToFlat(structured);
}

export function serializeStructuredToFlat(structured) {
  if (!structured || typeof structured !== "object") {
    return {
      header: "", summary: "", experience: "", skills: "", education: "", projects: "", certifications: ""
    };
  }

  const header = structured.header || {};
  const experience = Array.isArray(structured.experience) ? structured.experience : [];
  const education = Array.isArray(structured.education) ? structured.education : [];
  const projects = Array.isArray(structured.projects) ? structured.projects : [];
  const skills = Array.isArray(structured.skills) ? structured.skills : [];
  const certifications = Array.isArray(structured.certifications) ? structured.certifications : [];
  const languages = Array.isArray(structured.languages) ? structured.languages : [];
  const hobbies = Array.isArray(structured.hobbies) ? structured.hobbies : [];
  const achievements = Array.isArray(structured.achievements) ? structured.achievements : [];

  const expText = experience.map(exp => {
    if (!exp || typeof exp !== "object") return "";
    const titleLine = `${normalize(exp.position || "")} ${exp.company ? `at ${normalize(exp.company)}` : ""}`.trim();
    const highlights = Array.isArray(exp.highlights) ? exp.highlights : [];
    const bullets = highlights.map(h => `• ${normalize(h)}`).join("\n");
    return `${titleLine}\n${bullets}`.trim();
  }).filter(Boolean).join("\n\n");

  const eduText = education.map(edu => {
    if (!edu || typeof edu !== "object") return "";
    return `${normalize(edu.degree || "")} ${edu.institution ? `from ${normalize(edu.institution)}` : ""}`.trim();
  }).filter(Boolean).join("\n");

  const projText = projects.map(p => {
    if (!p || typeof p !== "object") return "";
    const header = normalize(p.name || "");
    const highlights = Array.isArray(p.highlights) ? p.highlights : [];
    const bullets = highlights.map(h => `• ${normalize(h)}`).join("\n");
    return `${header}\n${bullets}`.trim();
  }).filter(Boolean).join("\n\n");

  const headerText = `${normalize(header.name)}\n${normalize(header.email)}\n${normalize(header.phone)}\n${normalize(header.location)}\n${normalize(header.linkedin)}\n${normalize(header.github)}\n${normalize(header.portfolio)}`
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .join("\n");

  return {
    header: headerText,
    summary: normalize(structured.summary),
    experience: expText,
    skills: skills.map(normalize).join(", "),
    education: eduText,
    projects: projText,
    certifications: [
      ...certifications.map(normalize),
      ...languages.map(normalize),
      ...hobbies.map(normalize),
      ...achievements.map(normalize)
    ].join("\n").trim()
  };
}

/**
 * Deterministic scoring calculations.
 */
export function calculateOverallAtsScore(sections, jdKeywords = []) {
  // Map sections object back to structured representation
  const structured = {
    header: {
      name: extractName(sections.header || ""),
      email: extractEmail(sections.header || ""),
      phone: extractPhone(sections.header || ""),
      location: extractLocation(sections.header || ""),
      linkedin: extractUrls(sections.header || "").linkedin,
      github: extractUrls(sections.header || "").github,
      portfolio: extractUrls(sections.header || "").portfolio
    },
    summary: sections.summary || "",
    education: sections.education ? [{ degree: sections.education, institution: "" }] : [],
    experience: sections.experience ? [{ highlights: [sections.experience] }] : [],
    projects: sections.projects ? [{ highlights: [sections.projects] }] : [],
    skills: sections.skills ? sections.skills.split(",") : [],
    certifications: sections.certifications ? sections.certifications.split("\n") : []
  };

  const results = scoreResume(structured, jdKeywords);
  return {
    score: results.overallScore,
    breakdown: results.categoryScores
  };
}

export const computeAtsScore = ({ name, email, phone, skills, experience, education, rawText }) => {
  const structured = {
    header: { name, email, phone, location: "", linkedin: "", github: "", portfolio: "" },
    summary: "",
    education: education ? [{ degree: education, institution: "" }] : [],
    experience: experience ? [{ highlights: [experience] }] : [],
    projects: [],
    skills: skills || [],
    certifications: []
  };
  const results = scoreResume(structured, []);
  return {
    score: results.overallScore,
    breakdown: results.categoryScores
  };
};

/**
 * Full file processing (including python parsing stage calls).
 */
export const extractResumeData = async ({ filePath, mimeType }) => {
  let parsedData = {};
  try {
    const pythonScriptPath = path.join(process.cwd(), "utils", "parse_resume.py");
    const output = execSync(`python "${pythonScriptPath}" "${filePath}"`, { encoding: "utf8" });
    parsedData = JSON.parse(output);
  } catch (err) {
    parsedData = {};
  }

  const rawText = parsedData.raw_text || "";
  const structured = parseResumeToStructured(rawText);

  // Map to flat backward-compatible output
  const result = {
    name: structured.header.name || parsedData.name || "Anonymous",
    email: structured.header.email || parsedData.email || "",
    phone: structured.header.phone || parsedData.mobile_number || "",
    degree: parsedData.degree || [],
    noOfPages: parsedData.no_of_pages || null,
    skills: structured.skills.length > 0 ? structured.skills : parsedData.skills || [],
    experience: serializeStructuredToFlat(structured).experience,
    education: serializeStructuredToFlat(structured).education,
    rawText,
    structured
  };

  const finalScore = scoreResume(structured, []).overallScore;

  return {
    ...result,
    atsScore: finalScore,
  };
};
