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
    content: '🚒';
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
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.$active ? '#1177BB' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#1177BB'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#1177BB' : 'transparent'};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#0f5c99' : '#f0f7ff'};
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

interface CallSign {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface VehicleType {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface VehicleMake {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

type DropdownType = 'call_signs' | 'vehicle_types' | 'vehicle_makes';

interface FormData {
  name: string;
  description?: string;
}

export const VehicleDropdownManagement: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-vehicles-dropdown', '/images/FireEngine.png');
  const location = useLocation();
  
  // Get tab from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const initialTab = (urlParams.get('tab') as DropdownType) || 'call_signs';
  
  const [activeTab, setActiveTab] = useState<DropdownType>(initialTab);
  const [callSigns, setCallSigns] = useState<CallSign[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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

  // Clear selections when switching tabs
  useEffect(() => {
    setSelectedIds(new Set());
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
        setCallSigns(data.data.callSigns || []);
        setVehicleTypes(data.data.vehicleTypes || []);
        setVehicleMakes(data.data.vehicleMakes || []);
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
          ...(formData.description && { description: formData.description.trim() })
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

  const handleEdit = (item: CallSign | VehicleType | VehicleMake) => {
    setFormData({
      name: item.name,
      description: 'description' in item ? (item as any).description || '' : ''
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

  // Selection helpers (only used for Call Signs)
  
  const isAllSelected = activeTab === 'call_signs' && callSigns.length > 0 && callSigns.every(item => selectedIds.has(item.id));
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (activeTab !== 'call_signs') return;
    if (!isAllSelected) {
      const allIds = callSigns.map(item => item.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkDeleteCallSigns = async () => {
    if (activeTab !== 'call_signs') return;
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const idToName = new Map<number, string>();
    callSigns.forEach(cs => idToName.set(cs.id, cs.name));

    if (!confirm(`Are you sure you want to delete ${ids.length} selected call sign(s)?`)) {
      return;
    }

    setError('');
    setSuccess('');
    // Mark rows as deleting
    setDeletingIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });

    try {
      let successCount = 0;
      const failures: string[] = [];

      for (const id of ids) {
        try {
          const { error } = await supabase.functions.invoke('dropdown-options-crud', {
            method: 'DELETE',
            body: { type: 'call_signs', id }
          });
          if (error) {
            throw new Error(error.message || 'Delete failed');
          }
          successCount += 1;
        } catch (err: any) {
          const name = idToName.get(id) || `ID ${id}`;
          failures.push(`${name}: ${err.message || 'Delete failed'}`);
        }
      }

      if (successCount > 0) {
        setSuccess(`Deleted ${successCount} call sign(s) successfully.`);
      }
      if (failures.length > 0) {
        setError(`Failed to delete ${failures.length} of ${ids.length} call sign(s): ${failures.join('; ')}`);
      }

      // Refresh and clear selection
      setSelectedIds(new Set());
      await loadData();
    } finally {
      // Unmark rows as deleting
      setDeletingIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const getSingularName = () => {
    switch (activeTab) {
      case 'call_signs': return 'Call Sign';
      case 'vehicle_types': return 'Vehicle Type';
      case 'vehicle_makes': return 'Vehicle Make';
      default: return 'Item';
    }
  };

  const getPluralName = () => {
    switch (activeTab) {
      case 'call_signs': return 'Call Signs';
      case 'vehicle_types': return 'Vehicle Types';
      case 'vehicle_makes': return 'Vehicle Makes';
      default: return 'Items';
    }
  };

  const getCurrentData = (): (CallSign | VehicleType | VehicleMake)[] => {
    switch (activeTab) {
      case 'call_signs': return callSigns;
      case 'vehicle_types': return vehicleTypes;
      case 'vehicle_makes': return vehicleMakes;
      default: return [] as (CallSign | VehicleType | VehicleMake)[];
    }
  };

  const tabs = [
    { key: 'call_signs' as DropdownType, label: 'Call Signs' },
    { key: 'vehicle_types' as DropdownType, label: 'Vehicle Types' },
    { key: 'vehicle_makes' as DropdownType, label: 'Vehicle Makes' }
  ];

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="dropdown-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="dropdown-title">
                Vehicle Dropdown Options Management
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Manage vehicle dropdown options including call signs, vehicle types, and vehicle makes.
                These options are used in the vehicle registration form to ensure consistency and standardization
                across the emergency services system.
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
                  alt="Vehicle Dropdown Management" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/FireEngine.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  Vehicle Dropdown
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
          </form>

          {/* Data Table */}
          {activeTab === 'call_signs' && getCurrentData().length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div style={{ color: '#1177BB', fontWeight: 600 }}>{selectedIds.size} selected</div>
              <DeleteButton type="button" onClick={handleBulkDeleteCallSigns} disabled={loading || selectedIds.size === 0}>
                Delete Selected
              </DeleteButton>
            </div>
          )}
          {getCurrentData().length > 0 ? (
            <OptionsTable>
              <thead>
                <tr>
                  {activeTab === 'call_signs' && (
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all call signs"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentData().map(item => (
                  <tr key={item.id}>
                    {activeTab === 'call_signs' && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          disabled={loading || deletingIds.has(item.id)}
                          aria-label={`Select call sign ${item.name}`}
                        />
                      </td>
                    )}
                    <td><strong>{item.name}</strong></td>
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
                      {activeTab !== 'call_signs' && (
                        <DeleteButton
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={loading || deletingIds.has(item.id)}
                        >
                          {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
                        </DeleteButton>
                      )}
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
