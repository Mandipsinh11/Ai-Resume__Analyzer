import { normalize } from "./resumeParser.js";

const TECH_KEYWORDS = [
  "python", "javascript", "typescript", "react", "node.js", "nodejs", "express", "django", "flask", "fastapi",
  "angular", "vue", "next.js", "sql", "postgresql", "mysql", "mongodb", "redis", "graphql", "aws", "gcp",
  "azure", "docker", "kubernetes", "git", "ci/cd", "jenkins", "terraform", "c++", "java", "spring", "go",
  "rust", "html", "css", "tailwind", "machine learning", "nlp", "tensorflow", "pytorch"
];

const CERT_KEYWORDS = [
  "aws certified", "cloud practitioner", "solutions architect", "pmp", "csm", "scrum master",
  "comptia", "cissp", "ccna", "gcp certified", "azure certified", "itil", "salesforce"
];

/**
 * Performs a deterministic gap analysis between a structured resume and job description.
 *
 * @param {object} structuredResume - Canonical structured resume.
 * @param {string} jobDescription - Raw Job Description text.
 * @param {string} targetRole - Job role name.
 * @returns {object} { missingKeywords, missingTechnologies, missingSkills, missingCertifications, weakSections }
 */
export function analyzeGaps(structuredResume, jobDescription = "", targetRole = "") {
  const jdText = (jobDescription + " " + targetRole).toLowerCase();
  const resumeText = JSON.stringify(structuredResume).toLowerCase();

  const missingKeywords = [];
  const missingTechnologies = [];
  const missingSkills = [];
  const missingCertifications = [];
  const weakSections = [];

  // 1. Extract potential keywords from JD using word frequency & length bounds (excluding common stop words)
  const STOP_WORDS = new Set(["about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves", "experience", "role", "requirements", "responsibilities", "qualifications", "skills", "ability"]);

  const jdTokens = jdText.split(/\W+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const uniqueJdTokens = [...new Set(jdTokens)];

  for (const token of uniqueJdTokens) {
    if (!resumeText.includes(token)) {
      missingKeywords.push(token);
    }
  }

  // 2. Identify missing technologies
  for (const tech of TECH_KEYWORDS) {
    if (jdText.includes(tech) && !resumeText.includes(tech)) {
      missingTechnologies.push(tech.charAt(0).toUpperCase() + tech.slice(1));
      missingSkills.push(tech.charAt(0).toUpperCase() + tech.slice(1)); // Add tech to general skills gaps
    }
  }

  // 3. Identify missing certifications
  for (const cert of CERT_KEYWORDS) {
    if (jdText.includes(cert) && !resumeText.includes(cert)) {
      missingCertifications.push(cert.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
    }
  }

  // 4. Identify weak sections in structured resume
  const summary = normalize(structuredResume.summary);
  const education = Array.isArray(structuredResume.education) ? structuredResume.education : [];
  const experience = Array.isArray(structuredResume.experience) ? structuredResume.experience : [];
  const projects = Array.isArray(structuredResume.projects) ? structuredResume.projects : [];
  const skills = Array.isArray(structuredResume.skills) ? structuredResume.skills : [];

  if (!summary || summary.trim().length < 15) {
    weakSections.push({
      section: "Summary",
      issue: "Summary section is missing or extremely brief.",
      impact: "Recruiters and ATS parsers scan the summary first to match the target job title."
    });
  }

  if (experience.length === 0) {
    weakSections.push({
      section: "Experience",
      issue: "No work experience parsed.",
      impact: "Work Experience is the heaviest weighted component of an ATS score (35% impact)."
    });
  } else {
    // Check if highlights contain action verbs
    let actionVerbCount = 0;
    const actionVerbs = ["developed", "built", "designed", "implemented", "spearheaded", "optimized"];
    for (const exp of experience) {
      const text = (exp.highlights || []).join(" ").toLowerCase();
      for (const verb of actionVerbs) {
        if (text.includes(verb)) actionVerbCount++;
      }
    }
    if (actionVerbCount === 0) {
      weakSections.push({
        section: "Experience",
        issue: "Experience bullet points lack strong action verbs.",
        impact: "ATS filters rate candidates higher when they start bullets with action verbs instead of passive phrases."
      });
    }
  }

  if (skills.length < 5) {
    weakSections.push({
      section: "Skills",
      issue: "Fewer than 5 skills listed.",
      impact: "ATS searches prioritize resumes containing a density of target skill match keywords."
    });
  }

  if (projects.length === 0) {
    weakSections.push({
      section: "Projects",
      issue: "No personal or academic projects listed.",
      impact: "Projects demonstrate applied knowledge when professional work experience is limited."
    });
  }

  if (education.length === 0) {
    weakSections.push({
      section: "Education",
      issue: "Missing education credentials.",
      impact: "Essential qualification checks fail if graduation records cannot be located."
    });
  }

  // Sort missing keywords and missing skills by impact (e.g. matching technologies first)
  const sortedMissingKeywords = missingKeywords.slice(0, 15);

  return {
    missingKeywords: sortedMissingKeywords,
    missingTechnologies: missingTechnologies.slice(0, 8),
    missingSkills: missingSkills.slice(0, 8),
    missingCertifications: missingCertifications.slice(0, 4),
    weakSections
  };
}
