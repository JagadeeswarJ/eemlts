import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { cancelLeave } from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveCurrentPage,
  selectLeaveHistory,
  selectLeaveLoading,
  selectLeaveTotalElements,
  selectLeaveTotalPages,
} from '../../../store/leave/leave.selectors';
import { LeaveHistoryComponent } from './leave-history.component';

describe('LeaveHistoryComponent', () => {
  let component: LeaveHistoryComponent;
  let fixture: ComponentFixture<LeaveHistoryComponent>;
  let store: MockStore;
  let notificationService: NotificationService;

  const mockRecord = {
    leaveRequestId: 101,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    leaveTypeId: 1,
    leaveTypeCode: 'CASUAL' as const,
    leaveTypeName: 'Casual Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-11',
    totalDays: 2,
    reason: 'Family errand',
    status: 'PENDING' as const,
    approverId: null,
    approverName: 'Pending',
    approverComments: null,
    decisionDate: null,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveHistoryComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);

    store.overrideSelector(selectLeaveHistory, [mockRecord]);
    store.overrideSelector(selectLeaveLoading, false);
    store.overrideSelector(selectLeaveTotalElements, 1);
    store.overrideSelector(selectLeaveTotalPages, 1);
    store.overrideSelector(selectLeaveCurrentPage, 0);
    store.overrideSelector(selectLeaveActionSuccess, false);

    fixture = TestBed.createComponent(LeaveHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render history table and record', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Time-Off Applications & History');
    expect(compiled.textContent).toContain('Casual Leave');
    expect(compiled.textContent).toContain('2 days');
    expect(compiled.textContent).toContain('Family errand');
  });

  it('should cancel leave request upon user confirmation', async () => {
    vi.spyOn(notificationService, 'confirm').mockResolvedValue(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await component.onCancelLeave(101);

    expect(dispatchSpy).toHaveBeenCalledWith(cancelLeave({ leaveRequestId: 101 }));
  });
});
