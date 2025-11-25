import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../../hooks/usePageImage';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { StaffOptionsModal } from '../../../../components/UI/StaffOptionsModal';

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

const FormHeading = styled.h2`
  font-size: 1.3rem;
  color: #1177BB;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FF9900;
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

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

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

const FieldColumn = styled.div<{ $flex?: string }>`
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
  display: flex;
  align-items: center;
  gap: 8px;
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
  
  &:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
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

const SaveAndNextButton = styled.button`
  background-color: #28a745;
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
    background-color: #218838;
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

const WarningMessage = styled.div`
  background-color: #fff8e1;
  color: #f57c00;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ffd54f;
  margin-bottom: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const LoadButton = styled.button`
  background-color: #ff9800;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #f57c00;
  }
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const PhotoSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoFieldsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PhotoPlaceholder = styled.div`
  width: 100%;
  height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  &.has-image {
    border-style: solid;
    border-color: #1177BB;
  }
`;

const PlaceholderText = styled.div`
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '48%'};
  vertical-align: top;
  text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
`;

const ImageColumn = styled.div`
  width: 200px;
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
  width: 200px;
  height: auto;
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 200px;
  height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine", "Armenian", 
  "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", 
  "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", 
  "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian", 
  "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", 
  "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", 
  "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", 
  "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino", "Finnish", "French", "Gabonese", 
  "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", 
  "Guyanese", "Haitian", "Honduran", "Hungarian", "Icelander", "Indian", "Indonesian", "Iranian", 
  "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", 
  "Kazakhstani", "Kenyan", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", 
  "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", 
  "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", 
  "Micronesian", "Moldovan", "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican", 
  "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", 
  "North Korean", "Norwegian", "Omani", "Pakistani", "Palauan", "Palestinian", "Panamanian", 
  "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", 
  "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", 
  "Saudi Arabian", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", 
  "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "South Sudanese", 
  "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", 
  "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Turkmen", 
  "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Yemeni", 
  "Zambian", "Zimbabwean"
];

interface StaffFormData {
  employeeNumber: string;
  nationalIdNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  nationality: string;
  telephoneNumber: string;
  emailAddress: string;
  employmentStartDate: string;
  serviceDuration: string;
  departmentId: string;
  stationId: string;
  operationalShiftId: string;
  rankId: string;
  photo: File | null;
}

interface Department {
  id: number;
  dept_name: string;
}

interface Station {
  id: number;
  fire_station_name: string;
  department_id: number;
}

interface OperationalShift {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

interface Rank {
  id: string;  // UUID type
  name: string;
  code: string;
  level: number;
  description: string;
  is_active: boolean;
}

export const StaffBasicInfo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    employeeNumber: '',
    nationalIdNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    gender: 'Male',
    nationality: '',
    telephoneNumber: '',
    emailAddress: '',
    employmentStartDate: '',
    serviceDuration: '',
    departmentId: '',
    stationId: '',
    operationalShiftId: '',
    rankId: '',
    photo: null
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [operationalShifts, setOperationalShifts] = useState<OperationalShift[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [showRankOptionsModal, setShowRankOptionsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [existingStaffId, setExistingStaffId] = useState<number | null>(null);
  const [employeeNumberChecked, setEmployeeNumberChecked] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEmployee, setDuplicateEmployee] = useState<{ id: number, name: string } | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadDepartments();
    loadStations();
    loadOperationalShifts();
    loadRanks();
    
    // Check if we're in edit mode from sessionStorage
    const storedStaffId = sessionStorage.getItem('current_staff_id');
    if (storedStaffId) {
      loadExistingStaff(parseInt(storedStaffId));
    }

    // Check view-only mode from sessionStorage
    const viewMode = sessionStorage.getItem('basic_info_view_mode');
    setIsViewMode(viewMode === 'true');
  }, []);

  // Refresh view mode when route changes (e.g., navigating via Edit/View)
  useEffect(() => {
    const viewMode = sessionStorage.getItem('basic_info_view_mode');
    setIsViewMode(viewMode === 'true');
  }, [location.key]);

  // Ensure editing controls are off in view mode
  useEffect(() => {
    if (isViewMode) {
      setIsEditing(false);
    }
  }, [isViewMode]);

  // Filter stations when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const filtered = stations.filter(s => s.department_id === parseInt(formData.departmentId));
      setFilteredStations(filtered);
      // Reset station selection if it doesn't belong to new department
      if (formData.stationId) {
        const stationExists = filtered.some(s => String((s as any)?.id ?? '') === formData.stationId);
        if (!stationExists) {
          setFormData(prev => ({ ...prev, stationId: '' }));
        }
      }
    } else {
      setFilteredStations([]);
      setFormData(prev => ({ ...prev, stationId: '' }));
    }
  }, [formData.departmentId, stations]);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    } else {
      setFormData(prev => ({ ...prev, age: '' }));
    }
  }, [formData.dateOfBirth]);

  // Calculate service duration when employment start date changes
  useEffect(() => {
    if (formData.employmentStartDate) {
      const duration = calculateServiceDuration(formData.employmentStartDate);
      setFormData(prev => ({ ...prev, serviceDuration: duration }));
    } else {
      setFormData(prev => ({ ...prev, serviceDuration: '' }));
    }
  }, [formData.employmentStartDate]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateServiceDuration = (startDate: string): string => {
    const today = new Date();
    const start = new Date(startDate);
    
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (today.getDate() < start.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    if (years === 0 && months === 0) {
      return 'Less than 1 month';
    } else if (years === 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const loadDepartments = async () => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('*');

      if (error) throw error;

      const mapped = (data || []).map((row: any) => ({
        id: row.id ?? row.dept_id ?? row.department_id ?? row.pk ?? null,
        dept_name: row.dept_name ?? row.deptName ?? row.department_name ?? row.name ?? ''
      })).filter((d: any) => d.id !== null && d.dept_name);

      mapped.sort((a: any, b: any) => (a.dept_name || '').localeCompare(b.dept_name || ''));
      setDepartments(mapped);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError('Failed to load departments');
      setDepartments([]);
    } finally {
      setDataLoading(false);
    }
  };

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd3_stations')
        .select('id, fire_station_name, department_id')
        .order('fire_station_name');

      if (error) throw error;
      setStations(data || []);
    } catch (error: any) {
      console.error('Error loading stations:', error);
    }
  };

  const loadOperationalShifts = async () => {
    try {
      // First, try to load the active shift system definition and use its Names of Shifts
      const { data: defRows, error: defErr } = await supabase
        .from('shift_system_definitions')
        .select('shift_names, active')
        .eq('active', true)
        .limit(1);

      const shiftNames: string[] | null = (!defErr && Array.isArray(defRows) && defRows.length > 0)
        ? (defRows[0]?.shift_names as string[] | null)
        : null;

      if (Array.isArray(shiftNames) && shiftNames.length > 0) {
        // Helper to ensure "Day Shift" is present in options
        const includeDayShift = (list: OperationalShift[]): OperationalShift[] => {
          const exists = list.some(s => (s.name || '').toLowerCase() === 'day shift');
          return exists ? list : [...list, { id: -999, name: 'Day Shift', description: '', active: true }];
        };
        // Map definition names to existing operational_shifts rows by shift_name
        const { data, error } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id, shift_name, description, active')
          .in('shift_name', shiftNames)
          .order('shift_name', { ascending: true });

        if (error) throw error;

        const transformedShifts = (data || []).map(shift => ({
          id: shift.id,
          name: shift.shift_name,
          description: shift.description || '',
          active: typeof shift.active === 'boolean' ? shift.active : true
        }));

        // Only include active shifts and ensure order follows definition as closely as possible
        const activeShifts = transformedShifts.filter((shift: OperationalShift) => shift.active !== false);
        const ordered = shiftNames
          .map(name => activeShifts.find(s => s.name === name))
          .filter((s): s is OperationalShift => !!s);
        if (ordered.length > 0) {
          setOperationalShifts(includeDayShift(ordered));
          return; // Done if definition provided names
        }
        // If definition exists but no matching rows, synthesize options from definition names
        const syntheticBase = shiftNames.map((name, idx) => ({
          id: -(idx + 1),
          name,
          description: '',
          active: true,
        }));
        setOperationalShifts(includeDayShift(syntheticBase));
        return;
      }

      // Fallback: load all operational_shifts if no active definition found or definition call failed
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('id, shift_name, description, active')
        .order('shift_name', { ascending: true });

      if (error) throw error;

      const transformedShifts = (data || []).map(shift => ({
        id: shift.id,
        name: shift.shift_name,
        description: shift.description || '',
        active: typeof shift.active === 'boolean' ? shift.active : true
      }));
      const activeShifts = transformedShifts.filter((shift: OperationalShift) => shift.active !== false);
      const existsDay = activeShifts.some(s => (s.name || '').toLowerCase() === 'day shift');
      setOperationalShifts(
        existsDay ? activeShifts : [...activeShifts, { id: -999, name: 'Day Shift', description: '', active: true }]
      );
    } catch (error: any) {
      console.error('Error loading operational shifts:', error);
    }
  };

  const loadRanks = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_9_ranks')
        .select('*');

      if (error) throw error;

      const rows: any[] = Array.isArray(data) ? data : [];
      const mapped = rows
        .map((row: any) => ({
          id: row.id ?? row.rank_id ?? null,
          name: row.name ?? row.rank_name ?? '',
          level: Number(row.level ?? row.rank_level ?? 0),
          is_active:
            typeof row.is_active === 'boolean'
              ? row.is_active
              : String(row.is_active ?? '').toLowerCase() === 'true' || row.is_active === 1,
        }))
        .filter((r: any) => r.id !== null && r.name);

      const active = mapped.filter((r: any) => r.is_active);
      active.sort((a: any, b: any) => (a.level - b.level) || (a.name || '').localeCompare(b.name || ''));
      setRanks(active as any);
    } catch (error: any) {
      console.error('Error loading ranks:', error);
    }
  };

  const loadExistingStaff = async (staffId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_1_registration')
        .select('*')
        .eq('staff_id', staffId)
        .limit(1)
        .single();

      if (error) throw new Error(error.message || 'Failed to load staff data');

      if (data) {
        const staffData = data as any;
        setFormData({
          employeeNumber: staffData.employee_number || '',
          nationalIdNumber: staffData.national_id_number || '',
          firstName: staffData.first_name || '',
          middleName: staffData.middle_name || '',
          lastName: staffData.last_name || '',
          dateOfBirth: staffData.date_of_birth || '',
          age: '',
          gender: staffData.gender || '',
          nationality: staffData.nationality || '',
          telephoneNumber: staffData.telephone_number || '',
          emailAddress: staffData.email_address || '',
          employmentStartDate: staffData.employment_start_date || '',
          serviceDuration: '',
          departmentId: staffData.fire_dept_id ? staffData.fire_dept_id.toString() : '',
          stationId: staffData.fire_station_id ? staffData.fire_station_id.toString() : '',
          operationalShiftId: staffData.operational_shift_id?.toString() || '',
          rankId: staffData.rank_id?.toString() || '',
          photo: null
        });
        
        // Set photo preview if exists
        if ((staffData as any).photo_url) {
          setPhotoPreview((staffData as any).photo_url);
        }
        
        setIsEditing(true);
        setExistingStaffId(staffId);
        setEmployeeNumberChecked(true);
      }
    } catch (error: any) {
      console.error('Error loading staff:', error);
      setError(error.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const checkEmployeeNumber = async (employeeNumber: string) => {
    if (!employeeNumber.trim() || employeeNumberChecked) return;

    setLoading(true);
    setWarning('');
    try {
      const { data: result, error } = await supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, last_name')
        .eq('employee_number', employeeNumber)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (result) {
        setExistingStaffId((result as any).staff_id);
        setDuplicateEmployee({ id: (result as any).staff_id, name: `${(result as any).first_name} ${(result as any).last_name}` });
        setShowDuplicateModal(true);
      } else {
        setEmployeeNumberChecked(true);
      }
    } catch (error: any) {
      console.error('Error checking employee number:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExisting = async () => {
    if (existingStaffId) {
      await loadExistingStaff(existingStaffId);
      setShowDuplicateModal(false);
      setWarning('');
    }
  };

  const handleContinueNew = () => {
    setWarning('');
    setEmployeeNumberChecked(true);
    setExistingStaffId(null);
    setDuplicateEmployee(null);
    setShowDuplicateModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
    
    if (name === 'employeeNumber') {
      setEmployeeNumberChecked(false);
      setWarning('');
    }
    
    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, photo: file }));
      
      // Create preview URL for the uploaded image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: files && files[0] ? files[0] : value
      }));
    }
  };

  const handleEmployeeNumberBlur = () => {
    if (formData.employeeNumber && !isEditing) {
      checkEmployeeNumber(formData.employeeNumber);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields - Only Department, Station, and Employee Number
    const requiredFields = ['departmentId', 'stationId', 'employeeNumber'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (!formData[field as keyof StaffFormData]) {
        errors[field] = true;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      setError('Please fill in all required fields: Fire Department, Fire Station, and Employee Number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let photoUrl = null;

      if (formData.photo) {
        // New photo uploaded - upload it and get the URL
        const fileExt = formData.photo.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.employeeNumber}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('staff-photos')
          .upload(fileName, formData.photo, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('staff-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      } else if (isEditing && photoPreview) {
        // Editing existing record and no new photo uploaded - preserve existing photo URL
        photoUrl = photoPreview;
      }

      // Resolve operational shift ID, including synthetic options mapped by name
      let resolvedOperationalShiftId: number | null = null;
      if (formData.operationalShiftId) {
        const parsed = parseInt(formData.operationalShiftId, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          resolvedOperationalShiftId = parsed;
        } else {
          const selected = operationalShifts.find(s => String((s as any)?.id ?? '') === formData.operationalShiftId);
          const selectedName = selected?.name;
          if (selectedName) {
            try {
              const { data: row, error: findErr } = await supabase
                .from('02_admin_register_fd2_operational_shifts')
                .select('id')
                .eq('shift_name', selectedName)
                .limit(1)
                .single();
              if (findErr) {
                console.warn('Could not resolve operational shift ID by name:', findErr?.message || findErr);
              }
              resolvedOperationalShiftId = (row as any)?.id ?? null;
              // If not found, create the shift row and use its ID
              if (!resolvedOperationalShiftId) {
                const { data: inserted, error: insertErr } = await supabase
                  .from('02_admin_register_fd2_operational_shifts')
                  .insert({ shift_name: selectedName, active: true })
                  .select('id')
                  .single();
                if (insertErr) {
                  console.warn('Insert of missing operational shift failed:', insertErr?.message || insertErr);
                } else {
                  resolvedOperationalShiftId = (inserted as any)?.id ?? null;
                }
              }
            } catch (e: any) {
              console.warn('Lookup/insert for operational shift ID failed:', e?.message || e);
              resolvedOperationalShiftId = null;
            }
          }
        }
      }

      const payload: any = {
        employee_number: formData.employeeNumber,
        national_id_number: formData.nationalIdNumber || null,
        first_name: formData.firstName || null,
        middle_name: formData.middleName || null,
        last_name: formData.lastName || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        telephone_number: formData.telephoneNumber || null,
        email_address: formData.emailAddress || null,
        employment_start_date: formData.employmentStartDate || null,
        fire_dept_id: parseInt(formData.departmentId),
        fire_station_id: parseInt(formData.stationId),
        operational_shift_id: resolvedOperationalShiftId,
        rank_id: formData.rankId || null,
        ...(photoUrl !== null && { photo_url: photoUrl })
      };

      if (isEditing && existingStaffId) {
        const { data: updated, error } = await supabase
          .from('02_admin_staff_1_registration')
          .update(payload)
          .eq('staff_id', existingStaffId)
          .select()
          .single();
        if (error) throw new Error(error.message || 'Failed to save staff data');
        if (updated) {
          const staffId = existingStaffId;
          
          // Store staff_id and completion flag in sessionStorage
          sessionStorage.setItem('current_staff_id', staffId.toString());
          sessionStorage.setItem('current_employee_number', formData.employeeNumber);
          sessionStorage.setItem('basic_info_completed', 'true');
          
          setSuccess(
          'Staff basic information updated successfully! You can now update other information forms.'
          );
          
          setIsEditing(true);
          setExistingStaffId(staffId);
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('02_admin_staff_1_registration')
          .insert([payload])
          .select()
          .single();
        if (error) throw new Error(error.message || 'Failed to save staff data');
        if (inserted) {
          const staffId = (inserted as any).staff_id as number;
          sessionStorage.setItem('current_staff_id', staffId.toString());
          sessionStorage.setItem('current_employee_number', formData.employeeNumber);
          sessionStorage.setItem('basic_info_completed', 'true');
          setSuccess('Staff basic information saved successfully! You can now proceed to fill other information forms.');
          setIsEditing(true);
          setExistingStaffId(staffId);
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    
    if (!error) {
      setTimeout(() => {
        navigate('/admin/register/staff/address-info');
      }, 1500);
    }
  };

  const handleRefresh = () => {
    setFormData({
      employeeNumber: '',
      nationalIdNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      age: '',
      gender: 'Male',
      nationality: '',
      telephoneNumber: '',
      emailAddress: '',
      employmentStartDate: '',
      serviceDuration: '',
      departmentId: '',
      stationId: '',
      operationalShiftId: '',
      rankId: '',
      photo: null
    });
    setError('');
    setSuccess('');
    setWarning('');
    setFieldErrors({});
    setIsEditing(false);
    setExistingStaffId(null);
    setEmployeeNumberChecked(false);
    setPhotoPreview('');
    
    sessionStorage.removeItem('current_staff_id');
    sessionStorage.removeItem('current_employee_number');
    sessionStorage.removeItem('basic_info_completed');
    
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="staff-basic-info-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="staff-basic-info-title">Staff Basic Information</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                This form captures the fundamental information about each staff member. Complete this form first before proceeding to other information forms. Fields marked with * are required: Fire Department, Fire Station, and Employee Number.
              </Paragraph>
            </Column>
            <ImageColumn>
              {usePageImage && (() => { const { imageUrl, loading } = usePageImage('staff', '/images/Staff.png'); return (
                loading ? (
                  <ImagePlaceholder>Loading image...</ImagePlaceholder>
                ) : imageUrl ? (
                  <HeaderImage src={imageUrl} alt="Staff Registration" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/Staff.png'; }} />
                ) : (
                  <ImagePlaceholder>No image available</ImagePlaceholder>
                )
              ); })()}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <FormSection>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SubTitle>
            {isViewMode ? 'View Basic Information' : (isEditing ? 'Edit Basic Information' : 'New Staff Registration')}
          </SubTitle>
          <RefreshButton onClick={handleRefresh} type="button">
            Refresh Form
          </RefreshButton>
        </div>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {showDuplicateModal && (
          <DuplicateModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setShowDuplicateModal(false); }}>
            <DuplicateModalBox>
              <div style={{ color: '#1177BB', fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>Employee Already Registered</div>
              <div style={{ fontSize: '14px', color: '#333' }}>
                The employee number "{formData.employeeNumber}" already exists{duplicateEmployee?.name ? ` for ${duplicateEmployee.name}` : ''}.
              </div>
              <DuplicateModalActions>
                <LoadButton onClick={handleLoadExisting} type="button">Load Employee</LoadButton>
                <CancelButton onClick={handleContinueNew} type="button" style={{ marginTop: 0, padding: '8px 16px' }}>Continue as New</CancelButton>
              </DuplicateModalActions>
            </DuplicateModalBox>
          </DuplicateModalOverlay>
        )}
        
        <FormContainer onSubmit={handleSubmit}>
          <fieldset disabled={isViewMode} style={{ border: 'none', padding: 0, margin: 0 }}>
          {/* Department, Station, and Employee Number - Three columns on one row */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="departmentId">Select Fire Department *</Label>
              <Select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                required
                $hasError={fieldErrors.departmentId}
                disabled={dataLoading}
              >
                <option value="">{dataLoading ? 'Loading departments...' : 'Select fire department'}</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dept_name}
                  </option>
                ))}
              </Select>
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="stationId">Select Fire Station *</Label>
              <Select
                id="stationId"
                name="stationId"
                value={formData.stationId}
                onChange={handleInputChange}
                required
                $hasError={fieldErrors.stationId}
                disabled={!formData.departmentId || dataLoading}
              >
                <option value="">
                  {!formData.departmentId ? 'Select department first' : 'Select fire station'}
                </option>
                {filteredStations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.fire_station_name}
                  </option>
                ))}
              </Select>
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="employeeNumber">Employee Number *</Label>
              <Input
                type="text"
                id="employeeNumber"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleInputChange}
                onBlur={handleEmployeeNumberBlur}
                required
                placeholder="Enter unique employee number"
                $hasError={fieldErrors.employeeNumber}
                disabled={isEditing}
              />
            </FieldColumn>
          </ThreeColumnRow>

          {/* Name Fields */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                $hasError={fieldErrors.firstName}
              />
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Enter middle name (optional)"
              />
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                $hasError={fieldErrors.lastName}
              />
            </FieldColumn>
          </ThreeColumnRow>

          {/* Telephone Number, Email Address, and Operational Shift */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="telephoneNumber">Telephone Number</Label>
              <Input
                type="tel"
                id="telephoneNumber"
                name="telephoneNumber"
                value={formData.telephoneNumber}
                onChange={handleInputChange}
                placeholder="Enter telephone number"
                maxLength={20}
              />
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                placeholder="Enter email address"
                maxLength={255}
              />
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="operationalShiftId">Operational Shift</Label>
              <Select
                id="operationalShiftId"
                name="operationalShiftId"
                value={formData.operationalShiftId}
                onChange={handleInputChange}
              >
                <option value="">Select operational shift (optional)</option>
                {operationalShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </Select>
            </FieldColumn>
          </ThreeColumnRow>

          {/* National ID, Employee Rank and Staff Photo with Photo Preview */}
          <PhotoSection>
            <PhotoFieldsColumn>
              {/* National ID / Iqama Number */}
              <FieldColumn>
                <Label htmlFor="nationalIdNumber">National ID / Iqama #</Label>
                <Input
                  type="text"
                  id="nationalIdNumber"
                  name="nationalIdNumber"
                  value={formData.nationalIdNumber}
                  onChange={handleInputChange}
                  placeholder="Enter national ID or Iqama number"
                  maxLength={50}
                />
              </FieldColumn>
              
              {/* Employee Rank */}
              <FieldColumn>
                <Label htmlFor="rankId">Employee Rank</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Select
                    id="rankId"
                    name="rankId"
                    value={formData.rankId}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select employee rank (optional)</option>
                    {ranks.map(rank => (
                      <option key={rank.id} value={rank.id}>
                        {rank.name}
                      </option>
                    ))}
                  </Select>
                  <OptionsLink type="button" onClick={() => setShowRankOptionsModal(true)}>Options</OptionsLink>
                </div>
              </FieldColumn>
              
              {/* Staff Photo */}
              <FieldColumn>
                <Label htmlFor="photo">Staff Photo</Label>
                <FileInput
                  type="file"
                  id="photo"
                  name="photo"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </FieldColumn>
            </PhotoFieldsColumn>
            
            {/* Photo Preview Placeholder */}
            <PhotoPlaceholder className={photoPreview ? 'has-image' : ''}>
              {photoPreview ? (
                <img src={photoPreview} alt="Staff photo preview" />
              ) : (
                <PlaceholderText>
                  Photo Preview<br />
                  <small>Upload a photo to see preview</small>
                </PlaceholderText>
              )}
            </PhotoPlaceholder>
          </PhotoSection>

          {/* Modal: Rank Options */}
          <StaffOptionsModal
            isOpen={showRankOptionsModal}
            type="ranks"
            onClose={() => setShowRankOptionsModal(false)}
            onOptionsUpdate={loadRanks}
          />

          {/* Gender, Date of Birth, and Age */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Select>
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="age">Age</Label>
              <Input
                type="text"
                id="age"
                name="age"
                value={formData.age}
                disabled
                placeholder="Calculated from DOB"
              />
            </FieldColumn>
          </ThreeColumnRow>

          {/* Nationality, Employment Start Date, and Service Duration */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="nationality">Nationality</Label>
              <Select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
              >
                <option value="">Select nationality</option>
                {NATIONALITIES.map(nat => (
                  <option key={nat} value={nat}>
                    {nat}
                  </option>
                ))}
              </Select>
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="employmentStartDate">Employment Start Date</Label>
              <Input
                type="date"
                id="employmentStartDate"
                name="employmentStartDate"
                value={formData.employmentStartDate}
                onChange={handleInputChange}
              />
            </FieldColumn>
            <FieldColumn>
              <Label htmlFor="serviceDuration">Active Service Duration</Label>
              <Input
                type="text"
                id="serviceDuration"
                name="serviceDuration"
                value={formData.serviceDuration}
                disabled
                placeholder="Calculated from start date"
              />
            </FieldColumn>
          </ThreeColumnRow>
          </fieldset>

          {/* Submit Buttons */}
          {!isViewMode && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '0px' }}>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Information' : 'Save Information'}
              </SubmitButton>
              <SaveAndNextButton onClick={handleSaveAndNext} type="button" disabled={loading}>
                {loading ? 'Saving...' : 'Save and Next'}
              </SaveAndNextButton>
              {isEditing && (
                <CancelButton onClick={handleRefresh} type="button">
                  Cancel Edit
                </CancelButton>
              )}
            </div>
          )}
        </FormContainer>
      </FormSection>
    </MainContent>
  );
};
