import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

type DropdownType = 'call_signs' | 'vehicle_types' | 'vehicle_makes';

interface OptionItem {
  id: number;
  name: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface VehicleOptionsModalProps {
  isOpen: boolean;
  type: DropdownType;
  onClose: () => void;
  onOptionsUpdate: () => void;
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

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: end;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
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

export const VehicleOptionsModal: React.FC<VehicleOptionsModalProps> = ({
  isOpen,
  type,
  onClose,
  onOptionsUpdate
}) => {
  const [items, setItems] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formName, setFormName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const isBulkEnabled = type === 'call_signs' || type === 'vehicle_types' || type === 'vehicle_makes';

  const titleMap: Record<DropdownType, string> = {
    call_signs: 'Manage Call Signs',
    vehicle_types: 'Manage Vehicle Types',
    vehicle_makes: 'Manage Vehicle Makes'
  };

  const singularMap: Record<DropdownType, string> = {
    call_signs: 'Call Sign',
    vehicle_types: 'Vehicle Type',
    vehicle_makes: 'Vehicle Make'
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, type]);

  useEffect(() => {
    // Clear selection whenever modal type changes or closes
    setSelectedIds(new Set());
  }, [type, isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading data for type:', type);
      
      if (type === 'call_signs') {
        const { data, error } = await supabase
          .from('02_admin_register_fd5_vehicle_call_signs')
          .select('*');
        if (error) throw new Error(error.message || 'Failed to load call signs');
        const list: OptionItem[] = (data || []).map((row: any) => ({
          id: row.id ?? row.call_sign_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_callsign ?? row.call_sign ?? row.call_sign_name ?? row.code ?? '',
          active: !!(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true)),
          created_at: row.created_at,
          updated_at: row.updated_at
        })).filter(i => i.id !== null && i.name);
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setItems(list);
      } else if (type === 'vehicle_types') {
        const { data, error } = await supabase
          .from('02_admin_register_fd6_vehicle_types')
          .select('*');
        if (error) throw new Error(error.message || 'Failed to load vehicle types');
        const list: OptionItem[] = (data || []).map((row: any) => ({
          id: row.id ?? row.type_id ?? row.vehicle_type_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_type ?? row.vehicle_type_name ?? row.type_name ?? '',
          active: !!(row.active ?? row.is_active ?? true),
          created_at: row.created_at,
          updated_at: row.updated_at
        })).filter(i => i.id !== null && i.name);
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setItems(list);
      } else if (type === 'vehicle_makes') {
        console.log('Fetching vehicle makes from 02_admin_register_fd7_vehicle_makes');
        const { data, error } = await supabase
          .from('02_admin_register_fd7_vehicle_makes')
          .select('*');
        
        if (error) {
            console.error('Error fetching vehicle makes:', error);
            throw new Error(error.message || 'Failed to load vehicle makes');
        }
        
        console.log('Vehicle makes loaded:', data?.length);
        
        const list: OptionItem[] = (data || []).map((row: any) => ({
          id: row.id ?? row.make_id ?? row.vehicle_make_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_make ?? row.vehicle_make_name ?? row.make_name ?? row.make ?? row.code ?? '',
          active: !!(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true)),
          created_at: row.created_at,
          updated_at: row.updated_at
        })).filter(i => i.id !== null && i.name);
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setItems(list);
      } else {
        // Fallback for any other type to the edge function (legacy path)
        const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'GET'
        });
        if (error) throw new Error(error.message || 'Failed to load options');
        const all = data?.data || {};
        const list: OptionItem[] = (all.vehicleMakes || []);
        setItems(list);
      }
    } catch (err: any) {
      console.error('Error loading vehicle dropdown options:', err);
      setError(err.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (items.length === 0) return;
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const resetForm = () => {
    setFormName('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Support comma-separated names for creating multiple items at once (only when not editing)
      const names = formName
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (!isEditing && names.length > 1) {
        const successes: string[] = [];
        const failures: string[] = [];
        const skippedDuplicates: string[] = [];

        const existing = new Set(items.map(i => i.name.trim().toLowerCase()));
        const seen = new Set<string>();
        const toCreate: string[] = [];

        for (const n of names) {
          const lower = n.toLowerCase();
          if (seen.has(lower)) {
            skippedDuplicates.push(n);
            continue;
          }
          seen.add(lower);
          if (existing.has(lower)) {
            skippedDuplicates.push(n);
            continue;
          }
          toCreate.push(n);
        }

        if (toCreate.length === 0) {
          setError('All provided names are duplicates of existing entries or repeated.');
        } else {
          const table = type === 'call_signs' ? '02_admin_register_fd5_vehicle_call_signs' : (type === 'vehicle_types' ? '02_admin_register_fd6_vehicle_types' : (type === 'vehicle_makes' ? '02_admin_register_fd7_vehicle_makes' : null));
          if (table) {
            for (const name of toCreate) {
              let created = false;
              let lastErr: any = null;
              const candidates = type === 'call_signs'
                ? ['name', 'vehicle_call_sign', 'vehicle_callsign', 'call_sign', 'call_sign_name', 'code']
                : (type === 'vehicle_types'
                  ? ['name', 'vehicle_type', 'vehicle_type_name', 'type_name']
                  : ['name', 'vehicle_make', 'vehicle_make_name', 'make_name', 'make', 'code']);
              for (const field of candidates) {
                try {
                  const { error } = await supabase
                    .from(table)
                    .insert([{ [field]: name }]);
                  if (error) throw new Error(error.message || 'Failed to create');
                  successes.push(name);
                  created = true;
                  break;
                } catch (err: any) {
                  lastErr = err;
                }
              }
              if (!created) {
                failures.push(`${name}: ${lastErr?.message || 'Failed to create'}`);
              }
            }
          } else {
            for (const name of toCreate) {
              try {
                const { error } = await supabase.functions.invoke('dropdown-options-crud', {
                  method: 'POST',
                  body: {
                    type,
                    data: { name }
                  }
                });
                if (error) throw new Error(error.message || 'Failed to create');
                successes.push(name);
              } catch (err: any) {
                failures.push(`${name}: ${err?.message || 'Failed to create'}`);
              }
            }
          }
        }

        await loadData();
        onOptionsUpdate();
        resetForm();

        if (successes.length) {
          setSuccess(`${successes.length} ${singularMap[type]}(s) created: ${successes.join(', ')}`);
        }
        const messages: string[] = [];
        if (failures.length) {
          messages.push(`Failed to create ${failures.length}: ${failures.join('; ')}`);
        }
        if (skippedDuplicates.length) {
          messages.push(`Skipped duplicate name(s): ${skippedDuplicates.join(', ')}`);
        }
        if (messages.length) setError(messages.join(' | '));
        setTimeout(() => setSuccess(''), 2500);
      } else {
        // Single create or edit existing item
        const trimmedName = formName.trim();
        const lower = trimmedName.toLowerCase();
        if (!isEditing) {
          // Prevent creating duplicate
          const exists = items.some(i => i.name.trim().toLowerCase() === lower);
          if (exists) {
            setError('Duplicate name already exists.');
            return;
          }
        } else if (isEditing && editingId != null) {
          // Prevent renaming to an existing name
          const conflict = items.some(i => i.id !== editingId && i.name.trim().toLowerCase() === lower);
          if (conflict) {
            setError('Another item with this name already exists.');
            return;
          }
        }

        const table = type === 'call_signs' ? '02_admin_register_fd5_vehicle_call_signs' : (type === 'vehicle_types' ? '02_admin_register_fd6_vehicle_types' : (type === 'vehicle_makes' ? '02_admin_register_fd7_vehicle_makes' : null));
        if (table) {
          if (isEditing && editingId != null) {
            let updated = false;
            let lastErr: any = null;
            const candidates = type === 'call_signs'
              ? ['name', 'vehicle_call_sign', 'vehicle_callsign', 'call_sign', 'call_sign_name', 'code']
              : (type === 'vehicle_types'
                ? ['name', 'vehicle_type', 'vehicle_type_name', 'type_name']
                : ['name', 'vehicle_make', 'vehicle_make_name', 'make_name', 'make', 'code']);
            for (const field of candidates) {
              try {
                const { error } = await supabase
                  .from(table)
                  .update({ [field]: trimmedName })
                  .eq('id', editingId);
                if (error) throw new Error(error.message || 'Failed to update');
                updated = true;
                break;
              } catch (err: any) {
                lastErr = err;
              }
            }
            if (!updated) {
              throw new Error(lastErr?.message || 'Failed to update');
            }
          } else {
            let created = false;
            let lastErr: any = null;
            const candidates = type === 'call_signs'
              ? ['name', 'vehicle_call_sign', 'vehicle_callsign', 'call_sign', 'call_sign_name', 'code']
              : (type === 'vehicle_types'
                ? ['name', 'vehicle_type', 'vehicle_type_name', 'type_name']
                : ['name', 'vehicle_make', 'vehicle_make_name', 'make_name', 'make', 'code']);
            for (const field of candidates) {
              try {
                const { error } = await supabase
                  .from(table)
                  .insert([{ [field]: trimmedName }]);
                if (error) throw new Error(error.message || 'Failed to create');
                created = true;
                break;
              } catch (err: any) {
                lastErr = err;
              }
            }
            if (!created) {
              throw new Error(lastErr?.message || 'Failed to create');
            }
          }
        } else {
          const payload: any = {
            type,
            data: {
              name: trimmedName
            },
            ...(isEditing && editingId && { id: editingId })
          };
          const { error } = await supabase.functions.invoke('dropdown-options-crud', {
            method: isEditing ? 'PUT' : 'POST',
            body: payload
          });
          if (error) {
            throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'create'} ${singularMap[type]}`);
          }
        }
        setSuccess(`${singularMap[type]} ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        await loadData();
        onOptionsUpdate();
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err: any) {
      console.error('Error saving option:', err);
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} ${singularMap[type]}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: OptionItem) => {
    setFormName(item.name);
    setIsEditing(true);
    setEditingId(item.id);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleToggleActive = async (id: number, currentActive: boolean, name: string) => {
    setError('');
    setSuccess('');
    try {
      const table = type === 'call_signs' ? '02_admin_register_fd5_vehicle_call_signs' : (type === 'vehicle_types' ? '02_admin_register_fd6_vehicle_types' : (type === 'vehicle_makes' ? '02_admin_register_fd7_vehicle_makes' : null));
      if (table) {
        let toggled = false;
        let lastErr: any = null;
        const candidates: Array<{ key: string; value: any }> = [
          { key: 'active', value: !currentActive },
          { key: 'is_active', value: !currentActive },
          { key: 'status', value: !currentActive ? 'active' : 'inactive' }
        ];
        for (const c of candidates) {
          try {
            const { error } = await supabase
              .from(table)
              .update({ [c.key]: c.value })
              .eq('id', id);
            if (error) throw new Error(error.message || 'Failed to toggle');
            toggled = true;
            break;
          } catch (err: any) {
            lastErr = err;
          }
        }
        if (!toggled) throw new Error(lastErr?.message || 'Failed to toggle');
      } else {
        const { error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'PUT',
          body: {
            type,
            id,
            data: { active: !currentActive }
          }
        });
        if (error) throw new Error(error.message || 'Failed to toggle');
      }
      setSuccess(`${singularMap[type]} "${name}" ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
      await loadData();
      onOptionsUpdate();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      console.error('Error toggling active:', err);
      setError(err.message || 'Failed to toggle active');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingIds(prev => new Set(prev).add(id));
    setError('');
    setSuccess('');
    try {
      const table = type === 'call_signs' ? '02_admin_register_fd5_vehicle_call_signs' : (type === 'vehicle_types' ? '02_admin_register_fd6_vehicle_types' : (type === 'vehicle_makes' ? '02_admin_register_fd7_vehicle_makes' : null));
      if (table) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete');
      } else {
        const { error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'DELETE',
          body: { type, id }
        });
        if (error) throw new Error(error.message || 'Failed to delete');
      }
      setSuccess(`${singularMap[type]} "${name}" deleted successfully!`);
      await loadData();
      onOptionsUpdate();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      console.error('Error deleting option:', err);
      setError(err.message || 'Failed to delete option');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected ${singularMap[type].toLowerCase()}(s)?`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const successes: string[] = [];
    const failures: string[] = [];
    for (const id of Array.from(selectedIds)) {
      const item = items.find(i => i.id === id);
      try {
        const table = type === 'call_signs' ? '02_admin_register_fd5_vehicle_call_signs' : (type === 'vehicle_types' ? '02_admin_register_fd6_vehicle_types' : (type === 'vehicle_makes' ? '02_admin_register_fd7_vehicle_makes' : null));
        if (table) {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
          if (error) throw new Error(error.message || 'Failed to delete');
        } else {
          const { error } = await supabase.functions.invoke('dropdown-options-crud', {
            method: 'DELETE',
            body: { type, id }
          });
          if (error) throw new Error(error.message || 'Failed to delete');
        }
        successes.push(item?.name || String(id));
      } catch (err: any) {
        failures.push(`${item?.name || id}: ${err?.message || 'Failed to delete'}`);
      }
    }
    try {
      await loadData();
      onOptionsUpdate();
      setSelectedIds(new Set());
      if (successes.length) {
        setSuccess(`${successes.length} ${singularMap[type]}(s) deleted: ${successes.join(', ')}`);
      }
      if (failures.length) {
        setError(`Failed to delete ${failures.length}: ${failures.join('; ')}`);
      }
      setTimeout(() => setSuccess(''), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} aria-hidden={!isOpen}>
      <ModalContent role="dialog" aria-modal="true" aria-labelledby="vehicle-options-title">
        <ModalHeader>
          <ModalTitle id="vehicle-options-title">{titleMap[type]}</ModalTitle>
          <CloseButton aria-label="Close" onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormSection>
          <SectionTitle>Add or Update {singularMap[type]}</SectionTitle>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="name">{singularMap[type]} Name *</Label>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                  Tip: Separate names with commas to add multiple at once. Duplicate names are prevented.
                </div>
                <Input
                  id="name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={`Enter ${singularMap[type].toLowerCase()} name(s)`}
                  disabled={loading}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update' : 'Add')}
                </SubmitButton>
                {isEditing && (
                  <CancelButton type="button" onClick={handleCancelEdit}>
                    Cancel
                  </CancelButton>
                )}
              </div>
            </FormRow>
          </form>
        </FormSection>

        {items.length > 0 ? (
          <>
            {isBulkEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div style={{ color: '#1177BB', fontWeight: 600 }}>
                  Selected: {selectedIds.size} / {items.length}
                </div>
                <DeleteButton onClick={handleBulkDelete} disabled={loading || selectedIds.size === 0}>
                  {loading ? 'Deleting...' : 'Delete Selected'}
                </DeleteButton>
              </div>
            )}
            <OptionsTable>
              <thead>
                <tr>
                  {isBulkEnabled && (
                    <th style={{ width: 42 }}>
                      <input
                        type="checkbox"
                        aria-label="Select all"
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
                {items.map(item => (
                  <tr key={item.id}>
                    {isBulkEnabled && (
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${item.name}`}
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          disabled={loading}
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
                      <small>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</small>
                    </td>
                    <td>
                      <EditButton onClick={() => handleEdit(item)} disabled={loading || isEditing}>Edit</EditButton>
                      {!isBulkEnabled && (
                        <DeleteButton onClick={() => handleDelete(item.id, item.name)} disabled={loading || deletingIds.has(item.id)}>
                          {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
                        </DeleteButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </OptionsTable>
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            {loading ? `Loading ${singularMap[type].toLowerCase()}s...` : `No ${singularMap[type].toLowerCase()}s found. Add one to get started.`}
          </p>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <CancelButton onClick={onClose}>Close</CancelButton>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VehicleOptionsModal;
