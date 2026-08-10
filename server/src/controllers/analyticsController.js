const { prisma, inMemoryStore } = require('../config/prisma');

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user analyses from DB & Memory store
    let dbAnalyses = prisma ? await prisma.atsAnalysis.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'asc' } 
    }).catch(() => null) : null;

    let memAnalyses = inMemoryStore.ats_analyses.filter(a => a.userId === userId);

    let analyses = [];
    if (dbAnalyses && dbAnalyses.length > 0) {
      const dbIds = new Set(dbAnalyses.map(a => a.id));
      analyses = [...dbAnalyses];
      memAnalyses.forEach(ma => {
        if (!dbIds.has(ma.id)) analyses.push(ma);
      });
    } else {
      analyses = memAnalyses;
    }

    // Fetch applications
    let dbApplications = prisma ? await prisma.jobApplication.findMany({ where: { userId } }).catch(() => null) : null;
    let memApplications = inMemoryStore.job_applications.filter(a => a.userId === userId);
    let applications = (dbApplications && dbApplications.length > 0) ? dbApplications : memApplications;

    // Fetch saved jobs
    let dbSaved = prisma ? await prisma.savedJob.findMany({ where: { userId } }).catch(() => null) : null;
    let memSaved = inMemoryStore.saved_jobs.filter(s => s.userId === userId);
    let savedJobs = (dbSaved && dbSaved.length > 0) ? dbSaved : memSaved;

    // Fetch resumes
    let dbResumes = prisma ? await prisma.resume.findMany({ where: { userId } }).catch(() => null) : null;
    let memResumes = inMemoryStore.resumes.filter(r => r.userId === userId);
    let resumes = (dbResumes && dbResumes.length > 0) ? dbResumes : memResumes;

    // Calculate real metrics
    const totalAnalyses = analyses.length;
    const avgAtsScore = totalAnalyses > 0
      ? Math.round(analyses.reduce((acc, a) => acc + (a.score || 0), 0) / totalAnalyses)
      : 0;

    const totalApplications = applications.length;
    const interviewCount = applications.filter(a => a.status === 'Interview' || a.status === 'Offer').length;
    const interviewConversion = totalApplications > 0
      ? Math.round((interviewCount / totalApplications) * 100)
      : 0;

    // Real common missing skills aggregation from candidate ATS analyses
    const missingSkillsFreq = {};
    analyses.forEach(a => {
      const skills = typeof a.missingSkills === 'string' ? JSON.parse(a.missingSkills) : (a.missingSkills || []);
      skills.forEach(s => {
        missingSkillsFreq[s] = (missingSkillsFreq[s] || 0) + 1;
      });
    });

    const topMissingSkills = Object.keys(missingSkillsFreq)
      .map(skill => ({ skill, count: missingSkillsFreq[skill] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Real score over time trend calculated directly from candidate ATS analysis history
    const scoreTrend = analyses
      .map(a => ({
        id: a.id,
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        score: Math.round(a.score || 0)
      }));

    res.json({
      success: true,
      metrics: {
        totalAnalyses,
        avgAtsScore,
        totalResumes: resumes.length,
        totalApplications,
        savedJobsCount: savedJobs.length,
        interviewCount,
        interviewConversion: `${interviewConversion}%`,
        topMissingSkills,
        scoreTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
