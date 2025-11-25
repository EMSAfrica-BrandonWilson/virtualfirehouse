import { getSupabaseClient } from '../lib/supabase/client';

export interface CreateUserData {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  userId: string;
  email?: string;
  password?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export interface DeleteUserData {
  userId: string;
  confirmEmail: string;
}

export interface UserCrudResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class UserCrudService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<UserCrudResult> {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData
      });

      if (error) {
        console.error('Error creating user:', error);
        return {
          success: false,
          message: error.message || 'Failed to create user',
          error: error.message
        };
      }

      return {
        success: true,
        message: data?.data?.message || 'User created successfully',
        data: data?.data
      };
    } catch (error: any) {
      console.error('Service error creating user:', error);
      return {
        success: false,
        message: error.message || 'Failed to create user',
        error: error.message
      };
    }
  }

  /**
   * Update an existing user
   */
  static async updateUser(userData: UpdateUserData): Promise<UserCrudResult> {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: userData
      });

      if (error) {
        console.error('Error updating user:', error);
        return {
          success: false,
          message: error.message || 'Failed to update user',
          error: error.message
        };
      }

      return {
        success: true,
        message: data?.data?.message || 'User updated successfully',
        data: data?.data
      };
    } catch (error: any) {
      console.error('Service error updating user:', error);
      return {
        success: false,
        message: error.message || 'Failed to update user',
        error: error.message
      };
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(userData: DeleteUserData): Promise<UserCrudResult> {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: userData
      });

      if (error) {
        console.error('Error deleting user:', error);
        return {
          success: false,
          message: error.message || 'Failed to delete user',
          error: error.message
        };
      }

      return {
        success: true,
        message: data?.data?.message || 'User deleted successfully',
        data: data?.data
      };
    } catch (error: any) {
      console.error('Service error deleting user:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete user',
        error: error.message
      };
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    return { valid: true };
  }

  /**
   * Validate user data
   */
  static validateUserData(userData: Partial<CreateUserData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.email) {
      errors.push('Email is required');
    } else if (!this.validateEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.password) {
      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.valid && passwordValidation.message) {
        errors.push(passwordValidation.message);
      }
    }

    if (!userData.role) {
      errors.push('Role is required');
    } else if (!['user', 'administrator', 'system_admin'].includes(userData.role)) {
      errors.push('Invalid role specified');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}