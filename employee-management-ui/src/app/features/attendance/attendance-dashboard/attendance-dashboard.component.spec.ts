import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttendanceRecord } from '../../../core/models/attendance.models';
import { checkIn, checkOut } from '../../../store/attendance/attendance.actions';
import {
  selectAttendanceActionSuccess,
  selectAttendanceHistory,
  selectAttendanceLoading,
  selectAttendanceStats,
  selectTodayAttendance,
} from '../../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { AttendanceDashboardComponent } from './attendance-dashboard.component';

describe('AttendanceDashboardComponent', () => {
  let component: AttendanceDashboardComponent;
  let fixture: ComponentFixture<AttendanceDashboardComponent>;
  let store: MockStore;

  const mockToday: AttendanceRecord = {
    attendanceId: 101,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    attendanceDate: '2026-10-22',
    checkInTime: '2026-10-22T09:00:00',
    checkOutTime: null,
    totalHours: 0,
    status: 'PRESENT',
    canCheckIn: false,
    canCheckOut: true,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceDashboardComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectTodayAttendance, mockToday);
    store.overrideSelector(selectAttendanceStats, {
      totalDays: 20,
      presentDays: 18,
      halfDays: 1,
      absentDays: 1,
      onLeaveDays: 0,
      totalWorkingHours: 153.0,
      averageWorkingHours: 8.5,
      attendancePercentage: 92.5,
    });
    store.overrideSelector(selectAttendanceHistory, [mockToday]);
    store.overrideSelector(selectAttendanceLoading, false);
    store.overrideSelector(selectCurrentUser, null);
    store.overrideSelector(selectAttendanceActionSuccess, false);

    fixture = TestBed.createComponent(AttendanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render punch in/out interface and today status', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Attendance Center');
    expect(compiled.textContent).toContain('18');
    expect(compiled.textContent).toContain('92.5% Attendance');
  });

  it('should dispatch checkIn on punch in button', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.onCheckIn();
    expect(dispatchSpy).toHaveBeenCalledWith(checkIn());
  });

  it('should dispatch checkOut on punch out button', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.onCheckOut();
    expect(dispatchSpy).toHaveBeenCalledWith(checkOut());
  });
});
