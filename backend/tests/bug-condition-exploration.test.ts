/**
 * Bug Condition Exploration Test for PDF Processing Failure
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * GOAL: Surface counterexamples that demonstrate the bug exists
 */

import * as fc from 'fast-check';
import { TextExtractor } from '../src/services/resumeUpload/textExtractor';
import { ResumeUploadService } from '../src/services/resumeUpload/resumeUploadService';

describe('Bug Condition Exploration: PDF Processing Failure Detection', () => {
  let textExtractor: TextExtractor;
  let resumeUploadService: ResumeUploadService;

  beforeEach(() => {
    textExtractor = new TextExtractor();
    resumeUploadService = new ResumeUploadService();
  });

  /**
   * Property 1: Bug Condition - PDF Processing Failure Detection
   * 
   * This property tests that PDF files with parsing issues either:
   * 1. Are handled gracefully with meaningful error messages, OR
   * 2. Successfully extract text
   * 
   * The test should FAIL on unfixed code because the current implementation
   * throws unhandled errors that propagate up and cause "failed to process" errors.
   */
  test('Property 1: PDF files with parsing issues should be handled gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for PDF files that are likely to trigger pdf-parse issues
        fc.oneof(
          // Complex PDF with potential parsing issues
          fc.record({
            type: fc.constant('complex'),
            buffer: fc.uint8Array({ minLength: 1000, maxLength: 10000 }),
            fileName: fc.constant('complex-resume.pdf')
          }),
          // Large PDF that might cause memory issues
          fc.record({
            type: fc.constant('large'),
            buffer: fc.uint8Array({ minLength: 5000000, maxLength: 6000000 }), // 5-6MB
            fileName: fc.constant('large-resume.pdf')
          }),
          // Corrupted PDF-like data
          fc.record({
            type: fc.constant('corrupted'),
            buffer: fc.uint8Array({ minLength: 100, maxLength: 1000 }).map(arr => {
              // Add PDF header to make it look like a PDF but with corrupted content
              const pdfHeader = Buffer.from('%PDF-1.4\n');
              const corruptedContent = Buffer.from(arr);
              return Buffer.concat([pdfHeader, corruptedContent]);
            }),
            fileName: fc.constant('corrupted-resume.pdf')
          }),
          // Empty or minimal PDF-like data
          fc.record({
            type: fc.constant('minimal'),
            buffer: fc.constant(Buffer.from('%PDF-1.4\n%%EOF')),
            fileName: fc.constant('minimal-resume.pdf')
          })
        ),
        async (pdfData) => {
          try {
            // Test direct text extraction
            const extractionResult = await textExtractor.extractText(pdfData.buffer, 'pdf');
            
            // If extraction succeeds, it should return valid text or empty string
            expect(typeof extractionResult.text).toBe('string');
            expect(extractionResult.wordCount).toBeGreaterThanOrEqual(0);
            
            // Test full upload flow
            const uploadResult = await resumeUploadService.uploadResume(
              pdfData.buffer,
              pdfData.fileName,
              'test-user-id'
            );
            
            if (uploadResult.success) {
              // If upload succeeds, resume should be created
              expect(uploadResult.resumeId).toBeTruthy();
              expect(uploadResult.sessionId).toBeTruthy();
            } else {
              // If upload fails, error should be meaningful and specific
              expect(uploadResult.error).toBeDefined();
              expect(uploadResult.error!.code).toBeDefined();
              expect(uploadResult.error!.message).toBeDefined();
              
              // Error should NOT be generic "failed to process"
              expect(uploadResult.error!.message).not.toMatch(/failed to process/i);
              
              // Error should provide actionable feedback
              expect(uploadResult.error!.message.length).toBeGreaterThan(10);
            }
            
          } catch (error: any) {
            // CRITICAL: This catch block should NOT be reached in fixed code
            // If we reach here, it means unhandled errors are propagating up
            // This is the bug condition we're trying to detect
            
            console.log(`Counterexample found for ${pdfData.type} PDF:`, {
              fileName: pdfData.fileName,
              bufferSize: pdfData.buffer.length,
              errorMessage: error.message,
              errorStack: error.stack
            });
            
            // The test should fail here on unfixed code
            // This failure confirms the bug exists
            fail(`Unhandled error in PDF processing (this confirms the bug exists): ${error.message}`);
          }
        }
      ),
      {
        numRuns: 20, // Run 20 test cases to find counterexamples
        timeout: 30000, // 30 second timeout per test case
        verbose: true // Show counterexamples when they're found
      }
    );
  });

  /**
   * Specific test cases for known problematic PDF scenarios
   * These are deterministic tests for specific edge cases
   */
  describe('Specific PDF parsing edge cases', () => {
    test('should handle PDF with only header', async () => {
      const pdfHeader = Buffer.from('%PDF-1.4\n%%EOF');
      
      try {
        const result = await textExtractor.extractText(pdfHeader, 'pdf');
        // Should either succeed with empty text or fail gracefully
        expect(typeof result.text).toBe('string');
      } catch (error: any) {
        // Should not throw unhandled errors
        console.log('Counterexample - PDF header only:', error.message);
        fail(`Unhandled error for minimal PDF: ${error.message}`);
      }
    });

    test('should handle completely invalid PDF data', async () => {
      const invalidPdf = Buffer.from('This is not a PDF file at all');
      
      try {
        const result = await textExtractor.extractText(invalidPdf, 'pdf');
        // Should either succeed or fail gracefully
        expect(typeof result.text).toBe('string');
      } catch (error: any) {
        // Should not throw unhandled errors
        console.log('Counterexample - Invalid PDF data:', error.message);
        fail(`Unhandled error for invalid PDF: ${error.message}`);
      }
    });

    test('should handle PDF with binary garbage after header', async () => {
      const pdfHeader = Buffer.from('%PDF-1.4\n');
      const binaryGarbage = Buffer.from([0xFF, 0xFE, 0xFD, 0xFC, 0x00, 0x01, 0x02, 0x03]);
      const corruptedPdf = Buffer.concat([pdfHeader, binaryGarbage]);
      
      try {
        const result = await textExtractor.extractText(corruptedPdf, 'pdf');
        // Should either succeed or fail gracefully
        expect(typeof result.text).toBe('string');
      } catch (error: any) {
        // Should not throw unhandled errors
        console.log('Counterexample - Corrupted PDF:', error.message);
        fail(`Unhandled error for corrupted PDF: ${error.message}`);
      }
    });
  });

  /**
   * Test for pdf-parse module availability
   * This tests the module loading issues mentioned in the root cause analysis
   */
  test('should handle pdf-parse module loading issues gracefully', async () => {
    // Create a simple PDF buffer
    const simplePdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj xref 0 4 0000000000 65535 f 0000000010 00000 n 0000000053 00000 n 0000000100 00000 n trailer<</Size 4/Root 1 0 R>> startxref 149 %%EOF');
    
    try {
      const result = await textExtractor.extractText(simplePdf, 'pdf');
      
      // Should handle the case where pdf-parse is not available
      // or encounters loading issues
      expect(typeof result.text).toBe('string');
      
    } catch (error: any) {
      // Check if this is a module loading error
      if (error.message.includes('pdf-parse module not available') || 
          error.message.includes('Cannot find module')) {
        console.log('Counterexample - Module loading issue:', error.message);
        fail(`pdf-parse module loading issue not handled gracefully: ${error.message}`);
      } else {
        console.log('Counterexample - PDF parsing error:', error.message);
        fail(`Unhandled PDF parsing error: ${error.message}`);
      }
    }
  });
});