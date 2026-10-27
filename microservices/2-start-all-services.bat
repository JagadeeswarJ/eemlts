@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   Starting all WorkPulse microservices
echo ==========================================
echo.

set "ROOT=%~dp0"
set "LOG_DIR=%ROOT%runtime-logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

set "SERVICES=Employee-Service-Registry Employee-Management-Service Attendance-Management-Service Leave-Management-Service Reporting-Dashboard-Service Employee-API-Gateway"

for %%S in (%SERVICES%) do (
    echo Launching %%S...
    set "JAR="
    for /f "delims=" %%J in ('dir /b /a-d /o-d "%ROOT%%%S\target\*.jar" 2^>nul') do (
        if not defined JAR set "JAR=%%J"
    )
    if not defined JAR (
        echo [ERROR] No JAR found for %%S
    ) else (
        echo [%%S] Using JAR: !JAR!
        powershell -NoProfile -Command "Start-Process java -ArgumentList '-jar', 'target\!JAR!' -WorkingDirectory '%ROOT%%%S' -RedirectStandardOutput '%LOG_DIR%\%%S.log' -RedirectStandardError '%LOG_DIR%\%%S_error.log' -WindowStyle Hidden"
    )
    if "%%S"=="Employee-Service-Registry" (
        echo Waiting for Eureka to initialize...
        ping 127.0.0.1 -n 12 >nul
    )
)

echo.
echo ==========================================
echo   All services have been launched
echo ==========================================
echo.
echo Runtime logs: %LOG_DIR%\
echo.

if /I "%~1"=="--no-pause" exit /b 0
pause
exit /b 0
