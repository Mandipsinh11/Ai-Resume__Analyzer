/**
 * Validates whether the parsed resume text contains key indicators of a professional resume.
 * 
 * @param {string} text - The raw text of the document.
 * @returns {boolean} - True if it looks like a resume, false otherwise.
 */
export function isResumeText(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  
  // Check for email or phone number patterns
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{8,}\d)/.test(text);
  
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
  
  // A professional resume MUST contain:
  // 1. Either an email address or a phone number
  // 2. At least 5 unique resume keywords
  // 3. Minimum length of 150 characters
  return (hasEmail || hasPhone) && matchCount >= 5 && text.trim().length >= 150;
}
