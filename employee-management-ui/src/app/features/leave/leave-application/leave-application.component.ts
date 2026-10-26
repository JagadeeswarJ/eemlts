import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../core/services/notification.service';
import { applyLeave, loadLeaveTypes } from '../../../store/leave/leave.actions';
import {
  selectLeaveActionSuccess,
  selectLeaveLoading,
  selectLeaveTypes,
} from '../../../store/leave/leave.selectors';

@Component({
  selector: 'app-leave-application',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css'],
})
export class LeaveApplicationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  types$ = this.store.select(selectLeaveTypes);
  loading$ = this.store.select(selectLeaveLoading);
  submitted = false;

  applyForm = this.fb.group({
    leaveTypeId: ['', [Validators.required]],
    startDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
    endDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
    reason: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.dispatch(loadLeaveTypes());

    this.store.select(selectLeaveActionSuccess).subscribe((success) => {
      if (success) {
        this.notificationService.success('Leave application successfully submitted for review.');
        this.router.navigate(['/leaves']);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
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
}
