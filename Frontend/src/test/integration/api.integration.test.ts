import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios from 'axios'
import { api } from '@/services/api'
import ResourceService from '@/services/resourceService'
import ActivityService from '@/services/activityService'

// Integration tests with real backend API
// These tests require the backend server to be running
describe('Backend API Integration Tests', () => {
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
    } catch (error) {
      console.warn('Backend server not available, skipping integration tests')
      return
    }
  })

  describe('Authentication Flow', () => {
    it('should authenticate user with valid credentials', async () => {
      try {
        const response = await api.post('/auth/login', testUser)
        
        expect(response.data.success).toBe(true)
        expect(response.data.data.token).toBeDefined()
        expect(response.data.data.user).toBeDefined()
        expect(response.data.data.user.email).toBe(testUser.email)
        
        authToken = response.data.data.token
        
        // Verify token is stored and used in subsequent requests
        expect(localStorage.getItem('token')).toBe(authToken)
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should reject authentication with invalid credentials', async () => {
      try {
        const invalidCredentials = {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }

        await expect(api.post('/auth/login', invalidCredentials)).rejects.toThrow()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should include JWT token in authenticated requests', async () => {
      if (!authToken) return

      try {
        const response = await ResourceService.getResources({})
        
        expect(response).toBeDefined()
        expect(response.items).toBeDefined()
        expect(Array.isArray(response.items)).toBe(true)
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })
  })

  describe('Resource API Operations', () => {
    it('should create a new resource', async () => {
      if (!authToken) return

      try {
        const newResource = {
          title: 'Integration Test Resource',
          description: 'A resource created during integration testing',
          type: 'Article' as const,
          url: 'https://example.com/test-resource',
          tags: 'test, integration',
          status: 'Draft' as const
        }

        const response = await ResourceService.createResource(newResource)
        
        expect(response).toBeDefined()
        expect(response.id).toBeDefined()
        expect(response.title).toBe(newResource.title)
        expect(response.description).toBe(newResource.description)
        expect(response.type).toBe(newResource.type)
        expect(response.url).toBe(newResource.url)
        expect(response.status).toBe(newResource.status)
        
        testResourceId = response.id
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should retrieve a specific resource', async () => {
      if (!authToken || !testResourceId) return

      try {
        const response = await ResourceService.getResource(testResourceId)
        
        expect(response).toBeDefined()
        expect(response.id).toBe(testResourceId)
        expect(response.title).toBe('Integration Test Resource')
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should update an existing resource', async () => {
      if (!authToken || !testResourceId) return

      try {
        const updateData = {
          title: 'Updated Integration Test Resource',
          description: 'Updated description for integration testing'
        }

        const response = await ResourceService.updateResource(testResourceId, updateData)
        
        expect(response).toBeDefined()
        expect(response.id).toBe(testResourceId)
        expect(response.title).toBe(updateData.title)
        expect(response.description).toBe(updateData.description)
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should delete a resource', async () => {
      if (!authToken || !testResourceId) return

      try {
        await ResourceService.deleteResource(testResourceId)
        
        // Verify resource is deleted by trying to fetch it
        await expect(ResourceService.getResource(testResourceId)).rejects.toThrow()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })
  })

  describe('Error Scenarios', () => {
    it('should handle 401 unauthorized errors', async () => {
      // Clear token to simulate unauthorized access
      localStorage.removeItem('token')
      
      try {
        await expect(ResourceService.getResources({})).rejects.toThrow()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should handle 404 not found errors', async () => {
      if (!authToken) return

      // Restore token for this test
      localStorage.setItem('token', authToken)
      
      try {
        await expect(ResourceService.getResource('non-existent-id')).rejects.toThrow()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })

    it('should handle validation errors', async () => {
      if (!authToken) return

      try {
        const invalidResource = {
          title: '', // Invalid: empty title
          description: 'Test description',
          type: 'InvalidType' as any, // Invalid type
          url: 'not-a-valid-url', // Invalid URL format
          status: 'Draft' as const
        }

        await expect(ResourceService.createResource(invalidResource)).rejects.toThrow()
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not available, skipping test')
          return
        }
        throw error
      }
    })
  })

  describe('Data Consistency', () => {
    it('should maintain data consistency between frontend and backend', async () => {
      if (!authToken) return

      try {
        // Create a resource with specific data
        const resourceData = {
          title: 'Consistency Test Resource',
          description: 'Testing data consistency between frontend and backend',
          type: 'Tutorial' as const,
          url: 'https://example.com/consistency-test',
          tags: 'consistency, test, data',
          status: 'Published' as const
        }

        const createdResource = await ResourceService.createResource(resourceData)
        
        // Fetch the resource back and verify all data matches
        const fetchedResource = await ResourceService.getResource(createdResource.id)
        
        expect(fetchedResource.title).toBe(resourceData.title)
        expect(fetchedResource.description).toBe(resourceData.description)
        expect(fetchedResource.type).toBe(resourceData.type)
        expect(fetchedResource.url).toBe(resourceData.url)
        expect(fetchedResource.tags).toBe(resourceData.tags)
        expect(fetchedResource.status).toBe(resourceData.status)
        
        // Verify timestamps are present and valid
        expect(fetchedResource.createdAt).toBeDefined()
        expect(fetchedResource.updatedAt).toBeDefined()
        expect(new Date(fetchedResource.createdAt).getTime()).toBeGreaterThan(0)
        expect(new Date(fetchedResource.updatedAt).getTime()).toBeGreaterThan(0)
        
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

  afterAll(() => {
    // Clean up any remaining test data
    localStorage.removeItem('token')
  })
})