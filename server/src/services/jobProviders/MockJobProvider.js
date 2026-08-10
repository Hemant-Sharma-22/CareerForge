const BaseJobProvider = require('./BaseJobProvider');

class MockJobProvider extends BaseJobProvider {
  constructor() {
    super('CareerForge Tech Feed');
    this.jobs = [
      {
        id: 'mock_1',
        title: 'Senior Full Stack Engineer',
        company: 'Stripe Technologies',
        location: 'Bangalore, India | Hybrid',
        description: 'Building high-scale payments APIs and web application portals using Node.js, Express, React, TypeScript, and PostgreSQL.',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQL', 'PostgreSQL', 'REST API', 'Docker'],
        experience: '3-5 years',
        employmentType: 'Full-time',
        remoteType: 'Hybrid',
        salary: '$120,000 - $150,000',
        source: 'Stripe Careers',
        sourceUrl: 'https://stripe.com/jobs',
        postedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        applicationUrl: 'https://stripe.com/jobs/apply/senior-fullstack-dev'
      },
      {
        id: 'mock_2',
        title: 'Frontend React Developer',
        company: 'Vercel Labs',
        location: 'Remote',
        description: 'Architecting modern frontend user interfaces with Next.js, React, Tailwind CSS, and Web Vitals optimization.',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'JavaScript', 'HTML5', 'Git'],
        experience: '2-4 years',
        employmentType: 'Full-time',
        remoteType: 'Remote',
        salary: '$100,000 - $130,000',
        source: 'Vercel Careers',
        sourceUrl: 'https://vercel.com/careers',
        postedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        applicationUrl: 'https://vercel.com/careers/frontend-engineer'
      },
      {
        id: 'mock_3',
        title: 'Backend Node.js API Engineer',
        company: 'Razorpay',
        location: 'Bangalore, India | Hybrid',
        description: 'Designing resilient microservices, payment gateways, and backend RESTful APIs with Node.js, Express, Redis, and MySQL.',
        skills: ['Node.js', 'Express', 'JavaScript', 'SQL', 'Redis', 'Microservices', 'REST API', 'Jest'],
        experience: '2-5 years',
        employmentType: 'Full-time',
        remoteType: 'Hybrid',
        salary: '₹18,00,000 - ₹28,00,000',
        source: 'Razorpay Jobs',
        sourceUrl: 'https://razorpay.com/jobs',
        postedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        applicationUrl: 'https://razorpay.com/jobs/backend-engineer'
      },
      {
        id: 'mock_4',
        title: 'Full Stack Software Engineer',
        company: 'Atlassian',
        location: 'Bengaluru / Remote',
        description: 'Creating cloud collaboration tools using React, TypeScript, Java, Spring Boot, and AWS cloud infrastructure.',
        skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'AWS', 'Microservices', 'REST API', 'Git'],
        experience: '1-3 years',
        employmentType: 'Full-time',
        remoteType: 'Remote',
        salary: '₹22,00,000 - ₹32,00,000',
        source: 'Atlassian Careers',
        sourceUrl: 'https://atlassian.com/careers',
        postedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        applicationUrl: 'https://atlassian.com/careers/sde-2'
      },
      {
        id: 'mock_5',
        title: 'Junior Software Engineer (Fresher)',
        company: 'TechCorp Solutions',
        location: 'Hyderabad, India | On-site',
        description: 'Great opportunity for entry-level developers to build web services, write unit tests, and work on modern stack.',
        skills: ['JavaScript', 'HTML', 'CSS', 'React', 'SQL', 'Git'],
        experience: '0-1 years',
        employmentType: 'Full-time',
        remoteType: 'On-site',
        salary: '₹6,00,000 - ₹9,00,000',
        source: 'TechCorp Campus',
        sourceUrl: 'https://techcorp.com/careers',
        postedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        applicationUrl: 'https://techcorp.com/careers/entry-level-sde'
      }
    ];
  }

  async searchJobs(query = '', filters = {}) {
    let filtered = [...this.jobs];

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (filters.remoteType && filters.remoteType !== 'All') {
      filtered = filtered.filter(j => j.remoteType.toLowerCase() === filters.remoteType.toLowerCase());
    }

    return filtered.map(j => this.normalizeJob(j));
  }

  normalizeJob(job) {
    return {
      id: job.id,
      externalId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      skills: job.skills,
      experience: job.experience,
      employmentType: job.employmentType,
      remoteType: job.remoteType,
      salary: job.salary,
      source: job.source,
      sourceUrl: job.sourceUrl,
      postedAt: job.postedAt,
      applicationUrl: job.applicationUrl
    };
  }
}

module.exports = MockJobProvider;
