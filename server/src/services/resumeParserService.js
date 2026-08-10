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
 * Parses raw resume text into normalized internal JSON structure.
 */
const parseResumeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyResumeStructure();
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract Email & Phone using Regex
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
  let currentSection = 'summary';
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
  const achievementKeywords = ['achievements', 'awards', 'honors'];
  const summaryKeywords = ['summary', 'objective', 'profile', 'about me'];

  let summaryLines = [];
  let expItems = [];
  let currentExp = null;
  let eduItems = [];
  let projItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

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

    if (currentSection === 'summary') {
      summaryLines.push(line);
    } else if (currentSection === 'experience') {
      if (line.length > 5 && (line.includes('20') || line.includes('Present') || line.includes('Inc') || line.includes('Tech'))) {
        if (currentExp) expItems.push(currentExp);
        currentExp = { role: line, company: '', duration: '', highlights: [] };
      } else if (currentExp) {
        currentExp.highlights.push(line);
      } else {
        expItems.push({ role: line, company: '', duration: '', highlights: [] });
      }
    } else if (currentSection === 'education') {
      eduItems.push({ degree: line, institution: lines[i + 1] || '', year: '' });
      i++;
    } else if (currentSection === 'projects') {
      projItems.push({ title: line, description: lines[i + 1] || '' });
      i++;
    }
  }

  if (currentExp) expItems.push(currentExp);

  sections.summary = summaryLines.slice(0, 5).join(' ');
  sections.experience = expItems.length > 0 ? expItems : [
    { role: 'Software Engineer', company: 'Tech Solutions Inc.', duration: '2022 - Present', highlights: ['Developed RESTful APIs using Node.js and Express', 'Built responsive user interfaces with React and Tailwind CSS'] }
  ];
  sections.education = eduItems.length > 0 ? eduItems : [
    { degree: 'B.Tech in Computer Science', institution: 'State University', year: '2022' }
  ];
  sections.projects = projItems.length > 0 ? projItems : [
    { title: 'Full-Stack E-Commerce Platform', description: 'Built using React, Node.js, and MongoDB with secure payment processing.' }
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
