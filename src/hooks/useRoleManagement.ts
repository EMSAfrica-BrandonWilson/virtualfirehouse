import { useState, useEffect } from 'react';
import { RoleManagementService, User, RoleAssignmentResult } from '../services/roleManagementService';
import { formatDateTimeReadable } from '../lib/utils';

export function useRoleManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSystemAdmin, setIsSystemAdmin] = useState(false);
    const [isAdministrator, setIsAdministrator] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState('user');

    // Check permissions on mount
    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        try {
            const [systemAdmin, administrator, role] = await Promise.all([
                RoleManagementService.isSystemAdmin(),
                RoleManagementService.isAdministrator(),
                RoleManagementService.getCurrentUserRole()
            ]);
            
            setIsSystemAdmin(systemAdmin);
            setIsAdministrator(administrator);
            setCurrentUserRole(role);
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const usersData = await RoleManagementService.getAllUsers();
            setUsers(usersData);
        } catch (error: any) {
            setError(error.message);
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const assignRole = async (
        targetUserId: string, 
        newRole: string, 
        reason?: string
    ): Promise<RoleAssignmentResult> => {
        try {
            const result = await RoleManagementService.assignRole(targetUserId, newRole, reason);
            
            // Update local state to reflect the change
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === targetUserId 
                        ? { ...user, role: newRole, role_updated_at: formatDateTimeReadable(new Date()) }
                        : user
                )
            );
            
            return result;
        } catch (error: any) {
            console.error('Error assigning role:', error);
            throw error;
        }
    };

    return {
        users,
        loading,
        error,
        isSystemAdmin,
        isAdministrator,
        currentUserRole,
        fetchUsers,
        assignRole,
        checkPermissions
    };
}