import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePageImage } from '../../hooks/usePageImage';
import { setupVFHStandardPDF } from '../../utils/pdfReportHelper';

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

const ManagementSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.$active ? '#1177BB' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#1177BB'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#1177BB' : 'transparent'};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#0f5c99' : '#f0f7ff'};
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FormColumn = styled.div<{ $flex?: string }>`
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

const ImagePreview = styled.img`
  max-width: 100px;
  max-height: 60px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  margin-top: 5px;
`;



const SubmitButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;



const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const PrintButton = styled.button`
  background-color: #FF9900;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
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
  
  &:hover {
    background-color: ${props => props.$active ? '#218838' : '#c82333'};
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

const OptionsTable = styled.table`
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

interface Position {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Rank {
  id: string;
  name: string;
  code: string;
  level: number;
  description: string;
  picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmergencyContactRelationship {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmploymentStatus {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

type DropdownType = 'positions' | 'ranks' | 'emergency_contact_relationships' | 'employment_status' | 'call_signs' | 'vehicle_types' | 'vehicle_makes';

interface FormData {
  name: string;
  description: string;
  code?: string;
  level?: number;
  picture?: File | null;
  pictureUrl?: string;
}

export const DropdownManagement: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage(
    'dropdown-management',
    '/images/EMSA-Supervisors.png'
  );

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') as DropdownType || 'positions';
  const [activeTab, setActiveTab] = useState<DropdownType>(initialTab);
  const [positions, setPositions] = useState<Position[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [relationships, setRelationships] = useState<EmergencyContactRelationship[]>([]);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string | number>>(new Set());
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    level: 0,
    picture: null,
    pictureUrl: ''
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadDropdownOptions();
  }, []);

  const loadDropdownOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load dropdown options');
      }

      if (data?.data) {
        // Sort data alphabetically by name to ensure consistent ordering
        const sortedPositions = (data.data.positions || []).sort((a: Position, b: Position) => a.name.localeCompare(b.name));
        const sortedRanks = (data.data.ranks || []).sort((a: Rank, b: Rank) => a.name.localeCompare(b.name));
        const sortedRelationships = (data.data.emergencyContactRelationships || []).sort((a: EmergencyContactRelationship, b: EmergencyContactRelationship) => a.name.localeCompare(b.name));
        const sortedEmploymentStatus = (data.data.employmentStatus || []).sort((a: EmploymentStatus, b: EmploymentStatus) => a.name.localeCompare(b.name));
        
        setPositions(sortedPositions);
        setRanks(sortedRanks);
        setRelationships(sortedRelationships);
        setEmploymentStatus(sortedEmploymentStatus);
      }
    } catch (error: any) {
      console.error('Error loading dropdown options:', error);
      setError(error.message || 'Failed to load dropdown options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    // Additional validation for ranks
    if (activeTab === 'ranks') {
      if (!formData.code?.trim()) {
        setError('Code is required for ranks');
        return;
      }
      if (formData.level === undefined || formData.level < 0) {
        setError('Level is required for ranks and must be non-negative');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let requestData: any = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      // Add rank-specific fields
      if (activeTab === 'ranks') {
        requestData.code = formData.code?.trim();
        requestData.level = formData.level;
        requestData.is_active = true;
        
        // Handle picture upload for ranks
        if (formData.picture) {
          try {
            const file = formData.picture;
            const fileExt = file.name.split('.').pop();
            const fileName = `rank-${formData.code?.trim().toLowerCase()}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('rank-pictures')
              .upload(fileName, file);
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
              .from('rank-pictures')
              .getPublicUrl(fileName);
            
            requestData.picture_url = publicUrl;
          } catch (uploadError: any) {
            console.error('Error uploading picture:', uploadError);
            setError(`Failed to upload picture: ${uploadError.message}`);
            setLoading(false);
            return;
          }
        } else if (formData.pictureUrl) {
          // Keep existing picture URL if no new file uploaded
          requestData.picture_url = formData.pictureUrl;
        }
      } else {
        requestData.active = true;
      }

      if (isEditing && editingId) {
        // Update existing item
        const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'PUT',
          body: {
            table: activeTab,
            id: editingId,
            data: requestData
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to update option');
        }

        if (data?.data?.success) {
          setSuccess('Option updated successfully!');
          setIsEditing(false);
          setEditingId(null);
        } else {
          throw new Error(data?.error?.message || 'Update failed');
        }
      } else {
        // Create new item
        const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
          method: 'POST',
          body: {
            table: activeTab,
            data: requestData
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to create option');
        }

        if (data?.data?.success) {
          setSuccess('Option created successfully!');
        } else {
          throw new Error(data?.error?.message || 'Creation failed');
        }
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        code: '',
        level: 0,
        picture: null,
        pictureUrl: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('picture') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload options
      await loadDropdownOptions();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Position | Rank | EmergencyContactRelationship | EmploymentStatus) => {
    setIsEditing(true);
    setEditingId(item.id);

    if ('code' in item && 'level' in item) {
      // Rank item
      setFormData({
        name: item.name,
        description: item.description || '',
        code: item.code,
        level: item.level,
        picture: null,
        pictureUrl: item.picture_url || ''
      });
    } else if ('description' in item) {
      // Position item
      setFormData({
        name: item.name,
        description: item.description || '',
        code: '',
        level: 0,
        picture: null,
        pictureUrl: ''
      });
    } else if ('description' in item && !('code' in item)) {
      // Employment Status item
      setFormData({
        name: item.name,
        description: (item as EmploymentStatus).description || '',
        code: '',
        level: 0,
        picture: null,
        pictureUrl: ''
      });
    } else {
      // Relationship item
      setFormData({
        name: item.name,
        description: '',
        code: '',
        level: 0,
        picture: null,
        pictureUrl: ''
      });
    }

    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'DELETE',
        body: {
          table: activeTab,
          id: id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete option');
      }

      if (data?.data?.success) {
        setSuccess('Option deleted successfully!');
        await loadDropdownOptions();
      } else {
        throw new Error(data?.error?.message || 'Delete failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete option');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleToggleActive = async (item: Position | Rank | EmergencyContactRelationship | EmploymentStatus) => {
    const newActiveState = 'active' in item ? !item.active : !item.is_active;
    
    try {
      let updateData: any = {};
      if ('code' in item && 'level' in item) {
        // Rank item
        updateData = {
          name: item.name,
          code: item.code,
          level: item.level,
          description: item.description || '',
          picture_url: item.picture_url || null,
          is_active: newActiveState
        };
      } else if ('description' in item) {
        // Position item
        updateData = {
          name: item.name,
          description: item.description || '',
          active: newActiveState
        };
      } else if ('description' in item && !('code' in item)) {
        // Employment Status item
        updateData = {
          name: item.name,
          description: (item as EmploymentStatus).description || '',
          active: newActiveState
        };
      } else {
        // Relationship item
        updateData = {
          name: item.name,
          active: newActiveState
        };
      }

      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'PUT',
        body: {
          table: activeTab,
          id: item.id,
          data: updateData
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to toggle status');
      }

      if (data?.data?.success) {
        setSuccess(`Option ${newActiveState ? 'activated' : 'deactivated'} successfully!`);
        await loadDropdownOptions();
      } else {
        throw new Error(data?.error?.message || 'Toggle failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to toggle option status');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      level: 0,
      picture: null,
      pictureUrl: ''
    });
    
    // Reset file input
    const fileInput = document.getElementById('picture') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'picture' && files && files[0]) {
      setFormData(prev => ({
        ...prev,
        picture: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'level' ? parseInt(value) || 0 : value
      }));
    }
  };

  const generatePDF = async () => {
    const currentData = getCurrentData();
    if (currentData.length === 0) {
      setError(`No ${getTabTitle().toLowerCase()} to print. Please add some options first.`);
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Fetch and load department logo
      let logoBase64 = null;
      try {
        const { data: deptData, error: deptError } = await supabase
          .from('emergency_departments')
          .select('dept_picture_url')
          .limit(1)
          .single();
        
        if (!deptError && deptData?.dept_picture_url) {
          // Load the logo image and convert to base64
          const logoResponse = await fetch(deptData.dept_picture_url);
          const logoBlob = await logoResponse.blob();
          logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (logoError) {
        console.log('Could not fetch department logo:', logoError);
      }
      
      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Get report title based on active tab
      const getReportTitle = () => {
        switch (activeTab) {
          case 'positions':
            return 'Registered Staff Positions Report';
          case 'ranks':
            return 'Registered Staff Ranks Report';
          case 'emergency_contact_relationships':
            return 'Emergency Contact Relationships Report';
          case 'employment_status':
            return 'Employment Status Report';
          default:
            return 'Options Management Report';
        }
      };
      
      const reportTitle = getReportTitle();
      
      // Calculate summary information
      const activeCount = currentData.filter((item: any) => 
        'active' in item ? item.active : item.is_active
      ).length;
      const totalCount = currentData.length;
      const summaryText = `Summary: Total ${getTabTitle()}: ${totalCount}, Active: ${activeCount}`;
      
      // Setup VFH A4 standard PDF with logo, header, and get table configuration
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: reportTitle,
          summaryText: summaryText,
          currentUser: undefined // Dropdown reports don't track specific user
        }
      });
      
      // Prepare table data based on tab type
      let tableData: string[][] = [];
      let tableHeaders: string[] = [];
      
      // Sort data alphabetically for consistent listing
      const sortedData = [...currentData].sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      switch (activeTab) {
        case 'positions':
          tableHeaders = ['Name', 'Description', 'Status'];
          tableData = sortedData.map((item: any) => [
            item.name || '-',
            item.description || '-',
            ('active' in item ? item.active : item.is_active) ? 'Active' : 'Inactive'
          ]);
          break;
        case 'ranks':
          tableHeaders = ['Name', 'Code', 'Level', 'Status'];
          tableData = sortedData.map((item: any) => [
            item.name || '-',
            item.code || '-',
            item.level?.toString() || '-',
            ('active' in item ? item.active : item.is_active) ? 'Active' : 'Inactive'
          ]);
          break;
        case 'emergency_contact_relationships':
          tableHeaders = ['Name', 'Status'];
          tableData = sortedData.map((item: any) => [
            item.name || '-',
            ('active' in item ? item.active : item.is_active) ? 'Active' : 'Inactive'
          ]);
          break;
        case 'employment_status':
          tableHeaders = ['Name', 'Description', 'Status'];
          tableData = sortedData.map((item: any) => [
            item.name || '-',
            item.description || '-',
            ('active' in item ? item.active : item.is_active) ? 'Active' : 'Inactive'
          ]);
          break;
      }
      
      // Create table using VFH A4 standard configuration
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });
      
      // Display PDF with navigation and save to sessionStorage
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/register');
      sessionStorage.setItem('pdf_source_path', '/admin/dropdown-management');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess(`Report generated successfully: ${vfhSetup.filename}`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF report: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'positions':
        return positions;
      case 'ranks':
        return ranks;
      case 'emergency_contact_relationships':
        return relationships;
      case 'employment_status':
        return employmentStatus;
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'positions':
        return 'Staff Positions';
      case 'ranks':
        return 'Staff Ranks';
      case 'emergency_contact_relationships':
        return 'Emergency Contact Relationships';
      case 'employment_status':
        return 'Employment Status';
      case 'call_signs':
        return 'Vehicle Call Signs';
      case 'vehicle_types':
        return 'Vehicle Types';
      case 'vehicle_makes':
        return 'Vehicle Makes';
      default:
        return '';
    }
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'positions':
        return (
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        );
      case 'ranks':
        return (
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Level</th>
            <th>Picture</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        );
      case 'emergency_contact_relationships':
        return (
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        );
      case 'employment_status':
        return (
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        );
      case 'call_signs':
      case 'vehicle_types':
      case 'vehicle_makes':
        return (
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item: Position | Rank | EmergencyContactRelationship | EmploymentStatus) => {
    const isActive = 'active' in item ? item.active : item.is_active;
    
    if ('code' in item && 'level' in item) {
      // Rank item
      return (
        <tr key={item.id}>
          <td><strong>{item.name}</strong></td>
          <td><code>{item.code}</code></td>
          <td>{item.level}</td>
          <td>
            {item.picture_url ? (
              <ImagePreview src={item.picture_url} alt={`${item.name} insignia`} />
            ) : (
              <span style={{ color: '#666', fontSize: '12px' }}>No picture</span>
            )}
          </td>
          <td>{item.description || '-'}</td>
          <td>
            <ToggleButton 
              $active={isActive}
              onClick={() => handleToggleActive(item)}
            >
              {isActive ? 'Active' : 'Inactive'}
            </ToggleButton>
          </td>
          <td><small>{new Date(item.created_at).toLocaleDateString()}</small></td>
          <td>
            <EditButton onClick={() => handleEdit(item)}>Edit</EditButton>
            <DeleteButton 
              onClick={() => handleDelete(item.id, item.name)}
              disabled={deletingIds.has(item.id)}
            >
              {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
            </DeleteButton>
          </td>
        </tr>
      );
    } else if ('description' in item) {
      // Position item
      return (
        <tr key={item.id}>
          <td><strong>{item.name}</strong></td>
          <td>{item.description || '-'}</td>
          <td>
            <ToggleButton 
              $active={isActive}
              onClick={() => handleToggleActive(item)}
            >
              {isActive ? 'Active' : 'Inactive'}
            </ToggleButton>
          </td>
          <td><small>{new Date(item.created_at).toLocaleDateString()}</small></td>
          <td>
            <EditButton onClick={() => handleEdit(item)}>Edit</EditButton>
            <DeleteButton 
              onClick={() => handleDelete(item.id, item.name)}
              disabled={deletingIds.has(item.id)}
            >
              {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
            </DeleteButton>
          </td>
        </tr>
      );
    } else if ('description' in item && !('code' in item)) {
      // Employment Status item (has description but no code)
      return (
        <tr key={item.id}>
          <td><strong>{item.name}</strong></td>
          <td>{(item as EmploymentStatus).description || '-'}</td>
          <td>
            <ToggleButton 
              $active={isActive}
              onClick={() => handleToggleActive(item)}
            >
              {isActive ? 'Active' : 'Inactive'}
            </ToggleButton>
          </td>
          <td><small>{new Date(item.created_at).toLocaleDateString()}</small></td>
          <td>
            <EditButton onClick={() => handleEdit(item)}>Edit</EditButton>
            <DeleteButton 
              onClick={() => handleDelete(item.id, item.name)}
              disabled={deletingIds.has(item.id)}
            >
              {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
            </DeleteButton>
          </td>
        </tr>
      );
    } else {
      // Relationship item (no description, no code)
      return (
        <tr key={item.id}>
          <td><strong>{item.name}</strong></td>
          <td>
            <ToggleButton 
              $active={isActive}
              onClick={() => handleToggleActive(item)}
            >
              {isActive ? 'Active' : 'Inactive'}
            </ToggleButton>
          </td>
          <td><small>{new Date(item.created_at).toLocaleDateString()}</small></td>
          <td>
            <EditButton onClick={() => handleEdit(item)}>Edit</EditButton>
            <DeleteButton 
              onClick={() => handleDelete(item.id, item.name)}
              disabled={deletingIds.has(item.id)}
            >
              {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
            </DeleteButton>
          </td>
        </tr>
      );
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="dropdown-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="dropdown-title">
                Dropdown Options Management
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Manage dropdown options for staff registration forms. This comprehensive
                management system allows administrators to add, edit, delete, and
                activate/deactivate options for positions, ranks, and emergency contact
                relationships. These options ensure consistent data entry and maintain
                standardized classification across all emergency service personnel records.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Dropdown Management" />
              ) : (
                <ImagePlaceholder>
                  Image not available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Management Section */}
      <Section aria-labelledby="management-section">
        <ManagementSection>
          <SubTitle id="management-section">
            {getTabTitle()} Management
          </SubTitle>

          {/* Tab Navigation */}
          <TabContainer>
            <Tab 
              $active={activeTab === 'positions'}
              onClick={() => setActiveTab('positions')}
            >
              Positions
            </Tab>
            <Tab 
              $active={activeTab === 'ranks'}
              onClick={() => setActiveTab('ranks')}
            >
              Ranks
            </Tab>
            <Tab 
              $active={activeTab === 'emergency_contact_relationships'}
              onClick={() => setActiveTab('emergency_contact_relationships')}
            >
              Emergency Contact Relationships
            </Tab>
            <Tab 
              $active={activeTab === 'employment_status'}
              onClick={() => setActiveTab('employment_status')}
            >
              Employment Status
            </Tab>
          </TabContainer>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit}>
            <FormRow>
              <FormColumn $flex="2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={`Enter ${getTabTitle().toLowerCase().slice(0, -1)} name`}
                />
              </FormColumn>
              
              {activeTab === 'ranks' && (
                <>
                  <FormColumn>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter rank code"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </FormColumn>
                  <FormColumn>
                    <Label htmlFor="level">Level *</Label>
                    <Input
                      type="number"
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </FormColumn>
                </>
              )}
            </FormRow>

            {(activeTab === 'positions' || activeTab === 'ranks' || activeTab === 'employment_status') && (
              <FormRow>
                <FormColumn>
                  <Label htmlFor="description">Description</Label>
                  <TextArea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={`Enter ${getTabTitle().toLowerCase().slice(0, -1)} description`}
                  />
                </FormColumn>
              </FormRow>
            )}

            {activeTab === 'ranks' && (
              <FormRow>
                <FormColumn>
                  <Label htmlFor="picture">Rank Marking Picture</Label>
                  <FileInput
                    type="file"
                    id="picture"
                    name="picture"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  {formData.pictureUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <Label>Current Picture:</Label>
                      <ImagePreview src={formData.pictureUrl} alt="Current rank marking" />
                    </div>
                  )}
                  {formData.picture && (
                    <div style={{ marginTop: '10px' }}>
                      <Label>New Picture Preview:</Label>
                      <ImagePreview src={URL.createObjectURL(formData.picture)} alt="New rank marking preview" />
                    </div>
                  )}
                </FormColumn>
              </FormRow>
            )}

            <FormRow>
              <FormColumn $flex="auto">
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Option' : 'Add Option')}
                </SubmitButton>
                {isEditing && (
                  <CancelButton type="button" onClick={handleCancel}>
                    Cancel
                  </CancelButton>
                )}
              </FormColumn>
            </FormRow>
          </form>

          {/* Print Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
            <PrintButton onClick={generatePDF} disabled={isGeneratingPDF || getCurrentData().length === 0}>
              {isGeneratingPDF ? 'Generating PDF...' : 'Print Report'}
            </PrintButton>
          </div>



          {/* Options Table */}
          {getCurrentData().length > 0 ? (
            <OptionsTable>
              <thead>
                {renderTableHeaders()}
              </thead>
              <tbody>
                {getCurrentData().map(item => renderTableRow(item))}
              </tbody>
            </OptionsTable>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {loading ? `Loading ${getTabTitle().toLowerCase()}...` : `No ${getTabTitle().toLowerCase()} found.`}
            </p>
          )}
        </ManagementSection>
      </Section>
    </MainContent>
  );
};
