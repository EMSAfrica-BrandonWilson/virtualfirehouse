import { useModal } from '../hooks/useModal';

// Hook for commonly used modal patterns
export const useModalUtils = () => {
  const { showModal } = useModal();

  // Success message
  const showSuccess = (message: string) => showModal('Success', message, 'success');
  
  // Error message
  const showError = (title: string, message: string) => showModal(title, message, 'error');
  
  // Warning message
  const showWarning = (title: string, message: string) => showModal(title, message, 'warning');
  
  // Information message
  const showInfo = (title: string, message: string) => showModal(title, message, 'info');

  // Common database error handling
  const handleDbError = (error: any, operation: string) => {
    const errorMessage = error?.message || 'Unknown database error occurred';
    showError(`Database Error - ${operation}`, `An error occurred while ${operation.toLowerCase()}: ${errorMessage}`);
  };

  // Confirmation helper for destructive actions
  const confirmAction = async (title: string, message: string): Promise<boolean> => {
    // This is a placeholder - you could extend the modal component to support confirm/cancel buttons
    await showWarning(title, message);
    return true; // For now, just return true - can be enhanced later
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleDbError,
    confirmAction
  };
};

// Utility functions that don't require hooks (can be used in utilities)
export const createModalHandlers = () => {
  return {
    // Database operations
    handleLoadingError: (context: string) => `Error loading ${context} from the database. Please check your connection and try again.`,
    handleSavingError: (context: string) => `Error saving ${context}. Please try again.`,
    handleDeletingError: (context: string) => `Error deleting ${context}. Please try again.`,
    
    // Common messages
    noDataFound: (context: string) => `No ${context} found in the database.`,
    operationSuccess: (action: string) => `${action} completed successfully!`,
    operationFailed: (action: string) => `Failed to ${action.toLowerCase()}. Please try again.`,
    
    // Form validation
    requiredField: (field: string) => `Please enter a ${field.toLowerCase()}.`,
    invalidEmail: 'Please enter a valid email address.',
    selectRequired: 'Please make a selection.',
    
    // Access and permissions
    accessDenied: 'You do not have permission to perform this action.',
    sessionExpired: 'Your session has expired. Please log in again.',
    
    // File operations
    fileTooLarge: 'The selected file is too large. Please choose a smaller file.',
    unsupportedFile: 'This file type is not supported.',
    uploadFailed: 'Failed to upload file. Please try again.',
    
    // Network and connection
    networkError: 'Network connection error. Please check your internet connection.',
    serverError: 'Server error occurred. Please try again later.',
    timeoutError: 'Request timed out. Please try again.'
  };
};

// Database error helper
export const formatDbError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  // Handle specific Supabase error types
  if (error.code) {
    switch (error.code) {
      case '23505':
        return 'This record already exists. Duplicate entries are not allowed.';
      case '23503':
        return 'This operation cannot be completed due to related records.';
      case '23502':
        return 'Required information is missing. Please check all fields.';
      case '42P01':
        return 'Database table not found. Please contact support.';
      case '42703':
        return 'Database column not found. Please contact support.';
      default:
        return error.message || `Database error (${error.code})`;
    }
  }
  
  return error.message || 'An error occurred while accessing the database.';
};

// Form validation helpers
export const validateForm = {
  required: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required.`;
    }
    return null;
  },
  
  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    return null;
  },
  
  phone: (phone: string): string | null => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number.';
    }
    return null;
  },
  
  minLength: (value: string, minLength: number, fieldName: string): string | null => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long.`;
    }
    return null;
  },
  
  maxLength: (value: string, maxLength: number, fieldName: string): string | null => {
    if (value && value.length > maxLength) {
      return `${fieldName} cannot exceed ${maxLength} characters.`;
    }
    return null;
  }
};