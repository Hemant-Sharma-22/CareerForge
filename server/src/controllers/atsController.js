const { prisma, inMemoryStore } = require('../config/prisma');
const { calculateAtsScore } = require('../services/atsScoringEngine');
const { optimizeBulletPoint, generateOptimizedResume, extractJdKeywordsAndSkills, analyzeResumeAgainstJd } = require('../services/groqService');

const runAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId, jobDescriptionId, jobDescriptionText, customWeights } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'resumeId is required for ATS analysis.'
      });
    }

    let resume = prisma ? await prisma.resume.findFirst({ where: { id: resumeId, userId } }).catch(() => null) : null;
    if (!resume) {
      resume = inMemoryStore.resumes.find(r => r.id === resumeId && r.userId === userId);
    }
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Selected resume not found.'
      });
    }

    let jd = null;
    if (jobDescriptionId) {
      if (prisma) {
        jd = await prisma.jobDescription.findFirst({ where: { id: jobDescriptionId, userId } }).catch(() => null);
      }
      if (!jd) {
        jd = inMemoryStore.job_descriptions.find(j => j.id === jobDescriptionId && j.userId === userId);
      }
    }

    // Dynamic JD extraction using Groq AI when text is pasted/uploaded directly
    if (!jd && jobDescriptionText) {
      const extractedJd = await extractJdKeywordsAndSkills(jobDescriptionText);
      jd = {
        id: `jd_temp_${Date.now()}`,
        userId,
        title: extractedJd.title || 'Target Job Description',
        company: extractedJd.company || 'Target Employer',
        originalText: jobDescriptionText,
        extractedData: JSON.stringify(extractedJd)
      };
    }

    if (!jd) {
      return res.status(400).json({
        success: false,
        message: 'Valid jobDescriptionId or jobDescriptionText must be provided.'
      });
    }

    // Calculate base explainable rule-based ATS score
    let analysisResult = calculateAtsScore(resume, jd, customWeights);

    // Deep Groq AI comparison between Candidate Resume and Target Job Description
    const resumeText = resume.rawText || JSON.stringify(resume.parsedData);
    const jdText = jd.originalText || JSON.stringify(jd.extractedData);
    const aiAnalysis = await analyzeResumeAgainstJd(resumeText, jdText);

    if (aiAnalysis) {
      // Overwrite with exact Groq AI missing keywords & skills extracted from target JD
      if (aiAnalysis.missingSkills && aiAnalysis.missingSkills.length > 0) {
        analysisResult.missingSkills = aiAnalysis.missingSkills;
      }
      if (aiAnalysis.matchedSkills && aiAnalysis.matchedSkills.length > 0) {
        analysisResult.matchedSkills = aiAnalysis.matchedSkills;
      }
      if (aiAnalysis.missingKeywords && aiAnalysis.missingKeywords.length > 0) {
        analysisResult.missingKeywords = aiAnalysis.missingKeywords;
      }
      if (aiAnalysis.matchedKeywords && aiAnalysis.matchedKeywords.length > 0) {
        analysisResult.matchedKeywords = aiAnalysis.matchedKeywords;
      }
      if (aiAnalysis.weakAreas && aiAnalysis.weakAreas.length > 0) {
        analysisResult.weakAreas = aiAnalysis.weakAreas;
      }
      if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
        analysisResult.recommendations = aiAnalysis.recommendations;
      }
    }

    const analysisId = `ats_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const record = {
      id: analysisId,
      userId,
      resumeId: resume.id,
      jobDescriptionId: jd.id,
      score: analysisResult.score,
      skillMatchScore: analysisResult.skillMatchScore,
      keywordMatchScore: analysisResult.keywordMatchScore,
      experienceMatchScore: analysisResult.experienceMatchScore,
      educationMatchScore: analysisResult.educationMatchScore,
      completenessScore: analysisResult.completenessScore,
      formattingScore: analysisResult.formattingScore,
      matchedSkills: JSON.stringify(analysisResult.matchedSkills),
      missingSkills: JSON.stringify(analysisResult.missingSkills),
      missingKeywords: JSON.stringify(analysisResult.missingKeywords),
      weakAreas: JSON.stringify(analysisResult.weakAreas),
      recommendations: JSON.stringify(analysisResult.recommendations),
      createdAt: new Date()
    };

    if (prisma) {
      try {
        await prisma.atsAnalysis.create({ data: record });
      } catch (err) {
        console.warn('Analysis DB save fallback:', err.message);
        inMemoryStore.ats_analyses.push(record);
      }
    } else {
      inMemoryStore.ats_analyses.push(record);
    }

    res.status(201).json({
      success: true,
      message: 'ATS analysis completed successfully.',
      analysis: {
        id: analysisId,
        score: analysisResult.score,
        skillMatchScore: analysisResult.skillMatchScore,
        keywordMatchScore: analysisResult.keywordMatchScore,
        experienceMatchScore: analysisResult.experienceMatchScore,
        educationMatchScore: analysisResult.educationMatchScore,
        completenessScore: analysisResult.completenessScore,
        formattingScore: analysisResult.formattingScore,
        matchedSkills: analysisResult.matchedSkills,
        missingSkills: analysisResult.missingSkills,
        matchedKeywords: analysisResult.matchedKeywords,
        missingKeywords: analysisResult.missingKeywords,
        weakAreas: analysisResult.weakAreas,
        recommendations: analysisResult.recommendations,
        resume: { id: resume.id, title: resume.title },
        jobDescription: { id: jd.id, title: jd.title, company: jd.company }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let analysis = prisma ? await prisma.atsAnalysis.findFirst({
      where: { id, userId },
      include: { resume: true, jobDescription: true }
    }).catch(() => null) : null;

    if (!analysis) {
      analysis = inMemoryStore.ats_analyses.find(a => a.id === id && a.userId === userId);
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'ATS analysis not found.'
      });
    }

    res.json({
      success: true,
      analysis: {
        ...analysis,
        matchedSkills: typeof analysis.matchedSkills === 'string' ? JSON.parse(analysis.matchedSkills) : analysis.matchedSkills,
        missingSkills: typeof analysis.missingSkills === 'string' ? JSON.parse(analysis.missingSkills) : analysis.missingSkills,
        missingKeywords: typeof analysis.missingKeywords === 'string' ? JSON.parse(analysis.missingKeywords) : analysis.missingKeywords,
        weakAreas: typeof analysis.weakAreas === 'string' ? JSON.parse(analysis.weakAreas) : analysis.weakAreas,
        recommendations: typeof analysis.recommendations === 'string' ? JSON.parse(analysis.recommendations) : analysis.recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let list = prisma ? await prisma.atsAnalysis.findMany({
      where: { userId },
      include: { resume: true, jobDescription: true },
      orderBy: { createdAt: 'desc' }
    }).catch(() => null) : null;

    if (!list) {
      list = inMemoryStore.ats_analyses.filter(a => a.userId === userId);
    }

    const formatted = list.map(a => ({
      ...a,
      matchedSkills: typeof a.matchedSkills === 'string' ? JSON.parse(a.matchedSkills) : a.matchedSkills,
      missingSkills: typeof a.missingSkills === 'string' ? JSON.parse(a.missingSkills) : a.missingSkills,
      missingKeywords: typeof a.missingKeywords === 'string' ? JSON.parse(a.missingKeywords) : a.missingKeywords
    }));

    res.json({
      success: true,
      count: formatted.length,
      history: formatted
    });
  } catch (error) {
    next(error);
  }
};

const improveBulletPoint = async (req, res, next) => {
  try {
    const { bullet, style, targetKeywords } = req.body;
    if (!bullet) {
      return res.status(400).json({
        success: false,
        message: 'bullet text is required.'
      });
    }

    const result = await optimizeBulletPoint(bullet, style || 'ATS optimized', targetKeywords || []);
    res.json({
      success: true,
      optimization: result
    });
  } catch (error) {
    next(error);
  }
};

const generateOptimizedResumeController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId, jobDescriptionId, jobDescriptionText, versionLabel } = req.body;

    let resume = prisma ? await prisma.resume.findFirst({ where: { id: resumeId, userId } }).catch(() => null) : null;
    if (!resume) resume = inMemoryStore.resumes.find(r => r.id === resumeId && r.userId === userId);

    let jd = null;
    if (jobDescriptionId) {
      jd = prisma ? await prisma.jobDescription.findFirst({ where: { id: jobDescriptionId, userId } }).catch(() => null) : null;
      if (!jd) jd = inMemoryStore.job_descriptions.find(j => j.id === jobDescriptionId && j.userId === userId);
    }

    if (!jd && jobDescriptionText) {
      const extractedJd = await extractJdKeywordsAndSkills(jobDescriptionText);
      jd = {
        id: `jd_temp_${Date.now()}`,
        userId,
        title: extractedJd.title || 'Target Job Description',
        company: extractedJd.company || 'Target Employer',
        originalText: jobDescriptionText,
        extractedData: JSON.stringify(extractedJd)
      };
    }

    if (!resume || !jd) {
      return res.status(400).json({
        success: false,
        message: 'Valid resumeId and Job Description (text or selected JD) are required.'
      });
    }

    const parsedJd = typeof jd.extractedData === 'string' ? JSON.parse(jd.extractedData) : jd.extractedData;
    const missingKeywords = parsedJd.keywords || parsedJd.requiredSkills || ['Spring Boot', 'Docker', 'AWS'];

    const generatedContent = await generateOptimizedResume(resume, jd, missingKeywords);

    // Save as a new version
    let versions = inMemoryStore.resume_versions.filter(v => v.resumeId === resumeId);
    const nextVersionNum = versions.length + 1;

    const newVersion = {
      id: `ver_${Date.now()}_${nextVersionNum}`,
      resumeId: resume.id,
      versionNumber: nextVersionNum,
      label: versionLabel || `Optimized for ${jd.company || 'Job'} (${jd.title || 'Role'})`,
      targetRole: jd.title,
      content: JSON.stringify(generatedContent),
      atsScore: 92.0,
      createdAt: new Date()
    };

    if (prisma) {
      try {
        await prisma.resumeVersion.create({ data: newVersion });
      } catch (err) {
        console.warn('Prisma version create fallback:', err.message);
        inMemoryStore.resume_versions.push(newVersion);
      }
    } else {
      inMemoryStore.resume_versions.push(newVersion);
    }

    res.status(201).json({
      success: true,
      message: 'Optimized resume version generated successfully.',
      version: {
        ...newVersion,
        content: generatedContent
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runAnalysis,
  getAnalysisById,
  getAnalysisHistory,
  improveBulletPoint,
  generateOptimizedResumeController
};
