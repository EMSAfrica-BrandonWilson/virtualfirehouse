import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

interface RankItem {
  id: string;
  name: string;
  code?: string;
  level?: number;
  is_active?: boolean;
  created_at?: string;
}

type DropdownType = 'positions' | 'ranks' | 'emergency_contact_relationships' | 'employment_status' | 'operational_shifts';

interface StaffOptionsModalProps {
  isOpen: boolean;
  type: DropdownType;
  onClose: () => void;
  onOptionsUpdate?: () => void;
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
  padding: 24px;
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
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1177BB;
  font-size: 1.6rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
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

const SectionTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
`;

const PrimaryButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0f5c99;
  }
`;

const SecondaryButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
`;

const StatusBadge = styled.span<{ $active?: boolean }>`
  background-color: ${props => props.$active ? '#28a745' : '#dc3545'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #363;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cfc;
  margin-bottom: 12px;
  font-size: 14px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: end;
`;

const FormColumn = styled.div<{ $flex?: string }>`
  flex: ${props => props.$flex || '1'};
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
`;

const TextInput = styled.input<{ $hasError?: boolean }>`
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

const OptionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  th { background-color: #1177BB; color: white; font-weight: 600; }
  tr:hover { background-color: #f5f5f5; }
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
  &:hover { background-color: #e0a800; }
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
  &:hover { background-color: #c82333; }
  &:disabled { background-color: #cccccc; cursor: not-allowed; }
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
  &:hover { background-color: ${props => props.$active ? '#218838' : '#c82333'}; }
  &:disabled { background-color: #cccccc; cursor: not-allowed; }
`;

interface Position { id: number; name: string; description: string; active: boolean; }
interface Rank { id: string; name: string; code: string; level: number; description: string; is_active: boolean; }
interface EmergencyContactRelationship { id: number; name: string; active: boolean; }
interface EmploymentStatus { id: number; name: string; description: string; active: boolean; }
interface OperationalShift { id: number; shift_name: string; description?: string; start_time?: string; end_time?: string; shift_start_date?: string; shift_duration?: number; color?: string; active: boolean; }

type Item = Position | Rank | EmergencyContactRelationship | EmploymentStatus | OperationalShift;

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

export const StaffOptionsModal: React.FC<StaffOptionsModalProps> = ({ isOpen, type, onClose, onOptionsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<FormData>({ name: '', description: '', code: '', level: 0, start_time: '', end_time: '', shift_start_date: '', shift_duration: 8, color: '#1177BB' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, type]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', { method: 'GET' });
      if (type === 'ranks') {
        const ranksFromEdge = (!error && data) ? ((data?.data?.ranks || []) as Rank[]) : [];
        if (ranksFromEdge && ranksFromEdge.length > 0) {
          const sortedRanks = [...ranksFromEdge].sort((a: any, b: any) => {
            const la = typeof a.level === 'number' ? a.level : 0;
            const lb = typeof b.level === 'number' ? b.level : 0;
            return la - lb;
          });
          setItems(sortedRanks as Item[]);
        } else {
          const { data: ranks, error: ranksErr } = await supabase
            .from('02_admin_staff_9_ranks')
            .select('id, name, code, level, description, is_active')
            .order('level', { ascending: true });
          if (ranksErr) throw new Error(ranksErr.message || 'Failed to load ranks');
          setItems(((ranks || []) as any) as Item[]);
        }
      } else if (type === 'operational_shifts') {
        const { data: shifts, error: shiftsErr } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('*')
          .order('shift_name', { ascending: true });
          
        if (shiftsErr) throw new Error(shiftsErr.message || 'Failed to load operational shifts');
        
        setItems(((shifts || []) as any).map((s: any) => ({
          ...s,
          name: s.shift_name // Map shift_name to name for display consistency if needed, though getItemName handles it
        })) as Item[]);
      } else {
        if (!error && data) {
          const map: Record<DropdownType, Item[]> = {
            positions: (data?.data?.positions || []) as Position[],
            ranks: (data?.data?.ranks || []) as Rank[],
            emergency_contact_relationships: (data?.data?.emergencyContactRelationships || []) as EmergencyContactRelationship[],
            employment_status: (data?.data?.employmentStatus || []) as EmploymentStatus[],
            operational_shifts: (data?.data?.operationalShifts || []) as OperationalShift[],
          };
          setItems(map[type] || []);
        } else {
          throw new Error(error?.message || 'Failed to load dropdown options');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load dropdown options');
    } finally {
      setLoading(false);
    }
  };

  const getSingularName = () => {
    switch (type) {
      case 'positions': return 'Position';
      case 'ranks': return 'Rank';
      case 'emergency_contact_relationships': return 'Relationship';
      case 'employment_status': return 'Employment Status';
      case 'operational_shifts': return 'Operational Shift';
    }
  };

  const getPluralName = () => {
    switch (type) {
      case 'positions': return 'Positions';
      case 'ranks': return 'Ranks';
      case 'emergency_contact_relationships': return 'Emergency Contact Relationships';
      case 'employment_status': return 'Employment Status Options';
      case 'operational_shifts': return 'Operational Shifts';
    }
  };

  const getItemName = (item: Item): string => {
    if ('shift_name' in item) return item.shift_name || '';
    return (item as any).name || '';
  };

  const getActiveStatus = (item: Item): boolean => {
    if (type === 'ranks') return (item as Rank).is_active;
    if ('active' in item) return (item as any).active;
    return false;
  };

  // Prevent Enter key from submitting the outer form when modal is open
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag !== 'textarea') {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Name is required'); return; }
    if (type === 'ranks') {
      if (!formData.code?.trim()) { setError('Code is required for ranks'); return; }
      if (formData.level === undefined || formData.level < 0) { setError('Level must be a non-negative number'); return; }
    }
    if (type === 'operational_shifts') {
      if (formData.shift_duration !== undefined && (formData.shift_duration < 0 || formData.shift_duration > 24)) {
        setError('Shift duration must be between 0 and 24 hours');
        return;
      }
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (type === 'ranks') {
        if (isEditing && editingId) {
          const { error: upErr } = await supabase
            .from('02_admin_staff_9_ranks')
            .update({
              name: formData.name.trim(),
              description: formData.description.trim(),
              code: formData.code?.trim(),
              level: formData.level
            })
            .eq('id', editingId);
          if (upErr) throw new Error(upErr.message || 'Failed to update Rank');
        } else {
          const { error: insErr } = await supabase
            .from('02_admin_staff_9_ranks')
            .insert([{
              name: formData.name.trim(),
              description: formData.description.trim(),
              code: formData.code?.trim(),
              level: formData.level,
              is_active: true
            }]);
          if (insErr) throw new Error(insErr.message || 'Failed to create Rank');
        }
      } else if (type === 'operational_shifts') {
        const shiftData = {
          shift_name: formData.name.trim(),
          description: formData.description.trim(),
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          shift_start_date: formData.shift_start_date || null,
          shift_duration: formData.shift_duration || null,
          color: formData.color || '#1177BB'
        };

        if (isEditing && editingId) {
          const { error: upErr } = await supabase
            .from('02_admin_register_fd2_operational_shifts')
            .update(shiftData)
            .eq('id', editingId);
          if (upErr) throw new Error(upErr.message || 'Failed to update Operational Shift');
        } else {
          const { error: insErr } = await supabase
            .from('02_admin_register_fd2_operational_shifts')
            .insert([{
              ...shiftData,
              active: true
            }]);
          if (insErr) throw new Error(insErr.message || 'Failed to create Operational Shift');
        }
      } else {
        const payload = {
          type,
          data: {
            name: formData.name.trim(),
            description: formData.description.trim(),
          },
          ...(isEditing && editingId && { id: editingId })
        };
        const { error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: isEditing ? 'PUT' : 'POST',
          body: payload
        });
        if (error) throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'create'} ${getSingularName()}`);
      }
      setSuccess(`${getSingularName()} ${isEditing ? 'updated' : 'created'} successfully!`);
      if (!isEditing) {
        setFormData({ name: '', description: '', code: '', level: 0, start_time: '', end_time: '', shift_start_date: '', shift_duration: 8, color: '#1177BB' });
      }
      await loadData();
      onOptionsUpdate?.();
    } catch (err: any) {
      setError(err?.message || `Failed to ${isEditing ? 'update' : 'create'} ${getSingularName()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setFormData({
      name: getItemName(item),
      description: 'description' in item ? (item as any).description || '' : '',
      code: 'code' in item ? (item as any).code || '' : '',
      level: 'level' in item ? (item as any).level || 0 : 0,
      start_time: 'start_time' in item ? (item as any).start_time || '' : '',
      end_time: 'end_time' in item ? (item as any).end_time || '' : '',
      shift_start_date: 'shift_start_date' in item ? (item as any).shift_start_date || '' : '',
      shift_duration: 'shift_duration' in item ? (item as any).shift_duration || 8 : 8,
      color: 'color' in item ? (item as any).color || '#1177BB' : '#1177BB'
    });
    setIsEditing(true);
    setEditingId((item as any).id);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '', code: '', level: 0, start_time: '', end_time: '', shift_start_date: '', shift_duration: 8, color: '#1177BB' });
    setIsEditing(false);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingIds(prev => new Set(prev).add(id));
    setError('');
    setSuccess('');
    try {
      if (type === 'ranks') {
        const { error: delErr } = await supabase
          .from('02_admin_staff_9_ranks')
          .delete()
          .eq('id', id);
        if (delErr) throw new Error(delErr.message || `Failed to delete ${getSingularName()}`);
      } else if (type === 'operational_shifts') {
        const { error: delErr } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .delete()
          .eq('id', id);
        if (delErr) throw new Error(delErr.message || `Failed to delete ${getSingularName()}`);
      } else {
        const { error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'DELETE',
          body: { type, id }
        });
        if (error) throw new Error(error.message || `Failed to delete ${getSingularName()}`);
      }
      setSuccess(`${getSingularName()} "${name}" deleted successfully!`);
      await loadData();
      onOptionsUpdate?.();
    } catch (err: any) {
      setError(err?.message || `Failed to delete ${getSingularName()}`);
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleToggleActive = async (id: string | number, currentActive: boolean, name: string) => {
    setError('');
    setSuccess('');
    try {
      if (type === 'ranks') {
        const { error: upErr } = await supabase
          .from('02_admin_staff_9_ranks')
          .update({ is_active: !currentActive })
          .eq('id', id);
        if (upErr) throw new Error(upErr.message || `Failed to ${!currentActive ? 'activate' : 'deactivate'} ${getSingularName()}`);
      } else if (type === 'operational_shifts') {
        const { error: upErr } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .update({ active: !currentActive })
          .eq('id', id);
        if (upErr) throw new Error(upErr.message || `Failed to ${!currentActive ? 'activate' : 'deactivate'} ${getSingularName()}`);
      } else {
        const { error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'PUT',
          body: {
            type,
            id,
            data: {
              active: !currentActive
            }
          }
        });
        if (error) throw new Error(error.message || `Failed to ${!currentActive ? 'activate' : 'deactivate'} ${getSingularName()}`);
      }
      setSuccess(`${getSingularName()} "${name}" ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
      await loadData();
      onOptionsUpdate?.();
    } catch (err: any) {
      setError(err?.message || `Failed to ${!currentActive ? 'activate' : 'deactivate'} ${getSingularName()}`);
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} aria-hidden={!isOpen}>
      <ModalContent role="dialog" aria-modal="true" aria-labelledby="staff-options-title">
        <ModalHeader>
          <ModalTitle id="staff-options-title">Manage {getPluralName()}</ModalTitle>
          <CloseButton type="button" aria-label="Close" onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <div onKeyDown={handleKeyDown}>
          <FormRow>
            <FormColumn $flex="2">
              <Label htmlFor="name">{getSingularName()} Name *</Label>
              <TextInput id="name" type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={loading} />
            </FormColumn>
            {type === 'ranks' && (
              <>
                <FormColumn $flex="1">
                  <Label htmlFor="code">Code *</Label>
                  <TextInput id="code" type="text" value={formData.code || ''} onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))} disabled={loading} />
                </FormColumn>
                <FormColumn $flex="1">
                  <Label htmlFor="level">Level *</Label>
                  <TextInput id="level" type="number" value={formData.level ?? 0} onChange={e => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))} disabled={loading} />
                </FormColumn>
              </>
            )}
          </FormRow>

          <FormRow>
            <FormColumn $flex="1">
              <Label htmlFor="description">Description</Label>
              <TextArea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} disabled={loading} />
            </FormColumn>
          </FormRow>

          {type === 'operational_shifts' && (
            <>
              <FormRow>
                <FormColumn>
                  <Label htmlFor="start_time">Start Time</Label>
                  <TextInput id="start_time" type="time" value={formData.start_time || ''} onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))} disabled={loading} />
                </FormColumn>
                <FormColumn>
                  <Label htmlFor="end_time">End Time</Label>
                  <TextInput id="end_time" type="time" value={formData.end_time || ''} onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))} disabled={loading} />
                </FormColumn>
              </FormRow>
              <FormRow>
                <FormColumn>
                  <Label htmlFor="shift_start_date">Shift Start Date</Label>
                  <TextInput id="shift_start_date" type="date" value={formData.shift_start_date || ''} onChange={e => setFormData(prev => ({ ...prev, shift_start_date: e.target.value }))} disabled={loading} />
                </FormColumn>
                <FormColumn>
                  <Label htmlFor="shift_duration">Shift Duration (hours)</Label>
                  <TextInput id="shift_duration" type="number" value={formData.shift_duration ?? 8} onChange={e => setFormData(prev => ({ ...prev, shift_duration: Number(e.target.value) }))} disabled={loading} />
                </FormColumn>
                <FormColumn>
                  <Label htmlFor="color">Color</Label>
                  <TextInput id="color" type="color" value={formData.color || '#1177BB'} onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))} disabled={loading} />
                </FormColumn>
              </FormRow>
            </>
          )}

          <ButtonRow>
            {isEditing && (
              <SecondaryButton type="button" onClick={handleCancelEdit} disabled={loading}>Cancel</SecondaryButton>
            )}
            <PrimaryButton type="button" onClick={handleSubmit} disabled={loading}>{isEditing ? 'Update' : 'Add'} {getSingularName()}</PrimaryButton>
          </ButtonRow>
        </div>

        <SectionTitle style={{ marginTop: 14 }}>Current {getPluralName()}</SectionTitle>
        {loading ? (
          <p style={{ color: '#666' }}>Loading…</p>
        ) : items.length ? (
          <OptionsTable>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>{getSingularName()} Name</th>
                {type === 'ranks' && <th>Code</th>}
                {type === 'ranks' && <th>Level</th>}
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={(item as any).id}>
                  <td>{getItemName(item)}</td>
                  {type === 'ranks' && <td>{(item as any).code || ''}</td>}
                  {type === 'ranks' && <td>{(item as any).level ?? ''}</td>}
                  <td>{(item as any).description || ''}</td>
                  <td>
                    <ToggleButton
                      type="button"
                      $active={getActiveStatus(item)}
                      onClick={() => handleToggleActive((item as any).id, getActiveStatus(item), getItemName(item))}
                      disabled={loading}
                    >
                      {getActiveStatus(item) ? 'Active' : 'Inactive'}
                    </ToggleButton>
                  </td>
                  <td>
                    <EditButton type="button" onClick={() => handleEdit(item)} disabled={loading}>Edit</EditButton>
                    <DeleteButton
                      type="button"
                      onClick={() => handleDelete((item as any).id, getItemName(item))}
                      disabled={loading || deletingIds.has((item as any).id)}
                    >
                      {deletingIds.has((item as any).id) ? 'Deleting…' : 'Delete'}
                    </DeleteButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </OptionsTable>
        ) : (
          <p style={{ color: '#666' }}>No items found.</p>
        )}

        <ButtonRow>
          <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default StaffOptionsModal;