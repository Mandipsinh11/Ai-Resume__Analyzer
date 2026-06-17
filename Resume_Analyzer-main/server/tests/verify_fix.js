import dotenv from "dotenv";
dotenv.config();
import { fixResumeWithAI } from "../utils/gemini.js";

async function testFix() {
    console.log("Starting fixResumeWithAI API Call Test...");

    const role = "Software Engineer";
    const jobDescription = "Looking for a Software Engineer with React, Node.js, and MongoDB experience. Agile methodologies.";
    const resumeText = "MANDIPSINH SINDHA\n+91-7227080276\nsindhanandeep@gmail.com\nAI/ML Developer Internship\nCodexConquer\nWorked on models and integrated backend APIs.";

    try {
        const result = await fixResumeWithAI(resumeText, jobDescription, role);
        console.log("✅ Resume Fix successful!");
        console.log("Result Source:", result._source);
        console.log("ATS Score After:", result.atsScoreAfter);
        console.log("Number of optimized sections:", result.sections.length);
        
        const experienceSection = result.sections.find(s => s.name === "Work Experience");
        if (experienceSection) {
            console.log("Optimized Experience highlights:", experienceSection.optimizedText);
        }
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testFix();
