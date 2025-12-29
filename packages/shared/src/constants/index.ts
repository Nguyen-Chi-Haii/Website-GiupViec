/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
  },
  SERVICES: {
    BASE: '/services',
    BY_ID: (id: number) => `/services/${id}`,
  },
  HELPER_PROFILES: {
    BASE: '/helperprofiles',
    BY_USER_ID: (userId: number) => `/helperprofiles/user/${userId}`,
    AVAILABLE: '/helperprofiles/available',
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: number) => `/bookings/${id}`,
    MY_BOOKINGS: '/bookings/my',
  },
  STATISTICS: {
    DASHBOARD: '/statistics/dashboard',
  },
} as const;

/**
 * App configuration
 */
export const APP_CONFIG = {
  APP_NAME: 'Giúp Việc Nhà',
  DEFAULT_LOCALE: 'vi',
  CURRENCY: 'VND',
  PHONE_COUNTRY_CODE: '+84',
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^(0|\+84)[0-9]{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
