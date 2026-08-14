const Groq = require('groq-sdk');
const config = require('../config');

let groqClient = null;
const apiKey = config.groqApiKey;

if (apiKey && apiKey !== 'gsk_your_groq_api_key_here') {
  try {
    if (apiKey.startsWith('xai-')) {
      // xAI API key initialization via OpenAI-compatible endpoint
      groqClient = new Groq({
        apiKey: apiKey,
        baseURL: 'https://api.x.ai/v1'
      });
    } else {
      // Standard Groq API initialization
      groqClient = new Groq({ apiKey: apiKey });
    }
  } catch (err) {
    console.warn('AI Client initialization warning:', err.message);
  }
}

/**
 * Extracts structured skills, technologies, and keywords directly from Job Description (JD) text using Groq LLM.
 */
const extractJdKeywordsAndSkills = async (jdText) => {
  if (!jdText || jdText.trim().length === 0) {
    return {
      title: 'Target Job Role',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL'],
      preferredSkills: ['TypeScript', 'Docker', 'AWS'],
      keywords: ['REST API', 'Scalability', 'Microservices', 'Git'],
      experienceRequirements: '1+ years',
      educationRequirements: 'Bachelor Degree'
    };
  }

  const modelName = apiKey && apiKey.startsWith('xai-') ? 'grok-beta' : 'llama-3.3-70b-versatile';

  if (groqClient) {
    try {
      const prompt = `You are an expert ATS recruiter. Analyze the following Job Description (JD) and extract key requirements.
Job Description:
"""
${jdText.substring(0, 4000)}
"""

Return ONLY a JSON object with keys:
{
  "title": "Extracted Job Title or Role Name",
  "company": "Company Name if mentioned",
  "requiredSkills": ["array of exact technical skills & tools required"],
  "preferredSkills": ["array of nice-to-have or bonus skills"],
  "keywords": ["array of key domain terms, methodologies, or concepts in the JD"],
  "experienceRequirements": "experience years string (e.g. 2+ years)",
  "educationRequirements": "degree requirements string"
}`;

      const response = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: modelName,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return {
        title: parsed.title || 'Target Job Role',
        company: parsed.company || 'Employer',
        requiredSkills: parsed.requiredSkills || [],
        preferredSkills: parsed.preferredSkills || [],
        keywords: parsed.keywords || [],
        experienceRequirements: parsed.experienceRequirements || '1+ years',
        educationRequirements: parsed.educationRequirements || 'Degree'
      };
    } catch (err) {
      console.warn('Groq JD extraction fallback:', err.message);
    }
  }

  // Text Parsing Fallback if Groq is unconfigured
  return fallbackJdExtractor(jdText);
};

/**
 * Compares exact Resume text against exact Job Description text using Groq LLM to find missing keywords.
 */
const analyzeResumeAgainstJd = async (resumeText, jdText) => {
  const modelName = apiKey && apiKey.startsWith('xai-') ? 'grok-beta' : 'llama-3.3-70b-versatile';

  if (groqClient && resumeText && jdText) {
    try {
      const prompt = `You are an executive ATS analyzer. Compare the Candidate's Resume against the Target Job Description (JD) to identify exact missing keywords and skill gaps.

CANDIDATE RESUME:
"""
${resumeText.substring(0, 4000)}
"""

TARGET JOB DESCRIPTION:
"""
${jdText.substring(0, 4000)}
"""

Return ONLY a JSON object with keys:
{
  "matchedSkills": ["skills explicitly present in both JD and Resume"],
  "missingSkills": ["important technical skills required in JD but MISSING from Resume"],
  "matchedKeywords": ["keywords & concepts present in both JD and Resume"],
  "missingKeywords": ["critical JD keywords/tools MISSING from Resume"],
  "weakAreas": [
    {
      "section": "Skills or Keywords or Summary",
      "issue": "description of missing JD requirement",
      "recommendation": "actionable advice to add the JD term into bullet points",
      "impact": "High or Medium"
    }
  ],
  "recommendations": ["array of specific bullet points to improve alignment with this exact JD"]
}`;

      const response = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: modelName,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.warn('Groq Resume-JD analysis warning:', err.message);
    }
  }

  return null;
};

/**
 * Text parsing fallback for JD extraction
 */
const fallbackJdExtractor = (jdText) => {
  const commonTech = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Java', 'Python', 'Spring Boot', 'Django',
    'PostgreSQL', 'MongoDB', 'MySQL', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'REST API', 'GraphQL',
    'Kafka', 'Redis', 'Microservices', 'CI/CD', 'Git', 'Agile', 'HTML', 'CSS', 'Tailwind', 'Next.js'
  ];

  const lowerJd = jdText.toLowerCase();
  const extractedSkills = commonTech.filter(tech => lowerJd.includes(tech.toLowerCase()));

  // Extract candidate keywords using 4+ char word tokens
  const words = jdText.match(/\b[A-Za-z]{4,}\b/g) || [];
  const freq = {};
  words.forEach(w => {
    const lw = w.toLowerCase();
    if (!['with', 'from', 'have', 'that', 'this', 'will', 'your', 'about', 'team', 'work', 'experience', 'using'].includes(lw)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  const keywords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 10);

  return {
    title: 'Target Job Description',
    requiredSkills: extractedSkills.slice(0, 6),
    preferredSkills: extractedSkills.slice(6),
    keywords: keywords,
    experienceRequirements: '1+ years',
    educationRequirements: 'Bachelor Degree'
  };
};

/**
 * Optimizes a resume bullet point using AI API with rule-based fallback.
 */
const optimizeBulletPoint = async (originalBullet, style = 'ATS optimized', targetKeywords = []) => {
  if (!originalBullet || originalBullet.trim().length === 0) {
    return {
      original: '',
      improved: '',
      keywordsAdded: [],
      explanation: 'Please provide a valid bullet point to improve.',
      strengthScore: 0
    };
  }

  const modelName = apiKey && apiKey.startsWith('xai-') ? 'grok-beta' : 'llama-3.3-70b-versatile';

  if (groqClient) {
    try {
      const prompt = `You are an expert ATS resume writer. Optimize the following resume bullet point.
Original Bullet: "${originalBullet}"
Style: ${style}
Target Keywords to include if truthful: ${targetKeywords.join(', ') || 'REST API, validation, performance, scalability'}

RULES:
1. Do NOT fabricate experience, metrics, companies, or technologies.
2. Return ONLY a JSON object with keys:
{
  "improved": "string",
  "keywordsAdded": ["string"],
  "explanation": "string",
  "strengthScore": number (0-100)
}`;

      const response = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: modelName,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        original: originalBullet,
        improved: result.improved || originalBullet,
        keywordsAdded: result.keywordsAdded || ['REST API', 'Validation'],
        explanation: result.explanation || 'Enhanced bullet with strong action verbs and technical keywords.',
        strengthScore: result.strengthScore || 88
      };
    } catch (err) {
      console.warn('AI API bullet optimization fallback:', err.message);
    }
  }

  return fallbackBulletOptimizer(originalBullet, style, targetKeywords);
};

const fallbackBulletOptimizer = (originalBullet, style, targetKeywords) => {
  let improved = originalBullet.trim();
  const keywordsAdded = [];

  const verbReplacements = {
    'worked on': 'Architected and implemented',
    'built': 'Developed and deployed',
    'made': 'Engineered and optimized',
    'helped with': 'Collaborated on',
    'handled': 'Managed and executed'
  };

  Object.keys(verbReplacements).forEach(weakVerb => {
    const regex = new RegExp(`\\b${weakVerb}\\b`, 'i');
    if (regex.test(improved)) {
      improved = improved.replace(regex, verbReplacements[weakVerb]);
      keywordsAdded.push(verbReplacements[weakVerb].split(' ')[0]);
    }
  });

  if (!improved.toLowerCase().includes('rest api') && targetKeywords.includes('REST API')) {
    improved += ' implementing secure RESTful API endpoints';
    keywordsAdded.push('RESTful API');
  }

  if (!improved.toLowerCase().includes('authentication') && targetKeywords.includes('Authentication')) {
    improved += ' with JWT authentication and input validation';
    keywordsAdded.push('Authentication', 'Validation');
  }

  if (style === 'Impact focused' && !improved.match(/\d+%/)) {
    improved += ', reducing API latency by 25%';
    keywordsAdded.push('Performance Latency');
  }

  return {
    original: originalBullet,
    improved,
    keywordsAdded: Array.from(new Set(keywordsAdded)),
    explanation: `Transformed weak action verbs into impactful accomplishment statements with style focus: "${style}".`,
    strengthScore: Math.min(95, 70 + keywordsAdded.length * 8)
  };
};

const generateOptimizedResume = async (resumeData, jdData, missingKeywords = []) => {
  const parsedResume = typeof resumeData.parsedData === 'string'
    ? JSON.parse(resumeData.parsedData)
    : (resumeData.parsedData || resumeData);

  const parsedJd = typeof jdData.extractedData === 'string'
    ? JSON.parse(jdData.extractedData)
    : (jdData.extractedData || jdData);

  const modelName = apiKey && apiKey.startsWith('xai-') ? 'grok-beta' : 'llama-3.3-70b-versatile';

  if (groqClient) {
    try {
      const prompt = `You are a professional resume writer. Generate an optimized version of candidate's resume content to better align with the job description.
Existing Resume: ${JSON.stringify(parsedResume)}
Target Job Title: ${parsedJd.title || 'Software Engineer'}
Missing Keywords: ${missingKeywords.join(', ')}

Return ONLY JSON with structure:
{
  "summary": "string",
  "skills": ["string"],
  "experience": [ { "role": "string", "company": "string", "duration": "string", "highlights": ["string"] } ],
  "education": [ { "degree": "string", "institution": "string", "year": "string" } ],
  "projects": [ { "title": "string", "description": "string" } ]
}`;

      const response = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: modelName,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.warn('AI API resume generation fallback:', err.message);
    }
  }

  const optimizedSummary = `${parsedResume.summary || 'Results-driven software developer'} Experienced in building scalable web applications with expertise in ${parsedResume.skills.slice(0, 4).join(', ')}. Target role aligned for ${parsedJd.title || 'Software Development'}.`;

  const updatedSkills = Array.from(new Set([
    ...(parsedResume.skills || []),
    ...missingKeywords.slice(0, 3)
  ]));

  const updatedExperience = (parsedResume.experience || []).map(exp => ({
    ...exp,
    highlights: (exp.highlights || []).map(h => {
      const opt = fallbackBulletOptimizer(h, 'ATS optimized', missingKeywords);
      return opt.improved;
    })
  }));

  return {
    personalInformation: parsedResume.personalInformation,
    summary: optimizedSummary,
    skills: updatedSkills,
    experience: updatedExperience,
    education: parsedResume.education || [],
    projects: parsedResume.projects || [],
    certifications: parsedResume.certifications || [],
    achievements: parsedResume.achievements || []
  };
};

module.exports = {
  extractJdKeywordsAndSkills,
  analyzeResumeAgainstJd,
  optimizeBulletPoint,
  generateOptimizedResume
};
