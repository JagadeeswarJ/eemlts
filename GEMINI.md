# Project Guidelines & Rules

## 1. Terminal Command Execution
- Prefer `cmd` commands (e.g. executed via `cmd.exe /c "<command>"`) for quick CLI actions and filesystem checks, as they run faster than PowerShell scripts.
- **Directory Changes**: Because terminal commands execute from workspace root in a fresh session, execute directory changes inline (e.g. `cd /d "<subdir>" && <command>`).
- **Maven Wrapper**: Use `.\mvnw.cmd` instead of `./mvnw` or `mvnw` when running Maven tasks.

## 2. File Modification & Tool Usage
- **Direct Disk Writes**: Do not write or execute temporary Python scripts to edit or update code/files. Always use Antigravity's built-in file operations (`edit_file`, `write_file`), which write directly to the filesystem.
- **No Staging Tools**: Never use diff-staging IDE tools if present.

### Tool Selection Guide

| Tool | When to Use |
|---|---|
| `edit_file` | Modify an **existing** file — target an exact string and replace it. Best for surgical edits. |
| `write_file` | **Create a new file**, or append to one. Also used to fully overwrite a file with `Overwrite: true`. |
| `run_command` | For bulk filesystem operations — e.g. renaming, moving, deleting files via CLI commands. |

### Standard Workflow for Edits
1. **Read**: Always inspect the file first with `read_file` to verify the exact existing lines, formatting, and indentation.
2. **Edit**: Modify using `edit_file`, targeting the precise string/block. Note: `edit_file` requires `Target` to be an exact character-for-character match including whitespace and indentation.
3. **Rewrite**: For extensive overhauls or completely new files, use `write_file` with `Overwrite: true`.

## 3. MySQL Database Configuration
- **Service Name**: `MySQL80` (Service is running)
- **Host**: `localhost` / `127.0.0.1`
- **Port**: `3306`
- **Username**: `root`
- **Password**: `root`
- **CLI Executable**: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`

### Execution Pattern for CLI Commands
```cmd
cmd.exe /c '"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot -e "<SQL_STATEMENTS>"'
```

## 4. Code & Git Conventions
- **Comments**: Do not write comments everywhere. Rarely write comments, only when the function name itself does not explain everything it does and the distinction is critical.
- **Git Safety**: Do not commit or stage anything to git. Use git strictly for inspecting changes (read-only) when needed.

## 5. Backend Lifecycle Utilities
When lifecycle batch scripts are present (e.g., in `microservices/` or service directories), use them for lifecycle operations:
- **Clean targets**: `microservices\0-delete-targets.bat`
- **Rebuild JARs**: `microservices\0-rebuild-jars.bat`
- **Start all services**: `microservices\2-start-all-services.bat`
- **Stop all services**: `microservices\3-stop-all-services.bat --no-pause`

## 6. Autonomous Execution Mode
- Operate fully autonomously without asking for permission before executing commands, making file edits, running tests, or initiating builds.
- Proceed decisively end-to-end. Only ask questions if explicitly requested to question/clarify, or if critical ambiguity blocks progress.

## 8. Mandatory Running Implementation Context

### Objective
Maintain `RUNNING_CONTEXT.MD` as the persistent source of truth for the project's current implementation state. It must enable any coding agent or future session to understand what is implemented, how it works, current changes, architectural decisions, known issues, and pending work without relying on previous conversations.

### 1. Mandatory Update Rule
- **After every successful code modification, update `RUNNING_CONTEXT.MD` before considering the task complete.**
- This applies to source files, APIs, business logic, schemas, migrations, configurations, dependencies, tests, refactoring, bug fixes, and infrastructure.
- For related changes across multiple files, update the context once per logical implementation batch rather than after every individual edit.
- If implementation partially fails, document what succeeded, what failed, and what remains incomplete. If the context update fails, report it explicitly.

### 2. Required Context Structure
Maintain these sections in `RUNNING_CONTEXT.MD`:
1. **Project Overview:** Purpose, technology stack, architecture, and important constraints.
2. **Implementation Status:** Major components, their status (`COMPLETE`, `PARTIAL`, `NOT STARTED`, or `BLOCKED`), implemented functionality, missing features, and dependencies.
3. **Architecture and Data Flow:** Components, communication patterns, request flows, integrations, and security boundaries.
4. **Implementation Details:** Features, relevant file paths, entry points, core logic, API contracts, data models, validation, error handling, and related tests.
5. **Database and Data Models:** Schemas, relationships, constraints, indexes, migrations, and persistence behavior.
6. **Current Changes:** Latest changes, reasons, affected files, behavior changes, verification results, and incomplete work.
7. **Decisions and Rationale:** Important technical decisions, reasoning, alternatives, and trade-offs.
8. **Known Issues:** Confirmed bugs, failing tests, limitations, technical debt, and unverified behavior.
9. **Next Steps:** Prioritized pending tasks, dependencies, blockers, and acceptance criteria.
10. **Verification Status:** Tests, builds, linting, type checks, results, and areas not tested.

Keep the document concise, structured, and implementation-focused. Explain how important functionality works rather than merely listing modified files.

### 3. Required Workflow
For every implementation task:
1. Read `RUNNING_CONTEXT.MD` and inspect relevant source files before making changes.
2. Understand the existing architecture, requirements, and dependencies.
3. Implement the changes using appropriate file-editing tools (direct disk operations).
4. Inspect the resulting diff and verify the intended changes.
5. Run relevant tests, builds, or static checks when practical.
6. Update `RUNNING_CONTEXT.MD` to reflect the actual implementation.
7. Verify that the context is accurate and consistent with the code.
8. Report the implementation, verification results, context update, and remaining work.

Never mark functionality complete solely because code was generated. Record failed tests and incomplete work honestly.

### 4. Accuracy and Maintenance Rules
- Treat the actual codebase as the authority; the context is its persistent summary.
- Never document planned functionality as implemented or invent verification results.
- Update only affected sections and remove outdated or contradictory information.
- Preserve existing user changes and avoid unrelated modifications.
- Record file paths accurately and retain important architectural decisions.
- Avoid duplicating source code or allowing the document to grow indefinitely.
- Include the latest update and verification timestamps where useful.
- If detailed documentation grows too large, move it into `docs/implementation/` and link it from `RUNNING_CONTEXT.MD`.
- Never discard important context when reorganizing documentation.

### 5. Starting New Tasks or Sessions
Before starting a new task, read `RUNNING_CONTEXT.MD`, inspect relevant source files, and verify that the documented state matches the actual code. Resolve discrepancies before relying on the context.
After implementation, update the context so future sessions can continue without depending on chat history.

### 6. Final Response
After each task, report:
- **Implemented:** Summary of changes.
- **Files Changed:** Important modified or created files.
- **Verification:** Actual tests and checks performed and their results.
- **Context Updated:** Sections updated in `RUNNING_CONTEXT.MD`.
- **Remaining Work:** Outstanding issues or unverified behavior.

### Final Rule
Updating `RUNNING_CONTEXT.MD` is a mandatory part of implementation, not optional documentation. Never consider a task complete while the context is stale or an update failure remains unreported.
