@echo off
title Uploading SkyCast Weather App to GitHub
echo ========================================================
echo     Uploading SkyCast Weather App to GitHub
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/3] Checking Git Status...
git status -s
echo.

echo [2/3] Staging and Committing Changes...
git add .
git commit -m "feat: complete SkyCast live weather app with Prayagraj, UP, and global weather tracking"

echo.
echo [3/3] Pushing to GitHub repository...
echo Repository: https://github.com/sonampandey111/WeatherApi
echo Branch:     main
echo.
git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   [SUCCESS] Code successfully uploaded to GitHub!
    echo   View your repository at:
    echo   https://github.com/sonampandey111/WeatherApi
    echo ========================================================
) else (
    echo [ERROR] Push failed. 
    echo Please make sure you have created an empty repository named 'WeatherApi' at:
    echo https://github.com/new
)
echo.
pause
