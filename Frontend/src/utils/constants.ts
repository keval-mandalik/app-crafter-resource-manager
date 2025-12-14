// Application constants

export const RESOURCE_TYPES = ['Article', 'Video', 'Tutorial'] as const;
export const RESOURCE_STATUSES = ['Draft', 'Published', 'Archived'] as const;
export const USER_ROLES = ['CONTENT_MANAGER', 'VIEWER'] as const;
export const ACTION_TYPES = ['CREATE', 'UPDATE', 'DELETE', 'VIEW'] as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  RESOURCES: {
    BASE: '/resource',
    BY_ID: (id: string) => `/resource/${id}`,
  },
  ACTIVITIES: {
    BASE: '/activity',
    BY_RESOURCE: (resourceId: string) => `/activity/resource/${resourceId}`,
    BY_USER: (userId: string) => `/activity/user/${userId}`,
  },
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
} as const;
