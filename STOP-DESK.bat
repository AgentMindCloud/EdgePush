@echo off
setlocal EnableExtensions
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%P >nul 2>&1
)
echo DESK stopped. You can close this window.
timeout /t 2 >nul
