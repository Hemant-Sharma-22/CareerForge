const assert = require('assert');
const { calculateAtsScore } = require('../src/services/atsScoringEngine');

function testAtsScoring() {
  console.log('Testing ATS Scoring Engine...');

  const mockResume = {
    rawText: 'Candidate with React, Node.js, Express, JavaScript, SQL, REST API experience. Bachelor degree in CS.',
    parsedData: {
      summary: 'Experienced Full Stack Engineer with React and Node.js',
      skills: ['React', 'Node.js', 'Express', 'JavaScript', 'SQL', 'REST API'],
      experience: [
        { role: 'Software Engineer', highlights: ['Built RESTful APIs using Node.js and Express'] }
      ],
      education: [{ degree: 'B.Tech CS' }]
    }
  };

  const mockJd = {
    originalText: 'Looking for Software Engineer with React, Node.js, Express, SQL, Spring Boot, Docker.',
    extractedData: {
      requiredSkills: ['React', 'Node.js', 'Express', 'SQL'],
      preferredSkills: ['Spring Boot', 'Docker'],
      keywords: ['REST API', 'Scalability', 'Git'],
      experienceRequirements: '2+ years'
    }
  };

  const result = calculateAtsScore(mockResume, mockJd);

  assert.strictEqual(typeof result.score, 'number');
  assert(result.score > 0 && result.score <= 100, 'Score must be between 1 and 100');
  assert(result.matchedSkills.includes('React'), 'Matched skills must include React');
  assert(result.missingSkills.includes('Spring Boot') || result.missingSkills.includes('Docker'), 'Missing skills must be detected');

  console.log(`✅ ATS Scoring Engine Test PASSED! Test Score Output: ${result.score}/100`);
}

module.exports = testAtsScoring;

if (require.main === module) {
  testAtsScoring();
}
