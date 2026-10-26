import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css'],
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() label?: string;

  get badgeClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'APPROVED':
      case 'ACTIVE':
      case 'SENT':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING':
      case 'HALF_DAY':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'REJECTED':
      case 'ABSENT':
      case 'TERMINATED':
      case 'INACTIVE':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'ON_LEAVE':
      case 'CANCELLED':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  get dotClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'APPROVED':
      case 'ACTIVE':
      case 'SENT':
        return 'bg-emerald-500';
      case 'PENDING':
      case 'HALF_DAY':
        return 'bg-amber-500';
      case 'REJECTED':
      case 'ABSENT':
      case 'TERMINATED':
      case 'INACTIVE':
      case 'FAILED':
        return 'bg-rose-500';
      case 'ON_LEAVE':
      case 'CANCELLED':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-500';
    }
  }
}
