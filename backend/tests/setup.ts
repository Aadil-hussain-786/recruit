// Jest setup file for resume upload tests

// Increase timeout for property-based tests
jest.setTimeout(60000);

// Mock console methods to reduce noise during testing
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Only show console output for counterexamples and important messages
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Counterexample') || message.includes('CRITICAL')) {
      originalConsoleLog(...args);
    }
  };
  
  console.error = (...args: any[]) => {
    originalConsoleError(...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});