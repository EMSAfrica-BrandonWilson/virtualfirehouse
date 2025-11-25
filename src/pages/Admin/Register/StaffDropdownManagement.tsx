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
    content: '👥';
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

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
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

interface Position {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Rank {
  id: string;
  name: string;
  code: string;
  level: number;
  description: string;
  picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmergencyContactRelationship {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmploymentStatus {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface OperationalShift {
  id: number;
  shift_name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  shift_start_date?: string;
  shift_duration?: number;
  color?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

type DropdownType = 'positions' | 'ranks' | 'emergency_contact_relationships' | 'employment_status' | 'operational_shifts';

interface FormData {
  name: string;
  description: string;
  code?: string;
  level?: number;
  start_time?: string;
  end_time?: string;
  shift_start_date?: string;
  shift_duration?: number;
  color?: string;
}

export const StaffDropdownManagement: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-staff-dropdown', '/images/EMSA-Introduction.png');
  const location = useLocation();
  
  // Get tab from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const initialTab = (urlParams.get('tab') as DropdownType) || 'positions';
  
  const [activeTab, setActiveTab] = useState<DropdownType>(initialTab);
  const [positions, setPositions] = useState<Position[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [relationships, setRelationships] = useState<EmergencyContactRelationship[]>([]);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus[]>([]);
  const [operationalShifts, setOperationalShifts] = useState<OperationalShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({ 
    name: '', 
    description: '', 
    code: '', 
    level: 0,
    start_time: '',
    end_time: '',
    shift_start_date: '',
    shift_duration: 8,
    color: '#1177BB'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string | number>>(new Set());

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
        setPositions(data.data.positions || []);
        setRanks(data.data.ranks || []);
        setRelationships(data.data.emergencyContactRelationships || []);
        setEmploymentStatus(data.data.employmentStatus || []);
        setOperationalShifts(data.data.operationalShifts || []);
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

    // Validate rank-specific fields
    if (activeTab === 'ranks') {
      if (!formData.code?.trim()) {
        setError('Code is required for ranks');
        return;
      }
      if (formData.level === undefined || formData.level < 0) {
        setError('Level must be a non-negative number');
        return;
      }
    }

    // Validate operational shift-specific fields
    if (activeTab === 'operational_shifts') {
      if (formData.shift_duration !== undefined && (formData.shift_duration < 0 || formData.shift_duration > 24)) {
        setError('Shift duration must be between 0 and 24 hours');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        type: activeTab,
        data: {
          ...(activeTab === 'operational_shifts' 
            ? { shift_name: formData.name.trim() }
            : { name: formData.name.trim() }
          ),
          description: formData.description.trim(),
          ...(activeTab === 'ranks' && {
            code: formData.code?.trim(),
            level: formData.level
          }),
          ...(activeTab === 'operational_shifts' && {
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
            shift_start_date: formData.shift_start_date || null,
            shift_duration: formData.shift_duration || null,
            color: formData.color || '#1177BB'
          })
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
      setFormData({ 
        name: '', 
        description: '', 
        code: '', 
        level: 0,
        start_time: '',
        end_time: '',
        shift_start_date: '',
        shift_duration: 8,
        color: '#1177BB'
      });
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

  // Helper function to get the name from an item
  const getItemName = (item: Position | Rank | EmergencyContactRelationship | EmploymentStatus | OperationalShift): string => {
    if ('shift_name' in item) {
      return item.shift_name;
    }
    return (item as any).name || '';
  };

  const handleEdit = (item: Position | Rank | EmergencyContactRelationship | EmploymentStatus | OperationalShift) => {
    setFormData({
      name: getItemName(item),
      description: 'description' in item ? item.description || '' : '',
      code: 'code' in item ? item.code || '' : '',
      level: 'level' in item ? item.level || 0 : 0,
      start_time: 'start_time' in item ? item.start_time || '' : '',
      end_time: 'end_time' in item ? item.end_time || '' : '',
      shift_start_date: 'shift_start_date' in item ? item.shift_start_date || '' : '',
      shift_duration: 'shift_duration' in item ? item.shift_duration || 8 : 8,
      color: 'color' in item ? item.color || '#1177BB' : '#1177BB'
    });
    setIsEditing(true);
    setEditingId(item.id);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setFormData({ 
      name: '', 
      description: '', 
      code: '', 
      level: 0,
      start_time: '',
      end_time: '',
      shift_start_date: '',
      shift_duration: 8,
      color: '#1177BB'
    });
    setIsEditing(false);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string | number, name: string) => {
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

  const handleToggleActive = async (id: string | number, currentActive: boolean, name: string) => {
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'PUT',
        body: {
          type: activeTab,
          id: id,
          data: {
            active: !currentActive,
            // For ranks, use is_active instead of active
            ...(activeTab === 'ranks' && { is_active: !currentActive })
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
      case 'positions': return 'Position';
      case 'ranks': return 'Rank';
      case 'emergency_contact_relationships': return 'Relationship';
      case 'employment_status': return 'Employment Status';
      case 'operational_shifts': return 'Operational Shift';
      default: return 'Item';
    }
  };

  const getPluralName = () => {
    switch (activeTab) {
      case 'positions': return 'Positions';
      case 'ranks': return 'Ranks';
      case 'emergency_contact_relationships': return 'Emergency Contact Relationships';
      case 'employment_status': return 'Employment Status Options';
      case 'operational_shifts': return 'Operational Shifts';
      default: return 'Items';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'positions': return positions;
      case 'ranks': return ranks;
      case 'emergency_contact_relationships': return relationships;
      case 'employment_status': return employmentStatus;
      case 'operational_shifts': return operationalShifts;
      default: return [];
    }
  };

  const getActiveStatus = (item: any) => {
    if (activeTab === 'ranks') {
      return item.is_active;
    }
    return item.active;
  };

  const tabs = [
    { key: 'positions' as DropdownType, label: 'Positions' },
    { key: 'ranks' as DropdownType, label: 'Ranks' },
    { key: 'emergency_contact_relationships' as DropdownType, label: 'Relationships' },
    { key: 'employment_status' as DropdownType, label: 'Employment Status' },
    { key: 'operational_shifts' as DropdownType, label: 'Operational Shift' }
  ];

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="dropdown-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="dropdown-title">
                Staff Dropdown Options Management
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Manage staff dropdown options including positions, ranks, emergency contact relationships, 
                and employment status. These options are used in the staff registration form to ensure 
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
                  alt="Staff Dropdown Management" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/EMSA-Introduction.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  Staff Dropdown
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
              
              {activeTab === 'ranks' && (
                <>
                  <FormColumn $flex="1">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Enter rank code"
                      required
                      disabled={loading}
                    />
                  </FormColumn>
                  <FormColumn $flex="1">
                    <Label htmlFor="level">Level</Label>
                    <Input
                      type="number"
                      id="level"
                      name="level"
                      value={formData.level || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter rank level"
                      min="0"
                      disabled={loading}
                    />
                  </FormColumn>
                </>
              )}
              
              {activeTab === 'operational_shifts' && (
                <>
                  <FormColumn $flex="1">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      type="time"
                      id="start_time"
                      name="start_time"
                      value={formData.start_time || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      disabled={loading}
                    />
                  </FormColumn>
                  
                  <FormColumn $flex="1">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      type="time"
                      id="end_time"
                      name="end_time"
                      value={formData.end_time || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      disabled={loading}
                    />
                  </FormColumn>
                </>
              )}
              
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
            
            {activeTab === 'operational_shifts' && (
              <FormRow>
                <FormColumn $flex="1">
                  <Label htmlFor="shift_start_date">Shift Start Date</Label>
                  <Input
                    type="date"
                    id="shift_start_date"
                    name="shift_start_date"
                    value={formData.shift_start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift_start_date: e.target.value }))}
                    disabled={loading}
                  />
                </FormColumn>
                
                <FormColumn $flex="1">
                  <Label htmlFor="shift_duration">Shift Duration (in hours)</Label>
                  <Input
                    type="number"
                    id="shift_duration"
                    name="shift_duration"
                    value={formData.shift_duration || 8}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift_duration: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter shift duration (0-24 hours)"
                    min="0"
                    max="24"
                    step="0.5"
                    disabled={loading}
                  />
                </FormColumn>
              </FormRow>
            )}
            
            {activeTab === 'operational_shifts' && (
              <FormRow>
                <FormColumn $flex="1">
                  <Label htmlFor="color">Shift Color</Label>
                  <Input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color || '#1177BB'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    disabled={loading}
                    style={{ height: '50px', cursor: 'pointer' }}
                  />
                </FormColumn>
                <FormColumn $flex="1">
                  <Label>Color Preview</Label>
                  <div style={{
                    height: '50px',
                    backgroundColor: formData.color || '#1177BB',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {formData.name || 'Shift Name'}
                  </div>
                </FormColumn>
              </FormRow>
            )}
            
            {(activeTab !== 'emergency_contact_relationships') && (
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
            )}
          </form>

          {/* Data Table */}
          {getCurrentData().length > 0 ? (
            <OptionsTable>
              <thead>
                <tr>
                  <th>Name</th>
                  {activeTab === 'ranks' && <th>Code</th>}
                  {activeTab === 'ranks' && <th>Level</th>}
                  {(activeTab !== 'emergency_contact_relationships') && <th>Description</th>}
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentData().map(item => (
                  <tr key={item.id}>
                    <td><strong>{getItemName(item)}</strong></td>
                    {activeTab === 'ranks' && <td>{(item as Rank).code}</td>}
                    {activeTab === 'ranks' && <td>{(item as Rank).level}</td>}
                    {(activeTab !== 'emergency_contact_relationships') && (
                      <td>
                        <small>{(item as any).description || '-'}</small>
                      </td>
                    )}
                    <td>
                      <ToggleButton
                        $active={getActiveStatus(item)}
                        onClick={() => handleToggleActive(item.id, getActiveStatus(item), getItemName(item))}
                        disabled={loading}
                      >
                        {getActiveStatus(item) ? 'Active' : 'Inactive'}
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
                        onClick={() => handleDelete(item.id, getItemName(item))}
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
