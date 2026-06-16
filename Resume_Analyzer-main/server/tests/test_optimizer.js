import { fixResumeWithAI } from "../utils/gemini.js";
import { parseResumeToStructured, serializeStructuredToFlat } from "../utils/resumeParser.js";
import { scoreResume } from "../utils/atsScorer.js";


async function runTests() {
  console.log("=== RUNNING PRODUCTION RESUME INTELLIGENCE SYSTEM TEST SUITE ===\n");

  // --- Case A: Terrible Resume ---
  console.log("Running Case A: Terrible Resume...");
  const resumeA = "Need job.";
  const resultA = await fixResumeWithAI(resumeA, "Software Engineer", "Software Engineer");
  console.log(`- Score before: ${resultA.atsScoreBefore}`);
  console.log(`- Score after: ${resultA.atsScoreAfter}`);
  console.log(`- Issues: ${JSON.stringify(resultA.issues)}`);
  
  if (resultA.atsScoreBefore >= 20) {
    console.error("❌ Case A Failed: Expected score before to be < 20!");
  } else {
    console.log("✅ Case A Passed: Score is appropriately low (< 20).");
  }
  console.log("--------------------------------------------------\n");


  // --- Case B: Student Resume ---
  console.log("Running Case B: Student Resume...");
  const resumeB = `
  John Doe
  Email: john.doe@email.com
  Phone: 1234567890

  Education
  Bachelor of Science in Computer Science
  University of Technology, 2022 - 2026
  `;
  const resultB = await fixResumeWithAI(resumeB, "Software Engineer", "Software Engineer");
  console.log(`- Score before: ${resultB.atsScoreBefore}`);
  
  if (resultB.atsScoreBefore < 25 || resultB.atsScoreBefore > 45) {
    console.error(`❌ Case B Failed: Expected score before to be in 25-45 range, got: ${resultB.atsScoreBefore}`);
  } else {
    console.log("✅ Case B Passed: Score is calibrated in 25-45 range.");
  }
  console.log("--------------------------------------------------\n");


  // --- Case C: Good Resume ---
  console.log("Running Case C: Good Resume...");
  const resumeC = `
  Jane Smith
  jane.smith@email.com | 9876543210
  Ahmedabad, Gujarat | linkedin.com/in/janesmith

  Professional Summary
  Dedicated Software Engineer with 2 years of experience building web applications.

  Work Experience
  Software Developer at TechCorp (2024 - Present)
  • Spearheaded engineering of core customer portals using React and Node.js.
  • Improved backend API response latencies by 20% and resolved database locks.
  • Collaborated with product designers in weekly agile sprint cycles.

  Skills
  JavaScript, React, Node.js, SQL, Git

  Education
  Bachelor of Technology in Computer Science, 2024
  `;
  const resultC = await fixResumeWithAI(resumeC, "Software Engineer", "Software Engineer");
  console.log(`- Score before: ${resultC.atsScoreBefore}`);
  console.log(`- Score after: ${resultC.atsScoreAfter}`);
  
  if (resultC.atsScoreBefore < 60 || resultC.atsScoreBefore > 80) {
    console.error(`❌ Case C Failed: Expected score before to be in 60-80 range, got: ${resultC.atsScoreBefore}`);
  } else {
    console.log("✅ Case C Passed: Good resume score is calibrated in 60-80 range.");
  }
  console.log("--------------------------------------------------\n");


  // --- Case D: Excellent Resume ---
  console.log("Running Case D: Excellent Resume...");
  const resumeD = `
  Dhruv Patel
  dhruv.patel@email.com | 1234567890 | Ahmedabad, India
  linkedin.com/in/dhruvpatel | github.com/dhruvpatel

  Professional Summary
  Results-oriented Senior Software Architect with 8 years of experience leading engineering teams and developing high-throughput web platforms.

  Work Experience
  Senior Architect at EnterpriseCorp (2022 - Present)
  • Spearheaded design of microservice architecture, scaling systems to support 10M+ daily active requests.
  • Optimized SQL/NoSQL query models, reducing write operation latency by 45%.
  • Directed cross-functional team of 15 engineers in agile sprints, improving delivery velocity by 18%.

  Projects
  Resume Intelligence System
  • Engineered NLP parsing engines using deep parser models, parsing 500+ documents per minute.
  • Deployed containerized microservices to AWS utilizing Docker and Kubernetes pipelines.

  Skills
  JavaScript, Python, React, Node.js, SQL, Docker, Kubernetes, AWS, Git, System Design

  Education
  Master of Technology in Computer Science Engineering, 2022

  Certifications
  AWS Certified Solutions Architect - Associate
  `;
  const resultD = await fixResumeWithAI(resumeD, "Software Architect", "Software Architect");
  console.log(`- Score before: ${resultD.atsScoreBefore}`);
  console.log(`- Score after: ${resultD.atsScoreAfter}`);
  
  if (resultD.atsScoreBefore < 80) {
    console.error(`❌ Case D Failed: Expected score before to be 80+, got: ${resultD.atsScoreBefore}`);
  } else {
    console.log("✅ Case D Passed: Excellent resume score is calibrated in 80+ range.");
  }

  // URL Hallucination prevention check
  const optHeader = resultD.optimizedContent.header || "";
  if (optHeader.includes("linkedin.com/in/candidate") || optHeader.includes("github.com/candidate")) {
    console.error("❌ Guardrail Failed: Hallucinated placeholder URLs found!");
  } else {
    console.log("✅ Guardrail Passed: Contact links were not hallucinated.");
  }
  console.log("--------------------------------------------------\n");


  // --- Case E: Missing Sections ---
  console.log("Running Case E: Missing Sections...");
  const resumeE = `
  John Doe
  john.doe@email.com

  Education
  B.S. Computer Science
  `;
  const resultE = await fixResumeWithAI(resumeE, "Software Engineer", "Software Engineer");
  console.log(`- Missing sections detected: ${JSON.stringify(resultE.missingSections)}`);
  
  const expectedMissing = ["summary", "experience", "skills"];
  const allMissingDetected = expectedMissing.every(s => resultE.missingSections.includes(s));
  
  if (!allMissingDetected) {
    console.error("❌ Case E Failed: Did not detect all expected missing sections!");
  } else {
    console.log("✅ Case E Passed: Missing sections correctly detected.");
  }
  console.log("--------------------------------------------------\n");


  // --- Case F: Malformed Data ---
  console.log("Running Case F: Malformed Data...");
  const structuredMalformed = {
    header: { name: 12345, email: "invalid-email", phone: null },
    summary: undefined,
    education: [ { institution: [ "Nested School", 99 ], degree: null } ],
    experience: "this should be an array but it is a string",
    skills: { list: ["React", "SQL"] }
  };

  try {
    const scoreVal = scoreResume(structuredMalformed, []);
    console.log(`- Scored successfully with malformed data. Score: ${scoreVal.overallScore}`);
    console.log("✅ Case F Passed: No crashes encountered during scoring.");
  } catch (err) {
    console.error("❌ Case F Failed: Scoring crashed on malformed object structure!", err);
  }
  console.log("--------------------------------------------------\n");


  // --- Case G: Object instead of String (content.trim fails prevention) ---
  console.log("Running Case G: Object instead of String...");
  const structuredObjectText = {
    header: { name: "Test User", email: "test@email.com", phone: "1234567890" },
    summary: { text: "Dedicated software engineer" }, // Object where summary text is expected
    education: [],
    experience: [],
    projects: [],
    skills: []
  };

  try {
    const parsedFlat = serializeStructuredToFlat(structuredObjectText);
    console.log(`- Serialized summary text: "${parsedFlat.summary}"`);
    if (parsedFlat.summary.trim() === "Dedicated software engineer") {
      console.log("✅ Case G Passed: Object was flattened type-safely without content.trim() failures.");
    } else {
      console.error(`❌ Case G Failed: Unexpected summary text value: ${parsedFlat.summary}`);
    }
  } catch (err) {
    console.error("❌ Case G Failed: Serialization crashed on nested object summary!", err);
  }
  console.log("--------------------------------------------------\n");

  console.log("=== ALL TEST CASES COMPLETED ===");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
});
