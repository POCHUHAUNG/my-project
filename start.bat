@echo off
start "Server" cmd /k "cd /d %~dp0server && node index.js"
timeout /t 3 /nobreak >nul
start http://localhost:3001
