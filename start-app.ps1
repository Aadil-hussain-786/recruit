Write-Host "Starting Resume Upload Application..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Backend setup
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location backend

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Building backend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build backend" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# Frontend setup
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location ..\frontend

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clear Next.js cache to fix potential Turbopack panic errors
if (Test-Path ".next") {
    Write-Host "Clearing Next.js cache (.next) to ensure clean build..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "PDF processing fix has been applied!" -ForegroundColor Green
Write-Host "- Enhanced error handling for PDF processing failures" -ForegroundColor White
Write-Host "- Multiple fallback mechanisms for problematic PDFs" -ForegroundColor White
Write-Host "- Better user feedback with actionable error messages" -ForegroundColor White
Write-Host "- Improved module loading and validation" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"