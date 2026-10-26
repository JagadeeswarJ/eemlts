import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { cancelLeave, loadLeaveHistory } from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveCurrentPage,
  selectLeaveHistory,
  selectLeaveLoading,
  selectLeaveTotalElements,
  selectLeaveTotalPages,
} from '../../../store/leave/leave.selectors';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.css'],
})
export class LeaveHistoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);

  history$ = this.store.select(selectLeaveHistory);
  loading$ = this.store.select(selectLeaveLoading);
  totalElements$ = this.store.select(selectLeaveTotalElements);
  totalPages$ = this.store.select(selectLeaveTotalPages);
  currentPage$ = this.store.select(selectLeaveCurrentPage);

  statusFilterControl = this.fb.control('ALL');
  currentPage = 0;

  ngOnInit(): void {
    this.currentPage$.subscribe((p) => {
      this.currentPage = p;
    });

    this.fetchHistory(0);

    this.statusFilterControl.valueChanges.subscribe(() => {
      this.fetchHistory(0);
    });

    this.store.select(selectLeaveActionSuccess).subscribe((success) => {
      if (success) {
        this.fetchHistory(0);
      }
    });
  }

  fetchHistory(page: number): void {
    const status = this.statusFilterControl.value;
    this.store.dispatch(
      loadLeaveHistory({
        params: {
          status: status || undefined,
          page,
          size: 10,
        },
      })
    );
  }

  onPrevPage(): void {
    if (this.currentPage > 0) {
      this.fetchHistory(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    this.fetchHistory(this.currentPage + 1);
  }

  async onCancelLeave(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Cancel Leave Application',
      message: 'Are you sure you want to cancel this leave application? Quota days will be restored.',
      confirmText: 'Cancel Leave',
      isDestructive: true,
    });

    if (confirmed) {
      this.store.dispatch(cancelLeave({ leaveRequestId: id }));
      this.notificationService.success('Cancellation request dispatched.');
    }
  }
}
