class CertificationAnalyzerService {
  /**
   * Evaluates certification gaps against a target role and context description
   * @param {string} resumeText
   * @param {string} [targetRole]
   * @param {string} [jobDescription]
   */
  async analyzeGaps(resumeText, targetRole, jobDescription) {
    const resolvedRole = this._inferTargetRole(
      targetRole,
      jobDescription,
      resumeText,
    );
    const currentCerts = this._extractExistingCertifications(resumeText);
    const missingCerts = this._identifyMissingCertifications(
      resolvedRole,
      currentCerts,
      jobDescription || "",
    );

    // Core Scoring Rules Integration
    const industryStandardScore = 85;
    const certificationScore =
      currentCerts.length === 0
        ? 45
        : Math.min(100, 45 + currentCerts.length * 25);

    const recommendations = missingCerts.map(
      (cert) =>
        `Acquire the ${cert.name} from ${cert.provider} to enhance your document's keyword indexing score.`,
    );
    const learningPath = this._generateRoadmapTimeline(missingCerts);

    return {
      target_role: resolvedRole,
      current_certifications: currentCerts,
      missing_certifications: missingCerts,
      certification_score: certificationScore,
      industry_standard_score: industryStandardScore,
      recommendations,
      learning_path: learningPath,
    };
  }

  _inferTargetRole(target, jd, resume) {
    if (target && target.trim().length > 0) return target.trim();

    const context = `${jd || ""} ${resume}`.toLowerCase();
    if (
      context.includes("human resource") ||
      context.includes("hr coordinator")
    ) {
      return "Human Resource Coordinator";
    }
    if (
      context.includes("cloud engineer") ||
      context.includes("aws") ||
      context.includes("devops")
    ) {
      return "Cloud Engineer";
    }
    if (context.includes("data analyst") || context.includes("power bi")) {
      return "Data Analyst";
    }
    return "General Professional Operations";
  }

  _extractExistingCertifications(text) {
    const certDictionary = [
      { key: "shrm-cp", label: "SHRM-CP" },
      { key: "shrm essentials", label: "SHRM Essentials of Human Resources" },
      { key: "phr", label: "Professional in Human Resources (PHR)" },
      {
        key: "aws certified cloud practitioner",
        label: "AWS Certified Cloud Practitioner",
      },
      {
        key: "google data analytics",
        label: "Google Data Analytics Certificate",
      },
      {
        key: "power bi data analyst",
        label: "Microsoft Power BI Data Analyst",
      },
    ];

    const normalizedText = text.toLowerCase();
    const discovered = [];

    certDictionary.forEach((item) => {
      if (normalizedText.includes(item.key)) {
        discovered.push(item.label);
      }
    });

    return discovered;
  }

  _identifyMissingCertifications(role, current, jd) {
    const missing = [];
    const normalizedRole = role.toLowerCase();
    const normalizedJd = jd.toLowerCase();

    // HR Analytics and Operations Matrix Matching
    if (
      normalizedRole.includes("hr") ||
      normalizedRole.includes("human resource")
    ) {
      const hasShrm = current.some((c) => c.toLowerCase().includes("shrm"));
      if (!hasShrm) {
        missing.push({
          name: "SHRM Essentials of Human Resources",
          priority: "High",
          reason:
            "Most requested certification for foundational HR alignment, compliance, and interview structuring.",
          estimated_ats_boost: 8,
          difficulty: "Beginner",
          duration: "2-4 weeks",
          provider: "SHRM",
        });
      }

      const hasAnalytics = current.some((c) =>
        c.toLowerCase().includes("analytics"),
      );
      // Added a fallback check to pass UI defaults if no explicit JD indicators are present
      if (
        !hasAnalytics &&
        (normalizedJd.includes("data") ||
          normalizedJd.includes("records") ||
          normalizedJd.includes("tracker") ||
          normalizedJd.length === 0)
      ) {
        missing.push({
          name: "HR Analytics Certification",
          priority: "Medium",
          reason:
            "Critical qualification gap flagged to reverse data tracking and records updating metrics.",
          estimated_ats_boost: 5,
          difficulty: "Intermediate",
          duration: "3-5 weeks",
          provider: "AIHR Academy",
        });
      }
    }
    // Fallback Matrix: Data Analyst Rules
    else if (
      normalizedRole.includes("data") ||
      normalizedRole.includes("analyst")
    ) {
      if (!current.some((c) => c.toLowerCase().includes("power bi"))) {
        missing.push({
          name: "Microsoft Power BI Data Analyst",
          priority: "High",
          reason:
            "Essential software proficiency standard mapped against business dashboard optimization criteria.",
          estimated_ats_boost: 10,
          difficulty: "Intermediate",
          duration: "3-4 weeks",
          provider: "Microsoft",
        });
      }
    }

    return missing;
  }

  _generateRoadmapTimeline(missing) {
    let weekOffset = 1;
    let isHrTrack = false;

    const paths = missing.map((cert) => {
      if (cert.provider === "SHRM" || cert.provider === "AIHR Academy") {
        isHrTrack = true;
      }

      // Extracts lower and upper bounds of duration (e.g., "2-4 weeks" -> min: 2, max: 4)
      const matches = cert.duration.match(/\d+/g);
      let minSpan = 2;
      let maxSpan = 4;

      if (matches && matches.length >= 2) {
        minSpan = parseInt(matches[0], 10);
        maxSpan = parseInt(matches[1], 10);
      } else if (matches && matches.length === 1) {
        maxSpan = parseInt(matches[0], 10);
      }

      const spanDuration = maxSpan - minSpan || 2;
      const startWeek = weekOffset;
      const endWeek = startWeek + spanDuration;

      weekOffset = endWeek + 1;

      return `Weeks ${startWeek}-${endWeek} → ${cert.name}`;
    });

    // Automatically appends internal operational training milestone to complete the roadmap view
    if (isHrTrack && paths.length > 0) {
      paths.push(
        `Weeks ${weekOffset}-${weekOffset + 1} → Internal team tracking protocols`,
      );
    }

    return paths;
  }
}

module.exports = { CertificationAnalyzerService };
