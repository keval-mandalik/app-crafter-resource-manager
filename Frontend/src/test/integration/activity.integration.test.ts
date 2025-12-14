import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'
import { api } from '@/services/api'
import ResourceService from '@/services/resourceService'
import ActivityService from '@/services/activityService'

// Integration tests for activity tracking with real backend
describe('Activity Tracking Integration Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  }

  let authToken: string
  let testResourceId: string

  beforeAll(async () => {
    // Skip tests if backend is not available
    try {
      await axios.get('http://localhost:3000/health', { timeout: 5000 })
      
      // Login to get auth token
      const response = await api.post('/auth/login', testUser)
      authToken = response.data.data.token
      localStorage.setItem('token', authToken)
    } catch (error) {
      console.warn('Backend server not available, skipping activity integration tests')
      return
    }
  })

  describe('Activity Generation', () => {
    it('should generate CREATE activity when resource is created', async () => {
      if (!authToken) return

      try {
        // Create a resource
        const resourceData = {
          title: 'Activity Test Resource',
          description: 'Testing activity generation',
          type: 'Article' as const,
          url: 'https://example.com/activity-test',
          status: 'Draft' as const
        }

        const createdResource = await ResourceService.createResource(resourceData)
        testResourceId = createdResource.id

        // Wait a moment for activity to be recorded
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch activities for the resource
        const activities = await ActivityService.getResourceActivities(testResourceId)
        
        expect(activities.items).toBeDefined()
        expect(activities.items.length).toBeGreaterThan(0)
        
        // Find the CREATE activity
        const createActivity = activities.items.find(activity => 
          activity.actionType === 'CREATE' && activity.resourceId === testResourceId
        )
        
        expect(createActivity).toBeDefined()
        expect(createActivity?.actionType).toBe('CREATE')
        expect(createActivity?.resourceId).toBe(testResourceId)
        expect(createActivity?.user).toBeDefined()
        expect(createActivity?.resource).toBeDefined()
        expect(createActivity?.createdAt).toBeDefined()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should generate UPDATE activity when resource is modified', async () => {
      if (!authToken || !testResourceId) return

      try {
        // Update the resource
        const updateData = {
          title: 'Updated Activity Test Resource',
          description: 'Updated for activity testing'
        }

        await ResourceService.updateResource(testResourceId, updateData)

        // Wait a moment for activity to be recorded
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch activities for the resource
        const activities = await ActivityService.getResourceActivities(testResourceId)
        
        // Find the UPDATE activity
        const updateActivity = activities.items.find(activity => 
          activity.actionType === 'UPDATE' && activity.resourceId === testResourceId
        )
        
        expect(updateActivity).toBeDefined()
        expect(updateActivity?.actionType).toBe('UPDATE')
        expect(updateActivity?.resourceId).toBe(testResourceId)
        expect(updateActivity?.user).toBeDefined()
        expect(updateActivity?.resource).toBeDefined()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should generate DELETE activity when resource is archived', async () => {
      if (!authToken || !testResourceId) return

      try {
        // Delete the resource
        await ResourceService.deleteResource(testResourceId)

        // Wait a moment for activity to be recorded
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch activities for the resource (should still be accessible for deleted resources)
        const activities = await ActivityService.getResourceActivities(testResourceId)
        
        // Find the DELETE activity
        const deleteActivity = activities.items.find(activity => 
          activity.actionType === 'DELETE' && activity.resourceId === testResourceId
        )
        
        expect(deleteActivity).toBeDefined()
        expect(deleteActivity?.actionType).toBe('DELETE')
        expect(deleteActivity?.resourceId).toBe(testResourceId)
        expect(deleteActivity?.user).toBeDefined()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })
  })

  describe('Activity Data Integrity', () => {
    it('should include complete user information in activities', async () => {
      if (!authToken) return

      try {
        // Create a resource to generate activity
        const resourceData = {
          title: 'User Info Test Resource',
          description: 'Testing user information in activities',
          type: 'Video' as const,
          url: 'https://example.com/user-info-test',
          status: 'Published' as const
        }

        const createdResource = await ResourceService.createResource(resourceData)
        
        // Wait for activity to be recorded
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch activities
        const activities = await ActivityService.getResourceActivities(createdResource.id)
        const createActivity = activities.items.find(activity => 
          activity.actionType === 'CREATE'
        )
        
        expect(createActivity?.user).toBeDefined()
        expect(createActivity?.user.id).toBeDefined()
        expect(createActivity?.user.name).toBeDefined()
        expect(createActivity?.user.email).toBeDefined()
        expect(createActivity?.user.role).toBeDefined()
        
        // Clean up
        await ResourceService.deleteResource(createdResource.id)
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should include complete resource information in activities', async () => {
      if (!authToken) return

      try {
        // Create a resource to generate activity
        const resourceData = {
          title: 'Resource Info Test',
          description: 'Testing resource information in activities',
          type: 'Tutorial' as const,
          url: 'https://example.com/resource-info-test',
          status: 'Draft' as const
        }

        const createdResource = await ResourceService.createResource(resourceData)
        
        // Wait for activity to be recorded
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch activities
        const activities = await ActivityService.getResourceActivities(createdResource.id)
        const createActivity = activities.items.find(activity => 
          activity.actionType === 'CREATE'
        )
        
        expect(createActivity?.resource).toBeDefined()
        expect(createActivity?.resource?.id).toBe(createdResource.id)
        expect(createActivity?.resource?.title).toBe(resourceData.title)
        expect(createActivity?.resource?.type).toBe(resourceData.type)
        expect(createActivity?.resource?.status).toBe(resourceData.status)
        
        // Clean up
        await ResourceService.deleteResource(createdResource.id)
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })
  })

  describe('Activity Pagination and Filtering', () => {
    it('should support pagination for activity lists', async () => {
      if (!authToken) return

      try {
        // Get activities with pagination
        const page1 = await ActivityService.getAllActivities({ page: 1, limit: 5 })
        
        expect(page1.pagination).toBeDefined()
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.limit).toBe(5)
        expect(page1.pagination.total).toBeGreaterThanOrEqual(0)
        expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(0)
        expect(page1.items.length).toBeLessThanOrEqual(5)
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should support filtering activities by action type', async () => {
      if (!authToken) return

      try {
        // Get only CREATE activities
        const createActivities = await ActivityService.getAllActivities({ 
          actionType: 'CREATE' 
        })
        
        expect(createActivities.items).toBeDefined()
        
        // All returned activities should be CREATE type
        createActivities.items.forEach(activity => {
          expect(activity.actionType).toBe('CREATE')
        })
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })
  })
})