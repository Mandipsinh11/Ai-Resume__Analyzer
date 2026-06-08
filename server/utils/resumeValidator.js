/**
 * Validates whether the parsed resume text contains key indicators of a professional resume.
 * 
 * @param {string} text - The raw text of the document.
 * @returns {boolean} - True if it looks like a resume, false otherwise.
 */
export function isResumeText(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  
  // List of keywords commonly found in resumes
  const resumeKeywords = [
    "experience",
    "education",
    "skills",
    "projects",
    "employment",
    "work",
    "history",
    "summary",
    "objective",
    "profile",
    "career",
    "university",
    "college",
    "school",
    "certification",
    "languages",
    "interests",
    "achievements",
    "qualification",
    "phone",
    "email",
    "contact"
  ];
  
  // Count how many of these keywords appear in the text
  let matchCount = 0;
  for (const keyword of resumeKeywords) {
    if (lower.includes(keyword)) {
      matchCount++;
    }
  }
  
  // A typical resume should contain at least 4 of these indicators
  // and be at least 150 characters long
  return matchCount >= 4 && text.trim().length >= 150;
}
