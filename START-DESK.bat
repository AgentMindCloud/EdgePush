@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title DESK

if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"

where npm >nul 2>&1
if errorlevel 1 (
  echo DESK could not start.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  call npm install
  if errorlevel 1 (
    echo DESK could not start.
    pause
    exit /b 1
  )
)

set "NEED=0"
if not exist "dist\index.html" set "NEED=1"
if "%NEED%"=="0" (
  node scripts\needs-build.mjs
  if errorlevel 2 set "NEED=1"
)

if "%NEED%"=="1" (
  call npm run build
  if errorlevel 1 (
    echo DESK could not start.
    pause
    exit /b 1
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $iar = $c.BeginConnect('127.0.0.1',4173,$null,$null); if (-not $iar.AsyncWaitHandle.WaitOne(400,$false)) { exit 1 }; $c.EndConnect($iar); $c.Close(); exit 0 } catch { exit 1 }"
if not errorlevel 1 (
  start "" "http://127.0.0.1:4173/"
  exit /b 0
)

echo DESK is starting. Close this window when you are finished.
start "" /MIN powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$ok=$false; foreach($i in 1..50){ try { $c=New-Object System.Net.Sockets.TcpClient; $iar=$c.BeginConnect('127.0.0.1',4173,$null,$null); if($iar.AsyncWaitHandle.WaitOne(200,$false)){ $c.EndConnect($iar); $c.Close(); $ok=$true; break } } catch {} ; Start-Sleep -Milliseconds 200 }; if($ok){ Start-Process 'http://127.0.0.1:4173/' }"
call npm run start:desk
