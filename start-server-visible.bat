@echo off
echo Starting CineBot Backend Server...
cd /d "%~dp0"
node server.js
echo.
echo Server has stopped. Please check for errors above.
pause
