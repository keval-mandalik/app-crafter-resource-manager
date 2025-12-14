import { useQuery } from '@tanstack/react-query';
import { ActivityService } from '../services/activityService';
import type { ActivityParams } from '../types';

// Query keys for React Query
export const activityKeys = {
  all: ['activities'] as const,
  resource: (resourceId: string) => [...activityKeys.all, 'resource', resourceId] as const,
  resourceWithParams: (resourceId: string, params: ActivityParams) => 
    [...activityKeys.resource(resourceId), params] as const,
  user: (userId: string) => [...activityKeys.all, 'user', userId] as const,
  userWithParams: (userId: string, params: ActivityParams) => 
    [...activityKeys.user(userId), params] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (params: ActivityParams) => [...activityKeys.lists(), params] as const,
};

/**
 * Hook for fetching activities for a specific resource
 */
export function useResourceActivities(resourceId: string, params: ActivityParams = {}) {
  return useQuery({
    queryKey: activityKeys.resourceWithParams(resourceId, params),
    queryFn: () => ActivityService.getResourceActivities(resourceId, params),
    enabled: !!resourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes (activities change less frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching activities for a specific user
 */
export function useUserActivities(userId: string, params: ActivityParams = {}) {
  return useQuery({
    queryKey: activityKeys.userWithParams(userId, params),
    queryFn: () => ActivityService.getUserActivities(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching all activities (admin/manager view)
 */
export function useAllActivities(params: ActivityParams = {}) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => ActivityService.getAllActivities(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}