import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { appReducers } from './store/app.state';
import { AttendanceEffects } from './store/attendance/attendance.effects';
import { AuthEffects } from './store/auth/auth.effects';
import { DepartmentEffects } from './store/departments/department.effects';
import { EmployeeEffects } from './store/employee/employee.effects';
import { LeaveEffects } from './store/leave/leave.effects';
import { ReportEffects } from './store/report/report.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(appReducers),
    provideEffects([
      AuthEffects,
      DepartmentEffects,
      EmployeeEffects,
      AttendanceEffects,
      LeaveEffects,
      ReportEffects,
    ]),
  ],
};
