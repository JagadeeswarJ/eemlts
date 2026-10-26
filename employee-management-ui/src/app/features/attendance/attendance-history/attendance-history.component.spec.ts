import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AttendanceRecord } from '../../../core/models/attendance.models';
import {
  selectAttendanceCurrentPage,
  selectAttendanceHistory,
  selectAttendanceLoading,
  selectAttendanceTotalElements,
  selectAttendanceTotalPages,
} from '../../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { AttendanceHistoryComponent } from './attendance-history.component';

describe('AttendanceHistoryComponent', () => {
  let component: AttendanceHistoryComponent;
  let fixture: ComponentFixture<AttendanceHistoryComponent>;
  let store: MockStore;

  const mockRecord: AttendanceRecord = {
    attendanceId: 101,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    attendanceDate: '2026-10-22',
    checkInTime: '2026-10-22T09:00:00',
    checkOutTime: '2026-10-22T17:30:00',
    totalHours: 8.5,
    status: 'PRESENT',
    canCheckIn: false,
    canCheckOut: false,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceHistoryComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAttendanceHistory, [mockRecord]);
    store.overrideSelector(selectAttendanceLoading, false);
    store.overrideSelector(selectAttendanceTotalElements, 1);
    store.overrideSelector(selectAttendanceTotalPages, 1);
    store.overrideSelector(selectAttendanceCurrentPage, 0);
    store.overrideSelector(selectCurrentUser, null);

    fixture = TestBed.createComponent(AttendanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render attendance history list', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('2026-10-22');
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('8.5 hrs');
  });
});
