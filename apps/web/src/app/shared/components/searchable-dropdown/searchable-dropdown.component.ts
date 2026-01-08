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
  templateUrl: './searchable-dropdown.component.html',
  styleUrl: './searchable-dropdown.component.css'
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
