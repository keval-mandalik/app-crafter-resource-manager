import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResourceService } from '../services/resourceService';
import type {
  Resource,
  CreateResourceData,
  UpdateResourceData,
  ResourceListParams,
  ResourceListResponse
} from '../types';

// Query keys for React Query
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourceListParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
};

/**
 * Hook for fetching paginated resources with search and filtering
 */
export function useResources(params: ResourceListParams = {}) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => ResourceService.getResources(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching a single resource by ID
 */
export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => ResourceService.getResource(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for creating a new resource with optimistic updates
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceData) => ResourceService.createResource(data),
    onMutate: async (newResource) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      // Snapshot the previous value
      const previousResources = queryClient.getQueriesData({ queryKey: resourceKeys.lists() });

      // Optimistically update to the new value
      queryClient.setQueriesData<ResourceListResponse>(
        { queryKey: resourceKeys.lists() },
        (old) => {
          if (!old) return old;
          
          // Create optimistic resource with temporary ID
          const optimisticResource: Resource = {
            id: `temp-${Date.now()}`,
            title: newResource.title,
            description: newResource.description,
            type: newResource.type,
            url: newResource.url,
            tags: newResource.tags || '',
            status: newResource.status || 'Draft',
            createdByUserId: 'current-user', // Will be replaced by server response
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            ...old,
            data: [optimisticResource, ...old.data],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousResources };
    },
    onError: (_err, _newResource, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousResources) {
        context.previousResources.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

/**
 * Hook for updating an existing resource with optimistic updates
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceData }) =>
      ResourceService.updateResource(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: resourceKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      // Snapshot the previous values
      const previousResource = queryClient.getQueryData(resourceKeys.detail(id));
      const previousResourceLists = queryClient.getQueriesData({ queryKey: resourceKeys.lists() });

      // Optimistically update the individual resource
      queryClient.setQueryData<Resource>(resourceKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      // Optimistically update the resource in all list queries
      queryClient.setQueriesData<ResourceListResponse>(
        { queryKey: resourceKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            data: old.data.map((resource: Resource) =>
              resource.id === id
                ? { ...resource, ...data, updatedAt: new Date().toISOString() }
                : resource
            ),
          };
        }
      );

      return { previousResource, previousResourceLists };
    },
    onError: (_err, { id }, context) => {
      // Roll back optimistic updates on error
      if (context?.previousResource) {
        queryClient.setQueryData(resourceKeys.detail(id), context.previousResource);
      }
      if (context?.previousResourceLists) {
        context.previousResourceLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

/**
 * Hook for deleting a resource with optimistic updates
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceService.deleteResource(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      // Snapshot the previous value
      const previousResourceLists = queryClient.getQueriesData({ queryKey: resourceKeys.lists() });

      // Optimistically remove the resource from all list queries
      queryClient.setQueriesData<ResourceListResponse>(
        { queryKey: resourceKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            data: old.data.filter((resource: Resource) => resource.id !== id),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
      );

      return { previousResourceLists };
    },
    onError: (_err, _id, context) => {
      // Roll back optimistic updates on error
      if (context?.previousResourceLists) {
        context.previousResourceLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}