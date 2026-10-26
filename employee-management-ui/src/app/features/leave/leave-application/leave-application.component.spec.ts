import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { applyLeave } from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveLoading,
  selectLeaveTypes,
} from '../../../store/leave/leave.selectors';
import { LeaveApplicationComponent } from './leave-application.component';

describe('LeaveApplicationComponent', () => {
  let component: LeaveApplicationComponent;
  let fixture: ComponentFixture<LeaveApplicationComponent>;
  let store: MockStore;

  const mockTypes = [
    {
      leaveTypeId: 1,
      code: 'CASUAL' as const,
      name: 'Casual Leave',
      description: 'Personal days',
      annualQuota: 12,
      isCarryForward: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveApplicationComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectLeaveTypes, mockTypes);
    store.overrideSelector(selectLeaveLoading, false);
    store.overrideSelector(selectLeaveActionSuccess, false);

    fixture = TestBed.createComponent(LeaveApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render application form with categories', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Apply for Time Off');
    expect(compiled.textContent).toContain('Casual Leave');
  });

  it('should dispatch applyLeave when valid form submitted', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.applyForm.patchValue({
      leaveTypeId: '1',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      reason: 'Personal travel',
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      applyLeave({
        request: {
          leaveTypeId: 1,
          startDate: '2026-11-10',
          endDate: '2026-11-12',
          reason: 'Personal travel',
        },
      })
    );
  });
});
