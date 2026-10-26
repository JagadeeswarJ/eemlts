import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department, ManagerOption } from '../../core/models/employee.models';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
})
export class DepartmentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);

  departments: Department[] = [];
  managers: ManagerOption[] = [];
  loading = false;
  errorMessage: string | null = null;

  searchQuery = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showModal = false;
  isEditMode = false;
  selectedDepartmentId: number | null = null;
  isSaving = false;
  submitted = false;

  deptForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    description: [''],
    managerId: [null as number | null],
  });

  ngOnInit(): void {
    this.loadManagers();
    this.fetchDepartments();
  }

  loadManagers(): void {
    this.employeeService.getManagers().subscribe({
      next: (res) => {
        if (res.data) {
          this.managers = res.data;
        }
      },
      error: () => {
        // Non-blocking manager lookup failure
      },
    });
  }

  fetchDepartments(): void {
    this.loading = true;
    this.errorMessage = null;

    const isActive =
      this.statusFilter === 'ALL'
        ? undefined
        : this.statusFilter === 'ACTIVE';

    this.departmentService
      .getDepartmentsAdmin({
        search: this.searchQuery.trim() || undefined,
        isActive,
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.data) {
            this.departments = res.data.content;
            this.totalElements = res.data.totalElements;
            this.totalPages = res.data.totalPages;
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to load department records.';
        },
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.fetchDepartments();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.fetchDepartments();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.currentPage = 0;
    this.fetchDepartments();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.fetchDepartments();
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedDepartmentId = null;
    this.submitted = false;
    this.deptForm.reset({
      name: '',
      code: '',
      description: '',
      managerId: null,
    });
    this.showModal = true;
  }

  openEditModal(dept: Department): void {
    this.isEditMode = true;
    this.selectedDepartmentId = dept.departmentId;
    this.submitted = false;
    this.deptForm.setValue({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      managerId: dept.managerId,
    });
    this.showModal = true;
  }

  onSaveDepartment(): void {
    this.submitted = true;
    if (this.deptForm.invalid) {
      return;
    }

    this.isSaving = true;
    const v = this.deptForm.value;

    if (this.isEditMode && this.selectedDepartmentId) {
      this.departmentService
        .updateDepartment(this.selectedDepartmentId, {
          name: v.name!,
          code: v.code!.toUpperCase(),
          description: v.description || undefined,
          managerId: v.managerId,
        })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            this.notificationService.success('Department updated successfully.');
            this.fetchDepartments();
          },
          error: (err) => {
            this.isSaving = false;
            this.notificationService.error(err.error?.message || 'Failed to update department.');
          },
        });
    } else {
      this.departmentService
        .createDepartment({
          name: v.name!,
          code: v.code!.toUpperCase(),
          description: v.description || undefined,
          managerId: v.managerId,
        })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            this.notificationService.success('Department created successfully.');
            this.fetchDepartments();
          },
          error: (err) => {
            this.isSaving = false;
            this.notificationService.error(err.error?.message || 'Failed to create department.');
          },
        });
    }
  }

  async onToggleStatus(dept: Department): Promise<void> {
    const action = dept.isActive ? 'deactivate' : 'activate';
    const message = dept.isActive
      ? `Are you sure you want to deactivate department "${dept.name}"? Note: Active assigned employees must be reassigned first.`
      : `Are you sure you want to activate department "${dept.name}"?`;

    const confirmed = await this.notificationService.confirm({
      title: `Confirm Department ${dept.isActive ? 'Deactivation' : 'Activation'}`,
      message,
      confirmText: dept.isActive ? 'Deactivate' : 'Activate',
      isDestructive: Boolean(dept.isActive),
    });

    if (confirmed) {
      this.departmentService
        .updateDepartmentStatus(dept.departmentId, !dept.isActive)
        .subscribe({
          next: () => {
            this.notificationService.success(
              `Department "${dept.name}" has been ${dept.isActive ? 'deactivated' : 'activated'} successfully.`
            );
            this.fetchDepartments();
          },
          error: (err) => {
            this.notificationService.error(
              err.error?.message || `Failed to ${action} department.`
            );
          },
        });
    }
  }
}
