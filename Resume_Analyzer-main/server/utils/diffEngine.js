import { normalize } from "./resumeParser.js";

/**
 * Generates clear, explainable diffs comparing the resume before and after optimization.
 *
 * @param {object} beforeJson - Canonical Structured Resume before optimization.
 * @param {object} afterJson - Canonical Structured Resume after optimization.
 * @returns {object[]} Array of optimization records: { section, before, after, reason }
 */
export function generateDiffs(beforeJson, afterJson) {
  const diffs = [];

  const compareTextField = (sectionName, beforeText, afterText, defaultReason) => {
    const b = normalize(beforeText).trim();
    const a = normalize(afterText).trim();
    if (b !== a && a.length > 0) {
      diffs.push({
        section: sectionName,
        before: b || "[Empty or Missing]",
        after: a,
        reason: defaultReason
      });
    }
  };

  // 1. Summary diff
  compareTextField(
    "Summary",
    beforeJson.summary,
    afterJson.summary,
    "Enhanced summary phrasing to highlight professional outcomes, align directly with the target job role, and improve keyword matching."
  );

  // 2. Skills diff
  const beforeSkills = Array.isArray(beforeJson.skills) ? beforeJson.skills.join(", ") : normalize(beforeJson.skills);
  const afterSkills = Array.isArray(afterJson.skills) ? afterJson.skills.join(", ") : normalize(afterJson.skills);
  compareTextField(
    "Skills",
    beforeSkills,
    afterSkills,
    "Categorized tech stack and injected high-frequency keywords from the job description to satisfy ATS filter thresholds."
  );

  // 3. Experience highlights diff
  const beforeExp = Array.isArray(beforeJson.experience) ? beforeJson.experience : [];
  const afterExp = Array.isArray(afterJson.experience) ? afterJson.experience : [];

  afterExp.forEach((itemAfter, index) => {
    const itemBefore = beforeExp[index];
    const afterHighlights = Array.isArray(itemAfter.highlights) ? itemAfter.highlights.join("\n") : normalize(itemAfter.highlights);
    const beforeHighlights = itemBefore && Array.isArray(itemBefore.highlights) ? itemBefore.highlights.join("\n") : "";
    
    if (beforeHighlights !== afterHighlights) {
      const companyName = itemAfter.company || itemBefore?.company || "Experience Item";
      compareTextField(
        `Experience (${companyName})`,
        beforeHighlights,
        afterHighlights,
        "Rewrote experience bullets to start with active action verbs and added measurable outcomes/metrics to verify performance claims."
      );
    }
  });

  // 4. Projects highlights diff
  const beforeProjs = Array.isArray(beforeJson.projects) ? beforeJson.projects : [];
  const afterProjs = Array.isArray(afterJson.projects) ? afterJson.projects : [];

  afterProjs.forEach((projAfter, index) => {
    const projBefore = beforeProjs[index];
    const afterHighlights = Array.isArray(projAfter.highlights) ? projAfter.highlights.join("\n") : normalize(projAfter.highlights);
    const beforeHighlights = projBefore && Array.isArray(projBefore.highlights) ? projBefore.highlights.join("\n") : "";

    if (beforeHighlights !== afterHighlights) {
      const projName = projAfter.name || projBefore?.name || "Project Item";
      compareTextField(
        `Project (${projName})`,
        beforeHighlights,
        afterHighlights,
        "Restructured project bullets to highlight core technologies utilized and explicitly state quantitative metrics."
      );
    }
  });

  // 5. Education details diff
  const beforeEdu = Array.isArray(beforeJson.education) ? beforeJson.education : [];
  const afterEdu = Array.isArray(afterJson.education) ? afterJson.education : [];
  afterEdu.forEach((eduAfter, index) => {
    const eduBefore = beforeEdu[index];
    const bStr = eduBefore ? `${eduBefore.degree} from ${eduBefore.institution}` : "";
    const aStr = `${eduAfter.degree} from ${eduAfter.institution}`;
    if (bStr !== aStr) {
      compareTextField(
        `Education`,
        bStr,
        aStr,
        "Aligned education formatting with standard ATS templates to ensure degree credentials are parsed correctly."
      );
    }
  });

  // 6. Certifications diff
  const beforeCerts = Array.isArray(beforeJson.certifications) ? beforeJson.certifications.join(", ") : normalize(beforeJson.certifications);
  const afterCerts = Array.isArray(afterJson.certifications) ? afterJson.certifications.join(", ") : normalize(afterJson.certifications);
  compareTextField(
    "Certifications",
    beforeCerts,
    afterCerts,
    "Listed target professional certifications to satisfy human screener requirements."
  );

  return diffs;
}
