import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationService } from '../../core/services/notification.service';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
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

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render fixed desktop shell elements', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('app-sidebar')).not.toBeNull();
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should toggle sidebarOpen state', () => {
    expect(component.sidebarOpen).toBe(false);
    component.sidebarOpen = true;
    fixture.detectChanges();
    expect(component.sidebarOpen).toBe(true);
  });
});
