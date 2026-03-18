/**
 * Simple test runner for bug condition exploration
 * This script can be run directly with Node.js to test the PDF processing bug
 */

const { TextExtractor } = require('./src/services/resumeUpload/textExtractor');
const { ResumeUploadService } = require('./src/services/resumeUpload/resumeUploadService');

async function runBugExplorationTest() {
  console.log('🔍 Running Bug Condition Exploration Test for PDF Processing');
  console.log('CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists\n');

  const textExtractor = new TextExtractor();
  const resumeUploadService = new ResumeUploadService();
  
  let counterexamplesFound = 0;
  let testsRun = 0;

  // Test cases that are likely to trigger pdf-parse issues
  const testCases = [
    {
      name: 'PDF with only header',
      buffer: Buffer.from('%PDF-1.4\n%%EOF'),
      fileName: 'minimal-resume.pdf'
    },
    {
      name: 'Invalid PDF data',
      buffer: Buffer.from('This is not a PDF file at all'),
      fileName: 'invalid-resume.pdf'
    },
    {
      name: 'Corrupted PDF',
      buffer: Buffer.concat([
        Buffer.from('%PDF-1.4\n'),
        Buffer.from([0xFF, 0xFE, 0xFD, 0xFC, 0x00, 0x01, 0x02, 0x03])
      ]),
      fileName: 'corrupted-resume.pdf'
    },
    {
      name: 'Large random data with PDF header',
      buffer: Buffer.concat([
        Buffer.from('%PDF-1.4\n'),
        Buffer.alloc(1000000, 0xFF) // 1MB of 0xFF bytes
      ]),
      fileName: 'large-corrupted-resume.pdf'
    },
    {
      name: 'Empty buffer',
      buffer: Buffer.alloc(0),
      fileName: 'empty-resume.pdf'
    }
  ];

  for (const testCase of testCases) {
    testsRun++;
    console.log(`\n📋 Test ${testsRun}: ${testCase.name}`);
    
    try {
      // Test direct text extraction
      console.log('  Testing text extraction...');
      const extractionResult = await textExtractor.extractText(testCase.buffer, 'pdf');
      console.log(`  ✅ Text extraction succeeded: "${extractionResult.text.substring(0, 50)}..."`);
      
      // Test full upload flow
      console.log('  Testing full upload flow...');
      const uploadResult = await resumeUploadService.uploadResume(
        testCase.buffer,
        testCase.fileName,
        'test-user-id'
      );
      
      if (uploadResult.success) {
        console.log(`  ✅ Upload succeeded: resumeId=${uploadResult.resumeId}`);
      } else {
        console.log(`  ⚠️  Upload failed with error: ${uploadResult.error?.message}`);
        
        // Check if error is generic "failed to process"
        if (uploadResult.error?.message?.toLowerCase().includes('failed to process')) {
          console.log(`  🚨 COUNTEREXAMPLE FOUND: Generic "failed to process" error`);
          counterexamplesFound++;
        }
      }
      
    } catch (error) {
      // CRITICAL: This catch block should NOT be reached in fixed code
      console.log(`  🚨 COUNTEREXAMPLE FOUND: Unhandled error thrown`);
      console.log(`     Error: ${error.message}`);
      console.log(`     This confirms the bug exists - unhandled errors propagate up`);
      counterexamplesFound++;
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`   Tests run: ${testsRun}`);
  console.log(`   Counterexamples found: ${counterexamplesFound}`);
  
  if (counterexamplesFound > 0) {
    console.log('\n🎯 EXPECTED OUTCOME ACHIEVED: Test FAILED (this is correct!)');
    console.log('   The test failures confirm that the bug exists in the unfixed code.');
    console.log('   Counterexamples demonstrate PDF processing issues that need to be fixed.');
    console.log('\n📝 Root Cause Analysis:');
    console.log('   - Unhandled errors in pdf-parse module propagate up');
    console.log('   - No graceful error handling for problematic PDF files');
    console.log('   - Generic "failed to process" errors provide no actionable feedback');
    
    return false; // Test failed as expected
  } else {
    console.log('\n⚠️  UNEXPECTED OUTCOME: Test PASSED');
    console.log('   This suggests the bug may not exist or the test needs adjustment.');
    console.log('   The code may already have fixes in place.');
    
    return true; // Test passed unexpectedly
  }
}

// Run the test
runBugExplorationTest()
  .then(passed => {
    if (!passed) {
      console.log('\n✅ Bug condition exploration completed successfully');
      console.log('   Ready to proceed with implementing the fix');
      process.exit(0);
    } else {
      console.log('\n❓ Unexpected test results - may need investigation');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test runner failed:', error.message);
    console.error('   This may indicate environment setup issues');
    process.exit(1);
  });