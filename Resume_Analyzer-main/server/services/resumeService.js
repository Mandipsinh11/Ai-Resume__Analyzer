import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { parseResumeToStructured } from "../utils/resumeParser.js";
import { scoreResume } from "../utils/atsScorer.js";
import { analyzeGaps } from "../utils/gapAnalysis.js";
import { callAI, callGemini, callGroq, getGeminiApiKey, getGroqApiKey, safeJsonParse } from "../utils/gemini.js";


const COMMON_SKILLS = [
  "python",
  "java",
  "javascript",
  "typescript",
  "react",
  "angular",
  "vue",
  "node.js",
  "nodejs",
  "django",
  "flask",
  "fastapi",
  "sql",
  "postgresql",
  "mysql",
  "mongodb",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "machine learning",
  "nlp",
  "tensorflow",
  "pytorch",
  "c++",
  "c#",
  "go",
  "rust",
  "html",
  "css",
  "spring",
  "express",
  "redis",
  "graphql",
  "rest api",
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}


export function buildBasicAnalysis(resumeText, role = "", jobDescription = "") {
  const structured = parseResumeToStructured(resumeText);
  const targetText = jobDescription.trim() ? jobDescription : role;
  const jdKeywords = targetText.split(/\W+/).filter(w => w.length > 3).slice(0, 10);
  const score = scoreResume(structured, jdKeywords);
  const gaps = analyzeGaps(structured, jobDescription, role);

  const improvements = gaps.weakSections.map(w => ({
    section: w.section,
    issue: w.issue,
    whyItMatters: w.impact,
    suggestedFix: `Optimize the ${w.section} section layout and keywords.`,
    example: "Provide quantitative results and clear verbs.",
    priority: w.section === "Experience" || w.section === "Skills" ? "HIGH" : "MEDIUM"
  }));

  if (improvements.length === 0) {
    improvements.push({
      section: "Experience",
      issue: "No obvious format weaknesses.",
      whyItMatters: "Bullet metrics verify claims.",
      suggestedFix: "Quantify metrics.",
      example: "Spearheaded platform updates, reducing runtime by 15%",
      priority: "LOW"
    });
  }

  return {
    atsScore: score.overallScore,
    _source: "local",
    strengths: [
      "Resume text parsed successfully",
      "Standard template headings found"
    ],
    missingKeywords: gaps.missingKeywords,
    improvements,
    finalRecommendations: gaps.weakSections.map(w => w.issue)
  };
}

export const analyzeAndImproveResume = async (
  resumeText,
  role = "",
  jobDescription = "",
) => {
  const prompt = `
    Act as a senior recruiter, ATS specialist, hiring manager, and career coach with 15+ years of recruitment experience.
    Analyze the provided resume thoroughly and provide a brutally honest, unbiased assessment of why recruiters may not be showing interest in this profile.
    
    Calculate a realistic, strictly calibrated ATS Score (out of 100) reflecting the true quality and ATS readability of the resume${
      role ? ` for the target role` : ""
    }.
    Do not sugarcoat the grading. Be direct and evidence-based, penalizing missing metrics, generic phrasing, and formatting issues.

    Return ONLY valid JSON.
    IMPORTANT:
- Response must start with {
- Response must end with }
- No markdown
- No code fences
- No explanations
- No notes
- No text before JSON
- No text after JSON
- Output must be valid JSON.parse() compatible

    {
      "atsScore": 0,
      "strengths": [],
      "missingKeywords": [],
      "improvements": [
      {
        "section": "",
        "issue": "",
        "whyItMatters": "",
        "suggestedFix": "",
        "example": "",
        "priority": ""
      }
    ],
    "finalRecommendations": []
  }

  Rules:
  1. Mention exact resume section.
  2. Explain issue.
  3. Explain why it affects ATS score.
  4. Provide specific fix.
  5. Provide example improvement.
  6. Do NOT rewrite the full resume.
  7. Do NOT generate an improved resume.
  8. Focus only on ATS improvement suggestions.

  Resume:
  ${resumeText}
  ${role ? `Target Role:\n${role}\n` : ""}${jobDescription ? `Job Description:\n${jobDescription}\n` : ""}
  `;

  let parsed = null;
  let sourceUsed = "local";

  if (getGeminiApiKey()) {
    try {
      console.log("Trying Resume Analysis with Gemini...");
      const text = await callGemini(prompt, {
        temperature: 0.3,
        maxTokens: 4000,
        responseMimeType: "application/json",
      });
      parsed = safeJsonParse(text);
      sourceUsed = "gemini";
      console.log("✓ Resume Analysis succeeded with Gemini");
    } catch (geminiErr) {
      console.warn(`Gemini Resume Analysis failed or returned invalid JSON: ${geminiErr.message}`);
      console.log("→ Falling back to Groq...");
    }
  }

  if (!parsed && getGroqApiKey()) {
    try {
      console.log("Trying Resume Analysis with Groq...");
      const text = await callGroq(prompt, {
        temperature: 0.3,
        maxTokens: 4000,
      });
      parsed = safeJsonParse(text);
      sourceUsed = "groq";
      console.log("✓ Resume Analysis succeeded with Groq");
    } catch (groqErr) {
      console.warn(`Groq Resume Analysis failed or returned invalid JSON: ${groqErr.message}`);
    }
  }

  if (!parsed) {
    console.log("Using local offline resume analysis fallback...");
    const basic = buildBasicAnalysis(resumeText, role, jobDescription);
    parsed = basic;
    sourceUsed = "local";
  } else {
    if (!parsed.atsScore) {
      const basic = buildBasicAnalysis(resumeText, role, jobDescription);
      parsed.atsScore = basic.atsScore;
      parsed.improvements = parsed.improvements || basic.improvements;
      parsed.missingKeywords = parsed.missingKeywords || basic.missingKeywords;
    }
  }

  parsed._source = sourceUsed;
  return parsed;
};

function _safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
}
export function normalizeResumeJsonForPdf(resumeJson) {
  const safe = resumeJson && typeof resumeJson === "object" ? resumeJson : {};

  // Extract contact info
  let personal_info = {};
  if (safe.personal_info && typeof safe.personal_info === "object") {
    personal_info = safe.personal_info;
  } else if (safe.header && typeof safe.header === "object") {
    personal_info = {
      name: _safeString(safe.header.name),
      email: _safeString(safe.header.email),
      phone: _safeString(safe.header.phone),
      linkedin: _safeString(safe.header.linkedin),
      github: _safeString(safe.header.github),
      portfolio: _safeString(safe.header.portfolio),
      location: _safeString(safe.header.location)
    };
  }

  // Normalize education
  const educationRaw = safe.education;
  const educationArr = Array.isArray(educationRaw) ? educationRaw : [];
  const normalizedEducation = educationArr
    .filter((x) => x && typeof x === "object")
    .map((edu) => {
      const institution = _safeString(edu.institution).trim();
      const degree = _safeString(edu.degree).trim();
      
      let dates = _safeString(edu.dates || edu.year).trim();
      if (!dates && (edu.startDate || edu.endDate)) {
        dates = `${_safeString(edu.startDate)} - ${_safeString(edu.endDate)}`.trim().replace(/^- |-$/, "");
      }

      return { institution, degree, dates };
    });

  // Normalize experience
  const experienceRaw = safe.experience;
  const experienceArr = Array.isArray(experienceRaw) ? experienceRaw : [];
  const normalizedExperience = experienceArr
    .filter((x) => x && typeof x === "object")
    .map((job) => {
      const company = _safeString(job.company).trim();
      const title = _safeString(job.title || job.position).trim();
      
      let dates = _safeString(job.dates).trim();
      if (!dates && (job.startDate || job.endDate)) {
        dates = `${_safeString(job.startDate)} - ${_safeString(job.endDate)}`.trim().replace(/^- |-$/, "");
      }

      const responsibilities = Array.isArray(job.responsibilities) 
        ? job.responsibilities 
        : Array.isArray(job.highlights) 
          ? job.highlights 
          : [job.responsibilities || job.highlights].filter(Boolean);

      return { company, title, dates, responsibilities: responsibilities.map(r => _safeString(r).trim()) };
    });

  return {
    personal_info,
    summary: _safeString(safe.summary),
    education: normalizedEducation,
    experience: normalizedExperience,
    skills: Array.isArray(safe.skills) ? safe.skills.map(s => _safeString(s)) : [],
    certifications: Array.isArray(safe.certifications) ? safe.certifications.map(c => _safeString(c)) : []
  };
}

export const generateResumePDF = async (resumeJson) => {
  try {
    const normalized = normalizeResumeJsonForPdf(resumeJson);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume - ${_safeString(normalized.personal_info?.name) || "User"}</title>

          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
              h2 { color: #2980b9; margin-top: 30px; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
              .contact-info { margin-bottom: 20px; font-size: 0.9em; color: #7f8c8d; }
              .summary { font-style: italic; margin-bottom: 30px; }
              .job { margin-bottom: 20px; }
              .job-header { display: flex; justify-content: space-between; font-weight: bold; }
              .job-title { font-weight: normal; font-style: italic; color: #555; }
              ul { margin-top: 5px; padding-left: 20px; }
              li { margin-bottom: 5px; }
              .skills { display: flex; flex-wrap: wrap; gap: 10px; }
              .skill-tag { background-color: #ecf0f1; padding: 5px 10px; border-radius: 5px; font-size: 0.9em; }
          </style>
      </head>
      <body>
          <h1>${_safeString(normalized.personal_info?.name) || "Your Name"}</h1>
          <div class="contact-info">
              ${_safeString(normalized.personal_info?.email) || ""} | 
              ${_safeString(normalized.personal_info?.phone) || ""} | 
              ${_safeString(normalized.personal_info?.linkedin) || ""}
          </div>
          
          <div class="summary">
              ${_safeString(normalized.summary) || ""}
          </div>
          
          <h2>Experience</h2>
          ${(normalized.experience || [])
            .map(
              (job) => `

              <div class="job">
                  <div class="job-header">
                      <span>${_safeString(job?.company)}</span>
                      <span>${_safeString(job?.dates)}</span>
                  </div>
                  <div class="job-title">${_safeString(job?.title)}</div>
                  <ul>
                      ${(Array.isArray(job?.responsibilities)
                        ? job.responsibilities
                        : []
                      )
                        .filter(Boolean)
                        .map((resp) => `<li>${_safeString(resp)}</li>`)
                        .join("")}
                  </ul>
              </div>
          `,
            )
            .join("")}
          
          <h2>Education</h2>
          ${(normalized.education || [])
            .map(
              (edu) => `

              <div class="job">
                  <div class="job-header">
                      <span>${_safeString(edu?.institution)}</span>
                      <span>${_safeString(edu?.dates)}</span>
                  </div>
                  <div class="job-title">${_safeString(edu?.degree)}</div>
              </div>
          `,
            )
            .join("")}
          
          <h2>Skills</h2>
          <div class="skills">
              ${(normalized.skills || [])
                .map(
                  (skill) =>
                    `<span class="skill-tag">${_safeString(skill)}</span>`,
                )
                .join("")}
          </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF with Puppeteer:", error);
    throw new Error("Failed to generate PDF");
  }
};
