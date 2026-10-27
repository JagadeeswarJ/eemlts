@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
where mvn >nul 2>&1
if errorlevel 1 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.0.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" (
        set "PATH=C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.0.1\plugins\maven-plugin\lib\maven3\bin;%PATH%"
    )
)

echo ============================================
echo   REBUILD ALL MICROSERVICE JARS
echo ============================================
echo.

set "SERVICES=Employee-Service-Registry Employee-API-Gateway Employee-Management-Service Attendance-Management-Service Leave-Management-Service Reporting-Dashboard-Service"

set /a BUILT=0
set /a FAILED=0

for %%S in (%SERVICES%) do (
    echo --------------------------------------------
    echo Building: %%S
    echo --------------------------------------------
    pushd "%ROOT%%%S"
    call mvn clean package -DskipTests
    if errorlevel 1 (
        echo [ERROR] Failed to build %%S
        set /a FAILED+=1
    ) else (
        echo [SUCCESS] Built %%S
        set /a BUILT+=1
    )
    popd
    echo.
)

echo ============================================
echo   BUILD SUMMARY
echo ============================================
echo Successfully built : !BUILT!
echo Failed builds      : !FAILED!
echo ============================================

if /I "%~1"=="--no-pause" exit /b 0
pause
exit /b 0
