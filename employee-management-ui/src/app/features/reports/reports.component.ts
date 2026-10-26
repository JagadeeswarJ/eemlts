import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import {
  loadAttendanceReports,
  loadDepartmentReports,
  loadLeaveReports,
} from '../../store/report/report.actions';
import {
  selectAttendanceReports,
  selectDepartmentReports,
  selectLeaveReports,
  selectReportLoading,
} from '../../store/report/report.selectors';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  private readonly store = inject(Store);

  departments$ = this.store.select(selectDepartmentReports);
  attendance$ = this.store.select(selectAttendanceReports);
  leaves$ = this.store.select(selectLeaveReports);
  loading$ = this.store.select(selectReportLoading);

  activeTab: 'departments' | 'attendance' | 'leaves' = 'departments';

  ngOnInit(): void {
    this.store.dispatch(loadDepartmentReports());
    this.store.dispatch(loadAttendanceReports({ year: 2026 }));
    this.store.dispatch(loadLeaveReports({ year: 2026 }));
  }
}
