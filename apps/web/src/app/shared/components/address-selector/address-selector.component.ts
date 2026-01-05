import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VietnamProvincesService } from '../../../core/services/vietnam-provinces.service';
import { ProvinceResponse, WardResponse } from '../../../core/types/vietnam-provinces.types';
import { SearchableDropdownComponent, DropdownOption } from '../searchable-dropdown/searchable-dropdown.component';

export interface AddressResult {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  streetAddress: string;
  fullAddress: string;
}

@Component({
  selector: 'app-address-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent],
  template: `
    <div class="address-selector">
      <div class="form-grid">
        <!-- Tỉnh/Thành -->
        <div class="form-group">
          <label>Tỉnh/Thành phố <span class="required">*</span></label>
          <app-searchable-dropdown
            [options]="provinceOptions()"
            [selectedCode]="selectedProvinceCode"
            [isLoading]="isLoadingProvinces()"
            placeholder="Chọn Tỉnh/Thành"
            (selectionChange)="onProvinceSelect($event)"
          ></app-searchable-dropdown>
        </div>

        <!-- Phường/Xã -->
        <div class="form-group">
          <label>Phường/Xã <span class="required">*</span></label>
          <app-searchable-dropdown
            [options]="wardOptions()"
            [selectedCode]="selectedWardCode"
            [isLoading]="isLoadingWards()"
            [disabled]="!selectedProvinceCode"
            placeholder="Chọn Phường/Xã"
            (selectionChange)="onWardSelect($event)"
          ></app-searchable-dropdown>
        </div>

        <!-- Địa chỉ chi tiết -->
        <div class="form-group full-width">
          <label>Số nhà, tên đường <span class="required">*</span></label>
          <input
            type="text"
            [(ngModel)]="streetAddress"
            (input)="onStreetChange()"
            placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
            class="street-input"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .address-selector { width: 100%; box-sizing: border-box; }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; width: 100%; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--text-dark, #111817); }
    .required { color: #ef4444; }
    .street-input {
      width: 100%;
      height: 3rem;
      padding: 0 1rem;
      font-size: 1rem;
      border: 1px solid #dce5e4;
      border-radius: 0.5rem;
      background-color: white;
      color: var(--text-dark, #111817);
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    .street-input:focus { outline: none; border-color: var(--primary-color, #13b9a5); box-shadow: 0 0 0 1px var(--primary-color); }
    
    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full-width { grid-column: span 1; }
    }
  `]
})
export class AddressSelectorComponent implements OnInit, OnChanges {
  private readonly provincesService = inject(VietnamProvincesService);

  @Input() initialAddress = '';
  @Output() addressChange = new EventEmitter<AddressResult>();

  selectedProvinceCode = '';
  selectedWardCode = '';
  streetAddress = '';

  provinces = signal<ProvinceResponse[]>([]);
  wards = signal<WardResponse[]>([]);
  isLoadingProvinces = signal(false);
  isLoadingWards = signal(false);

  provinceOptions = computed<DropdownOption[]>(() => 
    this.provinces().map(p => ({ code: String(p.code), name: p.name }))
  );

  wardOptions = computed<DropdownOption[]>(() => 
    this.wards().map(w => ({ code: String(w.code), name: w.name }))
  );

  ngOnInit(): void {
    this.loadProvinces();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialAddress'] && this.initialAddress) {
      // Small delay to ensure provinces are loaded
      setTimeout(() => this.parseInitialAddress(), 500);
    }
  }

  private loadProvinces(): void {
    this.isLoadingProvinces.set(true);
    this.provincesService.getProvinces().subscribe({
      next: (data) => {
        this.provinces.set(data);
        this.isLoadingProvinces.set(false);
        if (this.initialAddress) {
          this.parseInitialAddress();
        }
      },
      error: () => this.isLoadingProvinces.set(false)
    });
  }

  private parseInitialAddress(): void {
    if (!this.initialAddress || this.provinces().length === 0) return;

    const parts = this.initialAddress.split(',').map(p => p.trim());
    
    // Try to find province
    const provinces = this.provinces();
    for (const province of provinces) {
      if (this.initialAddress.includes(province.name)) {
        this.selectedProvinceCode = String(province.code);
        
        // Street address is usually the first part
        if (parts.length >= 1) {
          this.streetAddress = parts[0];
        }

        // Load wards and match
        this.isLoadingWards.set(true);
        this.provincesService.getWardsByProvince(province.code).subscribe(wards => {
          this.wards.set(wards);
          this.isLoadingWards.set(false);

          if (parts.length >= 2) {
            const wardName = parts[1];
            const matchedWard = wards.find(w => 
              this.initialAddress.includes(w.name) || wardName.includes(w.name)
            );
            if (matchedWard) {
              this.selectedWardCode = String(matchedWard.code);
            }
          }
          this.emitChange();
        });
        break;
      }
    }
  }

  onProvinceSelect(option: DropdownOption | null): void {
    this.selectedProvinceCode = option ? String(option.code) : '';
    this.selectedWardCode = '';
    this.wards.set([]);

    if (this.selectedProvinceCode) {
      this.isLoadingWards.set(true);
      this.provincesService.getWardsByProvince(Number(this.selectedProvinceCode)).subscribe({
        next: (data) => {
          this.wards.set(data);
          this.isLoadingWards.set(false);
          this.emitChange();
        },
        error: () => this.isLoadingWards.set(false)
      });
    } else {
      this.emitChange();
    }
  }

  onWardSelect(option: DropdownOption | null): void {
    this.selectedWardCode = option ? String(option.code) : '';
    this.emitChange();
  }

  onStreetChange(): void {
    this.emitChange();
  }

  private emitChange(): void {
    const province = this.provinces().find(p => String(p.code) === this.selectedProvinceCode);
    const ward = this.wards().find(w => String(w.code) === this.selectedWardCode);

    const result: AddressResult = {
      provinceCode: this.selectedProvinceCode,
      provinceName: province?.name || '',
      wardCode: this.selectedWardCode,
      wardName: ward?.name || '',
      streetAddress: this.streetAddress.trim(),
      fullAddress: this.buildFullAddress(province?.name, ward?.name)
    };

    this.addressChange.emit(result);
  }

  private buildFullAddress(provinceName?: string, wardName?: string): string {
    const parts = [];
    if (this.streetAddress.trim()) parts.push(this.streetAddress.trim());
    if (wardName) parts.push(wardName);
    if (provinceName) parts.push(provinceName);
    return parts.join(', ');
  }
}
