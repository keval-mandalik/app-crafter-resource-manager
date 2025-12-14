// Core type definitions for the Frontend Resource Manager

// Enum types as const assertions
export const UserRole = {
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  VIEWER: 'VIEWER'
} as const;

export const ResourceType = {
  Article: 'Article',
  Video: 'Video',
  Tutorial: 'Tutorial'
} as const;

export const ResourceStatus = {
  Draft: 'Draft',
  Published: 'Published',
  Archived: 'Archived'
} as const;

export const ActionType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type ResourceType = typeof ResourceType[keyof typeof ResourceType];
export type ResourceStatus = typeof ResourceStatus[keyof typeof ResourceStatus];
export type ActionType = typeof ActionType[keyof typeof ActionType];

// Core data models
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  tags: string;
  status: ResourceStatus;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  resourceId: string | null;
  actionType: ActionType;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  resource: {
    id: string;
    title: string;
    type: string;
    status: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponseActivity<T> {
  activities: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Form data types for create/update operations
export interface CreateResourceData {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  tags?: string;
  status?: ResourceStatus;
}

export interface UpdateResourceData extends Partial<CreateResourceData> {
  id?: string; // Include id for update operations
}

// Query parameter types
export interface ResourceListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ResourceType;
  status?: ResourceStatus;
}

export interface ActivityParams {
  page?: number;
  limit?: number;
  actionType?: ActionType;
  startDate?: string;
  endDate?: string;
}

export type ResourceListResponse = PaginatedResponse<Resource>;
export type ActivityListResponse = PaginatedResponseActivity<Activity>;
