import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  it('should render message when provided', () => {
    component.message = 'Test success alert';
    component.type = 'success';
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Test success alert');
    expect(component.containerClass).toContain('bg-emerald-50');
  });

  it('should emit dismiss event when close button clicked', () => {
    component.message = 'Notice';
    fixture.detectChanges();

    const dismissSpy = vi.spyOn(component.dismiss, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(dismissSpy).toHaveBeenCalled();
  });
});
