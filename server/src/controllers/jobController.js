const jobService = require('../services/JobService');
const { prisma, inMemoryStore } = require('../config/prisma');

const searchJobs = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { query, remoteType, location, experience, sortBy, forceRefresh } = req.body;

    let userProfile = {};
    let savedJobIds = [];

    if (userId) {
      const p = prisma ? await prisma.userProfile.findUnique({ where: { userId } }).catch(() => null) : null;
      userProfile = p || inMemoryStore.user_profiles.find(prof => prof.userId === userId) || {};

      const saved = prisma ? await prisma.savedJob.findMany({ where: { userId } }).catch(() => null) : null;
      savedJobIds = (saved ? saved.map(s => s.jobId) : null) || inMemoryStore.saved_jobs.filter(s => s.userId === userId).map(s => s.jobId);
    }

    const filters = { remoteType, location, experience, sortBy };
    const rawJobs = await jobService.searchAndMatchJobs(userProfile, query, filters, forceRefresh);

    const jobs = rawJobs.map(job => ({
      ...job,
      isSaved: savedJobIds.includes(job.id)
    }));

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

const saveJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const jobData = req.body.job || {};
    const cleanJobId = decodeURIComponent(id);

    let savedRecord = {
      id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      jobId: cleanJobId,
      savedAt: new Date(),
      job: {
        id: cleanJobId,
        title: jobData.title || 'Software Engineer',
        company: jobData.company || 'Tech Org',
        location: jobData.location || 'Remote',
        description: jobData.description || '',
        skills: jobData.skills || [],
        remoteType: jobData.remoteType || 'Remote',
        salary: jobData.salary || 'Competitive Pay',
        applicationUrl: jobData.applicationUrl || '#',
        matchScore: jobData.matchScore || null
      }
    };

    // Store in memory store
    const existingIndex = inMemoryStore.saved_jobs.findIndex(s => s.userId === userId && s.jobId === cleanJobId);
    if (existingIndex === -1) {
      inMemoryStore.saved_jobs.push(savedRecord);
    }

    if (prisma) {
      try {
        await prisma.jobListing.upsert({
          where: { externalId: cleanJobId },
          update: {},
          create: {
            id: cleanJobId,
            externalId: cleanJobId,
            title: jobData.title || 'Software Developer',
            company: jobData.company || 'Tech Org',
            location: jobData.location || 'Remote',
            description: jobData.description || '',
            skills: JSON.stringify(jobData.skills || []),
            experience: jobData.experience || '',
            employmentType: jobData.employmentType || 'Full-time',
            remoteType: jobData.remoteType || 'Remote',
            salary: jobData.salary || '',
            source: jobData.source || 'Aggregator',
            sourceUrl: jobData.sourceUrl || '#',
            applicationUrl: jobData.applicationUrl || '#'
          }
        });

        await prisma.savedJob.create({ 
          data: {
            id: savedRecord.id,
            userId,
            jobId: cleanJobId,
            savedAt: savedRecord.savedAt
          }
        }).catch(() => null);
      } catch (err) {
        console.warn('Prisma save job fallback:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      saved: true,
      message: 'Job bookmarked successfully.',
      savedJob: savedRecord
    });
  } catch (error) {
    next(error);
  }
};

const unsaveJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const cleanJobId = decodeURIComponent(id);

    if (prisma) {
      try {
        await prisma.savedJob.deleteMany({ where: { userId, jobId: cleanJobId } });
      } catch (err) {
        console.warn('Prisma unsave job fallback:', err.message);
      }
    }

    inMemoryStore.saved_jobs = inMemoryStore.saved_jobs.filter(s => !(s.userId === userId && s.jobId === cleanJobId));

    res.json({
      success: true,
      saved: false,
      message: 'Job removed from bookmarks.'
    });
  } catch (error) {
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let list = prisma ? await prisma.savedJob.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { savedAt: 'desc' }
    }).catch(() => null) : null;

    if (!list || list.length === 0) {
      list = inMemoryStore.saved_jobs.filter(s => s.userId === userId);
    }

    // Format list objects so full job details are available
    const formattedList = list.map(item => {
      const jobData = item.job || {};
      const parsedSkills = typeof jobData.skills === 'string' ? JSON.parse(jobData.skills || '[]') : (jobData.skills || []);
      return {
        ...item,
        job: {
          id: item.jobId || jobData.id,
          title: jobData.title || 'Software Developer',
          company: jobData.company || 'Tech Org',
          location: jobData.location || 'Remote',
          description: jobData.description || '',
          skills: parsedSkills,
          remoteType: jobData.remoteType || 'Remote',
          salary: jobData.salary || 'Competitive Pay',
          applicationUrl: jobData.applicationUrl || jobData.sourceUrl || '#',
          matchScore: jobData.matchScore || null,
          isSaved: true
        }
      };
    });

    res.json({
      success: true,
      count: formattedList.length,
      savedJobs: formattedList
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
};
