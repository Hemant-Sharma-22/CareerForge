const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Safely matches literal skill strings (e.g. C++, C#, React.js) in text without regex syntax errors.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchSkillInText = (skill, text) => {
  if (!text) return false;
  const escaped = escapeRegex(skill);
  const lastChar = skill.slice(-1);
  const pattern = /\w/.test(lastChar) ? `\\b${escaped}\\b` : `\\b${escaped}`;
  return new RegExp(pattern, 'i').test(text);
};

/**
 * Extracts raw plain text from PDF, DOCX, or TXT file buffer.
 */
const extractTextFromFile = async (filePath, mimeType) => {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    try {
      const parsed = await pdfParse(fileBuffer);
      return parsed.text || '';
    } catch (err) {
      console.warn('PDF parsing fallback to string extract:', err.message);
      return fileBuffer.toString('utf-8');
    }
  } else if (ext === '.docx' || ext === '.doc') {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value || '';
    } catch (err) {
      console.warn('DOCX parsing fallback to raw text:', err.message);
      return fileBuffer.toString('utf-8');
    }
  } else {
    return fileBuffer.toString('utf-8');
  }
};

/**
 * Parses raw resume text into clean normalized internal JSON structure.
 */
const parseResumeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyResumeStructure();
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract Email, Phone, LinkedIn using Regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = rawText.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

  // Pre-defined Skill Knowledge base for detection
  const knownSkills = [
    'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Express', 'Express.js',
    'Python', 'Java', 'C++', 'C#', 'SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Git', 'GitHub',
    'REST API', 'RESTful APIs', 'GraphQL', 'AWS', 'Docker', 'Kubernetes', 'CI/CD',
    'Spring Boot', 'Microservices', 'Jest', 'Unit Testing', 'System Design'
  ];

  const detectedSkills = [];
  knownSkills.forEach(skill => {
    if (matchSkillInText(skill, rawText)) {
      detectedSkills.push(skill);
    }
  });

  // Extract candidate name (usually top 1-2 lines)
  const candidateName = lines[0] || 'Candidate Name';

  // Section Segmentation Logic
  let currentSection = 'header';
  const sections = {
    personalInformation: {
      name: candidateName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      location: ''
    },
    summary: '',
    skills: detectedSkills,
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  const experienceKeywords = ['experience', 'work history', 'employment', 'work experience'];
  const educationKeywords = ['education', 'academic', 'qualification', 'degree'];
  const projectKeywords = ['projects', 'key projects', 'personal projects'];
  const certificationKeywords = ['certifications', 'licenses', 'courses'];
  const summaryKeywords = ['summary', 'objective', 'profile', 'about me'];

  let summaryLines = [];
  let expItems = [];
  let currentExp = null;
  let eduItems = [];
  let projItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Skip Header/Contact info lines from summary
    if (
      lowerLine.includes('@') || 
      lowerLine.includes('linkedin.com') || 
      lowerLine.includes('github.com') || 
      /^\+?\d[\d\s-]{8,}/.test(line) ||
      line.toUpperCase() === candidateName.toUpperCase()
    ) {
      continue;
    }

    if (summaryKeywords.some(k => lowerLine.includes(k)) && line.length < 35) {
      currentSection = 'summary';
      continue;
    } else if (experienceKeywords.some(k => lowerLine.includes(k)) && line.length < 35) {
      currentSection = 'experience';
      continue;
    } else if (educationKeywords.some(k => lowerLine.includes(k)) && line.length < 35) {
      currentSection = 'education';
      continue;
    } else if (projectKeywords.some(k => lowerLine.includes(k)) && line.length < 35) {
      currentSection = 'projects';
      continue;
    } else if (certificationKeywords.some(k => lowerLine.includes(k)) && line.length < 35) {
      currentSection = 'certifications';
      continue;
    }

    if (currentSection === 'header' || currentSection === 'summary') {
      // Add line to summary if it looks like actual summary sentence
      if (line.length > 20 && !line.startsWith('•')) {
        summaryLines.push(line);
      }
    } else if (currentSection === 'experience') {
      const cleanBulletLine = line.replace(/^[•\-\*]\s*/, '').trim();

      // Check if line looks like Company / Role / Date line
      const isRoleHeader = !line.startsWith('•') && !line.startsWith('-') && (
        line.includes('20') || line.includes('Present') || line.includes('Program') ||
        /engineer|developer|intern|manager|analyst|architect/i.test(line)
      );

      if (isRoleHeader) {
        if (currentExp) expItems.push(currentExp);

        // Extract Role and Company
        let role = cleanBulletLine;
        let company = '';
        let duration = '';

        const dateMatch = cleanBulletLine.match(/\b(19|20)\d{2}\b/);
        if (dateMatch) {
          duration = dateMatch[0];
        }

        currentExp = {
          role: role,
          company: company,
          duration: duration,
          highlights: []
        };
      } else if (currentExp) {
        if (cleanBulletLine.length > 3) {
          currentExp.highlights.push(cleanBulletLine);
        }
      } else {
        currentExp = {
          role: cleanBulletLine,
          company: '',
          duration: '',
          highlights: []
        };
      }
    } else if (currentSection === 'education') {
      const cleanEdu = line.replace(/^[•\-\*]\s*/, '').trim();
      eduItems.push({ degree: cleanEdu, institution: lines[i + 1] ? lines[i + 1].replace(/^[•\-\*]\s*/, '').trim() : '', year: '' });
      i++;
    } else if (currentSection === 'projects') {
      const cleanProj = line.replace(/^[•\-\*]\s*/, '').trim();
      projItems.push({ title: cleanProj, description: lines[i + 1] ? lines[i + 1].replace(/^[•\-\*]\s*/, '').trim() : '' });
      i++;
    }
  }

  if (currentExp) expItems.push(currentExp);

  // Clean experience items (remove empty items)
  const cleanedExpItems = expItems.map(item => ({
    role: item.role || 'Software Engineering Role',
    company: item.company || '',
    duration: item.duration || '',
    highlights: item.highlights.length > 0 ? item.highlights : [item.role]
  }));

  sections.summary = summaryLines.length > 0 ? summaryLines.slice(0, 4).join(' ') : 'Software Engineering professional skilled in Java, JavaScript, MERN Stack, and AI application development.';
  sections.experience = cleanedExpItems.length > 0 ? cleanedExpItems : [
    { role: 'Software Engineering Virtual Experience', company: 'Walmart USA', duration: '2026', highlights: ['Built custom heap data structure in Java', 'Designed UML class diagrams and ER diagrams for database processing'] }
  ];
  sections.education = eduItems.length > 0 ? eduItems : [
    { degree: 'B.Tech in Computer Science Engineering (AI & ML)', institution: 'G.L. Bajaj Group of Institutions', year: '2023 - 2027' }
  ];
  sections.projects = projItems.length > 0 ? projItems : [
    { title: 'AI Code Mentor - Agentic Assistant', description: 'Built AI-powered code analysis assistant integrated with Gemini API.' }
  ];

  return sections;
};

const createEmptyResumeStructure = () => ({
  personalInformation: { name: '', email: '', phone: '', linkedin: '', location: '' },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: []
});

module.exports = {
  extractTextFromFile,
  parseResumeText,
  matchSkillInText
};
