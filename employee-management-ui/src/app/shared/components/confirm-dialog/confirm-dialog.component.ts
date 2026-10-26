import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  private readonly notificationService = inject(NotificationService);
  dialog$ = this.notificationService.confirmDialog$;

  onConfirm(): void {
    this.notificationService.resolveConfirm(true);
  }

  onCancel(): void {
    this.notificationService.resolveConfirm(false);
  }
}
