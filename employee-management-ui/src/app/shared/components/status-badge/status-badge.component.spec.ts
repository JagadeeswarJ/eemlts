import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should render correct class for PRESENT status', () => {
    component.status = 'PRESENT';
    fixture.detectChanges();

    expect(component.badgeClass).toContain('bg-emerald-50');
    expect(component.dotClass).toBe('bg-emerald-500');
  });

  it('should render correct class for PENDING status', () => {
    component.status = 'PENDING';
    fixture.detectChanges();

    expect(component.badgeClass).toContain('bg-amber-50');
    expect(component.dotClass).toBe('bg-amber-500');
  });

  it('should render correct class for REJECTED status', () => {
    component.status = 'REJECTED';
    fixture.detectChanges();

    expect(component.badgeClass).toContain('bg-rose-50');
    expect(component.dotClass).toBe('bg-rose-500');
  });
});
