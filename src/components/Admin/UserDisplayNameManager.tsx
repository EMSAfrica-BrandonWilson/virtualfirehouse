import React, { useState, useEffect } from 'react';
import { DevExpressButton } from '../DevExpressStyles';
import styled from 'styled-components';
import { formatDateOnly } from '../../lib/utils';

const AdminContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const AdminTitle = styled.h3`
  color: #1177BB;
  margin-bottom: 20px;
  font-family: Verdana, Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    font-size: 12px;
  }
  
  th {
    background-color: #4682B4;
    color: white;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 2px;
  font-size: 11px;
`;

const ErrorMessage = styled.div`
  color: #DC143C;
  font-size: 12px;
  margin: 10px 0;
  padding: 10px;
  background: #FFE4E1;
  border: 1px solid #DC143C;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: #008000;
  font-size: 12px;
  margin: 10px 0;
  padding: 10px;
  background: #F0FFF0;
  border: 1px solid #008000;
  border-radius: 4px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4682B4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  created_at: string;
}

export const UserDisplayNameManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`https://yhrecxzygcapozirquzw.supabase.co/functions/v1/admin-user-management`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to load users');
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: UserProfile) => {
    setEditingUser(user.user_id);
    setEditDisplayName(user.display_name || '');
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditDisplayName('');
  };

  const saveDisplayName = async (userId: string) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch(`https://yhrecxzygcapozirquzw.supabase.co/functions/v1/admin-user-management`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          display_name: editDisplayName.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update display name');
      }

      const result = await response.json();
      
      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, display_name: result.data.display_name }
          : user
      ));
      
      setEditingUser(null);
      setEditDisplayName('');
      setSuccess('Display name updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update display name');
      console.error('Error updating display name:', error);
    }
  };

  const addBrandonWilsonDisplayName = async () => {
    // Find a user to add "Brandon Wilson" display name to
    const userWithoutDisplayName = users.find(user => !user.display_name);
    
    if (!userWithoutDisplayName) {
      setError('No users found without display names to update.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await fetch(`https://yhrecxzygcapozirquzw.supabase.co/functions/v1/admin-user-management`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userWithoutDisplayName.user_id,
          display_name: 'Brandon Wilson'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to add Brandon Wilson display name');
      }

      const result = await response.json();
      
      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user.user_id === userWithoutDisplayName.user_id 
          ? { ...user, display_name: result.data.display_name }
          : user
      ));
      
      setSuccess('Brandon Wilson display name added successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to add Brandon Wilson display name');
      console.error('Error adding Brandon Wilson display name:', error);
    }
  };

  const deleteAllUsers = async () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently delete ALL registered users from the system.\n\n' +
      'This action cannot be undone.\n\n' +
      'Are you sure you want to proceed?'
    );
    
    if (!confirmed) {
      return;
    }

    const doubleConfirmed = window.confirm(
      'FINAL CONFIRMATION:\n\n' +
      'You are about to delete ALL user accounts and related data.\n\n' +
      'Click OK to proceed with permanent deletion.'
    );
    
    if (!doubleConfirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const response = await fetch(`https://yhrecxzygcapozirquzw.supabase.co/functions/v1/admin-delete-all-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirm_deletion: 'DELETE_ALL_USERS_CONFIRMED'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete all users');
      }

      const result = await response.json();
      
      // Clear local users list
      setUsers([]);
      
      setSuccess(
        `Successfully deleted all users: ${result.data.summary.deleted_auth_users} auth users deleted. ` +
        `${result.data.summary.auth_deletion_errors.length > 0 ? `${result.data.summary.auth_deletion_errors.length} errors occurred.` : 'All operations completed successfully.'}`
      );
    } catch (error: any) {
      setError(error.message || 'Failed to delete all users');
      console.error('Error deleting all users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <AdminTitle>User Display Name Management</AdminTitle>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <LoadingSpinner /> Loading users...
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminTitle>User Display Name Management</AdminTitle>
      
      <div style={{ marginBottom: '20px' }}>
        <DevExpressButton 
          $variant="primary" 
          onClick={addBrandonWilsonDisplayName}
          style={{ marginRight: '10px' }}
          disabled={loading}
        >
          Add "Brandon Wilson" to First Available User
        </DevExpressButton>
        
        <DevExpressButton 
          $variant="secondary" 
          onClick={loadUsers}
          style={{ marginRight: '10px' }}
          disabled={loading}
        >
          Refresh Users
        </DevExpressButton>
        
        <DevExpressButton 
          $variant="danger" 
          onClick={deleteAllUsers}
          style={{ backgroundColor: '#DC143C', borderColor: '#DC143C' }}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete All Users'}
        </DevExpressButton>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <UserTable>
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Display Name</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.email}</td>
              <td>{user.full_name || 'N/A'}</td>
              <td>
                {editingUser === user.user_id ? (
                  <EditInput
                    type="text"
                    value={editDisplayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        saveDisplayName(user.user_id);
                      }
                      if (e.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  user.display_name || 'Not set'
                )}
              </td>
              <td>{formatDateOnly(user.created_at)}</td>
              <td>
                {editingUser === user.user_id ? (
                  <>
                    <DevExpressButton 
                      $variant="success" 
                      onClick={() => saveDisplayName(user.user_id)}
                      style={{ fontSize: '10px', padding: '2px 6px', marginRight: '4px' }}
                    >
                      Save
                    </DevExpressButton>
                    <DevExpressButton 
                      $variant="secondary" 
                      onClick={cancelEditing}
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                      Cancel
                    </DevExpressButton>
                  </>
                ) : (
                  <DevExpressButton 
                    $variant="primary" 
                    onClick={() => startEditing(user)}
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                  >
                    Edit
                  </DevExpressButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </UserTable>
      
      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No users found.
        </div>
      )}
    </AdminContainer>
  );
};
