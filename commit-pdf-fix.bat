@echo off
echo Committing PDF processing bug fixes to GitHub...
echo.

echo Checking git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix PDF processing failures in resume upload

- Enhanced error handling for PDF processing with specific error types
- Added multiple fallback mechanisms for problematic PDFs
- Improved module loading and validation for pdf-parse
- Added resource management (timeouts, size limits, memory monitoring)
- Better user experience with actionable error messages
- Preserved existing functionality for non-PDF files
- Added comprehensive test suite for bug condition exploration
- Added preservation property tests to prevent regressions
- Created startup scripts for easy application launch

Fixes:
- Generic 'failed to process' errors now provide specific feedback
- PDF timeout issues handled with 30s timeout
- Large PDF files properly validated (10MB limit)
- Corrupted PDF files handled gracefully
- Module loading failures provide clear alternatives
- Memory allocation issues prevented with better resource management

Technical changes:
- backend/src/services/resumeUpload/textExtractor.ts: Enhanced PDF processing
- backend/src/services/resumeUpload/resumeUploadService.ts: Better error categorization
- Added comprehensive test suite in backend/tests/
- Created startup scripts: start-app.bat, start-app.ps1
- Added bugfix specification in .kiro/specs/resume-upload-pdf-processing-fix/"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Commit completed successfully!
echo.
pause