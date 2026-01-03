import { z } from 'zod';

/**
 * Validation schemas for forms and API data
 * Uses Zod for runtime type checking and validation
 */

// Email validation
const emailSchema = z.string().email('Invalid email format');

// URL validation (optional, allows empty string)
const optionalUrlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

// Prospect/Contact validation
export const prospectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  company: z.string().min(1, 'Company is required').max(100, 'Company name too long'),
  title: z.string().max(100).optional(),
  linkedin_url: optionalUrlSchema,
  notes: z.string().max(1000, 'Notes too long').optional(),
  job_title: z.string().max(100).optional(),
  deal_value: z.string().max(50).optional(),
});

// Run creation validation
export const createRunSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  searchUrl: z.string().url('Invalid LinkedIn search URL'),
  messageTemplate: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  dailyLimit: z.number().min(1).max(100).optional(),
});

// Task validation
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  prospect_id: z.string().optional(),
});

// Member invitation validation
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['Admin', 'Member']),
});

/**
 * Validate data against a schema
 * @returns Object with success status, validated data, and errors
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.') || 'form';
    errors[path] = err.message;
  });
  return { success: false, errors };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
