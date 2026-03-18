Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "`nStarting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Sleep -Seconds 3

Write-Host "`nStarting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nServers are starting up!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nWait 10-15 seconds for servers to fully start, then test the job creation." -ForegroundColor Yellow
