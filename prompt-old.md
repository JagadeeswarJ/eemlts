first:
read the database folder, to setup the database and tables, run that sql and seed data, to have the data..
next, reorganize the microservices, we have in this codebase, KEEP ALL THE MICROSERVICES, IN 1 folder, called the microservices, 
and use mvn and build, and run those, and generate the target folder, in each one of them 1 by them.
then, create bat files similar to the one's below for utils:
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

@echo off
setlocal EnableDelayedExpansion

if /I "%~1"=="__start" goto START_SERVICE

echo ==========================================
echo   Starting all microservices in parallel
echo ==========================================
echo.

set "SERVICES=eureka-server api-gateway auth-service policy-service payment-service claims-service notification-service ai-service"
set "LOG_DIR=%~dp0runtime-logs"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo Starting services...
echo.

for %%S in (%SERVICES%) do (
    echo Starting %%S
    start "Runtime - %%S" /b "%ComSpec%" /c call "%~f0" __start %%S
)

echo.
echo ==========================================
echo   All services have been launched
echo ==========================================
echo.
echo Runtime logs:
echo %LOG_DIR%\
echo.

if /I "%~1"=="--no-pause" exit /b 0

pause
exit /b 0


:START_SERVICE

set "SERVICE=%~2"
set "JAR="

pushd "%~dp0%SERVICE%"

if not exist "target" (
    echo [ERROR] target directory not found for %SERVICE%
    popd
    exit /b 1
)

for /f "delims=" %%J in ('dir /b /a-d /o-d "target\*.jar" 2^>nul') do (
    if not defined JAR set "JAR=%%J"
)

if not defined JAR (
    echo [ERROR] No JAR found for %SERVICE%
    echo No JAR found for %SERVICE% > "%~dp0runtime-logs\%SERVICE%.log"
    popd
    exit /b 1
)

echo [%SERVICE%] Using JAR: %JAR%
echo [%SERVICE%] Starting...

start "Service - %SERVICE%" /b "%ComSpec%" /c ""java" -jar "target\%JAR%" > "%~dp0runtime-logs\%SERVICE%.log" 2>&1"
popd
exit /b 0


@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   Stopping all LeaseBond microservices
echo ==========================================
echo.

REM Service-to-port mapping from each service's application.yaml
set "SERVICE_PORTS=ai-service:8086 notification-service:8085 payment-service:8084 claims-service:8083 policy-service:8082 auth-service:8081 api-gateway:8080 eureka-server:8761"

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


----------
and then:
run all the service, at once, 
and use curl as a api client, and test all the endpoint, in a order -> in which the user would, go through.
after that delete all that data, and run the seed data sql we ahve in the databse folder.
---
then, 
work on the frontend, 
first read it in depth, to understand, what all we have.
and then create a folder called PLAYWRIGHT, IN THAT, create playwright code for this version of frontend, 

create sophisticated playwright, that tests everything, in depth, everything that a user, can do, and will do.
make sure to fix any error in the FE(related to the logic).

them we do a complete make over of the FE:
FE: ui specifications:
-----------


# Full-Project UI Redesign, Codebase Cleanup, and Testing

## Objective

Perform a complete, professional redesign of the existing project to give it a distinctive visual identity that does not resemble generic templates or other projects. Improve the UI, naming conventions, code consistency, and test coverage across the entire codebase.

**Important: Improve the presentation and code quality without changing existing business logic, application behavior, or API contracts.**

First inspect the entire repository, understand its architecture and technology stack, and then implement the changes directly in the codebase. Do not stop after producing a plan.

## 1. Design System: Amber Walnut Morning

Use the following color palette consistently throughout the application.

- **Background / Light Surface:** `#EBEFEE`
- **Warm Sand / Secondary Surface:** `#CCB499`
- **Muted Terracotta / Accent:** `#C8906D`
- **Burnt Amber / Primary Accent:** `#BB6C43`
- **Dark Walnut / Primary Text:** `#4A413C`

Reference: [Amber Walnut Morning — Color Scheme 13](https://www.figma.com/resource-library/website-color-schemes/#color-scheme-13-amber-walnut-morning)

Use the supplied reference image as the authoritative visual reference for these colors.

Define reusable design tokens using the project's existing styling approach. Apply the palette consistently to backgrounds, typography, buttons, cards, borders, navigation, forms, tables, charts, alerts, and interactive states.

Maintain sufficient color contrast and accessible focus indicators. Use neutral surfaces and subtle tonal variations to establish hierarchy rather than applying every color everywhere.

## 2. Complete UI Redesign

Inspect every relevant frontend page, component, layout, and state. Redesign the application to feel cohesive, deliberate, and professionally engineered.

Requirements:

- Establish a clear visual hierarchy with consistent typography, spacing, alignment, sizing, and layout.
- Improve navigation, page structure, headers, sidebars, cards, tables, forms, dialogs, and responsive layouts wherever applicable.
- Add thoughtful hover, focus, active, loading, empty, success, and error states.
- Ensure responsive behavior across desktop, tablet, and mobile viewports.
- Improve form usability, data presentation, readability, and accessibility.
- Use subtle borders, restrained shadows, and consistent component styling.
- Preserve existing functionality, routes, permissions, user flows, and data displayed.
- Avoid generic dashboard layouts, excessive rounded cards, unnecessary gradients, decorative clutter, and repetitive template-like designs.
- Create a distinctive visual identity appropriate to the project's actual purpose and users.

Do not redesign pages based on assumptions. Inspect their existing purpose, functionality, and data before changing their presentation.

## 3. Icons, Logos, and Emojis

**Do not use icon libraries or third-party icon/logo packages.**

Do not install or introduce libraries such as Lucide React, React Icons, Font Awesome, or similar alternatives for icons or logos.

**Do not use emojis anywhere in the application or its interface.** This includes buttons, navigation, headings, empty states, notifications, placeholders, and decorative elements.

Prefer clear text labels, typography, CSS-based styling, and existing branding assets where appropriate. Do not replace prohibited icons with emoji characters or introduce unnecessary decorative symbols.

Keep the interface professional and purposeful.

## 4. Naming Conventions and Code Quality

Review naming conventions throughout the project, including frontend components, variables, functions, hooks, services, types, constants, files, and folders, as well as corresponding backend modules, classes, methods, and variables.

- Follow the conventions naturally associated with the existing language and framework.
- Use descriptive, consistent, and meaningful names.
- Remove unclear abbreviations and inconsistent naming where safe.
- Rename internal identifiers when necessary and update every affected import, reference, test, and configuration.
- Avoid unnecessary refactoring or changing stable interfaces solely for naming consistency.
- Preserve public API contracts, database compatibility, environment variable names, and externally consumed interfaces unless a change is explicitly necessary and backward-compatible.
- Avoid duplicating components, utilities, styles, or business logic.
- Keep the architecture maintainable and the changes focused.

## 5. Frontend and Backend Testing

Inspect the existing test infrastructure before introducing new tools.

### Frontend

Add or improve meaningful tests for:

- Component rendering and important UI states.
- User interactions, forms, validation, and navigation.
- Loading, empty, success, and error states.
- Existing functionality affected by component or styling changes.
- Responsive behavior and accessibility where practical.

Use the testing framework already established in the project. Introduce an appropriate framework only if the project lacks one.

### Backend

Add or improve tests that establish that existing behavior remains unchanged.

Cover relevant API endpoints, request validation, success and error responses, authentication and authorization, and important business rules where applicable.

**Do not modify backend business logic merely to make tests pass.** If a test exposes an existing defect, document it separately unless fixing it is explicitly required.

Run relevant existing and newly added tests, as well as available builds, type checks, and linting. Fix regressions introduced by your changes.

## 6. Dependency Installation

Inspect the entire repository and identify all applications, services, workspaces, and package manifests.

- Determine the package manager and runtime for each project.
- Install all missing dependencies genuinely required by the final implementation and its tests.
- Install development dependencies in the correct development-dependency category.
- Respect existing lockfiles and workspace configuration.
- Do not install unnecessary packages or duplicate dependencies.
- Do not upgrade unrelated dependencies or introduce incompatible versions without justification.
- Update lockfiles through the appropriate package manager.
- Verify that dependencies install correctly and the relevant applications can build and run.

Do not assume the project uses a particular framework or package manager; inspect the repository first.

## 7. Preserve Existing Logic

Before making changes, identify existing application behavior and its dependencies.

Preserve:

- Business rules and calculations.
- Database schemas, relationships, and data integrity.
- API routes, request and response formats, and status codes.
- Authentication, authorization, and security controls.
- Existing integrations, background jobs, and event flows.
- Environment configuration and deployment compatibility.

Restrict implementation changes to the UI, presentation layer, naming cleanup, test coverage, and necessary dependency/configuration updates.

If a required change could affect existing behavior, investigate its impact and choose the least disruptive implementation. Document unavoidable issues instead of silently changing application logic.

## 8. Mandatory Running Context Maintenance

Maintain `RUNNING_CONTEXT.MD` as the persistent record of the implementation state.

After each logical implementation batch, update it to reflect:

- The UI redesign and design tokens.
- Components, pages, and modules modified.
- Naming convention changes.
- Dependencies added or changed.
- Frontend and backend tests added and their actual results.
- Important architectural decisions and compatibility considerations.
- Known issues, incomplete work, and remaining tasks.

Read the existing context before beginning and verify that the final document agrees with the actual codebase. Never mark unimplemented or unverified functionality as complete.

## 9. Execution Workflow

Follow this workflow:

1. Inspect the repository structure, current UI, architecture, naming conventions, dependencies, tests, and `RUNNING_CONTEXT.MD`.
2. Identify reusable components and the areas requiring redesign.
3. Establish the Amber Walnut Morning design tokens.
4. Implement the UI redesign across the relevant application pages and states.
5. Clean up naming conventions and imports without changing public contracts or business logic.
6. Add or update frontend and backend tests.
7. Install required dependencies using the appropriate package manager.
8. Run tests, builds, type checks, and linting where available.
9. Inspect the final diff for regressions, accidental logic changes, unused dependencies, prohibited icons, emojis, and inconsistent styling.
10. Update and verify `RUNNING_CONTEXT.MD`.
11. Provide a concise implementation report.

Batch related changes where practical. Prefer the existing native file-editing tools and validated patches over generating temporary scripts solely to modify ordinary source files.

Do not stop at recommendations or mockups. Implement the changes in the actual project.

## 10. Completion Criteria

The task is complete only when:

- The relevant frontend pages use the new, cohesive color system and professional visual language.
- Naming conventions are consistent across the touched code.
- No prohibited icon packages or emojis have been introduced.
- Existing business logic and public API contracts remain intact.
- Required dependencies are installed and lockfiles are consistent.
- Frontend and backend tests have been added or improved.
- Available verification checks have been executed and their results documented.
- `RUNNING_CONTEXT.MD` accurately reflects the final implementation.
- Any unresolved failures, limitations, or existing defects are explicitly reported.

## Final Response

Report the following:

1. **UI redesign:** Pages, components, and design improvements implemented.
2. **Code cleanup:** Naming and structural changes.
3. **Dependencies:** Packages installed or changed and why.
4. **Testing:** Tests added, commands executed, and actual pass/fail results.
5. **Logic preservation:** Any detected or unavoidable behavior changes; otherwise confirm that no intentional business-logic changes were made.
6. **Running context:** Sections updated in `RUNNING_CONTEXT.MD`.
7. **Remaining issues:** Failures, blockers, and unverified areas.

Prioritize a cohesive, professional result, maintainability, and preservation of existing functionality over unnecessary visual effects or excessive code changes.


--- 
it should also change the name of the application, to some simple, dont fix multiple words and ocmeup with a stupid sounding an,e, just keep something generic, simple easy to pronouceor just even a ABBREVATION shortcut will also work 



---------
after FE generation, recreate the playwright-test from scratch, again for the new UI.
in depth, and sophisticated, and that test everything. and run the tests, and make sure it works...