@echo off
echo Starting Resume Upload Application...
echo.

echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo Building backend...
call npm run build
if errorlevel 1 (
    echo Failed to build backend
    pause
    exit /b 1
)

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul