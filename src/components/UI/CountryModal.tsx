import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

interface Country {
  id: number;
  name: string;
  display_name: string;
  country_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCountriesUpdate: () => void;
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

const TypeCode = styled.div`
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

const normalizeCountry = (row: any): Country => ({
  id: row.id,
  name: row.name ?? row.country_name ?? '',
  display_name: row.display_name ?? row.country_name ?? row.name ?? '',
  country_code: row.country_code ?? row.iso_code ?? '',
  is_active: !!(row.is_active ?? true),
  created_at: row.created_at ?? '',
  updated_at: row.updated_at ?? ''
});

export const CountryModal: React.FC<CountryModalProps> = ({
  isOpen,
  onClose,
  onCountriesUpdate
}) => {
  const sortByDisplayName = (items: Country[]) =>
    items.slice().sort((a, b) => a.display_name.localeCompare(b.display_name));

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isAllSelected = countries.length > 0 && selectedIds.length === countries.length;

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    country_code: '',
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      loadCountries();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSelectedIds([]);
  }, [isOpen]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('02_admin_register_fd2_countries')
        .select('*');
      if (error) throw error;
      const items = (data || []).map(normalizeCountry);
      setCountries(sortByDisplayName(items));
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to load countries:', err);
      setError('Failed to load countries. Please try again.');
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
      setSelectedIds(countries.map(c => c.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected countries? This cannot be undone.`)) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('02_admin_register_fd2_countries')
        .delete()
        .in('id', selectedIds);
      if (error) throw error;
      await loadCountries();
      onCountriesUpdate();
      setSelectedIds([]);
      setSuccess(`Deleted ${selectedIds.length} countr${selectedIds.length !== 1 ? 'ies' : 'y'}.`);
      setTimeout(() => { setSuccess(null); setError(null); }, 3000);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      setError('Failed to bulk delete countries.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      country_code: '',
      is_active: true
    });
    setEditingCountry(null);
    setShowForm(false);
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      display_name: country.display_name,
      country_code: country.country_code || '',
      is_active: country.is_active
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (country: Country) => {
    if (!confirm(`Are you sure you want to delete "${country.display_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('02_admin_register_fd2_countries')
        .delete()
        .eq('id', country.id);
      if (error) throw new Error(error.message || 'Failed to delete country');

      setSuccess('Country deleted successfully!');
      await loadCountries();
      onCountriesUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete country:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete country');
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

      const payloadBase = {
        country_name: formData.display_name.trim(),
        country_code: formData.country_code.trim() || null,
        is_active: formData.is_active
      };

      if (editingCountry) {
        // Update existing
        const { error } = await supabase
          .from('02_admin_register_fd2_countries')
          .update(payloadBase)
          .eq('id', editingCountry.id);
        if (error) throw new Error(error.message || 'Failed to update country');
      } else {
        // Create new (supports comma-separated multi-add on Name, with duplicate prevention)
        const raw = formData.name.trim();
        const parts = raw.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const existingNames = new Set(countries.map(c => c.name.toLowerCase()));
        const existingDisplayNames = new Set(countries.map(c => c.display_name.toLowerCase()));

        if (parts.length <= 1) {
          const singleName = (parts[0] || formData.name).trim();
          const singleDisplay = (formData.display_name || singleName).trim();
          if (existingNames.has(singleName.toLowerCase()) || existingDisplayNames.has(singleDisplay.toLowerCase())) {
            throw new Error('Duplicate detected. Name or Display Name already exists.');
          }

          const { error } = await supabase
            .from('02_admin_register_fd2_countries')
            .insert([{ ...payloadBase, country_name: singleDisplay }]);
          if (error) throw new Error(error.message || 'Failed to create country');
        } else {
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
              .from('02_admin_register_fd2_countries')
              .insert([{ ...payloadBase, country_name: name }]);
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
        setSuccess(`Country ${editingCountry ? 'updated' : 'created'} successfully!`);
      }
      await loadCountries();
      onCountriesUpdate();
      
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save country:', err);
      setError(err instanceof Error ? err.message : 'Failed to save country');
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
          <ModalTitle>Manage Countries</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormSection>
          <SectionTitle>{editingCountry ? 'Edit Country' : 'Add New Country'}</SectionTitle>
          
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>
              Add New Country
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
                    disabled={!!editingCountry}
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
                <Label htmlFor="country_code">Country Code</Label>
                <Input
                  id="country_code"
                  type="text"
                  value={formData.country_code}
                  onChange={(e) => handleInputChange('country_code', e.target.value)}
                  placeholder="e.g., US, UK, ZA"
                  maxLength={2}
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
                  {loading ? 'Saving...' : (editingCountry ? 'Update' : 'Create')}
                </Button>
              </ButtonGroup>
            </form>
          )}
        </FormSection>

        <TypesList>
          <SectionTitle>Current Countries</SectionTitle>
           {countries.length > 0 && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px 0' }}>
               <Checkbox type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
               <span style={{ color: '#333' }}>Select all</span>
               <span style={{ color: '#666' }}>Selected {selectedIds.length} / {countries.length}</span>
               <Button $variant="danger" onClick={handleBulkDelete} disabled={loading || selectedIds.length === 0}>
                 {loading ? 'Deleting...' : 'Delete Selected'}
               </Button>
             </div>
           )}
           {loading && countries.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
               Loading countries...
             </div>
           ) : countries.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
               No countries found. Add your first country above.
             </div>
           ) : (
             countries
               .slice()
               .sort((a, b) => a.display_name.localeCompare(b.display_name))
               .map(country => (
               <TypeItem key={country.id} $isActive={country.is_active}>
                 <TypeInfo>
                   <TypeName>
                     <Checkbox type="checkbox" checked={selectedIds.includes(country.id)} onChange={() => toggleSelect(country.id)} />
                     {country.display_name}
                   </TypeName>
                  {country.country_code && (
                    <TypeCode>Code: {country.country_code}</TypeCode>
                  )}
                </TypeInfo>
                <ActionButtons>
                  <TypeStatus $isActive={country.is_active}>
                    {country.is_active ? 'Active' : 'Inactive'}
                  </TypeStatus>
                  <ActionButton $variant="edit" onClick={() => handleEdit(country)} disabled={loading}>
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
