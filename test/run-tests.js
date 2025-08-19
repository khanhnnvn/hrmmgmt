import AutomatedTester from './automated-test.js';

// Wait for server to start before running tests
function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkServer() {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Server not ready after ${timeout}ms`));
          } else {
            setTimeout(checkServer, 1000);
          }
        });
    }
    
    checkServer();
  });
}

async function runTests() {
  console.log('🚀 Starting HRM System Automated Testing...\n');
  
  const tester = new AutomatedTester();
  
  try {
    console.log('⏳ Waiting for server to start...');
    await waitForServer('http://localhost:3001/api/dashboard/stats');
    console.log('✅ Server is ready!\n');
    
    const report = await tester.runAllTests();
    
    console.log('\n📊 Final Test Results:');
    console.log('========================');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📈 Pass Rate: ${report.summary.passRate}`);
    
    if (report.summary.failed === 0) {
      console.log('\n🎉 All tests passed! System is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the detailed report for more information.');
      console.log('Failed tests:');
      report.results
        .filter(r => r.status === 'failed')
        .forEach(test => {
          console.log(`  - ${test.test}: ${test.error}`);
        });
    }
    
  } catch (error) {
    console.error('\n💥 Testing failed with fatal error:', error.message);
    process.exit(1);
  }
}

runTests();