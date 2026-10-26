import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [NotificationService],
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService);
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render toast when notificationService emits', () => {
    notificationService.success('Profile updated successfully', 'Saved');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Profile updated successfully');
    expect(compiled.textContent).toContain('Saved');
  });

  it('should dismiss toast when close button is clicked', () => {
    notificationService.info('Temporary notice');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button).not.toBeNull();
    button?.click();
    fixture.detectChanges();

    notificationService.toasts$.subscribe((toasts) => {
      expect(toasts.length).toBe(0);
    });
  });
});
