@echo off
chcp 65001 > nul
title Political CRM — Push to GitHub
cls

echo.
echo  +===========================================+
echo  ^|       Push промени към GitHub             ^|
echo  +===========================================+
echo.

cd /d "%~dp0"

:: Show current changes
echo  Промени за качване:
echo  -------------------
git status --short
echo.

:: Ask for commit message
set /p MSG="  Описание на промяната: "
if "%MSG%"=="" set MSG=update: промени %date% %time%

echo.
echo  Качване...
git add -A
git commit -m "%MSG%"
git push

echo.
if %errorlevel% == 0 (
    echo  [OK] Успешно качено в GitHub!
) else (
    echo  [!] Грешка при качване. Провери интернет връзката.
)

echo.
pause
