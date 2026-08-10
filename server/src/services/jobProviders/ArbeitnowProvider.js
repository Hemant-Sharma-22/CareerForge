const BaseJobProvider = require('./BaseJobProvider');

class ArbeitnowProvider extends BaseJobProvider {
  constructor() {
    super('Arbeitnow Jobs');
  }

  async searchJobs(query = '', filters = {}) {
    try {
      const url = `https://www.arbeitnow.com/api/job-board-api`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = await response.json();
      const rawJobs = data.data || [];

      let filtered = rawJobs;
      if (query) {
        const q = query.toLowerCase();
        filtered = rawJobs.filter(j => 
          (j.title && j.title.toLowerCase().includes(q)) ||
          (j.company_name && j.company_name.toLowerCase().includes(q))
        );
      }

      return filtered.slice(0, 10).map(job => this.normalizeJob(job));
    } catch (err) {
      console.warn('Arbeitnow API fetch error:', err.message);
      return [];
    }
  }

  normalizeJob(raw) {
    return {
      id: `arbeit_${raw.slug}`,
      externalId: `arbeit_${raw.slug}`,
      title: raw.title || 'Software Specialist',
      company: raw.company_name || 'Engineering Firm',
      location: raw.location || 'Hybrid / Europe',
      description: raw.description ? raw.description.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...' : '',
      skills: Array.isArray(raw.tags) ? raw.tags : ['Engineering', 'Technology'],
      experience: 'Standard',
      employmentType: raw.job_types ? raw.job_types.join(', ') : 'Full-time',
      remoteType: raw.remote ? 'Remote' : 'On-site',
      salary: 'Undisclosed',
      source: 'Arbeitnow Jobs',
      sourceUrl: raw.url || 'https://www.arbeitnow.com',
      postedAt: raw.created_at ? new Date(raw.created_at * 1000).toISOString() : new Date().toISOString(),
      applicationUrl: raw.url || 'https://www.arbeitnow.com'
    };
  }
}

module.exports = ArbeitnowProvider;
