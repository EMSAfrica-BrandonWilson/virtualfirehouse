import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { usePageImage } from '../../../hooks/usePageImage';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import { formatDateTime } from '../../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background-color: #4682B4;
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 13px;
  border-bottom: 1px solid #e1e1e1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const EditButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #218838;
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



export const DepartmentReports: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isSystemAdmin, userRole } = useAdminCheck();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('department-reports', '/images/VirtualFireHouse.png');
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Load departments when user or admin status changes
  useEffect(() => {
    loadDepartments();
  }, [currentUser, isSystemAdmin]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      
      console.log('🔍 Debug: Starting loadDepartments');
      console.log('🔍 Debug: currentUser:', currentUser);
      console.log('🔍 Debug: isSystemAdmin:', isSystemAdmin);
      console.log('🔍 Debug: userRole:', userRole);
      
      // Apply filtering based on user authentication and role
      if (!currentUser) {
        console.log('🔍 Debug: No user logged in, showing empty departments');
        // If no user is logged in, show no departments
        setDepartments([]);
        return;
      }

      console.log('🔍 Debug: User is logged in, proceeding with query');
      
      // Query the emergency_departments table (where real data is stored)
      let query = supabase
        .from('emergency_departments')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 Debug: User is System Admin, showing all departments');
      console.log('🔍 Debug: Executing query...');
      
      const { data: depts, error: deptsError } = await query;

      console.log('🔍 Debug: Query result - data:', depts);
      console.log('🔍 Debug: Query result - error:', deptsError);

      if (deptsError) {
        console.error('❌ Error fetching departments:', deptsError);
        setDepartments([]);
        return;
      }

      if (depts && depts.length > 0) {
        console.log('✅ Successfully loaded', depts.length, 'departments');
        console.log('🔍 Debug: Departments loaded:', depts.map(d => `${d.dept_name} (${d.id})`));
        
        // Check specifically for King Fahd
        const kingFahd = depts.find(d => d.dept_name === 'King Fahd International Airport');
        if (kingFahd) {
          console.log('✅ Found King Fahd International Airport in results!');
          console.log('🔍 Debug: King Fahd data:', kingFahd);
        } else {
          console.log('❌ King Fahd International Airport NOT found in results');
        }
      } else {
        console.log('❌ No departments found');
      }

      // Use the original database field names for compatibility with DepartmentRestored component
      const mappedDepartments = (depts || []).map(dept => ({
        id: dept.id,
        dept_name: dept.dept_name,
        dept_type: dept.department_type,
        dept_city: dept.dept_city,
        dept_suburb: dept.dept_suburb,
        dept_street_name: dept.dept_street_name,
        dept_street_number: dept.dept_street_number,
        dept_telephone: dept.dept_telephone,
        created_at: dept.created_at
      }));

      console.log('🔍 Debug: Mapped departments:', mappedDepartments);
      setDepartments(mappedDepartments);
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const generatePDF = async () => {
    // Convert logo URL to base64 for PDF generation
    let logoBase64 = '';
    
    try {
      if (imageUrl) {
        console.log('Converting logo to base64 for PDF generation');
        // Convert imageUrl to base64 if it's a URL
        if (imageUrl.startsWith('data:')) {
          logoBase64 = imageUrl;
        } else if (imageUrl.startsWith('/')) {
          // Convert relative path to absolute URL
          const fullUrl = window.location.origin + imageUrl;
          const response = await fetch(fullUrl);
          if (response.ok) {
            const blob = await response.blob();
            logoBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            console.log('Logo converted to base64 successfully');
          }
        }
      }
    } catch (error) {
      console.warn('Failed to convert logo to base64:', error);
    }
    
    const doc = new jsPDF('landscape');
    
    // Setup standard VFH PDF header and get table configuration
    const { tableStartY, tableConfig } = setupVFHStandardPDF({
      doc,
      logoBase64,
      data: {
        departmentName: 'VirtualFireHouse',
        departmentType: 'Emergency Management System',
        reportTitle: 'Registered Departments Report',
        summaryText: 'List of all registered emergency departments',
        currentUser,
      },
    });

    // Prepare table data
    const tableData = departments.map(dept => [
      dept.name || 'N/A',
      dept.type || 'N/A',
      dept.city || 'N/A',
      dept.suburb || 'N/A',
      dept.telephone || 'N/A',
      formatDateTime(dept.created_at)
    ]);

    // Add table using standard configuration with footer
    autoTable(doc, {
      head: [['Department Name', 'Type', 'City', 'Suburb', 'Telephone', 'Registered']],
      body: tableData,
      startY: tableStartY,
      styles: tableConfig.styles,
      headStyles: tableConfig.headStyles,
      alternateRowStyles: tableConfig.alternateRowStyles,
      margin: tableConfig.margin,
      tableWidth: tableConfig.tableWidth,
      didDrawPage: tableConfig.didDrawPage,
    });

    // Save to sessionStorage and navigate to viewer
    const pdfDataUri = doc.output('dataurlstring');
    const fileName = `pdf_Registered_Departments_Report_${Date.now()}`;
    sessionStorage.setItem(fileName, pdfDataUri);
    
    // Store navigation context for PDF viewer
    sessionStorage.setItem('pdf_source_section', '/admin/register/department/reports');
    sessionStorage.setItem('pdf_source_path', '/admin/register/department/reports');
    
    navigate(`/pdf-viewer/${fileName}`);
  };

  const handleEditDepartment = (department: any) => {
    // Store the department data for editing using database field names
    sessionStorage.setItem('editing_department', JSON.stringify({
      id: department.id,
      dept_name: department.dept_name,
      dept_type: department.dept_type,
      dept_city: department.dept_city,
      dept_suburb: department.dept_suburb,
      dept_street_name: department.dept_street_name || '',
      dept_street_number: department.dept_street_number || '',
      dept_telephone: department.dept_telephone
    }));
    
    // Navigate to the registration form
    navigate('/admin/register/department/process');
  };

  return (
    <MainContent aria-label="Main content">
      <TitleContainer>
        <Title>Registered Departments Report</Title>
        <DepartmentCount>
          Number of Registered Departments: {departments.length.toString().padStart(3, '0')}
        </DepartmentCount>
      </TitleContainer>
      <Divider aria-hidden="true" />
      
      {/* Department Reports Section */}
      <Section aria-labelledby="department-reports">
        <FormSection>
          {loadingDepartments ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading departments...</div>
          ) : departments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No departments registered yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Department Name</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>City</TableHeaderCell>
                  <TableHeaderCell>Suburb</TableHeaderCell>
                  <TableHeaderCell>Telephone</TableHeaderCell>
                  <TableHeaderCell>Registered</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name || 'N/A'}</TableCell>
                    <TableCell>{dept.type || 'N/A'}</TableCell>
                    <TableCell>{dept.city || 'N/A'}</TableCell>
                    <TableCell>{dept.suburb || 'N/A'}</TableCell>
                    <TableCell>{dept.telephone || 'N/A'}</TableCell>
                    <TableCell>{formatDateTime(dept.created_at)}</TableCell>
                    <TableCell>
                      <EditButton 
                        onClick={() => handleEditDepartment(dept)}
                        title="Edit this department"
                      >
                        Edit
                      </EditButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </FormSection>
        
        <ActionButtons>
          <EditButton onClick={() => navigate('/admin/register/department/process')} title="Register a new department">
            Register New Department
          </EditButton>
          <PrintButton 
            onClick={generatePDF} 
            disabled={loadingDepartments || departments.length === 0}
            title="Generate PDF report"
          >
            Print Departments Report
          </PrintButton>
        </ActionButtons>
      </Section>
    </MainContent>
  );
};
