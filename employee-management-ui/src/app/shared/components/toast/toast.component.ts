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
        return 'bg-[#4E7D5B]/15 text-[#2C4E36] border-[#4E7D5B]/30 shadow-sm';
      case 'error':
        return 'bg-[#A84A3B]/15 text-[#6D271D] border-[#A84A3B]/30 shadow-sm';
      case 'warning':
        return 'bg-[#C8906D]/20 text-[#6B4226] border-[#C8906D]/40 shadow-sm';
      default:
        return 'bg-[#CCB499]/30 text-[#4A413C] border-[#CCB499]/50 shadow-sm';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-[#4E7D5B]';
      case 'error':
        return 'text-[#A84A3B]';
      case 'warning':
        return 'text-[#C8906D]';
      default:
        return 'text-[#BB6C43]';
    }
  }
}
