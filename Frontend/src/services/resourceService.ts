import { api } from './api';
import type {
  Resource,
  CreateResourceData,
  UpdateResourceData,
  ResourceListParams,
  ResourceListResponse,
  ApiResponse
} from '../types';

/**
 * Resource API service for managing learning resources
 * Provides functions for CRUD operations with proper error handling and response parsing
 */
export class ResourceService {
  private static readonly BASE_PATH = '/resource';

  /**
   * Fetch a paginated list of resources with optional filtering
   * @param params Query parameters for pagination, search, and filtering
   * @returns Promise resolving to paginated resource list
   */
  static async getResources(params: ResourceListParams = {}): Promise<ResourceListResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    // Add search parameter
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }
    
    // Add filter parameters
    if (params.type) {
      queryParams.append('type', params.type);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }

    const queryString = queryParams.toString();
    const url = `${this.BASE_PATH}/list${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<ResourceListResponse>>(url);
    return response.data;
  }

  /**
   * Fetch a single resource by ID
   * @param id Resource ID
   * @returns Promise resolving to resource data
   */
  static async getResource(id: string): Promise<Resource> {
    if (!id || typeof id !== 'string') {
      throw new Error('Resource ID is required and must be a string');
    }

    const response = await api.get<ApiResponse<Resource>>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create a new resource
   * @param data Resource creation data
   * @returns Promise resolving to created resource
   */
  static async createResource(data: CreateResourceData): Promise<Resource> {
    // Validate required fields
    if (!data.title || !data.description || !data.type || !data.url) {
      throw new Error('Title, description, type, and URL are required fields');
    }

    // Validate URL format
    try {
      new URL(data.url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Validate resource type
    const validTypes = ['Article', 'Video', 'Tutorial'];
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid resource type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ['Draft', 'Published', 'Archived'];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    const response = await api.post<ApiResponse<Resource>>(`${this.BASE_PATH}/add`, data);
    return response.data;
  }

  /**
   * Update an existing resource
   * @param id Resource ID
   * @param data Resource update data
   * @returns Promise resolving to updated resource
   */
  static async updateResource(id: string, data: UpdateResourceData): Promise<Resource> {
    if (!id || typeof id !== 'string') {
      throw new Error('Resource ID is required and must be a string');
    }

    // Validate URL format if provided
    if (data.url) {
      try {
        new URL(data.url);
      } catch {
        throw new Error('Invalid URL format');
      }
    }

    // Validate resource type if provided
    if (data.type) {
      const validTypes = ['Article', 'Video', 'Tutorial'];
      if (!validTypes.includes(data.type)) {
        throw new Error(`Invalid resource type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ['Draft', 'Published', 'Archived'];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    const response = await api.put<ApiResponse<Resource>>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete (archive) a resource
   * @param id Resource ID
   * @returns Promise resolving when deletion is complete
   */
  static async deleteResource(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Resource ID is required and must be a string');
    }

    // Backend returns { status: 1, message: "Resource deleted successfully", data: { message: "...", data: [...] } }
    const response = await api.delete<any>(`${this.BASE_PATH}/${id}`);
    
    // Check if the delete was successful
    if (response.status !== 1) {
      throw new Error(response.message || 'Failed to delete resource');
    }
    
    // Return void as expected
    return;
  }
}

// Export default instance for convenience
export default ResourceService;