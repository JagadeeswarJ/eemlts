import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import {
  applyLeave,
  cancelLeave,
  loadLeaveBalances,
  loadLeaveHistory,
  loadLeaveTypes,
} from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveBalances,
  selectLeaveCurrentPage,
  selectLeaveHistory,
  selectLeaveLoading,
  selectLeaveTotalElements,
  selectLeaveTotalPages,
  selectLeaveTypes,
} from '../../../store/leave/leave.selectors';

@Component({
  selector: 'app-leave-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './leave-dashboard.component.html',
  styleUrls: ['./leave-dashboard.component.css'],
})
export class LeaveDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);

  types$ = this.store.select(selectLeaveTypes);
  balances$ = this.store.select(selectLeaveBalances);
  history$ = this.store.select(selectLeaveHistory);
  loading$ = this.store.select(selectLeaveLoading);
  totalElements$ = this.store.select(selectLeaveTotalElements);
  totalPages$ = this.store.select(selectLeaveTotalPages);
  currentPage$ = this.store.select(selectLeaveCurrentPage);
  currentUser$ = this.store.select(selectCurrentUser);

  showApplyModal = false;
  statusFilterControl = this.fb.control('ALL');

  currentPage = 0;

  applyForm = this.fb.group({
    leaveTypeId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.store.dispatch(loadLeaveTypes());
    this.store.dispatch(loadLeaveBalances({}));
    this.loadHistory();

    this.statusFilterControl.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadHistory();
    });

    this.store.select(selectLeaveActionSuccess).subscribe((success) => {
      if (success) {
        this.showApplyModal = false;
        this.applyForm.reset();
        this.store.dispatch(loadLeaveBalances({}));
        this.loadHistory();
      }
    });
  }

  loadHistory(): void {
    const statusVal = this.statusFilterControl.value;
    this.store.dispatch(
      loadLeaveHistory({
        params: {
          page: this.currentPage,
          size: 10,
          status: statusVal && statusVal !== 'ALL' ? statusVal : undefined,
        },
      })
    );
  }

  onPrevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHistory();
    }
  }

  onNextPage(): void {
    this.currentPage++;
    this.loadHistory();
  }

  onApplySubmit(): void {
    if (this.applyForm.valid) {
      const v = this.applyForm.value;
      this.store.dispatch(
        applyLeave({
          request: {
            leaveTypeId: Number(v.leaveTypeId),
            startDate: v.startDate!,
            endDate: v.endDate!,
            reason: v.reason!,
          },
        })
      );
    }
  }

  async onCancelLeave(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Cancel Leave Request',
      message: 'Are you sure you want to cancel this leave application? Quota balance will be immediately restored.',
      confirmText: 'Cancel Leave',
      isDestructive: true,
    });

    if (confirmed) {
      this.store.dispatch(cancelLeave({ leaveRequestId: id }));
    }
  }

  getBalanceBorder(code: string): string {
    switch (code) {
      case 'CASUAL':
        return 'border-[#BB6C43]';
      case 'SICK':
        return 'border-[#C8906D]';
      case 'EARNED':
        return 'border-[#2F6848]';
      default:
        return 'border-[#CCB499]';
    }
  }
}
