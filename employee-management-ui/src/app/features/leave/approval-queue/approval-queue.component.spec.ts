import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { approveLeave, rejectLeave } from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveLoading,
  selectPendingApprovals,
} from '../../../store/leave/leave.selectors';
import { ApprovalQueueComponent } from './approval-queue.component';

describe('ApprovalQueueComponent', () => {
  let component: ApprovalQueueComponent;
  let fixture: ComponentFixture<ApprovalQueueComponent>;
  let store: MockStore;
  let notificationService: NotificationService;

  const mockPending = {
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
      imports: [ApprovalQueueComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);

    store.overrideSelector(selectPendingApprovals, [mockPending]);
    store.overrideSelector(selectLeaveLoading, false);
    store.overrideSelector(selectLeaveActionSuccess, false);

    fixture = TestBed.createComponent(ApprovalQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render pending approval table row', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('EMP004');
    expect(compiled.textContent).toContain('Family errand');
  });

  it('should approve leave request upon confirmation', async () => {
    vi.spyOn(notificationService, 'confirm').mockResolvedValue(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await component.onApprove(101);

    expect(dispatchSpy).toHaveBeenCalledWith(
      approveLeave({ leaveRequestId: 101, decision: { comment: 'Approved' } })
    );
  });

  it('should reject leave request upon confirmation', async () => {
    vi.spyOn(notificationService, 'confirm').mockResolvedValue(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await component.onReject(101);

    expect(dispatchSpy).toHaveBeenCalledWith(
      rejectLeave({ leaveRequestId: 101, decision: { comment: 'Declined by reviewer' } })
    );
  });
});
