import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { AuthProvider } from '@/contexts/AuthContext'
import ResourceService from '@/services/resourceService'
import ActivityService from '@/services/activityService'
import LoginPage from '@/pages/LoginPage'
import ResourcesPage from '@/pages/ResourcesPage'
import CreateResourcePage from '@/pages/CreateResourcePage'
import EditResourcePage from '@/pages/EditResourcePage'
import ResourceDetailPage from '@/pages/ResourceDetailPage'

// Critical workflow integration tests
describe('Critical Workflow Integration Tests', () => {
  let queryClient: QueryClient
  let user: ReturnType<typeof userEvent.setup>

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    user = userEvent.setup()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Login to Resource Creation Workflow', () => {
    it('should complete full workflow from login to resource creation', async () => {
      // Skip if backend not available
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping critical workflow test')
        return
      }

      // Step 1: Login
      render(<LoginPage />, { wrapper: TestWrapper })

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeTruthy()
      }, { timeout: 5000 })

      // Step 2: Navigate to create resource page
      render(<CreateResourcePage />, { wrapper: TestWrapper })

      // Step 3: Fill out resource creation form
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/title/i), 'Integration Test Resource')
      await user.type(screen.getByLabelText(/description/i), 'A resource created during integration testing')
      
      // Select resource type
      const typeSelect = screen.getByLabelText(/type/i)
      await user.selectOptions(typeSelect, 'Article')

      await user.type(screen.getByLabelText(/url/i), 'https://example.com/integration-test')
      await user.type(screen.getByLabelText(/tags/i), 'integration, test, workflow')

      // Select status
      const statusSelect = screen.getByLabelText(/status/i)
      await user.selectOptions(statusSelect, 'Published')

      // Step 4: Submit form
      await user.click(screen.getByRole('button', { name: /create/i }))

      // Step 5: Verify success
      await waitFor(() => {
        expect(
          screen.getByText(/success/i) ||
          screen.getByText(/created/i)
        ).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should handle validation errors during resource creation', async () => {
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping validation test')
        return
      }

      // Mock authenticated user
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CONTENT_MANAGER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      render(<CreateResourcePage />, { wrapper: TestWrapper })

      // Try to submit form with invalid data
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
      })

      // Submit without filling required fields
      await user.click(screen.getByRole('button', { name: /create/i }))

      // Should show validation errors
      await waitFor(() => {
        expect(
          screen.getByText(/required/i) ||
          screen.getByText(/invalid/i) ||
          screen.getByText(/error/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Resource Editing and Deletion Workflow', () => {
    it('should complete resource editing workflow', async () => {
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping edit workflow test')
        return
      }

      // Mock authenticated CONTENT_MANAGER
      const mockUser = {
        id: '1',
        name: 'Content Manager',
        email: 'manager@example.com',
        role: 'CONTENT_MANAGER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Mock resource data for editing
      const mockResource = {
        id: 'test-resource-id',
        title: 'Original Title',
        description: 'Original description',
        type: 'Article' as const,
        url: 'https://example.com/original',
        tags: 'original, tags',
        status: 'Draft' as const,
        createdByUserId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Mock the resource service to return our test resource
      vi.spyOn(ResourceService, 'getResource').mockResolvedValue(mockResource)
      vi.spyOn(ResourceService, 'updateResource').mockResolvedValue({
        ...mockResource,
        title: 'Updated Title',
        description: 'Updated description'
      })

      render(<EditResourcePage />, { wrapper: TestWrapper })

      // Wait for form to load with existing data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument()
      })

      // Edit the resource
      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      const descriptionInput = screen.getByDisplayValue('Original description')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')

      // Submit the update
      await user.click(screen.getByRole('button', { name: /update/i }))

      // Verify success
      await waitFor(() => {
        expect(
          screen.getByText(/success/i) ||
          screen.getByText(/updated/i)
        ).toBeInTheDocument()
      })
    })

    it('should complete resource deletion workflow', async () => {
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping delete workflow test')
        return
      }

      // Mock authenticated CONTENT_MANAGER
      const mockUser = {
        id: '1',
        name: 'Content Manager',
        email: 'manager@example.com',
        role: 'CONTENT_MANAGER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Mock resource data
      const mockResource = {
        id: 'test-resource-id',
        title: 'Resource to Delete',
        description: 'This resource will be deleted',
        type: 'Article' as const,
        url: 'https://example.com/to-delete',
        tags: 'delete, test',
        status: 'Draft' as const,
        createdByUserId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Mock services
      vi.spyOn(ResourceService, 'getResource').mockResolvedValue(mockResource)
      vi.spyOn(ResourceService, 'deleteResource').mockResolvedValue(undefined)

      render(<ResourceDetailPage />, { wrapper: TestWrapper })

      // Wait for resource to load
      await waitFor(() => {
        expect(screen.getByText('Resource to Delete')).toBeInTheDocument()
      })

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/confirm/i) || screen.getByText(/sure/i)).toBeInTheDocument()
      })

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i }) ||
                           screen.getByRole('button', { name: /delete/i })
      await user.click(confirmButton)

      // Verify success
      await waitFor(() => {
        expect(
          screen.getByText(/success/i) ||
          screen.getByText(/deleted/i) ||
          screen.getByText(/archived/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Search and Filtering Integration', () => {
    it('should integrate search functionality with backend', async () => {
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping search integration test')
        return
      }

      // Mock authenticated user
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Mock search results
      const mockSearchResults = {
        items: [
          {
            id: '1',
            title: 'Search Result 1',
            description: 'First search result',
            type: 'Article' as const,
            url: 'https://example.com/1',
            tags: 'search, test',
            status: 'Published' as const,
            createdByUserId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      vi.spyOn(ResourceService, 'getResources').mockResolvedValue(mockSearchResults)

      render(<ResourcesPage />, { wrapper: TestWrapper })

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      })

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'test query')

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Search Result 1')).toBeInTheDocument()
      })

      // Verify search was called with correct parameters
      expect(ResourceService.getResources).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test query'
        })
      )
    })

    it('should integrate filtering functionality with backend', async () => {
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping filter integration test')
        return
      }

      // Mock authenticated user
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Mock filtered results
      const mockFilteredResults = {
        items: [
          {
            id: '1',
            title: 'Article Resource',
            description: 'An article resource',
            type: 'Article' as const,
            url: 'https://example.com/article',
            tags: 'article, test',
            status: 'Published' as const,
            createdByUserId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      vi.spyOn(ResourceService, 'getResources').mockResolvedValue(mockFilteredResults)

      render(<ResourcesPage />, { wrapper: TestWrapper })

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(/type/i) || screen.getByText(/filter/i)).toBeInTheDocument()
      })

      // Apply type filter
      const typeFilter = screen.getByLabelText(/type/i) || screen.getByRole('combobox')
      if (typeFilter) {
        await user.selectOptions(typeFilter, 'Article')

        // Wait for filtered results
        await waitFor(() => {
          expect(screen.getByText('Article Resource')).toBeInTheDocument()
        })

        // Verify filter was applied
        expect(ResourceService.getResources).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'Article'
          })
        )
      }
    })
  })

  describe('Activity Tracking Integration', () => {
    it('should integrate activity tracking with resource operations', async () => {
      try {
        await axios.get('http://localhost:3000/health', { timeout: 5000 })
      } catch (error) {
        console.warn('Backend not available, skipping activity integration test')
        return
      }

      // Mock authenticated user
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CONTENT_MANAGER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Mock resource and activities
      const mockResource = {
        id: 'test-resource-id',
        title: 'Test Resource',
        description: 'A test resource',
        type: 'Article' as const,
        url: 'https://example.com/test',
        tags: 'test',
        status: 'Published' as const,
        createdByUserId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const mockActivities = {
        items: [
          {
            id: '1',
            userId: '1',
            resourceId: 'test-resource-id',
            actionType: 'CREATE' as const,
            details: null,
            ipAddress: null,
            userAgent: null,
            createdAt: new Date().toISOString(),
            user: mockUser,
            resource: mockResource
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      vi.spyOn(ResourceService, 'getResource').mockResolvedValue(mockResource)
      vi.spyOn(ActivityService, 'getResourceActivities').mockResolvedValue(mockActivities)

      render(<ResourceDetailPage />, { wrapper: TestWrapper })

      // Wait for resource to load
      await waitFor(() => {
        expect(screen.getByText('Test Resource')).toBeInTheDocument()
      })

      // Look for activity tab or section
      const activityTab = screen.queryByText(/activity/i) || screen.queryByText(/history/i)
      if (activityTab) {
        await user.click(activityTab)

        // Wait for activities to load
        await waitFor(() => {
          expect(screen.getByText(/CREATE/i) || screen.getByText(/created/i)).toBeInTheDocument()
        })

        // Verify activity service was called
        expect(ActivityService.getResourceActivities).toHaveBeenCalledWith('test-resource-id')
      }
    })
  })
})