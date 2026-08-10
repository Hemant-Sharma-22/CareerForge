const testAtsScoring = require('./atsScoring.test');

console.log('----------------------------------------------------');
console.log('Running CareerForge Automated Unit & Verification Tests');
console.log('----------------------------------------------------');

try {
  testAtsScoring();
  console.log('----------------------------------------------------');
  console.log('🎉 ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!');
  console.log('----------------------------------------------------');
} catch (err) {
  console.error('❌ Test Failure:', err.message);
  process.exit(1);
}
