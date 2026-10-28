import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() message: string | null = null;
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Output() dismiss = new EventEmitter<void>();

  get containerClass(): string {
    switch (this.type) {
      case 'success':
        return 'bg-[#EAF2ED] text-[#245239] border-[#C2D8CB]';
      case 'error':
        return 'bg-[#FDF0EB] text-[#A64426] border-[#F2C5B4]';
      case 'warning':
        return 'bg-[#FBEFE9] text-[#BB6C43] border-[#F0D4C5]';
      default:
        return 'bg-[#F7F3EE] text-[#4A413C] border-[#CCB499]';
    }
  }
}
