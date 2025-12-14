import { z } from 'zod';
import { RESOURCE_TYPES, RESOURCE_STATUSES } from './constants';

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Resource form validation schema
export const resourceSchema = z.object({
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
  tags: z
    .string()
    .optional()
    .transform((val) => val || ''),
  status: z.enum(RESOURCE_STATUSES).optional().default('Draft'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResourceFormData = z.infer<typeof resourceSchema>;
