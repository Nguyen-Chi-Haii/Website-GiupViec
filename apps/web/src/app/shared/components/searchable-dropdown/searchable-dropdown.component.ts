import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DropdownOption {
  code: number | string;
  name: string;
}

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="searchable-dropdown" [class.open]="isOpen()" [class.disabled]="disabled">
      <div class="dropdown-input" (click)="toggle()">
        <input
          type="text"
          [placeholder]="placeholder"
          [(ngModel)]="searchText"
          (input)="onSearch()"
          (focus)="open()"
          [disabled]="disabled"
          autocomplete="off"
        />
        <span class="dropdown-icon material-symbols-outlined">
          {{ isLoading ? 'sync' : (isOpen() ? 'expand_less' : 'expand_more') }}
        </span>
      </div>
      
      @if (isOpen()) {
        <div class="dropdown-menu">
          @if (filteredOptions.length === 0) {
            <div class="dropdown-empty">
              {{ isLoading ? 'Đang tải...' : 'Không tìm thấy kết quả' }}
            </div>
          } @else {
            @for (option of filteredOptions; track option.code) {
              <div 
                class="dropdown-item" 
                [class.selected]="isSelected(option)"
                (click)="selectOption(option)"
              >
                {{ option.name }}
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .searchable-dropdown {
      position: relative;
      width: 100%;
    }
    
    .dropdown-input {
      position: relative;
      display: flex;
      align-items: center;
      height: 3rem;
      border: 1px solid var(--border-color, #dce5e4);
      border-radius: 0.5rem;
      background: var(--bg-input, #fff);
      cursor: pointer;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    
    .searchable-dropdown.open .dropdown-input {
      border-color: var(--primary-color, #13b9a5);
      box-shadow: 0 0 0 1px var(--primary-color, #13b9a5);
    }
    
    .searchable-dropdown.disabled .dropdown-input {
      background: #f5f5f5;
      cursor: not-allowed;
    }
    
    .dropdown-input input {
      flex: 1;
      height: 100%;
      border: none;
      outline: none;
      padding: 0 40px 0 1rem;
      font-size: 1rem;
      background: transparent;
      cursor: inherit;
      color: var(--text-dark, #111817);
    }
    
    .dropdown-input input::placeholder {
      color: #638884;
    }
    
    .dropdown-input input:disabled {
      color: #999;
    }
    
    .dropdown-icon {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      padding: 0 12px;
      color: #638884;
      font-size: 20px;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .searchable-dropdown.open .dropdown-icon.sync {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 250px;
      overflow-y: auto;
      background: #fff;
      border: 1px solid var(--border-color, #e0e0e0);
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    
    .dropdown-item {
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    
    .dropdown-item:hover {
      background: var(--bg-hover, #f5f5f5);
    }
    
    .dropdown-item.selected {
      background: var(--primary-light, rgba(19, 185, 165, 0.1));
      color: var(--primary-color, #13b9a5);
      font-weight: 500;
    }
    
    .dropdown-empty {
      padding: 16px;
      text-align: center;
      color: #999;
      font-size: 0.9rem;
    }
  `]
})
export class SearchableDropdownComponent implements OnChanges {
  private readonly elementRef = inject(ElementRef);

  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Chọn hoặc tìm kiếm...';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() selectedCode: number | string | null = null;

  @Output() selectionChange = new EventEmitter<DropdownOption | null>();
  @Output() opened = new EventEmitter<void>();

  searchText = '';
  isOpen = signal(false);
  
  // Track mouse position to detect text selection vs click
  private mouseDownPos: { x: number; y: number } | null = null;
  
  // Filtered options as getter (recalculated on each access)
  get filteredOptions(): DropdownOption[] {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      return this.options;
    }
    return this.options.filter(opt => 
      this.removeVietnameseTones(opt.name.toLowerCase()).includes(this.removeVietnameseTones(search)) ||
      opt.name.toLowerCase().includes(search)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update display text when selectedCode or options change
    if (changes['selectedCode'] || changes['options']) {
      if (this.selectedCode !== null && this.selectedCode !== '') {
        const selected = this.options.find(o => 
          o.code === this.selectedCode || 
          String(o.code) === String(this.selectedCode)
        );
        if (selected) {
          this.searchText = selected.name;
        }
      } else if (this.selectedCode === '' || this.selectedCode === null) {
        this.searchText = '';
      }
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.mouseDownPos = { x: event.clientX, y: event.clientY };
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    // Check if user has selected any text (result of dragging)
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().length > 0;
    
    // Check if this was a drag (text selection) vs a click
    if (this.mouseDownPos) {
      const deltaX = Math.abs(event.clientX - this.mouseDownPos.x);
      const deltaY = Math.abs(event.clientY - this.mouseDownPos.y);
      
      // If mouse moved more than 3px OR there's text selected, it's a drag, not a click
      if (deltaX > 3 || deltaY > 3 || hasSelection) {
        this.mouseDownPos = null;
        return; // Don't close dropdown
      }
    }
    
    // Also check for text selection even without mouseDownPos tracking
    if (hasSelection) {
      return; // Don't close if user just selected text
    }
    
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
    
    this.mouseDownPos = null;
  }

  toggle(): void {
    if (this.disabled) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.opened.emit();
    }
  }

  open(): void {
    if (this.disabled) return;
    this.isOpen.set(true);
    this.opened.emit();
  }

  close(): void {
    this.isOpen.set(false);
    // Restore selected text if exists
    if (this.selectedCode !== null && this.selectedCode !== '') {
      const selected = this.options.find(o => 
        o.code === this.selectedCode || 
        String(o.code) === String(this.selectedCode)
      );
      if (selected) {
        this.searchText = selected.name;
      }
    }
  }

  onSearch(): void {
    if (!this.isOpen()) {
      this.open();
    }
  }

  selectOption(option: DropdownOption): void {
    this.searchText = option.name;
    this.selectionChange.emit(option);
    this.close();
  }

  isSelected(option: DropdownOption): boolean {
    return String(option.code) === String(this.selectedCode);
  }

  // Remove Vietnamese tones for better search
  private removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
}
