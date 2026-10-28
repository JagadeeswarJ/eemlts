import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Role } from '../../core/models/auth.models';
import { normalizeRole } from '../../core/utilities/role.utility';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { checkIn, checkOut, loadTodayAttendance } from '../../store/attendance/attendance.actions';
import { selectTodayAttendance } from '../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { approveLeave, rejectLeave } from '../../store/leave/leave.actions';
import {
  loadEmployeeDashboard,
  loadHrDashboard,
  loadManagerDashboard,
} from '../../store/report/report.actions';
import {
  selectEmployeeDashboard,
  selectEmployeeDashboardError,
  selectEmployeeDashboardLoading,
  selectHrDashboard,
  selectHrDashboardError,
  selectHrDashboardLoading,
  selectManagerDashboard,
  selectManagerDashboardError,
  selectManagerDashboardLoading,
} from '../../store/report/report.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  currentUser$ = this.store.select(selectCurrentUser);
  userRole: Role = 'EMPLOYEE';

  employeeDashboard$ = this.store.select(selectEmployeeDashboard);
  employeeLoading$ = this.store.select(selectEmployeeDashboardLoading);
  employeeError$ = this.store.select(selectEmployeeDashboardError);

  managerDashboard$ = this.store.select(selectManagerDashboard);
  managerLoading$ = this.store.select(selectManagerDashboardLoading);
  managerError$ = this.store.select(selectManagerDashboardError);

  hrDashboard$ = this.store.select(selectHrDashboard);
  hrLoading$ = this.store.select(selectHrDashboardLoading);
  hrError$ = this.store.select(selectHrDashboardError);

  todayAttendance$ = this.store.select(selectTodayAttendance);

  activeTab: 'employee' | 'manager' | 'hr' = 'employee';
  private hasInitializedData = false;

  ngOnInit(): void {
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user && !this.hasInitializedData) {
        this.hasInitializedData = true;
        this.userRole = normalizeRole(user.role);
        this.initializeRoleDashboard(this.userRole);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeRoleDashboard(role: Role): void {
    this.store.dispatch(loadTodayAttendance({}));
    this.store.dispatch(loadEmployeeDashboard());

    if (role === 'EMPLOYEE') {
      this.activeTab = 'employee';
    } else if (role === 'MANAGER') {
      this.activeTab = 'manager';
      this.store.dispatch(loadManagerDashboard());
    } else if (role === 'HR' || role === 'ADMIN') {
      this.activeTab = 'hr';
      this.store.dispatch(loadManagerDashboard());
      this.store.dispatch(loadHrDashboard());
    }
  }

  retryEmployeeDashboard(): void {
    this.store.dispatch(loadEmployeeDashboard());
  }

  retryManagerDashboard(): void {
    if (this.canAccessManagerTab) {
      this.store.dispatch(loadManagerDashboard());
    }
  }

  retryHrDashboard(): void {
    if (this.canAccessHrTab) {
      this.store.dispatch(loadHrDashboard());
    }
  }

  get canAccessManagerTab(): boolean {
    return this.userRole === 'MANAGER' || this.userRole === 'HR' || this.userRole === 'ADMIN';
  }

  get canAccessHrTab(): boolean {
    return this.userRole === 'HR' || this.userRole === 'ADMIN';
  }

  onCheckIn(): void {
    this.store.dispatch(checkIn());
  }

  onCheckOut(): void {
    this.store.dispatch(checkOut());
  }

  onApproveLeave(id: number): void {
    this.store.dispatch(approveLeave({ leaveRequestId: id, decision: { comment: 'Approved via Manager Dashboard' } }));
  }

  onRejectLeave(id: number): void {
    this.store.dispatch(rejectLeave({ leaveRequestId: id, decision: { comment: 'Rejected via Manager Dashboard' } }));
  }

  getBalanceBorder(code: string): string {
    switch (code) {
      case 'CASUAL':
        return 'border-[#BB6C43]';
      case 'SICK':
        return 'border-[#C8906D]';
      case 'EARNED':
        return 'border-[#2F6848]';
      default:
        return 'border-[#CCB499]';
    }
  }
}
