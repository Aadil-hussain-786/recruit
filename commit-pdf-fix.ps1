Write-Host "Committing PDF processing bug fixes to GitHub..." -ForegroundColor Green
Write-Host ""

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git version: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m @"
Fix PDF processing failures in resume upload

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
- Added bugfix specification in .kiro/specs/resume-upload-pdf-processing-fix/
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Commit completed successfully!" -ForegroundColor Green
        Write-Host "PDF processing bug fixes have been pushed to GitHub" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
        Write-Host "Please check your GitHub credentials and network connection" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Failed to commit changes" -ForegroundColor Red
    Write-Host "Please check the git status and try again" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"