@echo off
title Signal Clone Launcher
echo ========================================================
echo   Starting Signal Messenger Clone
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "Signal Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Next.js Frontend on http://localhost:3000...
start "Signal Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Application Launched!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================================
pause
