import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../lib/supabase/client';

interface UseAdminCheckResult {
  isAdmin: boolean;
  isSystemAdmin: boolean;
  loading: boolean;
  error: string | null;
  userRole: string;
  checkAdminStatus: () => Promise<void>;
}

/**
 * Custom hook to check if the current user has admin privileges
 * 
 * @returns Object containing admin status, loading state, and error handling
 */
export const useAdminCheck = (): UseAdminCheckResult => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Checking admin status for user:', user.id, user.email);

      // Query user_roles table for role_name (authoritative source)
      const supabase = getSupabaseClient();
      const { data, error: queryError } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (queryError) {
        console.error('Error checking admin status:', queryError);
        setError(queryError.message);
        setIsAdmin(false);
        setIsSystemAdmin(false);
        setUserRole('user');
        return;
      }

      const role = (data?.role_name as string) || 'user';
      setUserRole(role);
      console.log('User role check result:', role);

      // Set admin status based on role_name
      const hasAdminRole = role === 'administrator' || role === 'system_admin';
      const hasSystemAdminRole = role === 'system_admin';

      setIsAdmin(hasAdminRole);
      setIsSystemAdmin(hasSystemAdminRole);
      if (!hasAdminRole) {
        console.log('User does not have admin role');
      }
    } catch (err) {
      console.error('Error in admin check:', err);
      setError(err instanceof Error ? err.message : 'Failed to check admin status');
      setIsAdmin(false);
      setIsSystemAdmin(false);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    isSystemAdmin,
    loading,
    error,
    userRole,
    checkAdminStatus
  };
};

export default useAdminCheck;