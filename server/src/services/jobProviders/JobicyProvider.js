const BaseJobProvider = require('./BaseJobProvider');

class JobicyProvider extends BaseJobProvider {
  constructor() {
    super('Jobicy Remote Jobs');
  }

  async searchJobs(query = '', filters = {}) {
    try {
      const url = `https://jobicy.com/api/v2/remote-jobs?count=15&tag=${encodeURIComponent(query || 'dev')}`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = await response.json();
      const rawJobs = data.jobs || [];

      return rawJobs.map(job => this.normalizeJob(job));
    } catch (err) {
      console.warn('Jobicy API fetch error:', err.message);
      return [];
    }
  }

  normalizeJob(raw) {
    return {
      id: `jobicy_${raw.id || Math.random().toString(36).substr(2, 6)}`,
      externalId: `jobicy_${raw.id || Math.random().toString(36).substr(2, 6)}`,
      title: raw.jobTitle || 'Software Engineer',
      company: raw.companyName || 'Global Tech',
      location: raw.jobGeo || 'Remote',
      description: raw.jobExcerpt ? raw.jobExcerpt.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...' : 'Remote software opportunity.',
      skills: Array.isArray(raw.jobIndustry) ? raw.jobIndustry : (raw.jobType ? [raw.jobType] : ['Software', 'Engineering']),
      experience: raw.jobLevel || 'Mid',
      employmentType: raw.jobType || 'Full-Time',
      remoteType: 'Remote',
      salary: raw.annualSalaryMin ? `$${raw.annualSalaryMin} - $${raw.annualSalaryMax}` : 'Competitive',
      source: 'Jobicy API',
      sourceUrl: raw.url || 'https://jobicy.com',
      postedAt: raw.pubDate || new Date().toISOString(),
      applicationUrl: raw.url || 'https://jobicy.com'
    };
  }
}

module.exports = JobicyProvider;
