import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
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

const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FieldColumn = styled.div`
  flex: 1;
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

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
`;

const Button = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  margin-right: 10px;
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  
  &:hover {
    background-color: #c82333;
  }
`;

const AddButton = styled(Button)`
  background-color: #28a745;
  
  &:hover {
    background-color: #218838;
  }
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

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin-bottom: 15px;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1177BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TabContainer = styled.div`
  margin-bottom: 30px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? '#1177BB' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : '#666'};
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-right: 10px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#0f5c99' : '#e0e0e0'};
  }
`;

const TabContent = styled.div<{ $active: boolean }>`
  display: ${props => props.$active ? 'block' : 'none'};
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 8px 8px 8px;
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

interface DropdownOption {
  id: number;
  option_value: string;
  display_text: string;
  sort_order: number;
  is_active: boolean;
}

interface DropdownConfig {
  id: number;
  dropdown_name: string;
  display_name: string;
  description?: string;
  options: DropdownOption[];
}

interface EquipmentType {
  uuid_id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const DropdownManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [configs, setConfigs] = useState<DropdownConfig[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newOptions, setNewOptions] = useState<{[key: number]: string}>({});
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dropdowns' | 'equipment'>('dropdowns');
  
  // Local state for editing options (prevents resets during typing)
  const [editingOptions, setEditingOptions] = useState<{[key: number]: {
    display_text: string;
    is_active: boolean;
  }}>({});
  
  // Local state for editing equipment types
  const [editingEquipmentTypes, setEditingEquipmentTypes] = useState<{[key: string]: {
    name: string;
    description: string;
    active: boolean;
  }}>({});
  const [newEquipmentType, setNewEquipmentType] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadConfigs();
    loadEquipmentTypes();
  }, []);

  useEffect(() => {
    // Handle URL parameter for auto-selecting dropdown
    const dropdownParam = searchParams.get('dropdown');
    if (dropdownParam && configs.length > 0) {
      const config = configs.find(c => c.dropdown_name === dropdownParam);
      if (config) {
        setSelectedConfigId(config.id);
      }
    }
  }, [searchParams, configs.length]); // Only depend on searchParams and configs length

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dropdown-management', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load configurations');
      }

      const newConfigs = data?.data || [];
      setConfigs(newConfigs);
      
      // Clear editing state when new data is loaded to avoid showing stale changes
      setEditingOptions({});
    } catch (error: any) {
      console.error('Error loading configurations:', error);
      setError(error.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('uuid_id, name, description, active, created_at, updated_at')
        .order('name');

      if (error) throw error;

      setEquipmentTypes(data || []);
    } catch (error: any) {
      console.error('Error loading equipment types:', error);
      setError('Failed to load equipment types');
    }
  };

  const handleAddOption = async (configId: number) => {
    const optionText = newOptions[configId];
    if (!optionText?.trim()) {
      setError('Please enter an option value');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('dropdown-management', {
        method: 'POST',
        body: {
          action: 'add_option',
          dropdown_id: configId,
          option_value: optionText.trim(),
          display_text: optionText.trim(),
          sort_order: 999 // Will be sorted later
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to add option');
      }

      setSuccess('Option added successfully');
      setNewOptions({ ...newOptions, [configId]: '' });
      loadConfigs();
    } catch (error: any) {
      console.error('Error adding option:', error);
      setError(error.message || 'Failed to add option');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm('Are you sure you want to delete this option?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('dropdown-management', {
        method: 'DELETE',
        body: {
          action: 'delete_option',
          option_id: optionId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete option');
      }

      setSuccess('Option deleted successfully');
      loadConfigs();
    } catch (error: any) {
      console.error('Error deleting option:', error);
      setError(error.message || 'Failed to delete option');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current value for an option (from editing state or config)
  const getOptionValue = (option: DropdownOption, field: 'display_text' | 'is_active'): string | boolean => {
    const editingState = editingOptions[option.id];
    if (editingState && field === 'display_text') {
      return editingState.display_text;
    } else if (editingState && field === 'is_active') {
      return editingState.is_active;
    }
    return option[field];
  };

  const handleUpdateOption = async (option: DropdownOption) => {
    const editingState = editingOptions[option.id];
    
    // Use editing state if available, otherwise use current option values
    const updateData = editingState ? {
      option_id: option.id,
      option_value: option.option_value,
      display_text: editingState.display_text,
      sort_order: option.sort_order,
      is_active: editingState.is_active
    } : {
      option_id: option.id,
      option_value: option.option_value,
      display_text: option.display_text,
      sort_order: option.sort_order,
      is_active: option.is_active
    };

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('dropdown-management', {
        method: 'PUT',
        body: {
          action: 'update_option',
          ...updateData
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update option');
      }

      setSuccess('Option updated successfully');
      // Clear editing state for this option after successful update
      const newEditingState = { ...editingOptions };
      delete newEditingState[option.id];
      setEditingOptions(newEditingState);
      loadConfigs();
    } catch (error: any) {
      console.error('Error updating option:', error);
      setError(error.message || 'Failed to update option');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipmentType = async () => {
    if (!newEquipmentType.name.trim()) {
      setError('Equipment type name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('equipment_types')
        .insert({
          name: newEquipmentType.name.trim(),
          description: newEquipmentType.description.trim() || null,
          active: true
        });

      if (error) throw error;

      setSuccess('Equipment type added successfully');
      setNewEquipmentType({ name: '', description: '' });
      loadEquipmentTypes();
    } catch (error: any) {
      console.error('Error adding equipment type:', error);
      setError('Failed to add equipment type: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipmentType = async (equipmentType: EquipmentType) => {
    const editingState = editingEquipmentTypes[equipmentType.uuid_id];
    
    const updateData = editingState || {
      name: equipmentType.name,
      description: equipmentType.description || '',
      active: equipmentType.active
    };

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('equipment_types')
        .update({
          name: updateData.name.trim(),
          description: updateData.description.trim() || null,
          active: updateData.active
        })
        .eq('uuid_id', equipmentType.uuid_id);

      if (error) throw error;

      setSuccess('Equipment type updated successfully');
      
      // Clear editing state for this equipment type
      const newEditingState = { ...editingEquipmentTypes };
      delete newEditingState[equipmentType.uuid_id];
      setEditingEquipmentTypes(newEditingState);
      
      loadEquipmentTypes();
    } catch (error: any) {
      console.error('Error updating equipment type:', error);
      setError('Failed to update equipment type: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipmentType = async (uuidId: string) => {
    if (!confirm('Are you sure you want to delete this equipment type? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First check if this equipment type is being used
      const { data: usageData } = await supabase
        .from('room_equipment')
        .select('id')
        .eq('equipment_type_id', uuidId)
        .limit(1);

      if (usageData && usageData.length > 0) {
        throw new Error('Cannot delete equipment type that is in use. Please remove all equipment using this type first.');
      }

      const { error } = await supabase
        .from('equipment_types')
        .delete()
        .eq('uuid_id', uuidId);

      if (error) throw error;

      setSuccess('Equipment type deleted successfully');
      loadEquipmentTypes();
    } catch (error: any) {
      console.error('Error deleting equipment type:', error);
      setError('Failed to delete equipment type: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current value for equipment type (from editing state or original)
  const getEquipmentTypeValue = (equipmentType: EquipmentType, field: 'name' | 'description' | 'active'): string | boolean => {
    const editingState = editingEquipmentTypes[equipmentType.uuid_id];
    if (editingState && (field === 'name' || field === 'description')) {
      return editingState[field];
    } else if (editingState && field === 'active') {
      return editingState.active;
    }
    return equipmentType[field];
  };

  if (loading && configs.length === 0 && equipmentTypes.length === 0) {
    return (
      <MainContent>
        <Title>Options Management</Title>
        <div style={{ margin: '20px 0' }}>
          <LoadingSpinner />
          Loading configurations...
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <Title>Options Management</Title>
      <Divider />

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {/* Tab Navigation */}
      <TabContainer>
        <TabButton 
          $active={activeTab === 'dropdowns'}
          onClick={() => setActiveTab('dropdowns')}
        >
          Dropdown Options
        </TabButton>
        <TabButton 
          $active={activeTab === 'equipment'}
          onClick={() => setActiveTab('equipment')}
        >
          Equipment Types
        </TabButton>
      </TabContainer>

      {/* Dropdown Options Tab */}
      <TabContent $active={activeTab === 'dropdowns'}>
        <Section>
          <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>
            Manage Dropdown Options
          </h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Add, edit, or remove options from dropdown lists. These changes will appear immediately in the Fire Station Layout form.
          </p>

          {/* Dropdown Configuration Selector */}
          <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#1177BB' }}>
              Select Dropdown to Manage:
            </label>
            <Select
              value={selectedConfigId || ''}
              onChange={(e) => setSelectedConfigId(e.target.value ? parseInt(e.target.value) : null)}
              style={{ 
                minWidth: '300px', 
                fontSize: '16px',
                padding: '10px'
              }}
            >
              <option value="">-- Select Dropdown --</option>
              {configs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.display_name} ({config.options.length} options)
                </option>
              ))}
            </Select>
          </div>

          {configs
            .filter(config => !selectedConfigId || config.id === selectedConfigId)
            .map((config) => (
            <Card key={config.id}>
              <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>
                {config.display_name}
              </h3>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                {config.description}
              </p>

              {/* Current Options */}
              <div style={{ marginBottom: '20px' }}>
                <Label style={{ marginBottom: '10px' }}>Current Options:</Label>
                {config.options.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No options defined</p>
                ) : (
                  config.options.map((option) => (
                    <div key={option.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      marginBottom: '10px',
                      padding: '5px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <Input
                        value={getOptionValue(option, 'display_text') as string}
                        onChange={(e) => {
                          setEditingOptions(prev => ({
                            ...prev,
                            [option.id]: {
                              display_text: e.target.value,
                              is_active: getOptionValue(option, 'is_active') as boolean
                            }
                          }));
                        }}
                        style={{ flex: 1, minWidth: '200px' }}
                      />
                      <Select
                        value={(getOptionValue(option, 'is_active') as boolean).toString()}
                        onChange={(e) => {
                          setEditingOptions(prev => ({
                            ...prev,
                            [option.id]: {
                              display_text: getOptionValue(option, 'display_text') as string,
                              is_active: e.target.value === 'true'
                            }
                          }));
                        }}
                        style={{ width: 'auto' }}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Select>
                      <Button
                        onClick={() => handleUpdateOption(option)}
                        disabled={loading}
                        style={{ 
                          padding: '8px 16px',
                          backgroundColor: editingOptions[option.id] ? '#FF9900' : '#1177BB',
                          color: 'white'
                        }}
                      >
                        {editingOptions[option.id] ? 'Save Changes' : 'Update'}
                      </Button>
                      <DeleteButton
                        onClick={() => handleDeleteOption(option.id)}
                        disabled={loading}
                        style={{ padding: '8px 16px' }}
                      >
                        Delete
                      </DeleteButton>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Option */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <Label style={{ marginBottom: '10px' }}>Add New Option:</Label>
                <FormRow>
                  <FieldColumn>
                    <Input
                      value={newOptions[config.id] || ''}
                      onChange={(e) => setNewOptions({
                        ...newOptions,
                        [config.id]: e.target.value
                      })}
                      placeholder={`Add new option to ${config.display_name}`}
                    />
                  </FieldColumn>
                  <AddButton
                    onClick={() => handleAddOption(config.id)}
                    disabled={loading || !newOptions[config.id]?.trim()}
                  >
                    Add Option
                  </AddButton>
                </FormRow>
              </div>
            </Card>
          ))}
        </Section>
      </TabContent>

      {/* Equipment Types Tab */}
      <TabContent $active={activeTab === 'equipment'}>
        <Section>
          <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>
            Manage Equipment Types
          </h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Add, edit, or remove equipment types. These equipment types will appear in the Equipment Type dropdown on the Station Room Equipment page.
          </p>

          {/* Current Equipment Types */}
          <div style={{ marginBottom: '20px' }}>
            <Label style={{ marginBottom: '10px' }}>Current Equipment Types ({equipmentTypes.length} total):</Label>
            {equipmentTypes.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No equipment types defined</p>
            ) : (
              equipmentTypes.map((equipmentType) => (
                <div key={equipmentType.uuid_id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  backgroundColor: editingEquipmentTypes[equipmentType.uuid_id] ? '#f9f9f9' : 'white'
                }}>
                  <Input
                    value={getEquipmentTypeValue(equipmentType, 'name') as string}
                    onChange={(e) => {
                      setEditingEquipmentTypes(prev => ({
                        ...prev,
                        [equipmentType.uuid_id]: {
                          name: e.target.value,
                          description: getEquipmentTypeValue(equipmentType, 'description') as string,
                          active: getEquipmentTypeValue(equipmentType, 'active') as boolean
                        }
                      }));
                    }}
                    style={{ flex: 1, minWidth: '150px' }}
                    placeholder="Equipment type name"
                  />
                  <Input
                    value={getEquipmentTypeValue(equipmentType, 'description') as string}
                    onChange={(e) => {
                      setEditingEquipmentTypes(prev => ({
                        ...prev,
                        [equipmentType.uuid_id]: {
                          name: getEquipmentTypeValue(equipmentType, 'name') as string,
                          description: e.target.value,
                          active: getEquipmentTypeValue(equipmentType, 'active') as boolean
                        }
                      }));
                    }}
                    style={{ flex: 2, minWidth: '200px' }}
                    placeholder="Description (optional)"
                  />
                  <Select
                    value={(getEquipmentTypeValue(equipmentType, 'active') as boolean).toString()}
                    onChange={(e) => {
                      setEditingEquipmentTypes(prev => ({
                        ...prev,
                        [equipmentType.uuid_id]: {
                          name: getEquipmentTypeValue(equipmentType, 'name') as string,
                          description: getEquipmentTypeValue(equipmentType, 'description') as string,
                          active: e.target.value === 'true'
                        }
                      }));
                    }}
                    style={{ width: 'auto' }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                  <Button
                    onClick={() => handleUpdateEquipmentType(equipmentType)}
                    disabled={loading}
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: editingEquipmentTypes[equipmentType.uuid_id] ? '#FF9900' : '#1177BB',
                      color: 'white'
                    }}
                  >
                    {editingEquipmentTypes[equipmentType.uuid_id] ? 'Save Changes' : 'Update'}
                  </Button>
                  <DeleteButton
                    onClick={() => handleDeleteEquipmentType(equipmentType.uuid_id)}
                    disabled={loading}
                    style={{ padding: '8px 16px' }}
                  >
                    Delete
                  </DeleteButton>
                </div>
              ))
            )}
          </div>

          {/* Add New Equipment Type */}
          <div style={{ borderTop: '2px solid #1177BB', paddingTop: '20px' }}>
            <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Add New Equipment Type</h3>
            <FormRow>
              <FieldColumn>
                <Label>Equipment Type Name *</Label>
                <Input
                  value={newEquipmentType.name}
                  onChange={(e) => setNewEquipmentType({
                    ...newEquipmentType,
                    name: e.target.value
                  })}
                  placeholder="e.g., Fire Extinguisher, Ladder, Hose"
                />
              </FieldColumn>
              <FieldColumn>
                <Label>Description</Label>
                <Input
                  value={newEquipmentType.description}
                  onChange={(e) => setNewEquipmentType({
                    ...newEquipmentType,
                    description: e.target.value
                  })}
                  placeholder="Optional description"
                />
              </FieldColumn>
              <AddButton
                onClick={handleAddEquipmentType}
                disabled={loading || !newEquipmentType.name.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                Add Equipment Type
              </AddButton>
            </FormRow>
          </div>
        </Section>
      </TabContent>
    </MainContent>
  );
};

export default DropdownManagement;
