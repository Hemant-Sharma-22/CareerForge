const BaseJobProvider = require('./BaseJobProvider');

class RemotiveProvider extends BaseJobProvider {
  constructor() {
    super('Remotive Jobs');
  }

  async searchJobs(query = '', filters = {}) {
    try {
      const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query || 'developer')}&limit=10`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = await response.json();
      const rawJobs = data.jobs || [];

      return rawJobs.map(job => this.normalizeJob(job));
    } catch (err) {
      console.warn('Remotive API fetch error:', err.message);
      return [];
    }
  }

  normalizeJob(raw) {
    return {
      id: `remotive_${raw.id}`,
      externalId: `remotive_${raw.id}`,
      title: raw.title || 'Software Developer',
      company: raw.company_name || 'Tech Organization',
      location: raw.candidate_required_location || 'Remote',
      description: raw.description ? raw.description.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...' : '',
      skills: Array.isArray(raw.tags) ? raw.tags : ['Software', 'Remote'],
      experience: 'Mid-Senior',
      employmentType: raw.job_type || 'Full-time',
      remoteType: 'Remote',
      salary: raw.salary || 'Competitive',
      source: 'Remotive API',
      sourceUrl: raw.url || 'https://remotive.com',
      postedAt: raw.publication_date || new Date().toISOString(),
      applicationUrl: raw.url || 'https://remotive.com'
    };
  }
}

module.exports = RemotiveProvider;
