import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicAuthGuard } from './core/guards/public-auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // 1. Public Landing Page
  {
    path: '',
    pathMatch: 'full',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },

  // 2. Canonical Sign-In Route
  {
    path: 'sign-in',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/auth/sign-in/sign-in.component').then((m) => m.SignInComponent),
  },

  // 3. Backward Compatibility Redirect for Legacy /login
  {
    path: 'login',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },

  // 4. Organizational Account Access Guidance
  {
    path: 'sign-up',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/auth/sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },

  // 5. Password Reset Request Flow
  {
    path: 'forgot-password',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },

  // 6. Security Unauthorized (403) Page
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // 7. Not Found (404) Page
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/auth/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },

  // 8. Authenticated Application Shell Routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      // Dashboard (Role-adaptive)
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      // Employee Management Module
      {
        path: 'employees',
        canActivate: [roleGuard(['ADMIN', 'HR', 'MANAGER'])],
        loadComponent: () =>
          import('./features/employees/employee-list/employee-list.component').then(
            (m) => m.EmployeeListComponent
          ),
      },
      {
        path: 'employees/new',
        canActivate: [roleGuard(['ADMIN', 'HR'])],
        loadComponent: () =>
          import('./features/employees/employee-form/employee-form.component').then(
            (m) => m.EmployeeFormComponent
          ),
      },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/employees/employee-detail/employee-detail.component').then(
            (m) => m.EmployeeDetailComponent
          ),
      },
      {
        path: 'employees/:id/edit',
        canActivate: [roleGuard(['ADMIN', 'HR'])],
        loadComponent: () =>
          import('./features/employees/employee-form/employee-form.component').then(
            (m) => m.EmployeeFormComponent
          ),
      },

      // Department Administration Module
      {
        path: 'departments',
        canActivate: [roleGuard(['ADMIN', 'HR'])],
        loadComponent: () =>
          import('./features/departments/departments.component').then(
            (m) => m.DepartmentsComponent
          ),
      },

      // Leave-Type Configuration Module
      {
        path: 'leave-configuration',
        canActivate: [roleGuard(['ADMIN', 'HR'])],
        loadComponent: () =>
          import('./features/leave-configuration/leave-configuration.component').then(
            (m) => m.LeaveConfigurationComponent
          ),
      },
      {
        path: 'leave-configuration/allocations',
        canActivate: [roleGuard(['ADMIN', 'HR'])],
        loadComponent: () =>
          import('./features/leave-configuration/leave-allocations/leave-allocations.component').then(
            (m) => m.LeaveAllocationsComponent
          ),
      },

      // Attendance Module
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/attendance-dashboard/attendance-dashboard.component').then(
            (m) => m.AttendanceDashboardComponent
          ),
      },
      {
        path: 'attendance/history',
        loadComponent: () =>
          import('./features/attendance/attendance-history/attendance-history.component').then(
            (m) => m.AttendanceHistoryComponent
          ),
      },
      {
        path: 'attendance/corrections',
        loadComponent: () =>
          import('./features/attendance/attendance-corrections/attendance-corrections.component').then(
            (m) => m.AttendanceCorrectionsComponent
          ),
      },

      // Leave Management Module
      {
        path: 'leaves',
        loadComponent: () =>
          import('./features/leave/leave-dashboard/leave-dashboard.component').then(
            (m) => m.LeaveDashboardComponent
          ),
      },
      {
        path: 'leaves/apply',
        loadComponent: () =>
          import('./features/leave/leave-application/leave-application.component').then(
            (m) => m.LeaveApplicationComponent
          ),
      },
      {
        path: 'leaves/history',
        loadComponent: () =>
          import('./features/leave/leave-history/leave-history.component').then(
            (m) => m.LeaveHistoryComponent
          ),
      },
      {
        path: 'leaves/approvals',
        canActivate: [roleGuard(['ADMIN', 'HR', 'MANAGER'])],
        loadComponent: () =>
          import('./features/leave/approval-queue/approval-queue.component').then(
            (m) => m.ApprovalQueueComponent
          ),
      },
      {
        path: 'leaves/calendar',
        loadComponent: () =>
          import('./features/leave/team-calendar/team-calendar.component').then(
            (m) => m.TeamCalendarComponent
          ),
      },

      // Analytics & Reporting Module
      {
        path: 'reports',
        canActivate: [roleGuard(['ADMIN', 'HR', 'MANAGER'])],
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },

      // User Profile & Settings
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },

  // 9. Wildcard Fallback Route
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
