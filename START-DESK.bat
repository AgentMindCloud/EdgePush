@echo off
cd /d "%~dp0"
if not exist node_modules npm install
if not exist dist\index.html npm run build
start "" http://127.0.0.1:4173/
npm run preview
