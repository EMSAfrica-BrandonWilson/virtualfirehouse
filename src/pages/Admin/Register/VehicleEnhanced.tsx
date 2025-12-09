import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseFallback } from '../../../lib/supabase';
import { usePageImage } from '../../../hooks/usePageImage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../utils/companyLogo';
import { 
  getCurrentLocalDate, 
  getStartOfDay, 
  daysBetween, 
  getCurrentTimezone 
} from '../../../lib/utils';
import VehicleOptionsModal from '../../../components/UI/VehicleOptionsModal';

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

const VehicleListSection = styled.div`
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

const FieldRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
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
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
  padding: 0;
  
  &:hover {
    color: #0f5c99;
  }
  
  &:disabled {
    color: #9aa6b2;
    cursor: not-allowed;
    pointer-events: none;
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
  width: 100%;
  box-sizing: border-box;
  
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

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 10px;
  border: 2px solid #e0e0e0;
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

const DebugButton = styled.button`
  background-color: #6f42c1;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 5px;
  
  &:hover {
    background-color: #5a32a3;
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

const VehicleImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

// Color-coded styled components for expiry status
const GatePassExpiryCell = styled.td<{ $expiryStatus: 'valid' | 'warning' | 'urgent' | 'expired' | 'none' }>`
  padding: 12px;
  font-size: 14px;
  color: #333;
  vertical-align: middle;
  font-weight: 500;
  border-left: 4px solid ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#28a745'; // Green
      case 'warning': return '#ffc107'; // Yellow
      case 'urgent': return '#fd7e14'; // Orange
      case 'expired': return '#dc3545'; // Red
      case 'none': return '#6c757d'; // Gray
      default: return '#6c757d';
    }
  }};
  background-color: ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#f8fff9'; // Very light green
      case 'warning': return '#fffef7'; // Very light yellow
      case 'urgent': return '#fff8f5'; // Very light orange
      case 'expired': return '#fff5f5'; // Very light red
      case 'none': return '#f8f9fa'; // Light gray
      default: return 'white';
    }
  }};
`;

const ExpiryStatusBadge = styled.span<{ $expiryStatus: 'valid' | 'warning' | 'urgent' | 'expired' | 'none' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  margin-left: 8px;
  background-color: ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'urgent': return '#fdf2e9';
      case 'expired': return '#f8d7da';
      case 'none': return '#e9ecef';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#155724';
      case 'warning': return '#856404';
      case 'urgent': return '#8a4a03';
      case 'expired': return '#721c24';
      case 'none': return '#495057';
      default: return '#495057';
    }
  }};
`;

interface VehicleFormData {
  veh_call_sign: string;
  veh_type: string;
  veh_make: string;
  vehicle_model: string;
  model_year: string;
  vehicle_age: number | null;
  veh_plate_no: string;
  veh_mms_no: string;
  veh_gate_pass_no: string;
  veh_gate_pass_expiry_date: string;
  vehicle_picture_url: string;
  vehiclePicture: File | null;
}

interface CallSign {
  id: number;
  name: string;
  active: boolean;
}

interface VehicleType {
  id: number;
  name: string;
  active: boolean;
}

interface VehicleMake {
  id: number;
  name: string;
  active: boolean;
}

interface Vehicle {
  id: string;
  veh_call_sign: string;
  veh_type: string;
  veh_make: string;
  vehicle_model: string;
  model_year: number;
  vehicle_age: number;
  veh_plate_no: string;
  veh_mms_no: string;
  veh_gate_pass_no: string;
  veh_gate_pass_expiry_date: string;
  vehicle_picture_url: string;
  call_sign_name: string;
  vehicle_type_name: string;
  vehicle_make_name: string;
  created_at: string;
  updated_at: string;
}

type DropdownType = 'call_signs' | 'vehicle_types' | 'vehicle_makes';

// Fallback globals injected via Vite define (for env-less scenarios)
declare const __VITE_SUPABASE_URL__: string;
declare const __VITE_SUPABASE_ANON_KEY__: string;

export const VehicleEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-vehicles', '/images/FireEngine.png');

  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    veh_call_sign: '',
    veh_type: '',
    veh_make: '',
    vehicle_model: '',
    model_year: '',
    vehicle_age: null,
    veh_plate_no: '',
    veh_mms_no: '',
    veh_gate_pass_no: '',
    veh_gate_pass_expiry_date: '',
    vehicle_picture_url: '',
    vehiclePicture: null
  });

  const [callSigns, setCallSigns] = useState<CallSign[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const persistSelectedCallSign = (val: string) => {
    try { sessionStorage.setItem('veh_call_sign_selected', val); } catch {}
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('veh_call_sign_selected');
      if (saved) {
        setVehicleData(prev => ({ ...prev, veh_call_sign: saved }));
      }
    } catch {}
  }, []);

  // Fields remain inactive until user clicks "Register New Vehicle" button

  const loadCallSigns = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd5_vehicle_call_signs')
        .select('*');
      if (error) {
        console.error('Failed to load call signs:', error);
        return;
      }
      const mapped = (Array.isArray(data) ? data : [])
        .map((row: any) => ({
          id: Number(row.id ?? row.call_sign_id ?? row.pk),
          name: row.name || row.call_sign_name || row.vehicle_callsign || row.vehicle_call_sign || row.call_sign || row.code || '',
          active: Boolean(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true))
        }))
        .filter(cs => cs.id && cs.name)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setCallSigns(prev => {
        const sel = (vehicleData.veh_call_sign || '').toLowerCase();
        const exists = mapped.some(cs => (cs.name || '').toLowerCase() === sel);
        const next = exists || !sel ? mapped : [{ id: -1, name: vehicleData.veh_call_sign, active: true }, ...mapped].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        try { sessionStorage.setItem('veh_call_signs_list', JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (err) {
      console.error('Unexpected error loading call signs:', err);
      // Do not clear existing list on error
    }
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('veh_call_signs_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const restored = parsed.filter((cs: any) => cs && typeof cs.name === 'string').sort((a: CallSign, b: CallSign) => (a.name || '').localeCompare(b.name || ''));
          setCallSigns(restored);
        }
      }
    } catch {}
    loadCallSigns();
  }, []);
  
  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsType, setOptionsType] = useState<DropdownType>('call_signs');
  // Lock form for view-only mode; only Call Sign is interactive
  const [formLocked, setFormLocked] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'exists' | 'new'>('new');
  const [pendingVehicle, setPendingVehicle] = useState<Vehicle | null>(null);
  const [pendingCallSign, setPendingCallSign] = useState<string>('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [dupModalOpen, setDupModalOpen] = useState(false);
  const [dupMessages, setDupMessages] = useState<string[]>([]);

  // Normalize DB/ISO date strings for HTML date input (expects YYYY-MM-DD)
  const formatDateForInput = (value: string | null | undefined): string => {
    const s = (value ?? '').trim();
    if (!s) return '';
    if (s.includes(' ')) {
      const part = s.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    }
    if (s.includes('T')) {
      const part = s.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
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

  useEffect(() => {
    loadCurrentUser();
    loadDepartments();
    loadDropdowns();
    loadVehicles();
  }, []);

  // Load vehicle data for editing when navigated from Registered Vehicles page
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('editing_vehicle');
      if (stored) {
        const v = JSON.parse(stored);
        if (v && v.id) {
          // Prefill the form and set edit mode
          handleEdit(v);
        }
        // Clear after consuming to avoid re-triggering on refresh
        sessionStorage.removeItem('editing_vehicle');
      }
    } catch (err) {
      console.warn('Failed to load editing vehicle from sessionStorage:', err);
    }
  }, []);

  useEffect(() => {
    // Auto-calculate vehicle age when model year changes
    if (vehicleData.model_year) {
      const currentYear = new Date().getFullYear();
      const modelYear = parseInt(vehicleData.model_year);
      if (!isNaN(modelYear) && modelYear > 1900 && modelYear <= currentYear + 1) {
        setVehicleData(prev => ({
          ...prev,
          vehicle_age: currentYear - modelYear
        }));
      } else {
        setVehicleData(prev => ({
          ...prev,
          vehicle_age: null
        }));
      }
    } else {
      setVehicleData(prev => ({
        ...prev,
        vehicle_age: null
      }));
    }
  }, [vehicleData.model_year]);

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('*');

      if (error) {
        throw new Error(error.message || 'Failed to load departments');
      }

      const list = (data || []).map((row: any) => ({
        id: row.id ?? row.dept_id ?? row.department_id ?? row.pk ?? null,
        name: row.dept_name ?? row.department_name ?? row.name ?? ''
      })).filter((d: any) => d.id !== null && d.name).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      setDepartments(list as any);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError(error.message || 'Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const loadDropdowns = async () => {
    setDropdownsLoading(true);
    setError('');
    try {
      const [csRes, vtRes, vmRes] = await Promise.all([
        supabase.from('02_admin_register_fd5_vehicle_call_signs').select('*'),
        supabase.from('02_admin_register_fd6_vehicle_types').select('*'),
        supabase.from('02_admin_register_fd7_vehicle_makes').select('*')
      ]);

      if (!csRes.error && Array.isArray(csRes.data)) {
        const mapped = csRes.data.map((row: any) => ({
          id: row.id ?? row.call_sign_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_callsign ?? row.vehicle_call_sign ?? row.call_sign ?? row.call_sign_name ?? row.code ?? '',
          active: !!(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true))
        })).filter((i: any) => i.id !== null && i.name).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setCallSigns(mapped as any);
        try { sessionStorage.setItem('veh_call_signs_list', JSON.stringify(mapped)); } catch {}
      }

      if (!vtRes.error && Array.isArray(vtRes.data)) {
        const list = vtRes.data.map((row: any) => ({
          id: row.id ?? row.type_id ?? row.vehicle_type_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_type ?? row.vehicle_type_name ?? row.type_name ?? '',
          active: !!(row.active ?? row.is_active ?? true)
        })).filter((i: any) => i.id !== null && i.name).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setVehicleTypes(list as any);
      }

      if (!vmRes.error && Array.isArray(vmRes.data)) {
        const list = vmRes.data.map((row: any) => ({
          id: row.id ?? row.make_id ?? row.vehicle_make_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_make ?? row.vehicle_make_name ?? row.make_name ?? row.make ?? row.code ?? '',
          active: !!(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true))
        })).filter((i: any) => i.id !== null && i.name).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setVehicleMakes(list as any);
      } else if (vmRes.error) {
        console.error('Error loading vehicle makes:', vmRes.error);
        // Retry vehicle makes individually if Promise.all failed for just this one (unlikely but safe)
      }
    } catch (error: any) {
      console.error('Error loading dropdowns:', error);
      setError(error.message || 'Failed to load dropdown options');
    } finally {
      setDropdownsLoading(false);
    }
  };

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    setError('');
    try {
      // Use direct DB access first
      const { data, error } = await supabase
        .from('02_admin_register_fd4_vehicles')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      
      const vehiclesData = Array.isArray(data) ? data : [];
      
      // Transform data to match component interface
      const enhanced = vehiclesData.map((vehicle: any) => ({
        id: String(vehicle.id),
        veh_call_sign: vehicle.vehicle_callsign || vehicle.veh_call_sign || vehicle.call_sign || '',
        veh_type: vehicle.vehicle_type || '',
        veh_make: vehicle.vehicle_make || '',
        vehicle_model: vehicle.vehicle_model || '',
        model_year: vehicle.vehicle_year,
        vehicle_age: vehicle.vehicle_age,
        veh_plate_no: vehicle.vehicle_license_plate || '',
        veh_mms_no: formatMmsNumber(vehicle.vehicle_mms_number),
        veh_gate_pass_no: vehicle.vehicle_gate_pass || '',
        veh_gate_pass_expiry_date: vehicle.vehicle_gate_pass_expiry_date || '',
        vehicle_picture_url: vehicle.vehicle_picture_url || '',
        call_sign_name: vehicle.vehicle_callsign || vehicle.veh_call_sign || vehicle.call_sign || '',
        vehicle_type_name: vehicle.vehicle_type || '',
        vehicle_make_name: vehicle.vehicle_make || '',
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      }));

      setVehicles(enhanced as Vehicle[]);
      setError('');
    } catch (funcErr: any) {
      console.error('Error loading vehicles:', funcErr);
      setError(funcErr?.message || 'Failed to load vehicles');
    } finally {
      setVehiclesLoading(false);
    }
  };

  // Fallback loader: read tables via supabase-js and enrich names
  const loadVehiclesWithFallback = async () => {
    try {
      console.log('=== LOAD VEHICLES WITH FALLBACK DEBUG ===');
      
      const [{ data: vehicles, error: vErr }, { data: callSigns }, { data: vehicleTypes }, { data: vehicleMakes }] = await Promise.all([
        supabase.from('02_admin_register_fd4_vehicles').select('*').order('id', { ascending: true }),
        supabase.from('02_admin_register_fd5_vehicle_call_signs').select('*'),
        supabase.from('02_admin_register_fd6_vehicle_types').select('*'),
        supabase.from('02_admin_register_fd7_vehicle_makes').select('*')
      ]);
      
      console.log('Raw vehicles from database:', vehicles);
      console.log('First vehicle structure:', vehicles?.[0]);
      console.log('Available fields in first vehicle:', vehicles?.[0] ? Object.keys(vehicles[0]) : 'No vehicles');
      if (Array.isArray(callSigns)) {
        const mapped = callSigns.map((row: any) => ({
          id: row.id,
          name: row.name || row.vehicle_callsign || row.vehicle_call_sign || row.call_sign || row.code || '',
          active: Boolean(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true))
        }));
        const sorted = mapped.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setCallSigns(prev => {
          const sel = (vehicleData.veh_call_sign || '').toLowerCase();
          const exists = sorted.some(cs => (cs.name || '').toLowerCase() === sel);
          const next = exists || !sel ? sorted : [{ id: -1, name: vehicleData.veh_call_sign, active: true }, ...sorted].sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
          try { sessionStorage.setItem('veh_call_signs_list', JSON.stringify(next)); } catch {}
          return next;
        });
      }
      const vehicleTypesNorm = (Array.isArray(vehicleTypes) ? vehicleTypes : []).map((row: any) => ({
        id: row.id ?? row.type_id ?? row.vehicle_type_id ?? row.pk ?? null,
        name: row.name ?? row.vehicle_type ?? row.vehicle_type_name ?? row.type_name ?? '',
        active: !!(row.active ?? row.is_active ?? true)
      })).filter(vt => vt.id !== null && vt.name).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setVehicleTypes(vehicleTypesNorm as any);
      console.log('Vehicle makes:', vehicleMakes);
      console.log('Vehicle loading error:', vErr);
      
      if (vErr) throw vErr;
      
      if (!vehicles || vehicles.length === 0) {
        console.log('No vehicles found in database');
        setVehicles([]);
        return;
      }
      
      const byId = (arr: any[] | null | undefined, id: any) => (arr || []).find((x: any) => x.id === id);
      const enhanced = (vehicles || []).map((vehicle: any) => {
        const currentYear = new Date().getFullYear();
        const model_year =
          typeof vehicle?.model_year === 'number' ? vehicle.model_year :
          (vehicle?.model_year ? parseInt(vehicle.model_year) :
          (typeof vehicle?.vehicle_year === 'number' ? vehicle.vehicle_year : (vehicle?.vehicle_year ? parseInt(vehicle.vehicle_year) : null)));
        const vehicle_age = vehicle?.vehicle_age ?? (model_year ? (currentYear - model_year) : null);
        
        // Use call sign field from admin_register_fire_vehicles table, with fallbacks
        const callSignName = 
          vehicle.vehicle_callsign || 
          vehicle.veh_call_sign || 
          vehicle.call_sign || 
          vehicle.callsign || 
          vehicle.call_sign_name || 
          '';
        
        // Try different possible field names for vehicle type
        const vehicleTypeName = 
          byId(vehicleTypes, vehicle.vehicle_type_id)?.name || 
          byId(vehicleTypes, vehicle.type_id)?.name || 
          byId(vehicleTypes, vehicle.veh_type_id)?.name || 
          vehicle.vehicle_type || 
          vehicle.veh_type || 
          vehicle.type || 
          '';
        
        // Try different possible field names for vehicle make
        const vehicleMakeName = 
          byId(vehicleMakes, vehicle.vehicle_make_id)?.name || 
          byId(vehicleMakes, vehicle.make_id)?.name || 
          byId(vehicleMakes, vehicle.veh_make_id)?.name || 
          vehicle.vehicle_make || 
          vehicle.veh_make || 
          vehicle.make || 
          '';
        
        console.log('Processing vehicle:', {
          id: vehicle.id,
          call_sign_id: vehicle.call_sign_id,
          callSignName: callSignName,
          vehicle_type_id: vehicle.vehicle_type_id,
          vehicleTypeName: vehicleTypeName,
          available_fields: Object.keys(vehicle),
          vehicle_data: vehicle
        });
        
        return {
          id: String(vehicle.id),
          veh_call_sign: callSignName,
          veh_type: vehicleTypeName,
          veh_make: vehicleMakeName,
          vehicle_model: vehicle.vehicle_model || '',
          model_year,
          vehicle_age,
          veh_plate_no: (vehicle as any).vehicle_license_plate || vehicle.registration_plate_number || vehicle.plate_number || vehicle.plate_no || '',
          veh_mms_no: formatMmsNumber((vehicle as any).vehicle_mms_number ?? vehicle.mms_number),
          veh_gate_pass_no: vehicle.vehicle_gate_pass || vehicle.gate_pass_number || '',
          veh_gate_pass_expiry_date: vehicle.vehicle_gate_pass_expiry_date || vehicle.gate_pass_expiry_date || '',
          vehicle_picture_url: vehicle.vehicle_picture_url || '',
          call_sign_name: callSignName,
          vehicle_type_name: vehicleTypeName,
          vehicle_make_name: vehicleMakeName,
          created_at: vehicle.created_at,
          updated_at: vehicle.updated_at
        } as Vehicle;
      });
      setVehicles(enhanced as Vehicle[]);
      setError('');
    } catch (err: any) {
      console.error('Vehicles fallback failed:', err);
      setError(err?.message || 'Failed to load vehicles');
    }
  };

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // When Call Sign changes, auto-load vehicle data for viewing
  const handleCallSignChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const selected = (value || '').trim();
    console.log('🔥 CALL SIGN CHANGE DETECTED!');
    console.log('=== CALL SIGN CHANGE DEBUG ===');
    console.log('Selected call sign:', selected);
    console.log('Current vehicles in state:', vehicles.length);
    
    // Update selected call sign immediately for UI
    setVehicleData(prev => ({ ...prev, veh_call_sign: selected }));
    if (selected) persistSelectedCallSign(selected); else { try { sessionStorage.removeItem('veh_call_sign_selected'); } catch {} }
    // Ensure the selected call sign remains present in the dropdown options
    setCallSigns(prev => {
      if (prev.some(cs => (cs.name || '').toLowerCase() === selected.toLowerCase())) return prev;
      return [...prev, { id: -1, name: selected, active: true }];
    });

    // Clear validation error for call sign
    if (validationErrors['veh_call_sign']) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['veh_call_sign'];
        return newErrors;
      });
    }

    if (!selected) {
      console.log('No call sign selected, returning early');
      return;
    }

    const normalize = (s: any) => (s ?? '').toString().trim().toLowerCase();
    const compactNormalize = (s: any) => normalize(s).replace(/[^a-z0-9]/g, '');

    if (selected) {
      // Load vehicles directly to ensure we have fresh data
      console.log('Loading vehicles directly for matching...');
      let localVehicles: Vehicle[] = [];
      
      try {
        // Load from vehicle_registrations table directly
        const [{ data: vehicles }, { data: callSigns }, { data: vehicleTypes }, { data: vehicleMakes }] = await Promise.all([
          supabase.from('02_admin_register_fd4_vehicles').select('*').order('id', { ascending: true }),
          supabase.from('02_admin_register_fd5_vehicle_call_signs').select('*'),
          supabase.from('02_admin_register_fd6_vehicle_types').select('*'),
          supabase.from('02_admin_register_fd7_vehicle_makes').select('*')
        ]);
        
        if (Array.isArray(callSigns)) {
          const mapped = callSigns.map((row: any) => ({
            id: row.id,
            name: row.name || row.vehicle_callsign || row.vehicle_call_sign || row.call_sign || row.code || '',
            active: Boolean(row.active ?? row.is_active ?? (row.status ? String(row.status).toLowerCase() === 'active' : true))
          }));
          const sorted = mapped.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
          setCallSigns(prev => {
            const sel = (vehicleData.veh_call_sign || '').toLowerCase();
            const exists = sorted.some(cs => (cs.name || '').toLowerCase() === sel);
            const next = exists || !sel ? sorted : [{ id: -1, name: vehicleData.veh_call_sign, active: true }, ...sorted].sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
            try { sessionStorage.setItem('veh_call_signs_list', JSON.stringify(next)); } catch {}
            return next;
          });
        }
        const vehicleTypesNorm2 = (Array.isArray(vehicleTypes) ? vehicleTypes : []).map((row: any) => ({
          id: row.id ?? row.type_id ?? row.vehicle_type_id ?? row.pk ?? null,
          name: row.name ?? row.vehicle_type ?? row.vehicle_type_name ?? row.type_name ?? '',
          active: !!(row.active ?? row.is_active ?? true)
        })).filter(vt => vt.id !== null && vt.name).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setVehicleTypes(vehicleTypesNorm2 as any);
        console.log('Raw vehicles from database:', vehicles?.length);
        
        if (vehicles && vehicles.length > 0) {
          const byId = (arr: any[] | null | undefined, id: any) => (arr || []).find((x: any) => x.id === id);
          const enhanced = vehicles.map((vehicle: any) => {
            const currentYear = new Date().getFullYear();
            const model_year =
              typeof vehicle?.model_year === 'number' ? vehicle.model_year :
              (vehicle?.model_year ? parseInt(vehicle.model_year) :
              (typeof vehicle?.vehicle_year === 'number' ? vehicle.vehicle_year : (vehicle?.vehicle_year ? parseInt(vehicle.vehicle_year) : null)));
            const vehicle_age = vehicle?.vehicle_age ?? (model_year ? (currentYear - model_year) : null);
            
            // Use call sign field from admin_register_fire_vehicles table, with fallbacks
            const callSignName = 
              vehicle.vehicle_callsign || 
              vehicle.veh_call_sign || 
              vehicle.call_sign || 
              vehicle.callsign || 
              vehicle.call_sign_name || 
              '';
            
            // Try different possible field names for vehicle type
            const vehicleTypeName = 
              byId(vehicleTypes, vehicle.vehicle_type_id)?.name || 
              byId(vehicleTypes, vehicle.type_id)?.name || 
              vehicle.vehicle_type || 
              vehicle.veh_type || 
              vehicle.type || 
              '';
            
            // Try different possible field names for vehicle make
            const vehicleMakeName = 
              byId(vehicleMakes, vehicle.vehicle_make_id)?.name || 
              byId(vehicleMakes, vehicle.make_id)?.name || 
              vehicle.vehicle_make || 
              vehicle.veh_make || 
              vehicle.make || 
              '';
            
            return {
              id: String(vehicle.id),
              veh_call_sign: callSignName,
              veh_type: vehicleTypeName,
              veh_make: vehicleMakeName,
              vehicle_model: vehicle.vehicle_model || '',
              model_year,
              vehicle_age,
              veh_plate_no: (vehicle as any).vehicle_license_plate || vehicle.registration_plate_number || vehicle.plate_number || vehicle.plate_no || '',
              veh_mms_no: formatMmsNumber((vehicle as any).vehicle_mms_number ?? vehicle.mms_number),
              veh_gate_pass_no: vehicle.vehicle_gate_pass || vehicle.gate_pass_number || '',
              veh_gate_pass_expiry_date: vehicle.vehicle_gate_pass_expiry_date || vehicle.gate_pass_expiry_date || '',
              vehicle_picture_url: vehicle.vehicle_picture_url || '',
              call_sign_name: callSignName,
              vehicle_type_name: vehicleTypeName,
              vehicle_make_name: vehicleMakeName,
              created_at: vehicle.created_at,
              updated_at: vehicle.updated_at
            } as Vehicle;
          });
          
          localVehicles = enhanced;
          console.log('Enhanced vehicles created:', localVehicles.length);
          setVehicles(localVehicles); // Update state for future use
        }
      } catch (err) {
        console.error('Failed to load vehicles directly:', err);
      }
      
      // If direct loading failed, try the function as backup
      if (localVehicles.length === 0) {
        try {
          const { data, error } = await supabase.functions.invoke('vehicle-crud', { method: 'GET' });
          console.log('Vehicle-crud function response:', { data, error });
          if (!error && data?.data) {
            localVehicles = data.data as Vehicle[];
            console.log('Vehicles loaded from function:', localVehicles.length, 'vehicles');
            setVehicles(localVehicles);
          }
        } catch (err) {
          console.error('Failed to refresh vehicles via function:', err);
        }
      }

      const targetNorm = normalize(selected);
      const targetCompact = compactNormalize(selected);
      
      // Debug: log vehicle structure and available call signs
      console.log('=== VEHICLE MATCHING DEBUG ===');
      console.log('Selected call sign:', selected);
      console.log('Target normalized:', targetNorm);
      console.log('Target compact:', targetCompact);
      console.log('Total vehicles to search:', localVehicles.length);
      if (localVehicles.length > 0) {
        console.log('First vehicle structure:', localVehicles[0]);
        console.log('Available call signs in vehicles:', localVehicles.map(v => ({
          call_sign_name: v.call_sign_name,
          veh_call_sign: v.veh_call_sign,
          veh_type: v.veh_type
        })));
      }
      
      // Enhanced matching logic to handle different data structures
      let match = localVehicles.find(v => {
        // Primary: match against vehicle call sign field
        if (v.veh_call_sign && normalize(v.veh_call_sign) === targetNorm) return true;
        
        // Fallback: try other possible call sign fields
        if (v.call_sign_name && normalize(v.call_sign_name) === targetNorm) return true;

        return false;
      });
      
      console.log('Match found:', match ? 'YES' : 'NO');
      if (match) {
        console.log('Matched vehicle:', match);
      }
      
      if (!match) {
        match = localVehicles.find(v => {
          if (v.veh_call_sign && compactNormalize(v.veh_call_sign) === targetCompact) return true;
          if (v.call_sign_name && compactNormalize(v.call_sign_name) === targetCompact) return true;
          return false;
        });
      }
      
      if (!match) {
        match = localVehicles.find(v => {
          if (v.veh_call_sign && normalize(v.veh_call_sign).includes(targetNorm)) return true;
          if (v.call_sign_name && normalize(v.call_sign_name).includes(targetNorm)) return true;
          return false;
        });
      }

      if (match) {
        setPendingVehicle(match);
        setConfirmMode('exists');
        setConfirmOpen(true);
        setFormLocked(true);
        return;
      }

      setPendingCallSign(selected);
      setConfirmMode('new');
      setConfirmOpen(true);
    } else {
      // Blank selection: clear all fields
      setVehicleData({
        veh_call_sign: '',
        veh_type: '',
        veh_make: '',
        vehicle_model: '',
        model_year: '',
        vehicle_age: null,
        veh_plate_no: '',
        veh_mms_no: '',
        veh_gate_pass_no: '',
        veh_gate_pass_expiry_date: '',
        vehicle_picture_url: '',
        vehiclePicture: null
      });
      setImagePreview('');
      setIsEditing(false);
      setEditingVehicleId(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setVehicleData(prev => ({ ...prev, vehiclePicture: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setImageUploading(true);
    
    try {
      const timestamp = Date.now();
      const fileName = `vehicle-${timestamp}-${file.name}`;
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('vehicle-image-upload', {
        body: {
          imageData: base64Data,
          fileName
        }
      });

      if (error) {
        throw error;
      }

      return data.data.publicUrl;
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Call Sign is required
    if (!vehicleData.veh_call_sign.trim()) {
      errors.veh_call_sign = 'Call Sign is required';
    }
    
    // Validate model year if provided
    if (vehicleData.model_year) {
      const year = parseInt(vehicleData.model_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        errors.model_year = `Model year must be between 1900 and ${currentYear + 1}`;
      }
    }
    
    // Validate date if provided
    if (vehicleData.veh_gate_pass_expiry_date) {
      const date = new Date(vehicleData.veh_gate_pass_expiry_date);
      if (isNaN(date.getTime())) {
        errors.veh_gate_pass_expiry_date = 'Please enter a valid date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkDuplicates = async (): Promise<string[]> => {
    const msgs: string[] = [];
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd4_vehicles')
        .select('*');
      if (error) {
        console.warn('Duplicate check read failed:', error);
        return msgs;
      }
      const list = Array.isArray(data) ? data : [];
      const norm = (s: any) => (s ?? '').toString().trim().toLowerCase();
      const targetPlate = norm(vehicleData.veh_plate_no);
      const targetMms = norm(vehicleData.veh_mms_no);
      const targetGate = norm(vehicleData.veh_gate_pass_no);

      const isSameId = (row: any) => isEditing && editingVehicleId && String(row.id) === String(editingVehicleId);
      const fields = (row: any) => ({
        plate: norm(row.vehicle_license_plate ?? row.registration_plate_number ?? row.plate_number ?? row.plate_no),
        mms: norm(row.vehicle_mms_number ?? row.mms_number),
        gate: norm(row.vehicle_gate_pass ?? row.gate_pass_number)
      });

      for (const row of list) {
        if (isSameId(row)) continue;
        const f = fields(row);
        if (targetPlate && f.plate && targetPlate === f.plate) msgs.push(`Duplicate Plate Number: ${vehicleData.veh_plate_no}`);
        if (targetMms && f.mms && targetMms === f.mms) msgs.push(`Duplicate MMS #: ${vehicleData.veh_mms_no}`);
        if (targetGate && f.gate && targetGate === f.gate) msgs.push(`Duplicate Gate Pass #: ${vehicleData.veh_gate_pass_no}`);
      }
    } catch (e) {
      console.warn('Duplicate check exception:', e);
    }
    return Array.from(new Set(msgs));
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

    // Declare diagnostics variables outside try so they are visible in catch/finally
    let transport: 'direct-fetch' | 'invoke' | 'unknown' = 'unknown';
    const supabaseIsFallback = !!isSupabaseFallback;

    try {
      let imageUrl = vehicleData.vehicle_picture_url;
      
      // duplicate checks
      const duplicates = await checkDuplicates();
      if (duplicates.length > 0) {
        setDupMessages(duplicates);
        setDupModalOpen(true);
        return;
      }

      // Upload image if new file selected
      if (vehicleData.vehiclePicture) {
        imageUrl = await uploadImage(vehicleData.vehiclePicture);
      }
      
      const currentYear = new Date().getFullYear();
      const computedAge = vehicleData.model_year ? (currentYear - parseInt(vehicleData.model_year)) : null;
      const submitData = {
        vehicle_callsign: vehicleData.veh_call_sign.trim(),
        vehicle_type: vehicleData.veh_type.trim() || null,
        vehicle_make: vehicleData.veh_make.trim() || null,
        vehicle_model: vehicleData.vehicle_model.trim() || null,
        vehicle_year: vehicleData.model_year ? parseInt(vehicleData.model_year) : null,
        vehicle_age: computedAge,
        vehicle_license_plate: vehicleData.veh_plate_no.trim() || null,
        vehicle_mms_number: vehicleData.veh_mms_no.trim() || null,
        vehicle_gate_pass: vehicleData.veh_gate_pass_no.trim() || null,
        vehicle_gate_pass_expiry_date: formatDateForInput(vehicleData.veh_gate_pass_expiry_date) || null,
        vehicle_picture_url: imageUrl || null
      };
      
      if (isEditing) {
        if (!editingVehicleId) {
          throw new Error('No vehicle selected to update.');
        }
        transport = 'direct-fetch';
        const { data, error } = await supabase
          .from('02_admin_register_fd4_vehicles')
          .update(submitData)
          .eq('id', editingVehicleId)
          .select()
          .single();
        if (error) {
          throw new Error(error.message || 'Update failed');
        }
      } else {
        transport = 'direct-fetch';
        const { data, error } = await supabase
          .from('02_admin_register_fd4_vehicles')
          .insert([submitData])
          .select()
          .single();
        if (error) {
          throw new Error(error.message || 'Insert failed');
        }
      }
      
      setSuccessModalMessage(isEditing ? 'Vehicle updated successfully!' : 'Vehicle registered successfully!');
      setSuccessModalOpen(true);
      
    } catch (error: any) {
      console.error('Error submitting vehicle:', error);
      const transportTag = typeof transport === 'string' ? transport : 'unknown';
      const supabaseTag = supabaseIsFallback ? 'supabase-fallback' : 'supabase-live';
      const suffix = ` (transport: ${transportTag}; ${supabaseTag})`;
      setError((error.message || 'Failed to save vehicle') + suffix);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setVehicleData({
      veh_call_sign: (vehicle as any).veh_call_sign || (vehicle as any).call_sign_name || (vehicle as any).vehicle_callsign || '',
      veh_type: (vehicle as any).veh_type || (vehicle as any).vehicle_type || '',
      veh_make: (vehicle as any).veh_make || (vehicle as any).vehicle_make || '',
      vehicle_model: (vehicle as any).vehicle_model || (vehicle as any).model || '',
      model_year: ((vehicle as any).model_year ?? (vehicle as any).vehicle_year ?? '')?.toString() || '',
      vehicle_age: (vehicle as any).vehicle_age ?? null,
      veh_plate_no: (vehicle as any).veh_plate_no || (vehicle as any).vehicle_license_plate || (vehicle as any).registration_plate_number || (vehicle as any).plate_number || '',
      veh_mms_no: formatMmsNumber((vehicle as any).veh_mms_no ?? (vehicle as any).vehicle_mms_number ?? (vehicle as any).mms_number ?? ''),
      veh_gate_pass_no: (vehicle as any).veh_gate_pass_no || (vehicle as any).vehicle_gate_pass || (vehicle as any).gate_pass_number || '',
      veh_gate_pass_expiry_date: formatDateForInput((vehicle as any).veh_gate_pass_expiry_date ?? (vehicle as any).vehicle_gate_pass_expiry_date ?? (vehicle as any).gate_pass_expiry_date ?? '') || '',
      vehicle_picture_url: (vehicle as any).vehicle_picture_url || '',
      vehiclePicture: null
    });
    setImagePreview((vehicle as any).vehicle_picture_url || '');
    setIsEditing(true);
    setEditingVehicleId((vehicle as any).id);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (vehicleId: string, vehicleInfo: string) => {
    if (!window.confirm(`Are you sure you want to delete vehicle: ${vehicleInfo}?`)) {
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      const { data, error } = await supabase.functions.invoke('vehicle-crud', {
        body: {
          action: 'delete',
          vehicleId
        }
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess('Vehicle deleted successfully!');
      await loadVehicles();
      
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      setError(error.message || 'Failed to delete vehicle');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadDropdowns(), loadVehicles()]);
  };

  // Controlled edit: lock/unlock without clearing loaded data
  const cancelEdit = () => {
    setIsEditing(false);
    setFormLocked(true);
    setError('');
    setSuccess('');
  };

  const startEdit = () => {
    if (!editingVehicleId) {
      // Only allow edit when a vehicle is loaded by Call Sign
      return;
    }
    setFormLocked(false);
    setIsEditing(true);
  };

  const handleCancelRegistration = () => {
    setVehicleData({
      veh_call_sign: '',
      veh_type: '',
      veh_make: '',
      vehicle_model: '',
      model_year: '',
      vehicle_age: null,
      veh_plate_no: '',
      veh_mms_no: '',
      veh_gate_pass_no: '',
      veh_gate_pass_expiry_date: '',
      vehicle_picture_url: '',
      vehiclePicture: null
    });
    setImagePreview('');
    setValidationErrors({});
    setIsEditing(false);
    setEditingVehicleId(null);
    setFormLocked(true);
  };

  const dismissSuccessModal = async () => {
    setSuccessModalOpen(false);
    await loadVehiclesWithFallback();
    handleCancelRegistration();
  };

  const handleManageDropdowns = (type: string) => {
    const tabMapping: Record<string, DropdownType> = {
      'Call Signs': 'call_signs',
      'Vehicle Types': 'vehicle_types',
      'Vehicle Makes': 'vehicle_makes'
    };
    const tab = tabMapping[type] || 'call_signs';
    setOptionsType(tab);
    setOptionsModalOpen(true);
  };

  const handleOptionsUpdate = async () => {
    await loadDropdowns();
  };

  /**
   * Convert image URL to base64 data
   * @param imageUrl - The URL of the image to convert
   * @returns Promise<string | null> - Base64 data or null if conversion fails
   */
  // Removed local image conversion helper; using centralized getPDFLogo for consistent branding

  /**
   * Calculate expiry status based on gate pass expiry date
   * @param expiryDate - The expiry date string
   * @returns Object with status, color, and description
   */
  const getGatePassExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) {
      return {
        status: 'none' as const,
        daysRemaining: null,
        description: 'No expiry date'
      };
    }

    // Use timezone-aware utilities for accurate local date calculations
    const today = getStartOfDay(getCurrentLocalDate());
    const expiry = getStartOfDay(expiryDate);
    const daysRemaining = daysBetween(today, expiry);

    if (daysRemaining < 0) {
      return {
        status: 'expired' as const,
        daysRemaining,
        description: `Expired ${Math.abs(daysRemaining)} days ago`
      };
    } else if (daysRemaining <= 7) {
      return {
        status: 'urgent' as const,
        daysRemaining,
        description: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
      };
    } else if (daysRemaining <= 30) {
      return {
        status: 'warning' as const,
        daysRemaining,
        description: `${daysRemaining} days remaining`
      };
    } else {
      return {
        status: 'valid' as const,
        daysRemaining,
        description: `${daysRemaining} days remaining`
      };
    }
  };

  // Format MMS number by removing a trailing '.0' and padding 5-digit numbers
  const formatMmsNumber = (value: string | number) => {
    if (value === null || value === undefined) return '-';
    const trimmed = value.toString().trim();
    const withoutDecimal = trimmed.endsWith('.0') ? trimmed.slice(0, -2) : trimmed;
    // If it's exactly a 5-digit number, add leading 0 only if missing
    if (/^\d{5}$/.test(withoutDecimal)) {
      return withoutDecimal.startsWith('0') ? withoutDecimal : `0${withoutDecimal}`;
    }
    // If it contains a contiguous 5-digit sequence, pad that specific segment
    const contiguous = withoutDecimal.match(/\d{5}/);
    if (contiguous) {
      const seq = contiguous[0];
      if (!seq.startsWith('0')) {
        return withoutDecimal.replace(seq, `0${seq}`);
      }
    }
    return withoutDecimal || '-';
  };

  const generatePDF = async () => {
    if (vehicles.length === 0) {
      setError('No vehicles to print. Please register some vehicles first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Get department information - try to get the first available department
      let departmentName = 'Airport Rescue & Fire Fighting Services';
      let departmentType = '';
      let departmentLogoUrl = null;
      
      // If we have departments loaded, use the first one
      if (departments.length > 0) {
        const dept = departments[0];
        departmentName = dept.dept_name;
        // Support both API shapes: department_type and dept_type
        departmentType = (dept as any).department_type || (dept as any).dept_type || '';
        departmentLogoUrl = dept.dept_picture_url;
      }

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Calculate summary information
      const totalVehicles = vehicles.length;
      const summaryText = `Summary: Total Vehicles: ${totalVehicles}`;
      
      // Convert department logo URL to base64 if available
      const logoBase64: string | undefined = await getPDFLogo(departmentLogoUrl) || undefined;
      
      // Setup VFH A4 standard PDF with logo, header, and get table configuration
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64,
        data: {
          departmentName: departmentName,
          departmentType: departmentType,
          reportTitle: "Vehicle Registration Report",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });
      
      // Prepare table data
      const tableData = vehicles.map(vehicle => [
        vehicle.call_sign_name || '-',
        vehicle.vehicle_type_name || '-',
        vehicle.vehicle_make_name || '-',
        vehicle.vehicle_model || '-',
        vehicle.vehicle_age !== null ? vehicle.vehicle_age.toString() : '-',
        vehicle.veh_plate_no || '-',
        formatMmsNumber(vehicle.veh_mms_no),
        vehicle.veh_gate_pass_no || '-',
        vehicle.veh_gate_pass_expiry_date || '-'
      ]);

      // Create table using VFH A4 standard configuration
      autoTable(doc, {
        head: [[
          'Call Sign',
          'Vehicle Type',
          'Vehicle Make',
          'Model',
          'Age',
          'Plate #',
          'MMS #',
          'Gate Pass #',
          'Gate Pass Expiry'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });

      // Generate PDF data URI and save to sessionStorage for viewer access
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/register');
      sessionStorage.setItem('pdf_source_path', '/admin/register/vehicles');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess('PDF report generated successfully! Opening in viewer...');
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      {confirmOpen && (
        <ModalOverlay>
          <ModalBox>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              {confirmMode === 'exists' ? 'Vehicle Already Exists' : 'Add Vehicle'}
            </div>
            <div style={{ fontSize: '14px' }}>
              {confirmMode === 'exists'
                ? `A vehicle with call sign "${pendingVehicle?.veh_call_sign || pendingVehicle?.call_sign_name || ''}" exists. Load its details into the form?`
                : `No vehicle found for call sign "${pendingCallSign}". Do you want to add it?`}
            </div>
            <ModalActions>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                }}
                style={{
                  padding: '6px 10px',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
              {confirmMode === 'exists' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!pendingVehicle) return;
                    setVehicleData({
                      veh_call_sign: pendingVehicle.call_sign_name || pendingVehicle.veh_call_sign || '',
                      veh_type: pendingVehicle.vehicle_type_name || pendingVehicle.veh_type || '',
                      veh_make: pendingVehicle.vehicle_make_name || pendingVehicle.veh_make || '',
                      vehicle_model: pendingVehicle.vehicle_model || '',
                      model_year: pendingVehicle.model_year?.toString() || '',
                      vehicle_age: pendingVehicle.vehicle_age ?? null,
                      veh_plate_no: pendingVehicle.veh_plate_no || '',
                      veh_mms_no: formatMmsNumber(pendingVehicle.veh_mms_no),
                      veh_gate_pass_no: pendingVehicle.veh_gate_pass_no || '',
                      veh_gate_pass_expiry_date: formatDateForInput(pendingVehicle.veh_gate_pass_expiry_date) || '',
                      vehicle_picture_url: pendingVehicle.vehicle_picture_url || '',
                      vehiclePicture: null
                    });
                    persistSelectedCallSign(pendingVehicle.call_sign_name || pendingVehicle.veh_call_sign || '');
                    setImagePreview(pendingVehicle.vehicle_picture_url || '');
                    setIsEditing(true);
                    setEditingVehicleId(pendingVehicle.id);
                    setFormLocked(false);
                    setError('');
                    setSuccess('Vehicle loaded for editing.');
                    setConfirmOpen(false);
                  }}
                  style={{
                    padding: '6px 10px',
                    background: '#1177BB',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Load Details
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVehicleData(prev => ({
                      ...prev,
                      veh_call_sign: pendingCallSign,
                      veh_type: '',
                      veh_make: '',
                      vehicle_model: '',
                      model_year: '',
                      vehicle_age: null,
                      veh_plate_no: '',
                      veh_mms_no: '',
                      veh_gate_pass_no: '',
                      veh_gate_pass_expiry_date: '',
                      vehicle_picture_url: '',
                      vehiclePicture: null
                    }));
                    persistSelectedCallSign(pendingCallSign);
                    setIsEditing(false);
                    setEditingVehicleId(null);
                    setFormLocked(false);
                    setSuccess('Add details and submit to register this vehicle.');
                    setError('');
                    setConfirmOpen(false);
                  }}
                  style={{
                    padding: '6px 10px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Add Vehicle
                </button>
              )}
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
      

      {/* Header Section */}
      <Section aria-labelledby="vehicles-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="vehicles-title">
                Register Your Vehicles Here
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Fire Vehicle Registration system provides comprehensive management of all emergency response vehicles operated by the Airport Rescue & Fire Fighting Services at King Fahd International Airport. Our vehicle registration encompasses Aircraft Rescue & Firefighting (ARFF) vehicles, support vehicles, command units, and specialised emergency response vehicles, providing comprehensive visibility into fleet capabilities and operational requirements.
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
                  alt="Register Vehicles" 
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

      {/* Vehicle Registration Form */}
      <FormSection>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SubTitle style={{ margin: 0 }}>
            {isEditing ? 'Update Vehicle Information' : 'Vehicle Registration Form'}
          </SubTitle>
          <SubmitButton
            type="button"
            onClick={() => {
              setIsEditing(false);
              setEditingVehicleId(null);
              setFormLocked(false);
            }}
            disabled={!formLocked}
          >
            Register New Vehicle
          </SubmitButton>
        </div>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          {/* Row 1: Call Sign, Vehicle Type, Vehicle Make */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="veh_call_sign">Call Sign *</Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {callSigns.filter(cs => cs.active).length > 0 ? (
                  <Select
                    id="veh_call_sign"
                    name="veh_call_sign"
                    value={vehicleData.veh_call_sign}
                    onChange={handleCallSignChange}
                    $hasError={!!validationErrors.veh_call_sign}
                    required
                    style={{ flex: 1 }}
                    disabled={formLocked}
                  >
                    <option value="">Select Call Sign</option>
                    {callSigns
                      .filter(cs => cs.active)
                      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                      .map(callSign => (
                        <option key={callSign.id} value={callSign.name}>
                          {callSign.name}
                        </option>
                      ))}
                  </Select>
                ) : (
                  <Input
                    type="text"
                    id="veh_call_sign"
                    name="veh_call_sign"
                    value={vehicleData.veh_call_sign}
                    onChange={handleInputChange}
                    $hasError={!!validationErrors.veh_call_sign}
                    required
                    placeholder="Enter Call Sign"
                    disabled={formLocked}
                  />
                )}
                <UpdateOptionsLink
                  type="button"
                  onClick={() => handleManageDropdowns('Call Signs')}
                  style={{ marginLeft: '8px' }}
                  disabled={formLocked}
                >
                  Options
                </UpdateOptionsLink>
              </div>
              {validationErrors.veh_call_sign && (
                <ErrorMessage>{validationErrors.veh_call_sign}</ErrorMessage>
              )}
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="veh_type">Vehicle Type</Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  id="veh_type"
                  name="veh_type"
                  value={vehicleData.veh_type}
                  onChange={handleInputChange}
                  disabled={formLocked}
                  style={{ flex: 1 }}
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.filter(vt => vt.active).map(vehicleType => (
                    <option key={vehicleType.id} value={vehicleType.name}>
                      {vehicleType.name}
                    </option>
                  ))}
                </Select>
                <UpdateOptionsLink
                  type="button"
                  onClick={() => handleManageDropdowns('Vehicle Types')}
                  style={{ marginLeft: '8px' }}
                  disabled={formLocked}
                >
                  Options
                </UpdateOptionsLink>
              </div>
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="veh_make">Vehicle Make</Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  id="veh_make"
                  name="veh_make"
                  value={vehicleData.veh_make}
                  onChange={handleInputChange}
                  disabled={formLocked}
                  style={{ flex: 1 }}
                >
                  <option value="">Select Vehicle Make</option>
                  {vehicleMakes.filter(vm => vm.active).map(vehicleMake => (
                    <option key={vehicleMake.id} value={vehicleMake.name}>
                      {vehicleMake.name}
                    </option>
                  ))}
                </Select>
                <UpdateOptionsLink
                  type="button"
                  onClick={() => handleManageDropdowns('Vehicle Makes')}
                  style={{ marginLeft: '8px' }}
                  disabled={formLocked}
                >
                  Options
                </UpdateOptionsLink>
              </div>
            </FieldColumn>
          </ThreeColumnRow>
          
          {/* Row 2: Vehicle Model, Model Year, Vehicle Age */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="vehicle_model">Vehicle Model</Label>
              <Input
                type="text"
                id="vehicle_model"
                name="vehicle_model"
                value={vehicleData.vehicle_model}
                onChange={handleInputChange}
                placeholder="Enter vehicle model"
                disabled={formLocked}
              />
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="model_year">Model Year</Label>
              <Input
                type="number"
                id="model_year"
                name="model_year"
                value={vehicleData.model_year}
                onChange={handleInputChange}
                placeholder="Enter model year"
                min="1900"
                max={new Date().getFullYear() + 1}
                $hasError={!!validationErrors.model_year}
                disabled={formLocked}
              />
              {validationErrors.model_year && (
                <ErrorMessage>{validationErrors.model_year}</ErrorMessage>
              )}
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="vehicle_age">Vehicle Age (Auto-calculated)</Label>
              <Input
                type="text"
                id="vehicle_age"
                value={vehicleData.vehicle_age !== null ? `${vehicleData.vehicle_age} years` : ''}
                disabled
                placeholder="Will be calculated automatically"
              />
            </FieldColumn>
          </ThreeColumnRow>
          
          {/* Row 3: Registration/Plate #, MMS #, Gate Pass # */}
          <ThreeColumnRow>
            <FieldColumn>
              <Label htmlFor="veh_plate_no">Registration/Plate #</Label>
              <Input
                type="text"
                id="veh_plate_no"
                name="veh_plate_no"
                value={vehicleData.veh_plate_no}
                onChange={handleInputChange}
                placeholder="Enter registration/plate number"
                disabled={formLocked}
              />
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="veh_mms_no">MMS #</Label>
              <Input
                type="text"
                id="veh_mms_no"
                name="veh_mms_no"
                value={vehicleData.veh_mms_no}
                onChange={handleInputChange}
                placeholder="Enter MMS number"
                disabled={formLocked}
              />
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="veh_gate_pass_no">Gate Pass #</Label>
              <Input
                type="text"
                id="veh_gate_pass_no"
                name="veh_gate_pass_no"
                value={vehicleData.veh_gate_pass_no}
                onChange={handleInputChange}
                placeholder="Enter gate pass number"
                disabled={formLocked}
              />
            </FieldColumn>
          </ThreeColumnRow>
          
          {/* Row 4: Gate Pass Expiry Date, Vehicle Picture */}
          <TwoColumnRow>
            <FieldColumn>
              <Label htmlFor="veh_gate_pass_expiry_date">Gate Pass Expiry Date</Label>
              <Input
                type="date"
                id="veh_gate_pass_expiry_date"
                name="veh_gate_pass_expiry_date"
                value={vehicleData.veh_gate_pass_expiry_date}
                onChange={handleInputChange}
                $hasError={!!validationErrors.veh_gate_pass_expiry_date}
                disabled={formLocked}
              />
              {validationErrors.veh_gate_pass_expiry_date && (
                <ErrorMessage>{validationErrors.veh_gate_pass_expiry_date}</ErrorMessage>
              )}
            </FieldColumn>
            
            <FieldColumn>
              <Label htmlFor="vehiclePicture">Vehicle Picture</Label>
              <FileInput
                type="file"
                id="vehiclePicture"
                accept="image/*"
                onChange={handleFileChange}
                disabled={formLocked}
              />
              {imagePreview && (
                <ImagePreview src={imagePreview} alt="Vehicle preview" />
              )}
            </FieldColumn>
          </TwoColumnRow>
          
          <div style={{ marginTop: '20px' }}>
            <SubmitButton type="submit" disabled={formLocked || loading || dropdownsLoading || imageUploading}>
              {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Vehicle' : 'Register Vehicle')}
            </SubmitButton>

            {formLocked && editingVehicleId && (
              <SubmitButton type="button" onClick={startEdit} style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}>
                Edit Vehicle
              </SubmitButton>
            )}

            <SubmitButton type="button" onClick={handleCancelRegistration} style={{ marginLeft: '10px', backgroundColor: '#6c757d' }} disabled={formLocked || loading || dropdownsLoading || imageUploading}>
              Cancel Registration / Update
            </SubmitButton>
          </div>
        </form>
      </FormSection>

      {successModalOpen && (
        <ModalOverlay>
          <ModalBox role="dialog" aria-modal="true" aria-labelledby="vehicle-success-title">
            <h3 id="vehicle-success-title" style={{ margin: 0, color: '#1177BB' }}>Success</h3>
            <p style={{ marginTop: 8 }}>{successModalMessage}</p>
            <ModalActions>
              <SubmitButton type="button" onClick={dismissSuccessModal}>OK</SubmitButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {dupModalOpen && (
        <ModalOverlay>
          <ModalBox role="dialog" aria-modal="true" aria-labelledby="vehicle-duplicate-title">
            <h3 id="vehicle-duplicate-title" style={{ margin: 0, color: '#dc3545' }}>Duplicate Detected</h3>
            <div style={{ marginTop: 8 }}>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {dupMessages.map((m, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>{m}</li>
                ))}
              </ul>
            </div>
            <ModalActions>
              <SubmitButton type="button" onClick={() => setDupModalOpen(false)} style={{ backgroundColor: '#6c757d' }}>Close</SubmitButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Registered Vehicles section moved to its own page */}
      <VehicleOptionsModal
        isOpen={optionsModalOpen}
        type={optionsType}
        onClose={() => setOptionsModalOpen(false)}
        onOptionsUpdate={handleOptionsUpdate}
      />
    </MainContent>
  );
};
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;
