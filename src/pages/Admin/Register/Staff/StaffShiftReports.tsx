import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../../hooks/usePageImage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFH_A4_L, cleanupTrailingBlankPages, applyFinalPageNumbers } from '../../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../../utils/companyLogo';
import { initializePDFFontsSync } from '../../../../utils/pdfFonts';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
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

const ControlsSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 15px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 200px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const RefreshButton = styled.button`
  /* Using custom-styled class to avoid global button override */
  &.custom-styled {
    background-color: #28a745;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #218838;
    }
    
    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  }
`;

const PDFButton = styled.button`
  /* Using custom-styled class to avoid global button override */
  &.custom-styled {
    background-color: #FF9900;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-left: auto;
    
    &:hover {
      background-color: #E68A00;
    }
    
    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  }
`;

const ClearFiltersButton = styled.button`
  /* Using custom-styled class to avoid global button override */
  &.custom-styled {
    background-color: #6c757d;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #5a6268;
    }
    
    &:disabled {
      background-color: #adb5bd;
      cursor: not-allowed;
    }
  }
`;

const StaffListSection = styled.div`
  margin-top: 2rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

const StaffTable = styled.table<{ $headerColor?: string }>`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: ${props => props.$headerColor || '#FF9900'};
    color: white;
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  tbody tr:hover {
    background-color: #f5f5f5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant: 'edit' | 'view' | 'delete' }>`
  background-color: ${props => props.$variant === 'edit' ? '#FF9900' : props.$variant === 'delete' ? '#dc3545' : '#6c757d'};
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$variant === 'edit' ? '#E68A00' : props.$variant === 'delete' ? '#c82333' : '#5a6268'};
  }
`;

interface Shift {
  id: number;
  shift_name: string;
}

interface StaffMember {
  staff_id: number;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  nationality?: string;
  operational_shift_id?: number;
  shift_name?: string;
  photo_url?: string;
}

export const StaffShiftReports: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [employeeNumberFilter, setEmployeeNumberFilter] = useState('');
  const [firstNameFilter, setFirstNameFilter] = useState('');
  
  const clearAllFilters = () => {
    setSelectedShift('all');
    setEmployeeNumberFilter('');
    setFirstNameFilter('');
  };

  // Function to get header color based on selected shift
  const getHeaderColor = (shift: string): string => {
    switch (shift) {
      case 'Blue Shift':
        return '#007bff'; // Blue
      case 'Green Shift':
        return '#28a745'; // Green
      case 'Red Shift':
        return '#dc3545'; // Red
      case 'Day Shift':
        return '#6f42c1'; // Purple
      default:
        return '#4682B4'; // Same blue as horizontal menubar
    }
  };

  // Removed local logo helper; use centralized getPDFLogo from utils

  useEffect(() => {
    loadCurrentUser();
    loadDepartments();
    loadShifts();
    loadStaff();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedShift, staff, employeeNumberFilter, firstNameFilter]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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

  const loadDepartments = async () => {
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
    }
  };

  const loadShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('id, shift_name')
        .order('shift_name', { ascending: true });

      if (error) throw error;
      setShifts(data || []);
    } catch (error: any) {
      console.error('Error loading shifts:', error);
      setError('Failed to load shift information');
    }
  };

  const loadStaff = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all staff
      const { data: staffData, error: staffError } = await supabase
        .from('02_admin_staff_1_registration')
        .select('*')
        .order('employee_number', { ascending: true });

      if (staffError) throw staffError;

      // Fetch shift names
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('id, shift_name');

      if (shiftsError) throw shiftsError;

      // Create a map of shift IDs to names
      const shiftMap = new Map(
        (shiftsData || []).map(s => [s.id, s.shift_name])
      );

      // Combine all data
      const enrichedStaff = (staffData || []).map(member => ({
        ...member,
        shift_name: member.operational_shift_id ? shiftMap.get(member.operational_shift_id) : 'Unassigned'
      }));

      // Sort by shift and employee number
      const sorted = sortStaff(enrichedStaff);
      setStaff(sorted);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      setError(error.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const sortStaff = (staffList: StaffMember[]): StaffMember[] => {
    return [...staffList].sort((a, b) => {
      // First, sort by shift
      const shiftA = a.shift_name || 'Unassigned';
      const shiftB = b.shift_name || 'Unassigned';
      if (shiftA !== shiftB) {
        return shiftA.localeCompare(shiftB);
      }

      // Then, sort by employee number
      return a.employee_number.localeCompare(b.employee_number);
    });
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (!window.confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name} (${member.employee_number})?`)) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: depErr } = await supabase
        .from('shift_assignments')
        .delete()
        .eq('staff_id', member.staff_id);
      if (depErr) throw depErr;
      const { error } = await supabase
        .from('02_admin_staff_1_registration')
        .delete()
        .eq('staff_id', member.staff_id);
      if (error) throw error;
      setStaff(prev => prev.filter(s => s.staff_id !== member.staff_id));
      setFilteredStaff(prev => prev.filter(s => s.staff_id !== member.staff_id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = staff;
    
    // First filter by shift
    if (selectedShift !== 'all') {
      filtered = filtered.filter(member => {
        if (selectedShift === 'unassigned') {
          return !member.operational_shift_id || member.shift_name === 'Unassigned';
        }
        return member.shift_name === selectedShift;
      });
    }
    
    // Then filter by employee number
    if (employeeNumberFilter) {
      filtered = filtered.filter(member =>
        member.employee_number.toLowerCase().includes(employeeNumberFilter.toLowerCase())
      );
    }
    
    // Then filter by first name
    if (firstNameFilter) {
      filtered = filtered.filter(member =>
        (member.first_name || '').toLowerCase().includes(firstNameFilter.toLowerCase())
      );
    }
    
    setFilteredStaff(filtered);
  };

  const handlePrintPDF = async () => {
    if (filteredStaff.length === 0) {
      setError('No staff members to print. Please add staff first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');

    try {
      console.log('PDF Generation - Step 1: Starting PDF generation process');
      
      // Get department information
      // Set correct defaults: department name (KFIA) and department type (ARFFS)
      let departmentName = 'King Fahd International Airport';
      let departmentType = 'Airport Rescue & Fire Fighting Services';
      let departmentLogo = null;
      
      console.log('PDF Generation - Step 2: Loading departments, count:', departments.length);
      
      if (departments.length > 0) {
        const dept = departments[0] as any;
        departmentName = dept.dept_name || departmentName;
        // Support multiple API shapes for department type
        departmentType = dept.department_type || dept.dept_type || dept.deptType || departmentType;
        departmentLogo = dept.dept_picture_url;
        console.log('PDF Generation - Step 2a: Department loaded:', { departmentName, departmentType, hasLogo: !!departmentLogo });
      }

      // Generate base64 logo for PDF using centralized helper (handles PNG/JPEG and fallbacks)
      let logoBase64 = '';
      try {
        console.log('PDF Generation - Step 3: Generating logo via getPDFLogo');
        logoBase64 = await getPDFLogo(departmentLogo || undefined);
        console.log('PDF Generation - Step 3a: Logo generated successfully, length:', logoBase64.length);
      } catch (logoError) {
        console.warn('PDF Generation - Step 3b: Logo generation failed, continuing without logo:', logoError);
      }
      
      // Use standardized VFH-A4 Landscape wrapper for document setup
      console.log('PDF Generation - Step 4: Creating jsPDF document via VFH-A4-L');
      console.log('PDF Generation - Step 4a: jsPDF document init will occur during setup');
      
      // Calculate summary information
      const filterText = selectedShift === 'all' ? 'All Shifts' : 
                         selectedShift === 'unassigned' ? 'Unassigned Staff' : 
                         selectedShift;
      const summaryText = `Filter: ${filterText} | Total Staff: ${filteredStaff.length}`;
      console.log('PDF Generation - Step 5: Summary calculated:', summaryText);
      
      // Setup VFH A4 Landscape with logo, header, and table configuration
      console.log('PDF Generation - Step 6: Setting up VFH-A4-L standard PDF');
      const { doc, tableStartY, tableConfig, filename } = setupVFH_A4_L({
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: departmentName,
          departmentType: departmentType,
          reportTitle: "Staff Shift Report",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });
      console.log('PDF Generation - Step 6a: VFH-A4-L setup completed, filename:', filename);
      // Ensure fonts initialized after doc is created to avoid reference errors
      try {
        initializePDFFontsSync(doc);
      } catch (fontErr) {
        console.warn('PDF Generation - Font init warning:', fontErr);
      }
      
      // Prepare table data
      console.log('PDF Generation - Step 7: Preparing table data');
      const tableData = filteredStaff.map(member => [
        member.employee_number || '-',
        `${member.first_name || ''} ${member.middle_name || ''} ${member.last_name || ''}`.trim() || '-',
        member.shift_name || 'Unassigned',
        member.nationality || '-'
      ]);
      console.log('PDF Generation - Step 7a: Table data prepared, rows:', tableData.length);

      // Create table using VFH A4 standard configuration
      console.log('PDF Generation - Step 8: Creating autoTable');
      // Apply shift-based header coloring
      const nShift = (selectedShift || '').toLowerCase();
      const headerRGB: [number, number, number] =
        nShift.includes('blue') ? [0, 0, 255] :
        nShift.includes('green') ? [0, 255, 0] :
        nShift.includes('red') ? [255, 0, 0] :
        nShift.includes('day') ? [128, 128, 128] : [17, 119, 187];
      const headerTextColor = (nShift.includes('green') || nShift.includes('day')) ? 0 : 255;
      const tableConfigWithShiftColor = {
        ...tableConfig,
        headStyles: {
          ...tableConfig.headStyles,
          fillColor: headerRGB,
          textColor: headerTextColor,
        },
      };
      autoTable(doc, {
        head: [[
          'Employee #',
          'Full Name',
          'Shift',
          'Nationality'
        ]],
        body: tableData,
        startY: tableStartY,
        ...tableConfigWithShiftColor,
        didDrawPage: tableConfig.didDrawPage
      });
      console.log('PDF Generation - Step 8a: AutoTable created successfully');

      // Remove trailing blank pages (if any) and finalize page numbers with accurate totals
      cleanupTrailingBlankPages(doc);
      applyFinalPageNumbers(doc, {
        departmentName: departmentName,
        departmentType: departmentType,
        reportTitle: 'Staff Shift Report',
        summaryText: summaryText,
        currentUser: currentUser
      });

      // Generate PDF Blob and save Blob URL to sessionStorage for viewer access
      console.log('PDF Generation - Step 9: Generating PDF blob output');
      const arrayBuffer = doc.output('arraybuffer');
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      console.log('PDF Generation - Step 9a: Blob URL generated:', blobUrl);

      const pdfKey = `pdf_${filename.replace('.pdf', '')}`;

      // Cleanup any previous pdf_* entries to prevent quota issues and revoke old blob URLs
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('pdf_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => {
          const value = sessionStorage.getItem(key);
          if (value && value.startsWith('blob:')) {
            try { URL.revokeObjectURL(value); } catch {}
          }
          sessionStorage.removeItem(key);
        });
      } catch (cleanupError) {
        console.warn('PDF Generation - Cleanup warning:', cleanupError);
      }

      console.log('PDF Generation - Step 10: Storing Blob URL in sessionStorage with key:', pdfKey);
      sessionStorage.setItem(pdfKey, blobUrl);
      console.log('PDF Generation - Step 10a: Stored Blob URL in sessionStorage successfully');
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/register/staff');
      sessionStorage.setItem('pdf_source_path', '/admin/register/staff/reports-shifts');
      console.log('PDF Generation - Step 11: Navigation context stored');
      
      console.log('PDF Generation - Step 12: Navigating to PDF viewer:', `/pdf-viewer/${pdfKey}`);
      navigate(`/pdf-viewer/${pdfKey}`);
      console.log('PDF Generation - Step 12a: Navigation command issued');
      
    } catch (error: any) {
      console.error('PDF Generation - ERROR: Failed at some step:', error);
      console.error('Error stack:', error.stack);
      setError(`Failed to generate PDF report: ${error.message || 'Unknown error'}. Please check console for details.`);
    } finally {
      console.log('PDF Generation - Step 13: Cleanup - setting isGeneratingPDF to false');
      setIsGeneratingPDF(false);
    }
  };

  return (
    <MainContent>
      <FlexRow>
        <Column style={{ flex: '1', minWidth: '0' }}>
          <Title>Staff Shift Reports</Title>
          <Divider />
          <Paragraph>
            Comprehensive report of all staff members organized by shift. Use the filter below to view specific shifts or export the report to PDF.
          </Paragraph>
        </Column>
        <ImageColumn>
          {imageLoading ? (
            <ImagePlaceholder>Loading image...</ImagePlaceholder>
          ) : imageUrl ? (
            <HeaderImage src={imageUrl} alt="Staff Reports" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/Staff.png'; }} />
          ) : (
            <ImagePlaceholder>No image available</ImagePlaceholder>
          )}
        </ImageColumn>
      </FlexRow>

      <ControlsSection>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel htmlFor="shift-filter">Filter by Shift:</FilterLabel>
            <FilterSelect
              id="shift-filter"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="all">All Shifts</option>
              <option value="unassigned">Unassigned Staff</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.shift_name}>
                  {shift.shift_name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="employee-number-filter">Filter by Employee #:</FilterLabel>
            <FilterInput
              id="employee-number-filter"
              type="text"
              placeholder="Enter employee number..."
              value={employeeNumberFilter}
              onChange={(e) => setEmployeeNumberFilter(e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="first-name-filter">Filter by First Name:</FilterLabel>
            <FilterInput
              id="first-name-filter"
              type="text"
              placeholder="Enter first name..."
              value={firstNameFilter}
              onChange={(e) => setFirstNameFilter(e.target.value)}
            />
          </FilterGroup>
        </FilterContainer>
        
        <ButtonContainer>
          <ClearFiltersButton onClick={clearAllFilters} className="custom-styled">
            Clear Filters
          </ClearFiltersButton>
          
          <RefreshButton onClick={loadStaff} disabled={loading} className="custom-styled">
            {loading ? 'Loading...' : 'Refresh Data'}
          </RefreshButton>
          
          <PDFButton onClick={handlePrintPDF} disabled={isGeneratingPDF || filteredStaff.length === 0} className="custom-styled">
            {isGeneratingPDF ? 'Generating...' : 'Print Report'}
          </PDFButton>
        </ButtonContainer>
      </ControlsSection>

      <StaffListSection>
        <SubTitle>
          {selectedShift === 'all' ? 'All Staff Members' : 
           selectedShift === 'unassigned' ? 'Unassigned Staff' : 
           `${selectedShift} Staff Members`}
        </SubTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading ? (
          <p>Loading staff members...</p>
        ) : filteredStaff.length === 0 ? (
          <p>No staff members found for the selected filter.</p>
        ) : (
          <>
            <StaffTable $headerColor={getHeaderColor(selectedShift)}>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Employee #</th>
                  <th>First Name</th>
                  <th>Middle Name</th>
                  <th>Last Name</th>
                  <th>Shift</th>
                  <th>Nationality</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.staff_id}>
                    <td>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        border: '2px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa'
                      }}>
                        {member.photo_url ? (
                          <img 
                            src={member.photo_url} 
                            alt={`${member.first_name} ${member.last_name}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<span style="font-size: 10px; color: #666;">No Photo</span>';
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#666' }}>No Photo</span>
                        )}
                      </div>
                    </td>
                    <td>{member.employee_number}</td>
                    <td>{member.first_name}</td>
                    <td>{member.middle_name || '-'}</td>
                    <td>{member.last_name}</td>
                    <td>{member.shift_name || 'Unassigned'}</td>
                    <td>{member.nationality || '-'}</td>
                    <td>
                    <ActionButtons>
                      <ActionButton
                        $variant="edit"
                        onClick={() => {
                            try {
                              sessionStorage.setItem('current_staff_id', member.staff_id.toString());
                              sessionStorage.setItem('current_employee_number', member.employee_number);
                              sessionStorage.setItem('basic_info_view_mode', 'false');
                            } catch {}
                            navigate('/admin/register/staff/basic-info');
                        }}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton
                        $variant="view"
                        onClick={() => {
                            try {
                              sessionStorage.setItem('current_staff_id', member.staff_id.toString());
                              sessionStorage.setItem('current_employee_number', member.employee_number);
                              sessionStorage.setItem('basic_info_view_mode', 'true');
                            } catch {}
                            navigate('/admin/register/staff/basic-info');
                        }}
                      >
                        View
                      </ActionButton>
                      <ActionButton
                        $variant="delete"
                        onClick={() => handleDeleteStaff(member)}
                        disabled={loading}
                      >
                        Delete
                      </ActionButton>
                    </ActionButtons>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StaffTable>
            
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <strong>Total Staff Displayed:</strong> {filteredStaff.length}
            </div>
          </>
        )}
      </StaffListSection>
    </MainContent>
  );
};
