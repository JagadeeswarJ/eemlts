import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  selectAttendanceReports,
  selectDepartmentReports,
  selectLeaveReports,
  selectReportLoading,
} from '../../store/report/report.selectors';
import { ReportsComponent } from './reports.component';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let store: MockStore;

  const mockDeptReport = {
    departmentId: 1,
    name: 'Engineering',
    code: 'ENG',
    managerName: 'David Miller',
    totalEmployees: 4,
    presentToday: 4,
    onLeaveToday: 0,
    absentToday: 0,
    attendanceRate: 100.0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectDepartmentReports, [mockDeptReport]);
    store.overrideSelector(selectAttendanceReports, []);
    store.overrideSelector(selectLeaveReports, []);
    store.overrideSelector(selectReportLoading, false);

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render department breakdown table', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Organization Analytics & Reports');
    expect(compiled.textContent).toContain('Engineering');
    expect(compiled.textContent).toContain('100%');
  });

  it('should switch active tab when clicked', () => {
    component.activeTab = 'attendance';
    fixture.detectChanges();
    expect(component.activeTab).toBe('attendance');
  });
});
