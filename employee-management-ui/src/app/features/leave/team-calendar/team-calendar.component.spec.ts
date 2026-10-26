import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { selectCalendarItems, selectLeaveLoading } from '../../../store/leave/leave.selectors';
import { TeamCalendarComponent } from './team-calendar.component';

describe('TeamCalendarComponent', () => {
  let component: TeamCalendarComponent;
  let fixture: ComponentFixture<TeamCalendarComponent>;
  let store: MockStore;

  const mockCalendarItem = {
    leaveRequestId: 1,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    departmentId: 1,
    departmentName: 'Engineering',
    leaveTypeId: 1,
    leaveTypeCode: 'CASUAL' as const,
    leaveTypeName: 'Casual Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-11',
    totalDays: 2,
    status: 'APPROVED' as const,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamCalendarComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectCalendarItems, [mockCalendarItem]);
    store.overrideSelector(selectLeaveLoading, false);

    fixture = TestBed.createComponent(TeamCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render team calendar schedule card', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('EMP004');
    expect(compiled.textContent).toContain('2026-11-10 → 2026-11-11');
    expect(compiled.textContent).toContain('2 Days');
  });
});
