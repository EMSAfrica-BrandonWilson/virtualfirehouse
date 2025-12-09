import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';

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

const PrintButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #E68A00;
    transform: translateY(-1px);
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

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
`;

const DocumentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background: #1177BB;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
  
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #e3f2fd;
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  font-size: 14px;
  border-right: 1px solid #eee;
  vertical-align: middle;
  
  &:last-child {
    border-right: none;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' }>`
  background-color: ${props => 
    props.$variant === 'primary' ? '#1177BB' : 
    props.$variant === 'secondary' ? '#FF9900' : 
    props.$variant === 'danger' ? '#dc3545' :
    '#6c757d'
  };
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-right: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => 
      props.$variant === 'primary' ? '#0f5c99' : 
      props.$variant === 'secondary' ? '#e08800' : 
      props.$variant === 'danger' ? '#c82333' :
      '#5a6268'
    };
    transform: translateY(-1px);
  }
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
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
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

const SearchContainer = styled.div`
  position: relative;
`;

const FilterSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #e9ecef;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 13px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.3s ease;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
`;

const ClearFiltersButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  height: fit-content;
  align-self: end;
  
  &:hover:not(:disabled) {
    background-color: #5a6268;
    transform: translateY(-1px);
  }
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

interface LeaveRecord {
  id: number;
  staff_id: number;
  employee_name: string;
  employee_number: string;
  employee_rank: string;
  first_leave_date: string;
  last_leave_date: string;
  total_leave_days: number;
  leave_type: string;
  file_url?: string;
  created_at: string;
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

interface EmployeeSearchResult {
  staff_id: number;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  rank_name?: string;
  rank_id?: number;
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

export const LeaveRecords: React.FC = () => {
  const navigate = useNavigate();
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departmentLogo, setDepartmentLogo] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<LeaveRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const [rankMap, setRankMap] = useState<Record<number, string>>({});
  
  // Filter state variables
  const [filters, setFilters] = useState({
    rank: '',
    leaveType: ''
  });

  useEffect(() => {
    fetchLeaveRecords();
    fetchCurrentUser();
    loadDepartmentLogo();
  }, []);

  useEffect(() => {
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

  // Get unique filter options
  const getUniqueRanks = () => {
    const ranks = [...new Set(
      leaveRecords
        .map(record => record.employee_rank)
        .filter(rank => rank && rank.trim() !== '')
    )].sort();
    return ranks;
  };

  const getUniqueLeaveTypes = () => {
    const types = [...new Set(leaveRecords.map(record => record.leave_type))].sort();
    return types;
  };

  // Filtered records based on current filter values
  const filteredRecords = leaveRecords.filter(record => {
    const matchesRank = !filters.rank || record.employee_rank === filters.rank;
    const matchesLeaveType = !filters.leaveType || record.leave_type === filters.leaveType;
    
    return matchesRank && matchesLeaveType;
  });

  // Handle filter changes
  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      rank: '',
      leaveType: ''
    });
  };

  const fetchLeaveRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_hr_04_leave_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRecords(data || []);
    } catch (err: any) {
      console.error('Error fetching leave records:', err);
      setError('Failed to load leave records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const loadDepartmentLogo = async () => {
    try {
      const response = await fetch('/images/daco-new-logo.jpg');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepartmentLogo(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading department logo:', err);
    }
  };

  // Load ranks once to map rank_id -> rank_name for fallback when relation is unavailable
  useEffect(() => {
    const loadRanks = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('dropdown-options-crud', { method: 'GET' });
        if (error) return; // silent fail; we still have UI without rank names
        const ranks = (data?.data?.ranks || []) as Array<{ id: number; name: string }>;
        const map: Record<number, string> = {};
        ranks.forEach(r => { if (r && typeof r.id === 'number') map[r.id] = r.name; });
        setRankMap(map);
      } catch {
        // ignore
      }
    };
    loadRanks();
  }, []);

  const getLogoForPDF = async (): Promise<string | null> => {
    if (departmentLogo) {
      return departmentLogo;
    }

    try {
      const response = await fetch('/images/daco-new-logo.jpg');
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setDepartmentLogo(dataUrl);
          resolve(dataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error loading department logo for PDF:', err);
      return null;
    }
  };

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

      // Fallback if relationship is not defined
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

  const searchEmployeeByNumber = async (employeeNumber: string) => {
    if (employeeNumber.length < 2) {
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

      let data: any = null;
      let error: any = null;

      const withResp = await supabase
        .from('staff_basic_info')
        .select(selectWith)
        .eq('employee_number', employeeNumber)
        .single();
      data = withResp.data;
      error = withResp.error;

      if (error && (error.code === 'PGRST200' || (error.message || '').includes('Could not find a relationship'))) {
        const withoutResp = await supabase
          .from('staff_basic_info')
          .select(selectWithout)
          .eq('employee_number', employeeNumber)
          .single();
        data = withoutResp.data;
        error = withoutResp.error as any;
      }

      if (error) {
        setFormData(prev => ({
          ...prev,
          staffId: '',
          employeeName: '',
          employeeRank: ''
        }));
        return;
      }

      if (data) {
        const fullName = [data.first_name, data.middle_name, data.last_name]
          .filter(part => part && part.trim().length > 0)
          .join(' ');

        const employeeData = {
          staffId: data.staff_id.toString(),
          employeeName: fullName,
          employeeNumber: data.employee_number,
          employeeRank: (data as any).ranks?.name || rankMap[Number(data.rank_id)] || 'N/A'
        };
        
        setFormData(prev => ({ ...prev, ...employeeData }));
        setFormErrors({});
      }
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

  const handleEmployeeNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, employeeNumber: number }));
    if (number.length >= 2) {
      searchEmployeeByNumber(number);
    }
    if (formErrors.employeeNumber) {
      setFormErrors(prev => ({ ...prev, employeeNumber: undefined }));
    }
  };

  const handleEmployeeSelection = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      staffId: employee.staff_id.toString(),
      employeeName: [employee.first_name, employee.middle_name, employee.last_name]
        .filter(part => part && part.trim().length > 0)
        .join(' '),
      employeeNumber: employee.employee_number,
      employeeRank: employee.rank_name || 'N/A'
    }));
    setShowEmployeeSearch(false);
    setFormErrors({});
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
    setFormData(prev => ({ ...prev, file }));
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

  const handleEdit = (record: LeaveRecord) => {
    setEditingRecord(record);
    setIsEditMode(true);
    setFormData({
      staffId: record.staff_id.toString(),
      employeeName: record.employee_name,
      employeeNumber: record.employee_number,
      employeeRank: record.employee_rank || 'N/A',
      firstLeaveDate: record.first_leave_date,
      lastLeaveDate: record.last_leave_date,
      totalLeaveDays: record.total_leave_days,
      leaveType: record.leave_type,
      file: null,
      fileUrl: record.file_url || ''
    });
    setFormErrors({});
    setError('');
    setSuccess('');
    setShowEmployeeSearch(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      const { error: updateError } = await supabase
        .from('02_admin_hr_04_leave_management')
        .update(leaveData)
        .eq('id', editingRecord!.id);

      if (updateError) throw updateError;
      setSuccess('Leave record updated successfully!');

      handleCancelEdit();
      await fetchLeaveRecords();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save leave record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: LeaveRecord) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the leave record for ${record.employee_name}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setError('');
      setSuccess('');

      const { error: deleteError } = await supabase
        .from('02_admin_hr_04_leave_management')
        .delete()
        .eq('id', record.id);

      if (deleteError) throw deleteError;

      handleCancelEdit();
      setSuccess('Leave record deleted successfully!');
      await fetchLeaveRecords();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete record. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setIsEditMode(false);
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
    setSuccess('');
    setShowEmployeeSearch(false);
  };

  const clearOldPDFsFromStorage = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('pdf_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} old PDF entries from sessionStorage`);
    } catch (err) {
      console.warn('Error clearing old PDFs from sessionStorage:', err);
    }
  };

  const handleOpen = async (record: LeaveRecord) => {
    if (!record.file_url) {
      alert('No document attached to this record.');
      return;
    }

    try {
      let blob: Blob;

      if (record.file_url.startsWith('http')) {
        const response = await fetch(record.file_url);
        if (!response.ok) throw new Error('Failed to fetch file');
        blob = await response.blob();
      } else {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(record.file_url);

        if (error) throw error;
        blob = data;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        const storageKey = `pdf_leave_${record.id}`;
        
        try {
          clearOldPDFsFromStorage();
          
          sessionStorage.setItem(storageKey, dataUri);
          sessionStorage.setItem('pdf_source_section', '/admin/hr/leave-management/records');
          sessionStorage.setItem('pdf_source_path', '/admin/hr/leave-management/records');
          
          navigate(`/pdf-viewer/${storageKey}`);
        } catch (storageError: any) {
          if (storageError.name === 'QuotaExceededError') {
            console.warn('PDF too large for sessionStorage, downloading directly');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `leave_record_${record.employee_name}_${record.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('Document is too large to preview. It has been downloaded to your computer.');
          } else {
            throw storageError;
          }
        }
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('Open error:', err);
      alert('Failed to open document. Please try again.');
    }
  };

  const generatePDF = async () => {
    if (filteredRecords.length === 0) {
      setError('No leave records to print. Please add records first or adjust your filters.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      const logoBase64 = await getLogoForPDF();
      
      const doc = new jsPDF('landscape');
      
      const totalRecords = filteredRecords.length;
      const totalDays = filteredRecords.reduce((sum, record) => sum + record.total_leave_days, 0);
      const summaryText = `Summary: Total Leave Records: ${totalRecords}, Total Leave Days: ${totalDays}`;
      
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Leave Management Report",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });

      const tableData = filteredRecords.map(record => [
        record.employee_number || 'N/A',
        record.employee_name,
        record.employee_rank || 'N/A',
        record.leave_type,
        formatDate(record.first_leave_date),
        formatDate(record.last_leave_date),
        record.total_leave_days.toString()
      ]);

      autoTable(doc, {
        head: [[
          'Employee #',
          'Employee Name',
          'Rank',
          'Leave Type',
          'First Leave Date',
          'Last Leave Date',
          'Total Days'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });

      const pdfBlob = doc.output('blob');
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      
      try {
        clearOldPDFsFromStorage();
        
        sessionStorage.setItem(pdfKey, pdfDataUri);
        
        sessionStorage.setItem('pdf_source_section', '/admin/hr/leave-management/records');
        sessionStorage.setItem('pdf_source_path', '/admin/hr/leave-management/records');
        
        navigate(`/pdf-viewer/${pdfKey}`);
        setSuccess(`PDF report generated successfully! (${filteredRecords.length} leave records included)`);
      } catch (storageError: any) {
        if (storageError.name === 'QuotaExceededError') {
          console.warn('PDF too large for sessionStorage, downloading directly');
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = vfhSetup.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setSuccess(`PDF report generated and downloaded successfully! (${filteredRecords.length} leave records included - file was too large to preview)`);
        } else {
          throw storageError;
        }
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF report: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainContent aria-label="Main content">
      <Section>
        <Title>Leave Records</Title>
        <Divider />

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {/* Edit Form - only shown when editing */}
        {isEditMode && editingRecord && (
          <>
            <SubTitle>Edit Leave Record</SubTitle>
            <FormSection>
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="employee-number">Employee Number *</FormLabel>
                  <FormInput
                    id="employee-number"
                    type="text"
                    value={formData.employeeNumber}
                    onChange={(e) => handleEmployeeNumberChange(e.target.value)}
                    placeholder="Enter employee number..."
                    className={formErrors.employeeNumber ? 'error' : ''}
                  />
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
                      onBlur={() => {
                        setTimeout(() => setShowEmployeeSearch(false), 200);
                      }}
                    />
                    <SearchResults $visible={showEmployeeSearch}>
                      {employeeSearchResults.map((employee) => (
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
                      {employeeSearchResults.length === 0 && (
                        <SearchResultItem>
                          <SearchResultDetails>No employees found</SearchResultDetails>
                        </SearchResultItem>
                      )}
                    </SearchResults>
                  </SearchContainer>
                  {formErrors.employeeName && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.employeeName}</span>}
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="employee-rank">Employee Rank</FormLabel>
                  <FormInput
                    id="employee-rank"
                    type="text"
                    value={formData.employeeRank}
                    disabled
                    placeholder="Auto-filled"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="leave-type">Leave Type *</FormLabel>
                  <FormSelect
                    id="leave-type"
                    value={formData.leaveType}
                    onChange={(e) => handleInputChange('leaveType', e.target.value)}
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
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="first-leave-date">First Leave Date (YYYY-MM-DD) *</FormLabel>
                  <FormInput
                    id="first-leave-date"
                    type="date"
                    value={formData.firstLeaveDate}
                    onChange={(e) => handleInputChange('firstLeaveDate', e.target.value)}
                    className={formErrors.firstLeaveDate ? 'error' : ''}
                  />
                  {formErrors.firstLeaveDate && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.firstLeaveDate}</span>}
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="last-leave-date">Last Leave Date (YYYY-MM-DD) *</FormLabel>
                  <FormInput
                    id="last-leave-date"
                    type="date"
                    value={formData.lastLeaveDate}
                    onChange={(e) => handleInputChange('lastLeaveDate', e.target.value)}
                    className={formErrors.lastLeaveDate ? 'error' : ''}
                  />
                  {formErrors.lastLeaveDate && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.lastLeaveDate}</span>}
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="total-leave-days">Total Leave Days</FormLabel>
                  <FormInput
                    id="total-leave-days"
                    type="number"
                    value={formData.totalLeaveDays}
                    disabled
                    placeholder="Auto-calculated"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="leave-form-upload">Upload Leave Form (Optional)</FormLabel>
                  <FormInput
                    id="leave-form-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {formData.fileUrl && (
                    <span style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                      File already uploaded
                    </span>
                  )}
                </FormGroup>
              </FormGrid>
              
              <ButtonRow>
                <Button 
                  $variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={() => editingRecord && handleOpen(editingRecord)}
                  disabled={submitting || !editingRecord?.file_url}
                  style={{ 
                    backgroundColor: '#007bff',
                    opacity: !editingRecord?.file_url ? 0.5 : 1,
                    cursor: !editingRecord?.file_url ? 'not-allowed' : 'pointer'
                  }}
                  title={!editingRecord?.file_url ? 'No document attached' : 'Open document'}
                >
                  Open
                </Button>
                <Button 
                  $variant="danger"
                  onClick={() => editingRecord && handleDelete(editingRecord)}
                  disabled={submitting}
                >
                  Delete
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </ButtonRow>
            </FormSection>
          </>
        )}

        {/* Filter Section */}
        <FilterSection>
          <FilterGroup>
            <FilterLabel htmlFor="filter-rank">Rank</FilterLabel>
            <FilterSelect
              id="filter-rank"
              value={filters.rank}
              onChange={(e) => handleFilterChange('rank', e.target.value)}
            >
              <option value="">All Ranks</option>
              {getUniqueRanks().map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="filter-leave-type">Leave Type</FilterLabel>
            <FilterSelect
              id="filter-leave-type"
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
            >
              <option value="">All Leave Types</option>
              {getUniqueLeaveTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <ClearFiltersButton onClick={clearAllFilters}>
            Clear All Filters
          </ClearFiltersButton>
          
          <PrintButton 
            onClick={generatePDF} 
            disabled={isGeneratingPDF || filteredRecords.length === 0}
            style={{ margin: 0 }}
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Report'}
          </PrintButton>
        </FilterSection>
        
        {loading ? (
          <LoadingMessage>Loading leave records...</LoadingMessage>
        ) : filteredRecords.length === 0 && leaveRecords.length === 0 ? (
          <EmptyState>
            No leave records found. Add your first leave record using the Leave Recording page.
          </EmptyState>
        ) : filteredRecords.length === 0 ? (
          <EmptyState>
            No records match the current filters. Try adjusting your filter criteria.
          </EmptyState>
        ) : (
          <DocumentTable>
            <TableHeader>
              <tr>
                <TableHeaderCell>Employee Name</TableHeaderCell>
                <TableHeaderCell>Emp #</TableHeaderCell>
                <TableHeaderCell>Rank</TableHeaderCell>
                <TableHeaderCell>Leave Type</TableHeaderCell>
                <TableHeaderCell>First Leave Date</TableHeaderCell>
                <TableHeaderCell>Last Leave Date</TableHeaderCell>
                <TableHeaderCell>Total Days</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employee_name}</TableCell>
                  <TableCell>{record.employee_number}</TableCell>
                  <TableCell>{record.employee_rank}</TableCell>
                  <TableCell>{record.leave_type}</TableCell>
                  <TableCell>{formatDate(record.first_leave_date)}</TableCell>
                  <TableCell>{formatDate(record.last_leave_date)}</TableCell>
                  <TableCell>{record.total_leave_days}</TableCell>
                  <TableCell>
                    <ActionButton 
                      $variant="secondary"
                      onClick={() => handleEdit(record)}
                    >
                      Edit
                    </ActionButton>
                    {record.file_url && (
                      <ActionButton 
                        onClick={() => handleOpen(record)}
                        style={{ 
                          backgroundColor: '#007bff',
                          marginLeft: '5px'
                        }}
                        title="View Certificate"
                      >
                        View Certificate
                      </ActionButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocumentTable>
        )}
      </Section>
    </MainContent>
  );
};
