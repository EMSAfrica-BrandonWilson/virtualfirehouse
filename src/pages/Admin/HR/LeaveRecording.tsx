import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePageImage } from '../../../hooks/usePageImage';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

// Header layout to align with app-wide design
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
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
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

const FormSection = styled.div`
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 2px solid #1177BB;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  position: relative; /* allow absolute overlay inside */
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;



const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const LeftItem = styled(FormGroup)`
  grid-column: 1;
`;
const RightItem = styled(FormGroup)`
  grid-column: 2;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
  
  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const FormSelect = styled.select`
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  background-color: white;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
  
  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const DocumentPreview = styled.div`
  border: 2px dashed #1177BB;
  border-radius: 4px;
  padding: 10px;
  background: #fff;
  position: absolute; /* overlay without affecting grid flow */
  top: 0;
  right: 0;
  width: calc(33.333% - 8px); /* roughly one column width minus gap */
  height: 300px; /* compact height */
  overflow: hidden; /* constrain overflowing content */
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    position: static;
    width: 100%;
    height: auto;
  }
`;

const PreviewTitle = styled.div`
  font-weight: 600;
  color: #333;
`;

const PreviewContent = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1; /* fill remaining space */
  min-height: 0;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  flex: 1;
`;

const PreviewFrame = styled.object`
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' }>`
  background-color: ${props => 
    props.$variant === 'primary' ? '#28a745' : 
    props.$variant === 'secondary' ? '#FF9900' : 
    props.$variant === 'danger' ? '#dc3545' :
    '#6c757d'
  };
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  width: fit-content;
  
  &:hover:not(:disabled) {
    background-color: ${props => 
      props.$variant === 'primary' ? '#218838' : 
      props.$variant === 'secondary' ? '#e08800' : 
      props.$variant === 'danger' ? '#c82333' :
      '#5a6268'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #FFE4E1;
  border: 2px solid #DC143C;
  color: #DC143C;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #F0FFF0;
  border: 2px solid #008000;
  color: #008000;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchResults = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #1177BB;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.$visible ? 'block' : 'none'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const SearchResultItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  
  &:hover {
    background-color: #e3f2fd;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchResultName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const SearchResultDetails = styled.div`
  font-size: 12px;
  color: #666;
`;

interface EmployeeSearchResult {
  staff_id: number;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  rank_name?: string;
  rank_id?: number;
}

interface FormData {
  staffId: string;
  employeeName: string;
  employeeNumber: string;
  employeeRank: string;
  firstLeaveDate: string;
  lastLeaveDate: string;
  totalLeaveDays: number;
  leaveType: string;
  file?: File | null;
  fileUrl?: string;
}

const LEAVE_TYPES = [
  'Annual Leave',
  'Compassionate Leave',
  'Emergency Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Sick Leave',
  'Study Leave',
  'Toil',
  'Unpaid Leave'
];

export const LeaveRecording: React.FC = () => {
  // Page header image (dynamic via Supabase with static fallback)
  const { imageUrl: headerImageUrl, loading: headerLoading } = usePageImage('leave-recording', '/images/HR.png');
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formActive, setFormActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    staffId: '',
    employeeName: '',
    employeeNumber: '',
    employeeRank: '',
    firstLeaveDate: '',
    lastLeaveDate: '',
    totalLeaveDays: 0,
    leaveType: '',
    file: null,
    fileUrl: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [employeeSearchResults, setEmployeeSearchResults] = useState<EmployeeSearchResult[]>([]);
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [employeeNumberSearchResults, setEmployeeNumberSearchResults] = useState<EmployeeSearchResult[]>([]);
  const [showEmployeeNumberSearch, setShowEmployeeNumberSearch] = useState(false);
  const [rankMap, setRankMap] = useState<Record<number, string>>({});
  const employeeNumberSearchDebounceRef = React.useRef<number | null>(null);

  useEffect(() => {
    // Calculate total leave days when dates change
    if (formData.firstLeaveDate && formData.lastLeaveDate) {
      const firstDate = new Date(formData.firstLeaveDate);
      const lastDate = new Date(formData.lastLeaveDate);
      const diffTime = lastDate.getTime() - firstDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        setFormData(prev => ({ ...prev, totalLeaveDays: diffDays }));
      } else {
        setFormData(prev => ({ ...prev, totalLeaveDays: 0 }));
      }
    } else {
      setFormData(prev => ({ ...prev, totalLeaveDays: 0 }));
    }
  }, [formData.firstLeaveDate, formData.lastLeaveDate]);

  // Load ranks once to map rank_id -> rank_name for fallback when relation is unavailable
  useEffect(() => {
    const loadRanks = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('dropdown-options-crud', { method: 'GET' });
        if (error) return;
        const ranks = (data?.data?.ranks || []) as Array<{ id: number; name: string }>;
        const map: Record<number, string> = {};
        ranks.forEach(r => { if (r && typeof r.id === 'number') map[r.id] = r.name; });
        setRankMap(map);
      } catch {
        // ignore errors
      }
    };
    loadRanks();
  }, []);

  const searchEmployees = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setEmployeeSearchResults([]);
      setShowEmployeeSearch(false);
      return;
    }

    try {
      const selectWith = `
          staff_id,
          employee_number,
          first_name,
          middle_name,
          last_name,
          rank_id,
          ranks(id, name, code, description)
        `;
      const selectWithout = `
          staff_id,
          employee_number,
          first_name,
          middle_name,
          last_name,
          rank_id
        `;

      let data: any[] | null = null;
      let error: any = null;

      const withResp = await supabase
        .from('staff_basic_info')
        .select(selectWith)
        .or(`employee_number.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,middle_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true })
        .limit(10);
      data = withResp.data;
      error = withResp.error;

      if (error && (error.code === 'PGRST200' || (error.message || '').includes('Could not find a relationship'))) {
        const withoutResp = await supabase
          .from('staff_basic_info')
          .select(selectWithout)
          .or(`employee_number.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,middle_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
          .order('last_name', { ascending: true })
          .limit(10);
        data = withoutResp.data;
        error = withoutResp.error as any;
      }

      if (error) throw error;

      const transformedResults = (data || []).map((staff: any) => ({
        staff_id: staff.staff_id,
        employee_number: staff.employee_number,
        first_name: staff.first_name,
        middle_name: staff.middle_name,
        last_name: staff.last_name,
        rank_name: (staff as any).ranks?.name || rankMap[Number(staff.rank_id)] || 'N/A',
        rank_id: staff.rank_id
      }));

      setEmployeeSearchResults(transformedResults);
      setShowEmployeeSearch(true);
    } catch (err: any) {
      console.error('Error searching employees:', err);
    }
  };

  const searchEmployeeNumbers = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setEmployeeNumberSearchResults([]);
      setShowEmployeeNumberSearch(false);
      return;
    }

    try {
      const baseSelect = 'staff_id, employee_number, first_name, middle_name, last_name, rank_id';
      let data: any[] | null = null;
      let error: any = null;

      const respExt = await supabase
        .from('02_admin_staff_1_registration')
        .select(`${baseSelect}, employee_rank`)
        .ilike('employee_number', `%${term}%`)
        .order('employee_number', { ascending: true })
        .limit(10);
      data = respExt.data;
      error = respExt.error;

      if (error) {
        const respBase = await supabase
          .from('02_admin_staff_1_registration')
          .select(baseSelect)
          .ilike('employee_number', `%${term}%`)
          .order('employee_number', { ascending: true })
          .limit(10);
        data = respBase.data;
        error = respBase.error;
      }

      if (error) throw error;

      const transformedResults = (data || []).map((row: any) => ({
        staff_id: row.staff_id ?? row.id,
        employee_number: row.employee_number,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        rank_name: (row.employee_rank && String(row.employee_rank).trim().length > 0) ? String(row.employee_rank) : (rankMap[Number(row.rank_id)] || 'N/A'),
        rank_id: row.rank_id
      }));

      setEmployeeNumberSearchResults(transformedResults);
      setShowEmployeeNumberSearch(true);

      // If there's an exact match to the typed number, auto-fill immediately
      const exactMatch = transformedResults.find(
        (r) => String(r.employee_number ?? '').toUpperCase() === term.toUpperCase()
      );
      if (exactMatch) {
        handleEmployeeSelection(exactMatch);
        setShowEmployeeNumberSearch(false);
      }
    } catch (err: any) {
      console.error('Error searching employee numbers:', err);
    }
  };

  const searchEmployeeByNumber = async (employeeNumber: string) => {
    const term = employeeNumber.trim();
    if (term.length < 2) {
      return;
    }

    try {
      const baseSelect = 'staff_id, employee_number, first_name, middle_name, last_name, rank_id';
      let row: any = null;
      let error: any = null;

      const respExt = await supabase
        .from('02_admin_staff_1_registration')
        .select(`${baseSelect}, employee_rank`)
        .eq('employee_number', term)
        .limit(1);
      row = Array.isArray(respExt.data) && respExt.data.length > 0 ? respExt.data[0] : null;
      error = respExt.error;

      if (error || !row) {
        const respBase = await supabase
          .from('02_admin_staff_1_registration')
          .select(baseSelect)
          .eq('employee_number', term)
          .limit(1);
        row = Array.isArray(respBase.data) && respBase.data.length > 0 ? respBase.data[0] : null;
        error = respBase.error;
      }

      if (!row || error) {
        console.warn('Employee lookup failed or no access', { term, error });
        setFormData(prev => ({
          ...prev,
          staffId: '',
          employeeName: '',
          employeeRank: ''
        }));
        return;
      }

      const formatFullName = (first?: string, middle?: string, last?: string) => {
        return [first, middle, last].filter(part => part && part.trim().length > 0).join(' ');
      };

      const employeeData = {
        staffId: (row.staff_id ?? row.id ?? '').toString(),
        employeeName: formatFullName(row.first_name, row.middle_name, row.last_name),
        employeeNumber: row.employee_number,
        employeeRank: 'N/A'
      };

      setFormData(prev => ({ ...prev, ...employeeData }));
      setShowEmployeeNumberSearch(false);
      setFormErrors({});
      try {
        if (!employeeData.employeeName || employeeData.employeeName.trim().length === 0) {
          const name = await resolveEmployeeName(row.employee_number, row.staff_id ?? row.id);
          if (name) {
            setFormData(prev => ({ ...prev, employeeName: name }));
          }
        }
        const resolvedRank = await resolveEmployeeRank(row.employee_number, row.rank_id);
        if (resolvedRank) {
          setFormData(prev => ({ ...prev, employeeRank: resolvedRank }));
        }
      } catch {}
    } catch (err: any) {
      console.error('Error searching employee by number:', err);
    }
  };

  const handleEmployeeNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, employeeName: name }));
    searchEmployees(name);
    if (formErrors.employeeName) {
      setFormErrors(prev => ({ ...prev, employeeName: undefined }));
    }
  };

  const handleEmployeeNumberChange = (raw: string) => {
    const number = raw.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    setFormData(prev => ({ ...prev, employeeNumber: number }));

    // Clear previous debounce
    if (employeeNumberSearchDebounceRef.current) {
      clearTimeout(employeeNumberSearchDebounceRef.current);
      employeeNumberSearchDebounceRef.current = null;
    }

    if (number.length >= 2) {
      employeeNumberSearchDebounceRef.current = window.setTimeout(() => {
        // Show suggestions and also try exact lookup for auto-fill
        searchEmployeeNumbers(number);
        searchEmployeeByNumber(number);
      }, 250);
    } else {
      setEmployeeNumberSearchResults([]);
      setShowEmployeeNumberSearch(false);
    }

    if (formErrors.employeeNumber) {
      setFormErrors(prev => ({ ...prev, employeeNumber: undefined }));
    }
  };

  useEffect(() => {
    return () => {
      if (employeeNumberSearchDebounceRef.current) {
        clearTimeout(employeeNumberSearchDebounceRef.current);
        employeeNumberSearchDebounceRef.current = null;
      }
    };
  }, []);

  const handleEmployeeSelection = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      staffId: employee.staff_id.toString(),
      employeeName: [employee.first_name, employee.middle_name, employee.last_name].filter(part => part && part.trim().length > 0).join(' '),
      employeeNumber: employee.employee_number,
      employeeRank: employee.rank_name || 'N/A'
    }));
    setShowEmployeeSearch(false);
    setShowEmployeeNumberSearch(false);
    setFormErrors({});
    (async () => {
      try {
        if (!employee.rank_name || employee.rank_name === 'N/A') {
          const resolvedRank = await resolveEmployeeRank(employee.employee_number, employee.rank_id);
          if (resolvedRank) {
            setFormData(prev => ({ ...prev, employeeRank: resolvedRank }));
          }
        }
      } catch {}
    })();
  };

  const resolveEmployeeRank = async (employeeNumber: string, initialRankId?: number | undefined): Promise<string | null> => {
    try {
      const baseSelect = 'rank_id';
      let row: any = null;
      let error: any = null;

      const respExt = await supabase
        .from('02_admin_staff_1_registration')
        .select(`${baseSelect}, employee_rank`)
        .eq('employee_number', employeeNumber)
        .limit(1);
      row = Array.isArray(respExt.data) && respExt.data.length > 0 ? respExt.data[0] : null;
      error = respExt.error;

      if (error || !row) {
        const respBase = await supabase
          .from('02_admin_staff_1_registration')
          .select(baseSelect)
          .eq('employee_number', employeeNumber)
          .limit(1);
        row = Array.isArray(respBase.data) && respBase.data.length > 0 ? respBase.data[0] : null;
        error = respBase.error;
      }

      if (error) return null;
      const directName = row?.employee_rank;
      const rankIdRaw = (typeof initialRankId === 'number' ? initialRankId : (row?.rank_id)) as any;
      const rankIdNum = (rankIdRaw !== undefined && rankIdRaw !== null) ? Number(rankIdRaw) : NaN;
      if (directName && String(directName).trim().length > 0) return String(directName);
      if (!Number.isNaN(rankIdNum)) {
        const { data: rData, error: rErr } = await supabase
          .from('02_admin_staff_9_ranks')
          .select('name')
          .eq('id', rankIdNum)
          .limit(1);
        if (!rErr && Array.isArray(rData) && rData.length > 0) {
          const nm = (rData[0] as any)?.name;
          if (nm && String(nm).trim().length > 0) return String(nm);
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const resolveEmployeeName = async (employeeNumber: string, staffId?: number | string | null): Promise<string | null> => {
    try {
      const fmt = (first?: string, middle?: string, last?: string) => {
        const f = (first || '').trim();
        const m = (middle || '').trim();
        const l = (last || '').trim();
        return [f, m, l].filter(Boolean).join(' ');
      };

      let row: any = null;
      let error: any = null;
      const respReg = await supabase
        .from('02_admin_staff_1_registration')
        .select('first_name, middle_name, last_name')
        .eq('employee_number', employeeNumber)
        .limit(1);
      row = Array.isArray(respReg.data) && respReg.data.length > 0 ? respReg.data[0] : null;
      error = respReg.error;
      if (!error && row) {
        const name = fmt(row.first_name, row.middle_name, row.last_name);
        if (name) return name;
      }

      const sid = staffId ? String(staffId) : '';
      if (sid) {
        const respBasic = await supabase
          .from('staff_basic_info')
          .select('first_name, middle_name, last_name')
          .eq('staff_id', sid)
          .limit(1);
        const rowB = Array.isArray(respBasic.data) && respBasic.data.length > 0 ? respBasic.data[0] : null;
        if (rowB) {
          const name = fmt(rowB.first_name, rowB.middle_name, rowB.last_name);
          if (name) return name;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.employeeNumber) errors.employeeNumber = 'Employee Number is required';
    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.firstLeaveDate) errors.firstLeaveDate = 'First Leave Date is required';
    if (!formData.lastLeaveDate) errors.lastLeaveDate = 'Last Leave Date is required';
    if (!formData.leaveType) errors.leaveType = 'Leave Type is required';
    
    if (formData.firstLeaveDate && formData.lastLeaveDate) {
      if (new Date(formData.lastLeaveDate) < new Date(formData.firstLeaveDate)) {
        errors.lastLeaveDate = 'Last Leave Date must be after First Leave Date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    // Revoke previous blob URL to avoid memory leaks
    if (formData.fileUrl && formData.fileUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(formData.fileUrl);
      } catch {}
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, file, fileUrl: objectUrl }));
    } else {
      setFormData(prev => ({ ...prev, file: null, fileUrl: '' }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `leave-forms/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to save records.');
      }

      let fileUrl = formData.fileUrl || '';
      if (formData.file) {
        fileUrl = await uploadFile(formData.file);
      }

      const leaveData = {
        staff_id: parseInt(formData.staffId),
        employee_name: formData.employeeName,
        employee_number: formData.employeeNumber,
        employee_rank: formData.employeeRank,
        first_leave_date: formData.firstLeaveDate,
        last_leave_date: formData.lastLeaveDate,
        total_leave_days: formData.totalLeaveDays,
        leave_type: formData.leaveType,
        file_url: fileUrl
      };

      const { error: insertError } = await supabase
        .from('02_admin_hr_04_leave_management')
        .insert(leaveData);

      if (insertError) throw insertError;
      
      setSuccess('Leave record saved successfully!');
      handleClear();
      
      setTimeout(() => {
        setSuccess('');
        navigate('/admin/hr/leave-management/records');
      }, 2000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save leave record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    // Revoke blob URL if present
    if (formData.fileUrl && formData.fileUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(formData.fileUrl);
      } catch {}
    }
    setFormData({
      staffId: '',
      employeeName: '',
      employeeNumber: '',
      employeeRank: '',
      firstLeaveDate: '',
      lastLeaveDate: '',
      totalLeaveDays: 0,
      leaveType: '',
      file: null,
      fileUrl: ''
    });
    setFormErrors({});
    setError('');
    setShowEmployeeSearch(false);
  };

  const handleAddNew = () => {
    // Activate the form and clear any previous entry
    setFormActive(true);
    setSuccess('');
    setError('');
    setSubmitting(false);
    setFormErrors({});
    setShowEmployeeSearch(false);
    setShowEmployeeNumberSearch(false);
    setFormData({
      staffId: '',
      employeeName: '',
      employeeNumber: '',
      employeeRank: '',
      firstLeaveDate: '',
      lastLeaveDate: '',
      totalLeaveDays: 0,
      leaveType: '',
      file: null,
      fileUrl: ''
    });
  };

  return (
    <MainContent aria-label="Main content">
      <Section>
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title>Leave Recording</Title>
              <Divider aria-hidden="true" />
            </Column>
            <ImageColumn>
              {headerLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : headerImageUrl ? (
                <HeaderImage
                  src={headerImageUrl}
                  alt="Leave Recording"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/HR.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  No image available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
        
        <FormSection>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <FormGrid>
            <FormGroup>
              <FormLabel htmlFor="employee-number">Employee Number *</FormLabel>
              <SearchContainer>
                <FormInput
                  id="employee-number"
                  type="text"
                  value={formData.employeeNumber}
                  onChange={(e) => handleEmployeeNumberChange(e.target.value)}
                  disabled={!formActive}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchEmployeeByNumber(formData.employeeNumber);
                      setShowEmployeeNumberSearch(false);
                    }
                  }}
                  placeholder="Enter employee number..."
                  className={formErrors.employeeNumber ? 'error' : ''}
                  style={{ width: '50%' }}
                onBlur={() => {
                  // On blur, perform exact lookup to auto-fill when user leaves the field
                  if (formData.employeeNumber && formData.employeeNumber.trim().length >= 2) {
                    searchEmployeeByNumber(formData.employeeNumber.trim());
                  }
                  setTimeout(() => setShowEmployeeNumberSearch(false), 150);
                }}
                />
                <SearchResults $visible={showEmployeeNumberSearch}>
                  {employeeNumberSearchResults.map((employee) => (
                    <SearchResultItem 
                      key={employee.staff_id}
                      onClick={() => handleEmployeeSelection(employee)}
                    >
                      <SearchResultName>
                        {[employee.first_name, employee.middle_name, employee.last_name]
                          .filter(part => part && part.trim().length > 0)
                          .join(' ')}
                      </SearchResultName>
                      <SearchResultDetails>
                        Emp #: {employee.employee_number} | Rank: {employee.rank_name || 'N/A'}
                      </SearchResultDetails>
                    </SearchResultItem>
                  ))}
                  {employeeNumberSearchResults.length === 0 && showEmployeeNumberSearch && (
                    <SearchResultItem>
                      <SearchResultDetails>No matches</SearchResultDetails>
                    </SearchResultItem>
                  )}
                </SearchResults>
              </SearchContainer>
              {formErrors.employeeNumber && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.employeeNumber}</span>}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="employee-name">Employee Name *</FormLabel>
              <SearchContainer>
                <FormInput
                  id="employee-name"
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => handleEmployeeNameChange(e.target.value)}
                  placeholder="Search employee name..."
                  className={formErrors.employeeName ? 'error' : ''}
                  disabled
                  style={{
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                    opacity: 0.8
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowEmployeeSearch(false), 200);
                  }}
                />
                {/* Employee name overlay suggestions removed to avoid obstruction */}
              </SearchContainer>
              {formErrors.employeeName && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.employeeName}</span>}
            </FormGroup>

            <DocumentPreview>
              <PreviewTitle>Leave Certificate Preview</PreviewTitle>
              {formData.fileUrl ? (
                (formData.file?.type === 'application/pdf' || formData.fileUrl.toLowerCase().endsWith('.pdf')) ? (
                  <PreviewFrame data={formData.fileUrl} type="application/pdf">
                    <PreviewContent>PDF preview not available</PreviewContent>
                  </PreviewFrame>
                ) : (formData.file?.type && formData.file.type.startsWith('image/')) ? (
                  <PreviewImage src={formData.fileUrl} alt="Uploaded leave certificate" />
                ) : (
                  <PreviewContent>Preview not available for this file type</PreviewContent>
                )
              ) : (
                <PreviewContent>No document uploaded yet</PreviewContent>
              )}
            </DocumentPreview>
          </FormGrid>
          
          <FormGrid>
            {/* Three-column layout: left column for dates/days, right for rank/type/upload, third for preview */}
            <LeftItem>
              <FormLabel htmlFor="first-leave-date">First Leave Date (YYYY-MM-DD) *</FormLabel>
              <FormInput
                id="first-leave-date"
                type="date"
                value={formData.firstLeaveDate}
                onChange={(e) => handleInputChange('firstLeaveDate', e.target.value)}
                disabled={!formActive}
                className={formErrors.firstLeaveDate ? 'error' : ''}
              />
              {formErrors.firstLeaveDate && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.firstLeaveDate}</span>}
            </LeftItem>

            <RightItem>
              <FormLabel htmlFor="employee-rank">Employee Rank</FormLabel>
              <FormInput
                id="employee-rank"
                type="text"
                value={formData.employeeRank}
                disabled
                placeholder="Auto-filled"
              />
            </RightItem>

            

            <LeftItem>
              <FormLabel htmlFor="last-leave-date">Last Leave Date (YYYY-MM-DD) *</FormLabel>
              <FormInput
                id="last-leave-date"
                type="date"
                value={formData.lastLeaveDate}
                onChange={(e) => handleInputChange('lastLeaveDate', e.target.value)}
                disabled={!formActive}
                className={formErrors.lastLeaveDate ? 'error' : ''}
              />
              {formErrors.lastLeaveDate && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.lastLeaveDate}</span>}
            </LeftItem>

            <RightItem>
              <FormLabel htmlFor="leave-type">Leave Type *</FormLabel>
              <FormSelect
                id="leave-type"
                value={formData.leaveType}
                onChange={(e) => handleInputChange('leaveType', e.target.value)}
                disabled={!formActive}
                className={formErrors.leaveType ? 'error' : ''}
              >
                <option value="">Select Leave Type</option>
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormSelect>
              {formErrors.leaveType && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.leaveType}</span>}
            </RightItem>

            <LeftItem>
              <FormLabel htmlFor="total-leave-days">Total Leave Days</FormLabel>
              <FormInput
                id="total-leave-days"
                type="number"
                value={formData.totalLeaveDays}
                disabled
                placeholder="Auto-calculated"
              />
            </LeftItem>

            <RightItem>
              <FormLabel htmlFor="leave-form-upload">Upload Leave Form (Optional)</FormLabel>
              <FormInput
                id="leave-form-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={!formActive}
              />
              {formData.file && (
                <span style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                  File selected — preview shown above
                </span>
              )}
            </RightItem>
          </FormGrid>
          
          <ButtonRow>
            <Button 
              $variant="secondary"
              onClick={handleAddNew}
              disabled={submitting || formActive}
            >
              Add
            </Button>
            <Button 
              $variant="primary"
              onClick={handleSubmit}
              disabled={submitting || !formActive}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={handleClear}
              disabled={submitting || !formActive}
            >
              Clear
            </Button>
          </ButtonRow>
        </FormSection>
      </Section>
    </MainContent>
  );
};
