import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { cancelLeave } from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveBalances,
  selectLeaveCurrentPage,
  selectLeaveHistory,
  selectLeaveLoading,
  selectLeaveTotalElements,
  selectLeaveTotalPages,
  selectLeaveTypes,
} from '../../../store/leave/leave.selectors';
import { LeaveDashboardComponent } from './leave-dashboard.component';

describe('LeaveDashboardComponent', () => {
  let component: LeaveDashboardComponent;
  let fixture: ComponentFixture<LeaveDashboardComponent>;
  let store: MockStore;
  let notificationService: NotificationService;

  const mockBalance = {
    balanceId: 1,
    employeeId: 4,
    leaveTypeId: 1,
    leaveTypeCode: 'CASUAL' as const,
    leaveTypeName: 'Casual Leave',
    year: 2026,
    totalDays: 12,
    usedDays: 2,
    pendingDays: 1,
    availableDays: 9,
    updatedAt: '',
  };

  const mockRequest = {
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
    reason: 'Family event',
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
      imports: [LeaveDashboardComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);

    store.overrideSelector(selectLeaveBalances, [mockBalance]);
    store.overrideSelector(selectLeaveHistory, [mockRequest]);
    store.overrideSelector(selectLeaveTypes, []);
    store.overrideSelector(selectLeaveLoading, false);
    store.overrideSelector(selectLeaveTotalElements, 1);
    store.overrideSelector(selectLeaveTotalPages, 1);
    store.overrideSelector(selectLeaveCurrentPage, 0);
    store.overrideSelector(selectLeaveActionSuccess, false);

    fixture = TestBed.createComponent(LeaveDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render leave balances and history list', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Casual Leave');
    expect(compiled.textContent).toContain('9');
    expect(compiled.textContent).toContain('Family event');
  });

  it('should confirm and cancel leave request', async () => {
    vi.spyOn(notificationService, 'confirm').mockResolvedValue(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await component.onCancelLeave(101);

    expect(dispatchSpy).toHaveBeenCalledWith(cancelLeave({ leaveRequestId: 101 }));
  });
});
