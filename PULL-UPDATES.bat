@echo off
chcp 65001 > nul
title Political CRM — Pull от GitHub
cls

echo.
echo  +===========================================+
echo  ^|       Обновяване от GitHub                ^|
echo  +===========================================+
echo.

cd /d "%~dp0"

:: Show current branch
echo  Текущ клон:
git branch --show-current
echo.

:: === BACKUP DATABASE BEFORE PULL ===
if exist "prisma\dev.db" (
    echo  [i] Създаване на резервно копие на базата данни...
    if not exist "prisma\backups" mkdir "prisma\backups"
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set d=%%c-%%b-%%a
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set t=%%a%%b
    copy /Y "prisma\dev.db" "prisma\backups\dev_%d%_%t%.db" >nul
    echo  [OK] Backup: prisma\backups\dev_%d%_%t%.db
    echo.
)

:: === UNTRACK DATABASE (prevents git pull from deleting it) ===
git ls-files prisma/dev.db >nul 2>&1
if %errorlevel% == 0 (
    echo  [i] Премахване на базата от git tracking...
    git rm --cached prisma/dev.db >nul 2>&1
    echo  [OK] Базата вече няма да се синхронизира с git
    echo.
)

:: Pull latest changes
echo  Изтегляне на промени...
git pull

if %errorlevel% neq 0 (
    echo.
    echo  [!] Грешка при изтегляне. Провери интернет връзката.
    pause
    exit /b 1
)

echo.

:: === RESTORE DATABASE IF DELETED BY PULL ===
if not exist "prisma\dev.db" (
    echo  [!] Базата данни липсва след pull — възстановяване от backup...
    for /f "delims=" %%f in ('dir /b /o-d "prisma\backups\dev_*.db" 2^>nul') do (
        copy /Y "prisma\backups\%%f" "prisma\dev.db" >nul
        echo  [OK] Възстановена от: prisma\backups\%%f
        goto :db_restored
    )
    echo  [!] Няма backup — ще бъде създадена нова база при migrate deploy
    :db_restored
    echo.
)

:: Check if package.json changed (new dependencies)
git diff HEAD@{1} HEAD --name-only 2>nul | findstr /i "package.json" >nul
if %errorlevel% == 0 (
    echo  [i] Открити нови пакети — инсталиране...
    npm install
    echo.
)

:: Check if schema changed (new migrations)
git diff HEAD@{1} HEAD --name-only 2>nul | findstr /i "prisma" >nul
if %errorlevel% == 0 (
    echo  [i] Открита Prisma промяна — прилагане на миграции...
    npx prisma migrate deploy
    npx prisma generate
    echo.
)

echo  [OK] Готово! Рестартирай сървъра за да видиш промените.
echo.
echo  За стартиране: npm run dev:test
echo.
pause
