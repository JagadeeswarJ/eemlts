import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  checkIn,
  checkOut,
  loadAttendanceHistory,
  loadAttendanceStats,
  loadTodayAttendance,
} from '../../../store/attendance/attendance.actions';
import {
  selectAttendanceActionSuccess,
  selectAttendanceHistory,
  selectAttendanceLoading,
  selectAttendanceStats,
  selectTodayAttendance,
} from '../../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.css'],
})
export class AttendanceDashboardComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  today$ = this.store.select(selectTodayAttendance);
  stats$ = this.store.select(selectAttendanceStats);
  history$ = this.store.select(selectAttendanceHistory);
  loading$ = this.store.select(selectAttendanceLoading);
  currentUser$ = this.store.select(selectCurrentUser);

  currentTime: Date = new Date();
  private timer: any;

  ngOnInit(): void {
    this.store.dispatch(loadTodayAttendance({}));
    this.store.dispatch(loadAttendanceStats({ year: 2026, month: 10 }));
    this.store.dispatch(loadAttendanceHistory({ params: { size: 5 } }));

    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    this.store.select(selectAttendanceActionSuccess).subscribe((success) => {
      if (success) {
        this.store.dispatch(loadTodayAttendance({}));
        this.store.dispatch(loadAttendanceHistory({ params: { size: 5 } }));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onCheckIn(): void {
    this.store.dispatch(checkIn());
  }

  onCheckOut(): void {
    this.store.dispatch(checkOut());
  }
}
