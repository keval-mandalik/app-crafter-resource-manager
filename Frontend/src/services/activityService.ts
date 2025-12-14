import { api } from './api';
import type {
  Activity,
  ActivityParams,
  ActivityListResponse,
  ApiResponse
} from '../types';

/**
 * Activity API service for fetching resource activity history
 * Provides functions for retrieving audit trail information
 */
export class ActivityService {
  private static readonly BASE_PATH = '/activity';

  /**
   * Fetch activities for a specific resource
   * @param resourceId Resource ID
   * @param params Query parameters for pagination and filtering
   * @returns Promise resolving to paginated activity list
   */
  static async getResourceActivities(
    resourceId: string,
    params: ActivityParams = {}
  ): Promise<ActivityListResponse> {
    if (!resourceId || typeof resourceId !== 'string') {
      throw new Error('Resource ID is required and must be a string');
    }

    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    // if (params.page !== undefined) {
    //   queryParams.append('page', params.page.toString());
    // }
    // if (params.limit !== undefined) {
    //   queryParams.append('limit', params.limit.toString());
    // }
    
    // Add filter parameters
    if (params.actionType) {
      queryParams.append('actionType', params.actionType);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const queryString = queryParams.toString();
    const url = `${this.BASE_PATH}/resource/${resourceId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<ActivityListResponse>>(url);
    return response.data;
  }

  /**
   * Fetch activities for a specific user
   * @param userId User ID
   * @param params Query parameters for pagination and filtering
   * @returns Promise resolving to paginated activity list
   */
  static async getUserActivities(
    userId: string,
    params: ActivityParams = {}
  ): Promise<ActivityListResponse> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    // Add filter parameters
    if (params.actionType) {
      queryParams.append('actionType', params.actionType);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const queryString = queryParams.toString();
    const url = `${this.BASE_PATH}/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<ActivityListResponse>>(url);
    return response.data;
  }

  /**
   * Fetch all activities (admin/manager view)
   * @param params Query parameters for pagination and filtering
   * @returns Promise resolving to paginated activity list
   */
  static async getAllActivities(params: ActivityParams = {}): Promise<ActivityListResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    // Add filter parameters
    if (params.actionType) {
      queryParams.append('actionType', params.actionType);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const queryString = queryParams.toString();
    const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<ActivityListResponse>>(url);
    return response.data;
  }
}

// Export default instance for convenience
export default ActivityService;