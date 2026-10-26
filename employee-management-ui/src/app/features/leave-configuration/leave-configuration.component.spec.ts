import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaveType } from '../../core/models/leave.models';
import { LeaveService } from '../../core/services/leave.service';
import { NotificationService } from '../../core/services/notification.service';
import { LeaveConfigurationComponent } from './leave-configuration.component';

describe('LeaveConfigurationComponent', () => {
  let component: LeaveConfigurationComponent;
  let fixture: ComponentFixture<LeaveConfigurationComponent>;
  let leaveServiceMock: {
    getLeaveTypesAdmin: any;
    createLeaveType: any;
    updateLeaveType: any;
    updateLeaveTypeStatus: any;
  };
  let notificationServiceMock: {
    success: any;
    error: any;
    confirm: any;
  };

  const mockLeaveType: LeaveType = {
    leaveTypeId: 1,
    code: 'CASUAL',
    name: 'Casual Leave',
    description: 'Personal leave',
    annualQuota: 12,
    isCarryForward: false,
    isActive: true,
  };

  beforeEach(async () => {
    leaveServiceMock = {
      getLeaveTypesAdmin: vi.fn().mockReturnValue(
        of({
          success: true,
          data: {
            content: [mockLeaveType],
            totalElements: 1,
            totalPages: 1,
            page: 0,
            size: 50,
            isFirst: true,
            isLast: true,
          },
        })
      ),
      createLeaveType: vi.fn().mockReturnValue(of({ success: true, data: mockLeaveType })),
      updateLeaveType: vi.fn().mockReturnValue(of({ success: true, data: mockLeaveType })),
      updateLeaveTypeStatus: vi.fn().mockReturnValue(of({ success: true, data: mockLeaveType })),
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [LeaveConfigurationComponent, ReactiveFormsModule, FormsModule],
      providers: [
        provideRouter([]),
        { provide: LeaveService, useValue: leaveServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load leave policies', () => {
    expect(component).toBeTruthy();
    expect(leaveServiceMock.getLeaveTypesAdmin).toHaveBeenCalled();
    expect(component.leaveTypes.length).toBe(1);
    expect(component.leaveTypes[0].code).toBe('CASUAL');
  });

  it('should filter leave types and trigger fetch', () => {
    component.searchQuery = 'Casual';
    component.statusFilter = 'ACTIVE';
    component.onFilterChange();

    expect(leaveServiceMock.getLeaveTypesAdmin).toHaveBeenCalled();
  });

  it('should open create modal, validate, and create leave type', () => {
    component.openCreateModal();
    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(false);

    component.typeForm.setValue({
      code: 'COMPENSATORY',
      name: 'Compensatory Off',
      description: 'Weekend overtime comp off',
      annualQuota: 5,
      isCarryForward: false,
    });

    component.onSaveType();

    expect(leaveServiceMock.createLeaveType).toHaveBeenCalledWith({
      code: 'COMPENSATORY',
      name: 'Compensatory Off',
      description: 'Weekend overtime comp off',
      annualQuota: 5,
      isCarryForward: false,
    });
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });

  it('should open edit modal and update leave policy', () => {
    component.openEditModal(mockLeaveType);
    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(true);

    component.typeForm.patchValue({
      annualQuota: 14,
    });

    component.onSaveType();

    expect(leaveServiceMock.updateLeaveType).toHaveBeenCalledWith(1, {
      name: 'Casual Leave',
      description: 'Personal leave',
      annualQuota: 14,
      isCarryForward: false,
    });
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });

  it('should toggle policy status with confirmation', async () => {
    await component.onToggleStatus(mockLeaveType);

    expect(notificationServiceMock.confirm).toHaveBeenCalled();
    expect(leaveServiceMock.updateLeaveTypeStatus).toHaveBeenCalledWith(1, false);
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });

  it('should handle error when toggle status fails', async () => {
    leaveServiceMock.updateLeaveTypeStatus.mockReturnValue(
      throwError(() => ({ error: { message: 'Failed to deactivate leave type.' } }))
    );

    await component.onToggleStatus(mockLeaveType);

    expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to deactivate leave type.');
  });
});
