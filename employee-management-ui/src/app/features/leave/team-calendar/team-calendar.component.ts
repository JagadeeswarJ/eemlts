import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { loadTeamCalendar } from '../../../store/leave/leave.actions';
import { selectCalendarItems, selectLeaveLoading } from '../../../store/leave/leave.selectors';

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './team-calendar.component.html',
  styleUrls: ['./team-calendar.component.css'],
})
export class TeamCalendarComponent implements OnInit {
  private readonly store = inject(Store);

  calendarItems$ = this.store.select(selectCalendarItems);
  loading$ = this.store.select(selectLeaveLoading);

  ngOnInit(): void {
    this.store.dispatch(loadTeamCalendar({}));
  }
}
