import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ResourceFormData } from '../../utils/validation';
import { RESOURCE_TYPES, RESOURCE_STATUSES } from '../../utils/constants';
import type { Resource } from '../../types';

// Internal form schema that matches the form fields exactly
const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(RESOURCE_TYPES, {
    message: 'Please select a valid resource type',
  }),
  url: z.string().min(1, 'URL is required').url('Please enter a valid URL'),
  tags: z.string(),
  status: z.enum(RESOURCE_STATUSES),
});

type FormData = z.infer<typeof formSchema>;

interface ResourceFormProps {
  mode: 'create' | 'edit';
  initialData?: Resource;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          type: initialData.type,
          url: initialData.url,
          tags: initialData.tags || '',
          status: initialData.status,
        }
      : {
          title: '',
          description: '',
          type: 'Article',
          url: '',
          tags: '',
          status: 'Draft',
        },
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      // Transform form data to match ResourceFormData type
      const submitData = {
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        tags: data.tags.trim() || undefined, // Convert empty string to undefined
        status: data.status,
      } as ResourceFormData;
      await onSubmit(submitData);
      if (mode === 'create') {
        reset(); // Reset form after successful creation
      }
    } catch (error) {
      // Error handling is managed by the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      reset(); // Reset form when canceling creation
    }
    onCancel();
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6" id="form-title">
        {mode === 'create' ? 'Create New Resource' : 'Edit Resource'}
      </h1>

      <form 
        onSubmit={handleSubmit(handleFormSubmit)} 
        className="space-y-4 sm:space-y-6"
        aria-labelledby="form-title"
        noValidate
      >
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter resource title"
            aria-required="true"
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600" role="alert" id="title-error">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter resource description"
            aria-required="true"
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" role="alert" id="description-error">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Type Field */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            {...register('type')}
            id="type"
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={errors.type ? 'true' : 'false'}
            aria-describedby={errors.type ? 'type-error' : undefined}
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600" role="alert" id="type-error">
              {errors.type.message}
            </p>
          )}
        </div>

        {/* URL Field */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <input
            {...register('url')}
            type="url"
            id="url"
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.url ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com"
            aria-required="true"
            aria-invalid={errors.url ? 'true' : 'false'}
            aria-describedby={errors.url ? 'url-error' : undefined}
          />
          {errors.url && (
            <p className="mt-1 text-sm text-red-600" role="alert" id="url-error">
              {errors.url.message}
            </p>
          )}
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            {...register('tags')}
            type="text"
            id="tags"
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.tags ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter tags separated by commas"
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.tags.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Optional: Enter tags separated by commas (e.g., "javascript, tutorial, beginner")
          </p>
        </div>

        {/* Status Field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register('status')}
            id="status"
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {RESOURCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isFormDisabled}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isFormDisabled && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {mode === 'create' ? 'Create Resource' : 'Update Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;