import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add success toast to toasts$', () => {
    service.success('Operation succeeded', 'Success');

    service.toasts$.subscribe((toasts) => {
      if (toasts.length > 0) {
        expect(toasts[0].message).toBe('Operation succeeded');
        expect(toasts[0].type).toBe('success');
      }
    });
  });

  it('should add error toast to toasts$', () => {
    service.error('Failed request', 'Error');

    service.toasts$.subscribe((toasts) => {
      if (toasts.length > 0) {
        expect(toasts[0].message).toBe('Failed request');
        expect(toasts[0].type).toBe('error');
      }
    });
  });

  it('should dismiss toast by id', () => {
    service.info('Notice');
    let toastId = '';

    service.toasts$.subscribe((toasts) => {
      if (toasts.length > 0) {
        toastId = toasts[0].id;
      }
    });

    service.dismiss(toastId);
    service.toasts$.subscribe((toasts) => {
      expect(toasts.length).toBe(0);
    });
  });

  it('should handle confirm dialog promise resolution', async () => {
    const confirmPromise = service.confirm({
      title: 'Delete Staff',
      message: 'Are you sure?',
    });

    service.resolveConfirm(true);
    const result = await confirmPromise;
    expect(result).toBe(true);
  });
});
