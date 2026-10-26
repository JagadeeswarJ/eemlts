import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { loadEmployeeById } from '../../../store/employee/employee.actions';
import {
  selectEmployeeError,
  selectEmployeeLoading,
  selectSelectedEmployee,
} from '../../../store/employee/employee.selectors';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css'],
})
export class EmployeeDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  currentUser$ = this.store.select(selectCurrentUser);
  employee$ = this.store.select(selectSelectedEmployee);
  loading$ = this.store.select(selectEmployeeLoading);
  error$ = this.store.select(selectEmployeeError);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.store.dispatch(loadEmployeeById({ id }));
    }
  }
}
