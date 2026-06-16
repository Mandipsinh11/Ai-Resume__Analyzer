import { normalize, safeTrim } from "./resumeParser.js";

/**
 * Deterministically scores a structured resume JSON against optional job description keywords.
 * Returns calibrated overall and category-specific scores.
 *
 * Overall score ranges:
 * 0-20 = unusable (Terrible resume, e.g. "Need job.")
 * 20-40 = poor (e.g. Student resume with only education)
 * 40-60 = average
 * 60-80 = strong (Good resume)
 * 80-95 = excellent (Excellent resume)
 *
 * @param {object} structuredResume - The Structured Resume JSON.
 * @param {string[]} jdKeywords - Clean list of target keywords from the job description.
 * @returns {object} { overallScore, categoryScores, explanation }
 */
export function scoreResume(structuredResume, jdKeywords = []) {
  if (!structuredResume || typeof structuredResume !== "object") {
    return {
      overallScore: 0,
      categoryScores: {},
      explanation: "Invalid or missing resume data."
    };
  }

  const categoryScores = {
    contactCompleteness: 0,
    formatting: 10,
    keywordMatch: 0,
    projects: 0,
    experience: 0,
    skills: 0,
    education: 0,
    achievements: 0,
    readability: 0
  };

  const header = structuredResume.header || {};
  const summary = normalize(structuredResume.summary);
  const education = Array.isArray(structuredResume.education) ? structuredResume.education : [];
  const experience = Array.isArray(structuredResume.experience) ? structuredResume.experience : [];
  const projects = Array.isArray(structuredResume.projects) ? structuredResume.projects : [];
  const skills = Array.isArray(structuredResume.skills) ? structuredResume.skills : [];
  const certifications = Array.isArray(structuredResume.certifications) ? structuredResume.certifications : [];
  const achievements = Array.isArray(structuredResume.achievements) ? structuredResume.achievements : [];
  const languages = Array.isArray(structuredResume.languages) ? structuredResume.languages : [];
  const hobbies = Array.isArray(structuredResume.hobbies) ? structuredResume.hobbies : [];
  // Flattened text for general searches
  const allTextValues = [];
  const collectValues = (obj) => {
    if (obj == null) return;
    if (typeof obj === "string") {
      allTextValues.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(collectValues);
    } else if (typeof obj === "object") {
      Object.values(obj).forEach(collectValues);
    }
  };
  collectValues(structuredResume);
  const allText = allTextValues.join(" ").toLowerCase();
  const wordCount = allText.split(/\s+/).filter(Boolean).length;

  // 1. Contact Completeness (Max 10)
  let contactPts = 0;
  if (safeTrim(header.name)) contactPts += 2;
  if (safeTrim(header.email) && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(header.email)) contactPts += 3;
  if (safeTrim(header.phone) && /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(header.phone)) contactPts += 2;
  if (safeTrim(header.location)) contactPts += 1;
  if (safeTrim(header.linkedin) && !/placeholder|candidate/i.test(header.linkedin)) contactPts += 1;
  if (safeTrim(header.github) && !/placeholder|candidate/i.test(header.github)) contactPts += 1;
  if (safeTrim(header.portfolio) && !/placeholder|candidate/i.test(header.portfolio)) contactPts += 1;
  categoryScores.contactCompleteness = Math.min(10, contactPts);

  // 2. Formatting (Max 10)
  let formatScore = 10;
  if (/\|/.test(allText)) formatScore -= 2; // tables or pipes
  if (/page \d+ of \d+/i.test(allText)) formatScore -= 1; // page footer count
  if (/[◦▪■□◆]/.test(allText)) formatScore -= 1; // non-standard bullets
  if (/(icon|logo|image|graphic)/i.test(allText)) formatScore -= 2; // rich elements warning
  categoryScores.formatting = Math.max(2, formatScore);

  // 3. Keyword Match (Max 15)
  if (jdKeywords.length > 0) {
    let matches = 0;
    for (const kw of jdKeywords) {
      const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, "i");
      if (regex.test(allText)) {
        matches++;
      }
    }
    const matchRatio = matches / jdKeywords.length;
    categoryScores.keywordMatch = Math.round(matchRatio * 15);
  } else {
    // If no JD is provided, default to a neutral moderate score based on general skills
    categoryScores.keywordMatch = Math.min(10, Math.round(skills.length * 0.8));
  }

  // 4. Projects (Max 15)
  if (projects.length > 0) {
    let projPts = 5;
    if (projects.length >= 2) projPts += 3;
    
    let hasDetails = false;
    let hasTech = false;
    let hasUrls = false;

    for (const p of projects) {
      const desc = normalize(p.description) + " " + normalize(p.highlights);
      if (desc.trim().length > 30) hasDetails = true;
      if (Array.isArray(p.technologies) && p.technologies.length > 0) hasTech = true;
      if (safeTrim(p.url)) hasUrls = true;
    }

    if (hasDetails) projPts += 3;
    if (hasTech) projPts += 2;
    if (hasUrls) projPts += 2;
    categoryScores.projects = Math.min(15, projPts);
  }

  // 5. Experience (Max 20)
  if (experience.length > 0) {
    let expPts = 5;
    if (experience.length >= 2) expPts += 3;

    let hasDates = false;
    let actionVerbCount = 0;
    let hasMetrics = false;

    const actionVerbs = ["spearheaded", "designed", "developed", "implemented", "optimized", "led", "improved", "created", "managed", "delivered", "deployed", "engineered", "analyzed", "automated", "built", "architected", "reduced", "increased", "launched", "coordinated"];

    for (const exp of experience) {
      if (safeTrim(exp.startDate) || safeTrim(exp.endDate)) hasDates = true;
      
      const highlightsText = Array.isArray(exp.highlights) ? exp.highlights.join(" ").toLowerCase() : "";
      for (const verb of actionVerbs) {
        if (highlightsText.includes(verb)) {
          actionVerbCount++;
        }
      }
      // Check for metrics: percentages, numbers followed by speed/latency/bugs/sprints/etc.
      if (/%|\d+\+|\b\d{1,3}[,.]?\d{0,3}\b\s*(users|clients|dollars|million|percent|speed|latency|bugs|sprints|requests|issues|features|systems|engineers|teams|projects|months|years|days|percent|percent|k|m)\b/i.test(highlightsText)) {
        hasMetrics = true;
      }
    }

    if (hasDates) expPts += 3;
    expPts += Math.min(6, actionVerbCount * 1.5);
    if (hasMetrics) expPts += 6;
    categoryScores.experience = Math.min(20, expPts);
  }

  // 6. Skills (Max 15)
  if (skills.length > 0) {
    let skillPts = 5;
    if (skills.length >= 5) skillPts += 5;
    if (skills.length >= 10) skillPts += 5;
    categoryScores.skills = Math.min(15, skillPts);
  }

  // 7. Education (Max 10)
  if (education.length > 0) {
    let eduPts = 4;
    let hasDegree = false;
    let hasInstitution = false;
    let hasGpaOrYear = false;

    for (const edu of education) {
      const inst = normalize(edu.institution).toLowerCase();
      const deg = normalize(edu.degree).toLowerCase();
      const field = normalize(edu.fieldOfStudy).toLowerCase();
      const dates = normalize(edu.startDate) + " " + normalize(edu.endDate);
      const gpa = normalize(edu.gpa);

      if (deg || field) hasDegree = true;
      if (inst) hasInstitution = true;
      if (gpa || dates) hasGpaOrYear = true;
    }

    if (hasDegree) eduPts += 2;
    if (hasInstitution) eduPts += 2;
    if (hasGpaOrYear) eduPts += 2;
    categoryScores.education = Math.min(10, eduPts);
  }

  // 8. Achievements (Max 5)
  let achPts = 0;
  if (achievements.length > 0) achPts += 3;
  if (certifications.length > 0) achPts += 2;
  categoryScores.achievements = Math.min(5, achPts);

  // 9. Readability (Max 10)
  let readPts = 0;
  // Length scoring (Optimal 300 to 800 words)
  if (wordCount >= 250 && wordCount <= 900) readPts += 5;
  else if (wordCount >= 100 && wordCount < 250) readPts += 3;
  else if (wordCount > 900) readPts += 3;
  else readPts += 1;

  // Formatting and structure density
  const hasBullets = /•|\-|\*/.test(allText);
  if (hasBullets) readPts += 3;
  
  // Basic vocabulary check (no massive spelling errors)
  const lowerText = allText.toLowerCase();
  const spellingMistakes = ["teh", "recieve", "definately", "seperated", "occured"].filter(w => lowerText.includes(w));
  if (spellingMistakes.length === 0) readPts += 2;

  categoryScores.readability = Math.min(10, readPts);

  // Calculate overall score
  const overallScore = Math.round(
    categoryScores.contactCompleteness +
    categoryScores.formatting +
    categoryScores.keywordMatch +
    categoryScores.projects +
    categoryScores.experience +
    categoryScores.skills +
    categoryScores.education +
    categoryScores.achievements +
    categoryScores.readability
  );

  // Generate explanation based on overall score range
  let explanation = "";
  if (overallScore < 20) {
    explanation = "Critical: The resume contains almost no usable professional information, lacks proper contact details, or is too short for ATS scanning.";
  } else if (overallScore < 40) {
    explanation = "Poor: The resume contains minimal information (e.g. only education) and is missing core sections like Work Experience and Skills.";
  } else if (overallScore < 60) {
    explanation = "Average: Basic sections are present but lack quantified metrics, keyword optimization, and active voice phrasing.";
  } else if (overallScore < 80) {
    explanation = "Strong: Highly readable with clear structure, good keyword matching, and relevant experience/skills.";
  } else {
    explanation = "Excellent: Exceptional ATS compliance with quantified achievements, full contact details, and precise JD keyword alignment.";
  }

  return {
    overallScore: Math.min(100, overallScore),
    categoryScores,
    explanation
  };
}
