import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { usePageImage } from '../../../hooks/usePageImage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../utils/companyLogo';

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

// Removed local convertLogoToBase64 in favor of centralized getPDFLogo helper

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
  height: 160px;
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

const StaffListSection = styled.div`
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

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  min-height: 80px;
  resize: vertical;
  
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

const StaffTable = styled.table`
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

const PdfViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const PdfViewerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

const PdfTitle = styled.h3`
  color: #1177BB;
  margin: 0;
  font-size: 1.2rem;
`;

const PdfActions = styled.div`
  display: flex;
  gap: 10px;
`;

const PdfActionButton = styled.button`
  background: #1177BB;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #0f5a8a;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  &[style*="background: #dc3545"]:hover {
    background: #c82333 !important;
  }
`;

const PdfViewer = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
`;

// Expiry Date Notification Components
const ExpiryNotificationWrapper = styled.div`
  position: relative;
`;

const ExpiryNotification = styled.div<{ $status: 'warning' | 'expired' }>`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${props => props.$status === 'expired' ? '#dc3545' : '#ffc107'};
  color: ${props => props.$status === 'expired' ? 'white' : '#212529'};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transform: translateX(100%);
  
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 6px solid ${props => props.$status === 'expired' ? '#dc3545' : '#ffc107'};
  }
`;

const ExpiryDateInput = styled(Input)<{ $expiryStatus?: 'warning' | 'expired' | 'valid' | 'none' }>`
  ${props => {
    if (props.$expiryStatus === 'expired') {
      return `
        border-color: #dc3545;
        background-color: #fff5f5;
        box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
      `;
    } else if (props.$expiryStatus === 'warning') {
      return `
        border-color: #ffc107;
        background-color: #fffdf5;
        box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25);
      `;
    }
    return '';
  }}
`;



interface StaffFormData {
  departmentId: string;
  fireStationId: string;
  staffIdNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  hireDate: string;
  positionId: string;
  rankId: string;
  employmentStatus: string;
  certificationDetails: string;
  certificationExpiry: string;
  trainingRecords: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationshipId: string;
  staffPicture: File | null;
  // New expiry date fields
  idIqamaExpiryDate: string;
  driversLicenseExpiryDate: string;
  airsideIdExpiryDate: string;
  airsidePermitExpiryDate: string;
}

interface Department {
  id: number;
  dept_name: string;
  dept_picture_url?: string;
  department_type?: string;
}

interface Position {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

interface Rank {
  id: number;
  rank_name: string;
  rank_level?: string;
  rank_description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EmergencyContactRelationship {
  id: number;
  name: string;
  active: boolean;
}

interface FireStation {
  id: number;
  department_id: number;
  fire_station_name: string;
  fire_station_city?: string;
  fire_station_suburb?: string;
  fire_station_street_name?: string;
  fire_station_building_number?: string;
  fire_station_telephone?: string;
  fire_station_contact_name?: string;
  fire_station_contact_rank?: string;
  fire_station_contact_email?: string;
  fire_station_contact_telephone?: string;
  station_image_url?: string;
  created_at?: string;
  updated_at?: string;
  number_of_station_staff?: number;
  number_of_station_vehicles?: number;
}

interface DropdownOptions {
  positions: Position[];
  ranks: Rank[];
  relationships: EmergencyContactRelationship[];
  fireStations: FireStation[];
}

interface StaffMember {
  id: number;
  department_id: number;
  staff_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone_number: string;
  address: string;
  hire_date: string;
  position: string;
  rank: string;
  employment_status: string;
  certification_details: string;
  certification_expiry: string;
  training_records: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  staff_image_url: string | null;
  created_at: string;
  department_name?: string;
}

export const RegisterStaff: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-staff', '/images/EMSA-Introduction.png');

  const [staffData, setStaffData] = useState<StaffFormData>({
    departmentId: '',
    fireStationId: '',
    staffIdNumber: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phoneNumber: '',
    address: '',
    hireDate: '',
    positionId: '',
    rankId: '',
    employmentStatus: 'Active',
    certificationDetails: '',
    certificationExpiry: '',
    trainingRecords: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationshipId: '',
    staffPicture: null,
    // New expiry date fields
    idIqamaExpiryDate: '',
    driversLicenseExpiryDate: '',
    airsideIdExpiryDate: '',
    airsidePermitExpiryDate: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    positions: [],
    ranks: [],
    relationships: [],
    fireStations: []
  });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // Bulk import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ total: number; success: number; failed: number }>({ total: 0, success: 0, failed: 0 });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');

  // Calculate expiry status for a given date
  const calculateExpiryStatus = (dateString: string): { status: 'warning' | 'expired' | 'valid' | 'none', message: string } => {
    if (!dateString) return { status: 'none', message: '' };
    
    const currentDate = new Date('2025-10-08'); // Current reference date
    const expiryDate = new Date(dateString);
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return {
        status: 'expired',
        message: `Expired ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`
      };
    } else if (daysDiff <= 30) {
      return {
        status: 'warning',
        message: `Expires in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`
      };
    } else {
      return {
        status: 'valid',
        message: `Expires in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`
      };
    }
  };

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

  // Load data on component mount
  useEffect(() => {
    loadCurrentUser();
    loadDepartments();
    loadDropdownOptions();
    loadStaff();
  }, []);

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-departments', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load departments');
      }

      if (data?.data?.departments) {
        setDepartments(data.data.departments);
      }
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError(error.message || 'Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };



  const loadDropdownOptions = async () => {
    console.log('Starting to load dropdown options...'); // Debug log
    setDropdownLoading(true);
    try {
      console.log('Calling dropdown-options-crud edge function...'); // Debug log
      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'GET'
      });

      console.log('Edge function response:', { data, error }); // Debug log

      if (error) {
        console.error('Edge function error:', error); // Debug log
        throw new Error(error.message || 'Failed to load dropdown options');
      }

      console.log('Dropdown options response:', data); // Debug log

      if (data) {
        setDropdownOptions({
          positions: data.positions || [],
          ranks: data.ranks || [],
          relationships: data.relationships || [],
          fireStations: data.fireStations || []
        });
        console.log('Fire stations loaded:', data.fireStations?.length || 0); // Debug log
        console.log('Dropdown options set successfully'); // Debug log
      } else {
        console.log('No data received from edge function'); // Debug log
      }
    } catch (error: any) {
      console.error('Error loading dropdown options:', error);
      setError(error.message || 'Failed to load dropdown options');
    } finally {
      console.log('Finished loading dropdown options'); // Debug log
      setDropdownLoading(false);
    }
  };

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      console.log('Loading staff from 02_admin_staff_1_registration...');
      
      // Fetch basic info
      const { data: basicInfo, error: basicError } = await supabase
        .from('02_admin_staff_1_registration')
        .select('*')
        .order('created_at', { ascending: false });

      if (basicError) throw basicError;

      // Fetch emergency contacts for the list view
      // We fetch all for now, or we could fetch on demand. Fetching all might be heavy but for < 1000 staff it's fine.
      const { data: contacts, error: contactsError } = await supabase
        .from('02_admin_staff_7_emergency_contacts')
        .select('*');
        
      if (contactsError) console.error('Error loading contacts:', contactsError);

      // Fetch departments for name mapping (if not already loaded, but we have them in state, though state might not be ready if called sequentially)
      // Actually we can just use the departments state if it's populated, or join logic here.
      // But loadDepartments runs on mount. 
      // Let's do a quick fetch to be safe or map later.
      
      const { data: depts } = await supabase.from('emergency_departments').select('id, dept_name');
      const deptMap = (depts || []).reduce((acc: any, d: any) => ({ ...acc, [d.id]: d.dept_name }), {});
      
      const contactMap = (contacts || []).reduce((acc: any, c: any) => {
        // Assume one contact per staff for the list view, or take the first one
        if (!acc[c.staff_id]) acc[c.staff_id] = c;
        return acc;
      }, {});

      const mappedStaff: StaffMember[] = (basicInfo || []).map((item: any) => ({
        id: item.staff_id, // Map staff_id to id for the frontend interface
        department_id: item.fire_dept_id,
        staff_id: item.employee_number || '', // This is the string ID like "S123"
        first_name: item.first_name,
        last_name: item.last_name,
        id_number: item.national_id_number,
        email: item.email_address,
        phone_number: item.telephone_number,
        address: '', // Will load on edit
        hire_date: item.employment_start_date,
        position: '', // Not in this table?
        rank: item.rank_name || '', // Use the text column if available
        rank_id: item.rank_id,
        employment_status: 'Active', // Default or need a column? 
        certification_details: '',
        certification_expiry: '',
        training_records: '',
        emergency_contact_name: contactMap[item.staff_id]?.contact_name || '',
        emergency_contact_phone: contactMap[item.staff_id]?.phone_number || '',
        emergency_contact_relationship: contactMap[item.staff_id]?.relationship || '',
        staff_image_url: item.photo_url,
        created_at: item.created_at,
        department_name: deptMap[item.fire_dept_id] || ''
      }));

      setStaff(mappedStaff);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      setError(error.message || 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['departmentId', 'staffIdNumber', 'firstName', 'lastName'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (!staffData[field as keyof StaffFormData]) {
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
      let photoUrl = null;

      // Handle file upload if a picture is selected
      if (staffData.staffPicture) {
        const file = staffData.staffPicture;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('staff-images')
          .upload(filePath, file);

        if (uploadError) {
           console.error('Upload error', uploadError);
           // Continue without image or throw?
        } else if (uploadData) {
           const { data: { publicUrl } } = supabase.storage
             .from('staff-images')
             .getPublicUrl(filePath);
           photoUrl = publicUrl;
        }
      }

      // Prepare basic info payload
      const basicPayload = {
        employee_number: staffData.staffIdNumber,
        first_name: staffData.firstName,
        last_name: staffData.lastName,
        fire_dept_id: parseInt(staffData.departmentId),
        fire_station_id: staffData.fireStationId ? parseInt(staffData.fireStationId) : null,
        telephone_number: staffData.phoneNumber,
        email_address: staffData.email,
        national_id_number: staffData.idNumber,
        employment_start_date: staffData.hireDate || null,
        rank_id: staffData.rankId ? parseInt(staffData.rankId) : null,
        // photo_url: photoUrl // Only update if new one? Or keep old?
      };
      
      if (photoUrl) {
        (basicPayload as any).photo_url = photoUrl;
      }

      let currentStaffId = editingStaffId;

      if (isEditing && currentStaffId) {
        // UPDATE
        const { error: updateError } = await supabase
          .from('02_admin_staff_1_registration')
          .update(basicPayload)
          .eq('staff_id', currentStaffId);

        if (updateError) throw updateError;
        
      } else {
        // INSERT
        const { data: newStaff, error: insertError } = await supabase
          .from('02_admin_staff_1_registration')
          .insert(basicPayload)
          .select()
          .single();

        if (insertError) throw insertError;
        currentStaffId = newStaff.staff_id;
      }

      if (!currentStaffId) throw new Error('Failed to get Staff ID');

      // Update Address
      if (staffData.address) {
        // Check if address exists
        const { data: existingAddress } = await supabase
          .from('02_admin_staff_2_address')
          .select('address_id')
          .eq('staff_id', currentStaffId)
          .single();
          
        const addressPayload = {
          staff_id: currentStaffId,
          current_street_address: staffData.address,
          // We can map other address fields if we split the string or add more fields to form
        };

        if (existingAddress) {
           await supabase.from('02_admin_staff_2_address').update(addressPayload).eq('address_id', existingAddress.address_id);
        } else {
           await supabase.from('02_admin_staff_2_address').insert(addressPayload);
        }
      }

      // Update Emergency Contact
      if (staffData.emergencyContactName) {
         const { data: existingContact } = await supabase
          .from('02_admin_staff_7_emergency_contacts')
          .select('contact_id')
          .eq('staff_id', currentStaffId)
          .single();

         const contactPayload = {
           staff_id: currentStaffId,
           contact_name: staffData.emergencyContactName,
           phone_number: staffData.emergencyContactPhone,
           relationship: dropdownOptions.relationships.find(r => r.id.toString() === staffData.emergencyContactRelationshipId)?.name || ''
         };

         if (existingContact) {
            await supabase.from('02_admin_staff_7_emergency_contacts').update(contactPayload).eq('contact_id', existingContact.contact_id);
         } else {
            await supabase.from('02_admin_staff_7_emergency_contacts').insert(contactPayload);
         }
      }

      // Update Permits/Expiry
      // We check if we have any expiry dates to save
      if (staffData.idIqamaExpiryDate || staffData.driversLicenseExpiryDate || staffData.airsideIdExpiryDate || staffData.airsidePermitExpiryDate) {
         const { data: existingPermits } = await supabase
          .from('02_admin_staff_3_permits')
          .select('document_id')
          .eq('staff_id', currentStaffId)
          .single();
          
         const permitsPayload = {
           staff_id: currentStaffId,
           national_id_expiry_date: staffData.idIqamaExpiryDate || null,
           driving_license_expiry_date: staffData.driversLicenseExpiryDate || null,
           security_access_permit_expiry_date: staffData.airsideIdExpiryDate || null,
           aerodrome_driving_permit_expiry_date: staffData.airsidePermitExpiryDate || null
         };

         if (existingPermits) {
            await supabase.from('02_admin_staff_3_permits').update(permitsPayload).eq('document_id', existingPermits.document_id);
         } else {
            await supabase.from('02_admin_staff_3_permits').insert(permitsPayload);
         }
      }

      setSuccess(isEditing ? 'Staff member updated successfully!' : 'Staff member registered successfully!');
      
      if (!isEditing) {
         // Reset form
          const currentDepartmentId = staffData.departmentId;
          setStaffData({
            departmentId: currentDepartmentId,
            fireStationId: '',
            staffIdNumber: '',
            firstName: '',
            lastName: '',
            idNumber: '',
            email: '',
            phoneNumber: '',
            address: '',
            hireDate: '',
            positionId: '',
            rankId: '',
            employmentStatus: 'Active',
            certificationDetails: '',
            certificationExpiry: '',
            trainingRecords: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationshipId: '',
            staffPicture: null,
            idIqamaExpiryDate: '',
            driversLicenseExpiryDate: '',
            airsideIdExpiryDate: '',
            airsidePermitExpiryDate: ''
          });
          const fileInput = document.getElementById('staffPicture') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
      } else {
          setIsEditing(false);
          setEditingStaffId(null);
      }
      
      // Refresh list
      await loadStaff();

    } catch (error: any) {
      console.error('Error saving staff:', error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
    
    setStaffData(prev => ({
      ...prev,
      [name]: files && files[0] ? files[0] : value
    }));
  };

  const handleRefresh = () => {
    setStaffData({
      departmentId: '',
      fireStationId: '',
      staffIdNumber: '',
      firstName: '',
      lastName: '',
      idNumber: '',
      email: '',
      phoneNumber: '',
      address: '',
      hireDate: '',
      positionId: '',
      rankId: '',
      employmentStatus: 'Active',
      certificationDetails: '',
      certificationExpiry: '',
      trainingRecords: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationshipId: '',
      staffPicture: null,
      // New expiry date fields
      idIqamaExpiryDate: '',
      driversLicenseExpiryDate: '',
      airsideIdExpiryDate: '',
      airsidePermitExpiryDate: ''
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
    setIsEditing(false);
    setEditingStaffId(null);
    
    // Reset file input
    const fileInput = document.getElementById('staffPicture') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const editStaff = async (member: StaffMember) => {
    setIsEditing(true);
    setEditingStaffId(member.id);
    
    // Set basic info from list first
    setStaffData({
      departmentId: member.department_id.toString(),
      fireStationId: (member as any).fire_station_id?.toString() || '',
      staffIdNumber: member.staff_id,
      firstName: member.first_name,
      lastName: member.last_name,
      idNumber: member.id_number,
      email: member.email,
      phoneNumber: member.phone_number,
      address: '', // Will fetch
      hireDate: member.hire_date,
      positionId: (member as any).position_id?.toString() || '',
      rankId: (member as any).rank_id?.toString() || '',
      employmentStatus: member.employment_status,
      certificationDetails: '', // Will fetch
      certificationExpiry: '', // Will fetch
      trainingRecords: '', // Will fetch
      emergencyContactName: member.emergency_contact_name, // Already in list
      emergencyContactPhone: member.emergency_contact_phone, // Already in list
      emergencyContactRelationshipId: '', // Need to find ID from name or fetch
      staffPicture: null,
      idIqamaExpiryDate: '', // Will fetch
      driversLicenseExpiryDate: '', // Will fetch
      airsideIdExpiryDate: '', // Will fetch
      airsidePermitExpiryDate: '' // Will fetch
    });
    
    setError('');
    setSuccess('');

    // Fetch full details
    try {
      setLoading(true);
      
      // Fetch Address
      const { data: addressData } = await supabase
        .from('02_admin_staff_2_address')
        .select('*')
        .eq('staff_id', member.id)
        .single();

      // Fetch Permits (Expiry Dates)
      const { data: permitsData } = await supabase
        .from('02_admin_staff_3_permits')
        .select('*')
        .eq('staff_id', member.id)
        .single();
        
      // Fetch Emergency Contact (to get relationship ID if possible, though list has name)
      const { data: contactData } = await supabase
        .from('02_admin_staff_7_emergency_contacts')
        .select('*')
        .eq('staff_id', member.id)
        .single();
        
      // Fetch Certification (if we decide to support it)
      // const { data: certData } = await supabase...

      setStaffData(prev => ({
        ...prev,
        address: addressData?.current_street_address || '',
        idIqamaExpiryDate: permitsData?.national_id_expiry_date || '',
        driversLicenseExpiryDate: permitsData?.driving_license_expiry_date || '',
        airsideIdExpiryDate: permitsData?.security_access_permit_expiry_date || '',
        airsidePermitExpiryDate: permitsData?.aerodrome_driving_permit_expiry_date || '',
        emergencyContactRelationshipId: contactData ? 
          dropdownOptions.relationships.find(r => r.name === contactData.relationship)?.id.toString() || '' 
          : prev.emergencyContactRelationshipId,
        emergencyContactName: contactData?.contact_name || prev.emergencyContactName,
        emergencyContactPhone: contactData?.phone_number || prev.emergencyContactPhone
      }));

    } catch (err) {
      console.error('Error fetching staff details:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`Are you sure you want to delete the staff member "${staffName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(staffId));
    try {
      // Direct delete from 02_admin_staff_1_registration
      // Assuming cascade delete is set up in DB for related tables. 
      // If not, we should delete children first. 
      // Safest to try delete parent, if fails, delete children.
      // But typically RLS enabled tables might block delete if not owner?
      // We are admin.
      
      const { error } = await supabase
        .from('02_admin_staff_1_registration')
        .delete()
        .eq('staff_id', staffId);

      if (error) {
        throw new Error(error.message || 'Failed to delete staff member');
      }

      setSuccess('Staff member deleted successfully!');
      await loadStaff();
      
    } catch (error: any) {
      setError(error.message || 'Failed to delete staff member');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(staffId);
        return newSet;
      });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingStaffId(null);
    handleRefresh();
  };

  const generateExpiryStatusPDF = async () => {
    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Get staff expiry data from the new edge function
      const { data, error } = await supabase.functions.invoke('staff-expiry-status', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load staff expiry data');
      }

      const staffExpiryData = data?.data?.staff || [];
      const summary = data?.data?.summary || {};

      if (staffExpiryData.length === 0) {
        setError('No staff members found for expiry status report.');
        return;
      }

      // Get department information
      let departmentName = 'All Emergency Departments';
      let departmentType = '';
      let departmentLogo = null;
      
      // Check if we have a selected department
      if (staffData.departmentId) {
        const selectedDept = departments.find(dept => dept.id.toString() === staffData.departmentId);
        if (selectedDept) {
          departmentName = selectedDept.dept_name;
          departmentType = (selectedDept as any).department_type || (selectedDept as any).dept_type || '';
          departmentLogo = selectedDept.dept_picture_url;
        }
      }
      // If no department selected, check if all staff belong to same department
      else if (staffExpiryData.length > 0) {
        const uniqueDepartments = [...new Set(staffExpiryData.map(s => s.department_id))];
        if (uniqueDepartments.length === 1) {
          // All staff belong to same department
          const deptId = uniqueDepartments[0];
          const dept = departments.find(d => d.id === deptId || d.id.toString() === deptId.toString());
          if (dept) {
            departmentName = dept.dept_name;
            departmentType = (dept as any).department_type || (dept as any).dept_type || '';
            departmentLogo = dept.dept_picture_url;
          }
        }
      }

      // Convert logo with DACO company logo fallback
      const departmentLogoBase64 = await getPDFLogo(departmentLogo || undefined);

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Calculate summary statistics
      const summaryText = `Documents: ${summary.totalExpired || 0} Expired | ${summary.totalExpiring || 0} Expiring Soon | ${summary.totalValid || 0} Valid`;
      
      // Setup VFH A4 standard PDF layout
      const { tableStartY, tableConfig, filename } = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogoBase64,
        data: {
          departmentName,
          departmentType,
          reportTitle: 'Staff Document Expiry Status Report',
          summaryText,
          currentUser
        }
      });

      // Prepare table data with expiry status
      const tableData = staffExpiryData.map(member => {
        const formatExpiryField = (status) => {
          if (!status || status.status === 'none') return '-';
          const prefix = status.status === 'expired' ? '❌ ' : status.status === 'warning' ? '⚠️ ' : '✅ ';
          return `${prefix}${status.message}`;
        };

        return [
          member.staff_id || '-',
          `${member.first_name} ${member.last_name}`,
          member.position_name || '-',
          member.rank_name || '-',
          member.employment_status || '-',
          formatExpiryField(member.expiry_statuses?.certification),
          formatExpiryField(member.expiry_statuses?.idIqama),
          formatExpiryField(member.expiry_statuses?.driversLicense),
          formatExpiryField(member.expiry_statuses?.airsideId),
          formatExpiryField(member.expiry_statuses?.airsidePermit)
        ];
      });

      // Create table using VFH A4 standard configuration
      autoTable(doc, {
        head: [[
          'Staff ID',
          'Full Name',
          'Position',
          'Rank',
          'Status',
          'Certification',
          'ID/Iqama',
          'Drivers License',
          'Airside ID',
          'Airside Permit'
        ]],
        body: tableData,
        startY: tableStartY,
        styles: {
          ...tableConfig.styles,
          fontSize: 7,
          cellPadding: 2
        },
        headStyles: {
          ...tableConfig.headStyles,
          fontSize: 8
        },
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { cellWidth: 'auto' }, // Staff ID
          1: { cellWidth: 'auto' }, // Full Name
          2: { cellWidth: 'auto' }, // Position
          3: { cellWidth: 'auto' }, // Rank
          4: { cellWidth: 'auto' }, // Status
          5: { cellWidth: 'auto' }, // Certification
          6: { cellWidth: 'auto' }, // ID/Iqama
          7: { cellWidth: 'auto' }, // Drivers License
          8: { cellWidth: 'auto' }, // Airside ID
          9: { cellWidth: 'auto' }  // Airside Permit
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      
      // Generate PDF data URI and display in viewer
      const dataUri = doc.output('datauristring');
      setPdfDataUri(dataUri);
      setPdfFileName(filename);
      
      setSuccess(`Expiry Status PDF report generated successfully! (${staffExpiryData.length} staff members included)`);
    } catch (error: any) {
      console.error('Error generating expiry status PDF:', error);
      setError('Failed to generate expiry status PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generatePDF = async () => {
    if (staff.length === 0) {
      setError('No staff members to print. Please register some staff first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Get department information
      let departmentName = 'All Emergency Departments';
      let departmentType = '';
      let departmentLogo = null;
      
      // Check if we have a selected department
      if (staffData.departmentId) {
        const selectedDept = departments.find(dept => dept.id.toString() === staffData.departmentId);
        if (selectedDept) {
          departmentName = selectedDept.dept_name;
          departmentType = (selectedDept as any).department_type || (selectedDept as any).dept_type || '';
          departmentLogo = selectedDept.dept_picture_url;
        }
      }
      // If no department selected, check if all staff belong to same department
      else if (staff.length > 0) {
        const uniqueDepartments = [...new Set(staff.map(s => s.department_id))];
        if (uniqueDepartments.length === 1) {
          // All staff belong to same department
          const deptId = uniqueDepartments[0];
          const dept = departments.find(d => d.id === deptId || d.id.toString() === deptId.toString());
          if (dept) {
            departmentName = dept.dept_name;
            departmentType = (dept as any).department_type || (dept as any).dept_type || '';
            departmentLogo = dept.dept_picture_url;
          }
        }
      }

      // Convert logo with DACO company logo fallback
      const departmentLogoBase64 = await getPDFLogo(departmentLogo || undefined);

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Calculate totals for summary
      const totalStaff = staff.length;
      const activeStaff = staff.filter(s => s.employment_status === 'Active').length;
      const summaryText = `Summary: Total Staff: ${totalStaff}, Active Staff: ${activeStaff}`;
      
      // Setup VFH A4 standard PDF with logo, header, and get table configuration
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogoBase64,
        data: {
          departmentName: departmentName,
          departmentType: departmentType,
          reportTitle: "Registered Staff Report",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });

      // Prepare table data
      const tableData = staff.map(member => [
        member.staff_id || '-',
        `${member.first_name} ${member.last_name}`,
        member.position || '-',
        member.rank || '-',
        member.employment_status || '-',
        member.email || '-',
        member.phone_number || '-',
        [
          member.emergency_contact_name || '',
          member.emergency_contact_phone || ''
        ].filter(Boolean).join('\n') || '-'
      ]);

      // Create table using VFH A4 standard configuration
      autoTable(doc, {
        head: [[
          'Staff ID',
          'Full Name',
          'Position',
          'Rank',
          'Status',
          'Email',
          'Phone',
          'Emergency Contact'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });

      // Generate PDF data URI and display in viewer
      const dataUri = doc.output('datauristring');
      setPdfDataUri(dataUri);
      setPdfFileName(vfhSetup.filename);
      
      setSuccess(`PDF report generated successfully! (${staff.length} staff members included)`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ----- Bulk Import Helpers -----
  const normalizeKey = (key: string) => {
    const k = key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const map: Record<string, string> = {
      departmentid: 'departmentId', department: 'departmentId', deptid: 'departmentId', department_id: 'departmentId', dept: 'departmentId', departmentname: 'departmentName', deptname: 'departmentName',
      firestationid: 'fireStationId', firestation: 'fireStationId', fire_station_id: 'fireStationId', stationid: 'fireStationId', station: 'fireStationId', firestationname: 'fireStationName', stationname: 'fireStationName',
      staffidnumber: 'staffIdNumber', staffid: 'staffIdNumber', staff_id: 'staffIdNumber', staffnumber: 'staffIdNumber',
      firstname: 'firstName', first_name: 'firstName', givenname: 'firstName',
      lastname: 'lastName', last_name: 'lastName', surname: 'lastName',
      idnumber: 'idNumber', iqama: 'idNumber', iqamaid: 'idNumber', nationalid: 'idNumber',
      email: 'email', emailaddress: 'email',
      phonenumber: 'phoneNumber', phone: 'phoneNumber', mobile: 'phoneNumber', telephone: 'phoneNumber',
      address: 'address', streetaddress: 'address',
      hiredate: 'hireDate', dateofhire: 'hireDate',
      positionid: 'positionId', position_id: 'positionId', position: 'positionName', positionname: 'positionName',
      rankid: 'rankId', rank_id: 'rankId', rank: 'rankName', rankname: 'rankName',
      employmentstatus: 'employmentStatus', status: 'employmentStatus',
      certificationdetails: 'certificationDetails',
      certificationexpiry: 'certificationExpiry', certificationexpirydate: 'certificationExpiry',
      trainingrecords: 'trainingRecords',
      emergencycontactname: 'emergencyContactName',
      emergencycontactphone: 'emergencyContactPhone',
      emergencycontactrelationshipid: 'emergencyContactRelationshipId', relationshipid: 'emergencyContactRelationshipId', emergencycontactrelationshipname: 'emergencyContactRelationshipName',
      idiqamaexpirydate: 'idIqamaExpiryDate', iqamaexpirydate: 'idIqamaExpiryDate', idexpirydate: 'idIqamaExpiryDate',
      driverslicenseexpirydate: 'driversLicenseExpiryDate', licenseexpirydate: 'driversLicenseExpiryDate',
      airsideidexpirydate: 'airsideIdExpiryDate',
      airsidepermitexpirydate: 'airsidePermitExpiryDate'
    };
    return map[k] || k;
  };

  const excelSerialToISO = (serial: number): string => {
    // Excel serial date to JS Date: days since 1899-12-30 (Windows)
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = epoch.getTime() + Math.round(serial * 86400 * 1000);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };

  const toISODate = (val: any): string => {
    if (val === null || val === undefined || val === '') return '';
    if (val instanceof Date && !isNaN(val.getTime())) return val.toISOString().slice(0, 10);
    if (typeof val === 'number') return excelSerialToISO(val);
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };

  const buildLookups = () => {
    const deptByName: Record<string, number> = {};
    departments.forEach(d => { deptByName[(d.dept_name || '').toLowerCase().trim()] = d.id; });
    const stationByName: Record<string, number> = {};
    dropdownOptions.fireStations.forEach(s => { stationByName[(s.fire_station_name || '').toLowerCase().trim()] = s.id; });
    const positionByName: Record<string, number> = {};
    dropdownOptions.positions.forEach(p => { positionByName[(p.name || '').toLowerCase().trim()] = p.id; });
    const rankByName: Record<string, number> = {};
    dropdownOptions.ranks.forEach(r => { rankByName[(r.rank_name || '').toLowerCase().trim()] = r.id; });
    const relationByName: Record<string, number> = {};
    dropdownOptions.relationships.forEach(rel => { relationByName[(rel.name || '').toLowerCase().trim()] = rel.id; });
    return { deptByName, stationByName, positionByName, rankByName, relationByName };
  };

  const parseCSV = (text: string): any[] => {
    const lines: string[] = [];
    let i = 0; let field = ''; let row: string[] = []; let inQuotes = false;
    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else { field += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { row.push(field); field = ''; }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i++;
          row.push(field); field = '';
          lines.push(JSON.stringify(row));
          row = [];
        } else { field += ch; }
      }
      i++;
    }
    // push last field/row
    row.push(field);
    lines.push(JSON.stringify(row));
    const rows = lines.map(l => JSON.parse(l));
    if (rows.length === 0) return [];
    const headers = (rows[0] as string[]).map(h => h.trim());
    return rows.slice(1).filter(r => r.length && r.some((c: string) => c && c.trim())).map((r: string[]) => {
      const obj: any = {};
      headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
      return obj;
    });
  };

  const parseFileRows = async (file: File): Promise<any[]> => {
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.csv')) {
      const text = await file.text();
      return parseCSV(text);
    }
    try {
      const arrayBuf = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const wb = XLSX.read(arrayBuf, { type: 'array', cellDates: true });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
      return rows as any[];
    } catch (err) {
      setError('Failed to parse Excel file. Please install dependency xlsx or upload CSV.');
      return [];
    }
  };

  const mapRowToPayload = (row: any) => {
    const norm: Record<string, any> = {};
    Object.keys(row).forEach(k => { norm[normalizeKey(k)] = row[k]; });
    const lookups = buildLookups();
    const toId = (val: any) => {
      if (val === undefined || val === null || val === '') return null;
      const n = parseInt(String(val));
      return isNaN(n) ? null : n;
    };

    const departmentId = toId(norm.departmentId) || lookups.deptByName[(norm.departmentName || '').toLowerCase().trim()] || null;
    const fireStationId = toId(norm.fireStationId) || lookups.stationByName[(norm.fireStationName || '').toLowerCase().trim()] || null;
    const positionId = toId(norm.positionId) || lookups.positionByName[(norm.positionName || '').toLowerCase().trim()] || null;
    const rankId = toId(norm.rankId) || lookups.rankByName[(norm.rankName || '').toLowerCase().trim()] || null;
    const emergencyContactRelationshipId = toId(norm.emergencyContactRelationshipId) || lookups.relationByName[(norm.emergencyContactRelationshipName || '').toLowerCase().trim()] || null;

    return {
      departmentId,
      fireStationId,
      staffIdNumber: norm.staffIdNumber || '',
      firstName: norm.firstName || '',
      lastName: norm.lastName || '',
      idNumber: norm.idNumber || '',
      email: norm.email || '',
      phoneNumber: norm.phoneNumber || '',
      address: norm.address || '',
      hireDate: toISODate(norm.hireDate),
      positionId,
      rankId,
      employmentStatus: norm.employmentStatus || 'Active',
      certificationDetails: norm.certificationDetails || '',
      certificationExpiry: toISODate(norm.certificationExpiry),
      trainingRecords: norm.trainingRecords || '',
      emergencyContactName: norm.emergencyContactName || '',
      emergencyContactPhone: norm.emergencyContactPhone || '',
      emergencyContactRelationshipId,
      idIqamaExpiryDate: toISODate(norm.idIqamaExpiryDate) || null,
      driversLicenseExpiryDate: toISODate(norm.driversLicenseExpiryDate) || null,
      airsideIdExpiryDate: toISODate(norm.airsideIdExpiryDate) || null,
      airsidePermitExpiryDate: toISODate(norm.airsidePermitExpiryDate) || null
    };
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImportFile(file);
    setImportFileName(file ? file.name : '');
  };

  const startImport = async () => {
    if (!selectedImportFile) {
      setError('Please select an Excel/CSV file to import.');
      return;
    }
    setImportErrors([]);
    setSuccess('');
    setError('');
    setImporting(true);
    try {
      const rows = await parseFileRows(selectedImportFile);
      let successCount = 0;
      let failedCount = 0;
      setImportProgress({ total: rows.length, success: 0, failed: 0 });
      for (let i = 0; i < rows.length; i++) {
        const payload = mapRowToPayload(rows[i]);
        if (!payload.departmentId || !payload.staffIdNumber || !payload.firstName || !payload.lastName) {
          setImportErrors(prev => [...prev, `Row ${i + 1}: Missing required fields (departmentId, staffIdNumber, firstName, lastName).`]);
          failedCount++;
          setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          continue;
        }
        try {
          const { data, error } = await supabase.functions.invoke('register-staff', {
            body: {
              departmentId: payload.departmentId,
              fireStationId: payload.fireStationId,
              staffIdNumber: payload.staffIdNumber,
              firstName: payload.firstName,
              lastName: payload.lastName,
              idNumber: payload.idNumber,
              email: payload.email,
              phoneNumber: payload.phoneNumber,
              address: payload.address,
              hireDate: payload.hireDate,
              positionId: payload.positionId,
              rankId: payload.rankId,
              employmentStatus: payload.employmentStatus,
              certificationDetails: payload.certificationDetails,
              certificationExpiry: payload.certificationExpiry,
              trainingRecords: payload.trainingRecords,
              emergencyContactName: payload.emergencyContactName,
              emergencyContactPhone: payload.emergencyContactPhone,
              emergencyContactRelationshipId: payload.emergencyContactRelationshipId,
              staffPictureData: null,
              fileName: null,
              idIqamaExpiryDate: payload.idIqamaExpiryDate,
              driversLicenseExpiryDate: payload.driversLicenseExpiryDate,
              airsideIdExpiryDate: payload.airsideIdExpiryDate,
              airsidePermitExpiryDate: payload.airsidePermitExpiryDate
            }
          });
          if (error || !data?.data?.success) {
            throw new Error(error?.message || data?.error?.message || 'Unknown error');
          }
          successCount++;
          setImportProgress(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (err: any) {
          setImportErrors(prev => [...prev, `Row ${i + 1}: ${err.message || 'Failed to import'}`]);
          failedCount++;
          setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }
      setSuccess(`Import complete. ${successCount} succeeded, ${failedCount} failed.`);
      await loadStaff();
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import staff from file');
    } finally {
      setImporting(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="staff-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="staff-title">
                Register Your Staff Here
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Staff Registration system provides comprehensive registration
                and management of all emergency service personnel at King Fahd
                International Airport. This system maintains detailed records
                of individual qualifications, certifications, training status,
                and assignment information that support effective workforce
                management and ensure operational readiness across all emergency
                service functions.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Staff Registration" />
              ) : (
                <ImagePlaceholder>
                  Image not available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Staff Registration Form */}
      <Section aria-labelledby="staff-registration-form">
        <FormSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SubTitle id="staff-registration-form">
              {isEditing ? 'Edit Staff Member' : 'Staff Registration Form'}
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
          
          <FormContainer onSubmit={handleSubmit}>
            {/* Department and Fire Station Selection */}
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="departmentId">Select Department *</Label>
                <Select
                  id="departmentId"
                  name="departmentId"
                  value={staffData.departmentId}
                  onChange={handleInputChange}
                  required
                  $hasError={fieldErrors.departmentId}
                  disabled={departmentsLoading}
                >
                  <option value="">{departmentsLoading ? 'Loading departments...' : 'Select a department'}</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.dept_name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="fireStationId">Fire Station</Label>
                <Select
                  id="fireStationId"
                  name="fireStationId"
                  value={staffData.fireStationId}
                  onChange={handleInputChange}
                  $hasError={fieldErrors.fireStationId}
                  disabled={dropdownLoading}
                >
                  <option value="">{dropdownLoading ? 'Loading fire stations...' : 'Select a fire station'}</option>
                  {dropdownOptions.fireStations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.fire_station_name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
            </FieldRow>

            {/* Basic Information */}
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="staffIdNumber">Staff ID Number *</Label>
                <Input
                  type="text"
                  id="staffIdNumber"
                  name="staffIdNumber"
                  value={staffData.staffIdNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter staff ID number"
                  $hasError={fieldErrors.staffIdNumber}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={staffData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                  $hasError={fieldErrors.firstName}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={staffData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter last name"
                  $hasError={fieldErrors.lastName}
                />
              </FieldColumn>
            </ThreeColumnRow>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="idNumber">ID/Iqama Number</Label>
                <Input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={staffData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Enter ID or Iqama number"
                  $hasError={fieldErrors.idNumber}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={staffData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  $hasError={fieldErrors.email}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={staffData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  $hasError={fieldErrors.phoneNumber}
                />
              </FieldColumn>
            </ThreeColumnRow>

            {/* Employment Details */}
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={staffData.hireDate}
                  onChange={handleInputChange}
                  $hasError={fieldErrors.hireDate}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="positionId">Position</Label>
                <Select
                  id="positionId"
                  name="positionId"
                  value={staffData.positionId}
                  onChange={handleInputChange}
                  $hasError={fieldErrors.positionId}
                  disabled={dropdownLoading}
                >
                  <option value="">{dropdownLoading ? 'Loading positions...' : 'Select a position'}</option>
                  {dropdownOptions.positions.filter(pos => pos.active).map(position => (
                    <option key={position.id} value={position.id}>
                      {position.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="rankId">Rank</Label>
                <Select
                  id="rankId"
                  name="rankId"
                  value={staffData.rankId}
                  onChange={handleInputChange}
                  $hasError={fieldErrors.rankId}
                  disabled={dropdownLoading}
                >
                  <option value="">{dropdownLoading ? 'Loading ranks...' : 'Select a rank'}</option>
                  {dropdownOptions.ranks.filter(rank => rank.active).map(rank => (
                    <option key={rank.id} value={rank.id}>
                      {rank.rank_name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
            </ThreeColumnRow>

            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select
                  id="employmentStatus"
                  name="employmentStatus"
                  value={staffData.employmentStatus}
                  onChange={handleInputChange}
                  $hasError={fieldErrors.employmentStatus}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </Select>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="certificationExpiry">Certification Expiry Date</Label>
                <ExpiryNotificationWrapper>
                  <ExpiryDateInput
                    type="date"
                    id="certificationExpiry"
                    name="certificationExpiry"
                    value={staffData.certificationExpiry}
                    onChange={handleInputChange}
                    $hasError={fieldErrors.certificationExpiry}
                    $expiryStatus={calculateExpiryStatus(staffData.certificationExpiry).status}
                  />
                  {staffData.certificationExpiry && calculateExpiryStatus(staffData.certificationExpiry).status !== 'valid' && calculateExpiryStatus(staffData.certificationExpiry).status !== 'none' && (
                    <ExpiryNotification $status={calculateExpiryStatus(staffData.certificationExpiry).status as 'warning' | 'expired'}>
                      {calculateExpiryStatus(staffData.certificationExpiry).message}
                    </ExpiryNotification>
                  )}
                </ExpiryNotificationWrapper>
              </FieldColumn>
              <FieldColumn>
                {/* Empty column for layout */}
              </FieldColumn>
            </ThreeColumnRow>

            {/* New Expiry Date Fields Section */}
            <SubTitle style={{marginTop: '30px', marginBottom: '20px', fontSize: '1.2rem'}}>Document Expiry Tracking</SubTitle>
            
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="idIqamaExpiryDate">ID/Iqama Expiry Date</Label>
                <ExpiryNotificationWrapper>
                  <ExpiryDateInput
                    type="date"
                    id="idIqamaExpiryDate"
                    name="idIqamaExpiryDate"
                    value={staffData.idIqamaExpiryDate}
                    onChange={handleInputChange}
                    $hasError={fieldErrors.idIqamaExpiryDate}
                    $expiryStatus={calculateExpiryStatus(staffData.idIqamaExpiryDate).status}
                  />
                  {staffData.idIqamaExpiryDate && calculateExpiryStatus(staffData.idIqamaExpiryDate).status !== 'valid' && calculateExpiryStatus(staffData.idIqamaExpiryDate).status !== 'none' && (
                    <ExpiryNotification $status={calculateExpiryStatus(staffData.idIqamaExpiryDate).status as 'warning' | 'expired'}>
                      {calculateExpiryStatus(staffData.idIqamaExpiryDate).message}
                    </ExpiryNotification>
                  )}
                </ExpiryNotificationWrapper>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="driversLicenseExpiryDate">Drivers License Expiry Date</Label>
                <ExpiryNotificationWrapper>
                  <ExpiryDateInput
                    type="date"
                    id="driversLicenseExpiryDate"
                    name="driversLicenseExpiryDate"
                    value={staffData.driversLicenseExpiryDate}
                    onChange={handleInputChange}
                    $hasError={fieldErrors.driversLicenseExpiryDate}
                    $expiryStatus={calculateExpiryStatus(staffData.driversLicenseExpiryDate).status}
                  />
                  {staffData.driversLicenseExpiryDate && calculateExpiryStatus(staffData.driversLicenseExpiryDate).status !== 'valid' && calculateExpiryStatus(staffData.driversLicenseExpiryDate).status !== 'none' && (
                    <ExpiryNotification $status={calculateExpiryStatus(staffData.driversLicenseExpiryDate).status as 'warning' | 'expired'}>
                      {calculateExpiryStatus(staffData.driversLicenseExpiryDate).message}
                    </ExpiryNotification>
                  )}
                </ExpiryNotificationWrapper>
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="airsideIdExpiryDate">Airside ID Expiry Date</Label>
                <ExpiryNotificationWrapper>
                  <ExpiryDateInput
                    type="date"
                    id="airsideIdExpiryDate"
                    name="airsideIdExpiryDate"
                    value={staffData.airsideIdExpiryDate}
                    onChange={handleInputChange}
                    $hasError={fieldErrors.airsideIdExpiryDate}
                    $expiryStatus={calculateExpiryStatus(staffData.airsideIdExpiryDate).status}
                  />
                  {staffData.airsideIdExpiryDate && calculateExpiryStatus(staffData.airsideIdExpiryDate).status !== 'valid' && calculateExpiryStatus(staffData.airsideIdExpiryDate).status !== 'none' && (
                    <ExpiryNotification $status={calculateExpiryStatus(staffData.airsideIdExpiryDate).status as 'warning' | 'expired'}>
                      {calculateExpiryStatus(staffData.airsideIdExpiryDate).message}
                    </ExpiryNotification>
                  )}
                </ExpiryNotificationWrapper>
              </FieldColumn>
            </ThreeColumnRow>
            
            <FieldRow>
              <FieldColumn $flex="1">
                <Label htmlFor="airsidePermitExpiryDate">Airside Permit Expiry Date</Label>
                <ExpiryNotificationWrapper>
                  <ExpiryDateInput
                    type="date"
                    id="airsidePermitExpiryDate"
                    name="airsidePermitExpiryDate"
                    value={staffData.airsidePermitExpiryDate}
                    onChange={handleInputChange}
                    $hasError={fieldErrors.airsidePermitExpiryDate}
                    $expiryStatus={calculateExpiryStatus(staffData.airsidePermitExpiryDate).status}
                  />
                  {staffData.airsidePermitExpiryDate && calculateExpiryStatus(staffData.airsidePermitExpiryDate).status !== 'valid' && calculateExpiryStatus(staffData.airsidePermitExpiryDate).status !== 'none' && (
                    <ExpiryNotification $status={calculateExpiryStatus(staffData.airsidePermitExpiryDate).status as 'warning' | 'expired'}>
                      {calculateExpiryStatus(staffData.airsidePermitExpiryDate).message}
                    </ExpiryNotification>
                  )}
                </ExpiryNotificationWrapper>
              </FieldColumn>
              <FieldColumn $flex="2">
                {/* Empty space for layout balance */}
              </FieldColumn>
            </FieldRow>

            {/* Address */}
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="address">Address</Label>
                <TextArea
                  id="address"
                  name="address"
                  value={staffData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  $hasError={fieldErrors.address}
                />
              </FieldColumn>
            </FieldRow>

            {/* Certification Details */}
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="certificationDetails">Certification Details</Label>
                <TextArea
                  id="certificationDetails"
                  name="certificationDetails"
                  value={staffData.certificationDetails}
                  onChange={handleInputChange}
                  placeholder="Enter certification details, licenses, qualifications"
                  $hasError={fieldErrors.certificationDetails}
                />
              </FieldColumn>
            </FieldRow>

            {/* Training Records */}
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="trainingRecords">Training Records</Label>
                <TextArea
                  id="trainingRecords"
                  name="trainingRecords"
                  value={staffData.trainingRecords}
                  onChange={handleInputChange}
                  placeholder="Enter training records, courses completed, special skills"
                  $hasError={fieldErrors.trainingRecords}
                />
              </FieldColumn>
            </FieldRow>

            {/* Emergency Contact Information */}
            <ThreeColumnRow>
              <FieldColumn>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={staffData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact name"
                  $hasError={fieldErrors.emergencyContactName}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={staffData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact phone"
                  $hasError={fieldErrors.emergencyContactPhone}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="emergencyContactRelationshipId">Relationship</Label>
                <Select
                  id="emergencyContactRelationshipId"
                  name="emergencyContactRelationshipId"
                  value={staffData.emergencyContactRelationshipId}
                  onChange={handleInputChange}
                  $hasError={fieldErrors.emergencyContactRelationshipId}
                  disabled={dropdownLoading}
                >
                  <option value="">{dropdownLoading ? 'Loading relationships...' : 'Select a relationship'}</option>
                  {dropdownOptions.relationships.filter(rel => rel.active).map(relationship => (
                    <option key={relationship.id} value={relationship.id}>
                      {relationship.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
            </ThreeColumnRow>
            
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="staffPicture">Staff Picture Upload</Label>
                <FileInput
                  type="file"
                  id="staffPicture"
                  name="staffPicture"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </FieldColumn>
            </FieldRow>
            
            <div style={{ marginTop: '20px' }}>
              <SubmitButton 
                type="submit" 
                disabled={loading}
              >
                {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Staff Member' : 'Register Staff Member')}
              </SubmitButton>
            </div>
          </FormContainer>
        </FormSection>
      </Section>

      {/* Bulk Import */}
      <Section aria-labelledby="bulk-import">
        <StaffListSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SubTitle id="bulk-import">Bulk Staff Import (Excel/CSV)</SubTitle>
          </div>
          <p style={{ color: '#666' }}>
            Upload an Excel (.xlsx/.xls) or CSV file with columns like
            <code> DepartmentId, StaffIdNumber, FirstName, LastName </code> and optional fields.
            You may also use names (e.g., <code>DepartmentName</code>, <code>PositionName</code>, <code>RankName</code>). We’ll match them to IDs.
          </p>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          <FieldRow>
            <FieldColumn>
              <Label htmlFor="staffImportFile">Select Excel/CSV file</Label>
              <FileInput
                type="file"
                id="staffImportFile"
                name="staffImportFile"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFileChange}
              />
              {importFileName && (
                <small style={{ color: '#1177BB' }}>Selected: {importFileName}</small>
              )}
            </FieldColumn>
          </FieldRow>
          <div style={{ marginTop: '10px' }}>
            <SubmitButton type="button" disabled={importing || !selectedImportFile} onClick={startImport}>
              {importing ? 'Importing...' : 'Start Import'}
            </SubmitButton>
            {importing || importProgress.total > 0 ? (
              <div style={{ marginTop: '10px', color: '#1177BB' }}>
                Progress: {importProgress.success} succeeded, {importProgress.failed} failed of {importProgress.total}
              </div>
            ) : null}
          </div>
          {importErrors.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <SubTitle style={{ fontSize: '1rem' }}>Import Errors</SubTitle>
              <ul style={{ color: '#c33' }}>
                {importErrors.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </StaffListSection>
      </Section>

      {/* Registered Staff List */}
      <Section aria-labelledby="staff-list">
        <StaffListSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SubTitle id="staff-list">
              Registered Staff Members
            </SubTitle>
            <div>
              <PrintButton onClick={generatePDF} disabled={isGeneratingPDF || staff.length === 0}>
                {isGeneratingPDF ? 'Generating...' : 'Staff List PDF'}
              </PrintButton>
              <PrintButton 
                onClick={generateExpiryStatusPDF} 
                disabled={isGeneratingPDF || staff.length === 0}
                style={{ backgroundColor: '#dc3545', marginLeft: '5px' }}
              >
                {isGeneratingPDF ? 'Generating...' : 'Expiry Status PDF'}
              </PrintButton>
              <RefreshButton onClick={loadStaff} disabled={staffLoading}>
                {staffLoading ? 'Loading...' : 'Refresh List'}
              </RefreshButton>
            </div>
          </div>
          
          {staff.length > 0 ? (
            <StaffTable>
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Emergency Contact</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member.id}>
                    <td><strong>{member.staff_id}</strong></td>
                    <td><strong>{member.first_name} {member.last_name}</strong></td>
                    <td>{member.department_name || '-'}</td>
                    <td>{member.position || '-'}</td>
                    <td>{member.rank || '-'}</td>
                    <td>
                      <span style={{ 
                        color: member.employment_status === 'Active' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {member.employment_status || 'Active'}
                      </span>
                    </td>
                    <td>
                      {member.email ? (
                        <>
                          {member.email}<br />
                          {member.phone_number && <small>{member.phone_number}</small>}
                        </>
                      ) : (
                        <small>-</small>
                      )}
                    </td>
                    <td>
                      {member.emergency_contact_name ? (
                        <>
                          {member.emergency_contact_name}<br />
                          {member.emergency_contact_relationship && <small>{member.emergency_contact_relationship}</small>}<br />
                          {member.emergency_contact_phone && <small>{member.emergency_contact_phone}</small>}
                        </>
                      ) : (
                        <small>-</small>
                      )}
                    </td>
                    <td>
                      <small>{new Date(member.created_at).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <EditButton 
                        onClick={() => editStaff(member)}
                        disabled={isEditing}
                      >
                        Edit
                      </EditButton>
                      <DeleteButton 
                        onClick={() => deleteStaff(member.id, `${member.first_name} ${member.last_name}`)}
                        disabled={deletingIds.has(member.id) || isEditing}
                      >
                        {deletingIds.has(member.id) ? 'Deleting...' : 'Delete'}
                      </DeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StaffTable>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {staffLoading ? 'Loading staff members...' : 'No staff members registered yet.'}
            </p>
          )}
        </StaffListSection>
      </Section>

      {/* PDF Viewer */}
      {pdfDataUri && (
        <PdfViewerContainer>
          <PdfViewerHeader>
            <PdfTitle>{pdfFileName}</PdfTitle>
            <PdfActions>
              <PdfActionButton 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfDataUri;
                  link.download = pdfFileName;
                  link.click();
                }}
              >
                ⬇ Download PDF
              </PdfActionButton>
              <PdfActionButton 
                onClick={() => {
                  setPdfDataUri(null);
                  setPdfFileName('');
                }}
                style={{ background: '#dc3545' }}
              >
                ✕ Close
              </PdfActionButton>
            </PdfActions>
          </PdfViewerHeader>
          <PdfViewer src={pdfDataUri} />
        </PdfViewerContainer>
      )}
    </MainContent>
  );
};