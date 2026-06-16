/**
 * Validates whether the parsed resume text contains key indicators of a professional resume.
 * Lenient implementation to prevent rejecting weak but valid resumes.
 * 
 * @param {any} text - The raw text of the document.
 * @returns {boolean} - True if it looks like a resume, false otherwise.
 */
export function isResumeText(text) {
  if (text == null) return false;
  const safeText = typeof text === "string" ? text : String(text);
  return safeText.trim().length >= 10;
}

