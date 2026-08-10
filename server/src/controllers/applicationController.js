const { prisma, inMemoryStore } = require('../config/prisma');

const createApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { company, title, jobId, status, notes, applicationUrl } = req.body;

    if (!company || !title) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job title are required.'
      });
    }

    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newApp = {
      id: appId,
      userId,
      jobId: jobId || null,
      company,
      title,
      status: status || 'Applied',
      appliedAt: new Date(),
      notes: notes || '',
      applicationUrl: applicationUrl || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (prisma) {
      try {
        await prisma.jobApplication.create({ data: newApp });
      } catch (err) {
        console.warn('Prisma application save fallback:', err.message);
        inMemoryStore.job_applications.push(newApp);
      }
    } else {
      inMemoryStore.job_applications.push(newApp);
    }

    res.status(201).json({
      success: true,
      message: 'Job application tracked successfully.',
      application: newApp
    });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let list = prisma ? await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    }).catch(() => null) : null;

    if (!list) {
      list = inMemoryStore.job_applications.filter(a => a.userId === userId);
    }

    res.json({
      success: true,
      count: list.length,
      applications: list
    });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, notes } = req.body;

    let updated;
    if (prisma) {
      try {
        updated = await prisma.jobApplication.updateMany({
          where: { id, userId },
          data: { status, notes, updatedAt: new Date() }
        });
      } catch (err) {
        console.warn('Prisma update application fallback:', err.message);
      }
    }

    let app = inMemoryStore.job_applications.find(a => a.id === id && a.userId === userId);
    if (app) {
      if (status) app.status = status;
      if (notes !== undefined) app.notes = notes;
      app.updatedAt = new Date();
      updated = app;
    }

    res.json({
      success: true,
      message: 'Application status updated.',
      application: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (prisma) {
      try {
        await prisma.jobApplication.deleteMany({ where: { id, userId } });
      } catch (err) {
        console.warn('Delete application fallback:', err.message);
      }
    }

    const index = inMemoryStore.job_applications.findIndex(a => a.id === id && a.userId === userId);
    if (index !== -1) inMemoryStore.job_applications.splice(index, 1);

    res.json({
      success: true,
      message: 'Application record deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication
};
