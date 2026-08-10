const RemotiveProvider = require('./jobProviders/RemotiveProvider');
const ArbeitnowProvider = require('./jobProviders/ArbeitnowProvider');
const JobicyProvider = require('./jobProviders/JobicyProvider');
const InstahyreProvider = require('./jobProviders/InstahyreProvider');
const InternshalaProvider = require('./jobProviders/InternshalaProvider');
const NaukriProvider = require('./jobProviders/NaukriProvider');

class JobService {
  constructor() {
    this.providers = [
      new InstahyreProvider(),
      new NaukriProvider(),
      new InternshalaProvider(),
      new RemotiveProvider(),
      new ArbeitnowProvider(),
      new JobicyProvider()
    ];

    this.jobCache = [];
    this.lastRefreshed = null;
    this.initDailyRefresh();
  }

  // Automatic daily background job feed refresher
  initDailyRefresh() {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    this.refreshAllFeeds();
    setInterval(() => {
      console.log('🔄 Executing automated daily job feed refresh...');
      this.refreshAllFeeds();
    }, TWENTY_FOUR_HOURS);
  }

  async refreshAllFeeds() {
    try {
      const defaultQueries = ['Software Engineer', 'Full Stack Developer', 'React Developer', 'Java Developer', 'Python Developer'];
      const fetchTasks = defaultQueries.map(q => this.fetchFromProviders(q));
      const results = await Promise.all(fetchTasks);
      const combined = results.flat();

      const seen = new Set();
      const unique = [];
      combined.forEach(j => {
        const key = `${j.title.toLowerCase().trim()}_${j.company.toLowerCase().trim()}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(j);
        }
      });

      this.jobCache = unique;
      this.lastRefreshed = new Date();
      console.log(`✅ Daily job refresh complete: Cached ${this.jobCache.length} real jobs across Instahyre, Naukri, Internshala, Remotive, Arbeitnow, Jobicy.`);
    } catch (err) {
      console.warn('Daily job refresh warning:', err.message);
    }
  }

  async fetchFromProviders(query = '', filters = {}) {
    const fetchPromises = this.providers.map(p => 
      p.searchJobs(query, filters).catch(err => {
        console.warn(`Job provider ${p.name} failed:`, err.message);
        return [];
      })
    );

    const resultsArray = await Promise.all(fetchPromises);
    return resultsArray.flat();
  }

  async searchAndMatchJobs(userProfile = {}, query = '', filters = {}) {
    let combined = [];

    if (!query || query.trim() === 'developer' || query.trim() === 'Software Engineer') {
      if (this.jobCache.length > 0) {
        combined = [...this.jobCache];
      } else {
        combined = await this.fetchFromProviders(query, filters);
      }
    } else {
      combined = await this.fetchFromProviders(query, filters);
    }

    if (filters.remoteType && filters.remoteType !== 'All') {
      combined = combined.filter(j => j.remoteType?.toLowerCase() === filters.remoteType.toLowerCase());
    }

    const seen = new Set();
    const uniqueJobs = [];

    combined.forEach(job => {
      const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueJobs.push(job);
      }
    });

    const candidateSkills = Array.isArray(userProfile.skills) 
      ? userProfile.skills 
      : (typeof userProfile.skills === 'string' ? JSON.parse(userProfile.skills || '[]') : []);

    const hasCandidateSkills = candidateSkills.length > 0;

    const matchedJobs = uniqueJobs.map(job => {
      const matchScore = this.calculateJobMatchScore(job, candidateSkills, userProfile);
      return {
        ...job,
        matchScore,
        hasCandidateSkills
      };
    });

    if (filters.sortBy === 'newest') {
      matchedJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    } else {
      matchedJobs.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
    }

    return matchedJobs;
  }

  calculateJobMatchScore(job, candidateSkills, userProfile = {}) {
    if (!candidateSkills || !candidateSkills.length) return null; // No fake 70% match when no resume/skills uploaded!
    if (!job.skills || !job.skills.length) return 50;

    const lowerCandidateSkills = candidateSkills.map(s => s.toLowerCase());
    let matchedCount = 0;

    job.skills.forEach(reqSkill => {
      if (lowerCandidateSkills.some(cs => cs.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cs))) {
        matchedCount++;
      }
    });

    const skillScore = Math.round((matchedCount / job.skills.length) * 100);
    return skillScore;
  }
}

module.exports = new JobService();
