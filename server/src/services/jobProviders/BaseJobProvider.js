class BaseJobProvider {
  constructor(name) {
    this.name = name;
  }

  async searchJobs(query = '', filters = {}) {
    throw new Error('searchJobs must be implemented by subclass');
  }

  normalizeJob(rawJob) {
    throw new Error('normalizeJob must be implemented by subclass');
  }
}

module.exports = BaseJobProvider;
