import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

interface OperationalStatus {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface OperationalStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOperationalStatusesUpdate: () => void;
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

const normalizeStatus = (row: any): OperationalStatus => ({
  id: row.id,
  name: row.name ?? row.status_name ?? '',
  display_name: row.display_name ?? row.status_name ?? row.name ?? '',
  description: row.description ?? '',
  is_active: !!(row.is_active ?? true),
  created_at: row.created_at ?? '',
  updated_at: row.updated_at ?? ''
});

export const OperationalStatusModal: React.FC<OperationalStatusModalProps> = ({
  isOpen,
  onClose,
  onOperationalStatusesUpdate
}) => {
  const sortByDisplayName = (items: OperationalStatus[]) =>
    items.slice().sort((a, b) => a.display_name.localeCompare(b.display_name));

  const [operationalStatuses, setOperationalStatuses] = useState<OperationalStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<OperationalStatus | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isAllSelected = operationalStatuses.length > 0 && selectedIds.length === operationalStatuses.length;

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      loadOperationalStatuses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
    }
  }, [isOpen]);

  const loadOperationalStatuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_status')
        .select('*');
      if (error) throw error;
      const items = (data || []).map(normalizeStatus);
      setOperationalStatuses(sortByDisplayName(items));
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to load operational statuses:', err);
      setError('Failed to load operational statuses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(operationalStatuses.map(s => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected operational statuses? This cannot be undone.`)) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('02_admin_register_fd2_operational_status')
        .delete()
        .in('id', selectedIds);
      if (error) throw error;
      await loadOperationalStatuses();
      onOperationalStatusesUpdate();
      setSelectedIds([]);
      setSuccess(`Deleted ${selectedIds.length} operational status${selectedIds.length !== 1 ? 'es' : ''}.`);
      setTimeout(() => { setSuccess(null); setError(null); }, 3000);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      setError('Failed to bulk delete operational statuses.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_active: true
    });
    setEditingStatus(null);
    setShowForm(false);
  };

  const handleEdit = (status: OperationalStatus) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      display_name: status.display_name,
      description: status.description || '',
      is_active: status.is_active
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (status: OperationalStatus) => {
    if (!confirm(`Are you sure you want to delete "${status.display_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('02_admin_register_fd2_operational_status')
        .delete()
        .eq('id', status.id);
      if (error) throw new Error(error.message || 'Failed to delete operational status');

      setSuccess('Operational status deleted successfully!');
      await loadOperationalStatuses();
      onOperationalStatusesUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete operational status:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete operational status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.display_name.trim()) {
      setError('Name and Display Name are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare for single or multi-add
      const payloadBase = {
        status_name: formData.display_name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active
      };

      if (editingStatus) {
        // Update existing
        const { error } = await supabase
          .from('02_admin_register_fd2_operational_status')
          .update(payloadBase)
          .eq('id', editingStatus.id);
        if (error) throw new Error(error.message || 'Failed to update operational status');
      } else {
        // Create new (supports comma-separated multi-add on Name, with duplicate prevention)
        const raw = formData.name.trim();
        const parts = raw.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const existingNames = new Set(operationalStatuses.map(s => s.name.toLowerCase()));
        const existingDisplayNames = new Set(operationalStatuses.map(s => s.display_name.toLowerCase()));

        if (parts.length <= 1) {
          // Single add with duplicate prevention
          const singleName = (parts[0] || formData.name).trim();
          const singleDisplay = (formData.display_name || singleName).trim();
          if (existingNames.has(singleName.toLowerCase()) || existingDisplayNames.has(singleDisplay.toLowerCase())) {
            throw new Error('Duplicate detected. Name or Display Name already exists.');
          }

          const { error } = await supabase
            .from('02_admin_register_fd2_operational_status')
            .insert([{ ...payloadBase, status_name: singleDisplay }]);
          if (error) throw new Error(error.message || 'Failed to create operational status');
        } else {
          // Multi-add path
          const seenLower = new Set<string>();
          const toCreate = parts.filter(p => {
            const lower = p.toLowerCase();
            if (seenLower.has(lower)) return false; // de-duplicate input
            seenLower.add(lower);
            // skip if either name or display_name already exists
            return !existingNames.has(lower) && !existingDisplayNames.has(lower);
          });

          if (toCreate.length === 0) {
            throw new Error('All entries are duplicates; nothing to add.');
          }

          let successCount = 0;
          let failCount = 0;
          for (const name of toCreate) {
            const { error } = await supabase
              .from('02_admin_register_fd2_operational_status')
              .insert([{ ...payloadBase, status_name: name }]);
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
        setSuccess(`Operational status ${editingStatus ? 'updated' : 'created'} successfully!`);
      }
      await loadOperationalStatuses();
      onOperationalStatusesUpdate();
      
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save operational status:', err);
      setError(err instanceof Error ? err.message : 'Failed to save operational status');
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
          <ModalTitle>Manage Operational Statuses</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormSection>
          <SectionTitle>{editingStatus ? 'Edit Operational Status' : 'Add New Operational Status'}</SectionTitle>
          
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>
              Add New Operational Status
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
                    disabled={!!editingStatus}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="User-friendly name (must be unique)"
                    required
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this operational status"
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
                  {loading ? 'Saving...' : (editingStatus ? 'Update' : 'Create')}
                </Button>
              </ButtonGroup>
            </form>
          )}
        </FormSection>

        <TypesList>
          <SectionTitle>Current Operational Statuses</SectionTitle>
          {operationalStatuses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px 0' }}>
              <Checkbox
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <span style={{ color: '#333' }}>Select all</span>
              <span style={{ color: '#666' }}>
                Selected {selectedIds.length} / {operationalStatuses.length}
              </span>
              <Button $variant="danger" onClick={handleBulkDelete} disabled={loading || selectedIds.length === 0}>
                {loading ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          )}
           {loading && operationalStatuses.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
               Loading operational statuses...
             </div>
           ) : operationalStatuses.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
               No operational statuses found. Add your first operational status above.
             </div>
           ) : (
             operationalStatuses
               .slice()
               .sort((a, b) => a.display_name.localeCompare(b.display_name))
               .map(status => (
               <TypeItem key={status.id} $isActive={status.is_active}>
                 <TypeInfo>
                   <TypeName>
                     <Checkbox
                       type="checkbox"
                       checked={selectedIds.includes(status.id)}
                       onChange={() => toggleSelect(status.id)}
                     />
                     {status.display_name}
                   </TypeName>
                  {status.description && (
                    <TypeDescription>{status.description}</TypeDescription>
                  )}
                </TypeInfo>
                <ActionButtons>
                  <TypeStatus $isActive={status.is_active}>
                    {status.is_active ? 'Active' : 'Inactive'}
                  </TypeStatus>
                  <ActionButton $variant="edit" onClick={() => handleEdit(status)} disabled={loading}>
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
