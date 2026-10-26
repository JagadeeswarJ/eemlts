import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Department } from '../../../core/models/employee.models';
import { AdminLeaveBalance, LeaveBalanceAdjustment } from '../../../core/models/leave.models';
import { DepartmentService } from '../../../core/services/department.service';
import { LeaveService } from '../../../core/services/leave.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-leave-allocations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './leave-allocations.component.html',
  styleUrls: ['./leave-allocations.component.css'],
})
export class LeaveAllocationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveService = inject(LeaveService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notificationService = inject(NotificationService);

  activeView: 'balances' | 'history' = 'balances';

  balances: AdminLeaveBalance[] = [];
  auditLogs: LeaveBalanceAdjustment[] = [];
  departments: Department[] = [];

  loading = false;
  errorMessage: string | null = null;

  searchQuery = '';
  selectedYear = 2026;
  selectedDepartmentId: number | null = null;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showModal = false;
  selectedBalance: AdminLeaveBalance | null = null;
  isSaving = false;
  submitted = false;

  adjustForm = this.fb.group({
    newTotal: [12, [Validators.required, Validators.min(0)]],
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.loadDepartments();
    this.fetchBalances();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (res) => {
        if (res.data) {
          this.departments = res.data;
        }
      },
      error: () => {
        // Non-blocking department lookup failure
      },
    });
  }

  fetchBalances(): void {
    this.loading = true;
    this.errorMessage = null;

    this.leaveService
      .getAdminBalances({
        departmentId: this.selectedDepartmentId || undefined,
        year: this.selectedYear,
        search: this.searchQuery.trim() || undefined,
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.data) {
            this.balances = res.data.content;
            this.totalElements = res.data.totalElements;
            this.totalPages = res.data.totalPages;
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to load employee allocations.';
        },
      });
  }

  loadAuditLogs(): void {
    this.leaveService.getBalanceAdjustments().subscribe({
      next: (res) => {
        if (res.data) {
          this.auditLogs = res.data;
        }
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to load allocation audit history.');
      },
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.fetchBalances();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDepartmentId = null;
    this.selectedYear = 2026;
    this.currentPage = 0;
    this.fetchBalances();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchBalances();
    }
  }

  openAdjustModal(balance: AdminLeaveBalance): void {
    this.selectedBalance = balance;
    this.submitted = false;
    this.adjustForm.reset({
      newTotal: balance.totalDays,
      reason: '',
    });
    this.showModal = true;
  }

  async onSaveAdjustment(): Promise<void> {
    this.submitted = true;
    if (this.adjustForm.invalid || !this.selectedBalance) {
      return;
    }

    const v = this.adjustForm.value;
    const newTotal = Number(v.newTotal);
    const minRequired = (this.selectedBalance.usedDays || 0) + (this.selectedBalance.pendingDays || 0);

    if (newTotal < minRequired) {
      this.adjustForm.get('newTotal')?.setErrors({ minRequired: true });
      return;
    }

    const confirmed = await this.notificationService.confirm({
      title: 'Confirm Allocation Adjustment',
      message: `Adjust leave quota for ${this.selectedBalance.employeeName} (${this.selectedBalance.leaveTypeName}) from ${this.selectedBalance.totalDays} to ${newTotal} days?`,
      confirmText: 'Adjust Quota',
    });

    if (confirmed) {
      this.isSaving = true;
      this.leaveService
        .adjustLeaveAllocation(this.selectedBalance.employeeId, this.selectedBalance.leaveTypeId, {
          year: this.selectedBalance.year,
          newTotal,
          reason: v.reason!.trim(),
        })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            this.notificationService.success(
              `Allocation updated to ${newTotal} days with recorded audit reason.`
            );
            this.fetchBalances();
          },
          error: (err) => {
            this.isSaving = false;
            this.notificationService.error(
              err.error?.message || 'Failed to adjust leave allocation.'
            );
          },
        });
    }
  }
}
