import { describe, expect, it } from 'vitest';
import { ToastNotification, ConfirmDialogData } from './notification.models';

describe('Notification Models', () => {
  it('should instantiate valid ToastNotification structure', () => {
    const toast: ToastNotification = {
      id: 'toast-1',
      type: 'success',
      title: 'Action Successful',
      message: 'Employee updated successfully',
      durationMs: 3000,
    };
    expect(toast.id).toBe('toast-1');
    expect(toast.type).toBe('success');
  });

  it('should instantiate valid ConfirmDialogData structure', () => {
    const dialog: ConfirmDialogData = {
      title: 'Confirm Deactivation',
      message: 'Are you sure you want to deactivate this account?',
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      isDestructive: true,
    };
    expect(dialog.isDestructive).toBe(true);
    expect(dialog.confirmText).toBe('Deactivate');
  });
});
