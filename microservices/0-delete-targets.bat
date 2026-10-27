@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
set /a SUCCESS=0
set /a FAILED=0

echo ============================================
echo   FORCE DELETE MAVEN TARGET DIRECTORIES
echo ============================================
echo Project root: %ROOT%
echo.

for /d /r "%ROOT%" %%D in (target) do (
    if exist "%%~fD\." (
        echo Deleting: %%~fD

        attrib -r -s -h "%%~fD\*" /s /d >nul 2>&1
        rd /s /q "%%~fD" 2>nul

        if exist "%%~fD\." (
            set /a FAILED+=1
        ) else (
            set /a SUCCESS+=1
        )
    )
)

echo.
echo ============================================
echo   CLEANUP SUMMARY
echo ============================================
echo Successful deletions : !SUCCESS!
echo Failed deletions     : !FAILED!
echo Total processed      : !SUCCESS!+!FAILED!
echo ============================================
if /I "%~1"=="--no-pause" exit /b 0
pause
exit /b 0
