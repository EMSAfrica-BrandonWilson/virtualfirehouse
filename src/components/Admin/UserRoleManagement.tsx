import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAdminCheck } from '../../hooks/useAdminCheck';
import { formatDateOnly } from '../../lib/utils';

interface User {
  id: string;
  email: string;
  role: 'System Administrator' | 'Member' | 'Officer';
  last_sign_in_at: string | null;
  created_at: string;
}

interface UserFormData {
  email: string;
  password: string;
  role: 'System Administrator' | 'Member' | 'Officer';
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  min-height: 100vh;
  color: white;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: #ffa500;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const AddUserButton = styled.button`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #20c997, #17a2b8);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(40, 167, 69, 0.3);
  }
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #138496, #117a8b);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(23, 162, 184, 0.3);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #ffa500;
`;

const ErrorMessage = styled.div`
  background: #ff4444;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #44aa44;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  color: #333;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 1.1rem;
`;

const TableBody = styled.tbody`
  & tr:nth-child(even) {
    background: #f8f9fa;
  }
  
  & tr:hover {
    background: #e3f2fd;
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const EditButton = styled.button`
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #138496, #117a8b);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DeleteButton = styled.button`
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #c82333, #bd2130);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 0.375rem;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
  
  &:hover {
    border-color: #ffa500;
  }
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
`;

const UpdateButton = styled.button`
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ff8c00, #ff7700);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  color: #333;
  position: relative;
`;

const ModalHeader = styled.h2`
  color: #ffa500;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
  
  &:invalid {
    border-color: #dc3545;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  background: white;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #20c997, #17a2b8);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(40, 167, 69, 0.3);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ConfirmDeleteModal = styled(ModalContent)`
  text-align: center;
  max-width: 400px;
`;

const WarningIcon = styled.div`
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
`;

const NoUsersMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    role: 'Member'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  // Using imported supabase client

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchUsers();
      getCurrentUser();
    }
  }, [isAdmin, adminLoading]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email || '');
      }
    } catch (err) {
      console.error('Error getting current user:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingRole(userId);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ));
      
      setSuccess(`User role updated to ${newRole} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      try {
        const target = users.find(u => u.id === userId);
        if (target?.email) {
          await supabase.functions.invoke('email-pdf', {
            method: 'POST',
            body: { to: target.email, subject: 'VirtualFireHouse Access Approved', message: `Your access request has been approved. Your role is now: ${newRole}. You may sign in and begin using the application.` }
          });
        }
      } catch {}
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setFormLoading(true);
      setError(null);
      
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('https://yhrecxzygcapozirquzw.supabase.co/functions/v1/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create user');
      }
      
      setSuccess('User created successfully!');
      setShowAddModal(false);
      setFormData({ email: '', password: '', role: 'Member' });
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.email) {
      setError('Email is required.');
      return;
    }

    try {
      setFormLoading(true);
      setError(null);
      
      const updateData: any = {
        userId: selectedUser.id,
        email: formData.email,
        role: formData.role
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('https://yhrecxzygcapozirquzw.supabase.co/functions/v1/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update user');
      }
      
      setSuccess('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ email: '', password: '', role: 'Member' });
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setFormLoading(true);
      setError(null);
      
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('https://yhrecxzygcapozirquzw.supabase.co/functions/v1/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userId: selectedUser.id })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete user');
      }
      
      setSuccess('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setFormData({ email: '', password: '', role: 'Member' });
    setError(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return formatDateOnly(dateString);
  };

  const canDeleteUser = (user: User) => {
    return user.email !== currentUserEmail;
  };

  const canDemoteUser = (user: User) => {
    return user.email !== currentUserEmail;
  };

  if (adminLoading || loading) {
    return (
      <Container>
        <Header>User Role Management</Header>
        <LoadingSpinner>Loading user data...</LoadingSpinner>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        <Header>Access Denied</Header>
        <ErrorMessage>
          You do not have permission to access this page. This feature is restricted to System Administrators only.
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>User Role Management</Header>
      
      <HeaderActions>
        <RefreshButton onClick={fetchUsers} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Users'}
        </RefreshButton>
        <AddUserButton onClick={() => setShowAddModal(true)}>
          Add New User
        </AddUserButton>
      </HeaderActions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {users.length === 0 ? (
        <NoUsersMessage>
          No users found in the system.
        </NoUsersMessage>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Current Role</TableHeaderCell>
              <TableHeaderCell>Last Sign In</TableHeaderCell>
              <TableHeaderCell>Member Since</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <tr key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <strong style={{ 
                    color: user.role === 'System Administrator' ? '#ff6b6b' : 
                           user.role === 'Officer' ? '#4ecdc4' : '#95a5a6' 
                  }}>
                    {user.role}
                  </strong>
                </TableCell>
                <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <ActionButtonGroup>
                    <Select
                      value={user.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateUserRole(user.id, e.target.value)}
                      disabled={updatingRole === user.id || !canDemoteUser(user)}
                      title={!canDemoteUser(user) ? "You cannot change your own role" : ""}
                    >
                      <option value="Member">Member</option>
                      <option value="Officer">Officer</option>
                      <option value="System Administrator">System Administrator</option>
                    </Select>
                    <UpdateButton 
                      disabled={updatingRole === user.id}
                      onClick={() => updateUserRole(user.id, user.role)}
                    >
                      {updatingRole === user.id ? 'Updating...' : 'Update'}
                    </UpdateButton>
                    <EditButton onClick={() => openEditModal(user)}>
                      Edit
                    </EditButton>
                    <DeleteButton 
                      onClick={() => openDeleteModal(user)}
                      disabled={!canDeleteUser(user)}
                      title={!canDeleteUser(user) ? "You cannot delete your own account" : ""}
                    >
                      Delete
                    </DeleteButton>
                  </ActionButtonGroup>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <ModalBackground onClick={closeModals}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>Add New User</ModalHeader>
            
            <FormGroup>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter a secure password"
                minLength={6}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="role">Initial Role</Label>
              <FormSelect
                id="role"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="Member">Member</option>
                <option value="Officer">Officer</option>
                <option value="System Administrator">System Administrator</option>
              </FormSelect>
            </FormGroup>
            
            <ModalActions>
              <CancelButton onClick={closeModals} disabled={formLoading}>
                Cancel
              </CancelButton>
              <SubmitButton onClick={handleAddUser} disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create User'}
              </SubmitButton>
            </ModalActions>
          </ModalContent>
        </ModalBackground>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <ModalBackground onClick={closeModals}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>Edit User: {selectedUser.email}</ModalHeader>
            
            <FormGroup>
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
                minLength={6}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="edit-role">Role</Label>
              <FormSelect
                id="edit-role"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value as any })}
                disabled={!canDemoteUser(selectedUser)}
              >
                <option value="Member">Member</option>
                <option value="Officer">Officer</option>
                <option value="System Administrator">System Administrator</option>
              </FormSelect>
              {!canDemoteUser(selectedUser) && (
                <small style={{ color: '#dc3545', marginTop: '0.25rem', display: 'block' }}>
                  You cannot change your own role
                </small>
              )}
            </FormGroup>
            
            <ModalActions>
              <CancelButton onClick={closeModals} disabled={formLoading}>
                Cancel
              </CancelButton>
              <SubmitButton onClick={handleEditUser} disabled={formLoading}>
                {formLoading ? 'Updating...' : 'Update User'}
              </SubmitButton>
            </ModalActions>
          </ModalContent>
        </ModalBackground>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <ModalBackground onClick={closeModals}>
          <ConfirmDeleteModal onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <WarningIcon>⚠️</WarningIcon>
            <ModalHeader>Delete User</ModalHeader>
            
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{selectedUser.email}</strong>?
              <br />
              <br />
              This action cannot be undone and will permanently remove:
            </p>
            
            <ul style={{ textAlign: 'left', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
              <li>User account and authentication</li>
              <li>Role assignments and permissions</li>
              <li>Any uploaded images or content</li>
              <li>Activity history and logs</li>
            </ul>
            
            <ModalActions>
              <CancelButton onClick={closeModals} disabled={formLoading}>
                Cancel
              </CancelButton>
              <DeleteButton onClick={handleDeleteUser} disabled={formLoading}>
                {formLoading ? 'Deleting...' : 'Delete User'}
              </DeleteButton>
            </ModalActions>
          </ConfirmDeleteModal>
        </ModalBackground>
      )}
    </Container>
  );
};

export default UserRoleManagement;