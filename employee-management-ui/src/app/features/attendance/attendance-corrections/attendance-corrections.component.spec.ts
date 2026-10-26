import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import {
  processCorrection,
  requestCorrection,
} from '../../../store/attendance/attendance.actions';
import {
  selectAttendanceActionSuccess,
  selectAttendanceAuditLogs,
  selectAttendanceLoading,
} from '../../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { AttendanceCorrectionsComponent } from './attendance-corrections.component';

describe('AttendanceCorrectionsComponent', () => {
  let component: AttendanceCorrectionsComponent;
  let fixture: ComponentFixture<AttendanceCorrectionsComponent>;
  let store: MockStore;
  let notificationService: NotificationService;

  const mockLog = {
    auditId: 50,
    attendanceId: 101,
    employeeId: 4,
    employeeName: 'Alex Jones',
    action: 'CORRECTION_REQUEST' as const,
    performedBy: 'Alex Jones',
    reason: 'Power failure at 9am',
    oldValue: '',
    newValue: '',
    previousStatus: 'PRESENT' as const,
    newStatus: 'PRESENT' as const,
    createdAt: '2026-10-22T10:00:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceCorrectionsComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);

    store.overrideSelector(selectCurrentUser, {
      userId: 1,
      employeeId: 1,
      employeeCode: 'EMP001',
      email: 'admin@company.com',
      role: 'ADMIN',
      firstName: 'John',
      lastName: 'Admin',
      fullName: 'John Admin',
      departmentId: 1,
      departmentName: 'HR',
      designation: 'Admin',
    });

    store.overrideSelector(selectAttendanceAuditLogs, [mockLog]);
    store.overrideSelector(selectAttendanceLoading, false);
    store.overrideSelector(selectAttendanceActionSuccess, false);

    fixture = TestBed.createComponent(AttendanceCorrectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render correction form and audit log', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Attendance Corrections & Audit Trail');
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('Power failure at 9am');
  });

  it('should dispatch requestCorrection when form submitted', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.correctionForm.patchValue({
      attendanceDate: '2026-10-22',
      proposedCheckInTime: '2026-10-22T09:00',
      proposedCheckOutTime: '2026-10-22T17:00',
      reason: 'Swipe machine offline',
    });

    component.onRequestCorrection();

    expect(dispatchSpy).toHaveBeenCalledWith(
      requestCorrection({
        request: {
          attendanceDate: '2026-10-22',
          proposedCheckInTime: '2026-10-22T09:00',
          proposedCheckOutTime: '2026-10-22T17:00',
          reason: 'Swipe machine offline',
        },
      })
    );
  });

  it('should approve correction after confirmation', async () => {
    vi.spyOn(notificationService, 'confirm').mockResolvedValue(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await component.onApprove(50);

    expect(dispatchSpy).toHaveBeenCalledWith(
      processCorrection({
        auditId: 50,
        decision: { approved: true, comment: 'Approved after verification' },
      })
    );
  });
});
