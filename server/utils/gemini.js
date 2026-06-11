<<<<<<< server/utils/gemini.js
import { buildBasicAnalysis } from "../services/resumeService.js";

// v1beta supports responseMimeType; the v1 endpoint rejects it (400 Invalid JSON payload).
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash"];
const MODELS_FROM_ENV = (process.env.GEMINI_MODELS || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const ACTIVE_MODELS = MODELS_FROM_ENV.length ? MODELS_FROM_ENV : DEFAULT_MODELS;

const MAX_PROMPT_CHARS = Number(process.env.GEMINI_MAX_PROMPT_CHARS || 32000);
const MAX_ERROR_TEXT_CHARS = 800;

function getApiUrl(model) {
  const apiKey = getGeminiApiKey();
  return `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
}

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

  console.log("Gemini Key Loaded:", !!key);

  return String(key).trim();
}

function assertGeminiConfigured() {
  if (!getGeminiApiKey()) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeText(input) {
  return String(input || "")
    .replace(/\u0000/g, "")
    .trim();
}

function truncateForPrompt(text, maxChars = MAX_PROMPT_CHARS) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[...truncated ${text.length - maxChars} chars]`;
}

function shouldRetryStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function isPermanentQuotaError(message = "") {
  const lower = String(message).toLowerCase();
  return (
    lower.includes("quota exceeded") &&
    (lower.includes("limit: 0") ||
      lower.includes("billing") ||
      lower.includes("free_tier_requests"))
  );
}

function isRetryableError(err) {
  return err?.name === "AbortError" || err?.name === "TypeError";
}

function extractApiError(payload, fallbackText = "") {
  const message =
    payload?.error?.message || fallbackText || "Unknown Gemini API error";
  const compact = sanitizeText(message).slice(0, MAX_ERROR_TEXT_CHARS);
  return compact || "Unknown Gemini API error";
}

function extractCandidateText(data) {
  const candidates = data?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return "";

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

async function callGemini(prompt, options = {}) {
  assertGeminiConfigured();

  const {
    temperature = 0.2,
    maxTokens = 2048,
    timeout = 30000,
    retries = 2,
    responseMimeType,
  } = options;

  const finalPrompt = truncateForPrompt(sanitizeText(prompt));
  if (!finalPrompt) {
    throw new Error("Prompt is required");
  }

  let lastError;

  for (const model of ACTIVE_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      let shouldRetry = false;

      try {
        const response = await fetch(getApiUrl(model), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              ...(responseMimeType && { responseMimeType }),
            },
          }),
        });

        if (!response.ok) {
          let payload;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }

          const apiError = extractApiError(payload, response.statusText);
          const error = new Error(
            `Model ${model} failed: ${response.status} - ${apiError}`,
          );
          error.status = response.status;
          shouldRetry =
            shouldRetryStatus(response.status) &&
            !isPermanentQuotaError(apiError);
          throw error;
        }

        const data = await response.json();
        const text = extractCandidateText(data);

        if (!text) {
          throw new Error(`Empty response from ${model}`);
        }

        return text;
      } catch (err) {
        lastError = err;
        shouldRetry = shouldRetry || isRetryableError(err);

        const prefix = shouldRetry ? "Retryable Gemini error" : "Gemini error";
        console.warn(
          `${prefix} (${model}, attempt ${attempt + 1}/${retries + 1}): ${err.message}`,
        );

        if (!shouldRetry) {
          break;
        }

        if (attempt < retries) {
          const backoffMs =
            300 * 2 ** attempt + Math.floor(Math.random() * 120);
          await sleep(backoffMs);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${lastError?.message || "Unknown"}`,
  );
}

function safeJsonParse(text) {
  const input = sanitizeText(text);
  const jsonMatch = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const withoutFences = jsonMatch ? jsonMatch[1].trim() : input.trim();

  const candidates = [withoutFences, input];
  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return JSON.parse(candidate);
    } catch {
      // Try object/array extraction next.
    }

    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Keep trying.
      }
    }

    const arrayMatch = candidate.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // Keep trying.
      }
    }
  }

  throw new Error(
    `Invalid JSON response from Gemini: ${input.slice(0, MAX_ERROR_TEXT_CHARS)}`,
  );
}

export async function getCodeFeedback(code, language = "plain text") {
  const normalizedCode = sanitizeText(code);
  if (!normalizedCode) {
    throw new Error("Code is required");
  }

  const prompt = `
You are a senior code reviewer.

Analyze the following ${language} code and provide:
- Issues
- Improvements
- Best practices
- Performance suggestions

Keep it concise and practical.

CODE:
${normalizedCode}
`;

  return await callGemini(prompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });
}

export async function analyzeResume(role, jobDescription = "", resumeText) {
  const cleanRole = sanitizeText(role);
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");

  if (!cleanRole || !cleanResumeText) {
    throw new Error("Role and resumeText are required");
  }

  const prompt = `
You are an ATS resume analyzer.

Return ONLY valid JSON.

INPUT:
ROLE: ${cleanRole}
JOB DESCRIPTION: ${cleanJobDescription}
RESUME:
${cleanResumeText}

OUTPUT FORMAT:
{
  "atsScore": number,
  "missingKeywords": [],
  "addedKeywords": [],
  "issues": [],
  "suggestions": [],
  "optimizedResume": ""
}

RULES:
- No markdown
- No explanations
- No extra text
- Do not hallucinate fake experience
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.2,
    maxTokens: 2048,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

export async function getAtsTips(parsedData) {
  const cleanData = JSON.stringify(parsedData);

  const prompt = `
You are an expert career coach and ATS specialist.
Analyze the following extracted resume data and provide exactly 3-5 actionable tips to improve the resume's ATS score and professional impact.

EXTRACTED DATA:
${cleanData}

Return ONLY a JSON array of strings (the tips).
Example: ["Add more quantifiable achievements", "Include missing keywords like 'React'"]

RULES:
- No markdown
- No explanations
- No extra text
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.3,
    maxTokens: 512,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

function buildLocalFixResume(resumeText, jobDescription = "", role = "") {
  const basic = buildBasicAnalysis(resumeText, role, jobDescription);
  const improvementBlock = basic.improvements
    .map((item, i) => {
      if (typeof item === "string") {
        return `${i + 1}. ${item}`;
      }

      return `${i + 1}. ${item.suggestedFix || item.issue || "Resume improvement applied"}`;
    })
    .join("\n");

  const scoreBefore = Math.min(84, Math.max(35, (basic.atsScore || 70) - 8));
  return {
    atsScoreBefore: scoreBefore,
    atsScoreAfter: 96,
    keywordsAdded: (basic.missingKeywords || []).slice(0, 8),
    overview: {
      overall_ats_score: 96,
      pass_probability: 95,
      top10_match_percent: 94,
      internship_count: 1,
      total_experience_months: 6,
    },

    strengths: [
      "Strong technical skills",
      "Relevant projects",
      "Good ATS formatting",
      "Clear resume structure",
    ],

    redFlags: [
      "Missing quantified achievements",
      "Keyword gaps detected",
      "Limited professional experience",
      "Weak impact metrics",
    ],

    missingKeywords: basic.missingKeywords || [],

    recruiterImpression: {
      impression: "Needs improvement",
      photoRisk: "Low",
      sections: "Average",
      asset: "Projects",
    },

    deepAnalysis: {
      candidateName: "",
      atsScore: basic.atsScore || 70,
      atsProbability: 60,
      sectionScores: {
        keywords: 65,
        formatting: 80,
        experience: 55,
        skills: 70,
        education: 75,
        achievements: 50,
        readability: 65,
      },
      firstImpression: {
        immediateImpression: "Needs improvement",
        immediateColor: "amber",
        photoRisk: "Low risk",
        photoColor: "green",
        sections: "Too many",
        sectionsColor: "amber",
        biggestAsset: "Education",
        assetColor: "green",
      },
      strengths: [
        "Strong technical skills",
        "Relevant academic projects",
        "Good ATS-friendly formatting",
      ],
      redFlags: [
        {
          text: "No quantified achievements anywhere in the resume",
          severity: "red",
        },
        {
          text: "Missing high-value ATS keywords for the target role",
          severity: "red",
        },
        {
          text: "Experience section lacks measurable impact",
          severity: "amber",
        },
        { text: "Professional summary is too generic", severity: "amber" },
      ],
      missingKeywords: {
        critical: (basic.missingKeywords || []).slice(0, 6),
        important: (basic.missingKeywords || []).slice(6, 12),
      },
      competitiveness: {
        internship: { you: 20, top: 85 },
        quantifiedImpact: { you: 10, top: 80 },
        keywords: { you: 45, top: 85 },
        technicalTools: { you: 35, top: 75 },
        certifications: { you: 30, top: 70 },
      },
      interviewChance: "10-20%",
      interviewChanceColor: "red",
      top10Changes: [
        {
          number: 1,
          text: "Add quantified achievements to every bullet point",
        },
        {
          number: 2,
          text: "Include missing high-value keywords from the job description",
        },
        {
          number: 3,
          text: "Rewrite the professional summary to be role-specific",
        },
        {
          number: 4,
          text: "Add measurable impact metrics to experience section",
        },
        {
          number: 5,
          text: "Strengthen project descriptions with outcomes and results",
        },
        {
          number: 6,
          text: "Remove generic soft-skill buzzwords without evidence",
        },
        {
          number: 7,
          text: "Use consistent date formatting throughout the resume",
        },
        {
          number: 8,
          text: "Add a dedicated skills section with role-relevant tools",
        },
        {
          number: 9,
          text: "Get an internship or freelance project to fill experience gap",
        },
        {
          number: 10,
          text: "Add relevant certifications from Coursera or LinkedIn Learning",
        },
      ],
      rewrites: [
        {
          title: "Professional Summary",
          oldText: "Seeking an entry-level opportunity to apply my skills...",
          newText:
            "Results-driven professional with expertise in [target domain], seeking to leverage [specific skills] at [company type] to deliver [specific outcome].",
        },
        {
          title: "Experience Bullet Point",
          oldText: "Worked on various projects and helped the team.",
          newText:
            "Delivered 3 cross-functional projects on time, reducing team workload by 20% through process automation and documentation improvements.",
        },
      ],
      finalVerdict: {
        wouldShortlist: false,
        reason:
          "The resume shows potential but lacks the quantified achievements and keyword optimization needed to compete effectively. With focused improvements to the experience section and keyword alignment, interview chances would improve significantly.",
        biggestBlocker:
          "Zero quantified achievements — no single metric or outcome anywhere in the resume.",
        goodNews:
          "The core structure is solid and the qualifications are relevant. These are fixable issues that can be addressed in 1-2 weeks of focused effort.",
      },
    },

    verdict: {
      status: "Would not shortlist",
      reason:
        "Candidate shows potential but requires stronger evidence of measurable impact, better keyword alignment, and more achievement-focused experience before competing with top applicants.",
    },

    _source: "local",
  };
}

export async function fixResumeWithAI(
  resumeText,
  jobDescription = "",
  role = "",
) {
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");
  const cleanRole = sanitizeText(role || "desired position not specified");

  if (!cleanResumeText) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are an expert ATS resume optimizer specializing in improving resume ATS scores and matching.

Your task is to improve the provided resume to:
1. Increase ATS score by optimizing keyword placement to a target score of 96
2. Add quantifiable achievements and metrics
3. Use strong action verbs
4. Improve formatting for ATS compatibility
5. Match it with the target role and job description

Your optimization should aim to bring the ATS score (returned as "atsScoreAfter" and "overall_ats_score") up to 96.

INPUT:
TARGET ROLE: ${cleanRole}
JOB DESCRIPTION: ${cleanJobDescription}
ORIGINAL RESUME:
${cleanResumeText}

OUTPUT: Return ONLY valid JSON (no markdown, no explanations)
{
  "atsScoreBefore": 0,
  "atsScoreAfter": 0,

  "keywordsAdded": [],

  "strengths": [],

  "redFlags": [],

  "missingKeywords": [],

  "recruiterImpression": {
    "impression": "",
    "photoRisk": "",
    "sections": "",
    "asset": ""
  },

  "overview": {
    "overall_ats_score": 0,
    "pass_probability": 0,
    "top10_match_percent": 0,
    "internship_count": 0,
    "total_experience_months": 0
  },

  "sectionScores": {
    "keywords_score": 0,
    "experience_depth_score": 0,
    "formatting_score": 0,
    "skills_relevance_score": 0,
    "education_score": 0,
    "quantified_achievements_score": 0
  },

  "radarData": [
    {
      "subject": "Experience",
      "candidate": 0,
      "top10": 85
    },
    {
      "subject": "Skills",
      "candidate": 0,
      "top10": 90
    },
    {
      "subject": "Achievements",
      "candidate": 0,
      "top10": 88
    },
    {
      "subject": "Keywords",
      "candidate": 0,
      "top10": 92
    },
    {
      "subject": "Education",
      "candidate": 0,
      "top10": 80
    }
  ],

  "blockers": [],

    "deepAnalysis": {
    "candidateName": "",
    "atsScore": 0,
    "atsProbability": 0,

    "sectionScores": {
      "keywords": 0,
      "formatting": 0,
      "experience": 0,
      "skills": 0,
      "education": 0,
      "achievements": 0,
      "readability": 0
    },

    "firstImpression": {
      "immediateImpression": "",
      "immediateColor": "red|amber|green",
      "photoRisk": "",
      "photoColor": "red|amber|green",
      "sections": "",
      "sectionsColor": "red|amber|green",
      "biggestAsset": "",
      "assetColor": "red|amber|green"
    },

    "strengths": [],

    "redFlags": [
      { "text": "", "severity": "red|amber" }
    ],

    "missingKeywords": {
      "critical": [],
      "important": []
    },

    "competitiveness": {
      "internship":       { "you": 0, "top": 85 },
      "quantifiedImpact": { "you": 0, "top": 80 },
      "keywords":         { "you": 0, "top": 85 },
      "technicalTools":   { "you": 0, "top": 75 },
      "certifications":   { "you": 0, "top": 70 }
    },

    "interviewChance": "",
    "interviewChanceColor": "red|amber|green",

    "top10Changes": [
      { "number": 1, "text": "" }
    ],

    "rewrites": [
      { "title": "", "oldText": "", "newText": "" }
    ],

    "finalVerdict": {
      "wouldShortlist": false,
      "reason": "",
      "biggestBlocker": "",
      "goodNews": ""
    }
  },
    
    "verdict": {
    "status": "",
    "reason": ""
  }
}

RULES:
- Do NOT hallucinate professional experience
- Enhance existing content with better wording
- Add missing sections if clearly needed
- Keep the resume realistic and honest
- Start action verbs with capital letters
- Include metrics and quantifiable results
- Format for ATS (no tables, no images, simple formatting)

- atsScoreBefore / atsScoreAfter: realistic 0-100 scores
- verdict.status: exactly "Would shortlist" OR "Would not shortlist"
- verdict.reason: 80-150 words
- Return exactly 5 blockers
- Return exactly 4 strengths (top-level)
- Return exactly 4 redFlags (top-level)
- Return 5-10 missingKeywords (top-level array)
- recruiterImpression.photoRisk: "Low", "Medium", or "High"
- recruiterImpression.sections: "Excellent", "Good", "Average", or "Poor"
- recruiterImpression.impression: under 10 words
- recruiterImpression.asset: under 5 words

- deepAnalysis.candidateName: extract from resume
- deepAnalysis.atsScore: 0-100
- deepAnalysis.atsProbability: 0-100 (probability of passing ATS filter)
- deepAnalysis.sectionScores: all values 0-100
- deepAnalysis.firstImpression colors: "red", "amber", or "green" only
- deepAnalysis.strengths: 3-5 specific strengths from THIS resume
- deepAnalysis.redFlags: 3-6 specific red flags, each with severity "red" or "amber"
- deepAnalysis.missingKeywords.critical: 5-8 must-have keywords missing from resume
- deepAnalysis.missingKeywords.important: 4-6 good-to-have keywords missing
- deepAnalysis.competitiveness: all "you" values 0-100 based on actual resume
- deepAnalysis.interviewChance: format like "5-10%" or "25-35%"
- deepAnalysis.interviewChanceColor: "red" (<20%), "amber" (20-50%), "green" (>50%)
- deepAnalysis.top10Changes: exactly 10 items numbered 1-10
- deepAnalysis.rewrites: 2-4 before/after rewrites of weak sections
- deepAnalysis.finalVerdict.wouldShortlist: true or false
- deepAnalysis.finalVerdict.reason: 2-3 sentences
- deepAnalysis.finalVerdict.biggestBlocker: 1 sentence, the #1 reason
- deepAnalysis.finalVerdict.goodNews: 1-2 sentences of encouragement

- strengths and redFlags must be SPECIFIC to this resume, not generic
- missingKeywords must come from the target job description or role
`;

  try {
    const resultText = await callGemini(prompt, {
      temperature: 0.4,
      maxTokens: 5000,
      responseMimeType: "application/json",
    });
    return safeJsonParse(resultText);
  } catch (error) {
    console.warn("fixResumeWithAI fallback:", error.message);
    return buildLocalFixResume(cleanResumeText, cleanJobDescription, cleanRole);
  }
}

export async function analyzeTemplateIssues(resumeText) {
  const cleanResumeText = sanitizeText(resumeText);

  if (!cleanResumeText) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are an expert resume formatter and ATS specialist with deep knowledge of industry standards.

Analyze this resume for template, formatting, and structural issues. Return ONLY valid JSON.

RESUME:
${cleanResumeText}

OUTPUT: Return ONLY valid JSON (no markdown, no code blocks, no explanations)
{
  "templateIssues": [
    {
      "issue": "description of the issue",
      "severity": "critical" | "high" | "medium" | "low",
      "impact": "how this affects ATS compatibility or readability",
      "example": "what you found in the resume"
    }
  ],
  "formattingProblems": [
    "formatting problem 1",
    "formatting problem 2"
  ],
  "structuralIssues": [
    "structural issue 1",
    "structural issue 2"
  ],
  "missingRecommendedSections": ["section 1", "section 2"],
  "improvementSuggestions": [
    {
      "area": "e.g., Experience, Education, Skills",
      "suggestion": "specific actionable improvement",
      "reason": "why this matters"
    }
  ],
  "overallTemplateScore": 0-100,
  "templateRecommendations": "2-3 sentence summary of how to improve the template"
}

RULES:
- Identify REAL issues only
- Check for: consistency, spacing, bullet points, dates, email format, phone format
- Look for: excessive whitespace, poor section organization, missing headers
- Check if dates are consistent in format (MM/DD/YYYY, Month Year, etc)
- Evaluate if contact info is easy for ATS to parse
- Note any unusual formatting that might confuse ATS
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.2,
    maxTokens: 2048,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

export async function comprehensiveResumeAnalysis(
  resumeText,
  jobDescription = "",
  jobRole = "",
) {
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");
  const cleanJobRole = sanitizeText(jobRole || "relevant position");

  if (!cleanResumeText) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are an expert resume analyst with deep knowledge of industry standards, job requirements, and hiring practices. Provide a COMPREHENSIVE, DETAILED analysis.

RESUME:
${cleanResumeText}

${jobRole ? `TARGET ROLE: ${cleanJobRole}` : ""}
${jobDescription ? `JOB DESCRIPTION:\n${cleanJobDescription}` : ""}

Return ONLY valid JSON (no markdown, no explanations):
{
  "overallAssessment": "detailed assessment of quality, effectiveness, and alignment",
  "professionalProfile": "analysis of career narrative and trajectory",
  "skillsAnalysis": {
    "currentSkills": ["skill1", "skill2", ...],
    "missingSkills": ["skill1", "skill2", ...],
    "skillProficiency": "assessment of expertise level"
  },
  "experienceAnalysis": "detailed feedback on experience presentation",
  "educationAnalysis": "analysis of education section",
  "keyStrengths": ["strength1", "strength2", ...],
  "areasForImprovement": ["area1", "area2", ...],
  "recommendedCoursesOrCertifications": ["course1", "course2", ...],
  "atsScore": 0-100,
  "atsOptimizationNotes": "specific suggestions to improve ATS",
  "resumeScore": 0-100,
  ${jobRole ? '"roleAlignmentAnalysis": "how well resume matches target role",' : ""}
  ${jobDescription ? '"jobMatchAnalysis": {"matchPercentage": 0-100, "keyMissingRequirements": ["req1", "req2"]},' : ""}
  "nextSteps": ["step1", "step2", ...]
}

SCORING RULES:
- ATS Score: 0-100 based entirely on formatting, keywords, structure
- Resume Score: 0-100 based on content quality, organization, effectiveness
- Use 0-40 for resumes with significant issues
- Use 40-60 for average resumes
- Use 60-80 for good resumes
- Use 80-100 for excellent resumes
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.3,
    maxTokens: 3000,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}
=======
import { buildBasicAnalysis } from "../services/resumeService.js";

// ─── Gemini Config ─────────────────────────────────────────────────────────────
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash"];
const MODELS_FROM_ENV = (process.env.GEMINI_MODELS || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const ACTIVE_MODELS = MODELS_FROM_ENV.length ? MODELS_FROM_ENV : DEFAULT_MODELS;

// ─── Groq Config ───────────────────────────────────────────────────────────────
const GROQ_API_BASE = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"];

const MAX_PROMPT_CHARS = Number(process.env.GEMINI_MAX_PROMPT_CHARS || 32000);
const MAX_ERROR_TEXT_CHARS = 800;

// ─── Gemini Helpers ────────────────────────────────────────────────────────────
function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  console.log("Gemini Key Loaded:", !!key);
  return String(key).trim();
}

function getGroqApiKey() {
  const key = process.env.GROQ_API_KEY || "";
  console.log("Groq Key Loaded:", !!key);
  return String(key).trim();
}

function getGeminiApiUrl(model) {
  return `${GEMINI_API_BASE}/${model}:generateContent?key=${getGeminiApiKey()}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeText(input) {
  return String(input || "")
    .replace(/\u0000/g, "")
    .trim();
}

function truncateForPrompt(text, maxChars = MAX_PROMPT_CHARS) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[...truncated ${text.length - maxChars} chars]`;
}

function shouldRetryStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function isPermanentQuotaError(message = "") {
  const lower = String(message).toLowerCase();
  return (
    lower.includes("quota exceeded") &&
    (lower.includes("limit: 0") ||
      lower.includes("billing") ||
      lower.includes("free_tier_requests"))
  );
}

function isRetryableError(err) {
  return err?.name === "AbortError" || err?.name === "TypeError";
}

function extractApiError(payload, fallbackText = "") {
  const message =
    payload?.error?.message || fallbackText || "Unknown API error";
  return (
    sanitizeText(message).slice(0, MAX_ERROR_TEXT_CHARS) || "Unknown API error"
  );
}

function extractCandidateText(data) {
  const candidates = data?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return "";
  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

// ─── Gemini Caller ─────────────────────────────────────────────────────────────
async function callGemini(prompt, options = {}) {
  const geminiKey = getGeminiApiKey();
  if (!geminiKey) throw new Error("GEMINI_API_KEY is not set");

  const {
    temperature = 0.2,
    maxTokens = 4096,
    timeout = 60000,
    retries = 2,
    responseMimeType,
  } = options;

  const finalPrompt = truncateForPrompt(sanitizeText(prompt));
  if (!finalPrompt) throw new Error("Prompt is required");

  let lastError;

  for (const model of ACTIVE_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      let shouldRetry = false;

      try {
        const response = await fetch(getGeminiApiUrl(model), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              ...(responseMimeType && { responseMimeType }),
            },
          }),
        });

        if (!response.ok) {
          let payload;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }
          const apiError = extractApiError(payload, response.statusText);
          const error = new Error(
            `Model ${model} failed: ${response.status} - ${apiError}`,
          );
          error.status = response.status;
          shouldRetry =
            shouldRetryStatus(response.status) &&
            !isPermanentQuotaError(apiError);
          throw error;
        }

        const data = await response.json();
        const text = extractCandidateText(data);
        if (!text) throw new Error(`Empty response from ${model}`);
        return text;
      } catch (err) {
        lastError = err;
        shouldRetry = shouldRetry || isRetryableError(err);
        const prefix = shouldRetry ? "Retryable Gemini error" : "Gemini error";
        console.warn(
          `${prefix} (${model}, attempt ${attempt + 1}/${retries + 1}): ${err.message}`,
        );
        if (!shouldRetry) break;
        if (attempt < retries) {
          await sleep(300 * 2 ** attempt + Math.floor(Math.random() * 120));
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${lastError?.message || "Unknown"}`,
  );
}

// ─── Groq Caller ───────────────────────────────────────────────────────────────
async function callGroq(prompt, options = {}) {
  const groqKey = getGroqApiKey();
  if (!groqKey) throw new Error("GROQ_API_KEY is not set");

  const { temperature = 0.2, maxTokens = 2048, timeout = 60000 } = options;

  const finalPrompt = truncateForPrompt(sanitizeText(prompt));
  if (!finalPrompt) throw new Error("Prompt is required");

  let lastError;

  for (const model of GROQ_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`Trying Groq model: ${model}`);
      const response = await fetch(GROQ_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: finalPrompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        let payload;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        const apiError = extractApiError(payload, response.statusText);
        lastError = new Error(
          `Groq model ${model} failed: ${response.status} - ${apiError}`,
        );
        console.warn(lastError.message);
        continue; // try next Groq model
      }

      const data = await response.json();

      console.log("========== RAW GROQ RESPONSE ==========");
      console.log(JSON.stringify(data, null, 2));
      console.log("=======================================");

      const text = data?.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new Error(`Empty response from Groq model ${model}`);
      }
      if (!text) throw new Error(`Empty response from Groq model ${model}`);

      console.log(`✓ Groq model ${model} succeeded`);
      return text;
    } catch (err) {
      lastError = err;
      console.warn(`Groq error (${model}): ${err.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `All Groq models failed. Last error: ${lastError?.message || "Unknown"}`,
  );
}

// ─── Smart AI Caller (Gemini → Groq fallback) ──────────────────────────────────
async function callAI(prompt, options = {}) {
  if (getGeminiApiKey()) {
    try {
      const result = await callGemini(prompt, options);
      console.log("✓ AI response from: Gemini");
      return result;
    } catch (geminiErr) {
      console.warn(`Gemini failed: ${geminiErr.message}`);
      console.log("→ Falling back to Groq...");
    }
  } else {
    console.warn("No Gemini key, skipping to Groq...");
  }

  if (getGroqApiKey()) {
    try {
      const result = await callGroq(prompt, options);
      console.log("✓ AI response from: Groq (fallback)");
      return result;
    } catch (groqErr) {
      console.warn(`Groq also failed: ${groqErr.message}`);
    }
  } else {
    console.warn(
      "No Groq key set. Add GROQ_API_KEY to .env to enable fallback.",
    );
  }

  throw new Error(
    "All AI providers failed (Gemini + Groq). Using local fallback.",
  );
}

// ─── JSON Parser ───────────────────────────────────────────────────────────────
function safeJsonParse(text) {
  const input = sanitizeText(text);
  const jsonMatch = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const withoutFences = jsonMatch ? jsonMatch[1].trim() : input.trim();

  for (const candidate of [withoutFences, input]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {}
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {}
    }
    const arrayMatch = candidate.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {}
    }
  }

  console.log("========== RAW AI RESPONSE ==========");
  console.log(input);
  console.log("====================================");

  throw new Error(
    `Invalid JSON response from AI: ${input.slice(0, MAX_ERROR_TEXT_CHARS)}`,
  );
}

// ─── Public API Functions (now use callAI instead of callGemini) ───────────────
export async function getCodeFeedback(code, language = "plain text") {
  const normalizedCode = sanitizeText(code);
  if (!normalizedCode) throw new Error("Code is required");

  const prompt = `You are a senior code reviewer.
Analyze the following ${language} code and provide: Issues, Improvements, Best practices, Performance suggestions. Keep it concise.
CODE:\n${normalizedCode}`;

  return await callAI(prompt, { temperature: 0.3, maxTokens: 1024 });
}

export async function analyzeResume(role, jobDescription = "", resumeText) {
  const cleanRole = sanitizeText(role);
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");

  if (!cleanRole || !cleanResumeText)
    throw new Error("Role and resumeText are required");

  const prompt = `You are an ATS resume analyzer. Return ONLY valid JSON.
INPUT:
ROLE: ${cleanRole}
JOB DESCRIPTION: ${cleanJobDescription}
RESUME:\n${cleanResumeText}

OUTPUT FORMAT:
{"atsScore":0,"missingKeywords":[],"addedKeywords":[],"issues":[],"suggestions":[],"optimizedResume":""}

RULES: No markdown, no explanations, no extra text, do not hallucinate fake experience`;

  const resultText = await callAI(prompt, {
    temperature: 0.2,
    maxTokens: 4096,
    responseMimeType: "application/json",
  });
  return safeJsonParse(resultText);
}

export async function getAtsTips(parsedData) {
  const prompt = `You are an expert career coach and ATS specialist.
Analyze this extracted resume data and provide exactly 3-5 actionable tips.
EXTRACTED DATA:\n${JSON.stringify(parsedData)}
Return ONLY a JSON array of strings. No markdown, no explanations.`;

  const resultText = await callAI(prompt, {
    temperature: 0.3,
    maxTokens: 512,
    responseMimeType: "application/json",
  });
  return safeJsonParse(resultText);
}

export async function generateATSResume(formData) {
  const prompt = `
Create an ATS-optimized resume.

Name: ${formData.fullName}
Target Role: ${formData.targetRole}
Skills: ${formData.skills}
certifications: formData.certifications || "",
Experience: ${formData.experience}
Education: ${formData.education}
Projects: ${formData.projects}

Return ONLY valid JSON:

{
  "professionalSummary": "",
  "skills": "",
  "experience": "",
  "projects": "",
  "education": ""
}

Rules:
- No markdown
- No explanations
- No code blocks
- ATS optimized
- Professional language
- Improve content but do not invent fake experience.
`;

  const resultText = await callAI(prompt, {
    temperature: 0.4,
    maxTokens: 2048,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

// ─── Local fallback ────────────────────────────────────────────────────────────
function buildLocalFixResume(resumeText, jobDescription = "", role = "") {
  const basic = buildBasicAnalysis(resumeText, role, jobDescription);
  const improvementBlock = basic.improvements
    .map(
      (item, i) =>
        `${i + 1}. ${typeof item === "string" ? item : item.suggestedFix || item.issue || "Resume improvement applied"}`,
    )
    .join("\n");

  return {
    improvedResume: `${resumeText.trim()}\n\n--- Recommended improvements ---\n${improvementBlock}`,
    atsScoreBefore: Math.max(35, (basic.atsScore || 70) - 12),
    atsScoreAfter: basic.atsScore || 70,
    improvements: basic.improvements.map((item) =>
      typeof item === "string"
        ? item
        : item.suggestedFix || item.issue || "Resume improvement applied",
    ),
    keywordsAdded: (basic.missingKeywords || []).slice(0, 8),
    strengths: [
      "Strong technical skills",
      "Relevant projects",
      "Good ATS formatting",
      "Clear resume structure",
    ],
    redFlags: [
      "Missing quantified achievements",
      "Keyword gaps detected",
      "Limited professional experience",
      "Weak impact metrics",
    ],
    missingKeywords: basic.missingKeywords || [],
    recruiterImpression: {
      impression: "Needs improvement",
      photoRisk: "Low",
      sections: "Average",
      asset: "Projects",
    },
    overview: {
      overall_ats_score: basic.atsScore || 70,
      pass_probability: 60,
      top10_match_percent: 55,
      internship_count: 1,
      total_experience_months: 6,
    },
    sectionScores: {
      keywords_score: 65,
      experience_depth_score: 55,
      formatting_score: 80,
      skills_relevance_score: 70,
      education_score: 75,
      quantified_achievements_score: 50,
    },
    radarData: [
      { subject: "Experience", candidate: 55, top10: 85 },
      { subject: "Skills", candidate: 70, top10: 90 },
      { subject: "Achievements", candidate: 50, top10: 88 },
      { subject: "Keywords", candidate: 65, top10: 92 },
      { subject: "Education", candidate: 75, top10: 80 },
    ],
    blockers: [
      "Limited quantified achievements",
      "Missing high-value ATS keywords",
      "Experience section lacks impact metrics",
      "Projects need stronger descriptions",
      "Professional summary can be improved",
    ],
    verdict: {
      status: "Would not shortlist",
      reason:
        "Candidate shows potential but requires stronger evidence of measurable impact, better keyword alignment, and more achievement-focused experience.",
    },
    deepAnalysis: {
      candidateName: "",
      atsScore: basic.atsScore || 70,
      atsProbability: 60,
      sectionScores: {
        keywords: 65,
        formatting: 80,
        experience: 55,
        skills: 70,
        education: 75,
        achievements: 50,
        readability: 65,
      },
      firstImpression: {
        immediateImpression: "Needs improvement",
        immediateColor: "amber",
        photoRisk: "Low risk",
        photoColor: "green",
        sections: "Average",
        sectionsColor: "amber",
        biggestAsset: "Education",
        assetColor: "green",
      },
      strengths: [
        "Strong technical skills",
        "Relevant academic projects",
        "Good ATS-friendly formatting",
      ],
      redFlags: [
        {
          text: "No quantified achievements anywhere in the resume",
          severity: "red",
        },
        {
          text: "Missing high-value ATS keywords for the target role",
          severity: "red",
        },
        {
          text: "Experience section lacks measurable impact",
          severity: "amber",
        },
        { text: "Professional summary is too generic", severity: "amber" },
      ],
      missingKeywords: {
        critical: (basic.missingKeywords || []).slice(0, 6),
        important: (basic.missingKeywords || []).slice(6, 12),
      },
      competitiveness: {
        internship: { you: 20, top: 85 },
        quantifiedImpact: { you: 10, top: 80 },
        keywords: { you: 45, top: 85 },
        technicalTools: { you: 35, top: 75 },
        certifications: { you: 30, top: 70 },
      },
      interviewChance: "10-20%",
      interviewChanceColor: "red",
      top10Changes: [
        {
          number: 1,
          text: "Add quantified achievements to every bullet point",
        },
        {
          number: 2,
          text: "Include missing high-value keywords from the job description",
        },
        {
          number: 3,
          text: "Rewrite the professional summary to be role-specific",
        },
        {
          number: 4,
          text: "Add measurable impact metrics to experience section",
        },
        {
          number: 5,
          text: "Strengthen project descriptions with outcomes and results",
        },
        {
          number: 6,
          text: "Remove generic soft-skill buzzwords without evidence",
        },
        {
          number: 7,
          text: "Use consistent date formatting throughout the resume",
        },
        {
          number: 8,
          text: "Add a dedicated skills section with role-relevant tools",
        },
        {
          number: 9,
          text: "Get an internship or freelance project to fill experience gap",
        },
        {
          number: 10,
          text: "Add relevant certifications from Coursera or LinkedIn Learning",
        },
      ],
      rewrites: [
        {
          title: "Profile Summary",
          oldText: "Seeking an entry level opportunity to apply my skills.",
          newText:
            "Results-driven candidate with strong technical skills and project experience seeking to contribute to innovative teams.",
        },
        {
          title: "Project Bullet Point",
          oldText: "Worked on various projects and helped the team.",
          newText:
            "Delivered 3 cross-functional projects on time, improving workflow efficiency by 20%.",
        },
        {
          title: "Extra-Curricular Activity",
          oldText: "Participated in college events.",
          newText:
            "Coordinated 5 college events involving 300+ participants and managed event logistics.",
        },
      ],
      finalVerdict: {
        wouldShortlist: false,
        reason:
          "The resume shows potential but lacks the quantified achievements and keyword optimization needed to compete effectively. With focused improvements to the experience section and keyword alignment, interview chances would improve significantly.",
        biggestBlocker:
          "Zero quantified achievements — no single metric or outcome anywhere in the resume.",
        goodNews:
          "The core structure is solid and the qualifications are relevant. These are fixable issues that can be addressed in 1-2 weeks of focused effort.",
      },
    },
    _source: "local",
  };
}

// ─── Call 1: Main resume fix ───────────────────────────────────────────────────
async function callFixResume(resumeText, jobDescription, role) {
  const prompt = `You are an ATS resume optimizer. Return ONLY valid JSON. No markdown. No explanation.

ROLE: ${role}
JD: ${jobDescription}
RESUME: ${resumeText}


JSON:
{
  "improvedResume":"",
  "atsScoreBefore":0,
  "atsScoreAfter":0,
  "improvements":["i1","i2","i3"],
  "keywordsAdded":["k1","k2"],
  "strengths":["s1","s2","s3","s4"],
  "redFlags":["r1","r2","r3","r4"],
  "missingKeywords":["k1","k2","k3","k4","k5"],

  "certification_analysis":{
    "target_role":"",
    "current_certifications":[],
    "missing_certifications":[
      {
        "name":"",
        "priority":"High",
        "reason":"",
        "estimated_ats_boost":0,
        "difficulty":"Beginner",
        "duration":"",
        "provider":""
      }
    ],
    "certification_score":0,
    "industry_standard_score":0,
    "recommendations":[],
    "learning_path":[]
  },

  "recruiterImpression":{
    "impression":"",
    "photoRisk":"Low",
    "sections":"Average",
    "asset":""
  },

  "overview":{
    "overall_ats_score":0,
    "pass_probability":0,
    "top10_match_percent":0,
    "internship_count":0,
    "total_experience_months":0
  },

  "sectionScores":{
    "keywords_score":0,
    "experience_depth_score":0,
    "formatting_score":0,
    "skills_relevance_score":0,
    "education_score":0,
    "quantified_achievements_score":0
  },

  "radarData":[
    {
      "subject":"Experience",
      "candidate":0,
      "top10":85
    }
  ],

  "blockers":null,
  "verdict":{
    "status":"Would not shortlist",
    "reason":""
  }
}

RULES:

- verdict.status must be "Would shortlist" OR "Would not shortlist"
- photoRisk must be Low, Medium, or High
- sections must be Excellent, Good, Average, or Poor
- Do not invent fake experience, internships, jobs, certifications, achievements, or projects
- All recommendations must be based on resume content and target role

CERTIFICATION ANALYSIS RULES:

1. Detect certifications already present in the resume.
2. Do not recommend certifications already owned by the candidate.
3. Recommend only certifications relevant to the target role and job description.
4. Prioritize certifications by current hiring demand and ATS value.
5. Assign estimated_ats_boost between 1-10.
6. Assign priority as High, Medium, or Low.
7. Assign difficulty as Beginner, Intermediate, or Advanced.
8. Include estimated completion duration.
9. Include certification provider.
10. Generate certification_score (0-100).
11. Generate industry_standard_score (0-100).
12. Generate 2-5 certification recommendations.
13. Generate practical learning_path in chronological order.
14. Avoid duplicate certification recommendations.
15. Explain why each certification is valuable for this specific candidate.
16. If the candidate already meets industry standards, return an empty missing_certifications array.
17. Return certification_analysis object exactly matching the requested JSON schema.`;

  return callAI(prompt, {
    temperature: 0.4,
    maxTokens: 4096,
    timeout: 120000,
    responseMimeType: "application/json",
  });
}

// ─── Call 2: Deep analysis ─────────────────────────────────────────────────────
async function callDeepAnalysis(resumeText, jobDescription, role) {
  const prompt = `You are a senior ATS specialist. Return ONLY valid JSON. No markdown. No explanation.

ROLE: ${role}
JD: ${jobDescription}
RESUME: ${resumeText}

JSON:
{"candidateName":"","atsScore":0,"atsProbability":0,"sectionScores":{"keywords":0,"formatting":0,"experience":0,"skills":0,"education":0,"achievements":0,"readability":0},"firstImpression":{"immediateImpression":"","immediateColor":"red","photoRisk":"","photoColor":"green","sections":"","sectionsColor":"amber","biggestAsset":"","assetColor":"green"},"strengths":["s1","s2","s3"],"redFlags":[{"text":"r1","severity":"red"},{"text":"r2","severity":"amber"},{"text":"r3","severity":"red"}],"missingKeywords":{"critical":["k1","k2","k3","k4","k5"],"important":["k1","k2","k3"]},"competitiveness":{"internship":{"you":0,"top":85},"quantifiedImpact":{"you":0,"top":80},"keywords":{"you":0,"top":85},"technicalTools":{"you":0,"top":75},"certifications":{"you":0,"top":70}},"interviewChance":"10-20%","interviewChanceColor":"red","top10Changes":[{"number":1,"text":""},{"number":2,"text":""},{"number":3,"text":""},{"number":4,"text":""},{"number":5,"text":""},{"number":6,"text":""},{"number":7,"text":""},{"number":8,"text":""},{"number":9,"text":""},{"number":10,"text":""}],"rewrites":[{"title":"Profile Summary","oldText":"actual sentence from resume summary","newText":"improved ATS-optimized version"},{"title":"Project Description","oldText":"actual sentence from resume project","newText":"improved quantified version"},{"title":"Skills / Experience","oldText":"actual sentence from resume skills or experience","newText":"improved impact-focused version"}],"finalVerdict":{"wouldShortlist":false,"reason":"","biggestBlocker":"","goodNews":""}}

RULES:
- candidateName: extract from resume
- all scores 0-100
- firstImpression colors: "red" "amber" "green" only
- interviewChanceColor: "red"<20% "amber"20-50% "green">50%
- strengths/redFlags: SPECIFIC to this resume not generic
- top10Changes: all 10 items with real specific text
- rewrites oldText: copy ACTUAL sentences from the resume above, not placeholders
- rewrites newText: improved version of that same sentence
- finalVerdict.wouldShortlist: true or false`;

  return callAI(prompt, {
    temperature: 0.4,
    maxTokens: 4096,
    timeout: 120000,
    responseMimeType: "application/json",
  });
}

// ─── Main export: 2 parallel calls ────────────────────────────────────────────
export async function fixResumeWithAI(
  resumeText,
  jobDescription = "",
  role = "",
) {
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");
  const cleanRole = sanitizeText(role || "desired position not specified");

  if (!cleanResumeText) throw new Error("Resume text is required");

  const truncatedResume = cleanResumeText.slice(0, 6000);

  console.log("Starting 2-call parallel fix...");

  const [mainRes, deepRes] = await Promise.allSettled([
    callFixResume(truncatedResume, cleanJobDescription, cleanRole),
    callDeepAnalysis(truncatedResume, cleanJobDescription, cleanRole),
  ]);

  let mainResult = null;
  let deepResult = null;

  if (mainRes.status === "fulfilled") {
    try {
      mainResult = safeJsonParse(mainRes.value);
      console.log(
        "CERTIFICATION ANALYSIS:",
        JSON.stringify(mainResult.certification_analysis, null, 2),
      );
      console.log("✓ Main fix call: success");
    } catch (e) {
      console.warn("✗ Main fix parse failed:", e.message);
    }
  } else {
    console.warn("✗ Main fix call failed:", mainRes.reason?.message);
  }

  if (deepRes.status === "fulfilled") {
    try {
      deepResult = safeJsonParse(deepRes.value);
      console.log("✓ Deep analysis call: success");
    } catch (e) {
      console.warn("✗ Deep analysis parse failed:", e.message);
    }
  } else {
    console.warn("✗ Deep analysis call failed:", deepRes.reason?.message);
  }

  // Both failed → full local fallback
  if (!mainResult && !deepResult) {
    console.warn("Both calls failed — using local fallback");
    return buildLocalFixResume(cleanResumeText, cleanJobDescription, cleanRole);
  }

  // Main failed but deep succeeded → merge deep into fallback
  if (!mainResult) {
    console.warn("Main failed — using fallback + deep analysis");
    const fallback = buildLocalFixResume(
      cleanResumeText,
      cleanJobDescription,
      cleanRole,
    );
    return { ...fallback, deepAnalysis: deepResult };
  }

  // Main succeeded — attach deepAnalysis (real or fallback)
  const fallback = buildLocalFixResume(
    cleanResumeText,
    cleanJobDescription,
    cleanRole,
  );
  return {
    ...mainResult,

    certification_analysis: mainResult.certification_analysis || {
      target_role: cleanRole,
      current_certifications: [],
      missing_certifications: [],
      certification_score: 0,
      industry_standard_score: 0,
      recommendations: [],
      learning_path: [],
    },

    deepAnalysis: deepResult || fallback.deepAnalysis,
  };
}

export async function analyzeTemplateIssues(resumeText) {
  const cleanResumeText = sanitizeText(resumeText);
  if (!cleanResumeText) throw new Error("Resume text is required");

  const prompt = `You are an expert resume formatter and ATS specialist.
Analyze this resume for template, formatting, and structural issues. Return ONLY valid JSON.

RESUME:\n${cleanResumeText}

Return ONLY valid JSON:
{
  "templateIssues": [{"issue":"","severity":"critical|high|medium|low","impact":"","example":""}],
  "formattingProblems": ["problem1"],
  "structuralIssues": ["issue1"],
  "missingRecommendedSections": ["section1"],
  "improvementSuggestions": [{"area":"","suggestion":"","reason":""}],
  "overallTemplateScore": 0,
  "templateRecommendations": "2-3 sentence summary"
}

RULES: Identify REAL issues only. Check consistency, spacing, dates, email, phone format.`;

  const resultText = await callAI(prompt, {
    temperature: 0.2,
    maxTokens: 2048,
    responseMimeType: "application/json",
  });
  return safeJsonParse(resultText);
}

export async function comprehensiveResumeAnalysis(
  resumeText,
  jobDescription = "",
  jobRole = "",
) {
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");
  const cleanJobRole = sanitizeText(jobRole || "relevant position");

  if (!cleanResumeText) throw new Error("Resume text is required");

  const prompt = `You are an expert resume analyst. Return ONLY valid JSON, no markdown.

RESUME:\n${cleanResumeText}
${jobRole ? `TARGET ROLE: ${cleanJobRole}` : ""}
${jobDescription ? `JOB DESCRIPTION:\n${cleanJobDescription}` : ""}

Return ONLY valid JSON:
{
  "overallAssessment": "detailed assessment",
  "professionalProfile": "career narrative analysis",
  "skillsAnalysis": {"currentSkills":["s1"],"missingSkills":["s1"],"skillProficiency":"assessment"},
  "experienceAnalysis": "experience feedback",
  "educationAnalysis": "education analysis",
  "keyStrengths": ["strength1"],
  "areasForImprovement": ["area1"],
  "recommendedCoursesOrCertifications": ["course1"],
  "atsScore": 0,
  "atsOptimizationNotes": "suggestions",
  "resumeScore": 0,
  ${jobRole ? '"roleAlignmentAnalysis": "alignment analysis",' : ""}
  ${jobDescription ? '"jobMatchAnalysis": {"matchPercentage": 0, "keyMissingRequirements": ["req1"]},' : ""}
  "nextSteps": ["step1"]
}

SCORING: 0-40 significant issues, 40-60 average, 60-80 good, 80-100 excellent`;

  const resultText = await callAI(prompt, {
    temperature: 0.3,
    maxTokens: 3000,
    responseMimeType: "application/json",
  });
  return safeJsonParse(resultText);
}
>>>>>>> server/utils/gemini.js.remote.tmp
