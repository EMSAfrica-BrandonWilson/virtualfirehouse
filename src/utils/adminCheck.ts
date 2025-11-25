import { getSupabaseClient } from '../lib/supabase/client';

// Define admin role types
export type AdminRole = 'user' | 'administrator' | 'system_admin';

// Define admin role type union
export type AdminRoleCheck = 'administrator' | 'system_admin';

// Interface for admin check result
export interface AdminCheckResult {
  isAdmin: boolean;
  isSystemAdmin: boolean;
  userRole: AdminRole;
}

/**
 * Check if the current user is a system administrator
 * 
 * @returns Promise<boolean> - true if user has system_admin role
 */
export async function isSystemAdmin(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', user.id)
      .eq('role_name', 'system_admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking system admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Service error checking system admin status:', error);
    return false;
  }
}

/**
 * Check if the current user is an administrator (includes system_admin)
 * 
 * @returns Promise<boolean> - true if user has administrator or system_admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', user.id)
      .in('role_name', ['administrator', 'system_admin'])
      .maybeSingle();

    if (error) {
      console.error('Error checking administrator status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Service error checking administrator status:', error);
    return false;
  }
}

/**
 * Get the current user's role
 * 
 * @returns Promise<AdminRole> - the user's role
 */
export async function getCurrentUserRole(): Promise<AdminRole> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'user';
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }

    return (data?.role_name as AdminRole) || 'user';
  } catch (error) {
    console.error('Service error getting user role:', error);
    return 'user';
  }
}

/**
 * Get comprehensive admin check result
 * 
 * @returns Promise<AdminCheckResult> - complete admin status information
 */
export async function getAdminCheckResult(): Promise<AdminCheckResult> {
  try {
    const [adminStatus, systemAdminStatus, userRole] = await Promise.all([
      isAdmin(),
      isSystemAdmin(),
      getCurrentUserRole()
    ]);

    return {
      isAdmin: adminStatus,
      isSystemAdmin: systemAdminStatus,
      userRole
    };
  } catch (error) {
    console.error('Error getting admin check result:', error);
    return {
      isAdmin: false,
      isSystemAdmin: false,
      userRole: 'user'
    };
  }
}

/**
 * Require admin access - throws error if user doesn't have admin privileges
 * 
 * @param message - Custom error message (optional)
 * @throws Error - if user doesn't have admin privileges
 */
export async function requireAdmin(message?: string): Promise<void> {
  const isAdminUser = await isAdmin();
  
  if (!isAdminUser) {
    throw new Error(
      message || 'Access denied. Administrator privileges required.'
    );
  }
}

/**
 * Require system admin access - throws error if user doesn't have system admin privileges
 * 
 * @param message - Custom error message (optional)
 * @throws Error - if user doesn't have system admin privileges
 */
export async function requireSystemAdmin(message?: string): Promise<void> {
  const isSystemAdminUser = await isSystemAdmin();
  
  if (!isSystemAdminUser) {
    throw new Error(
      message || 'Access denied. System Administrator privileges required.'
    );
  }
}

/**
 * Check if user has specific role
 * 
 * @param role - Role to check for
 * @returns Promise<boolean> - true if user has the specified role
 */
export async function hasRole(role: AdminRole): Promise<boolean> {
  try {
    const currentRole = await getCurrentUserRole();
    return currentRole === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 * 
 * @param roles - Array of roles to check for
 * @returns Promise<boolean> - true if user has any of the specified roles
 */
export async function hasAnyRole(roles: AdminRole[]): Promise<boolean> {
  try {
    const currentRole = await getCurrentUserRole();
    return roles.includes(currentRole);
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
}
