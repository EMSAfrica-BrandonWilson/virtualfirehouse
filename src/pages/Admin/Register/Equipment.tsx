import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Toast from '../../../components/UI/Toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { formatSupabaseError } from '../../../lib/utils';
import { usePageImage } from '../../../hooks/usePageImage';
import EquipmentOptionsModal from '../../../components/UI/EquipmentOptionsModal';
import { useEquipmentDropdowns, resolveOptionLabel, primeEquipmentDropdowns } from '../../../hooks/useDropdownCache';
import type { EquipmentType, ModelMake, Manufacturer, LocationDepartment } from '../../../hooks/useDropdownCache';

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
const InlineFieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UpdateOptionsLink = styled.button`
  background: none;
  border: none;
  color: #1177BB;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
  padding: 0;
  
  &:hover {
    color: #0f5c99;
    text-decoration: none;
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
  margin-top: 0;
  
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

const AddButton = styled.button`
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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #0f5c99;
`;

const TableRow = styled.tr<{ $isEditing?: boolean }>`
  background-color: ${props => props.$isEditing ? '#fff3cd' : 'white'};
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background-color: ${props => props.$isEditing ? '#fff3cd' : '#f8f9fa'};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #333;
  vertical-align: middle;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'save' | 'cancel' }>`
  background-color: ${
    props => {
      switch (props.$variant) {
        case 'edit': return '#ffc107';
        case 'delete': return '#dc3545';
        case 'save': return '#28a745';
        case 'cancel': return '#6c757d';
        default: return '#1177BB';
      }
    }
  };
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 5px;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
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
  category: string;
  photo_url?: string;
}

// Use shared dropdown interfaces from useDropdownCache for consistent optionality

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
  category?: string;
  photo_url?: string;
}

const CONDITION_STATUS_OPTIONS = [
  'Trains on Unit',
  'Operational',
  'Non-Operational',
  'In Repair',
  'Disposed'
];

export const Equipment: React.FC = () => {
  const [formEnabled, setFormEnabled] = useState(false);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsModalType, setOptionsModalType] = useState<'equipment_types' | 'model_makes' | 'manufacturers' | 'location_departments' | 'equipment_categories'>('equipment_types');
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-equipment', '/images/Equipment.png');
  const { dropdowns, loading: dropdownsHookLoading } = useEquipmentDropdowns();

  const [equipmentData, setEquipmentData] = useState<EquipmentFormData>({
    equipment_name: '',
    equipment_type: '',
    model_make: '',
    serial_number: '',
    manufacturer: '',
    purchase_date: '',
    warranty_expiry_date: '',
    condition_status: '',
    location_department: '',
    category: '',
    photo_url: ''
  });

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [modelMakes, setModelMakes] = useState<ModelMake[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [locationDepartments, setLocationDepartments] = useState<LocationDepartment[]>([]);
  const [equipmentCategories, setEquipmentCategories] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [equipmentPicture, setEquipmentPicture] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  useEffect(() => {
    // Prime cache and load equipment list
    primeEquipmentDropdowns().catch(() => {/* no-op */});
    loadEquipment();
    loadCategories();
  }, []);

  useEffect(() => {
    if (dropdowns) {
      setEquipmentTypes(dropdowns.equipment_types || []);
      setModelMakes(dropdowns.model_makes || []);
      setManufacturers(dropdowns.manufacturers || []);
      setLocationDepartments(dropdowns.location_departments || []);
    }
  }, [dropdowns]);

  // Hydrate edit mode when coming from Registered list page
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('editing_equipment');
      if (raw) {
        const equipment = JSON.parse(raw);
        setEquipmentData({
          equipment_name: equipment.equipment_name || '',
          equipment_type: equipment.equipment_type || '',
          model_make: equipment.model_make || '',
          serial_number: equipment.serial_number || '',
          manufacturer: equipment.manufacturer || '',
          purchase_date: equipment.purchase_date || '',
          warranty_expiry_date: equipment.warranty_expiry_date || '',
          condition_status: equipment.condition_status || '',
          location_department: equipment.location_department || '',
          category: equipment.category || '',
          photo_url: equipment.photo_url || ''
        });
        setIsEditing(true);
        setEditingEquipmentId(equipment.id);
        setError('');
        setSuccess('');
        setFormEnabled(true);
        sessionStorage.removeItem('editing_equipment');
      }
    } catch {}
  }, []);

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

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd81_equipment_categories')
        .select('*');
      if (error) throw error;
      const names = (data || [])
        .filter((r: any) => (r.active ?? r.is_active ?? true))
        .map((r: any) => String(r?.name ?? r?.category ?? '').trim())
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b));
      setEquipmentCategories(names);
    } catch (err) {
      // silent
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
        const typeLabel = resolveOptionLabel(equipmentTypes as any[], item.equipment_type, item.equipment_type).label;
        const modelLabel = resolveOptionLabel(modelMakes as any[], item.model_make, item.model_make).label;
        const manufacturerLabel = resolveOptionLabel(manufacturers as any[], item.manufacturer, item.manufacturer).label;
        const locationLabel = resolveOptionLabel(locationDepartments as any[], item.location_department, item.location_department).label;

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
          equipment_type_name: typeLabel || '',
          model_make_name: modelLabel || '',
          manufacturer_name: manufacturerLabel || '',
          location_department_name: locationLabel || '',
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
    
    // Clear validation error when user starts typing
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
    
    // Equipment Name is required
    if (!equipmentData.equipment_name.trim()) {
      errors.equipment_name = 'Equipment Name is required';
    }
    
    // Validate dates if provided
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

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setEquipmentPicture(null);
      setImagePreview('');
      return;
    }
    setEquipmentPicture(file);
    try {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } catch {
      setImagePreview('');
    }
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
      const submitData: any = {
        equipment_name: equipmentData.equipment_name.trim(),
        equipment_type: equipmentData.equipment_type.trim() || null,
        model_make: equipmentData.model_make.trim() || null,
        serial_number: equipmentData.serial_number.trim() || null,
        manufacturer: equipmentData.manufacturer.trim() || null,
        purchase_date: equipmentData.purchase_date || null,
        warranty_expiry_date: equipmentData.warranty_expiry_date || null,
        condition_status: equipmentData.condition_status.trim() || null,
        location_department: equipmentData.location_department.trim() || null,
        category: equipmentData.category.trim() || null,
        photo_url: equipmentData.photo_url || null
      };
      if (equipmentPicture) {
        const ext = (equipmentPicture.name.split('.').pop() || 'jpg').toLowerCase();
        const base = equipmentData.equipment_name.trim() || 'equipment';
        const safe = base.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40);
        const filePath = `${Date.now()}_${safe}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('equipment-pictures')
          .upload(filePath, equipmentPicture, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: pub } = await supabase.storage.from('equipment-pictures').getPublicUrl(filePath);
        submitData.photo_url = pub?.publicUrl || filePath;
      }

      // Prevent duplicate equipment_name entries (case-insensitive, exact match)
      const nameToCheck = submitData.equipment_name;
      if (nameToCheck) {
        const dupQuery = supabase
          .from('02_admin_register_fd80_equipment')
          .select('id')
          .ilike('equipment_name', nameToCheck);
        const { data: dupRows, error: dupError } = isEditing && editingEquipmentId
          ? await dupQuery.neq('id', editingEquipmentId)
          : await dupQuery;
        if (dupError) throw dupError;
        if (dupRows && dupRows.length > 0) {
          setValidationErrors(prev => ({ ...prev, equipment_name: 'Equipment Name already exists' }));
          setError('Duplicate found: Equipment Name must be unique');
          setLoading(false);
          return;
        }
      }

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

      // Reset form
      handleRefreshForm();

      // Reload equipment list
      await loadEquipment();
      // After a successful submission, disable the form for new entries
      if (!isEditing) {
        setFormEnabled(false);
      }

    } catch (error: any) {
      console.error('Error submitting equipment:', error);
      setError(formatSupabaseError(error, 'Failed to save equipment'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEquipmentData({
      equipment_name: equipment.equipment_name || '',
      equipment_type: equipment.equipment_type || '',
      model_make: equipment.model_make || '',
      serial_number: equipment.serial_number || '',
      manufacturer: equipment.manufacturer || '',
      purchase_date: equipment.purchase_date || '',
      warranty_expiry_date: equipment.warranty_expiry_date || '',
      condition_status: equipment.condition_status || '',
      location_department: equipment.location_department || '',
      category: (equipment as any).category || '',
      photo_url: equipment.photo_url || ''
    });
    setImagePreview(equipment.photo_url || '');
    setIsEditing(true);
    setEditingEquipmentId(equipment.id);
    setError('');
    setSuccess('');
    // Enable the form when editing an existing equipment
    setFormEnabled(true);
  };

  const handleDelete = async (equipmentId: string, equipmentName: string) => {
    if (!window.confirm(`Are you sure you want to delete equipment: ${equipmentName}?`)) {
      return;
    }
    
    setError('');
    setSuccess('');
    
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
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadDropdowns(), loadEquipment()]);
  };

  const handleRefreshForm = () => {
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
      location_department: '',
      category: '',
      photo_url: ''
    });
    setError('');
    setValidationErrors({});
    setEquipmentPicture(null);
    setImagePreview('');
  };

  const cancelEdit = () => {
    handleRefreshForm();
    // Return the form to inactive state when canceling edit
    setFormEnabled(false);
  };

  const handleManageDropdowns = (tab: 'equipment_types' | 'model_makes' | 'manufacturers' | 'location_departments' | 'equipment_categories') => {
    setOptionsModalType(tab);
    setOptionsModalOpen(true);
  };

  return (
    <>
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="equipment-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="equipment-title">
                Equipment Registration System
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Equipment Registration system provides comprehensive management of all firefighting and emergency response equipment operated by the KFIA-ARFF. This system enables tracking of equipment status, maintenance schedules, and operational readiness to ensure all equipment is properly maintained and available for emergency response operations.
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
                  alt="Register Equipment" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/FireEngine.png';
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
      {/* Equipment Registration Form */}
      <FormSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SubTitle>{isEditing ? 'Update Equipment Information' : 'Equipment Registration Form'}</SubTitle>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AddButton type="button" onClick={() => { handleRefreshForm(); setFormEnabled(true); }} disabled={formEnabled}>
              Add New Equipment
            </AddButton>
            <RefreshButton
              type="button"
              aria-label="Refresh form"
              onClick={() => { handleRefreshForm(); setFormEnabled(true); }}
              disabled={loading}
            >
              Refresh Form
            </RefreshButton>
            {!isEditing && formEnabled && (
              <ActionButton
                $variant="cancel"
                type="button"
                onClick={() => { handleRefreshForm(); setFormEnabled(false); }}
              >
                Cancel
              </ActionButton>
            )}
            <SubmitButton
              type="submit"
              form="equipment-form"
              disabled={loading || (!formEnabled && !isEditing)}
            >
              {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Equipment' : 'Register Equipment')}
            </SubmitButton>
          </div>
        </div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <form onSubmit={handleSubmit} id="equipment-form">
          <ThreeColumnRow style={{ marginTop: 24 }}>
            {/* Left Column: Category, Type, Name, Model, Location */}
            <FieldColumn>
              <Label htmlFor="category">Equipment Category</Label>
              <InlineFieldRow>
                <Select id="category" name="category" value={equipmentData.category} onChange={handleInputChange} disabled={!formEnabled && !isEditing}>
                  <option value="">Select category</option>
                  {(() => {
                    const current = equipmentData.category;
                    if (current && !equipmentCategories.includes(current)) {
                      return <option value={current} disabled>{current}</option>;
                    }
                    return null;
                  })()}
                  {equipmentCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </Select>
                <UpdateOptionsLink type="button" onClick={() => handleManageDropdowns('equipment_categories')}>Options</UpdateOptionsLink>
              </InlineFieldRow>

              <Label htmlFor="equipment_type" style={{ marginTop: 12 }}>Equipment Type</Label>
              <InlineFieldRow>
                <Select id="equipment_type" name="equipment_type" value={equipmentData.equipment_type} onChange={handleInputChange} $hasError={!!validationErrors.equipment_type} disabled={!formEnabled && !isEditing}>
                  <option value="">Select equipment type</option>
                  {(() => {
                    const current = equipmentData.equipment_type;
                    if (!current) return null;
                    const isPresentActive = equipmentTypes.filter(t => t.active).some(t => ((t.id ?? t.uuid_id) === current) || ((t.name || '') === current));
                    if (isPresentActive) return null;
                    const { label } = resolveOptionLabel(equipmentTypes as any[], current, current);
                    return <option value={current} disabled>{label}</option>;
                  })()}
                  {equipmentTypes.filter(t => t.active).map(t => (<option key={t.id ?? t.uuid_id ?? t.name} value={(t.id ?? t.uuid_id ?? t.name) || ''}>{t.name}</option>))}
                </Select>
                <UpdateOptionsLink type="button" onClick={() => handleManageDropdowns('equipment_types')}>Options</UpdateOptionsLink>
              </InlineFieldRow>
              {validationErrors.equipment_type && (<ErrorMessage>{validationErrors.equipment_type}</ErrorMessage>)}

              <Label htmlFor="manufacturer" style={{ marginTop: 12 }}>Equipment Manufacturer</Label>
              <InlineFieldRow>
                <Select id="manufacturer" name="manufacturer" value={equipmentData.manufacturer} onChange={handleInputChange} $hasError={!!validationErrors.manufacturer} disabled={!formEnabled && !isEditing}>
                  <option value="">Select manufacturer</option>
                  {(() => {
                    const current = equipmentData.manufacturer;
                    if (!current) return null;
                    const isPresentActive = manufacturers.filter(m => m.active).some(m => (((m as any).id ?? (m as any).uuid_id) === current) || ((m.name || '') === current));
                    if (isPresentActive) return null;
                    const { label } = resolveOptionLabel(manufacturers as any[], current, current);
                    return <option value={current} disabled>{label}</option>;
                  })()}
                  {manufacturers.filter(m => m.active).map(m => (<option key={(m as any).id ?? (m as any).uuid_id ?? m.name} value={((m as any).id ?? (m as any).uuid_id ?? m.name) || ''}>{m.name}</option>))}
                </Select>
                <UpdateOptionsLink type="button" onClick={() => handleManageDropdowns('manufacturers')}>Options</UpdateOptionsLink>
              </InlineFieldRow>
              {validationErrors.manufacturer && (<ErrorMessage>{validationErrors.manufacturer}</ErrorMessage>)}

              <Label htmlFor="model_make" style={{ marginTop: 12 }}>Equipment Make / Model</Label>
              <InlineFieldRow>
                <Select id="model_make" name="model_make" value={equipmentData.model_make} onChange={handleInputChange} $hasError={!!validationErrors.model_make} disabled={!formEnabled && !isEditing}>
                  <option value="">Select model/make</option>
                  {(() => {
                    const current = equipmentData.model_make;
                    if (!current) return null;
                    const isPresentActive = modelMakes.filter(m => m.active).some(m => (((m as any).id ?? (m as any).uuid_id) === current) || ((m.name || '') === current));
                    if (isPresentActive) return null;
                    const { label } = resolveOptionLabel(modelMakes as any[], current, current);
                    return <option value={current} disabled>{label}</option>;
                  })()}
                  {modelMakes.filter(m => m.active).map(m => (<option key={(m as any).id ?? (m as any).uuid_id ?? m.name} value={((m as any).id ?? (m as any).uuid_id ?? m.name) || ''}>{m.name}</option>))}
                </Select>
                <UpdateOptionsLink type="button" onClick={() => handleManageDropdowns('model_makes')}>Options</UpdateOptionsLink>
              </InlineFieldRow>
              {validationErrors.model_make && (<ErrorMessage>{validationErrors.model_make}</ErrorMessage>)}

              <Label htmlFor="location_department" style={{ marginTop: 12 }}>Equipment Location</Label>
              <InlineFieldRow>
                <Select id="location_department" name="location_department" value={equipmentData.location_department} onChange={handleInputChange} $hasError={!!validationErrors.location_department} disabled={!formEnabled && !isEditing}>
                  <option value="">Select location/department</option>
                  {(() => {
                    const current = equipmentData.location_department;
                    if (!current) return null;
                    const isPresentActive = locationDepartments.filter(d => d.active).some(d => (((d as any).id ?? (d as any).uuid_id) === current) || ((d.name || '') === current));
                    if (isPresentActive) return null;
                    const { label } = resolveOptionLabel(locationDepartments as any[], current, current);
                    return <option value={current} disabled>{label}</option>;
                  })()}
                  {locationDepartments.filter(d => d.active).map(d => (<option key={(d as any).id ?? (d as any).uuid_id ?? d.name} value={((d as any).id ?? (d as any).uuid_id ?? d.name) || ''}>{d.name}</option>))}
                </Select>
                <UpdateOptionsLink type="button" onClick={() => handleManageDropdowns('location_departments')}>Options</UpdateOptionsLink>
              </InlineFieldRow>
              {validationErrors.location_department && (<ErrorMessage>{validationErrors.location_department}</ErrorMessage>)}
            </FieldColumn>

            {/* Center Column: Serial, Manufacturer, Purchase, Warranty, Condition */}
            <FieldColumn>
              <Label htmlFor="serial_number">Equipment Serial Number</Label>
              <Input id="serial_number" name="serial_number" placeholder="Enter serial number (if applicable)" value={equipmentData.serial_number} onChange={handleInputChange} $hasError={!!validationErrors.serial_number} disabled={!formEnabled && !isEditing} />
              {validationErrors.serial_number && (<ErrorMessage>{validationErrors.serial_number}</ErrorMessage>)}

              <Label htmlFor="equipment_name" style={{ marginTop: 12 }}>Equipment Name</Label>
              <Input id="equipment_name" name="equipment_name" placeholder="e.g., Fire Hose, Nozzle, SCBA" value={equipmentData.equipment_name} onChange={handleInputChange} $hasError={!!validationErrors.equipment_name} disabled={!formEnabled && !isEditing} />
              {validationErrors.equipment_name && (<ErrorMessage>{validationErrors.equipment_name}</ErrorMessage>)}

              <Label htmlFor="purchase_date" style={{ marginTop: 12 }}>Equipment Purchase Date</Label>
              <Input id="purchase_date" type="date" name="purchase_date" value={equipmentData.purchase_date} onChange={handleInputChange} $hasError={!!validationErrors.purchase_date} disabled={!formEnabled && !isEditing} />
              {validationErrors.purchase_date && (<ErrorMessage>{validationErrors.purchase_date}</ErrorMessage>)}

              <Label htmlFor="warranty_expiry_date" style={{ marginTop: 12 }}>Equipment Warranty Expiry</Label>
              <Input id="warranty_expiry_date" type="date" name="warranty_expiry_date" value={equipmentData.warranty_expiry_date} onChange={handleInputChange} $hasError={!!validationErrors.warranty_expiry_date} disabled={!formEnabled && !isEditing} />
              {validationErrors.warranty_expiry_date && (<ErrorMessage>{validationErrors.warranty_expiry_date}</ErrorMessage>)}

              <Label htmlFor="condition_status" style={{ marginTop: 12 }}>Equipment Condition</Label>
              <Select id="condition_status" name="condition_status" value={equipmentData.condition_status} onChange={handleInputChange} $hasError={!!validationErrors.condition_status} disabled={!formEnabled && !isEditing}>
                <option value="">Select condition status</option>
                {CONDITION_STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}
              </Select>
              {validationErrors.condition_status && (<ErrorMessage>{validationErrors.condition_status}</ErrorMessage>)}
            </FieldColumn>

            {/* Right Column: Picture */}
            <FieldColumn>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 0 }}>
                <div style={{ width: 320, height: 240, border: '2px solid #e0e0e0', borderRadius: 6, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview || equipmentData.photo_url ? (
                    <img src={imagePreview || equipmentData.photo_url} alt="Equipment" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 4 }} />
                  ) : (
                    <span style={{ color: '#666', fontSize: 12 }}>Photo</span>
                  )}
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <input type="file" accept="image/*" onChange={handlePictureChange} disabled={!formEnabled && !isEditing} />
                </div>
              </div>
            </FieldColumn>
          </ThreeColumnRow>

          <div>
            {isEditing && (
              <ActionButton $variant="cancel" type="button" onClick={cancelEdit} style={{ marginLeft: '10px' }}>
                Cancel Edit
              </ActionButton>
            )}
          </div>
        </form>
      </FormSection>
      {/* Options Modal for managing dropdown items */}
      <EquipmentOptionsModal
        isOpen={optionsModalOpen}
        type={optionsModalType as any}
        onClose={() => setOptionsModalOpen(false)}
        onOptionsUpdate={() => { loadDropdowns(); loadCategories(); }}
      />
    </MainContent>
    {success && (
      <Toast message={success} type="success" onClose={() => setSuccess('')} />
    )}
    </>
  );
};
