@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   Stopping all WorkPulse microservices
echo ==========================================
echo.

set "SERVICE_PORTS=Reporting-Dashboard-Service:8084 Leave-Management-Service:8083 Attendance-Management-Service:8082 Employee-Management-Service:8081 Employee-API-Gateway:8080 Employee-Service-Registry:8761"

set "STOPPED_COUNT=0"
set "NOT_RUNNING_COUNT=0"

for %%E in (%SERVICE_PORTS%) do (
    for /f "tokens=1,2 delims=:" %%A in ("%%E") do (
        set "SERVICE=%%A"
        set "PORT=%%B"
        set "FOUND_PID="

        for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":!PORT! .*LISTENING"') do (
            if not defined FOUND_PID (
                if not "%%P"=="0" (
                    set "FOUND_PID=%%P"
                )
            )
        )

        if defined FOUND_PID (
            echo [!SERVICE!] Found PID !FOUND_PID! listening on port !PORT!. Terminating...
            taskkill /PID !FOUND_PID! /T /F >nul 2>&1
            if errorlevel 1 (
                echo [WARN   ] !SERVICE! ^(Port !PORT!, PID !FOUND_PID!^) could not be terminated or already exited.
            ) else (
                echo [STOPPED] !SERVICE! ^(Port !PORT!, PID !FOUND_PID!^)
                set /a STOPPED_COUNT+=1
            )
        ) else (
            echo [SKIPPED] !SERVICE! ^(Port !PORT!^) - not running
            set /a NOT_RUNNING_COUNT+=1
        )
    )
)

echo.
echo ==========================================
echo   Stop Summary: !STOPPED_COUNT! stopped, !NOT_RUNNING_COUNT! not running
echo ==========================================
echo.

if /I "%~1"=="--no-pause" exit /b 0

pause
exit /b 0
