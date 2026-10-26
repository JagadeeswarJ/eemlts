import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastNotification } from '../../../core/models/notification.models';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  private readonly notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'error':
        return 'text-rose-500';
      case 'warning':
        return 'text-amber-500';
      default:
        return 'text-blue-500';
    }
  }
}
