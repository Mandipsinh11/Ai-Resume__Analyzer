import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";

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

/** Local fallback when Gemini is unavailable — still returns useful ATS feedback. */
export function buildBasicAnalysis(resumeText, role = "", jobDescription = "") {
  const text = resumeText || "";
  const lower = text.toLowerCase();
  const skills = COMMON_SKILLS.filter((skill) => lower.includes(skill)).map(
    (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
  );

  const emailMatch = text.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  );
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,}\d)/);

  let atsScore = 55;
  if (text.length > 400) atsScore += 10;
  if (text.length > 900) atsScore += 5;
  if (emailMatch) atsScore += 8;
  if (phoneMatch) atsScore += 7;
  if (skills.length >= 3) atsScore += 10;
  if (skills.length >= 6) atsScore += 5;

  const jdBlob = `${role} ${jobDescription}`.toLowerCase();
  const jdTokens = [
    ...new Set(jdBlob.split(/\W+/).filter((w) => w.length > 3)),
  ];
  const matchedJd = jdTokens.filter((w) => lower.includes(w));
  if (jdTokens.length > 0) {
    const matchPct = Math.round((matchedJd.length / jdTokens.length) * 100);
    atsScore = Math.min(92, Math.round(35 + matchPct * 0.55));
  }

  const improvements = [];
  if (text.length < 500)
    improvements.push(
      "Low semantic density detected — expand experience bullets.",
    );
  if (!emailMatch) improvements.push("Add a professional email address.");
  if (!phoneMatch) improvements.push("Add a contact phone number.");
  if (jdTokens.length > 0 && matchedJd.length < jdTokens.length * 0.4) {
    improvements.push("Align more keywords from the job description.");
  }
  if (improvements.length === 0) {
    improvements.push("Quantify achievements with metrics where possible.");
    improvements.push("Use strong action verbs at the start of each bullet.");
  }
  return {
    atsScore,
    strengths: [
      "Contact information detected",
      "Resume contains structured content",
    ],
    missingKeywords: jdTokens.filter((w) => !lower.includes(w)).slice(0, 12),

    improvements: [
      {
        section: "Keywords",
        issue: "Limited keyword match with job description",
        whyItMatters: "ATS systems rely on keyword matching.",
        suggestedFix: "Add relevant keywords from the target role.",
        example: "Talent Acquisition, Employee Onboarding",
        priority: "HIGH",
      },
    ],

    finalRecommendations: [
      "Add more job-specific keywords",
      "Quantify achievements",
      "Use action verbs",
    ],
  };
}

export const analyzeAndImproveResume = async (
  resumeText,
  role = "",
  jobDescription = "",
) => {
  try {
    const prompt = `
    Analyze the provided resume and generate a detailed ATS Improvement Report.

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
  Target Role:
  ${role}
  Job Description:
  ${jobDescription}
  `;
    const ai = getGeminiClient();
    if (!ai) {
      return buildBasicAnalysis(resumeText, role, jobDescription);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    console.log("========== GEMINI RAW RESPONSE ==========");
    console.log(text);
    console.log("=========================================");

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    let cleanedText = jsonMatch ? jsonMatch[1].trim() : text.trim();

    const objectMatch = cleanedText.match(/\{[\s\S]*\}$/);

    if (objectMatch) {
      cleanedText = objectMatch[0];
    }

    let parsed;

    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      console.error("❌ JSON Parse Failed");
      console.error("❌ Raw Response:");
      console.error(cleanedText);
      throw err;
    }

    if (!parsed.atsScore) {
      const basic = buildBasicAnalysis(resumeText, role, jobDescription);
      parsed.atsScore = basic.atsScore;
      parsed.improvements = parsed.improvements || basic.improvements;
      parsed.missingKeywords = parsed.missingKeywords || basic.missingKeywords;
    }

    return parsed;
  } catch (error) {
    console.error(
      "Gemini unavailable, using local analysis:",
      error.response?.data || error.message || error,
    );
    return buildBasicAnalysis(resumeText, role, jobDescription);
  }
};

function _safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
}

export function normalizeResumeJsonForPdf(resumeJson) {
  const safe = resumeJson && typeof resumeJson === "object" ? resumeJson : {};

  const educationRaw = safe.education;
  const educationArr = Array.isArray(educationRaw) ? educationRaw : [];

  const normalizedEducation = educationArr
    .filter((x) => x && typeof x === "object")
    .map((edu) => {
      const institution = _safeString(edu.institution).trim();
      const degree = _safeString(edu.degree).trim();
      const dates =
        _safeString(edu.dates).trim() || _safeString(edu.year).trim();

      return { institution, degree, dates };
    });

  return {
    ...safe,
    education: normalizedEducation,
    experience: Array.isArray(safe.experience) ? safe.experience : [],
    skills: Array.isArray(safe.skills) ? safe.skills : [],
    summary: _safeString(safe.summary),
    personal_info:
      safe.personal_info && typeof safe.personal_info === "object"
        ? safe.personal_info
        : {},
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
