import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  setupVFHStandardPDF,
  addStandardizedLogo,
  addStandardizedHeader,
  createStandardizedFooter
} from '../../../utils/pdfReportHelper';
import { initializePDFFontsSync } from '../../../utils/pdfFonts';
import { isAdmin } from '../../../utils/adminCheck';
import { getPDFLogo } from '../../../utils/companyLogo';

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
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 280px;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  text-align: center;
  flex-direction: column;
  gap: 8px;

  &::before {
    content: '📷';
    font-size: 32px;
    opacity: 0.5;
  }
`;

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const StationListSection = styled.div`
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
  margin-bottom: 15px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
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

const FieldColumn = styled.div<{ $flex?: string }>`
  flex: ${props => props.$flex || '1'};
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
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const PrintButton = styled.button`
  background-color: #FF9900;
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
    background-color: #E68A00;
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

const InfoMessage = styled.div`
  background-color: #e7f3ff;
  color: #0969da;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #b6e3ff;
  margin-bottom: 15px;
  font-size: 14px;
`;

const StationTable = styled.table`
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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

interface FireStationFormData {
  departmentId: string;
  fireStationName: string;
  fireStationCity: string;
  fireStationSuburb: string;
  fireStationStreetName: string;
  fireStationBuildingNumber: string;
  fireStationTelephone: string;
  fireStationContactName: string;
  fireStationContactRank: string;
  fireStationContactEmail: string;
  fireStationContactTelephone: string;
  numberOfStationStaff: string;
  numberOfStationVehicles: string;
  stationPicture: File | null;
}

interface Department {
  id: number;
  dept_name: string;
  dept_picture_url?: string;
  department_type?: string;
  number_of_fire_stations: number;
  number_of_staff: number;
  number_of_fire_vehicles: number;
}

interface DepartmentAllocationInfo {
  departmentId: number;
  departmentName: string;
  stationLimit: number;
  currentStationCount: number;
  remainingStationSlots: number;
  canAddStation: boolean;
  staffLimit: number;
  currentStaffAllocated: number;
  availableStaff: number;
  vehicleLimit: number;
  currentVehiclesAllocated: number;
  availableVehicles: number;
}

interface FireStation {
  id: number;
  department_id: number;
  fire_station_name: string;
  fire_station_city: string;
  fire_station_suburb: string;
  fire_station_street_name: string;
  fire_station_building_number: string;
  fire_station_telephone: string;
  fire_station_contact_name: string;
  fire_station_contact_rank: string;
  fire_station_contact_email: string;
  fire_station_contact_telephone: string;
  number_of_station_staff: number;
  number_of_station_vehicles: number;
  station_image_url: string | null;
  created_at: string;
  department_name?: string;
}

export const RegisterStations: React.FC = () => {
  const navigate = useNavigate();

  const [stationData, setStationData] = useState<FireStationFormData>({
    departmentId: '',
    fireStationName: '',
    fireStationCity: '',
    fireStationSuburb: '',
    fireStationStreetName: '',
    fireStationBuildingNumber: '',
    fireStationTelephone: '',
    fireStationContactName: '',
    fireStationContactRank: '',
    fireStationContactEmail: '',
    fireStationContactTelephone: '',
    numberOfStationStaff: '0',
    numberOfStationVehicles: '0',
    stationPicture: null
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [stations, setStations] = useState<FireStation[]>([]);
  const [departmentAllocationInfo, setDepartmentAllocationInfo] = useState<DepartmentAllocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingStationId, setEditingStationId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<FireStation | null>(null);

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user profile to get display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, full_name, first_name, last_name')
          .eq('user_id', user.id)
          .single();
        
        setCurrentUser({
          ...user,
          profile: profile
        });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Load departments on component mount
  useEffect(() => {
    loadCurrentUser();
    loadDepartments();
    loadStations();
  }, []);

  const editLoadedRef = useRef(false);
  useEffect(() => {
    try {
      if (editLoadedRef.current) return;
      const raw = sessionStorage.getItem('editing_station');
      if (raw) {
        const station = JSON.parse(raw) as FireStation;
        setIsEditing(true);
        setEditingStationId(station.id);
        setStationData({
          departmentId: station.department_id?.toString() || '',
          fireStationName: station.fire_station_name || '',
          fireStationCity: station.fire_station_city || '',
          fireStationSuburb: station.fire_station_suburb || '',
          fireStationStreetName: station.fire_station_street_name || '',
          fireStationBuildingNumber: station.fire_station_building_number || '',
          fireStationTelephone: station.fire_station_telephone || '',
          fireStationContactName: station.fire_station_contact_name || '',
          fireStationContactRank: station.fire_station_contact_rank || '',
          fireStationContactEmail: station.fire_station_contact_email || '',
          fireStationContactTelephone: station.fire_station_contact_telephone || '',
          numberOfStationStaff: String(station.number_of_station_staff ?? '0'),
          numberOfStationVehicles: String(station.number_of_station_vehicles ?? '0'),
          stationPicture: null
        });
        setError('');
        setSuccess('');
        editLoadedRef.current = true;
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isEditing && editingStationId && stationData.departmentId) {
      loadDepartmentAllocationInfo(stationData.departmentId, String(editingStationId));
      try { sessionStorage.removeItem('editing_station'); } catch {}
    }
  }, [isEditing, editingStationId, stationData.departmentId]);

  // Load department allocation info when department is selected
  useEffect(() => {
    if (stationData.departmentId) {
      loadDepartmentAllocationInfo(stationData.departmentId);
    } else {
      setDepartmentAllocationInfo(null);
    }
  }, [stationData.departmentId]);

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('id, dept_name, dept_picture_url, dept_type, number_of_fire_stations, number_of_staff, number_of_fire_vehicles')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError(error.message || 'Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const loadDepartmentAllocationInfo = async (departmentId: string, excludeStationId?: string) => {
    try {
      const deptId = parseInt(departmentId);
      const dept = departments.find(d => d.id === deptId || d.id.toString() === departmentId);
      if (!dept) {
        setDepartmentAllocationInfo(null);
        return;
      }

      const stationLimit = Number(dept.number_of_fire_stations || 0);
      const staffLimit = Number(dept.number_of_staff || 0);
      const vehicleLimit = Number(dept.number_of_fire_vehicles || 0);

      const deptStations = stations.filter(s => s.department_id === deptId && (!excludeStationId || s.id.toString() !== excludeStationId));
      const currentStationCount = deptStations.length;
      const currentStaffAllocated = deptStations.reduce((sum, s) => sum + Number(s.number_of_station_staff || 0), 0);
      const currentVehiclesAllocated = deptStations.reduce((sum, s) => sum + Number(s.number_of_station_vehicles || 0), 0);

      const remainingStationSlots = Math.max(0, stationLimit - currentStationCount);
      const availableStaff = Math.max(0, staffLimit - currentStaffAllocated);
      const availableVehicles = Math.max(0, vehicleLimit - currentVehiclesAllocated);

      const info: DepartmentAllocationInfo = {
        departmentId: deptId,
        departmentName: dept.dept_name,
        stationLimit,
        currentStationCount,
        remainingStationSlots,
        canAddStation: currentStationCount < stationLimit,
        staffLimit,
        currentStaffAllocated,
        availableStaff,
        vehicleLimit,
        currentVehiclesAllocated,
        availableVehicles
      };
      setDepartmentAllocationInfo(info);
    } catch (error) {
      console.error('Allocation info computation failed:', error);
      setDepartmentAllocationInfo(null);
    }
  };

  const loadStations = async () => {
    setStationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd3_stations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStations(data || []);
    } catch (error: any) {
      console.error('Error loading stations:', error);
      setError(error.message || 'Failed to load fire stations');
    } finally {
      setStationsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields (only departmentId and fireStationName)
    const requiredFields = ['departmentId', 'fireStationName'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (!stationData[field as keyof FireStationFormData]) {
        errors[field] = true;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      setError('Please fill in all required fields.');
      return;
    }

    // Check if department can add more stations (only for new stations, not edits)
    if (!isEditing && departmentAllocationInfo && !departmentAllocationInfo.canAddStation) {
      setError('Number of Fire Station limit reached. If you need to add more, then you have to update the indicated number of fire stations in the \'Fire Department Register\' form.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let stationPictureData = null;
      let fileName = null;

      // Handle file upload if a picture is selected
      if (stationData.stationPicture) {
        stationPictureData = await fileToBase64(stationData.stationPicture);
        fileName = stationData.stationPicture.name;
      }

      if (isEditing && editingStationId) {
        const payload: any = {
          department_id: parseInt(stationData.departmentId),
          fire_station_name: stationData.fireStationName,
          fire_station_city: stationData.fireStationCity,
          fire_station_suburb: stationData.fireStationSuburb,
          fire_station_street_name: stationData.fireStationStreetName,
          fire_station_building_number: stationData.fireStationBuildingNumber,
          fire_station_telephone: stationData.fireStationTelephone,
          fire_station_contact_name: stationData.fireStationContactName,
          fire_station_contact_rank: stationData.fireStationContactRank,
          fire_station_contact_email: stationData.fireStationContactEmail,
          fire_station_contact_telephone: stationData.fireStationContactTelephone,
          number_of_station_staff: parseInt(stationData.numberOfStationStaff || '0'),
          number_of_station_vehicles: parseInt(stationData.numberOfStationVehicles || '0'),
          station_image_url: null
        };
        const { data: updated, error } = await supabase
          .from('02_admin_register_fd3_stations')
          .update(payload)
          .eq('id', editingStationId)
          .select()
          .single();
        if (error) throw new Error(error.message || 'Failed to update fire station');
        if (updated) {
          let successMessage = 'Fire station updated successfully!';
          let menuItemMessage = '';
          
          // Create menu item if user is admin and updating station details
          try {
            // Get the updated station ID from response or use existing
            const stationId = editingStationId || (updated as any)?.id;
            if (stationId && stationData.fireStationName) {
              const menuItemResult = await createMenuItem(
                stationId, 
                stationData.fireStationName, 
                parseInt(stationData.departmentId)
              );
              if (menuItemResult.success) {
                menuItemMessage = ` ${menuItemResult.message}`;
              }
            }
          } catch (menuError: any) {
            console.warn('Menu item creation failed:', menuError.message);
            // Don't fail the entire update if menu creation fails, just warn
            menuItemMessage = ' (Note: Menu item creation failed, but station was updated successfully)';
          }
          
          setSuccess(successMessage + menuItemMessage);
          setIsEditing(false);
          setEditingStationId(null);
        } else {
          throw new Error('Update failed');
        }
      } else {
        const payload: any = {
          department_id: parseInt(stationData.departmentId),
          fire_station_name: stationData.fireStationName,
          fire_station_city: stationData.fireStationCity,
          fire_station_suburb: stationData.fireStationSuburb,
          fire_station_street_name: stationData.fireStationStreetName,
          fire_station_building_number: stationData.fireStationBuildingNumber,
          fire_station_telephone: stationData.fireStationTelephone,
          fire_station_contact_name: stationData.fireStationContactName,
          fire_station_contact_rank: stationData.fireStationContactRank,
          fire_station_contact_email: stationData.fireStationContactEmail,
          fire_station_contact_telephone: stationData.fireStationContactTelephone,
          number_of_station_staff: parseInt(stationData.numberOfStationStaff || '0'),
          number_of_station_vehicles: parseInt(stationData.numberOfStationVehicles || '0'),
          station_image_url: null
        };
        const { data: inserted, error } = await supabase
          .from('02_admin_register_fd3_stations')
          .insert([payload])
          .select()
          .single();
        if (error) throw new Error(error.message || 'Failed to register fire station');
        if (inserted) {
          setSuccess('Fire station registered successfully!');
        } else {
          throw new Error('Registration failed');
        }
      }

      // Reset file input only, keep department selection
      const currentDepartmentId = stationData.departmentId;
      setStationData(prev => ({
        ...prev,
        fireStationName: '',
        fireStationCity: '',
        fireStationSuburb: '',
        fireStationStreetName: '',
        fireStationBuildingNumber: '',
        fireStationTelephone: '',
        fireStationContactName: '',
        fireStationContactRank: '',
        fireStationContactEmail: '',
        fireStationContactTelephone: '',
        numberOfStationStaff: '0',
        numberOfStationVehicles: '0',
        stationPicture: null
      }));
      
      // Reset file input
      const fileInput = document.getElementById('stationPicture') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh stations list and department info
      await loadStations();
      if (currentDepartmentId) {
        await loadDepartmentAllocationInfo(currentDepartmentId);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration');
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

  // Helper function to convert image URL to base64
  const urlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Async function to convert logo URL to base64 for PDF
  const convertLogoToBase64 = async (logoUrl: string | null | undefined): Promise<string | null> => {
    if (!logoUrl) return null;
    
    try {
      // If it's already a data URL (base64), return as is
      if (logoUrl.startsWith('data:')) {
        return logoUrl;
      }
      
      // Convert URL to base64
      return await urlToBase64(logoUrl);
    } catch (error) {
      console.warn('Failed to convert logo to base64:', error);
      return null;
    }
  };

  // Function to create menu item for fire station
  const createMenuItem = async (fireStationId: number, stationName: string, departmentId: number) => {
    try {
      // Check if user is admin
      const isAdminUser = await isAdmin();
      if (!isAdminUser) {
        throw new Error('Access denied. Administrator privileges required to create menu items.');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current user's staff record
      const { data: staffData, error: staffError } = await supabase
        .from('staff_basic_info')
        .select('staff_id')
        .eq('user_id', user.id)
        .single();

      if (staffError || !staffData) {
        throw new Error('Staff record not found for current user');
      }

      // Check if menu item already exists for this fire station
      const { data: existingMenuItem } = await supabase
        .from('user_fire_station_menu_items')
        .select('id')
        .eq('fire_station_id', fireStationId)
        .eq('menu_item_name', stationName)
        .eq('is_active', true)
        .single();

      if (existingMenuItem) {
        // Menu item already exists, return success without creating duplicate
        return { success: true, message: 'Menu item already exists for this fire station' };
      }

      // Create menu item
      const { data: menuItemData, error: menuError } = await supabase
        .from('user_fire_station_menu_items')
        .insert({
          fire_station_id: fireStationId,
          menu_item_name: stationName,
          created_by_user_id: user.id,
          created_by_staff_id: staffData.staff_id,
          department_id: departmentId,
          is_active: true,
          display_order: 0
        })
        .select()
        .single();

      if (menuError) {
        throw new Error(`Failed to create menu item: ${menuError.message}`);
      }

      return { 
        success: true, 
        message: `Menu item "${stationName}" created successfully!`,
        menuItemId: menuItemData.id
      };
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
    
    setStationData(prev => ({
      ...prev,
      [name]: files && files[0] ? files[0] : value
    }));
  };

  const handleRefresh = () => {
    setStationData({
      departmentId: '',
      fireStationName: '',
      fireStationCity: '',
      fireStationSuburb: '',
      fireStationStreetName: '',
      fireStationBuildingNumber: '',
      fireStationTelephone: '',
      fireStationContactName: '',
      fireStationContactRank: '',
      fireStationContactEmail: '',
      fireStationContactTelephone: '',
      numberOfStationStaff: '0',
      numberOfStationVehicles: '0',
      stationPicture: null
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
    setDepartmentAllocationInfo(null);
    setIsEditing(false);
    setEditingStationId(null);
    
    // Reset file input
    const fileInput = document.getElementById('stationPicture') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const editStation = (station: FireStation) => {
    setIsEditing(true);
    setEditingStationId(station.id);
    setStationData({
      departmentId: station.department_id.toString(),
      fireStationName: station.fire_station_name,
      fireStationCity: station.fire_station_city,
      fireStationSuburb: station.fire_station_suburb,
      fireStationStreetName: station.fire_station_street_name,
      fireStationBuildingNumber: station.fire_station_building_number,
      fireStationTelephone: station.fire_station_telephone,
      fireStationContactName: station.fire_station_contact_name,
      fireStationContactRank: station.fire_station_contact_rank,
      fireStationContactEmail: station.fire_station_contact_email,
      fireStationContactTelephone: station.fire_station_contact_telephone,
      numberOfStationStaff: (station.number_of_station_staff || 0).toString(),
      numberOfStationVehicles: (station.number_of_station_vehicles || 0).toString(),
      stationPicture: null
    });
    setError('');
    setSuccess('');
    
    // Load allocation info for the selected department, excluding current station
    loadDepartmentAllocationInfo(station.department_id.toString(), station.id.toString());
  };

  const deleteStation = async (stationId: number, stationName: string) => {

    setDeletingIds(prev => new Set(prev).add(stationId));
    try {
      const { error } = await supabase
        .from('02_admin_register_fd3_stations')
        .delete()
        .eq('id', stationId);
      if (error) throw new Error(error.message || 'Failed to delete fire station');
      {
        setSuccess('Fire station deleted successfully!');
        await loadStations();
        // Refresh department info if we have a selected department
        if (stationData.departmentId) {
          await loadDepartmentAllocationInfo(stationData.departmentId);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete fire station');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(stationId);
        return newSet;
      });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingStationId(null);
    handleRefresh();
  };

  const generatePDF = async () => {
    if (stations.length === 0) {
      setError('No fire stations to print. Please register some stations first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Get department information - try multiple approaches
      let departmentName = 'All Fire Departments';
      let departmentType = '';
      let departmentLogo = null;
      
      // Check if we have a selected department
      if (stationData.departmentId) {
        const selectedDept = departments.find(dept => dept.id.toString() === stationData.departmentId);
        if (selectedDept) {
          departmentName = selectedDept.dept_name;
          // Support both API shapes: department_type and dept_type
          departmentType = (selectedDept as any).department_type || (selectedDept as any).dept_type || '';
          departmentLogo = selectedDept.dept_picture_url;
        }
      }
      // If no department selected, check if all stations belong to same department
      else if (stations.length > 0) {
        const uniqueDepartments = [...new Set(stations.map(s => s.department_id))];
        if (uniqueDepartments.length === 1) {
          // All stations belong to same department
          const deptId = uniqueDepartments[0];
          const dept = departments.find(d => d.id === deptId || d.id.toString() === deptId.toString());
          if (dept) {
            departmentName = dept.dept_name;
            // Support both API shapes: department_type and dept_type
            departmentType = (dept as any).department_type || (dept as any).dept_type || '';
            departmentLogo = dept.dept_picture_url;
          }
      }
      }

      // Convert logo with DACO company logo fallback when department logo is missing
      // Prefer centralized logo helper for consistency across reports
      const departmentLogoBase64 = await getPDFLogo(departmentLogo || undefined);

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      // Initialize fonts using reliable built-in Helvetica to avoid unicode cmap errors
      try {
        initializePDFFontsSync(doc);
      } catch (fontError) {
        console.warn('PDF font initialization failed, continuing with default font:', fontError);
      }
      
      // Calculate totals for summary
      const totalStaff = stations.reduce((sum, station) => sum + (station.number_of_station_staff || 0), 0);
      const totalVehicles = stations.reduce((sum, station) => sum + (station.number_of_station_vehicles || 0), 0);
      const summaryText = `Summary: Total Fire Stations: ${stations.length}, Total Staff Allocated: ${totalStaff}, Total Vehicles Allocated: ${totalVehicles}`;
      
      // Setup VFH A4 standard PDF with logo, header, and get table configuration
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogoBase64,
        data: {
          departmentName: departmentName,
          departmentType: departmentType,
          reportTitle: "Registered Fire Stations Report",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });

      // Prepare table data sorted by Station Name
      const sortedForPdf = [...stations].sort((a, b) =>
        (a.fire_station_name || '').localeCompare(b.fire_station_name || '')
      );
      const tableData = sortedForPdf.map(station => [
        station.fire_station_name || '-',
        station.fire_station_city || '-',
        // Split address into two lines: Suburb on line 1, Street/Building on line 2
        [
          station.fire_station_suburb || '',
          [
            station.fire_station_building_number || '',
            station.fire_station_street_name || ''
          ].filter(Boolean).join(' ')
        ].filter(Boolean).join('\n') || '-',
        (station.number_of_station_staff || 0).toString(),
        (station.number_of_station_vehicles || 0).toString(),
        station.fire_station_telephone || '-',
        // Split contact into two lines: Name on line 1, Rank on line 2
        [
          station.fire_station_contact_name || '',
          station.fire_station_contact_rank || ''
        ].filter(Boolean).join('\n') || '-',
        station.fire_station_contact_email || '-',
        station.fire_station_contact_telephone || '-'
      ]);

      // Create table using VFH A4 standard configuration
      try {
        autoTable(doc, {
          head: [[
            'Station Name',
            'City',
            'Address',
            'Staff',
            'Vehicles',
            'Station Phone',
            'Contact Person',
            'Contact Email',
            'Contact Phone'
          ]],
          body: tableData,
          startY: vfhSetup.tableStartY,
          ...vfhSetup.tableConfig,
          didDrawPage: (pageData: any) => {
            // Get total pages after table is generated
            const totalPages = doc.getNumberOfPages();
            
            // Add header on each page (skip first page as it's already added)
            if (pageData.pageNumber > 1) {
              if (departmentLogoBase64) {
                addStandardizedLogo({ logoBase64: departmentLogoBase64, doc });
              }
              addStandardizedHeader({ 
                doc, 
                data: {
                  departmentName: departmentName,
                  departmentType: departmentType,
                  reportTitle: "Registered Fire Stations Report",
                  summaryText: summaryText,
                  currentUser: currentUser
                }
              });
            }
            
            // Add footer on every page
            createStandardizedFooter({ 
              doc, 
              data: {
                departmentName: departmentName,
                departmentType: departmentType,
                reportTitle: "Registered Fire Stations Report",
                summaryText: summaryText,
                currentUser: currentUser
              }, 
              pageData, 
              totalPages 
            });
          }
        });
      } catch (tableError) {
        console.error('Error generating PDF table:', tableError);
        throw tableError;
      }
      // Generate filename and save to sessionStorage
      // Prefer direct Blob URL navigation to avoid sessionStorage quota limits
      try {
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        try {
          sessionStorage.setItem('pdf_source_section', 'Admin - Register');
          sessionStorage.setItem('pdf_source_path', '/admin/register/stations/process');
        } catch {}
        // Preserve left menu context while in PDF Viewer
        sessionStorage.setItem('pdf_source_section', '/admin/register/stations');
        sessionStorage.setItem('pdf_source_path', '/admin/register/stations/process');
        navigate(`/pdf-viewer/${encodeURIComponent(blobUrl)}`);
        setSuccess(`PDF report generated successfully! (${stations.length} stations included)`);
        return;
      } catch (blobError) {
        console.error('Error generating PDF blob:', blobError);
        // As a last resort, attempt data URI storage if blob creation fails
        try {
          const pdfDataUri = doc.output('datauristring');
          const fileName = 'registered_fire_stations_report.pdf';
          const pdfKey = `pdf_${fileName}`;
          clearOldPDFsFromStorage();
          sessionStorage.setItem(pdfKey, pdfDataUri);
          // Preserve left menu context while in PDF Viewer
          sessionStorage.setItem('pdf_source_section', '/admin/register/stations');
          sessionStorage.setItem('pdf_source_path', '/admin/register/stations/process');
          navigate(`/pdf-viewer/${pdfKey}`);
          setSuccess(`PDF report generated successfully! (${stations.length} stations included)`);
          return;
        } catch (fallbackError) {
          console.error('Failed to generate PDF via blob or data URI:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="stations-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="stations-title">
                Register Your Fire Stations Here
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Station Registration system provides comprehensive registration
                and management of Emergency Service Fire Stations, facilities, and
                operational locations within the King Fahd International Airport
                Emergency Services network.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/FireStation2.jpg" alt="Station Registration" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Fire Station Registration Form */}
      <Section aria-labelledby="station-registration-form">
        <FormSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SubTitle id="station-registration-form">
              {isEditing ? 'Edit Fire Station' : 'Fire Station Registration Form'}
            </SubTitle>
            <div>
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
          
          {departmentAllocationInfo && (
            <InfoMessage>
              Department: <strong>{departmentAllocationInfo.departmentName}</strong><br/>
              Stations - Limit: <strong>{departmentAllocationInfo.stationLimit}</strong> | 
              Current: <strong>{departmentAllocationInfo.currentStationCount}</strong> | 
              Remaining: <strong>{departmentAllocationInfo.remainingStationSlots}</strong><br/>
              Staff - Limit: <strong>{departmentAllocationInfo.staffLimit}</strong> | 
              Allocated: <strong>{departmentAllocationInfo.currentStaffAllocated}</strong> | 
              Available: <strong>{departmentAllocationInfo.availableStaff}</strong><br/>
              Vehicles - Limit: <strong>{departmentAllocationInfo.vehicleLimit}</strong> | 
              Allocated: <strong>{departmentAllocationInfo.currentVehiclesAllocated}</strong> | 
              Available: <strong>{departmentAllocationInfo.availableVehicles}</strong>
            </InfoMessage>
          )}
          
          <FormContainer onSubmit={handleSubmit}>
            {/* Department Selection */}
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="departmentId">Select Department *</Label>
                <Select
                  id="departmentId"
                  name="departmentId"
                  value={stationData.departmentId}
                  onChange={handleInputChange}
                  required
                  $hasError={fieldErrors.departmentId}
                  disabled={departmentsLoading}
                >
                  <option value="">{departmentsLoading ? 'Loading departments...' : 'Select a department'}</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.dept_name} (Limit: {dept.number_of_fire_stations} stations)
                    </option>
                  ))}
                </Select>
              </FieldColumn>
            </FieldRow>

            {/* Station Basic Information */}
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="fireStationName">Fire Station Name *</Label>
                <Input
                  type="text"
                  id="fireStationName"
                  name="fireStationName"
                  value={stationData.fireStationName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter fire station name"
                  $hasError={fieldErrors.fireStationName}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationCity">Fire Station City</Label>
                <Input
                  type="text"
                  id="fireStationCity"
                  name="fireStationCity"
                  value={stationData.fireStationCity}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  $hasError={fieldErrors.fireStationCity}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationSuburb">Fire Station Suburb</Label>
                <Input
                  type="text"
                  id="fireStationSuburb"
                  name="fireStationSuburb"
                  value={stationData.fireStationSuburb}
                  onChange={handleInputChange}
                  placeholder="Enter suburb"
                  $hasError={fieldErrors.fireStationSuburb}
                />
              </FieldColumn>
            </ThreeColumnRow>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="fireStationStreetName">Fire Station Street Name</Label>
                <Input
                  type="text"
                  id="fireStationStreetName"
                  name="fireStationStreetName"
                  value={stationData.fireStationStreetName}
                  onChange={handleInputChange}
                  placeholder="Enter street name"
                  $hasError={fieldErrors.fireStationStreetName}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationBuildingNumber">Fire Station Street/Building #</Label>
                <Input
                  type="text"
                  id="fireStationBuildingNumber"
                  name="fireStationBuildingNumber"
                  value={stationData.fireStationBuildingNumber}
                  onChange={handleInputChange}
                  placeholder="Enter building number"
                  $hasError={fieldErrors.fireStationBuildingNumber}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationTelephone">Fire Station Telephone #</Label>
                <Input
                  type="tel"
                  id="fireStationTelephone"
                  name="fireStationTelephone"
                  value={stationData.fireStationTelephone}
                  onChange={handleInputChange}
                  placeholder="Enter telephone number"
                  $hasError={fieldErrors.fireStationTelephone}
                />
              </FieldColumn>
            </ThreeColumnRow>

            {/* Contact Information */}
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="fireStationContactName">Fire Station Contact Name</Label>
                <Input
                  type="text"
                  id="fireStationContactName"
                  name="fireStationContactName"
                  value={stationData.fireStationContactName}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                  $hasError={fieldErrors.fireStationContactName}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationContactRank">Fire Station Contact Rank</Label>
                <Input
                  type="text"
                  id="fireStationContactRank"
                  name="fireStationContactRank"
                  value={stationData.fireStationContactRank}
                  onChange={handleInputChange}
                  placeholder="Enter contact rank"
                  $hasError={fieldErrors.fireStationContactRank}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationContactEmail">Fire Station Contact Email</Label>
                <Input
                  type="email"
                  id="fireStationContactEmail"
                  name="fireStationContactEmail"
                  value={stationData.fireStationContactEmail}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  $hasError={fieldErrors.fireStationContactEmail}
                />
              </FieldColumn>
            </ThreeColumnRow>

            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="fireStationContactTelephone">Fire Station Contact Telephone #</Label>
                <Input
                  type="tel"
                  id="fireStationContactTelephone"
                  name="fireStationContactTelephone"
                  value={stationData.fireStationContactTelephone}
                  onChange={handleInputChange}
                  placeholder="Enter contact telephone number"
                  $hasError={fieldErrors.fireStationContactTelephone}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="numberOfStationStaff">Number of Station Staff</Label>
                <Input
                  type="number"
                  id="numberOfStationStaff"
                  name="numberOfStationStaff"
                  value={stationData.numberOfStationStaff}
                  onChange={handleInputChange}
                  placeholder="Enter number of staff"
                  min="0"
                  max={departmentAllocationInfo?.availableStaff || 999}
                  $hasError={fieldErrors.numberOfStationStaff}
                />
                {departmentAllocationInfo && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Available: {departmentAllocationInfo.availableStaff} staff
                  </small>
                )}
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="numberOfStationVehicles">Number of Station Vehicles</Label>
                <Input
                  type="number"
                  id="numberOfStationVehicles"
                  name="numberOfStationVehicles"
                  value={stationData.numberOfStationVehicles}
                  onChange={handleInputChange}
                  placeholder="Enter number of vehicles"
                  min="0"
                  max={departmentAllocationInfo?.availableVehicles || 999}
                  $hasError={fieldErrors.numberOfStationVehicles}
                />
                {departmentAllocationInfo && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Available: {departmentAllocationInfo.availableVehicles} vehicles
                  </small>
                )}
              </FieldColumn>
            </ThreeColumnRow>
            
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="stationPicture">Station Picture Upload</Label>
                <FileInput
                  type="file"
                  id="stationPicture"
                  name="stationPicture"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </FieldColumn>
            </FieldRow>
            
            <div style={{ marginTop: '20px' }}>
              <SubmitButton 
                type="submit" 
                disabled={loading || (!isEditing && departmentAllocationInfo && !departmentAllocationInfo.canAddStation)}
              >
                {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Fire Station' : 'Register Fire Station')}
              </SubmitButton>
            </div>
          </FormContainer>
        </FormSection>
      </Section>

      


      {showDeleteModal && stationToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ background: '#fff', borderRadius: '10px', width: '92%', maxWidth: '560px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '22px' }}>
            <div style={{ color: '#1177BB', fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>Delete Fire Station</div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              Are you sure you want to delete "{stationToDelete.fire_station_name}"?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <DeleteButton onClick={() => { setShowDeleteModal(false); deleteStation(stationToDelete.id, stationToDelete.fire_station_name); }}>Delete</DeleteButton>
              <CancelButton onClick={() => setShowDeleteModal(false)}>Cancel</CancelButton>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
};
  // Remove previously stored PDFs to free sessionStorage space
  const clearOldPDFsFromStorage = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i) || '';
        if (key.startsWith('pdf_') || key.startsWith('pdf_certificate_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch (err) {
      console.warn('Failed clearing old PDFs from sessionStorage:', err);
    }
  };
