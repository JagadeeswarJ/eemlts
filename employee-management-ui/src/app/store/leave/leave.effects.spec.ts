import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaveService } from '../../core/services/leave.service';
import * as LeaveActions from './leave.actions';
import { LeaveEffects } from './leave.effects';

describe('LeaveEffects', () => {
  let actions$: Observable<any>;
  let effects: LeaveEffects;
  let leaveServiceMock: {
    getLeaveTypes: any;
    getLeaveBalances: any;
    applyLeave: any;
    cancelLeave: any;
    approveLeave: any;
    rejectLeave: any;
    getLeaveHistory: any;
    getPendingApprovals: any;
    getTeamLeaveCalendar: any;
  };

  beforeEach(() => {
    leaveServiceMock = {
      getLeaveTypes: vi.fn(),
      getLeaveBalances: vi.fn(),
      applyLeave: vi.fn(),
      cancelLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      getLeaveHistory: vi.fn(),
      getPendingApprovals: vi.fn(),
      getTeamLeaveCalendar: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        LeaveEffects,
        provideMockActions(() => actions$),
        { provide: LeaveService, useValue: leaveServiceMock },
      ],
    });

    effects = TestBed.inject(LeaveEffects);
  });

  it('should dispatch loadLeaveTypesSuccess on fetch', () => {
    leaveServiceMock.getLeaveTypes.mockReturnValue(of({ success: true, data: [] }));
    actions$ = of(LeaveActions.loadLeaveTypes());

    effects.loadLeaveTypes$.subscribe((action) => {
      expect(action).toEqual(LeaveActions.loadLeaveTypesSuccess({ types: [] }));
    });
  });

  it('should dispatch loadLeaveBalancesSuccess on fetch', () => {
    leaveServiceMock.getLeaveBalances.mockReturnValue(of({ success: true, data: [] }));
    actions$ = of(LeaveActions.loadLeaveBalances({ year: 2026 }));

    effects.loadLeaveBalances$.subscribe((action) => {
      expect(action).toEqual(LeaveActions.loadLeaveBalancesSuccess({ balances: [] }));
    });
  });

  it('should dispatch applyLeaveSuccess on applyLeave', () => {
    const mockRequest = { leaveRequestId: 101, status: 'PENDING' as const };
    leaveServiceMock.applyLeave.mockReturnValue(of({ success: true, data: mockRequest }));
    actions$ = of(LeaveActions.applyLeave({ request: { leaveTypeId: 1, startDate: '2026-11-01', endDate: '2026-11-02', reason: 'Personal' } }));

    effects.applyLeave$.subscribe((action) => {
      expect(action).toEqual(LeaveActions.applyLeaveSuccess({ request: mockRequest as any }));
    });
  });

  it('should dispatch cancelLeaveSuccess on cancelLeave', () => {
    const mockRequest = { leaveRequestId: 101, status: 'CANCELLED' as const };
    leaveServiceMock.cancelLeave.mockReturnValue(of({ success: true, data: mockRequest }));
    actions$ = of(LeaveActions.cancelLeave({ leaveRequestId: 101 }));

    effects.cancelLeave$.subscribe((action) => {
      expect(action).toEqual(LeaveActions.cancelLeaveSuccess({ request: mockRequest as any }));
    });
  });
});
