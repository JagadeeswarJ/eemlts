import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  approveLeave,
  loadPendingApprovals,
  rejectLeave,
} from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveLoading,
  selectPendingApprovals,
} from '../../../store/leave/leave.selectors';

@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './approval-queue.component.html',
  styleUrls: ['./approval-queue.component.css'],
})
export class ApprovalQueueComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);

  pendingList$ = this.store.select(selectPendingApprovals);
  loading$ = this.store.select(selectLeaveLoading);

  ngOnInit(): void {
    this.store.dispatch(loadPendingApprovals());

    this.store.select(selectLeaveActionSuccess).subscribe((success) => {
      if (success) {
        this.store.dispatch(loadPendingApprovals());
      }
    });
  }

  async onApprove(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Approve Leave Request',
      message: 'Are you sure you want to approve this employee time-off application? Quota days will be deducted.',
      confirmText: 'Approve Leave',
    });

    if (confirmed) {
      this.store.dispatch(approveLeave({ leaveRequestId: id, decision: { comment: 'Approved' } }));
      this.notificationService.success('Leave application approved.');
    }
  }

  async onReject(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Reject Leave Request',
      message: 'Are you sure you want to decline this leave application? Quota hold will be released.',
      confirmText: 'Reject Leave',
      isDestructive: true,
    });

    if (confirmed) {
      this.store.dispatch(
        rejectLeave({
          leaveRequestId: id,
          decision: { comment: 'Declined by reviewer' },
        })
      );
      this.notificationService.success('Leave application rejected.');
    }
  }
}
