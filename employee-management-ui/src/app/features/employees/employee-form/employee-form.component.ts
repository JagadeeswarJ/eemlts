import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Subject, takeUntil } from 'rxjs';
import { Role } from '../../../core/models/auth.models';
import { EmploymentStatus } from '../../../core/models/employee.models';
import { NotificationService } from '../../../core/services/notification.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ValidationMessageComponent } from '../../../shared/components/validation-message/validation-message.component';
import { loadDepartments } from '../../../store/departments/department.actions';
import {
  selectAllDepartments,
  selectDepartmentsError,
  selectDepartmentsLoading,
} from '../../../store/departments/department.selectors';
import {
  createEmployee,
  loadEmployeeById,
  loadManagers,
  updateEmployee,
} from '../../../store/employee/employee.actions';
import {
  selectEmployeeActionSuccess,
  selectEmployeeError,
  selectEmployeeLoading,
  selectManagers,
  selectSelectedEmployee,
} from '../../../store/employee/employee.selectors';

interface EmployeeForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  departmentId: FormControl<string>;
  designation: FormControl<string>;
  joiningDate: FormControl<string>;
  managerId: FormControl<number | null>;
  role: FormControl<Role>;
  address: FormControl<string>;
  emergencyContact: FormControl<string>;
  employmentStatus: FormControl<EmploymentStatus>;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertComponent, ValidationMessageComponent],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  isEditMode = false;
  employeeId?: number;
  submitted = false;

  departments$ = this.store.select(selectAllDepartments);
  deptLoading$ = this.store.select(selectDepartmentsLoading);
  deptError$ = this.store.select(selectDepartmentsError);

  managers$ = this.store.select(selectManagers);
  availableManagers$ = this.managers$.pipe(
    map((list) => {
      if (!this.isEditMode || !this.employeeId) return list;
      return list.filter((m) => m.employeeId !== this.employeeId);
    })
  );

  loading$ = this.store.select(selectEmployeeLoading);
  error$ = this.store.select(selectEmployeeError);

  form: FormGroup<EmployeeForm> = new FormGroup<EmployeeForm>({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(100)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    departmentId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    designation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    joiningDate: new FormControl(new Date().toISOString().substring(0, 10), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    managerId: new FormControl<number | null>(null),
    role: new FormControl<Role>('EMPLOYEE', { nonNullable: true }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    emergencyContact: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    employmentStatus: new FormControl<EmploymentStatus>('ACTIVE', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.store.dispatch(loadDepartments());
    this.store.dispatch(loadManagers());

    // Disable department select only while lookup is actively loading
    this.deptLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      if (loading) {
        this.form.controls.departmentId.disable({ emitEvent: false });
      } else {
        this.form.controls.departmentId.enable({ emitEvent: false });
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.employeeId = Number(idParam);
      this.store.dispatch(loadEmployeeById({ id: this.employeeId }));

      this.store.select(selectSelectedEmployee).pipe(takeUntil(this.destroy$)).subscribe((emp) => {
        if (emp && emp.employeeId === this.employeeId) {
          this.form.patchValue({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone,
            departmentId: emp.departmentId ? emp.departmentId.toString() : '',
            designation: emp.designation,
            joiningDate: emp.joiningDate,
            managerId: emp.managerId,
            address: emp.address,
            emergencyContact: emp.emergencyContact,
            employmentStatus: emp.employmentStatus,
          });
        }
      });
    }

    this.store.select(selectEmployeeActionSuccess).pipe(takeUntil(this.destroy$)).subscribe((success) => {
      if (success) {
        this.notificationService.success(
          this.isEditMode
            ? 'Employee details successfully updated.'
            : 'New employee onboarded successfully.'
        );
        this.router.navigate(['/employees']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryLoadDepartments(): void {
    this.store.dispatch(loadDepartments());
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    if (this.isEditMode && this.employeeId) {
      this.store.dispatch(
        updateEmployee({
          id: this.employeeId,
          request: {
            firstName: v.firstName.trim(),
            lastName: v.lastName.trim(),
            phone: v.phone.trim(),
            departmentId: Number(v.departmentId),
            designation: v.designation.trim(),
            managerId: v.managerId ? Number(v.managerId) : null,
            address: v.address.trim(),
            emergencyContact: v.emergencyContact.trim(),
            employmentStatus: v.employmentStatus,
          },
        })
      );
    } else {
      this.store.dispatch(
        createEmployee({
          request: {
            firstName: v.firstName.trim(),
            lastName: v.lastName.trim(),
            email: v.email.trim(),
            phone: v.phone.trim(),
            departmentId: Number(v.departmentId),
            designation: v.designation.trim(),
            joiningDate: v.joiningDate,
            managerId: v.managerId ? Number(v.managerId) : null,
            address: v.address.trim(),
            emergencyContact: v.emergencyContact.trim(),
            role: v.role,
          },
        })
      );
    }
  }
}
