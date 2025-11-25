import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../utils/companyLogo';

// Removed local image conversion helpers; using centralized getPDFLogo for consistent branding

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

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
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

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
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

interface Department {
  id: number;
  dept_name: string;
  dept_picture_url?: string;
  department_type?: string;
}

interface OperationalShift {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

interface StaffMember {
  id: number;
  department_id: number;
  fire_station_id?: number;
  staff_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone_number: string;
  address: string;
  hire_date: string;
  position_id?: number;
  rank_id?: string;
  employment_status: string;
  operational_shift_id?: number;
  certification_details: string;
  certification_expiry: string;
  training_records: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship_id?: number;
  id_iqama_expiry_date?: string;
  drivers_license_expiry_date?: string;
  airside_id_expiry_date?: string;
  airside_permit_expiry_date?: string;
  staff_image_url: string | null;
  created_at: string;
  // Populated fields
  department_name?: string;
  position_name?: string;
  rank_name?: string;
  relationship_name?: string;
  fire_station_name?: string;
  operational_shift_name?: string;
}

export const StaffReports: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [operationalShifts, setOperationalShifts] = useState<OperationalShift[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shiftFilter, setShiftFilter] = useState<string>('');

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
    loadOperationalShifts();
    loadStaff();
  }, []);

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

  const loadOperationalShifts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('dropdown-options-crud', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load operational shifts');
      }

      if (data?.data?.operationalShifts) {
        setOperationalShifts(data.data.operationalShifts);
      }
    } catch (error: any) {
      console.error('Error loading operational shifts:', error);
    }
  };

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('staff-crud-enhanced', {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load staff');
      }

      if (data?.data?.staff) {
        setStaff(data.data.staff);
      }
    } catch (error: any) {
      console.error('Error loading staff:', error);
      setError(error.message || 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const editStaff = (member: StaffMember) => {
    // Navigate to the staff registration page with edit mode
    navigate('/admin/register/staff/process', { state: { editStaffId: member.id, editStaffData: member } });
  };

  const deleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`Are you sure you want to delete the staff member "${staffName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(staffId));
    try {
      const { data, error } = await supabase.functions.invoke('staff-crud-enhanced', {
        method: 'DELETE',
        body: { staffId }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete staff member');
      }

      if (data?.data?.success) {
        setSuccess('Staff member deleted successfully!');
        await loadStaff();
      } else {
        throw new Error(data?.error?.message || 'Delete failed');
      }
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

  // Using getPDFLogo to obtain a logo with DACO-first fallback

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
      let departmentLogoBase64 = '';
      
      // Check if we have filtered staff by shift
      if (shiftFilter && staff.length > 0) {
        const shiftStaff = staff.filter(s => s.operational_shift_id?.toString() === shiftFilter);
        if (shiftStaff.length > 0) {
          const uniqueDepartments = [...new Set(shiftStaff.map(s => s.department_id))];
          if (uniqueDepartments.length === 1) {
            const deptId = uniqueDepartments[0];
            const dept = departments.find(d => d.id === deptId || d.id.toString() === deptId.toString());
            if (dept) {
              departmentName = dept.dept_name;
              // Support both API shapes: department_type and dept_type
              departmentType = (dept as any).department_type || (dept as any).dept_type || '';
              departmentLogo = dept.dept_picture_url || null;
              departmentLogoBase64 = await getPDFLogo(departmentLogo);
            }
          }
        }
      }
      // If no shift filter, check if all staff belong to same department
      else if (staff.length > 0) {
        const uniqueDepartments = [...new Set(staff.map(s => s.department_id))];
        if (uniqueDepartments.length === 1) {
          const deptId = uniqueDepartments[0];
          const dept = departments.find(d => d.id === deptId || d.id.toString() === deptId.toString());
          if (dept) {
            departmentName = dept.dept_name;
            // Support both API shapes: department_type and dept_type
            departmentType = (dept as any).department_type || (dept as any).dept_type || '';
            departmentLogo = dept.dept_picture_url || null;
            departmentLogoBase64 = await getPDFLogo(departmentLogo);
          }
        }
      }

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Filter staff based on shift selection
      const filteredStaff = shiftFilter 
        ? staff.filter(s => s.operational_shift_id?.toString() === shiftFilter)
        : staff;
      
      // Calculate summary statistics
      const totalStaff = filteredStaff.length;
      const activeStaff = filteredStaff.filter(s => s.employment_status === 'Active').length;
      const shiftName = shiftFilter 
        ? operationalShifts.find(s => s.id.toString() === shiftFilter)?.name || 'Selected Shift'
        : 'All Shifts';
      const summaryText = `Summary: ${shiftName} - Total Staff: ${totalStaff} | Active Staff: ${activeStaff}`;
      
      // Setup VFH A4 standard PDF layout
      const { tableStartY, tableConfig, filename } = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogoBase64 || undefined,
        data: {
          departmentName,
          departmentType,
          reportTitle: 'Registered Staff Report',
          summaryText,
          currentUser
        }
      });

      // Prepare table data with enhanced fields
      const tableData = filteredStaff.map(member => [
        member.staff_id || '-',
        `${member.first_name} ${member.last_name}`,
        member.operational_shift_name || '-',
        member.position_name || '-',
        member.rank_name || '-',
        member.fire_station_name || '-',
        member.employment_status || '-',
        member.email || '-',
        member.phone_number || '-'
      ]);

      // Create table using VFH A4 standard configuration
      autoTable(doc, {
        head: [[
          'Staff ID',
          'Full Name',
          'Operational Shift',
          'Position',
          'Rank',
          'Fire Station',
          'Status',
          'Email',
          'Phone'
        ]],
        body: tableData,
        startY: tableStartY,
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { cellWidth: 'auto' }, // Staff ID
          1: { cellWidth: 'auto' }, // Full Name
          2: { cellWidth: 'auto' }, // Operational Shift
          3: { cellWidth: 'auto' }, // Position
          4: { cellWidth: 'auto' }, // Rank
          5: { cellWidth: 'auto' }, // Fire Station
          6: { cellWidth: 'auto' }, // Status
          7: { cellWidth: 'auto' }, // Email
          8: { cellWidth: 'auto' }  // Phone
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      
      // Generate PDF data URI and navigate to global viewer
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/register');
      sessionStorage.setItem('pdf_source_path', '/admin/register/staff/reports');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess(`PDF report generated successfully! (${filteredStaff.length} staff members included)`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateExpiryPDF = async () => {
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
      let departmentLogoBase64 = '';
      
      const filteredStaff = shiftFilter 
        ? staff.filter(s => s.operational_shift_id?.toString() === shiftFilter)
        : staff;

      if (filteredStaff.length > 0) {
        const uniqueDepartments = [...new Set(filteredStaff.map(s => s.department_id))];
        if (uniqueDepartments.length === 1) {
          const deptId = uniqueDepartments[0];
          const dept = departments.find(d => d.id === deptId || d.id.toString() === deptId.toString());
          if (dept) {
            departmentName = dept.dept_name;
            // Support both API shapes: department_type and dept_type
            departmentType = (dept as any).department_type || (dept as any).dept_type || '';
            departmentLogo = dept.dept_picture_url || null;
            departmentLogoBase64 = await getPDFLogo(departmentLogo);
          }
        }
      }

      // Utility function for expiry status
      const getCurrentDate = () => new Date('2025-10-08');
      const getExpiryStatus = (expiryDate: string | null | undefined): { status: 'warning' | 'expired' | 'valid', message: string } => {
        if (!expiryDate) return { status: 'valid', message: '' };
        
        const today = getCurrentDate();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          const overdueDays = Math.abs(diffDays);
          return { 
            status: 'expired', 
            message: `Expired ${overdueDays} day${overdueDays === 1 ? '' : 's'} ago` 
          };
        } else if (diffDays <= 30) {
          return { 
            status: 'warning', 
            message: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}` 
          };
        } else {
          return { status: 'valid', message: '' };
        }
      };

      const formatExpiryDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
      };

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Calculate summary statistics
      let totalExpired = 0;
      let totalExpiringSoon = 0;
      let totalValid = 0;
      
      filteredStaff.forEach(member => {
        const expiryDates = [
          member.id_iqama_expiry_date,
          member.drivers_license_expiry_date,
          member.airside_id_expiry_date,
          member.airside_permit_expiry_date
        ];
        
        expiryDates.forEach(date => {
          if (date) {
            const status = getExpiryStatus(date).status;
            if (status === 'expired') totalExpired++;
            else if (status === 'warning') totalExpiringSoon++;
            else totalValid++;
          }
        });
      });
      
      const shiftName = shiftFilter 
        ? operationalShifts.find(s => s.id.toString() === shiftFilter)?.name || 'Selected Shift'
        : 'All Shifts';
      const summaryText = `${shiftName} - Documents: ${totalExpired} Expired | ${totalExpiringSoon} Expiring Soon | ${totalValid} Valid`;
      
      // Setup VFH A4 standard PDF layout
      const { tableStartY, tableConfig, filename } = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogoBase64 || undefined,
        data: {
          departmentName,
          departmentType,
          reportTitle: 'Staff Document Expiry Status Report',
          summaryText,
          currentUser
        }
      });
      
      // Prepare table data
      const tableData = filteredStaff.map(member => {
        const getStatusSymbol = (date: string | null | undefined) => {
          if (!date) return '-';
          const status = getExpiryStatus(date).status;
          const formattedDate = formatExpiryDate(date);
          const message = getExpiryStatus(date).message;
          
          if (status === 'expired') return `${formattedDate}\n[EXPIRED]`;
          if (status === 'warning') return `${formattedDate}\n[${message}]`;
          return formattedDate;
        };
        
        return [
          member.staff_id,
          `${member.first_name} ${member.last_name}`,
          member.department_name || '-',
          getStatusSymbol(member.id_iqama_expiry_date),
          getStatusSymbol(member.drivers_license_expiry_date),
          getStatusSymbol(member.airside_id_expiry_date),
          getStatusSymbol(member.airside_permit_expiry_date)
        ];
      });

      // Add table using VFH A4 standard configuration
      autoTable(doc, {
        head: [[
          'Staff ID',
          'Full Name', 
          'Department',
          'Id/Iqama Expiry',
          'Driver\'s License Expiry',
          'Airside Id Expiry',
          'Airside Permit Expiry'
        ]],
        body: tableData,
        startY: tableStartY,
        styles: {
          ...tableConfig.styles,
          fontSize: 8,
          cellPadding: 4,
          halign: 'center'
        },
        headStyles: tableConfig.headStyles,
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 'auto' },
          1: { halign: 'left', cellWidth: 'auto' },
          2: { halign: 'left', cellWidth: 'auto' },
          3: { halign: 'center', cellWidth: 'auto' },
          4: { halign: 'center', cellWidth: 'auto' },
          5: { halign: 'center', cellWidth: 'auto' },
          6: { halign: 'center', cellWidth: 'auto' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index >= 3) {
            const cellText = data.cell.text.join(' ');
            if (cellText && cellText.includes('[EXPIRED]')) {
              data.cell.styles.fillColor = [255, 235, 238];
              data.cell.styles.textColor = [211, 47, 47];
              data.cell.styles.fontStyle = 'bold';
            } else if (cellText && cellText.includes('Expires in')) {
              data.cell.styles.fillColor = [255, 248, 225];
              data.cell.styles.textColor = [245, 124, 0];
              data.cell.styles.fontStyle = 'bold';
            } else if (cellText && cellText !== '-' && !cellText.includes('[')) {
              data.cell.styles.fillColor = [232, 245, 233];
              data.cell.styles.textColor = [40, 167, 69];
            }
          }
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      
      // Generate PDF data URI and navigate to global viewer
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      sessionStorage.setItem('pdf_source_section', '/admin/register');
      sessionStorage.setItem('pdf_source_path', '/admin/register/staff/reports');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess('Expiry Status PDF report generated successfully!');
      
    } catch (error: any) {
      console.error('Error generating expiry status PDF:', error);
      setError('Failed to generate expiry status PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="staff-reports-title">
        <Title id="staff-reports-title">Registered Staff Report</Title>
        <Divider aria-hidden="true" />
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
                {isGeneratingPDF ? 'Generating PDF...' : 'Staff Report PDF'}
              </PrintButton>
              <PrintButton onClick={generateExpiryPDF} disabled={isGeneratingPDF || staff.length === 0} style={{ marginLeft: '10px' }}>
                {isGeneratingPDF ? 'Generating PDF...' : 'Expiry Status PDF'}
              </PrintButton>
              <RefreshButton onClick={loadStaff} disabled={staffLoading}>
                {staffLoading ? 'Loading...' : 'Refresh List'}
              </RefreshButton>
            </div>
          </div>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          {/* Operational Shift Filter */}
          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Label htmlFor="shiftFilter">Filter by Operational Shift:</Label>
            <Select
              id="shiftFilter"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              style={{ maxWidth: '300px', marginTop: '5px' }}
            >
              <option value="">All Shifts</option>
              {operationalShifts
                .filter(shift => shift.active)
                .map(shift => (
                  <option key={shift.id} value={shift.id.toString()}>
                    {shift.name}
                  </option>
                ))}
            </Select>
          </div>
          
          {staff.length > 0 ? (
            <StaffTable>
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Full Name</th>
                  <th>Operational Shift</th>
                  <th>Fire Station</th>
                  <th>Position</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff
                  .filter(member => {
                    if (!shiftFilter) return true;
                    return member.operational_shift_id?.toString() === shiftFilter;
                  })
                  .map(member => (
                  <tr key={member.id}>
                    <td><strong>{member.staff_id}</strong></td>
                    <td><strong>{member.first_name} {member.last_name}</strong></td>
                    <td>{member.operational_shift_name || '-'}</td>
                    <td>{member.fire_station_name || '-'}</td>
                    <td>{member.position_name || '-'}</td>
                    <td>{member.rank_name || '-'}</td>
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
                      <EditButton 
                        onClick={() => editStaff(member)}
                      >
                        Edit
                      </EditButton>
                      <DeleteButton 
                        onClick={() => deleteStaff(member.id, `${member.first_name} ${member.last_name}`)}
                        disabled={deletingIds.has(member.id)}
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
    </MainContent>
  );
};
