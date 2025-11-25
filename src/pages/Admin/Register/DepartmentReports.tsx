import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { usePageImage } from '../../../hooks/usePageImage';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import { formatDateTime } from '../../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, cleanupTrailingBlankPages } from '../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../utils/companyLogo';
// Removed companyLogo import - now using usePageImage hook
const LOCAL_STORAGE_DEPARTMENTS_KEY = 'vfh_departments';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin: 0;
`;

const DepartmentCount = styled.span`
  font-size: 1.2rem;
  color: #1177BB;
  font-weight: 600;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

const DepartmentTable = styled.table`
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

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const PrintButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e08800;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

interface Department {
  id: number;
  dept_name: string;
  dept_type: string;
  dept_country: string;
  dept_city: string;
  dept_suburb: string;
  dept_street_name: string;
  dept_street_number: string;
  dept_telephone: string;
  number_of_fire_stations: number;
  number_of_fire_vehicles: number;
  number_of_staff: number;
  head_of_department: string;
  contact_email: string;
  description: string;
  operational_status: string;
  dept_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export const DepartmentReports: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, userProfile } = useAuth();
  const { isSystemAdmin, userRole } = useAdminCheck();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('department-reports', '/images/daco-new-logo.jpg');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [serverIds, setServerIds] = useState<Set<number>>(new Set());
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // Use imageUrl for PDF generation (convert to base64 if needed)
  let logoBase64 = imageUrl || '';

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    setError('');
    try {
      let query = supabase
        .from('02_admin_register_fd1_departments')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message || 'Failed to load departments');
      }

      if (data) {
        // Convert database format to component format
        const mappedDepartments = data.map(dept => ({
          id: dept.id,
          dept_name: dept.dept_name,
          dept_type: dept.dept_type,
          dept_country: dept.dept_country,
          dept_city: dept.dept_city,
          dept_suburb: dept.dept_suburb,
          dept_street_name: dept.dept_street_name,
          dept_street_number: dept.dept_street_number,
          dept_telephone: dept.dept_telephone,
          number_of_fire_stations: dept.number_of_fire_stations,
          number_of_fire_vehicles: dept.number_of_fire_vehicles,
          number_of_staff: dept.number_of_staff,
          head_of_department: dept.head_of_department,
          contact_email: dept.contact_email,
          description: dept.description,
          operational_status: dept.operational_status,
          dept_picture_url: dept.dept_picture_url,
          created_at: dept.created_at,
          updated_at: dept.updated_at
        }));

        // Track server IDs for dedup and delete decisions
        const ids = new Set<number>(mappedDepartments.map(d => d.id));
        setServerIds(ids);

        // Load local departments and deduplicate by ID (prefer server)
        let localDepartments: Department[] = [];
        try {
          localDepartments = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY) || '[]');
        } catch (lsErr) {
          console.warn('Failed to read local departments:', lsErr);
        }
        const localUnique = localDepartments.filter(d => !ids.has(d.id));
        const combined = [...mappedDepartments, ...localUnique].sort((a, b) => {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          return bTime - aTime;
        });
        setDepartments(combined);
        setError('');
      }
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError(error.message || 'Failed to load departments');

      // Fallback: load only local departments
      try {
        const localDepartments: Department[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY) || '[]');
        setServerIds(new Set());
        setDepartments(localDepartments);
      } catch (lsErr) {
        console.warn('Failed to read local departments on error:', lsErr);
        setDepartments([]);
      }
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const deleteDepartment = async (departmentId: number) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(departmentId));
    try {
      // Delete via backend if the record exists on server; otherwise delete locally
      if (serverIds.has(departmentId)) {
        const { error } = await supabase.functions.invoke('departments-crud', {
          method: 'DELETE',
          body: { departmentId }
        });
        if (error) {
          throw new Error(error.message || 'Failed to delete department');
        }
        // Cleanup any local copy with same ID
        try {
          const localDepartments: Department[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY) || '[]');
          const after = localDepartments.filter(d => d.id !== departmentId);
          localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS_KEY, JSON.stringify(after));
        } catch {}
        setSuccess('Department deleted successfully!');
        await loadDepartments();
      } else {
        try {
          const localDepartments: Department[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY) || '[]');
          const after = localDepartments.filter(d => d.id !== departmentId);
          localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS_KEY, JSON.stringify(after));
          setDepartments(prev => prev.filter(d => d.id !== departmentId));
          setSuccess('Department deleted successfully!');
        } catch (lsErr) {
          console.warn('Local delete failed:', lsErr);
          throw new Error('Failed to delete local department');
        }
      }
    } catch (error: any) {
      console.error('Error deleting department:', error);
      setError(error.message || 'Failed to delete department');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(departmentId);
        return newSet;
      });
    }
  };

  const editDepartment = (department: Department) => {
    // Store the department data for editing using database field names
    sessionStorage.setItem('editing_department', JSON.stringify({
      id: department.id,
      dept_name: department.dept_name,
      dept_type: department.dept_type,
      dept_country: department.dept_country || '',
      dept_city: department.dept_city,
      dept_suburb: department.dept_suburb,
      dept_street_name: department.dept_street_name || '',
      dept_street_number: department.dept_street_number || '',
      dept_telephone: department.dept_telephone,
      number_of_fire_stations: department.number_of_fire_stations || '',
      number_of_fire_vehicles: department.number_of_fire_vehicles || '',
      number_of_staff: department.number_of_staff || '',
      head_of_department: department.head_of_department || '',
      contact_email: department.contact_email || '',
      description: department.description || '',
      operational_status: department.operational_status || '',
      dept_picture_url: department.dept_picture_url || ''
    }));
    
    // Navigate to the registration form
    navigate('/admin/register/department/process');
  };

  const generatePDF = async () => {
    setPdfGenerating(true);
    
    try {
      const doc = new jsPDF('landscape');
      
      // Helper to convert image URL (including relative paths) to base64
      const convertImageUrlToBase64 = async (url?: string | null): Promise<string | null> => {
        try {
          if (!url) return null;
          // If already a data URL, return as is
          if (url.startsWith('data:')) return url;
          const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
          const response = await fetch(fullUrl);
          if (!response.ok) return null;
          const blob = await response.blob();
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Failed to convert image to base64:', e);
          return null;
        }
      };
      
      const detectImageFormat = (dataUrl: string): 'PNG' | 'JPEG' | null => {
        if (!dataUrl) return null;
        const lower = dataUrl.slice(0, 64).toLowerCase();
        if (lower.includes('image/png')) return 'PNG';
        if (lower.includes('image/jpeg') || lower.includes('image/jpg')) return 'JPEG';
        // Unsupported types (e.g., webp, svg) should be skipped to avoid runtime errors
        return null;
      };
      
      // Initialize logo; will resolve after selecting primary department
      let logoBase64 = '';
      
      // Determine header department from database results
      let headerDepartmentName = 'Emergency Services';
      let headerDepartmentType = '';
      if (departments && departments.length > 0) {
        // Prefer a department that looks like EMS owner; otherwise use the newest
        const primaryDept = departments.find(d =>
          (((d as any).dept_type || '').toLowerCase().includes('emergency management'))
        ) || departments[0];
        headerDepartmentName = primaryDept.dept_name || headerDepartmentName;
        // Support both API shapes for type
        headerDepartmentType = (primaryDept as any).dept_type || (primaryDept as any).department_type || '';
        // Resolve logo using centralized helper (DACO-first, then department logo)
        logoBase64 = await getPDFLogo(primaryDept?.dept_picture_url);
      }

      // Setup standard VFH PDF header and get table configuration
      const { tableStartY, tableConfig } = setupVFHStandardPDF({
        doc,
        logoBase64,
        data: {
          departmentName: headerDepartmentName,
          departmentType: headerDepartmentType,
          reportTitle: 'Registered Departments Report',
          summaryText: 'Directory of registered emergency departments with key metrics',
          // Pass profile to ensure footer shows display name, not email
          currentUser: { profile: userProfile },
        },
      });

      // Prepare table data without logos to ensure robust PDF generation
      // Dept Name, Dept Type, Telephone, No of Stations, No of Vehicles, No of Staff
      const tableData = departments.map((dept) => [
        dept.dept_name || 'N/A',
        dept.dept_type || 'N/A',
        dept.dept_telephone || 'N/A',
        (dept.number_of_fire_stations ?? 'N/A').toString(),
        (dept.number_of_fire_vehicles ?? 'N/A').toString(),
        (dept.number_of_staff ?? 'N/A').toString(),
      ]);

      // Add table using standard configuration with footer
      autoTable(doc, {
        head: [[
          'Dept Name',
          'Dept Type',
          'Telephone',
          'No of Stations',
          'No of Vehicles',
          'No of Staff',
        ]],
        body: tableData,
        startY: tableStartY,
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        // Use a valid TableWidthType; 'full' is not supported by jspdf-autotable types.
        // 'auto' lets columns expand within margins; numeric width is another option if needed.
        tableWidth: 'auto',
        didDrawPage: tableConfig.didDrawPage,
      columnStyles: {
        0: { cellWidth: 60 }, // Dept Name
        1: { cellWidth: 60 }, // Dept Type
        // Let remaining columns auto-expand to help fill full width
      },
      });

      // Remove any trailing blank page that might have been added by the table/layout
      cleanupTrailingBlankPages(doc);

      // Save to sessionStorage and navigate to viewer
      const pdfDataUri = doc.output('datauristring');
      const fileName = `pdf_Registered_Departments_Report_${Date.now()}`;
      sessionStorage.setItem(fileName, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/register/department/reports');
      sessionStorage.setItem('pdf_source_path', '/admin/register/department/reports');
      
      navigate(`/pdf-viewer/${fileName}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, [currentUser, isSystemAdmin]);

  return (
    <MainContent aria-label="Main content">
      <TitleContainer>
        <Title>Registered Departments Report</Title>
        <DepartmentCount>
          Number of Registered Departments: {departments.length.toString().padStart(3, '0')}
        </DepartmentCount>
      </TitleContainer>
      <Divider aria-hidden="true" />
      
      {/* Header Section */}
      <Section aria-labelledby="department-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Paragraph>
                The Department Directory provides comprehensive information of all registered Emergency Service departments within the King Fahd International Airport Emergency Services Organisation.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/VirtualFireHouse.png" alt="Department Directory" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>
      
      {/* Department Directory Section */}
      <Section aria-labelledby="department-directory">
        <FormSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SubTitle id="department-directory">Department Directory</SubTitle>
            <RefreshButton onClick={loadDepartments} disabled={departmentsLoading} type="button">
              {departmentsLoading ? 'Loading...' : 'Refresh List'}
            </RefreshButton>
          </div>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          {departments.length > 0 ? (
            <DepartmentTable>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Type</th>
                  <th>Country</th>
                  <th>City</th>
                  <th>Stations</th>
                  <th>Vehicles</th>
                  <th>Staff</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td>{dept.dept_name}</td>
                    <td>{dept.dept_type || 'N/A'}</td>
                    <td>{dept.dept_country || 'N/A'}</td>
                    <td>{dept.dept_city}</td>
                    <td>{dept.number_of_fire_stations || 'N/A'}</td>
                    <td>{dept.number_of_fire_vehicles || 'N/A'}</td>
                    <td>{dept.number_of_staff || 'N/A'}</td>
                    <td>{dept.operational_status || 'N/A'}</td>
                    <td>
                      <EditButton
                        onClick={() => editDepartment(dept)}
                      >
                        Edit
                      </EditButton>
                      <DeleteButton
                        onClick={() => deleteDepartment(dept.id)}
                        disabled={deletingIds.has(dept.id)}
                      >
                        {deletingIds.has(dept.id) ? 'Deleting...' : 'Delete'}
                      </DeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DepartmentTable>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              {departmentsLoading ? 'Loading departments...' : 'No departments registered yet.'}
            </p>
          )}
        </FormSection>
        
        <ActionButtons>
          <PrintButton 
            onClick={generatePDF} 
            disabled={departmentsLoading || pdfGenerating || departments.length === 0}
            title="Generate PDF report"
          >
            Print Departments Report
          </PrintButton>
        </ActionButtons>
      </Section>
    </MainContent>
  );
};
