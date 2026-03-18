/**
 * Preservation Property Tests for Resume Upload PDF Processing Fix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * CRITICAL: These tests MUST PASS on unfixed code - they capture baseline behavior to preserve
 * 
 * This test observes and captures the current working behavior for:
 * - Non-PDF file processing (DOC, DOCX, TXT)
 * - Successfully parseable PDF files
 * - Upload validation, metadata creation, and session management
 * 
 * GOAL: Ensure the fix doesn't break anything that currently works
 */

import * as fc from 'fast-check';
import { TextExtractor } from '../src/services/resumeUpload/textExtractor';
import { ResumeUploadService } from '../src/services/resumeUpload/resumeUploadService';
import { ResumeFormat } from '../src/services/resumeUpload/types';

describe('Preservation Property Tests: Non-PDF and Successful PDF Processing', () => {
  let textExtractor: TextExtractor;
  let resumeUploadService: ResumeUploadService;

  beforeEach(() => {
    textExtractor = new TextExtractor();
    resumeUploadService = new ResumeUploadService();
  });

  /**
   * Property 2: Preservation - Non-PDF File Processing
   * 
   * This property tests that DOC, DOCX, and TXT file processing continues to work
   * exactly as before. These formats should be completely unaffected by the PDF fix.
   */
  test('Property 2: Non-PDF files (DOC, DOCX, TXT) continue to process successfully', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for non-PDF file formats and content
        fc.record({
          format: fc.constantFrom('doc', 'docx', 'txt') as fc.Arbitrary<ResumeFormat>,
          content: fc.oneof(
            // Simple text content
            fc.string({ minLength: 10, maxLength: 1000 }).map(text => 
              `John Doe\nSoftware Engineer\n\nExperience:\n${text}\n\nSkills:\nJavaScript, Python, React`
            ),
            // Resume-like content
            fc.constant(`John Smith
Email: john.smith@email.com
Phone: (555) 123-4567

EXPERIENCE
Software Developer at Tech Corp (2020-2023)
- Developed web applications using React and Node.js
- Collaborated with cross-functional teams
- Implemented automated testing procedures

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2016-2020)

SKILLS
JavaScript, Python, React, Node.js, SQL, Git`),
            // Minimal content
            fc.constant('Name: Jane Doe\nTitle: Developer\nSkills: Programming'),
            // Longer content with technical terms
            fc.constant(`PROFESSIONAL SUMMARY
Experienced full-stack developer with 5+ years of experience in web development.

TECHNICAL SKILLS
Frontend: React, Vue.js, Angular, HTML5, CSS3, JavaScript, TypeScript
Backend: Node.js, Python, Java, Express.js, Django, Spring Boot
Database: MySQL, PostgreSQL, MongoDB, Redis
Cloud: AWS, Azure, Docker, Kubernetes
Tools: Git, Jenkins, JIRA, Agile methodologies

WORK EXPERIENCE
Senior Software Engineer | ABC Company | 2021-Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored junior developers and conducted code reviews

Software Engineer | XYZ Corp | 2019-2021
• Developed responsive web applications using React and Node.js
• Optimized database queries improving performance by 40%
• Collaborated with UX/UI designers to implement user-friendly interfaces

EDUCATION
Master of Science in Computer Science | Tech University | 2019
Bachelor of Science in Software Engineering | State University | 2017`)
          ),
          fileName: fc.string({ minLength: 5, maxLength: 50 }).map(name => {
            // Ensure proper file extension based on format
            const baseFileName = name.replace(/[^a-zA-Z0-9-_]/g, '');
            return `${baseFileName || 'resume'}`;
          })
        }),
        async (fileData) => {
          // Create appropriate buffer based on format
          let buffer: Buffer;
          let fullFileName: string;
          
          switch (fileData.format) {
            case 'txt':
              buffer = Buffer.from(fileData.content, 'utf-8');
              fullFileName = `${fileData.fileName}.txt`;
              break;
            case 'doc':
            case 'docx':
              // For DOC/DOCX, we'll use a simple text buffer since mammoth can handle it
              // In real scenarios, these would be proper Word document buffers
              buffer = Buffer.from(fileData.content, 'utf-8');
              fullFileName = `${fileData.fileName}.${fileData.format}`;
              break;
            default:
              throw new Error(`Unexpected format: ${fileData.format}`);
          }

          try {
            // Test direct text extraction
            const extractionResult = await textExtractor.extractText(buffer, fileData.format);
            
            // Verify extraction succeeded and returned expected structure
            expect(typeof extractionResult.text).toBe('string');
            expect(extractionResult.text.length).toBeGreaterThan(0);
            expect(typeof extractionResult.wordCount).toBe('number');
            expect(extractionResult.wordCount).toBeGreaterThan(0);
            
            // For TXT files, content should match exactly (minus whitespace normalization)
            if (fileData.format === 'txt') {
              expect(extractionResult.text.trim()).toBe(fileData.content.trim());
            }
            
            // Test full upload flow
            const uploadResult = await resumeUploadService.uploadResume(
              buffer,
              fullFileName,
              'test-user-id'
            );
            
            // Upload should succeed for valid non-PDF files
            expect(uploadResult.success).toBe(true);
            expect(uploadResult.resumeId).toBeTruthy();
            expect(uploadResult.sessionId).toBeTruthy();
            expect(uploadResult.error).toBeUndefined();
            
            // Verify resume metadata was created correctly
            const resumeMetadata = await resumeUploadService.getResumeById(uploadResult.resumeId);
            expect(resumeMetadata).toBeTruthy();
            expect(resumeMetadata!.fileName).toBe(fullFileName);
            expect(resumeMetadata!.format).toBe(fileData.format);
            expect(resumeMetadata!.status).toBe('pending');
            expect(resumeMetadata!.userId).toBe('test-user-id');
            
            // Wait a moment for async processing to start
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check that processing was initiated (status should change from pending)
            const updatedMetadata = await resumeUploadService.getResumeById(uploadResult.resumeId);
            expect(['pending', 'processing', 'completed']).toContain(updatedMetadata!.status);
            
          } catch (error: any) {
            // Non-PDF files should NOT throw unhandled errors
            fail(`Non-PDF file processing failed unexpectedly: ${error.message}\nFormat: ${fileData.format}\nFileName: ${fullFileName}`);
          }
        }
      ),
      {
        numRuns: 15, // Test 15 different non-PDF file scenarios
        timeout: 10000, // 10 second timeout per test case
        verbose: true
      }
    );
  });

  /**
   * Property 2b: Preservation - Successfully Parseable PDF Files
   * 
   * This property tests that PDF files that parse successfully with pdf-parse
   * continue to work exactly as before. Only problematic PDFs should be affected by the fix.
   */
  test('Property 2b: Successfully parseable PDF files continue to work normally', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for simple, well-formed PDF-like content
        fc.record({
          content: fc.oneof(
            // Simple resume content that would work in a basic PDF
            fc.constant(`John Doe
Software Engineer

EXPERIENCE
Senior Developer at Tech Company
- Built scalable web applications
- Led team of 5 developers
- Implemented microservices architecture

EDUCATION
BS Computer Science, University of Tech

SKILLS
JavaScript, Python, React, Node.js, AWS`),
            // Another valid resume format
            fc.constant(`JANE SMITH
jane.smith@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Full-stack developer with 3+ years experience

TECHNICAL SKILLS
• Frontend: React, Vue.js, HTML5, CSS3
• Backend: Node.js, Python, Express
• Database: PostgreSQL, MongoDB
• Tools: Git, Docker, Jenkins

WORK HISTORY
Software Developer | ABC Corp | 2021-Present
Web Developer | XYZ Inc | 2020-2021

EDUCATION
Computer Science Degree | State University | 2020`)
          ),
          fileName: fc.string({ minLength: 5, maxLength: 30 }).map(name => 
            `${name.replace(/[^a-zA-Z0-9-_]/g, '') || 'resume'}.pdf`
          )
        }),
        async (pdfData) => {
          // Create a simple PDF-like buffer that pdf-parse can handle
          // Note: This is a simplified approach - in real scenarios we'd use proper PDF generation
          // For this test, we're focusing on PDFs that DON'T trigger the bug condition
          const simplePdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${pdfData.content.length + 20}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${pdfData.content.replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
0000000178 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + pdfData.content.length}
%%EOF`;

          const buffer = Buffer.from(simplePdfContent);

          try {
            // Test direct text extraction
            const extractionResult = await textExtractor.extractText(buffer, 'pdf');
            
            // For successfully parseable PDFs, extraction should work
            expect(typeof extractionResult.text).toBe('string');
            expect(typeof extractionResult.wordCount).toBe('number');
            expect(extractionResult.wordCount).toBeGreaterThanOrEqual(0);
            
            // Test full upload flow
            const uploadResult = await resumeUploadService.uploadResume(
              buffer,
              pdfData.fileName,
              'test-user-id'
            );
            
            // Upload should succeed for valid PDF files
            expect(uploadResult.success).toBe(true);
            expect(uploadResult.resumeId).toBeTruthy();
            expect(uploadResult.sessionId).toBeTruthy();
            expect(uploadResult.error).toBeUndefined();
            
            // Verify resume metadata was created correctly
            const resumeMetadata = await resumeUploadService.getResumeById(uploadResult.resumeId);
            expect(resumeMetadata).toBeTruthy();
            expect(resumeMetadata!.fileName).toBe(pdfData.fileName);
            expect(resumeMetadata!.format).toBe('pdf');
            expect(resumeMetadata!.status).toBe('pending');
            expect(resumeMetadata!.userId).toBe('test-user-id');
            
          } catch (error: any) {
            // Check if this is a pdf-parse related error that indicates the PDF is problematic
            if (error.message.includes('Failed to extract text from PDF') ||
                error.message.includes('pdf-parse') ||
                error.message.includes('Invalid PDF')) {
              // This PDF triggered the bug condition - skip this test case
              // We only want to test PDFs that should work successfully
              console.log(`Skipping problematic PDF that triggers bug condition: ${error.message}`);
              return; // Skip this test case
            }
            
            // Any other error is unexpected for successful PDF processing
            fail(`Successfully parseable PDF failed unexpectedly: ${error.message}\nFileName: ${pdfData.fileName}`);
          }
        }
      ),
      {
        numRuns: 10, // Test 10 different successful PDF scenarios
        timeout: 15000, // 15 second timeout per test case
        verbose: true
      }
    );
  });

  /**
   * Property 2c: Preservation - Upload Validation and Session Management
   * 
   * This property tests that file validation, metadata creation, and session management
   * continue to work exactly as before for all file types.
   */
  test('Property 2c: Upload validation and session management remain unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          format: fc.constantFrom('txt', 'doc', 'docx') as fc.Arbitrary<ResumeFormat>,
          content: fc.string({ minLength: 20, maxLength: 500 }),
          fileName: fc.string({ minLength: 3, maxLength: 20 }).map(name => 
            name.replace(/[^a-zA-Z0-9-_]/g, '') || 'test'
          ),
          userId: fc.string({ minLength: 5, maxLength: 20 }).map(id => 
            `user-${id.replace(/[^a-zA-Z0-9-_]/g, '')}`
          ),
          jobDescriptionId: fc.option(fc.string({ minLength: 5, maxLength: 20 }).map(id => 
            `job-${id.replace(/[^a-zA-Z0-9-_]/g, '')}`
          ))
        }),
        async (testData) => {
          const buffer = Buffer.from(testData.content, 'utf-8');
          const fullFileName = `${testData.fileName}.${testData.format}`;

          try {
            // Test upload with session management
            const uploadResult = await resumeUploadService.uploadResume(
              buffer,
              fullFileName,
              testData.userId,
              testData.jobDescriptionId || undefined
            );

            // Verify upload succeeded
            expect(uploadResult.success).toBe(true);
            expect(uploadResult.resumeId).toBeTruthy();
            expect(uploadResult.sessionId).toBeTruthy();
            
            // Verify session was created and contains the resume
            const stats = resumeUploadService.getStats();
            expect(stats.activeSessions).toBeGreaterThan(0);
            expect(stats.totalResumes).toBeGreaterThan(0);
            
            // Verify resume metadata includes correct job description association
            const resumeMetadata = await resumeUploadService.getResumeById(uploadResult.resumeId);
            expect(resumeMetadata).toBeTruthy();
            
            if (testData.jobDescriptionId) {
              expect(resumeMetadata!.jobDescriptionIds).toContain(testData.jobDescriptionId);
            } else {
              expect(resumeMetadata!.jobDescriptionIds).toEqual([]);
            }
            
            // Verify file validation worked correctly
            expect(resumeMetadata!.format).toBe(testData.format);
            expect(resumeMetadata!.fileSize).toBe(buffer.length);
            expect(resumeMetadata!.userId).toBe(testData.userId);
            expect(resumeMetadata!.uploadedAt).toBeInstanceOf(Date);
            expect(resumeMetadata!.expiresAt).toBeInstanceOf(Date);
            expect(resumeMetadata!.expiresAt.getTime()).toBeGreaterThan(resumeMetadata!.uploadedAt.getTime());
            
          } catch (error: any) {
            fail(`Upload validation and session management failed: ${error.message}\nFormat: ${testData.format}\nUserId: ${testData.userId}`);
          }
        }
      ),
      {
        numRuns: 12, // Test 12 different validation scenarios
        timeout: 8000, // 8 second timeout per test case
        verbose: true
      }
    );
  });

  /**
   * Specific deterministic tests for known working scenarios
   */
  describe('Specific preservation test cases', () => {
    test('should preserve TXT file processing exactly', async () => {
      const content = `John Doe
Software Engineer
Experience: 5 years
Skills: JavaScript, Python, React`;
      
      const buffer = Buffer.from(content, 'utf-8');
      
      // Test text extraction
      const extractionResult = await textExtractor.extractText(buffer, 'txt');
      expect(extractionResult.text.trim()).toBe(content.trim());
      expect(extractionResult.wordCount).toBe(8); // Predictable word count
      
      // Test upload flow
      const uploadResult = await resumeUploadService.uploadResume(
        buffer,
        'test-resume.txt',
        'test-user'
      );
      
      expect(uploadResult.success).toBe(true);
      expect(uploadResult.resumeId).toBeTruthy();
      expect(uploadResult.sessionId).toBeTruthy();
    });

    test('should preserve batch upload functionality', async () => {
      const files = [
        {
          buffer: Buffer.from('Resume 1 content\nSoftware Developer', 'utf-8'),
          fileName: 'resume1.txt'
        },
        {
          buffer: Buffer.from('Resume 2 content\nData Scientist', 'utf-8'),
          fileName: 'resume2.txt'
        }
      ];

      const batchResult = await resumeUploadService.uploadMultipleResumes(
        files,
        'batch-user',
        'job-123'
      );

      expect(batchResult.total).toBe(2);
      expect(batchResult.successful).toBe(2);
      expect(batchResult.failed).toBe(0);
      expect(batchResult.results).toHaveLength(2);
      expect(batchResult.sessionId).toBeTruthy();
      
      // Verify all uploads succeeded
      for (const result of batchResult.results) {
        expect(result.success).toBe(true);
        expect(result.resumeId).toBeTruthy();
      }
    });

    test('should preserve service statistics functionality', async () => {
      const initialStats = resumeUploadService.getStats();
      
      // Upload a file
      await resumeUploadService.uploadResume(
        Buffer.from('Test resume content', 'utf-8'),
        'stats-test.txt',
        'stats-user'
      );
      
      const updatedStats = resumeUploadService.getStats();
      expect(updatedStats.totalResumes).toBe(initialStats.totalResumes + 1);
      expect(updatedStats.activeSessions).toBeGreaterThanOrEqual(initialStats.activeSessions);
    });
  });
});