const { prisma, inMemoryStore } = require('../config/prisma');
const { extractTextFromFile, matchSkillInText } = require('../services/resumeParserService');

const extractJdMetadata = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lowerText = text.toLowerCase();

  const titleMatch = lines.find(l => 
    /engineer|developer|architect|designer|manager|analyst|intern|lead/i.test(l) && l.length < 60
  ) || lines[0] || 'Software Job Description';

  const companyMatch = lines.find(l => 
    /inc\.|corp|technologies|solutions|ltd|pvt|company|co\./i.test(l) && l.length < 50
  ) || 'Target Company';

  const knownSkills = [
    'Java', 'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Express',
    'Python', 'C++', 'C#', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker',
    'Kubernetes', 'Microservices', 'Spring Boot', 'REST API', 'RESTful APIs',
    'GraphQL', 'Git', 'CI/CD', 'Agile', 'Scrum', 'Kafka', 'System Design'
  ];

  const requiredSkills = [];
  const preferredSkills = [];
  const keywords = [];

  knownSkills.forEach(skill => {
    if (matchSkillInText(skill, text)) {
      if (lowerText.includes('preferred') || lowerText.includes('nice to have') || lowerText.includes('bonus')) {
        preferredSkills.push(skill);
      } else {
        requiredSkills.push(skill);
      }
      keywords.push(skill);
    }
  });

  const expMatch = text.match(/(\d+)\+?\s*(years|yrs)\b/i);
  const experienceYears = expMatch ? `${expMatch[1]}+ years` : '1-3 years';

  const eduMatch = text.match(/bachelor|master|degree|b\.s|m\.s|b\.tech|m\.tech|phd/i);
  const education = eduMatch ? eduMatch[0] : 'Bachelor\'s Degree in Computer Science or related field';

  return {
    title: titleMatch,
    company: companyMatch,
    requiredSkills: requiredSkills.length ? requiredSkills : ['JavaScript', 'React', 'Node.js', 'SQL'],
    preferredSkills: preferredSkills.length ? preferredSkills : ['Docker', 'AWS', 'Spring Boot'],
    technologies: Array.from(new Set([...requiredSkills, ...preferredSkills])),
    experienceRequirements: experienceYears,
    educationRequirements: education,
    keywords: Array.from(new Set([...keywords, 'Scalability', 'APIs', 'Teamwork', 'Agile', 'Performance']))
  };
};

const createJobDescription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let originalText = req.body.originalText || '';

    if (req.file) {
      originalText = await extractTextFromFile(req.file.path, req.file.mimetype);
    }

    if (!originalText || originalText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid job description text or file.'
      });
    }

    const extractedData = extractJdMetadata(originalText);
    const jdTitle = req.body.title || extractedData.title;
    const company = req.body.company || extractedData.company;

    const jdId = `jd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newJd = {
      id: jdId,
      userId,
      title: jdTitle,
      company,
      originalText,
      extractedData: JSON.stringify(extractedData),
      createdAt: new Date()
    };

    if (prisma) {
      try {
        await prisma.jobDescription.create({ data: newJd });
      } catch (err) {
        console.warn('Create JD prisma fallback:', err.message);
        inMemoryStore.job_descriptions.push(newJd);
      }
    } else {
      inMemoryStore.job_descriptions.push(newJd);
    }

    res.status(201).json({
      success: true,
      message: 'Job Description saved and analyzed.',
      jobDescription: {
        ...newJd,
        extractedData
      }
    });
  } catch (error) {
    next(error);
  }
};

const getJobDescriptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let list = prisma ? await prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }).catch(() => null) : null;

    if (!list) {
      list = inMemoryStore.job_descriptions.filter(j => j.userId === userId);
    }

    const formatted = list.map(j => ({
      ...j,
      extractedData: typeof j.extractedData === 'string' ? JSON.parse(j.extractedData) : j.extractedData
    }));

    res.json({
      success: true,
      count: formatted.length,
      jobDescriptions: formatted
    });
  } catch (error) {
    next(error);
  }
};

const getJobDescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let jd = prisma ? await prisma.jobDescription.findFirst({ where: { id, userId } }).catch(() => null) : null;
    if (!jd) {
      jd = inMemoryStore.job_descriptions.find(j => j.id === id && j.userId === userId);
    }

    if (!jd) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.'
      });
    }

    res.json({
      success: true,
      jobDescription: {
        ...jd,
        extractedData: typeof jd.extractedData === 'string' ? JSON.parse(jd.extractedData) : jd.extractedData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById
};
