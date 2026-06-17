import dotenv from "dotenv";
dotenv.config();
import { unifiedResumeAnalysis } from "../utils/gemini.js";

async function testAnalysis() {
    console.log("Starting Unified ATS Resume Analysis Test...");

    const role = "Software Engineer";
    const jobDescription = "We are looking for a Software Engineer with experience in React, Node.js, and MongoDB.";
    const resumeText = "John Doe. Experience: Worked at Tech Corp as a coder. Skills: HTML, CSS. Education: BS CS.";

    try {
        const result = await unifiedResumeAnalysis(resumeText, jobDescription, role);
        console.log("✅ Analysis successful!");
        console.log("Result:", JSON.stringify(result, null, 2));

        // Check for required fields of unified analysis
        const requiredFields = [
            "atsScore",
            "resumeScore",
            "overallAssessment",
            "skillsAnalysis",
            "experienceAnalysis",
            "educationAnalysis",
            "keyStrengths",
            "areasForImprovement",
            "recommendedCoursesOrCertifications",
            "atsOptimizationNotes",
            "nextSteps",
            "templateIssues",
            "formattingProblems",
            "structuralIssues",
            "missingRecommendedSections",
            "improvementSuggestions",
            "overallTemplateScore",
            "templateRecommendations"
        ];
        const missing = requiredFields.filter(f => !(f in result));

        if (missing.length === 0) {
            console.log("✅ JSON format is valid and contains all required unified fields.");
        } else {
            console.log("❌ Missing fields:", missing.join(", "));
        }
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testAnalysis();
