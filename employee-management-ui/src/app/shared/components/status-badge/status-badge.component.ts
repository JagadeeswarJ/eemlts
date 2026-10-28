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
        return 'bg-[#EAF2ED] text-[#2F6848] border border-[#CFDFD4]';
      case 'PENDING':
      case 'HALF_DAY':
        return 'bg-[#FBEFE9] text-[#BB6C43] border border-[#F0D4C5]';
      case 'REJECTED':
      case 'ABSENT':
      case 'TERMINATED':
      case 'FAILED':
        return 'bg-[#F9ECE7] text-[#B05335] border border-[#ECCDC3]';
      case 'ON_LEAVE':
      case 'CANCELLED':
        return 'bg-[#F5EFE9] text-[#7A624E] border border-[#DFD3C4]';
      default:
        return 'bg-[#ECEAE8] text-[#4A413C] border border-[#D8D2CD]';
    }
  }

  get dotClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'APPROVED':
      case 'ACTIVE':
      case 'SENT':
        return 'bg-[#2F6848]';
      case 'PENDING':
      case 'HALF_DAY':
        return 'bg-[#BB6C43]';
      case 'REJECTED':
      case 'ABSENT':
      case 'TERMINATED':
      case 'FAILED':
        return 'bg-[#B05335]';
      case 'ON_LEAVE':
      case 'CANCELLED':
        return 'bg-[#7A624E]';
      default:
        return 'bg-[#7A6F68]';
    }
  }
}
