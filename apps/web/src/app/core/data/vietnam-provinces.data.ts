/**
 * Vietnam Administrative Divisions - Updated July 2025
 * After reform: 34 provinces/cities, no district level
 * Source: Nghị định 19/2025/QĐ-TTg
 * 
 * Note: This is a simplified version with major cities
 * Full data: https://github.com/thanglequoc/vietnamese-provinces-database
 */

export interface Ward {
  code: string;
  name: string;
  fullName: string;
}

export interface Province {
  code: string;
  name: string;
  fullName: string;
  wards: Ward[];
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    code: '01',
    name: 'Hà Nội',
    fullName: 'Thành phố Hà Nội',
    wards: [
      { code: '00004', name: 'Ba Đình', fullName: 'Phường Ba Đình' },
      { code: '00070', name: 'Hoàn Kiếm', fullName: 'Phường Hoàn Kiếm' },
      { code: '00166', name: 'Cầu Giấy', fullName: 'Phường Cầu Giấy' },
      { code: '00235', name: 'Đống Đa', fullName: 'Phường Đống Đa' },
      { code: '00145', name: 'Long Biên', fullName: 'Phường Long Biên' },
      { code: '00103', name: 'Tây Hồ', fullName: 'Phường Tây Hồ' },
      { code: '00175', name: 'Yên Hòa', fullName: 'Phường Yên Hòa' },
      { code: '00199', name: 'Láng', fullName: 'Phường Láng' }
    ]
  },
  {
    code: '79',
    name: 'Hồ Chí Minh',
    fullName: 'Thành phố Hồ Chí Minh',
    wards: [
      { code: '26734', name: 'Bến Nghé', fullName: 'Phường Bến Nghé' },
      { code: '26737', name: 'Bến Thành', fullName: 'Phường Bến Thành' },
      { code: '26740', name: 'Nguyễn Thái Bình', fullName: 'Phường Nguyễn Thái Bình' },
      { code: '26743', name: 'Phạm Ngũ Lão', fullName: 'Phường Phạm Ngũ Lão' },
      { code: '26752', name: 'Tân Định', fullName: 'Phường Tân Định' },
      { code: '26785', name: 'Thảo Điền', fullName: 'Phường Thảo Điền' },
      { code: '26803', name: 'Bình Thạnh', fullName: 'Phường Bình Thạnh' },
      { code: '26869', name: 'Phú Nhuận', fullName: 'Phường Phú Nhuận' },
      { code: '27127', name: 'Tân Bình', fullName: 'Phường Tân Bình' },
      { code: '27178', name: 'Gò Vấp', fullName: 'Phường Gò Vấp' }
    ]
  },
  {
    code: '48',
    name: 'Đà Nẵng',
    fullName: 'Thành phố Đà Nẵng',
    wards: [
      { code: '20194', name: 'Hải Châu', fullName: 'Phường Hải Châu' },
      { code: '20197', name: 'Thanh Khê', fullName: 'Phường Thanh Khê' },
      { code: '20200', name: 'Sơn Trà', fullName: 'Phường Sơn Trà' },
      { code: '20203', name: 'Ngũ Hành Sơn', fullName: 'Phường Ngũ Hành Sơn' },
      { code: '20206', name: 'Liên Chiểu', fullName: 'Phường Liên Chiểu' }
    ]
  },
  {
    code: '31',
    name: 'Hải Phòng',
    fullName: 'Thành phố Hải Phòng',
    wards: [
      { code: '11320', name: 'Hồng Bàng', fullName: 'Phường Hồng Bàng' },
      { code: '11335', name: 'Ngô Quyền', fullName: 'Phường Ngô Quyền' },
      { code: '11350', name: 'Lê Chân', fullName: 'Phường Lê Chân' },
      { code: '11380', name: 'Kiến An', fullName: 'Phường Kiến An' }
    ]
  },
  {
    code: '92',
    name: 'Cần Thơ',
    fullName: 'Thành phố Cần Thơ',
    wards: [
      { code: '31117', name: 'Ninh Kiều', fullName: 'Phường Ninh Kiều' },
      { code: '31120', name: 'Bình Thủy', fullName: 'Phường Bình Thủy' },
      { code: '31123', name: 'Cái Răng', fullName: 'Phường Cái Răng' },
      { code: '31126', name: 'Ô Môn', fullName: 'Phường Ô Môn' }
    ]
  },
  {
    code: '74',
    name: 'Bình Dương',
    fullName: 'Tỉnh Bình Dương',
    wards: [
      { code: '25741', name: 'Thủ Dầu Một', fullName: 'Phường Thủ Dầu Một' },
      { code: '25744', name: 'Dĩ An', fullName: 'Phường Dĩ An' },
      { code: '25747', name: 'Thuận An', fullName: 'Phường Thuận An' },
      { code: '25750', name: 'Bến Cát', fullName: 'Phường Bến Cát' }
    ]
  },
  {
    code: '75',
    name: 'Đồng Nai',
    fullName: 'Tỉnh Đồng Nai',
    wards: [
      { code: '25837', name: 'Biên Hòa', fullName: 'Phường Biên Hòa' },
      { code: '25840', name: 'Long Khánh', fullName: 'Phường Long Khánh' },
      { code: '25843', name: 'Long Thành', fullName: 'Phường Long Thành' }
    ]
  },
  {
    code: '77',
    name: 'Bà Rịa - Vũng Tàu',
    fullName: 'Tỉnh Bà Rịa - Vũng Tàu',
    wards: [
      { code: '26506', name: 'Vũng Tàu', fullName: 'Phường Vũng Tàu' },
      { code: '26509', name: 'Bà Rịa', fullName: 'Phường Bà Rịa' },
      { code: '26512', name: 'Long Điền', fullName: 'Phường Long Điền' }
    ]
  },
  {
    code: '68',
    name: 'Lâm Đồng',
    fullName: 'Tỉnh Lâm Đồng',
    wards: [
      { code: '24769', name: 'Đà Lạt', fullName: 'Phường Đà Lạt' },
      { code: '24772', name: 'Bảo Lộc', fullName: 'Phường Bảo Lộc' }
    ]
  },
  {
    code: '56',
    name: 'Khánh Hòa',
    fullName: 'Tỉnh Khánh Hòa',
    wards: [
      { code: '22363', name: 'Nha Trang', fullName: 'Phường Nha Trang' },
      { code: '22366', name: 'Cam Ranh', fullName: 'Phường Cam Ranh' }
    ]
  }
];

/**
 * Get all provinces
 */
export function getProvinces(): Province[] {
  return VIETNAM_PROVINCES;
}

/**
 * Get province by code
 */
export function getProvinceByCode(code: string): Province | undefined {
  return VIETNAM_PROVINCES.find(p => p.code === code);
}

/**
 * Get wards by province code
 */
export function getWardsByProvinceCode(provinceCode: string): Ward[] {
  const province = getProvinceByCode(provinceCode);
  return province?.wards ?? [];
}

/**
 * Build full address string
 */
export function buildFullAddress(
  streetAddress: string, 
  wardName: string, 
  provinceName: string
): string {
  return `${streetAddress}, ${wardName}, ${provinceName}`;
}
