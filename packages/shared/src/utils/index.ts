/**
 * Format price to Vietnamese currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Format price with custom suffix
 */
export function formatPriceWithUnit(price: number, unit: string): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(price);
  return `${formatted}đ${unit}`;
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Format time to HH:mm
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Calculate total price
 */
export function calculateTotalPrice(pricePerHour: number, durationHours: number): number {
  return pricePerHour * durationHours;
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const regex: RegExp = /^(0|\+84)[0-9]{9}$/;
  return regex.test(phone);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const regex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
