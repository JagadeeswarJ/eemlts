import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfirmDialogData, ToastNotification } from '../models/notification.models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastsSubject = new BehaviorSubject<ToastNotification[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  private readonly confirmSubject = new BehaviorSubject<{
    data: ConfirmDialogData;
    resolve: (result: boolean) => void;
  } | null>(null);
  readonly confirmDialog$ = this.confirmSubject.asObservable();

  show(notification: Omit<ToastNotification, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const toast: ToastNotification = {
      ...notification,
      id,
      durationMs: notification.durationMs || 4000,
    };

    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    if (toast.durationMs && toast.durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.durationMs);
    }
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  dismiss(id: string): void {
    const updated = this.toastsSubject.getValue().filter((t) => t.id !== id);
    this.toastsSubject.next(updated);
  }

  confirm(data: ConfirmDialogData): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ data, resolve });
    });
  }

  resolveConfirm(result: boolean): void {
    const current = this.confirmSubject.getValue();
    if (current) {
      current.resolve(result);
      this.confirmSubject.next(null);
    }
  }
}
