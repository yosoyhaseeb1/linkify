/**
 * Example: Accessible Form Component
 * Demonstrates best practices for form accessibility with ARIA labels and roles
 */

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormData {
  email: string;
  name: string;
  jobTitle: string;
  message: string;
}

interface FormErrors {
  email?: string;
  name?: string;
  jobTitle?: string;
  message?: string;
}

export function AccessibleFormExample() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    jobTitle: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors: FormErrors = { ...errors };

    switch (field) {
      case 'email':
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'name':
        if (!formData.name) {
          newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'jobTitle':
        if (!formData.jobTitle) {
          newErrors.jobTitle = 'Job title is required';
        } else {
          delete newErrors.jobTitle;
        }
        break;
      case 'message':
        if (!formData.message) {
          newErrors.message = 'Message is required';
        } else if (formData.message.length < 10) {
          newErrors.message = 'Message must be at least 10 characters';
        } else {
          delete newErrors.message;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const fields = ['email', 'name', 'jobTitle', 'message'];
    fields.forEach(validateField);
    
    const newErrors: FormErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!formData.message) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form
    setFormData({ email: '', name: '', jobTitle: '', message: '' });
    setTouched({});

    // Hide success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-2xl mx-auto p-6 space-y-6"
      aria-label="Contact form"
      noValidate
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
        <p className="text-muted-foreground">Fill out the form below and we'll get back to you.</p>
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-4 bg-success/10 border border-success/20 rounded-lg text-success"
        >
          ✓ Form submitted successfully! We'll be in touch soon.
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label 
          htmlFor="email-input" 
          id="email-label"
          className="block text-sm font-medium text-foreground"
        >
          Email Address
          <span aria-label="required" className="text-destructive ml-1">*</span>
        </label>
        <input
          id="email-input"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          aria-labelledby="email-label"
          aria-describedby={errors.email ? 'email-error' : 'email-hint'}
          aria-invalid={!!errors.email}
          aria-required="true"
          className={`w-full px-4 py-2 bg-input-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.email && touched.email ? 'border-destructive' : 'border-border'
          }`}
          placeholder="you@example.com"
        />
        <p id="email-hint" className="text-xs text-muted-foreground">
          We'll never share your email with anyone else.
        </p>
        {errors.email && touched.email && (
          <div 
            id="email-error" 
            role="alert" 
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <label 
          htmlFor="name-input" 
          id="name-label"
          className="block text-sm font-medium text-foreground"
        >
          Full Name
          <span aria-label="required" className="text-destructive ml-1">*</span>
        </label>
        <input
          id="name-input"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur('name')}
          aria-labelledby="name-label"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
          aria-required="true"
          className={`w-full px-4 py-2 bg-input-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.name && touched.name ? 'border-destructive' : 'border-border'
          }`}
          placeholder="John Doe"
        />
        {errors.name && touched.name && (
          <div 
            id="name-error" 
            role="alert" 
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{errors.name}</span>
          </div>
        )}
      </div>

      {/* Job Title Field */}
      <div className="space-y-2">
        <label 
          htmlFor="job-title-input" 
          id="job-title-label"
          className="block text-sm font-medium text-foreground"
        >
          Job Title
          <span aria-label="required" className="text-destructive ml-1">*</span>
        </label>
        <input
          id="job-title-input"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={handleChange}
          onBlur={() => handleBlur('jobTitle')}
          aria-labelledby="job-title-label"
          aria-describedby={errors.jobTitle ? 'job-title-error' : undefined}
          aria-invalid={!!errors.jobTitle}
          aria-required="true"
          className={`w-full px-4 py-2 bg-input-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.jobTitle && touched.jobTitle ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Senior Recruiter"
        />
        {errors.jobTitle && touched.jobTitle && (
          <div 
            id="job-title-error" 
            role="alert" 
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{errors.jobTitle}</span>
          </div>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <label 
          htmlFor="message-input" 
          id="message-label"
          className="block text-sm font-medium text-foreground"
        >
          Message
          <span aria-label="required" className="text-destructive ml-1">*</span>
        </label>
        <textarea
          id="message-input"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={() => handleBlur('message')}
          aria-labelledby="message-label"
          aria-describedby={errors.message ? 'message-error' : 'message-hint'}
          aria-invalid={!!errors.message}
          aria-required="true"
          rows={4}
          className={`w-full px-4 py-2 bg-input-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none ${
            errors.message && touched.message ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Tell us what you're looking for..."
        />
        <p id="message-hint" className="text-xs text-muted-foreground">
          Minimum 10 characters
        </p>
        {errors.message && touched.message && (
          <div 
            id="message-error" 
            role="alert" 
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{errors.message}</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? (
            <>
              <span className="sr-only">Submitting form, please wait</span>
              <span aria-hidden="true">Submitting...</span>
            </>
          ) : (
            'Submit'
          )}
        </button>
        
        <button
          type="reset"
          onClick={() => {
            setFormData({ email: '', name: '', jobTitle: '', message: '' });
            setErrors({});
            setTouched({});
          }}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          aria-label="Reset form to default values"
        >
          Reset
        </button>
      </div>

      {/* Form status for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {Object.keys(errors).length > 0 && (
          <span>Form has {Object.keys(errors).length} error(s). Please review and correct.</span>
        )}
      </div>
    </form>
  );
}
