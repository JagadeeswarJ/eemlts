import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Department } from '../../core/models/employee.models';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { DepartmentsComponent } from './departments.component';

describe('DepartmentsComponent', () => {
  let component: DepartmentsComponent;
  let fixture: ComponentFixture<DepartmentsComponent>;
  let departmentServiceMock: {
    getDepartmentsAdmin: any;
    createDepartment: any;
    updateDepartment: any;
    updateDepartmentStatus: any;
  };
  let employeeServiceMock: { getManagers: any };
  let notificationServiceMock: {
    success: any;
    error: any;
    confirm: any;
  };

  const mockDepartment: Department = {
    departmentId: 1,
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development',
    managerId: 3,
    managerName: 'David Miller',
    employeeCount: 4,
    isActive: true,
  };

  beforeEach(async () => {
    departmentServiceMock = {
      getDepartmentsAdmin: vi.fn().mockReturnValue(
        of({
          success: true,
          data: {
            content: [mockDepartment],
            totalElements: 1,
            totalPages: 1,
            page: 0,
            size: 10,
            isFirst: true,
            isLast: true,
          },
        })
      ),
      createDepartment: vi.fn().mockReturnValue(of({ success: true, data: mockDepartment })),
      updateDepartment: vi.fn().mockReturnValue(of({ success: true, data: mockDepartment })),
      updateDepartmentStatus: vi.fn().mockReturnValue(of({ success: true, data: mockDepartment })),
    };

    employeeServiceMock = {
      getManagers: vi.fn().mockReturnValue(
        of({
          success: true,
          data: [
            {
              employeeId: 3,
              fullName: 'David Miller',
              designation: 'Manager',
              email: 'm@co.com',
              employeeCode: 'EMP003',
              departmentName: 'Engineering',
            },
          ],
        })
      ),
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [DepartmentsComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: DepartmentService, useValue: departmentServiceMock },
        { provide: EmployeeService, useValue: employeeServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load departments and managers', () => {
    expect(component).toBeTruthy();
    expect(departmentServiceMock.getDepartmentsAdmin).toHaveBeenCalled();
    expect(employeeServiceMock.getManagers).toHaveBeenCalled();
    expect(component.departments.length).toBe(1);
    expect(component.departments[0].name).toBe('Engineering');
  });

  it('should filter departments and reset pagination', () => {
    component.searchQuery = 'Eng';
    component.statusFilter = 'ACTIVE';
    component.onFilterChange();

    expect(component.currentPage).toBe(0);
    expect(departmentServiceMock.getDepartmentsAdmin).toHaveBeenCalled();
  });

  it('should open create modal, validate, and create department', () => {
    component.openCreateModal();
    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(false);

    component.deptForm.setValue({
      name: 'Human Resources',
      code: 'HR',
      description: 'People Operations',
      managerId: 3,
    });

    component.onSaveDepartment();

    expect(departmentServiceMock.createDepartment).toHaveBeenCalledWith({
      name: 'Human Resources',
      code: 'HR',
      description: 'People Operations',
      managerId: 3,
    });
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });

  it('should open edit modal and update department', () => {
    component.openEditModal(mockDepartment);
    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(true);

    component.deptForm.patchValue({
      name: 'Engineering Systems',
    });

    component.onSaveDepartment();

    expect(departmentServiceMock.updateDepartment).toHaveBeenCalledWith(1, {
      name: 'Engineering Systems',
      code: 'ENG',
      description: 'Software development',
      managerId: 3,
    });
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });

  it('should handle conflict error when deactivating department with assigned staff', async () => {
    departmentServiceMock.updateDepartmentStatus.mockReturnValue(
      throwError(() => ({
        error: { message: 'Cannot deactivate department: active employees are currently assigned.' },
      }))
    );

    await component.onToggleStatus(mockDepartment);

    expect(notificationServiceMock.error).toHaveBeenCalledWith(
      'Cannot deactivate department: active employees are currently assigned.'
    );
  });
});
