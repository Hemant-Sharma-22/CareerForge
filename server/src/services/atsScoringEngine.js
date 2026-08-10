/**
 * Explainable Rule-Based ATS Scoring Engine
 * Configurable weights:
 * 35% Skill Match
 * 25% Keyword Match
 * 15% Experience Match
 * 10% Education Match
 * 10% Section Completeness
 * 5% Formatting/Structure
 */

const DEFAULT_WEIGHTS = {
  skill: 0.35,
  keyword: 0.25,
  experience: 0.15,
  education: 0.10,
  completeness: 0.10,
  formatting: 0.05
};

const calculateAtsScore = (resumeData, jdData, customWeights = {}) => {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const parsedResume = typeof resumeData.parsedData === 'string' 
    ? JSON.parse(resumeData.parsedData) 
    : (resumeData.parsedData || resumeData);

  const parsedJd = typeof jdData.extractedData === 'string'
    ? JSON.parse(jdData.extractedData)
    : (jdData.extractedData || jdData);

  const resumeText = (resumeData.rawText || JSON.stringify(parsedResume)).toLowerCase();
  const jdText = (jdData.originalText || JSON.stringify(parsedJd)).toLowerCase();

  // 1. Skill Match Calculation (35%)
  const jdSkills = Array.from(new Set([
    ...(parsedJd.requiredSkills || []),
    ...(parsedJd.preferredSkills || []),
    ...(parsedJd.technologies || [])
  ]));

  const resumeSkills = Array.from(new Set([
    ...(parsedResume.skills || []),
    ...findSkillsInText(resumeText)
  ]));

  const matchedSkills = [];
  const missingSkills = [];

  jdSkills.forEach(skill => {
    const isMatched = resumeSkills.some(s => s.toLowerCase() === skill.toLowerCase()) ||
                      resumeText.includes(skill.toLowerCase());
    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchScore = jdSkills.length > 0 
    ? Math.round((matchedSkills.length / jdSkills.length) * 100)
    : 80;

  // 2. Keyword Match Calculation (25%)
  const jdKeywords = Array.from(new Set(parsedJd.keywords || ['REST API', 'Scalability', 'Git', 'Agile', 'SQL']));
  const matchedKeywords = [];
  const missingKeywords = [];

  jdKeywords.forEach(kw => {
    if (resumeText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchScore = jdKeywords.length > 0
    ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
    : 75;

  // 3. Experience Match Calculation (15%)
  const expMatch = jdText.match(/(\d+)\+?\s*(years|yrs)/i);
  const requiredYears = expMatch ? parseInt(expMatch[1], 10) : 2;

  let candidateYears = 0;
  if (parsedResume.experience && Array.isArray(parsedResume.experience)) {
    candidateYears = parsedResume.experience.length * 1.5; // Estimated 1.5 years per role
  }

  const experienceMatchScore = Math.min(100, Math.round((candidateYears / Math.max(1, requiredYears)) * 100));

  // 4. Education Match Calculation (10%)
  const hasDegreeKeyword = /bachelor|degree|b\.tech|b\.s|master|m\.tech|m\.s/i.test(resumeText);
  const educationMatchScore = hasDegreeKeyword ? 100 : 60;

  // 5. Section Completeness (10%)
  const requiredSections = ['summary', 'skills', 'experience', 'education', 'projects'];
  let filledSectionsCount = 0;

  requiredSections.forEach(sec => {
    if (parsedResume[sec] && (
      (Array.isArray(parsedResume[sec]) && parsedResume[sec].length > 0) ||
      (typeof parsedResume[sec] === 'string' && parsedResume[sec].trim().length > 0)
    )) {
      filledSectionsCount++;
    }
  });

  const completenessScore = Math.round((filledSectionsCount / requiredSections.length) * 100);

  // 6. Formatting / Structure Score (5%)
  const formattingScore = resumeText.length > 400 && resumeText.length < 10000 ? 95 : 70;

  // Weighted Total Score calculation
  const totalScore = Math.round(
    (skillMatchScore * weights.skill) +
    (keywordMatchScore * weights.keyword) +
    (experienceMatchScore * weights.experience) +
    (educationMatchScore * weights.education) +
    (completenessScore * weights.completeness) +
    (formattingScore * weights.formatting)
  );

  // Weak Area Analysis
  const weakAreas = [];
  if (missingSkills.length > 0) {
    weakAreas.push({
      section: 'Skills',
      issue: `Missing ${missingSkills.slice(0, 3).join(', ')}`,
      recommendation: `Incorporate these technologies into your skills and project bullets where applicable.`,
      impact: 'High'
    });
  }

  if (keywordMatchScore < 80) {
    weakAreas.push({
      section: 'Keywords',
      issue: `JD term coverage is ${keywordMatchScore}%`,
      recommendation: `Include action words such as: ${missingKeywords.slice(0, 3).join(', ')}.`,
      impact: 'Medium'
    });
  }

  if (!parsedResume.summary || parsedResume.summary.length < 50) {
    weakAreas.push({
      section: 'Summary',
      issue: 'Professional summary is short or missing target role alignment.',
      recommendation: `Add a concise 3-line summary referencing your experience in ${matchedSkills.slice(0, 3).join(', ')}.`,
      impact: 'Medium'
    });
  }

  // Recommendations Generation
  const recommendations = [
    `Add missing high-priority skills: ${missingSkills.slice(0, 4).join(', ') || 'Spring Boot, Docker'}.`,
    `Quantify your project achievements using metrics (e.g. "Improved API response latency by 35%").`,
    `Ensure your technical terms exactly match the spelling in the job posting.`
  ];

  return {
    score: totalScore,
    skillMatchScore,
    keywordMatchScore,
    experienceMatchScore,
    educationMatchScore,
    completenessScore,
    formattingScore,
    matchedSkills,
    missingSkills,
    matchedKeywords,
    missingKeywords,
    weakAreas,
    recommendations,
    weightsUsed: weights
  };
};

const findSkillsInText = (text) => {
  const common = ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Java', 'Python', 'SQL', 'Git', 'HTML', 'CSS'];
  return common.filter(s => text.includes(s.toLowerCase()));
};

module.exports = {
  calculateAtsScore
};
