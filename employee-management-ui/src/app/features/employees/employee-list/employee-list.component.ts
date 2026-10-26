import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Employee } from '../../../core/models/employee.models';
import { NotificationService } from '../../../core/services/notification.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { loadDepartments } from '../../../store/departments/department.actions';
import { selectAllDepartments } from '../../../store/departments/department.selectors';
import { deactivateEmployee, loadEmployees } from '../../../store/employee/employee.actions';
import {
  selectAllEmployees,
  selectEmployeeActionSuccess,
  selectEmployeeCurrentPage,
  selectEmployeeError,
  selectEmployeeLoading,
  selectEmployeeTotalElements,
  selectEmployeeTotalPages,
} from '../../../store/employee/employee.selectors';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);

  currentUser$ = this.store.select(selectCurrentUser);
  employees$ = this.store.select(selectAllEmployees);
  departments$ = this.store.select(selectAllDepartments);
  loading$ = this.store.select(selectEmployeeLoading);
  error$ = this.store.select(selectEmployeeError);
  totalElements$ = this.store.select(selectEmployeeTotalElements);
  totalPages$ = this.store.select(selectEmployeeTotalPages);
  currentPage$ = this.store.select(selectEmployeeCurrentPage);

  searchQuery = '';
  selectedDepartmentId = '';
  selectedStatus = '';
  currentPage = 0;
  pageSize = 10;

  ngOnInit(): void {
    this.store.dispatch(loadDepartments());
    this.fetchEmployees();

    this.store.select(selectEmployeeActionSuccess).subscribe((success) => {
      if (success) {
        this.fetchEmployees();
      }
    });
  }

  fetchEmployees(): void {
    const params: Record<string, any> = {
      page: this.currentPage,
      size: this.pageSize,
    };

    if (this.searchQuery.trim()) {
      params['search'] = this.searchQuery.trim();
    }
    if (this.selectedDepartmentId) {
      params['departmentId'] = Number(this.selectedDepartmentId);
    }
    if (this.selectedStatus) {
      params['status'] = this.selectedStatus;
    }

    this.store.dispatch(loadEmployees({ params }));
  }

  onSearch(): void {
    this.currentPage = 0;
    this.fetchEmployees();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.fetchEmployees();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDepartmentId = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.fetchEmployees();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchEmployees();
  }

  async onDeactivate(employee: Employee): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Deactivate Employee Account',
      message: `Are you sure you want to deactivate ${employee.fullName || employee.firstName}? This will disable access to the system.`,
      confirmText: 'Deactivate Employee',
      isDestructive: true,
    });

    if (confirmed) {
      this.store.dispatch(deactivateEmployee({ id: employee.employeeId }));
      this.notificationService.success('Deactivation request dispatched.');
    }
  }
}
