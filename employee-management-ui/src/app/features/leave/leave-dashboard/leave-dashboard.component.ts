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
    leaveTypeId: ['', [Validators.required]],
    startDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
    endDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
    reason: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.currentPage$.subscribe((p) => {
      this.currentPage = p;
    });

    this.store.dispatch(loadLeaveTypes());
    this.store.dispatch(loadLeaveBalances({ year: 2026 }));
    this.fetchHistory(0);

    this.statusFilterControl.valueChanges.subscribe(() => {
      this.fetchHistory(0);
    });

    this.store.select(selectLeaveActionSuccess).subscribe((success) => {
      if (success) {
        this.showApplyModal = false;
        this.applyForm.reset({
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date().toISOString().substring(0, 10),
        });
        this.notificationService.success('Leave operation processed successfully.');
        this.store.dispatch(loadLeaveBalances({ year: 2026 }));
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
        return 'border-blue-500';
      case 'SICK':
        return 'border-rose-500';
      case 'EARNED':
        return 'border-emerald-500';
      default:
        return 'border-slate-400';
    }
  }
}
