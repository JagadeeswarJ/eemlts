import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { loadAttendanceHistory } from '../../../store/attendance/attendance.actions';
import {
  selectAttendanceCurrentPage,
  selectAttendanceHistory,
  selectAttendanceLoading,
  selectAttendanceTotalElements,
  selectAttendanceTotalPages,
} from '../../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.css'],
})
export class AttendanceHistoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  history$ = this.store.select(selectAttendanceHistory);
  loading$ = this.store.select(selectAttendanceLoading);
  totalElements$ = this.store.select(selectAttendanceTotalElements);
  totalPages$ = this.store.select(selectAttendanceTotalPages);
  currentPage$ = this.store.select(selectAttendanceCurrentPage);
  currentUser$ = this.store.select(selectCurrentUser);

  currentPage = 0;

  filterForm = this.fb.group({
    startDate: [''],
    endDate: [''],
    status: ['ALL'],
  });

  ngOnInit(): void {
    this.currentPage$.subscribe((p) => {
      this.currentPage = p;
    });

    this.fetchHistory(0);
    this.filterForm.valueChanges.subscribe(() => {
      this.fetchHistory(0);
    });
  }

  fetchHistory(page: number): void {
    const val = this.filterForm.value;
    this.store.dispatch(
      loadAttendanceHistory({
        params: {
          startDate: val.startDate || undefined,
          endDate: val.endDate || undefined,
          status: val.status || undefined,
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
}
