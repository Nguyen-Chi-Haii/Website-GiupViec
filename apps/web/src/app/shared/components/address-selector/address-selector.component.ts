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
  templateUrl: './address-selector.component.html',
  styleUrl: './address-selector.component.css'
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

    const normalizedAddress = this.removeVietnameseTones(this.initialAddress.toLowerCase());
    const parts = this.initialAddress.split(',').map(p => p.trim());
    
    // Try to find province
    const provinces = this.provinces();
    for (const province of provinces) {
      const normalizedProvince = this.removeVietnameseTones(province.name.toLowerCase());
      
      // Match province name in address (ignoring case and tones)
      if (normalizedAddress.includes(normalizedProvince)) {
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
            const normalizedWardName = this.removeVietnameseTones(wardName.toLowerCase());
            
            const matchedWard = wards.find(w => {
              const normalizedW = this.removeVietnameseTones(w.name.toLowerCase());
              return normalizedAddress.includes(normalizedW) || normalizedWardName.includes(normalizedW);
            });
            
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

  private removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
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
