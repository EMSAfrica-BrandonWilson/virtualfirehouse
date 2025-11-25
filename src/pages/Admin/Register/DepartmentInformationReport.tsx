import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import { formatDateTime, formatDateOnly, formatDateTimeReadable } from '../../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, cleanupTrailingBlankPages } from '../../../utils/pdfReportHelper';
import { usePageImage } from '../../../hooks/usePageImage';

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

const DropdownContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const DropdownGroup = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#FF9900'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#545b62' : '#e08800'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
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

const ResultCount = styled.div`
  padding: 10px;
  background-color: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #0066cc;
  font-weight: 500;
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

const DepartmentField = {
  ID: 'id',
  NAME: 'dept_name',
  TYPE: 'dept_type',
  COUNTRY: 'dept_country',
  CITY: 'dept_city',
  SUBURB: 'dept_suburb',
  STREET_NAME: 'dept_street_name',
  STREET_NUMBER: 'dept_street_number',
  TELEPHONE: 'dept_telephone',
  FIRE_STATIONS: 'number_of_fire_stations',
  FIRE_VEHICLES: 'number_of_fire_vehicles',
  STAFF_COUNT: 'number_of_staff',
  HEAD_OF_DEPARTMENT: 'head_of_department',
  EMAIL: 'contact_email',
  DESCRIPTION: 'description',
  STATUS: 'operational_status',
  PICTURE_URL: 'dept_picture_url',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const;

const fieldLabels: Record<string, string> = {
  '': '-- Select Field --',
  [DepartmentField.ID]: 'ID',
  [DepartmentField.NAME]: 'Department Name',
  [DepartmentField.TYPE]: 'Department Type',
  [DepartmentField.COUNTRY]: 'Country',
  [DepartmentField.CITY]: 'City',
  [DepartmentField.SUBURB]: 'Suburb',
  [DepartmentField.STREET_NAME]: 'Street Name',
  [DepartmentField.STREET_NUMBER]: 'Street Number',
  [DepartmentField.TELEPHONE]: 'Telephone',
  [DepartmentField.FIRE_STATIONS]: 'Number of Fire Stations',
  [DepartmentField.FIRE_VEHICLES]: 'Number of Fire Vehicles',
  [DepartmentField.STAFF_COUNT]: 'Staff Count',
  [DepartmentField.HEAD_OF_DEPARTMENT]: 'Head of Department',
  [DepartmentField.EMAIL]: 'Contact Email',
  [DepartmentField.DESCRIPTION]: 'Description',
  [DepartmentField.STATUS]: 'Operational Status',
  [DepartmentField.PICTURE_URL]: 'Picture URL',
  [DepartmentField.CREATED_AT]: 'Created Date',
  [DepartmentField.UPDATED_AT]: 'Updated Date'
};

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

export const DepartmentInformationReport: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, userProfile } = useAuth();
  const { isSystemAdmin, userRole } = useAdminCheck();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('department-information-report', '/images/VirtualFireHouse.png');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Generate base64 logo for PDF generation
  const generatePDFLogo = async (): Promise<string> => {
    try {
      // Try to fetch the DACO logo from public images
      const logoResponse = await fetch('/images/daco-new-logo.jpg');
      
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(logoBlob);
        });
      }
      
      // Fallback to VirtualFireHouse logo if DACO logo fails
      if (imageUrl) {
        const fallbackResponse = await fetch(imageUrl);
        if (fallbackResponse.ok) {
          const fallbackBlob = await fallbackResponse.blob();
          
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fallbackBlob);
          });
        }
      }
    } catch (error) {
      console.warn('Could not load logo for PDF:', error);
    }
    
    return '';
  };

  // Six dropdown states
  const [selectedField1, setSelectedField1] = useState('');
  const [selectedField2, setSelectedField2] = useState('');
  const [selectedField3, setSelectedField3] = useState('');
  const [selectedField4, setSelectedField4] = useState('');
  const [selectedField5, setSelectedField5] = useState('');
  const [selectedField6, setSelectedField6] = useState('');

  const [filteredResults, setFilteredResults] = useState<Department[]>([]);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('*')
        .order('created_at', { ascending: false });

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
        
        setDepartments(mappedDepartments);
        setFilteredResults(mappedDepartments); // Show all initially
      }
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError(error.message || 'Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const generateReport = () => {
    // Get all selected fields (remove empty selections)
    const selectedFields = [
      selectedField1,
      selectedField2,
      selectedField3,
      selectedField4,
      selectedField5,
      selectedField6
    ].filter(field => field !== '');

    if (selectedFields.length === 0) {
      setError('Please select at least one field to include in the report.');
      return;
    }

    // Set filtered results based on departments (for now, show all departments with selected fields)
    setFilteredResults(departments);
    setHasGeneratedReport(true);
    setError(''); // Clear any previous errors
  };

  // TODO: Fix syntax errors in generatePDF function
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    // Get all selected fields (remove empty selections)
    const selectedFields = [
      selectedField1,
      selectedField2,
      selectedField3,
      selectedField4,
      selectedField5,
      selectedField6
    ].filter(field => field !== '');

    if (selectedFields.length === 0) {
      setError('Please select fields before generating PDF.');
      setIsGeneratingPDF(false);
      return;
    }

    try {
      // Generate logo in base64 format
      const logoBase64 = await generatePDFLogo();
      
      // Generate display timestamp (unused for viewer key)
      const timestamp = formatDateOnly(new Date());

      // Create PDF document
      const doc = new jsPDF('landscape');
      
      // Build concise summary text
      const fieldNames = selectedFields.map(field => fieldLabels[field]);
      const summaryFull = `Fields (${selectedFields.length}): ${fieldNames.join(', ')}`;
      const maxSummaryLen = 90;
      const summaryText = summaryFull.length > maxSummaryLen 
        ? `${summaryFull.slice(0, maxSummaryLen - 3)}...`
        : summaryFull;

      // Set up standard PDF formatting with logo
      const { tableStartY, tableConfig } = setupVFHStandardPDF({
        doc,
        logoBase64,
        data: {
          departmentName: 'DACO - Dammam Airports',
          departmentType: 'Emergency Management System',
          reportTitle: 'Dept Info Report',
          summaryText,
          // Pass profile to ensure footer shows display name, not email
          currentUser: { profile: userProfile },
        }
      });

      // Prepare table data
      const tableData = filteredResults.map(dept => 
        selectedFields.map(field => {
          const value = (dept as any)[field];
          return field === 'created_at' || field === 'updated_at' 
            ? formatDateTime(value) 
            : value || 'N/A';
        })
      );

      // Generate table headers from selected fields
      const tableHeaders = selectedFields.map(field => fieldLabels[field] || field);

      // Add table to PDF
      autoTable(doc, {
        startY: tableStartY,
        head: [tableHeaders],
        body: tableData,
        ...tableConfig,
      });

      // Remove any trailing blank page that might have been added by the table/layout
      cleanupTrailingBlankPages(doc);

      // Save to sessionStorage and navigate to viewer (render, not download)
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_Department_Information_Report_${Date.now()}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      sessionStorage.setItem('pdf_source_section', '/admin/register/department/details');
      sessionStorage.setItem('pdf_source_path', '/admin/register/department/details');
      navigate(`/pdf-viewer/${pdfKey}`);
      
      // Reset states
      setIsGeneratingPDF(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      setIsGeneratingPDF(false);
    }
  };

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, [currentUser, isSystemAdmin]);

  return (
    <MainContent aria-label="Main content">
      <TitleContainer>
        <Title>Department Information Report</Title>
      </TitleContainer>

      {/* Field Selection Section */}
      <FormSection>
        <SubTitle>Customize Your Report</SubTitle>
        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          Select up to six department fields to include in your custom report. The report will show all departments with the selected information.
        </p>

        <DropdownContainer>
          <DropdownGroup>
            <Label htmlFor="field1">Field 1</Label>
            <Select
              id="field1"
              value={selectedField1}
              onChange={(e) => setSelectedField1(e.target.value)}
            >
              {Object.entries(fieldLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </DropdownGroup>

          <DropdownGroup>
            <Label htmlFor="field2">Field 2</Label>
            <Select
              id="field2"
              value={selectedField2}
              onChange={(e) => setSelectedField2(e.target.value)}
            >
              {Object.entries(fieldLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </DropdownGroup>

          <DropdownGroup>
            <Label htmlFor="field3">Field 3</Label>
            <Select
              id="field3"
              value={selectedField3}
              onChange={(e) => setSelectedField3(e.target.value)}
            >
              {Object.entries(fieldLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </DropdownGroup>

          <DropdownGroup>
            <Label htmlFor="field4">Field 4</Label>
            <Select
              id="field4"
              value={selectedField4}
              onChange={(e) => setSelectedField4(e.target.value)}
            >
              {Object.entries(fieldLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </DropdownGroup>

          <DropdownGroup>
            <Label htmlFor="field5">Field 5</Label>
            <Select
              id="field5"
              value={selectedField5}
              onChange={(e) => setSelectedField5(e.target.value)}
            >
              {Object.entries(fieldLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </DropdownGroup>

          <DropdownGroup>
            <Label htmlFor="field6">Field 6</Label>
            <Select
              id="field6"
              value={selectedField6}
              onChange={(e) => setSelectedField6(e.target.value)}
            >
              {Object.entries(fieldLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </DropdownGroup>
        </DropdownContainer>

        <FilterSection>
          <Button onClick={generateReport} disabled={departmentsLoading}>
            Generate Report
          </Button>
          <Button 
            onClick={() => generatePDF()} 
            variant="secondary"
            disabled={!hasGeneratedReport || departmentsLoading || isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Export to PDF'}
          </Button>
        </FilterSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormSection>

      {/* Results Section */}
      {hasGeneratedReport && (
        <FormSection>
          <SubTitle>Report Results</SubTitle>
          <ResultCount>
            Showing {filteredResults.length} departments with selected fields
          </ResultCount>

          {departmentsLoading ? (
            <p>Loading departments...</p>
          ) : filteredResults.length > 0 ? (
            <ResultsTable>
              <thead>
                <tr>
                  {[selectedField1, selectedField2, selectedField3, selectedField4, selectedField5, selectedField6]
                    .filter(field => field !== '')
                    .map(field => (
                      <th key={field}>{fieldLabels[field] || field}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(dept => (
                  <tr key={dept.id}>
                    {[selectedField1, selectedField2, selectedField3, selectedField4, selectedField5, selectedField6]
                      .filter(field => field !== '')
                      .map(field => {
                        const value = (dept as any)[field];
                        const displayValue = field === 'created_at' || field === 'updated_at' 
                          ? formatDateTime(value) 
                          : value || 'N/A';
                        return (
                          <td key={field}>
                            {displayValue}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </ResultsTable>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              No departments found.
            </p>
          )}
        </FormSection>
      )}
    </MainContent>
  );
};
