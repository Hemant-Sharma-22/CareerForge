const path = require('path');
const fs = require('fs');
const { prisma, inMemoryStore } = require('../config/prisma');
const { extractTextFromFile, parseResumeText } = require('../services/resumeParserService');

const uploadResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded.'
      });
    }

    const { originalname, filename, path: filePath, mimetype } = req.file;
    const rawText = await extractTextFromFile(filePath, mimetype);
    const parsedData = parseResumeText(rawText);

    const resumeId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const title = req.body.title || originalname.replace(/\.[^/.]+$/, '');

    const newResume = {
      id: resumeId,
      userId,
      title,
      isDefault: true,
      originalFileName: originalname,
      fileUrl: `/uploads/${filename}`,
      rawText,
      parsedData: JSON.stringify(parsedData),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const initialVersion = {
      id: `ver_${Date.now()}_1`,
      resumeId,
      versionNumber: 1,
      label: 'Original Upload (v1)',
      targetRole: 'General Profile',
      content: JSON.stringify(parsedData),
      atsScore: 75.0,
      createdAt: new Date()
    };

    // Always keep memory store updated for zero-latency UI fallback
    inMemoryStore.resumes.forEach(r => { if (r.userId === userId) r.isDefault = false; });
    inMemoryStore.resumes.unshift(newResume);
    inMemoryStore.resume_versions.unshift(initialVersion);

    if (prisma) {
      try {
        await prisma.resume.updateMany({
          where: { userId },
          data: { isDefault: false }
        });

        await prisma.resume.create({
          data: {
            ...newResume,
            versions: {
              create: initialVersion
            }
          }
        });
      } catch (err) {
        console.warn('Prisma resume create fallback:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      resume: {
        ...newResume,
        parsedData,
        versions: [initialVersion]
      }
    });
  } catch (error) {
    next(error);
  }
};

const getResumes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let dbResumes = prisma ? await prisma.resume.findMany({
      where: { userId },
      include: { versions: true },
      orderBy: { updatedAt: 'desc' }
    }).catch(() => null) : null;

    let memResumes = inMemoryStore.resumes.filter(r => r.userId === userId).map(r => ({
      ...r,
      parsedData: typeof r.parsedData === 'string' ? JSON.parse(r.parsedData) : r.parsedData,
      versions: inMemoryStore.resume_versions.filter(v => v.resumeId === r.id)
    }));

    let combined = [];
    if (dbResumes && dbResumes.length > 0) {
      const dbIds = new Set(dbResumes.map(r => r.id));
      const formattedDb = dbResumes.map(r => ({
        ...r,
        parsedData: typeof r.parsedData === 'string' ? JSON.parse(r.parsedData) : r.parsedData
      }));
      combined = [...formattedDb];
      memResumes.forEach(mr => {
        if (!dbIds.has(mr.id)) combined.push(mr);
      });
    } else {
      combined = memResumes;
    }

    res.json({
      success: true,
      count: combined.length,
      resumes: combined
    });
  } catch (error) {
    next(error);
  }
};

const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let resume = prisma ? await prisma.resume.findFirst({
      where: { id, userId },
      include: { versions: { orderBy: { versionNumber: 'desc' } } }
    }).catch(() => null) : null;

    if (!resume) {
      const found = inMemoryStore.resumes.find(r => r.id === id && r.userId === userId);
      if (found) {
        resume = {
          ...found,
          parsedData: typeof found.parsedData === 'string' ? JSON.parse(found.parsedData) : found.parsedData,
          versions: inMemoryStore.resume_versions.filter(v => v.resumeId === id)
        };
      }
    } else {
      resume.parsedData = typeof resume.parsedData === 'string' ? JSON.parse(resume.parsedData) : resume.parsedData;
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    res.json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (prisma) {
      try {
        await prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } });
        await prisma.resume.update({ where: { id }, data: { isDefault: true } });
      } catch (err) {
        console.warn('Set default fallback:', err.message);
      }
    }

    inMemoryStore.resumes.forEach(r => {
      if (r.userId === userId) r.isDefault = (r.id === id);
    });

    res.json({
      success: true,
      message: 'Default resume updated.'
    });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (prisma) {
      try {
        await prisma.resume.deleteMany({ where: { id, userId } });
      } catch (err) {
        console.warn('Delete resume fallback:', err.message);
      }
    }

    const index = inMemoryStore.resumes.findIndex(r => r.id === id && r.userId === userId);
    if (index !== -1) {
      inMemoryStore.resumes.splice(index, 1);
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const createVersion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, targetRole, content, atsScore } = req.body;

    let versions = prisma ? await prisma.resumeVersion.findMany({ where: { resumeId: id } }).catch(() => []) : [];
    if (!versions.length) {
      versions = inMemoryStore.resume_versions.filter(v => v.resumeId === id);
    }

    const nextVersionNum = versions.length + 1;
    const newVersion = {
      id: `ver_${Date.now()}_${nextVersionNum}`,
      resumeId: id,
      versionNumber: nextVersionNum,
      label: label || `Optimized Version v${nextVersionNum}`,
      targetRole: targetRole || 'Custom Role',
      content: typeof content === 'object' ? JSON.stringify(content) : content,
      atsScore: atsScore || 85.0,
      createdAt: new Date()
    };

    if (prisma) {
      try {
        await prisma.resumeVersion.create({ data: newVersion });
      } catch (err) {
        console.warn('Create version fallback:', err.message);
        inMemoryStore.resume_versions.push(newVersion);
      }
    } else {
      inMemoryStore.resume_versions.push(newVersion);
    }

    res.status(201).json({
      success: true,
      message: 'New resume version created.',
      version: newVersion
    });
  } catch (error) {
    next(error);
  }
};

const compareVersions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { version1Id, version2Id } = req.query;

    let versions = inMemoryStore.resume_versions.filter(v => v.resumeId === id);
    if (prisma) {
      try {
        const fetched = await prisma.resumeVersion.findMany({ where: { resumeId: id } });
        if (fetched.length) versions = fetched;
      } catch (err) {
        console.warn('Compare version fallback:', err.message);
      }
    }

    const v1 = versions.find(v => v.id === version1Id) || versions[0];
    const v2 = versions.find(v => v.id === version2Id) || versions[versions.length - 1];

    res.json({
      success: true,
      comparison: {
        version1: v1 ? { ...v1, content: typeof v1.content === 'string' ? JSON.parse(v1.content) : v1.content } : null,
        version2: v2 ? { ...v2, content: typeof v2.content === 'string' ? JSON.parse(v2.content) : v2.content } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  setDefaultResume,
  deleteResume,
  createVersion,
  compareVersions
};
