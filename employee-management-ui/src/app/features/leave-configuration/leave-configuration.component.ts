import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LeaveType, LeaveTypeCode } from '../../core/models/leave.models';
import { LeaveService } from '../../core/services/leave.service';
import { NotificationService } from '../../core/services/notification.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-leave-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './leave-configuration.component.html',
  styleUrls: ['./leave-configuration.component.css'],
})
export class LeaveConfigurationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveService = inject(LeaveService);
  private readonly notificationService = inject(NotificationService);

  leaveTypes: LeaveType[] = [];
  loading = false;
  errorMessage: string | null = null;

  searchQuery = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  showModal = false;
  isEditMode = false;
  selectedLeaveTypeId: number | null = null;
  isSaving = false;

  typeForm = this.fb.group({
    code: ['CASUAL' as LeaveTypeCode, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    annualQuota: [12, [Validators.required, Validators.min(0)]],
    isCarryForward: [false],
  });

  ngOnInit(): void {
    this.fetchLeaveTypes();
  }

  fetchLeaveTypes(): void {
    this.loading = true;
    this.errorMessage = null;

    const isActive =
      this.statusFilter === 'ALL'
        ? undefined
        : this.statusFilter === 'ACTIVE';

    this.leaveService
      .getLeaveTypesAdmin({
        search: this.searchQuery.trim() || undefined,
        isActive,
        page: 0,
        size: 50,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.data) {
            this.leaveTypes = res.data.content;
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to load leave policy configurations.';
        },
      });
  }

  onSearch(): void {
    this.fetchLeaveTypes();
  }

  onFilterChange(): void {
    this.fetchLeaveTypes();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.fetchLeaveTypes();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedLeaveTypeId = null;
    this.typeForm.reset({
      code: 'CASUAL',
      name: '',
      description: '',
      annualQuota: 12,
      isCarryForward: false,
    });
    this.showModal = true;
  }

  openEditModal(lt: LeaveType): void {
    this.isEditMode = true;
    this.selectedLeaveTypeId = lt.leaveTypeId;
    this.typeForm.setValue({
      code: lt.code,
      name: lt.name,
      description: lt.description || '',
      annualQuota: lt.annualQuota,
      isCarryForward: Boolean(lt.isCarryForward),
    });
    this.showModal = true;
  }

  onSaveType(): void {
    if (this.typeForm.invalid) {
      return;
    }

    this.isSaving = true;
    const v = this.typeForm.value;

    if (this.isEditMode && this.selectedLeaveTypeId) {
      this.leaveService
        .updateLeaveType(this.selectedLeaveTypeId, {
          name: v.name!,
          description: v.description || undefined,
          annualQuota: Number(v.annualQuota),
          isCarryForward: Boolean(v.isCarryForward),
        })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            this.notificationService.success('Leave policy updated successfully.');
            this.fetchLeaveTypes();
          },
          error: (err) => {
            this.isSaving = false;
            this.notificationService.error(err.error?.message || 'Failed to update leave policy.');
          },
        });
    } else {
      this.leaveService
        .createLeaveType({
          code: v.code!,
          name: v.name!,
          description: v.description || undefined,
          annualQuota: Number(v.annualQuota),
          isCarryForward: Boolean(v.isCarryForward),
        })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            this.notificationService.success('New leave policy configured successfully.');
            this.fetchLeaveTypes();
          },
          error: (err) => {
            this.isSaving = false;
            this.notificationService.error(err.error?.message || 'Failed to create leave policy.');
          },
        });
    }
  }

  async onToggleStatus(lt: LeaveType): Promise<void> {
    const action = lt.isActive ? 'deactivate' : 'activate';
    const confirmed = await this.notificationService.confirm({
      title: `Confirm Policy ${lt.isActive ? 'Deactivation' : 'Activation'}`,
      message: `Are you sure you want to ${action} leave type "${lt.name}"? ${
        lt.isActive ? 'Employees will no longer be able to select this type for new requests.' : ''
      }`,
      confirmText: lt.isActive ? 'Deactivate' : 'Activate',
      isDestructive: Boolean(lt.isActive),
    });

    if (confirmed) {
      this.leaveService
        .updateLeaveTypeStatus(lt.leaveTypeId, !lt.isActive)
        .subscribe({
          next: () => {
            this.notificationService.success(
              `Leave type "${lt.name}" has been ${lt.isActive ? 'deactivated' : 'activated'} successfully.`
            );
            this.fetchLeaveTypes();
          },
          error: (err) => {
            this.notificationService.error(err.error?.message || `Failed to ${action} leave type.`);
          },
        });
    }
  }
}
