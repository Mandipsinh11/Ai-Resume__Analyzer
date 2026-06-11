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
certifications: ${formData.certifications || ""}
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
  const cleanRole = role ? role.trim() : "Software Engineer";

  // Parse lines to extract sections
  const lines = resumeText.split("\n");
  const parsedSectionsMap = {};
  let currentSectionName = "Header & Contact Info";
  let currentSectionLines = [];

  const sectionPatterns = [
    { name: "Professional Summary", regex: /^(summary|professional summary|profile|objective|career objective|about me)$/i },
    { name: "Work Experience", regex: /^(experience|work experience|employment history|professional experience|work history|career history|employment)$/i },
    { name: "Skills", regex: /^(skills|technical skills|core competencies|areas of expertise|technologies|skills & expertise|key skills|tools)$/i },
    { name: "Education", regex: /^(education|academic profile|academic history|academic qualifications|education & credentials|credentials)$/i },
    { name: "Projects", regex: /^(projects|personal projects|key projects|technical projects|academic projects)$/i },
    { name: "Certifications", regex: /^(certifications|licenses|certifications & licenses|courses|professional development|awards|achievements)$/i },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line matches a section header pattern
    let foundHeader = null;
    if (trimmed.length < 50) {
      const cleanLine = trimmed.replace(/[:\-\s•*#]+$/, "").replace(/^[:\-\s•*#]+/, "").trim();
      for (const pattern of sectionPatterns) {
        if (pattern.regex.test(cleanLine)) {
          foundHeader = pattern.name;
          break;
        }
      }
    }

    if (foundHeader) {
      if (currentSectionLines.length > 0 || currentSectionName !== "Header & Contact Info") {
        parsedSectionsMap[currentSectionName] = currentSectionLines.join("\n").trim();
      }
      currentSectionName = foundHeader;
      currentSectionLines = [];
    } else {
      currentSectionLines.push(line);
    }
  }

  if (currentSectionLines.length > 0 || currentSectionName !== "Header & Contact Info") {
    parsedSectionsMap[currentSectionName] = currentSectionLines.join("\n").trim();
  }

  // Define the standard set of sections we want to generate recommendations for
  const allSectionNames = [
    "Header & Contact Info",
    "Professional Summary",
    "Work Experience",
    "Skills",
    "Education",
    "Projects",
    "Certifications"
  ];

  const sectionsList = [];

  for (const secName of allSectionNames) {
    const originalText = parsedSectionsMap[secName];
    const isMissing = !originalText;

    let sectionData = {
      name: secName,
      scoreBefore: isMissing ? 0 : 55,
      scoreAfter: 95,
      status: "needs_work",
      issues: [],
      originalText: originalText || `[This section is missing from your resume]`,
      optimizedText: "",
      explanation: ""
    };

    if (secName === "Header & Contact Info") {
      const text = originalText || resumeText.split("\n").slice(0, 3).join("\n") || "Name & contact info";
      sectionData.originalText = text;
      const hasLinkedIn = /linkedin\.com/i.test(text);
      const hasGitHub = /github\.com/i.test(text);
      
      if (hasLinkedIn && hasGitHub) {
        sectionData.scoreBefore = 85;
        sectionData.scoreAfter = 96;
        sectionData.status = "good";
        sectionData.issues = ["Ensure your portfolio link anchors are clickable and point to active repositories."];
        sectionData.optimizedText = text;
        sectionData.explanation = "Verified professional URLs. Keeping clean visual alignments for standard ATS parsing.";
      } else {
        sectionData.scoreBefore = 60;
        sectionData.scoreAfter = 95;
        sectionData.issues = ["Missing links to professional portfolios (like GitHub or LinkedIn)."];
        sectionData.optimizedText = `${text}\nLinkedIn: linkedin.com/in/candidate | GitHub: github.com/candidate`;
        sectionData.explanation = "Added professional placeholder links. Major ATS systems screen for online profiles (GitHub/LinkedIn) to verify project claims.";
      }
    }

    else if (secName === "Professional Summary") {
      if (isMissing) {
        sectionData.issues = [`Missing professional summary matching target role: ${cleanRole}.`];
        sectionData.optimizedText = `Results-oriented professional aiming to excel as a ${cleanRole}. Proficient in core concepts, troubleshooting, and collaborative development. Eager to align skills with team goals to deliver optimized solutions.`;
        sectionData.explanation = "Added role-specific professional summary to give parsers immediate alignment context.";
      } else {
        sectionData.scoreBefore = 45;
        sectionData.scoreAfter = 96;
        sectionData.issues = [
          "Summary lacks clear keyword correlation with the target role.",
          "Does not state key technical competencies."
        ];
        sectionData.optimizedText = `Results-oriented professional aiming to transition into a ${cleanRole} role. Proficient in core technologies highlighted in the JD, with a focus on problem-solving, quality delivery, and collaborative performance.`;
        sectionData.explanation = "Rewrote summary to map directly to the target role requirements and core technologies.";
      }
    }

    else if (secName === "Work Experience") {
      if (isMissing) {
        sectionData.issues = ["Missing critical Work Experience section."];
        sectionData.optimizedText = `Work Experience\n• ${cleanRole} (Freelance / Personal projects)\n  - Led end-to-end development of 3 web platforms, optimizing task pipelines and resolving 15+ high-priority bugs.\n  - Collaborated with remote partners using Agile/Scrum workflow, improving sprint velocity by 12%.\n  - Configured project servers, utilizing Git version control and modern build setups.`;
        sectionData.explanation = "Added work experience draft highlighting projects/freelance role context to satisfy minimal ATS parser experience filters.";
      } else {
        sectionData.scoreBefore = 35;
        sectionData.scoreAfter = 96;
        sectionData.issues = [
          "Bullets lack quantified achievements and action verbs.",
          "Missing job description keyword integration."
        ];
        
        const bullets = originalText.split(/\n/g).map(b => b.trim().replace(/^•\s*|^\-\s*/, "")).filter(Boolean);
        if (bullets.length > 0) {
          sectionData.optimizedText = bullets.map((bullet, idx) => {
            if (idx === 0) return `• Spearheaded engineering lifecycle for target ${cleanRole} features, improving runtime performance by 18%.`;
            if (idx === 1) return `• Optimized system performance, reducing latencies and resolving 10+ blocker issues.`;
            return `• Collaborated within Agile squad to deliver production updates, boosting user engagement metrics by 15%.`;
          }).join("\n");
        } else {
          sectionData.optimizedText = `• Executed 4 key project sprints on schedule, optimizing task pipelines and resolving 15+ high-priority blockers.\n• Collaborated within a cross-functional squad using Agile/Scrum, boosting velocity by 12%.\n• Leveraged core project technologies to build scalable system features.`;
        }
        sectionData.explanation = "Optimized experience correlation. Replaced passive statements with action-driven outcomes and quantified impact metrics (18% performance, 10+ blockers, 15% user metrics).";
      }
    }

    else if (secName === "Skills") {
      const addedSkills = (basic.missingKeywords || []).slice(0, 6).join(", ") || "Technical stack, Git, Docker";
      if (isMissing) {
        sectionData.issues = ["Missing a dedicated skills list."];
        sectionData.optimizedText = `Technical Skills\n• Languages: JavaScript, Python, HTML5, CSS3\n• Tools & Frameworks: ${addedSkills}, Node.js, Agile/Scrum`;
        sectionData.explanation = "Added categorized skills section to build high keyword density matching.";
      } else {
        sectionData.scoreBefore = 50;
        sectionData.scoreAfter = 96;
        sectionData.issues = [
          "Skills section lacks structured categorization.",
          "Missing critical technical competencies."
        ];
        sectionData.optimizedText = `• Core Technologies: ${addedSkills}\n• Methodologies & Tools: Git, Docker, Agile/Scrum, Software Development Life Cycle (SDLC)`;
        sectionData.explanation = "Grouped skills into parsable blocks (Core Technologies, Methodologies) to increase keyword density score for the ATS filter.";
      }
    }

    else if (secName === "Education") {
      if (isMissing) {
        sectionData.issues = ["Education section is missing."];
        sectionData.optimizedText = `Education & Academic Path\n• Bachelor of Science in relevant field / Technical Coursework\n• Continuous learning in target domain methodologies`;
        sectionData.explanation = "Added education draft block to fill essential structural section requirements.";
      } else {
        sectionData.scoreBefore = 80;
        sectionData.scoreAfter = 95;
        sectionData.status = "good";
        sectionData.issues = ["Could strengthen section by explicitly highlighting coursework relevant to target role."];
        sectionData.optimizedText = `${originalText}\n• Relevant Academic Path: Continuous learning in target domain methodologies & algorithms`;
        sectionData.explanation = "Formatted education headers clearly for standard parser extraction.";
      }
    }

    else if (secName === "Projects") {
      if (isMissing) {
        sectionData.issues = ["Missing Projects section completely."];
        sectionData.optimizedText = `Projects\n• Technical Portfolio Application\n  - Built and deployed a web app using HTML, CSS, JavaScript, improving user engagement by 25%.\n  - Optimized client-side search query logic, reducing lookup latency by 40%.\n  - Tracked version configurations using Git and deployed cloud-based assets.`;
        sectionData.explanation = "Projects verify active skill-in-context capabilities. Added a placeholder project framework.";
      } else {
        sectionData.scoreBefore = 40;
        sectionData.scoreAfter = 96;
        sectionData.issues = ["Project bullets lack explicit stack tagging and measurable outcomes."];
        sectionData.optimizedText = `• Technical Project Portfolio\n  - Built responsive frontend utilizing HTML, CSS, and modern scripting, enhancing visual load times by 20%.\n  - Engineered robust backend routing patterns, ensuring secure and fast client-server handshake.`;
        sectionData.explanation = "Added stack labels and performance indicators to projects to elevate credentials verification score.";
      }
    }

    else if (secName === "Certifications") {
      if (isMissing) {
        sectionData.issues = ["No relevant certifications found."];
        sectionData.optimizedText = `Certifications & Professional Development\n• AWS Certified Cloud Practitioner / relevant domain certificates\n• Professional Certificate in Tech Methodologies`;
        sectionData.explanation = "Adding certifications satisfies search refinement filter criteria often applied by human recruiters.";
      } else {
        sectionData.scoreBefore = 75;
        sectionData.scoreAfter = 95;
        sectionData.status = "good";
        sectionData.issues = ["Highlight professional credentials related to the job description."];
        sectionData.optimizedText = `${originalText}\n• Continuous Professional Development: Certification in target role technologies`;
        sectionData.explanation = "Cleaned up and listed certifications with emphasis on modern domain keywords.";
      }
    }

    sectionsList.push(sectionData);
  }

  // Also include any other custom sections the user has in their resume, so we don't lose them!
  for (const customName in parsedSectionsMap) {
    if (!allSectionNames.includes(customName)) {
      sectionsList.push({
        name: customName,
        scoreBefore: 70,
        scoreAfter: 95,
        status: "good",
        issues: ["Verify section alignment to job role keywords."],
        originalText: parsedSectionsMap[customName],
        optimizedText: parsedSectionsMap[customName],
        explanation: "Maintained original custom section and formatted alignment details."
      });
    }
  }

  const scoreBefore = Math.min(84, Math.max(35, (basic.atsScore || 70) - 8));
  const fallbackSections = sectionsList;

  return {
    atsScoreBefore: scoreBefore,
    atsScoreAfter: 96,
    keywordsAdded: (basic.missingKeywords || []).slice(0, 8),
    sections: fallbackSections,
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
