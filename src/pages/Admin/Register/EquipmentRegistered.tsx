import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { formatSupabaseError } from '../../../lib/utils';
import { usePageImage } from '../../../hooks/usePageImage';
import EquipmentOptionsModal from '../../../components/UI/EquipmentOptionsModal';
import { useEquipmentDropdowns, primeEquipmentDropdowns, resolveOptionLabel } from '../../../hooks/useDropdownCache';
import type { EquipmentType, ModelMake, Manufacturer, LocationDepartment } from '../../../hooks/useDropdownCache';
import Toast from '../../../components/UI/Toast';
import { useAdminCheck } from '../../../hooks/useAdminCheck';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
`;

// Section wrapper for header layout spacing
const Section = styled.section`
  margin-bottom: 2rem;
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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const EquipmentListSection = styled.div`
  margin-top: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const AdminPanel = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  border: 1px dashed #FF9900;
  border-radius: 8px;
  background-color: #fffdf5;
`;

const PanelTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #FF9900;
  font-weight: 700;
`;

const PanelActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const PanelButton = styled.button<{ $variant?: 'preview' | 'apply' }>`
  background-color: ${props => props.$variant === 'apply' ? '#d35400' : '#1177BB'};
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: ${props => props.$variant === 'apply' ? '#b84300' : '#0f5c99'}; }
  &:disabled { background-color: #cccccc; cursor: not-allowed; }
`;

// Header layout, matching Equipment Overview styling
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

const HeaderImage = styled.img`
  width: 171px;
  height: auto;
  max-width: 171px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 171px;
  height: 122px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FieldColumn = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: ${props => props.$hasError ? '#ffeaea' : 'white'};
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: ${props => props.$hasError ? '#ffeaea' : 'white'};
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const UpdateOptionsLink = styled.button`
  background: none;
  border: none;
  color: #1177BB;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
  padding: 0;
  
  &:hover {
    color: #0f5c99;
  }
`;

const SubmitButton = styled.button`
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
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background-color: #218838;
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
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #373;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #cfc;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background-color: #1177BB;
  color: white;
  padding: 8px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #0f5c99;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderCount = styled.span`
  font-weight: 600;
`;

const TableRow = styled.tr<{ $isEditing?: boolean }>`
  background-color: ${props => props.$isEditing ? '#fff3cd' : 'white'};
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background-color: ${props => props.$isEditing ? '#fff3cd' : '#f8f9fa'};
  }
`;

const TableCell = styled.td`
  padding: 6px;
  font-size: 14px;
  color: #333;
  vertical-align: middle;
`;

// Right-aligned cell specifically for action buttons
const ActionCell = styled(TableCell)`
  text-align: right;
`;

const ActionsContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'save' | 'cancel' }>`
  background-color: ${props => {
    if (props.$variant === 'delete') return 'transparent';
    switch (props.$variant) {
      case 'edit': return '#ffc107';
      case 'save': return '#28a745';
      case 'cancel': return '#6c757d';
      default: return '#1177BB';
    }
  }};
  color: ${props => (props.$variant === 'delete' ? '#dc3545' : 'white')};
  border: ${props => (props.$variant === 'delete' ? '1px solid #dc3545' : 'none')};
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  margin-right: 4px;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Pagination UI components
const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const PaginationButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.span`
  font-size: 12px;
  color: #333;
`;

// Delete confirmation modal styles
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContentBox = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 520px;
  max-width: calc(100vw - 40px);
  padding: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`;

const ModalBody = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #555;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalActionButton = styled.button<{ $variant?: 'cancel' | 'delete' }>`
  background-color: ${props => props.$variant === 'delete' ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  width: 92px;
  text-align: center;
  transition: opacity 0.3s ease;
  &:hover { opacity: 0.9; }
  &:disabled { background-color: #9aa0a6; cursor: not-allowed; }
`;

interface EquipmentFormData {
  equipment_name: string;
  equipment_type: string;
  model_make: string;
  serial_number: string;
  manufacturer: string;
  purchase_date: string;
  warranty_expiry_date: string;
  condition_status: string;
  location_department: string;
}

// Use shared resilient option interfaces from useDropdownCache

interface Equipment {
  id: string;
  equipment_name: string;
  equipment_type: string;
  model_make: string;
  serial_number: string;
  manufacturer: string;
  purchase_date: string;
  warranty_expiry_date: string;
  condition_status: string;
  location_department: string;
  equipment_type_name: string;
  model_make_name: string;
  manufacturer_name: string;
  location_department_name: string;
  created_at: string;
  updated_at: string;
}

const CONDITION_STATUS_OPTIONS = [
  'Trains on Unit',
  'Operational',
  'Non-Operational',
  'In Repair',
  'Disposed'
];

export const EquipmentRegistered: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-equipment', '/images/Equipment.png');
  const [formEnabled, setFormEnabled] = useState(false);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsModalType, setOptionsModalType] = useState<'equipment_types' | 'model_makes' | 'manufacturers' | 'location_departments'>('equipment_types');

  const [equipmentData, setEquipmentData] = useState<EquipmentFormData>({
    equipment_name: '',
    equipment_type: '',
    model_make: '',
    serial_number: '',
    manufacturer: '',
    purchase_date: '',
    warranty_expiry_date: '',
    condition_status: '',
    location_department: ''
  });

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [modelMakes, setModelMakes] = useState<ModelMake[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [locationDepartments, setLocationDepartments] = useState<LocationDepartment[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const [isEditing, setIsEditing] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const { dropdowns } = useEquipmentDropdowns();

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    primeEquipmentDropdowns().catch(() => {/* no-op */});
    loadEquipment();
  }, []);

  useEffect(() => {
    if (dropdowns) {
      setEquipmentTypes(dropdowns.equipment_types || []);
      setModelMakes(dropdowns.model_makes || []);
      setManufacturers(dropdowns.manufacturers || []);
      setLocationDepartments(dropdowns.location_departments || []);
    }
  }, [dropdowns]);

  // When dropdowns load/update, refresh display names in the list
  useEffect(() => {
    if (equipmentList.length === 0) return;
    setEquipmentList(prev => prev.map(eq => {
      const et = resolveOptionLabel(equipmentTypes, eq.equipment_type, eq.equipment_type);
      const mm = resolveOptionLabel(modelMakes, eq.model_make, eq.model_make);
      const mf = resolveOptionLabel(manufacturers, eq.manufacturer, eq.manufacturer);
      const ld = resolveOptionLabel(locationDepartments, eq.location_department, eq.location_department);
      return {
        ...eq,
        equipment_type_name: et.label || '',
        model_make_name: mm.label || '',
        manufacturer_name: mf.label || '',
        location_department_name: ld.label || ''
      };
    }));
  }, [equipmentTypes, modelMakes, manufacturers, locationDepartments]);

  // Derived pagination values
  const totalPages = Math.max(1, Math.ceil(equipmentList.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedEquipment = equipmentList.slice(startIndex, endIndex);

  // Clamp/reset current page when equipment list changes size
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [equipmentList.length, totalPages]);

  const loadDropdowns = async () => {
    setDropdownsLoading(true);
    setError('');
    try {
      const data = await primeEquipmentDropdowns();
      setEquipmentTypes(data.equipment_types || []);
      setModelMakes(data.model_makes || []);
      setManufacturers(data.manufacturers || []);
      setLocationDepartments(data.location_departments || []);
    } catch (error: any) {
      console.error('Error loading dropdowns (cache):', error);
      setError(error.message || 'Failed to load dropdown options');
    } finally {
      setDropdownsLoading(false);
    }
  };

  const loadEquipment = async () => {
    setEquipmentLoading(true);
    setError('');
    try {
      // Read directly from the new equipment_registry table
      const { data: rows, error } = await supabase
        .from('02_admin_register_fd80_equipment')
        .select('id, equipment_name, equipment_type, model_make, serial_number, manufacturer, purchase_date, warranty_expiry_date, condition_status, location_department, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const mapped = (rows || []).map((item: any) => {
        const et = resolveOptionLabel(equipmentTypes, item.equipment_type, item.equipment_type);
        const mm = resolveOptionLabel(modelMakes, item.model_make, item.model_make);
        const mf = resolveOptionLabel(manufacturers, item.manufacturer, item.manufacturer);
        const ld = resolveOptionLabel(locationDepartments, item.location_department, item.location_department);

        return {
          id: String(item.id),
          equipment_name: item.equipment_name || '',
          equipment_type: item.equipment_type || '',
          model_make: item.model_make || '',
          serial_number: item.serial_number || '',
          manufacturer: item.manufacturer || '',
          purchase_date: item.purchase_date || '',
          warranty_expiry_date: item.warranty_expiry_date || '',
          condition_status: item.condition_status || '',
          location_department: item.location_department || '',
          equipment_type_name: et.label || '',
          model_make_name: mm.label || '',
          manufacturer_name: mf.label || '',
          location_department_name: ld.label || '',
          created_at: item.created_at,
          updated_at: item.updated_at
        } as Equipment;
      });
      setEquipmentList(mapped);
    } catch (error: any) {
      console.error('Error loading equipment:', error);
      setError(error.message || 'Failed to load equipment');
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEquipmentData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    if (!equipmentData.equipment_name.trim()) {
      errors.equipment_name = 'Equipment Name is required';
    }
    if (equipmentData.purchase_date) {
      const date = new Date(equipmentData.purchase_date);
      if (isNaN(date.getTime())) {
        errors.purchase_date = 'Please enter a valid date';
      }
    }
    if (equipmentData.warranty_expiry_date) {
      const date = new Date(equipmentData.warranty_expiry_date);
      if (isNaN(date.getTime())) {
        errors.warranty_expiry_date = 'Please enter a valid date';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fix the validation errors above');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const submitData = {
        equipment_name: equipmentData.equipment_name.trim(),
        equipment_type: equipmentData.equipment_type.trim() || null,
        model_make: equipmentData.model_make.trim() || null,
        serial_number: equipmentData.serial_number.trim() || null,
        manufacturer: equipmentData.manufacturer.trim() || null,
        purchase_date: equipmentData.purchase_date || null,
        warranty_expiry_date: equipmentData.warranty_expiry_date || null,
        condition_status: equipmentData.condition_status.trim() || null,
        location_department: equipmentData.location_department.trim() || null
      };

      if (isEditing && editingEquipmentId) {
        const { error } = await supabase
          .from('02_admin_register_fd80_equipment')
          .update(submitData)
          .eq('id', editingEquipmentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('02_admin_register_fd80_equipment')
          .insert([submitData]);
        if (error) throw error;
      }

      setSuccess(isEditing ? 'Equipment updated successfully!' : 'Equipment registered successfully!');
      resetForm();
      await loadEquipment();
    } catch (error: any) {
      console.error('Error submitting equipment:', error);
      setError(formatSupabaseError(error, 'Failed to save equipment'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (equipment: Equipment) => {
    // Persist selected equipment and navigate to the edit form page
    try {
      sessionStorage.setItem('editing_equipment', JSON.stringify(equipment));
    } catch {}
    navigate('/admin/register/equipment/process');
  };

  // Perform deletion
  const performDelete = async (equipmentId: string, equipmentName: string) => {
    setError('');
    setSuccess('');
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('02_admin_register_fd80_equipment')
        .delete()
        .eq('id', equipmentId);
      if (error) throw error;
      setSuccess('Equipment deleted successfully!');
      await loadEquipment();
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      setError(formatSupabaseError(error, 'Failed to delete equipment'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (equipment: Equipment) => {
    setDeleteTarget({ id: equipment.id, name: equipment.equipment_name });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await performDelete(deleteTarget.id, deleteTarget.name);
    closeDeleteModal();
  };

  const handleRefresh = async () => {
    await Promise.all([loadDropdowns(), loadEquipment()]);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingEquipmentId(null);
    setEquipmentData({
      equipment_name: '',
      equipment_type: '',
      model_make: '',
      serial_number: '',
      manufacturer: '',
      purchase_date: '',
      warranty_expiry_date: '',
      condition_status: '',
      location_department: ''
    });
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  const handleManageDropdowns = (tab: 'equipment_types' | 'model_makes' | 'manufacturers' | 'location_departments') => {
    setOptionsModalType(tab);
    setOptionsModalOpen(true);
  };

  // Pager actions
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  // Admin-only backfill handlers
  const { isAdmin, isSystemAdmin, loading: adminLoading } = useAdminCheck();
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillError, setBackfillError] = useState('');
  const [backfillResult, setBackfillResult] = useState<any | null>(null);

  const invokeBackfill = async (dryRun: boolean) => {
    setBackfillError('');
    setBackfillLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('equipment-registry-backfill', {
        body: { dry_run: dryRun }
      });
      if (error) throw error;
      setBackfillResult(data);
      if (!dryRun) {
        setSuccess('Backfill applied successfully!');
        await loadEquipment();
      }
    } catch (e: any) {
      console.error('Backfill error:', e);
      setBackfillError(e.message || 'Backfill failed');
    } finally {
      setBackfillLoading(false);
    }
  };

  const handleBackfillDryRun = () => invokeBackfill(true);
  const handleBackfillApply = async () => {
    if (!window.confirm('Apply ID backfill to equipment_registry?')) return;
    await invokeBackfill(false);
  };

  return (
    <>
    <MainContent aria-label="Main content">
      {/* Header Section with image (same as Equipment Overview) */}
      <Section aria-labelledby="equipment-registered-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="equipment-registered-title">Registered Equipment Lists</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Registered Fire Equipment list provides a consolidated catalog of all equipment currently in service at KFIA-ARFF. It offers a quick reference for asset details, locations and condition status, helping crews verify operational readiness. The list supports maintenance planning by exposing purchase and warranty dates, serial and model information.
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
                  alt="Equipment Registration" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/RegisterYourService.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {success && <SuccessMessage aria-live="polite">✅ {success}</SuccessMessage>}

      {/* Registration moved to Equipment Registration System page */}

      {/* Equipment List Section */}
      <EquipmentListSection>
        {(isAdmin || isSystemAdmin) && !adminLoading && (
          <AdminPanel>
            <PanelTitle>Backfill IDs for equipment_registry</PanelTitle>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
              Preview and apply mapping of names to IDs. Run a dry run first.
            </p>
            <PanelActions>
              <PanelButton $variant="preview" onClick={handleBackfillDryRun} disabled={backfillLoading}>
                Dry Run
              </PanelButton>
              <PanelButton $variant="apply" onClick={handleBackfillApply} disabled={backfillLoading}>
                Apply
              </PanelButton>
              <RefreshButton onClick={handleRefresh} disabled={equipmentLoading || dropdownsLoading}>
                Refresh Lists
              </RefreshButton>
            </PanelActions>
            {backfillError && <ErrorMessage>⚠️ {backfillError}</ErrorMessage>}
            {backfillResult && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  Processed: {backfillResult?.processed_rows ?? '-'} | Changed: {backfillResult?.changed_rows ?? '-'} | Mode: {backfillResult?.dry_run ? 'Dry Run' : 'Applied'}
                </div>
                {Array.isArray(backfillResult?.sample_changes) && backfillResult.sample_changes.length > 0 && (
                  <Table style={{ marginTop: '10px' }}>
                    <thead>
                      <tr>
                        <TableHeader>Row ID</TableHeader>
                        <TableHeader>Planned Changes</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {backfillResult.sample_changes.map((ch: any, idx: number) => (
                        <TableRow key={`${String(ch.id)}-${idx}`}>
                          <TableCell>{String(ch.id)}</TableCell>
                          <TableCell><code>{JSON.stringify(ch.changes)}</code></TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}
          </AdminPanel>
        )}
        {equipmentLoading ? (
          <div>Loading equipment...</div>
        ) : equipmentList.length === 0 ? (
          <div>No equipment registered yet.</div>
        ) : (
          <>
          <Table>
            <thead>
              <tr>
                <TableHeader>Equipment</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Model/Make</TableHeader>
                <TableHeader>Serial #</TableHeader>
                <TableHeader>Manufacturer</TableHeader>
                <TableHeader>Purchase Date</TableHeader>
                <TableHeader>Warranty Expiry</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Location</TableHeader>
                <TableHeader>
                  <HeaderContent>
                    <span>Actions</span>
                    <HeaderCount>{String(equipmentList.length).padStart(5, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</HeaderCount>
                  </HeaderContent>
                </TableHeader>
              </tr>
            </thead>
            <tbody>
              {displayedEquipment.map((eq) => (
                <TableRow key={eq.id} $isEditing={isEditing && editingEquipmentId === eq.id}>
                  <TableCell>{eq.equipment_name}</TableCell>
                  <TableCell>{eq.equipment_type_name || '-'}</TableCell>
                  <TableCell>{eq.model_make_name || '-'}</TableCell>
                  <TableCell>{eq.serial_number || '-'}</TableCell>
                  <TableCell>{eq.manufacturer_name || '-'}</TableCell>
                  <TableCell>{eq.purchase_date || '-'}</TableCell>
                  <TableCell>{eq.warranty_expiry_date || '-'}</TableCell>
                  <TableCell>{eq.condition_status || '-'}</TableCell>
                  <TableCell>{eq.location_department_name || '-'}</TableCell>
                  <ActionCell>
                    <ActionsContainer>
                      <ActionButton $variant="edit" onClick={() => handleEdit(eq)}>Edit</ActionButton>
                      <ActionButton $variant="delete" onClick={() => openDeleteModal(eq)}>Delete</ActionButton>
                    </ActionsContainer>
                  </ActionCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          <PaginationContainer>
            <PaginationButton onClick={goToPrevPage} disabled={currentPage <= 1}>Previous</PaginationButton>
            <PaginationInfo>Page {currentPage} of {totalPages}</PaginationInfo>
            <PaginationButton onClick={goToNextPage} disabled={currentPage >= totalPages}>Next</PaginationButton>
          </PaginationContainer>
          {deleteModalOpen && (
            <ModalBackdrop onClick={closeDeleteModal}>
              <ModalContentBox onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Delete Equipment</ModalTitle>
                <ModalBody>
                  Are you sure you want to delete equipment: <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                </ModalBody>
                <ModalActions>
                  <ModalActionButton $variant="cancel" onClick={closeDeleteModal} disabled={deleteLoading}>Cancel</ModalActionButton>
                  <ModalActionButton $variant="delete" onClick={confirmDelete} disabled={deleteLoading}>Delete</ModalActionButton>
                </ModalActions>
              </ModalContentBox>
            </ModalBackdrop>
          )}
          </>
        )}
      </EquipmentListSection>
    </MainContent>
    {/* Removed bottom-left success toast banner per request */}
    </>
  );
};

export default EquipmentRegistered;