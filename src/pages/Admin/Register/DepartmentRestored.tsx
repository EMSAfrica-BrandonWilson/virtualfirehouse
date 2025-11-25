import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useHeader } from '../../../contexts/HeaderContext';
import { DepartmentTypeModal } from '../../../components/UI/DepartmentTypeModal';
import { CountryModal } from '../../../components/UI/CountryModal';
import { OperationalStatusModal } from '../../../components/UI/OperationalStatusModal';

// Local persistence key for departments directory
const LOCAL_STORAGE_DEPARTMENTS_KEY = 'vfh_departments';

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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

// Three-column layout for form fields
const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
`;

const OptionsLink = styled.button<{ $color?: string }>`
  padding: 10px 12px;
  background: ${props => props.$color || '#1177BB'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  
  &:hover {
    background: ${props => props.$color ? props.$color + 'dd' : '#0f5c99'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
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

const FileInput = styled.input`
  padding: 8px;
  border: 2px dashed #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: #1177BB;
    background-color: #f0f7ff;
  }
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
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

const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  margin-left: 10px;
  
  &:hover {
    background-color: #5a6268;
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

const DuplicateWarning = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
  margin-top: 5px;
  font-size: 12px;
  font-weight: 500;
`;

const DuplicateModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

const DuplicateModalBox = styled.div`
  background: #ffffff;
  border-radius: 10px;
  width: 92%;
  max-width: 560px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 22px;
`;

const DuplicateModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
`;

interface DepartmentFormData {
  deptName: string;
  deptType: string;
  deptCountry: string;
  deptCity: string;
  deptSuburb: string;
  deptStreetName: string;
  deptBuildingNumber: string;
  deptTelephone: string;
  numberOfFireStations: number | '';
  numberOfFireVehicles: number | '';
  numberOfStaff: number | '';
  headOfDepartment: string;
  contactEmail: string;
  description: string;
  operationalStatus: string;
  deptPicture: File | null;
}

 

 

 

export const RegisterDepartmentRestored: React.FC = () => {
  const [originalDeptName, setOriginalDeptName] = useState<string>('');
  const { updateHeader } = useHeader();
  const navigate = useNavigate();
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<string[]>([]);
  const [isFormActive, setIsFormActive] = useState(false);
  const [departmentData, setDepartmentData] = useState<DepartmentFormData>({
    deptName: '',
    deptType: '',
    deptCountry: '',
    deptCity: '',
    deptSuburb: '',
    deptStreetName: '',
    deptBuildingNumber: '',
    deptTelephone: '',
    numberOfFireStations: '',
    numberOfFireVehicles: '',
    numberOfStaff: '',
    headOfDepartment: '',
    contactEmail: '',
    description: '',
    operationalStatus: '',
    deptPicture: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>('');
  const [displayInHeader, setDisplayInHeader] = useState(false);

  // Modal state management
  const [showDepartmentTypeModal, setShowDepartmentTypeModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showOperationalStatusModal, setShowOperationalStatusModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleManageDropdowns = () => {
    navigate('/admin/register/department-dropdown-management');
  };

  // Modal handler functions
  const handleDepartmentTypesUpdate = () => {
    loadDepartmentTypes();
  };

  const handleCountriesUpdate = () => {
    loadCountries();
  };

  const handleOperationalStatusesUpdate = () => {
    loadOperationalStatuses();
  };

  const loadDepartmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd2_types')
        .select('*');
      if (!error) {
        const mapped = (data || []).map((t: any) => t.type_name ?? t.dept_type ?? t.name ?? t.label).filter(Boolean);
        setDepartmentTypes(mapped);
      }
    } catch {}
  };

  const loadCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd2_countries')
        .select('*');
      if (!error) {
        const mapped = (data || []).map((c: any) => c.country_name ?? c.name ?? c.label).filter(Boolean);
        setCountries(mapped);
      }
    } catch {}
  };

  const loadOperationalStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_status')
        .select('*');
      if (!error) {
        const mapped = (data || []).map((s: any) => s.status_name ?? s.name ?? s.label).filter(Boolean);
        setOperationalStatuses(mapped);
      }
    } catch {}
  };

  useEffect(() => {
    loadDepartmentTypes();
    loadCountries();
    loadOperationalStatuses();
  }, []);

  // Check for editing department from sessionStorage (for external navigation)
  useEffect(() => {
    try {
      const editingData = sessionStorage.getItem('editing_department');
      if (editingData) {
        const department = JSON.parse(editingData);
        
        setIsEditing(true);
        setEditingId(department.id);
        setOriginalDeptName(department.dept_name || '');
        setExistingLogoUrl(department.dept_picture_url || '');
        setDepartmentData({
          deptName: department.dept_name || '',
          deptType: department.dept_type || '',
          deptCountry: department.dept_country || '',
          deptCity: department.dept_city || '',
          deptSuburb: department.dept_suburb || '',
          deptStreetName: department.dept_street_name || '',
          deptBuildingNumber: department.dept_street_number || '',
          deptTelephone: department.dept_telephone || '',
          numberOfFireStations: department.number_of_fire_stations || '',
          numberOfFireVehicles: department.number_of_fire_vehicles || '',
          numberOfStaff: department.number_of_staff || '',
          headOfDepartment: department.head_of_department || '',
          contactEmail: department.contact_email || '',
          description: department.description || '',
          operationalStatus: department.operational_status || '',
          deptPicture: null
        });
        
        setSuccess('Editing existing department data. Make your changes and submit to update.');
        setIsFormActive(true);
        setDisplayInHeader(false);
      }
    } catch (error) {
      console.error('Error parsing editing data from sessionStorage:', error);
    }
  }, []);

  // Real-time duplicate checking with debounce (trigger only on name changes)
  useEffect(() => {
    if (departmentData.deptName.trim().length > 2) {
      const timer = setTimeout(() => {
        checkDuplicateName(departmentData.deptName);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDuplicateCheck('');
    }
  }, [departmentData.deptName]);

  // Defensive guard: if editing and name is unchanged, ensure duplicate state is cleared
  useEffect(() => {
    if (isEditing && originalDeptName && departmentData.deptName.trim() === originalDeptName.trim()) {
      setDuplicateCheck('');
      setFieldErrors(prev => ({ ...prev, deptName: false }));
    }
  }, [isEditing, originalDeptName, departmentData.deptType, departmentData.deptCountry, departmentData.deptCity, departmentData.operationalStatus]);

  // Update header when meaningful form changes occur
  useEffect(() => {
    if (displayInHeader && departmentData.deptName.trim().length > 0 && departmentData.deptType.trim().length > 0) {
      const timer = setTimeout(() => {
        const logoUrl = departmentData.deptPicture ? URL.createObjectURL(departmentData.deptPicture) : '';
        updateHeader({
          departmentName: departmentData.deptName,
          departmentType: departmentData.deptType,
          logoUrl: logoUrl
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        if (departmentData.deptPicture) {
          const url = URL.createObjectURL(departmentData.deptPicture);
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [displayInHeader, departmentData.deptName, departmentData.deptType, departmentData.deptPicture, updateHeader]);

  const checkDuplicateName = async (name: string) => {
    try {
      // During edit, if the name hasn't changed, skip duplicate check
      if (isEditing && originalDeptName && name.trim() === originalDeptName.trim()) {
        setDuplicateCheck('');
        setFieldErrors(prev => ({ ...prev, deptName: false }));
        return;
      }

      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('id')
        .eq('dept_name', name.trim());
      if (error) return;
      const exists = Array.isArray(data) && data.some((d: any) => d && (!isEditing || d.id !== editingId));
      if (exists && !isEditing) {
        setDuplicateCheck(`Department name "${name}" already exists. You can load it below.`);
        setFieldErrors(prev => ({ ...prev, deptName: true }));
        setShowDuplicateModal(true);
      } else {
        setDuplicateCheck('');
        setFieldErrors(prev => ({ ...prev, deptName: false }));
      }
    } catch (error) {
      console.error('Duplicate check failed:', error);
    }
  };





  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setOriginalDeptName('');
    setExistingLogoUrl('');
    // Clear the editing context when user cancels
    sessionStorage.removeItem('editing_department');
    handleRefresh();
  };

  const loadExistingDepartmentByName = async () => {
    try {
      const name = departmentData.deptName.trim();
      if (!name) return;
      setLoading(true);
      setError('');
      setSuccess('');
      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('*')
        .eq('dept_name', name)
        .limit(1)
        .single();
      if (error) {
        setError('Failed to load existing department details.');
        return;
      }
      if (data) {
        setIsEditing(true);
        setEditingId(data.id);
        setOriginalDeptName(data.dept_name || '');
        setExistingLogoUrl(data.dept_picture_url || '');
        setDepartmentData({
          deptName: data.dept_name || '',
          deptType: data.dept_type || '',
          deptCountry: data.dept_country || '',
          deptCity: data.dept_city || '',
          deptSuburb: data.dept_suburb || '',
          deptStreetName: data.dept_street_name || '',
          deptBuildingNumber: data.dept_street_number || '',
          deptTelephone: data.dept_telephone || '',
          numberOfFireStations: data.number_of_fire_stations || '',
          numberOfFireVehicles: data.number_of_fire_vehicles || '',
          numberOfStaff: data.number_of_staff || '',
          headOfDepartment: data.head_of_department || '',
          contactEmail: data.contact_email || '',
          description: data.description || '',
          operationalStatus: data.operational_status || '',
          deptPicture: null
        });
        setDuplicateCheck('');
        setFieldErrors(prev => ({ ...prev, deptName: false }));
        setSuccess('Existing department loaded. You can edit and submit to update.');
        setIsFormActive(true);
        setDisplayInHeader(false);
      }
    } catch (err) {
      setError('Failed to load existing department details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if there are duplicates and not editing
    if (duplicateCheck && !isEditing) {
      setError('Please resolve the duplicate department name before submitting.');
      return;
    }

    // Validate required fields
    const requiredFields = ['deptName', 'deptType', 'deptCountry', 'deptCity', 'deptTelephone'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (!departmentData[field as keyof DepartmentFormData]) {
        errors[field] = true;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let pictureData = null;
      let fileName = null;

      // Handle file upload if a picture is selected
      if (departmentData.deptPicture) {
        pictureData = await fileToBase64(departmentData.deptPicture);
        fileName = departmentData.deptPicture.name;
      }

      // Helper to persist department to localStorage in reports-friendly shape
      const persistToLocalStorage = (idForStorage: number) => {
        try {
          const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY) || '[]');
          const nowIso = new Date().toISOString();
          const baseRecord = {
            id: idForStorage,
            dept_name: departmentData.deptName,
            dept_type: departmentData.deptType,
            dept_country: departmentData.deptCountry,
            dept_city: departmentData.deptCity,
            dept_suburb: departmentData.deptSuburb,
            dept_street_name: departmentData.deptStreetName,
            dept_street_number: departmentData.deptBuildingNumber,
            dept_telephone: departmentData.deptTelephone,
            number_of_fire_stations: departmentData.numberOfFireStations || null,
            number_of_fire_vehicles: departmentData.numberOfFireVehicles || null,
            number_of_staff: departmentData.numberOfStaff || null,
            head_of_department: departmentData.headOfDepartment || '',
            contact_email: departmentData.contactEmail || '',
            description: departmentData.description || '',
            operational_status: departmentData.operationalStatus || '',
            dept_picture_url: existingLogoUrl || '',
            created_at: nowIso,
            updated_at: nowIso
          };

          let updated: any[] = existing;
          const idx = updated.findIndex((d: any) => d.id === idForStorage);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], ...baseRecord, updated_at: nowIso };
          } else {
            updated = [baseRecord, ...updated];
          }
          localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS_KEY, JSON.stringify(updated));
        } catch (lsErr) {
          console.warn('LocalStorage persistence failed:', lsErr);
        }
      };

      if (isEditing && editingId) {
        const payload: any = {
          dept_name: departmentData.deptName,
          dept_type: departmentData.deptType,
          dept_country: departmentData.deptCountry,
          dept_city: departmentData.deptCity,
          dept_suburb: departmentData.deptSuburb,
          dept_street_name: departmentData.deptStreetName,
          dept_street_number: departmentData.deptBuildingNumber,
          dept_telephone: departmentData.deptTelephone,
          number_of_fire_stations: departmentData.numberOfFireStations || null,
          number_of_fire_vehicles: departmentData.numberOfFireVehicles || null,
          number_of_staff: departmentData.numberOfStaff || null,
          head_of_department: departmentData.headOfDepartment || '',
          contact_email: departmentData.contactEmail || '',
          description: departmentData.description || '',
          operational_status: departmentData.operationalStatus || '',
          dept_picture_url: existingLogoUrl || ''
        };
        const { data: updated, error } = await supabase
          .from('02_admin_register_fd1_departments')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (error) {
          persistToLocalStorage(editingId);
        } else {
        const finalLogoUrl = updated?.dept_picture_url || existingLogoUrl;
        if (displayInHeader) {
          updateHeader({
            departmentName: departmentData.deptName,
            departmentType: departmentData.deptType,
            logoUrl: finalLogoUrl
          });
        }
        }
        setSuccess('Department updated successfully!');
        setIsEditing(false);
        setEditingId(null);
        setExistingLogoUrl('');
        sessionStorage.removeItem('editing_department');
      } else {
        const payload: any = {
          dept_name: departmentData.deptName,
          dept_type: departmentData.deptType,
          dept_country: departmentData.deptCountry,
          dept_city: departmentData.deptCity,
          dept_suburb: departmentData.deptSuburb,
          dept_street_name: departmentData.deptStreetName,
          dept_street_number: departmentData.deptBuildingNumber,
          dept_telephone: departmentData.deptTelephone,
          number_of_fire_stations: departmentData.numberOfFireStations || null,
          number_of_fire_vehicles: departmentData.numberOfFireVehicles || null,
          number_of_staff: departmentData.numberOfStaff || null,
          head_of_department: departmentData.headOfDepartment || '',
          contact_email: departmentData.contactEmail || '',
          description: departmentData.description || '',
          operational_status: departmentData.operationalStatus || '',
          dept_picture_url: ''
        };
        const { data: created, error } = await supabase
          .from('02_admin_register_fd1_departments')
          .insert([payload])
          .select()
          .single();
        if (error) {
          const localId = Date.now();
          persistToLocalStorage(localId);
        } else {
          if (displayInHeader) {
            updateHeader({
              departmentName: departmentData.deptName,
              departmentType: departmentData.deptType,
              logoUrl: created?.dept_picture_url || ''
            });
          }
        }
        setSuccess('Department registered successfully!');
      }
      
      // Reset file input only
      const fileInput = document.getElementById('deptPicture') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setDepartmentData(prev => ({ ...prev, deptPicture: null }));
    } catch (error: any) {
      setError(error.message || 'An error occurred during operation');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
    
    setDepartmentData(prev => {
      let processedValue: any = value;
      
      // Convert numeric fields
      if (['numberOfFireStations', 'numberOfFireVehicles', 'numberOfStaff'].includes(name)) {
        processedValue = value === '' ? '' : parseInt(value) || '';
      }
      
      return {
        ...prev,
        [name]: files && files[0] ? files[0] : processedValue
      };
    });
  };

  const handleRefresh = () => {
    // Manual refresh - reset form completely
    setDepartmentData({
      deptName: '',
      deptType: '',
      deptCountry: '',
      deptCity: '',
      deptSuburb: '',
      deptStreetName: '',
      deptBuildingNumber: '',
      deptTelephone: '',
      numberOfFireStations: '',
      numberOfFireVehicles: '',
      numberOfStaff: '',
      headOfDepartment: '',
      contactEmail: '',
      description: '',
      operationalStatus: '',
      deptPicture: null
    });
    setError('');
    setSuccess('');
    setDuplicateCheck('');
    setFieldErrors({});
    setIsEditing(false);
    setEditingId(null);
    setOriginalDeptName('');
    setExistingLogoUrl('');
    
    // Reset file input
    const fileInput = document.getElementById('deptPicture') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setIsFormActive(false);
    setDisplayInHeader(false);
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="department-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
          <Column style={{ flex: '1', minWidth: '0' }}>
            <Title id="department-title">
              Register Your Emergency Department
            </Title>
            <Divider aria-hidden="true" />
            <Paragraph>
              Use this page to register or update emergency departments. Click Add Department to enable the form, manage dropdown options via the Options buttons, load existing details when a duplicate name is detected, and use the “Display this department in the header” checkbox to control the header details.
            </Paragraph>
          </Column>
            <ImageColumn>
              <HeaderImage src="/images/FireStation4.jpg" alt="Register Department" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Registration Form Section */}
      <Section aria-labelledby="registration-form">
        <FormSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SubTitle id="registration-form">
              {isEditing ? 'Edit Department Information' : 'Department Registration Process'}
            </SubTitle>
            <div>
              {!isFormActive && !isEditing && (
                <SubmitButton onClick={() => setIsFormActive(true)} type="button">
                  Add Department
                </SubmitButton>
              )}
              {isEditing && (
                <CancelButton onClick={cancelEdit} type="button">
                  Cancel Edit
                </CancelButton>
              )}
              <RefreshButton onClick={handleRefresh} type="button">
                Refresh Form
              </RefreshButton>
            </div>
          </div>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          
          <FormContainer onSubmit={handleSubmit}>
            {/* Three-column layout as requested */}
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="deptName">Department Name *</Label>
              <Input
                type="text"
                id="deptName"
                name="deptName"
                value={departmentData.deptName}
                onChange={handleInputChange}
                required
                placeholder="Enter department name"
                $hasError={fieldErrors.deptName || (!isEditing && !!duplicateCheck)}
                disabled={!isFormActive}
              />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptType">Department Type *</Label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    id="deptType"
                    name="deptType"
                    value={departmentData.deptType}
                    onChange={handleInputChange}
                    $hasError={fieldErrors.deptType}
                    required
                    style={{ flex: 1 }}
                    disabled={!isFormActive}
                  >
                    <option value="">Select Type</option>
                    {departmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                  <OptionsLink onClick={() => setShowDepartmentTypeModal(true)} style={{ marginLeft: '8px' }} disabled={!isFormActive}>
                    Options
                  </OptionsLink>
                </div>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptCountry">Country *</Label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    id="deptCountry"
                    name="deptCountry"
                    value={departmentData.deptCountry}
                    onChange={handleInputChange}
                    required
                    $hasError={fieldErrors.deptCountry}
                    style={{ flex: 1 }}
                    disabled={!isFormActive}
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </Select>
                  <OptionsLink onClick={() => setShowCountryModal(true)} style={{ marginLeft: '8px' }} disabled={!isFormActive}>
                    Options
                  </OptionsLink>
                </div>
              </FieldColumn>
            </ThreeColumnRow>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="deptCity">Department City *</Label>
                <Input
                  type="text"
                  id="deptCity"
                  name="deptCity"
                  value={departmentData.deptCity}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter city"
                  $hasError={fieldErrors.deptCity}
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptSuburb">Department Suburb</Label>
                <Input
                  type="text"
                  id="deptSuburb"
                  name="deptSuburb"
                  value={departmentData.deptSuburb}
                  onChange={handleInputChange}
                  placeholder="Enter suburb"
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptStreetName">Department Street Name</Label>
                <Input
                  type="text"
                  id="deptStreetName"
                  name="deptStreetName"
                  value={departmentData.deptStreetName}
                  onChange={handleInputChange}
                  placeholder="Enter street name"
                  disabled={!isFormActive}
                />
              </FieldColumn>
            </ThreeColumnRow>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="deptBuildingNumber">Building Number</Label>
                <Input
                  type="text"
                  id="deptBuildingNumber"
                  name="deptBuildingNumber"
                  value={departmentData.deptBuildingNumber}
                  onChange={handleInputChange}
                  placeholder="Enter building number"
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptTelephone">Department Telephone *</Label>
                <Input
                  type="tel"
                  id="deptTelephone"
                  name="deptTelephone"
                  value={departmentData.deptTelephone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter telephone number"
                  $hasError={fieldErrors.deptTelephone}
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="numberOfFireStations">Number of Fire Stations</Label>
                <Input
                  type="number"
                  id="numberOfFireStations"
                  name="numberOfFireStations"
                  value={departmentData.numberOfFireStations}
                  onChange={handleInputChange}
                  placeholder="Enter number of stations"
                  min="0"
                  disabled={!isFormActive}
                />
              </FieldColumn>
            </ThreeColumnRow>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="numberOfFireVehicles">Number of Fire Vehicles</Label>
                <Input
                  type="number"
                  id="numberOfFireVehicles"
                  name="numberOfFireVehicles"
                  value={departmentData.numberOfFireVehicles}
                  onChange={handleInputChange}
                  placeholder="Enter number of vehicles"
                  min="0"
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="numberOfStaff">Number of Staff</Label>
                <Input
                  type="number"
                  id="numberOfStaff"
                  name="numberOfStaff"
                  value={departmentData.numberOfStaff}
                  onChange={handleInputChange}
                  placeholder="Enter number of staff"
                  min="0"
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="headOfDepartment">Head of Department</Label>
                <Input
                  type="text"
                  id="headOfDepartment"
                  name="headOfDepartment"
                  value={departmentData.headOfDepartment}
                  onChange={handleInputChange}
                  placeholder="Enter head of department name"
                  disabled={!isFormActive}
                />
              </FieldColumn>
            </ThreeColumnRow>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={departmentData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Enter contact email"
                  disabled={!isFormActive}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="operationalStatus">Operational Status</Label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    id="operationalStatus"
                    name="operationalStatus"
                    value={departmentData.operationalStatus}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                    disabled={!isFormActive}
                  >
                    <option value="">Select operational status</option>
                    {operationalStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Select>
                  <OptionsLink onClick={() => setShowOperationalStatusModal(true)} style={{ marginLeft: '8px' }} disabled={!isFormActive}>
                    Options
                  </OptionsLink>
                </div>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptPicture">Department Logo (Optional)</Label>
                <FileInput
                  type="file"
                  id="deptPicture"
                  name="deptPicture"
                  onChange={handleInputChange}
                  accept="image/*"
                  disabled={!isFormActive}
                />
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                  Upload a logo for your department (will appear in header)
                </small>
              </FieldColumn>
            </ThreeColumnRow>
            
            <FieldColumn>
              <Label htmlFor="description">Department Description</Label>
              <textarea
                id="description"
                name="description"
                value={departmentData.description}
                onChange={handleInputChange}
                placeholder="Enter department description"
                rows={4}
                style={{
                  padding: '10px 12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  width: '100%'
                }}
                disabled={!isFormActive}
              />
            </FieldColumn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="displayInHeader"
                checked={displayInHeader}
                onChange={(e) => setDisplayInHeader(e.target.checked)}
                disabled={!isFormActive}
              />
              <label htmlFor="displayInHeader" style={{ color: '#1177BB', fontWeight: 600 }}>Display this department in the header</label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <SubmitButton type="submit" disabled={loading || (!isEditing && !!duplicateCheck) || !isFormActive}>
                {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Department' : 'Register Department')}
              </SubmitButton>
            </div>
          </FormContainer>
        </FormSection>
      </Section>

      {/* Modal Components */}
      <DepartmentTypeModal
        isOpen={showDepartmentTypeModal}
        onClose={() => setShowDepartmentTypeModal(false)}
        onDepartmentTypesUpdate={handleDepartmentTypesUpdate}
      />
      
      <CountryModal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onCountriesUpdate={handleCountriesUpdate}
      />
      
      <OperationalStatusModal
        isOpen={showOperationalStatusModal}
        onClose={() => setShowOperationalStatusModal(false)}
        onOperationalStatusesUpdate={handleOperationalStatusesUpdate}
      />

      {showDuplicateModal && (
        <DuplicateModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setShowDuplicateModal(false); }}>
          <DuplicateModalBox>
            <div style={{ color: '#1177BB', fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>Fire Department Already Registered</div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              The department name "{departmentData.deptName}" is already registered.
            </div>
            <DuplicateModalActions>
              <SubmitButton type="button" onClick={async () => { await loadExistingDepartmentByName(); setShowDuplicateModal(false); }}>
                Load existing
              </SubmitButton>
              <CancelButton type="button" onClick={() => setShowDuplicateModal(false)}>Close</CancelButton>
            </DuplicateModalActions>
          </DuplicateModalBox>
        </DuplicateModalOverlay>
      )}

    </MainContent>
  );
};
