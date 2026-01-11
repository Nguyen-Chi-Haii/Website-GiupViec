import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="date-range-picker">
      <!-- Preset Buttons -->
      <div class="preset-buttons">
        <button 
          *ngFor="let preset of presets"
          (click)="selectPreset(preset)"
          [class.active]="selectedLabel() === preset.label"
          class="preset-btn">
          {{ preset.label }}
        </button>
      </div>

      <!-- Custom Date Range -->
      <div class="date-inputs">
        <div class="date-input-group">
          <span class="material-symbols-outlined">calendar_today</span>
          <input 
            type="date" 
            [ngModel]="customStart()" 
            (ngModelChange)="onCustomDateChange($event, 'start')"
            class="date-input">
        </div>
        <span class="separator">-</span>
        <div class="date-input-group">
          <span class="material-symbols-outlined">calendar_today</span>
          <input 
            type="date" 
            [ngModel]="customEnd()" 
            (ngModelChange)="onCustomDateChange($event, 'end')"
            class="date-input">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .date-range-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .preset-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .preset-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background: white;
      color: #638884;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .preset-btn:hover {
      background: #f6f8f8;
      border-color: #13b9a5;
    }

    .preset-btn.active {
      background: #13b9a5;
      color: white;
      border-color: #13b9a5;
    }

    .date-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 0.5rem 0.875rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .date-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-input-group .material-symbols-outlined {
      font-size: 1rem;
      color: #13b9a5;
    }

    .date-input {
      border: none;
      padding: 0;
      font-size: 0.875rem;
      color: #111817;
      background: transparent;
      cursor: pointer;
    }

    .date-input:focus {
      outline: none;
    }

    .separator {
      color: #d1d5db;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .date-range-picker {
        flex-direction: column;
        align-items: stretch;
      }

      .preset-buttons {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 0.5rem;
      }

      .date-inputs {
        width: 100%;
      }
    }
  `]
})
export class DateRangePickerComponent implements OnInit {
  @Input() initialStartDate?: string;
  @Input() initialEndDate?: string;
  @Output() rangeChange = new EventEmitter<{ startDate: string, endDate: string }>();

  selectedLabel = signal<string>('Tháng này');
  customStart = signal<string>('');
  customEnd = signal<string>('');

  presets: DateRange[] = [
    this.createPreset('Hôm nay', 0, 'day'),
    this.createPreset('Tuần này', 0, 'week'),
    this.createPreset('Tháng này', 0, 'month'),
    this.createPreset('Tháng trước', -1, 'month'),
    this.createPreset('Năm nay', 0, 'year')
  ];

  constructor() {}

  ngOnInit() {
    if (this.initialStartDate && this.initialEndDate) {
      this.customStart.set(this.initialStartDate);
      this.customEnd.set(this.initialEndDate);
      this.selectedLabel.set('Tuỳ chọn');
    } else {
      // Default select "Tháng này"
      const defaultPreset = this.presets[2];
      this.customStart.set(defaultPreset.startDate);
      this.customEnd.set(defaultPreset.endDate);
    }
  }

  selectPreset(preset: DateRange) {
    this.selectedLabel.set(preset.label);
    this.customStart.set(preset.startDate);
    this.customEnd.set(preset.endDate);
    this.emitChange();
  }

  onCustomDateChange(date: string, type: 'start' | 'end') {
    this.selectedLabel.set('Tuỳ chọn');
    if (type === 'start') this.customStart.set(date);
    else this.customEnd.set(date);
    
    if (this.customStart() && this.customEnd()) {
      this.emitChange();
    }
  }

  private emitChange() {
    this.rangeChange.emit({
      startDate: this.customStart(),
      endDate: this.customEnd()
    });
  }

  private createPreset(label: string, offset: number, unit: 'day' | 'week' | 'month' | 'year'): DateRange {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (unit === 'day') {
      start.setDate(today.getDate() + offset);
      end = start;
    } else if (unit === 'week') {
      // Assuming ISO week (Monday start)
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start.setDate(diff + (offset * 7));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (unit === 'month') {
      start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
    } else if (unit === 'year') {
      start = new Date(today.getFullYear() + offset, 0, 1);
      end = new Date(today.getFullYear() + offset, 11, 31);
    }

    return {
      label,
      startDate: this.formatDate(start),
      endDate: this.formatDate(end)
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
