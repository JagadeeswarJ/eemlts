# EMS — Frontend Single Page Application

The web frontend for the **EMS** Enterprise Human Capital & Leave System, built using **Angular 21**, **NgRx**, and **Tailwind CSS 4**.

## Design Identity: Amber Walnut Morning

The UI adheres strictly to the **Amber Walnut Morning** palette:
- **Canvas / Background:** `#EBEFEE`
- **Warm Sand:** `#CCB499`
- **Muted Terracotta:** `#C8906D`
- **Burnt Amber:** `#BB6C43`
- **Dark Walnut Text & Headers:** `#4A413C` / `#3E3530`
- **Iconography & Visual Elements:** 100% inline SVG primitives and typography. Strictly zero third-party icon packages and zero emojis.

## Technology Stack
- **Angular:** 21.2.17 (Standalone component architecture, reactive signals)
- **State Management:** NgRx 21.1.1 (Actions, Reducers, Effects, Selectors)
- **Styling:** Tailwind CSS 4.1.12 with custom color tokens
- **HTTP Client:** Angular `provideHttpClient(withFetch())`

## Running the Application

### Development Server
```bash
npm install
npm start
```
Runs the application on `http://localhost:4200/`.

### Production Build
```bash
npm run build
```
Generates optimized output in `dist/employee-management-ui`.

## Architecture & Route Protection
- **`publicAuthGuard`**: Redirects authenticated users away from public routes (`/`, `/sign-in`, `/sign-up`, `/forgot-password`) directly to `/dashboard`.
- **`authGuard`**: Protects all internal routes, ensuring an active access token is present.
- **`roleGuard`**: Enforces granular RBAC authorization (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`), redirecting unauthorized access attempts to `/unauthorized`.
