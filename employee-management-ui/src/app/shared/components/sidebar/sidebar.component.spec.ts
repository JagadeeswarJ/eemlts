import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectCurrentUser, {
      userId: 1,
      employeeId: 4,
      employeeCode: 'EMP004',
      email: 'alex@company.com',
      role: 'EMPLOYEE',
      firstName: 'Alex',
      lastName: 'Jones',
      fullName: 'Alex Jones',
      departmentId: 1,
      departmentName: 'Engineering',
      designation: 'Engineer',
    });

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render core navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Attendance');
    expect(compiled.textContent).toContain('Leave Portal');
    expect(compiled.textContent).toContain('My Profile & Settings');
  });

  it('should render privileged links for ADMIN role', () => {
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
    store.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Employees');
    expect(compiled.textContent).toContain('Approvals Queue');
    expect(compiled.textContent).toContain('Reports & Analytics');
    expect(compiled.textContent).toContain('Departments');
    expect(compiled.textContent).toContain('Leave Configuration');
  });

  it('should hide administrative links for EMPLOYEE role', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Departments');
    expect(compiled.textContent).not.toContain('Leave Configuration');
  });
});
