import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

interface IncidentType {
  id: number;
  name: string;
  display_name: string;
  incident_types: string;
  description: string;
  is_active: boolean;
  color_code: string;
  created_at: string;
  updated_at: string;
}

interface IncidentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentTypesUpdate: () => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1177BB;
  font-size: 1.8rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const FormSection = styled.div`
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  margin-bottom: 5px;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    color: #666;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #333;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorPicker = styled.input`
  width: 50px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;

  ${props => {
    switch(props.$variant) {
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover:not(:disabled) { background: #c82333; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover:not(:disabled) { background: #545b62; }
        `;
      default:
        return `
          background: #1177BB;
          color: white;
          &:hover:not(:disabled) { background: #0f5c99; }
        `;
    }
  }}

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const TypesList = styled.div`
  margin-top: 20px;
`;

const TypeItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  background: ${props => props.$isActive ? '#f8f9fa' : '#fff5f5'};
  border: 1px solid ${props => props.$isActive ? '#e0e0e0' : '#ffebee'};
  border-radius: 6px;
  margin-bottom: 10px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isActive ? '#e9ecef' : '#ffebee'};
  }
`;

const TypeInfo = styled.div`
  flex: 1;
`;

const TypeName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorIndicator = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #ccc;
`;

const TypeDescription = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

const TypeStatus = styled.span<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? '#28a745' : '#dc3545'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch(props.$variant) {
      case 'delete':
        return `
          background: #dc3545;
          color: white;
          &:hover:not(:disabled) { background: #c82333; }
        `;
      default:
        return `
          background: #007bff;
          color: white;
          &:hover:not(:disabled) { background: #0056b3; }
        `;
    }
  }}

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #c3e6cb;
  margin-bottom: 15px;
  font-size: 14px;
`;

export const IncidentTypeModal: React.FC<IncidentTypeModalProps> = ({
  isOpen,
  onClose,
  onIncidentTypesUpdate
}) => {
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<IncidentType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isAllSelected = incidentTypes.length > 0 && selectedIds.length === incidentTypes.length;

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    incident_types: '',
    description: '',
    color_code: '#3B82F6',
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      loadIncidentTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSelectedIds([]);
  }, [isOpen]);

  const loadIncidentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('03_ecc_01_edob_02_incident_types')
        .select('*')
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      setIncidentTypes(data || []);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to load incident types:', err);
      setError('Failed to load incident types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(incidentTypes.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected incident types? This cannot be undone.`)) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('03_ecc_01_edob_02_incident_types')
        .delete()
        .in('id', selectedIds);
      if (error) throw error;

      await loadIncidentTypes();
      onIncidentTypesUpdate();
      setSelectedIds([]);

      setSuccess(`Deleted ${selectedIds.length} incident type(s).`);
      setTimeout(() => { setSuccess(null); setError(null); }, 3000);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      setError('Failed to bulk delete incident types.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      incident_types: '',
      description: '',
      color_code: '#3B82F6',
      is_active: true
    });
    setEditingType(null);
    setShowForm(false);
  };

  const handleEdit = (type: IncidentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      display_name: type.display_name,
      incident_types: type.incident_types || '', // Load existing emergency types data
      description: type.description || '',
      color_code: type.color_code || '#3B82F6',
      is_active: type.is_active
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (type: IncidentType) => {
    if (!confirm(`Are you sure you want to delete "${type.display_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('03_ecc_01_edob_02_incident_types')
        .delete()
        .eq('id', type.id);
      if (error) throw error;

      setSuccess('Incident type deleted successfully!');
      await loadIncidentTypes();
      onIncidentTypesUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete incident type:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete incident type');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.display_name.trim()) {
      setError('Name and Incident Display Name are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (editingType) {
        // Update existing
        const { data, error } = await supabase
          .from('03_ecc_01_edob_02_incident_types')
          .update({
            name: formData.name.trim(),
            display_name: formData.display_name.trim(),
            incident_types: formData.incident_types || 'Other',
            description: formData.description.trim() || null,
            color_code: formData.color_code,
            is_active: formData.is_active
          })
          .eq('id', editingType.id)
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } else {
        // Create new (supports comma-separated multi-add on Name, with duplicate prevention)
        const raw = formData.name.trim();
        const parts = raw.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const existingNames = new Set(incidentTypes.map(s => s.name.toLowerCase()));
        const existingDisplayNames = new Set(incidentTypes.map(s => s.display_name.toLowerCase()));

        if (parts.length <= 1) {
          // Single add with duplicate prevention
          const singleName = (parts[0] || formData.name).trim();
          const singleDisplay = (formData.display_name || singleName).trim();
          if (existingNames.has(singleName.toLowerCase()) || existingDisplayNames.has(singleDisplay.toLowerCase())) {
            throw new Error('Duplicate detected. Name or Incident Display Name already exists.');
          }
          const { data, error } = await supabase
            .from('03_ecc_01_edob_02_incident_types')
            .insert([{ 
              name: singleName,
              display_name: singleDisplay,
              incident_types: formData.incident_types || 'Other',
              description: formData.description.trim() || null,
              color_code: formData.color_code,
              is_active: formData.is_active
            }])
            .select()
            .single();

          if (error) throw error;

          return { data, error: null };
        } else {
          // Multi-add path
          const seenLower = new Set<string>();
          const toCreate = parts.filter(p => {
            const lower = p.toLowerCase();
            if (seenLower.has(lower)) return false; // de-duplicate input
            seenLower.add(lower);
            return !existingNames.has(lower) && !existingDisplayNames.has(lower);
          });

          if (toCreate.length === 0) {
            throw new Error('All entries are duplicates; nothing to add.');
          }

          let successCount = 0;
          let failCount = 0;
          for (const name of toCreate) {
            const { error } = await supabase
              .from('03_ecc_01_edob_02_incident_types')
              .insert([{ 
                name,
                display_name: name, // mirror name for multi-add
                incident_types: formData.incident_types || 'Other',
                description: formData.description.trim() || null,
                color_code: formData.color_code,
                is_active: formData.is_active
              }]);
            if (error) {
              failCount++;
            } else {
              successCount++;
            }
          }

          setSuccess(`Added ${successCount} item(s). ${failCount > 0 ? `Skipped/failed: ${failCount}.` : ''}`.trim());
        }
      }

      if (!success) {
        setSuccess(`Incident type ${editingType ? 'updated' : 'created'} successfully!`);
      }
      await loadIncidentTypes();
      onIncidentTypesUpdate();
      
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save incident type:', err);
      setError(err instanceof Error ? err.message : 'Failed to save incident type');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Manage Incident Types</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormSection>
          <SectionTitle>{editingType ? 'Edit Incident Type' : 'Add New Incident Type'}</SectionTitle>
          
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>
              Add New Incident Type
            </Button>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="name">Name *</Label>
                  <div style={{ fontSize: '12px', color: '#666', margin: '4px 0 6px' }}>
                    Tip: Separate multiple names with commas to add several at once. Duplicates are skipped.
                  </div>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Internal name (lowercase, no spaces)"
                    disabled={!!editingType}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="incident_types">Emergency Types</Label>
                  <Input
                    id="incident_types"
                    type="text"
                    value={formData.incident_types}
                    onChange={(e) => handleInputChange('incident_types', e.target.value)}
                    placeholder="Enter emergency type (e.g., Fire, Medical, Rescue, Hazmat)"
                  />
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label htmlFor="display_name">Incident Display Name *</Label>
                  <Input
                    id="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="User-friendly name (must be unique)"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="color_code">Color</Label>
                  <ColorPickerContainer>
                    <ColorPicker
                      type="color"
                      id="color_code"
                      value={formData.color_code}
                      onChange={(e) => handleInputChange('color_code', e.target.value)}
                      title="Choose incident type color"
                    />
                    <Input
                      type="text"
                      value={formData.color_code}
                      onChange={(e) => handleInputChange('color_code', e.target.value)}
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      style={{ flex: 1 }}
                    />
                  </ColorPickerContainer>
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this incident type"
                />
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  Active (available for selection)
                </CheckboxLabel>
              </FormGroup>

              <ButtonGroup>
                <Button type="button" $variant="secondary" onClick={resetForm} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingType ? 'Update' : 'Create')}
                </Button>
              </ButtonGroup>
            </form>
          )}
        </FormSection>

        <TypesList>
          <SectionTitle>Current Incident Types</SectionTitle>
          {incidentTypes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px 0' }}>
              <Checkbox type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
              <span style={{ color: '#333' }}>Select all</span>
              <span style={{ color: '#666' }}>Selected {selectedIds.length} / {incidentTypes.length}</span>
              <Button $variant="danger" onClick={handleBulkDelete} disabled={loading || selectedIds.length === 0}>
                {loading ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          )}
          {loading && incidentTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Loading incident types...
            </div>
          ) : incidentTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No incident types found. Add your first incident type above.
            </div>
          ) : (
            incidentTypes.map(type => (
              <TypeItem key={type.id} $isActive={type.is_active}>
                <TypeInfo>
                  <TypeName>
                    <Checkbox type="checkbox" checked={selectedIds.includes(type.id)} onChange={() => toggleSelect(type.id)} />
                    <ColorIndicator $color={type.color_code || '#3B82F6'} />
                    {type.display_name}
                  </TypeName>
                  {type.description && (
                    <TypeDescription>{type.description}</TypeDescription>
                  )}
                </TypeInfo>
                <ActionButtons>
                  <TypeStatus $isActive={type.is_active}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </TypeStatus>
                  <ActionButton $variant="edit" onClick={() => handleEdit(type)} disabled={loading}>
                    Edit
                  </ActionButton>
                </ActionButtons>
              </TypeItem>
            ))
          )}
        </TypesList>

        <ButtonGroup style={{ marginTop: '30px' }}>
          <Button onClick={onClose}>
            Close
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};