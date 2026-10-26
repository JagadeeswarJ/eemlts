import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ValidationMessageComponent } from '../../../shared/components/validation-message/validation-message.component';
import {
  loadAuditLogs,
  processCorrection,
  requestCorrection,
} from '../../../store/attendance/attendance.actions';
import {
  selectAttendanceActionSuccess,
  selectAttendanceAuditLogs,
  selectAttendanceLoading,
} from '../../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

interface AttendanceCorrectionForm {
  attendanceDate: FormControl<string>;
  proposedCheckInTime: FormControl<string>;
  proposedCheckOutTime: FormControl<string>;
  reason: FormControl<string>;
}

function timeOrderValidator(control: AbstractControl): ValidationErrors | null {
  const checkIn = control.get('proposedCheckInTime')?.value;
  const checkOut = control.get('proposedCheckOutTime')?.value;

  if (checkIn && checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      control.get('proposedCheckOutTime')?.setErrors({ timeOrder: true });
      return { timeOrder: true };
    } else {
      if (control.get('proposedCheckOutTime')?.hasError('timeOrder')) {
        control.get('proposedCheckOutTime')?.setErrors(null);
      }
    }
  }
  return null;
}

@Component({
  selector: 'app-attendance-corrections',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingSpinnerComponent, ValidationMessageComponent],
  templateUrl: './attendance-corrections.component.html',
  styleUrls: ['./attendance-corrections.component.css'],
})
export class AttendanceCorrectionsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);

  auditLogs$ = this.store.select(selectAttendanceAuditLogs);
  loading$ = this.store.select(selectAttendanceLoading);
  currentUser$ = this.store.select(selectCurrentUser);
  submitted = false;

  correctionForm: FormGroup<AttendanceCorrectionForm> = new FormGroup<AttendanceCorrectionForm>(
    {
      attendanceDate: new FormControl(new Date().toISOString().substring(0, 10), {
        nonNullable: true,
        validators: [Validators.required],
      }),
      proposedCheckInTime: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      proposedCheckOutTime: new FormControl('', {
        nonNullable: true,
      }),
      reason: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(255)],
      }),
    },
    { validators: [timeOrderValidator] }
  );

  ngOnInit(): void {
    this.store.dispatch(loadAuditLogs({}));

    this.store.select(selectAttendanceActionSuccess).subscribe((success) => {
      if (success) {
        this.submitted = false;
        this.correctionForm.reset({
          attendanceDate: new Date().toISOString().substring(0, 10),
          proposedCheckInTime: '',
          proposedCheckOutTime: '',
          reason: '',
        });
        this.notificationService.success('Attendance correction action processed successfully.');
        this.store.dispatch(loadAuditLogs({}));
      }
    });
  }

  onRequestCorrection(): void {
    this.submitted = true;

    if (this.correctionForm.invalid) {
      this.correctionForm.markAllAsTouched();
      return;
    }

    const v = this.correctionForm.getRawValue();
    this.store.dispatch(
      requestCorrection({
        request: {
          attendanceDate: v.attendanceDate,
          proposedCheckInTime: v.proposedCheckInTime,
          proposedCheckOutTime: v.proposedCheckOutTime || undefined,
          reason: v.reason.trim(),
        },
      })
    );
  }

  async onApprove(auditId: number): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Approve Attendance Adjustment',
      message: 'Are you sure you want to approve this biometric attendance correction request?',
      confirmText: 'Approve',
    });

    if (confirmed) {
      this.store.dispatch(
        processCorrection({
          auditId,
          decision: { approved: true, comment: 'Approved after verification' },
        })
      );
    }
  }

  async onReject(auditId: number): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Reject Attendance Adjustment',
      message: 'Are you sure you want to reject this adjustment request? This action will decline the proposed timestamps.',
      confirmText: 'Reject',
      isDestructive: true,
    });

    if (confirmed) {
      this.store.dispatch(
        processCorrection({
          auditId,
          decision: { approved: false, comment: 'Unable to verify timestamps' },
        })
      );
    }
  }
}
