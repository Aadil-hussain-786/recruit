// Simple test runner that uses ts-node to execute TypeScript
const { execSync } = require('child_process');
const path = require('path');

console.log('Running resume format tests...\n');

try {
    // Run the TypeScript test file using ts-node
    const result = execSync('npx ts-node tests/resumeFormatTests.ts', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        encoding: 'utf-8'
    });
    console.log(result);
} catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
}
