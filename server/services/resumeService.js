import { GoogleGenAI } from '@google/genai';
import puppeteer from 'puppeteer';

// Initialize with GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

export const analyzeAndImproveResume = async (resumeText) => {
  try {
    const prompt = `
    You are an expert ATS resume reviewer and writer. 
    Analyze the following resume text and return a structured JSON representing the improved resume.
    Provide the output in valid JSON format ONLY, without markdown formatting.
    
    Structure the JSON as follows:
    {
      "personal_info": { "name": "", "email": "", "phone": "", "linkedin": "" },
      "summary": "Professional summary...",
      "experience": [ { "company": "", "title": "", "dates": "", "responsibilities": ["...", "..."] } ],
      "education": [ { "institution": "", "degree": "", "dates": "" } ],
      "skills": ["...", "..."]
    }
    
    Improve the bullets to be action-oriented, quantifiable, and ATS-friendly.
    
    Resume Text:
    ---
    ${resumeText}
    ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    throw new Error('Failed to analyze and improve resume');
  }
};

export const generateResumePDF = async (resumeJson) => {
  try {
    // Generate simple HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume - ${resumeJson.personal_info?.name || 'User'}</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
              h2 { color: #2980b9; margin-top: 30px; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
              .contact-info { margin-bottom: 20px; font-size: 0.9em; color: #7f8c8d; }
              .summary { font-style: italic; margin-bottom: 30px; }
              .job { margin-bottom: 20px; }
              .job-header { display: flex; justify-content: space-between; font-weight: bold; }
              .job-title { font-weight: normal; font-style: italic; color: #555; }
              ul { margin-top: 5px; padding-left: 20px; }
              li { margin-bottom: 5px; }
              .skills { display: flex; flex-wrap: wrap; gap: 10px; }
              .skill-tag { background-color: #ecf0f1; padding: 5px 10px; border-radius: 5px; font-size: 0.9em; }
          </style>
      </head>
      <body>
          <h1>${resumeJson.personal_info?.name || 'Your Name'}</h1>
          <div class="contact-info">
              ${resumeJson.personal_info?.email || ''} | 
              ${resumeJson.personal_info?.phone || ''} | 
              ${resumeJson.personal_info?.linkedin || ''}
          </div>
          
          <div class="summary">
              ${resumeJson.summary || ''}
          </div>
          
          <h2>Experience</h2>
          ${(resumeJson.experience || []).map(job => `
              <div class="job">
                  <div class="job-header">
                      <span>${job.company}</span>
                      <span>${job.dates}</span>
                  </div>
                  <div class="job-title">${job.title}</div>
                  <ul>
                      ${(job.responsibilities || []).map(resp => `<li>${resp}</li>`).join('')}
                  </ul>
              </div>
          `).join('')}
          
          <h2>Education</h2>
          ${(resumeJson.education || []).map(edu => `
              <div class="job">
                  <div class="job-header">
                      <span>${edu.institution}</span>
                      <span>${edu.dates}</span>
                  </div>
                  <div class="job-title">${edu.degree}</div>
              </div>
          `).join('')}
          
          <h2>Skills</h2>
          <div class="skills">
              ${(resumeJson.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw new Error('Failed to generate PDF');
  }
};
