import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [NotificationService],
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService);
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render dialog when confirmation is requested', () => {
    notificationService.confirm({
      title: 'Deactivate Account',
      message: 'Please confirm account deactivation.',
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Deactivate Account');
    expect(compiled.textContent).toContain('Please confirm account deactivation.');
  });

  it('should trigger confirm on action click', async () => {
    const confirmPromise = notificationService.confirm({
      title: 'Action',
      message: 'Sure?',
    });
    fixture.detectChanges();

    component.onConfirm();
    const result = await confirmPromise;
    expect(result).toBe(true);
  });

  it('should trigger cancel on cancel click', async () => {
    const confirmPromise = notificationService.confirm({
      title: 'Action',
      message: 'Sure?',
    });
    fixture.detectChanges();

    component.onCancel();
    const result = await confirmPromise;
    expect(result).toBe(false);
  });
});
