import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { formatSupabaseError } from '../../../lib/utils';

import { usePageImage } from '../../../hooks/usePageImage';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '48%'};
  vertical-align: top;
  text-align: left;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const ImageColumn = styled.div`
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 280px;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  text-align: center;
  flex-direction: column;
  gap: 8px;

  &::before {
    content: '';
    font-size: 32px;
    opacity: 0.5;
  }
`;

const ManagementSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 16px;
  background: ${props => props.$active ? '#1177BB' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#1177BB'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#1177BB' : 'transparent'};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 13px;
  
  &:hover {
    background: ${props => props.$active ? '#0f5c99' : '#f0f7ff'};
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 10px 12px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FormColumn = styled.div<{ $flex?: string }>`
  flex: ${props => props.$flex || '1'};
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  min-height: 60px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const SubmitButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const EditButton = styled.button`
  background-color: #ffc107;
  color: #212529;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 5px;
  
  &:hover {
    background-color: #e0a800;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background-color: ${props => props.$active ? '#28a745' : '#dc3545'};
  color: white;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 5px;
  
  &:hover {
    background-color: ${props => props.$active ? '#218838' : '#c82333'};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #363;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cfc;
  margin-bottom: 15px;
  font-size: 14px;
`;

const OptionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #1177BB;
    color: white;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

interface DropdownOption {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

type DropdownType = 'department_types' | 'countries' | 'cities' | 'department_status';

interface FormData {
  name: string;
  description: string;
}

export const DepartmentDropdownManagement: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-department-dropdown', '/images/EMSA-Introduction.png');
  const location = useLocation();
  
  // Get tab from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const initialTab = (urlParams.get('tab') as DropdownType) || 'department_types';
  
  const [activeTab, setActiveTab] = useState<DropdownType>(initialTab);
  const [departmentTypes, setDepartmentTypes] = useState<DropdownOption[]>([]);
  const [countries, setCountries] = useState<DropdownOption[]>([]);
  const [cities, setCities] = useState<DropdownOption[]>([]);
  const [departmentStatus, setDepartmentStatus] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // Load data on component mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Update URL when tab changes
  useEffect(() => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', newUrl.toString());
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load dropdown options');
      }

      if (data?.data) {
        setDepartmentTypes(data.data.departmentTypes || []);
        setCountries(data.data.countries || []);
        setCities(data.data.cities || []);
        setDepartmentStatus(data.data.departmentStatus || []);
      }
    } catch (error: any) {
      console.error('Error loading dropdown options:', error);
      setError(error.message || 'Failed to load dropdown options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        type: activeTab,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim()
        },
        ...(isEditing && editingId && { id: editingId })
      };

      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: isEditing ? 'PUT' : 'POST',
        body: payload
      });

      if (error) {
        throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'create'} ${getSingularName()}`);
      }

      setSuccess(`${getSingularName()} ${isEditing ? 'updated' : 'created'} successfully!`);
      setFormData({ name: '', description: '' });
      setIsEditing(false);
      setEditingId(null);
      await loadData();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} ${getSingularName()}:`, error);
      setError(formatSupabaseError(error, `Failed to ${isEditing ? 'update' : 'create'} ${getSingularName()}`));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: DropdownOption) => {
    setFormData({
      name: item.name,
      description: item.description || ''
    });
    setIsEditing(true);
    setEditingId(item.id);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '' });
    setIsEditing(false);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(id));
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'DELETE',
        body: {
          type: activeTab,
          id: id
        }
      });

      if (error) {
        throw new Error(error.message || `Failed to delete ${getSingularName()}`);
      }

      setSuccess(`${getSingularName()} "${name}" deleted successfully!`);
      await loadData();
    } catch (error: any) {
      console.error(`Error deleting ${getSingularName()}:`, error);
      setError(formatSupabaseError(error, `Failed to delete ${getSingularName()}`));
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean, name: string) => {
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'PUT',
        body: {
          type: activeTab,
          id: id,
          data: {
            active: !currentActive
          }
        }
      });

      if (error) {
        throw new Error(error.message || `Failed to ${!currentActive ? 'activate' : 'deactivate'} ${getSingularName()}`);
      }

      setSuccess(`${getSingularName()} "${name}" ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
      await loadData();
    } catch (error: any) {
      console.error(`Error toggling active status:`, error);
      setError(formatSupabaseError(error, `Failed to ${!currentActive ? 'activate' : 'deactivate'} ${getSingularName()}`));
    }
  };

  const getSingularName = () => {
    switch (activeTab) {
      case 'department_types': return 'Department Type';
      case 'countries': return 'Country';
      case 'cities': return 'City';
      case 'department_status': return 'Department Status';
      default: return 'Item';
    }
  };

  const getPluralName = () => {
    switch (activeTab) {
      case 'department_types': return 'Department Types';
      case 'countries': return 'Countries';
      case 'cities': return 'Cities';
      case 'department_status': return 'Department Status Options';
      default: return 'Items';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'department_types': return departmentTypes;
      case 'countries': return countries;
      case 'cities': return cities;
      case 'department_status': return departmentStatus;
      default: return [];
    }
  };

  const tabs = [
    { key: 'department_types' as DropdownType, label: 'Department Types' },
    { key: 'countries' as DropdownType, label: 'Countries' },
    { key: 'cities' as DropdownType, label: 'Cities' },
    { key: 'department_status' as DropdownType, label: 'Department Status' }
  ];

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="dropdown-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="dropdown-title">
                Department Dropdown Options Management
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Manage department dropdown options including department types, countries, cities, 
                and department status. These options are used in the department registration form to ensure 
                consistency and standardization across the emergency services system.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="Department Dropdown Management" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/EMSA-Introduction.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  Department Dropdown
                  Management
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Management Section */}
      <Section aria-labelledby="management-section">
        <ManagementSection>
          <SubTitle id="management-section">
            Manage {getPluralName()}
          </SubTitle>
          
          {/* Tab Navigation */}
          <TabContainer>
            {tabs.map(tab => (
              <Tab
                key={tab.key}
                $active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Tab>
            ))}
          </TabContainer>

          {/* Error and Success Messages */}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <FormRow>
              <FormColumn $flex="2">
                <Label htmlFor="name">{getSingularName()} Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${getSingularName().toLowerCase()} name`}
                  required
                  disabled={loading}
                />
              </FormColumn>
              
              <FormColumn $flex="1">
                <div style={{ display: 'flex', gap: '10px', paddingTop: '27px' }}>
                  <SubmitButton type="submit" disabled={loading}>
                    {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update' : 'Add')}
                  </SubmitButton>
                  {isEditing && (
                    <CancelButton type="button" onClick={handleCancelEdit}>
                      Cancel
                    </CancelButton>
                  )}
                </div>
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={`Enter ${getSingularName().toLowerCase()} description (optional)`}
                  disabled={loading}
                />
              </FormColumn>
            </FormRow>
          </form>

          {/* Data Table */}
          {getCurrentData().length > 0 ? (
            <OptionsTable>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentData().map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <small>{item.description || '-'}</small>
                    </td>
                    <td>
                      <ToggleButton
                        $active={item.active}
                        onClick={() => handleToggleActive(item.id, item.active, item.name)}
                        disabled={loading}
                      >
                        {item.active ? 'Active' : 'Inactive'}
                      </ToggleButton>
                    </td>
                    <td>
                      <small>{new Date(item.created_at).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <EditButton
                        onClick={() => handleEdit(item)}
                        disabled={loading || isEditing}
                      >
                        Edit
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={loading || deletingIds.has(item.id)}
                      >
                        {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
                      </DeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </OptionsTable>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {loading ? `Loading ${getPluralName().toLowerCase()}...` : `No ${getPluralName().toLowerCase()} found. Add some ${getPluralName().toLowerCase()} to get started.`}
            </p>
          )}
        </ManagementSection>
      </Section>
    </MainContent>
  );
};
