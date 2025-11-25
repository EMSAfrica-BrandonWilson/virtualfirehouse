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

const SearchSection = styled.div`
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 2px solid #1177BB;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 0.75fr auto;
  gap: 15px;
  align-items: end;
  
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
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' }>`
  background-color: ${props => 
    props.$variant === 'primary' ? '#1177BB' : 
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
  
  &:hover:not(:disabled) {
    background-color: ${props => 
      props.$variant === 'primary' ? '#0f5c99' : 
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

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 2px solid #1177BB;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 10px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #555;
  font-size: 13px;
  text-transform: uppercase;
`;

const InfoValue = styled.span`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const SummaryCard = styled.div<{ $color?: string }>`
  background: ${props => props.$color || '#fff'};
  border: 2px solid ${props => props.$color || '#ddd'};
  border-radius: 8px;
  padding: 15px;
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const SummaryLabel = styled.div`
  font-size: 13px;
  color: #666;
  font-weight: 500;
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

const SearchContainer = styled.div`
  position: relative;
`;

const SearchResults = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #1177BB;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.$visible ? 'block' : 'none'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
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

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

interface LeaveRecord {
  id: string;
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

interface StaffMember {
  staff_id: number;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  rank_name?: string;
}

export const IndividualLeaveRecords: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departmentLogo, setDepartmentLogo] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<StaffMember[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [rankMap, setRankMap] = useState<Record<number, string>>({});
  const searchTriggerDebounceRef = React.useRef<number | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    loadDepartmentLogo();
    loadRanks();
  }, []);

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

  const loadRanks = async () => {
    try {
      const { data, error } = await supabase
        .from('ranks')
        .select('id, name');
      if (error) {
        console.error('Error loading ranks:', error);
        return;
      }
      const map: Record<number, string> = {};
      (data || []).forEach((r: any) => {
        const idNum = typeof r.id === 'string' ? parseInt(r.id, 10) : r.id;
        if (!Number.isNaN(idNum)) {
          map[idNum] = r.name;
        }
      });
      setRankMap(map);
    } catch (err) {
      console.error('Unexpected error loading ranks:', err);
    }
  };

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

  const searchStaff = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const cleanTerm = term.replace(/[^a-zA-Z0-9\s,.-]/g, '').trim();
      if (cleanTerm.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      let query = supabase
        .from('02_admin_hr_04_leave_management')
        .select('staff_id, employee_number, employee_name, employee_rank')
        .order('employee_name', { ascending: true })
        .limit(20);
      query = query.ilike('employee_name', `%${cleanTerm}%`);

      const { data, error } = await query;
      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      // Deduplicate by employee_number or staff_id
      const seen = new Set<string>();
      const unique = (data || []).filter((row: any) => {
        const key = String(row.staff_id ?? '') + '|' + String(row.employee_number ?? '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const parseName = (full?: string) => {
        const s = String(full || '').trim();
        if (!s) return { first_name: '', middle_name: '', last_name: '' };
        const parts = s.split(/\s+/);
        const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const first = parts.length > 1 ? parts[0] : parts[0];
        const middle = parts.length > 2 ? parts.slice(1, parts.length - 1).join(' ') : '';
        return { first_name: first, middle_name: middle, last_name: last };
      };

      const transformedResults = unique.map((row: any) => {
        const { first_name, middle_name, last_name } = parseName(row.employee_name);
        return {
          staff_id: row.staff_id,
          employee_number: row.employee_number,
          first_name,
          middle_name,
          last_name,
          rank_name: row.employee_rank || 'N/A'
        } as StaffMember;
      });

      setSearchResults(transformedResults);
      setShowSearchResults(true);
    } catch (err: any) {
      console.error('Error searching staff:', err);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    searchStaff(term);
  };

  const handleStaffSelection = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setSearchTerm([
      staff.first_name,
      staff.middle_name,
      staff.last_name
    ].filter(part => part && part.trim().length > 0).join(' '));
    setEmployeeNumber(staff.employee_number);
    setShowSearchResults(false);
    setError('');
    // Automatically retrieve leave records on selection
    handleSearch();
  };

  const handleSearch = async () => {
    if (!searchTerm && !employeeNumber && !selectedStaff) {
      setError('Please enter a name or employee number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const filters: any[] = [];
      const cleanName = (searchTerm || '').trim();
      const num = (employeeNumber || '').trim();

      let query = supabase
        .from('02_admin_hr_04_leave_management')
        .select('*')
        .order('first_leave_date', { ascending: false });

      if (selectedStaff?.staff_id) {
        query = query.eq('staff_id', selectedStaff.staff_id);
      } else if (num) {
        query = query.eq('employee_number', num);
      } else if (cleanName) {
        query = query.ilike('employee_name', `%${cleanName}%`);
      }

      const { data: records, error: recordsError } = await query;
      if (recordsError) throw recordsError;

      setLeaveRecords(records || []);

      if (!selectedStaff && records && records.length > 0) {
        const first = records[0] as any;
        const parts = String(first.employee_name || '').trim().split(/\s+/);
        const last = parts.length > 1 ? parts[parts.length - 1] : parts[0] || '';
        const firstNm = parts.length > 1 ? parts[0] : parts[0] || '';
        const mid = parts.length > 2 ? parts.slice(1, parts.length - 1).join(' ') : '';
        setSelectedStaff({
          staff_id: Number(first.staff_id) || 0,
          employee_number: String(first.employee_number || ''),
          first_name: firstNm,
          middle_name: mid,
          last_name: last,
          rank_name: String(first.employee_rank || 'N/A')
        });
      }

      if (records && records.length === 0) {
        setSuccess('No leave records found for this employee.');
      }
    } catch (err: any) {
      console.error('Error fetching leave records:', err);
      setError('Failed to fetch leave records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setEmployeeNumber('');
    setSelectedStaff(null);
    setLeaveRecords([]);
    setError('');
    setSuccess('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const generatePDF = async () => {
    if (!selectedStaff || leaveRecords.length === 0) {
      setError('No records to generate PDF. Please search for a staff member first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      const logoBase64 = await getLogoForPDF();
      
      const doc = new jsPDF('portrait');
      
      const totalDays = leaveRecords.reduce((sum, record) => sum + record.total_leave_days, 0);
      const summaryText = `Employee: ${selectedStaff.last_name}, ${selectedStaff.first_name} (${selectedStaff.employee_number}) | Total Leave Records: ${leaveRecords.length} | Total Leave Days: ${totalDays}`;
      
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: `Individual Leave Records - ${selectedStaff.last_name}, ${selectedStaff.first_name}`,
          summaryText: summaryText,
          currentUser: currentUser
        }
      });

      const tableData = leaveRecords.map(record => [
        record.leave_type,
        formatDate(record.first_leave_date),
        formatDate(record.last_leave_date),
        record.total_leave_days.toString()
      ]);

      autoTable(doc, {
        head: [[
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
        sessionStorage.setItem(pdfKey, pdfDataUri);
        sessionStorage.setItem('pdf_source_section', '/admin/hr/leave-management/individual');
        sessionStorage.setItem('pdf_source_path', '/admin/hr/leave-management/individual');
        
        navigate(`/pdf-viewer/${pdfKey}`);
        setSuccess(`PDF report generated successfully!`);
      } catch (storageError: any) {
        if (storageError.name === 'QuotaExceededError') {
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = vfhSetup.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setSuccess('PDF report generated and downloaded successfully!');
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

  const handleViewCertificate = async (record: LeaveRecord) => {
    if (!record.file_url) return;

    try {
      setError('');
      setSuccess('Loading certificate...');

      console.log('Attempting to fetch certificate from:', record.file_url);

      // Create a unique key for this certificate (must start with 'pdf_' for PDF viewer compatibility)
      const certificateKey = `pdf_certificate_${record.id}_${Date.now()}`;
      
      // Check if it's a Supabase storage URL or external URL
      if (record.file_url.includes('supabase.co') || record.file_url.includes('/storage/')) {
        // For Supabase storage URLs, we need to include auth headers
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Authentication required to access certificate');
        }

        const response = await fetch(record.file_url, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch certificate: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('Successfully fetched certificate blob, size:', blob.size);
        
        // Convert blob to data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log('Data URL created, length:', (reader.result as string).length);
            resolve(reader.result as string);
          };
          reader.onerror = (err) => {
            console.error('FileReader error:', err);
            reject(new Error('Failed to convert certificate to data URL'));
          };
          reader.readAsDataURL(blob);
        });

        // Store the certificate data in sessionStorage
        sessionStorage.setItem(certificateKey, dataUrl);
        
      } else {
        // For external URLs, try direct fetch (might be blocked by CORS)
        try {
          const response = await fetch(record.file_url, {
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch certificate: ${response.status} ${response.statusText}`);
          }

          const blob = await response.blob();
          console.log('Successfully fetched external certificate blob, size:', blob.size);
          
          // Convert blob to data URL
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              console.log('Data URL created, length:', (reader.result as string).length);
              resolve(reader.result as string);
            };
            reader.onerror = (err) => {
              console.error('FileReader error:', err);
              reject(new Error('Failed to convert certificate to data URL'));
            };
            reader.readAsDataURL(blob);
          });

          // Store the certificate data in sessionStorage
          sessionStorage.setItem(certificateKey, dataUrl);
          
        } catch (corsError: any) {
          console.error('CORS error or fetch failed:', corsError);
          
          // If CORS fails, try opening in new window as fallback
          setSuccess('');
          setError(`Cannot display certificate inline due to security restrictions. Opening in new window...`);
          
          setTimeout(() => {
            window.open(record.file_url, '_blank', 'noopener,noreferrer');
            // Clear the error message after a delay
            setTimeout(() => setError(''), 3000);
          }, 2000);
          
          return;
        }
      }

      // Set source tracking information
      sessionStorage.setItem('pdf_source_section', '/admin/hr/leave-management/individual');
      sessionStorage.setItem('pdf_source_path', '/admin/hr/leave-management/individual');
      
      // Clear loading message
      setSuccess('');
      console.log('Certificate ready for viewing, navigating to viewer...');

      // Navigate to PDF viewer
      navigate(`/pdf-viewer/${encodeURIComponent(certificateKey)}`);
      
    } catch (error: any) {
      console.error('Error viewing certificate:', error);
      setSuccess('');
      setError(`Failed to load certificate: ${error.message || 'Unknown error'}. Please try again.`);
      
      // Fallback: try opening in new window
      setTimeout(() => {
        console.log('Attempting fallback: opening certificate in new window');
        window.open(record.file_url, '_blank', 'noopener,noreferrer');
        // Clear the error message
        setTimeout(() => setError(''), 3000);
      }, 1000);
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

  const calculateLeaveTypeSummary = () => {
    const summary: { [key: string]: number } = {};
    leaveRecords.forEach(record => {
      if (!summary[record.leave_type]) {
        summary[record.leave_type] = 0;
      }
      summary[record.leave_type] += record.total_leave_days;
    });
    return summary;
  };

  const leaveTypeSummary = calculateLeaveTypeSummary();
  const totalLeaveDays = leaveRecords.reduce((sum, record) => sum + record.total_leave_days, 0);

  return (
    <MainContent aria-label="Main content">
      <Section>
        <Title>Individual Leave Records</Title>
        <Divider />

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}


        <SearchSection>
          <SearchGrid>
            <FormGroup>
              <FormLabel htmlFor="employee-search">Search by Employee Name</FormLabel>
              <SearchContainer>
                <FormInput
                  id="employee-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  placeholder="Search by employee name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                      setShowSearchResults(false);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSearchResults(false), 200);
                  }}
                />
                <SearchResults $visible={showSearchResults}>
                  {searchResults.map((staff) => (
                    <SearchResultItem 
                      key={staff.staff_id}
                      onClick={() => handleStaffSelection(staff)}
                    >
                      <SearchResultName>
                        {[staff.first_name, staff.middle_name, staff.last_name]
                          .filter(part => part && part.trim().length > 0)
                          .join(' ')}
                      </SearchResultName>
                      <SearchResultDetails>
                        Emp #: {staff.employee_number} | Rank: {staff.rank_name || 'N/A'}
                      </SearchResultDetails>
                    </SearchResultItem>
                  ))}
                  {searchResults.length === 0 && searchTerm.length >= 2 && (
                    <SearchResultItem>
                      <SearchResultDetails>No staff members found</SearchResultDetails>
                    </SearchResultItem>
                  )}
                </SearchResults>
              </SearchContainer>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="employee-number">Employee Number</FormLabel>
              <FormInput
                id="employee-number"
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="Or enter employee number..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                onBlur={() => {
                  if (employeeNumber && employeeNumber.trim().length >= 2) {
                    handleSearch();
                  }
                }}
              />
            </FormGroup>

            <FormGroup style={{ alignSelf: 'end' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button 
                  $variant="primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button 
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            </FormGroup>
          </SearchGrid>
        </SearchSection>

        {/* Employee Info and Summary */}
        {selectedStaff && leaveRecords.length > 0 && (
          <>
            <InfoBox>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>
                    Employee Name: <strong>{[selectedStaff.first_name, selectedStaff.middle_name, selectedStaff.last_name]
                      .filter(part => part && part.trim().length > 0)
                      .join(' ')}</strong>
                  </InfoLabel>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    Employee Number: <strong>{selectedStaff.employee_number}</strong>
                  </InfoLabel>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    Rank: <strong>{selectedStaff.rank_name || 'N/A'}</strong>
                  </InfoLabel>
                </InfoItem>
              </InfoGrid>

              <InfoTitle style={{ marginTop: '20px' }}>Leave Summary</InfoTitle>
              <SummaryGrid>
                <SummaryCard $color="#e8f5e9">
                  <SummaryValue>{leaveRecords.length}</SummaryValue>
                  <SummaryLabel>Total Records</SummaryLabel>
                </SummaryCard>
                <SummaryCard $color="#fff3e0">
                  <SummaryValue>{totalLeaveDays}</SummaryValue>
                  <SummaryLabel>Total Leave Days</SummaryLabel>
                </SummaryCard>
                {Object.entries(leaveTypeSummary).map(([type, days]) => (
                  <SummaryCard key={type} $color="#e3f2fd">
                    <SummaryValue>{days}</SummaryValue>
                    <SummaryLabel>{type}</SummaryLabel>
                  </SummaryCard>
                ))}
              </SummaryGrid>
            </InfoBox>

            <SectionHeaderRow>
              <SubTitle>Leave History</SubTitle>
              <PrintButton onClick={generatePDF} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Report'}
              </PrintButton>
            </SectionHeaderRow>
          </>
        )}

        {/* Records Table */}
        {loading ? (
          <LoadingMessage>Loading leave records...</LoadingMessage>
        ) : leaveRecords.length === 0 && selectedStaff ? (
          <EmptyState>
            No leave records found for {selectedStaff.last_name}, {selectedStaff.first_name}.
          </EmptyState>
        ) : leaveRecords.length > 0 ? (
            <DocumentTable>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Leave Type</TableHeaderCell>
                  <TableHeaderCell>First Leave Date</TableHeaderCell>
                  <TableHeaderCell>Last Leave Date</TableHeaderCell>
                  <TableHeaderCell>Total Days</TableHeaderCell>
                  <TableHeaderCell>Certificate</TableHeaderCell>
                  <TableHeaderCell>Record Date</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {leaveRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.leave_type}</TableCell>
                    <TableCell>{formatDate(record.first_leave_date)}</TableCell>
                    <TableCell>{formatDate(record.last_leave_date)}</TableCell>
                    <TableCell>{record.total_leave_days}</TableCell>
                    <TableCell>
                      {record.file_url ? (
                        <button
                          onClick={() => handleViewCertificate(record)}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#1177BB',
                            textDecoration: 'underline',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            padding: '4px 0',
                            display: 'inline',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#0f5c99';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#1177BB';
                          }}
                          title="View Certificate"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>No certificate</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(record.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </DocumentTable>
        ) : null}
      </Section>
    </MainContent>
  );
};
