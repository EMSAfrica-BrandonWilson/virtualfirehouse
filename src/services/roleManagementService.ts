import { getSupabaseClient } from '../lib/supabase/client';

export interface User {
    id: string;
    email: string;
    created_at: string;
    role: string;
    role_updated_at?: string;
    last_sign_in_at?: string;
    email_confirmed_at?: string;
}

export interface RoleAssignmentAudit {
    id: string;
    assigned_by_user_id: string;
    target_user_id: string;
    old_role: string;
    new_role: string;
    assigned_at: string;
    reason: string;
}

export interface RoleAssignmentResult {
    success: boolean;
    message: string;
    targetUserId: string;
    oldRole: string;
    newRole: string;
    assignedBy: string;
}

export class RoleManagementService {
    // Get all users with their roles
    static async getAllUsers(): Promise<User[]> {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.functions.invoke('get-all-users', {
                body: {}
            });

            if (error) {
                console.error('Error fetching users:', error);
                throw new Error(error.message || 'Failed to fetch users');
            }

            // Handle wrapped response format
            const users = data?.data?.users || data?.users || [];
            return users;
        } catch (error: any) {
            console.error('Service error getting users:', error);
            throw new Error(error.message || 'Failed to fetch users');
        }
    }

    // Assign role to user
    static async assignRole(
        targetUserId: string, 
        newRole: string, 
        reason?: string
    ): Promise<RoleAssignmentResult> {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.functions.invoke('assign-user-role', {
                body: {
                    targetUserId,
                    newRole,
                    reason: reason || 'Role assignment via admin interface'
                }
            });

            if (error) {
                console.error('Error assigning role:', error);
                throw new Error(error.message || 'Failed to assign role');
            }

            // Handle wrapped response format
            const result = data?.data || data;
            return result;
        } catch (error: any) {
            console.error('Service error assigning role:', error);
            throw new Error(error.message || 'Failed to assign role');
        }
    }

    // Get role assignment audit log
    static async getRoleAuditLog(
        limit: number = 50, 
        offset: number = 0, 
        targetUserId?: string
    ): Promise<{ auditLog: RoleAssignmentAudit[]; pagination: any }> {
        try {
            let url = `get-role-audit-log?limit=${limit}&offset=${offset}`;
            if (targetUserId) {
                url += `&target_user_id=${targetUserId}`;
            }

            const supabase = getSupabaseClient();
            const { data, error } = await supabase.functions.invoke('get-role-audit-log', {
                body: { limit, offset, targetUserId }
            });

            if (error) {
                console.error('Error fetching audit log:', error);
                throw new Error(error.message || 'Failed to fetch audit log');
            }

            // Handle wrapped response format
            const result = data?.data || data;
            return result;
        } catch (error: any) {
            console.error('Service error getting audit log:', error);
            throw new Error(error.message || 'Failed to fetch audit log');
        }
    }

    // Check if current user is system admin
    static async isSystemAdmin(): Promise<boolean> {
        try {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

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

    // Check if current user is administrator or system admin
    static async isAdministrator(): Promise<boolean> {
        try {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

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

    // Get current user's role
    static async getCurrentUserRole(): Promise<string> {
        try {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return 'user';

            const { data, error } = await supabase
                .from('user_roles')
                .select('role_name')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error getting user role:', error);
                return 'user';
            }

            return data?.role_name || 'user';
        } catch (error) {
            console.error('Service error getting user role:', error);
            return 'user';
        }
    }
}