import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { formatDateTime, formatDateTimeReadable, formatIncidentTag, formatIncidentTagFromEntry } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../utils/pdfReportHelper';
import { getCompanyLogo } from '../../utils/companyLogo';

// Display date/time directly since incident data is stored in local Saudi Arabian time (UTC+3)
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr; // Return as-is since it's already local date
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  return timeStr; // Return as-is since it's already local time
};

// Define EDOBEntry type
interface EDOBEntry {
  id: string;
  incident_number: number;
  incident_date: string;
  incident_time: string;
  incident_type: string;
  location: string;
  description: string;
  action_taken: string;
  reported_by: string;
  reported_by_email: string;
  created_at: string;
}

// Define IncidentType
interface IncidentType {
  id: string;
  name: string;
  display_name: string;
  incident_types: string;
  color_code: string;
  is_active: boolean;
}

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
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 0;
  vertical-align: top;
  text-align: left;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const ImageColumn = styled.div`
  width: auto;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  
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
  margin: 0;
`;

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 0;
`;

const HeaderImage = styled.img`
  width: 157px;
  height: auto;
  max-width: 157px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 157px;
  height: 112px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ReportSection = styled.div`
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
`;

const DatePickerLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
`;

const DatePicker = styled.input`
  padding: 10px 15px;
  border: 2px solid #1177BB;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #0e5a8a;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin: 0;
`;

const PrintButton = styled.button`
  background-color: #FF9900 !important;
  color: white !important;
  padding: 10px 20px;
  border: none !important;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e68a00 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #cccccc !important;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  background-color: #28a745 !important;
  color: white !important;
  padding: 10px 20px;
  border: none !important;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  
  &:hover {
    background-color: #218838 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #cccccc !important;
    cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 8px;
  
  table {
    transition: none;
  }
  
  th {
    transition: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.95rem;
`;

const TableHead = styled.thead`
  background: #1177BB;
  color: white;
  transition: none;
  
  &:hover {
    background: #1177BB;
    color: white;
  }
`;

const TableRow = styled.tr<{ $isEven?: boolean }>`
  background: ${props => props.$isEven ? '#f8f9fa' : 'white'};
  
  &:hover {
    background: #e8f4f8;
  }
`;

const TableHeader = styled.th`
  padding: 12px 10px;
  text-align: left;
  font-weight: bold;
  font-size: 1.1rem;
  border-bottom: 2px solid #0e5a8a;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #1177BB;
  color: white;
  transition: none;
  
  &:hover {
    background: #1177BB;
    color: white;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  vertical-align: top;
  font-size: 1.1rem;
`;

const IncidentNumber = styled.div`
  font-weight: bold;
  color: #1177BB;
  font-size: 1.2rem;
  line-height: 1.4;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0 auto;
  font-family: 'Courier New', monospace;
`;

const IncidentBadge = styled.span<{ $color?: string }>`
  background-color: ${props => props.$color || '#999'};
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  min-width: 140px;
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #d32f2f;
  font-size: 1.2rem;
  background: #ffebee;
  border-radius: 8px;
  margin-top: 20px;
`;

const RecordCount = styled.div`
  font-size: 1.4rem;
  color: #666;
  font-weight: bold;
  margin-top: 10px;
`;

export const EDOBReports: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('eDOB_Daily_Brief_Report', '/images/eDOB-header.png');
  
  // State management
  const [entries, setEntries] = useState<EDOBEntry[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedTypeNames, setSelectedTypeNames] = useState<string[]>([]);
  const typeDropdownRef = useRef<HTMLDivElement | null>(null);

  // Load incident types from database
  const loadIncidentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('03_ecc_02_edob_incident_types')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      setIncidentTypes(data || []);
      return data || [];
    } catch (err) {
      console.error('Failed to load incident types:', err);
      return [];
    }
  };

  // Load entries from database - incident_type ilike 'emergency%' and by selected date's 07:30 window
  const loadEntries = async (_types: IncidentType[], selectedDate: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range: from 07:30 previous day to 07:30 selected day
      const selectedDateObj = new Date(selectedDate + 'T00:00:00');
      
      // Get the date part (without time)
      const selectedDateOnly = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate());
      
      // Start date: 07:30 previous day
      const startDate = new Date(selectedDateOnly);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(7, 30, 0, 0);
      
      // End date: 07:30 selected day
      const endDate = new Date(selectedDateOnly);
      endDate.setHours(7, 30, 0, 0);
      
      // Format dates for database query (YYYY-MM-DD format)
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Query entries where incident_type starts with 'emergency' within the time range
      const { data, error } = await supabase
        .from('03_ecc_01_edob_01_entries')
        .select('*')
        .ilike('incident_type', 'emergency%')
        .gte('incident_date', startDateStr)
        .lte('incident_date', endDateStr)
        .order('incident_date', { ascending: false })
        .order('incident_time', { ascending: false });
      
      if (error) throw error;
      
      // Additional client-side filtering to ensure time-based filtering within the same date
      const filteredData = (data || []).filter(entry => {
        if (!entry.incident_date || !entry.incident_time) return false;
        
        // Parse the incident date and time
        const [datePart, timePart] = [entry.incident_date, entry.incident_time];
        const [hours, minutes] = timePart.split(':').map(Number);
        
        // Convert to Date object
        const incidentDateTime = new Date(datePart);
        incidentDateTime.setHours(hours || 0, minutes || 0, 0, 0);
        
        // Check if the incident falls within the time range
        return incidentDateTime >= startDate && incidentDateTime <= endDate;
      });
      
      setEntries(filteredData);
    } catch (err) {
      console.error('Failed to load eDOB entries:', err);
      setError('Failed to load eDOB entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load entries when selected date changes
  useEffect(() => {
    const loadData = async () => {
      const types = await loadIncidentTypes();
      await loadEntries(types, selectedDate);
    };
    loadData();
  }, [selectedDate]); // Re-load when selected date changes

  const handleRefreshReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await loadIncidentTypes();
      await loadEntries(types, selectedDate);
    } catch (err) {
      setError('Failed to refresh incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTypeSelection = (name: string) => {
    setSelectedTypeNames(prev => {
      const exists = prev.includes(name);
      if (exists) return prev.filter(n => n !== name);
      return [...prev, name];
    });
  };

  const getDisplayNameForEntry = (e: EDOBEntry): string => {
    const t = incidentTypes.find(it => it.name === e.incident_type);
    return (t?.display_name || e.incident_type || '').toString();
  };

  const getFilteredEntries = (): EDOBEntry[] => {
    if (!selectedTypeNames.length) return entries;
    const selectedSet = new Set(selectedTypeNames.map(n => String(n).toLowerCase()));
    return entries.filter(e => selectedSet.has(getDisplayNameForEntry(e).toLowerCase()));
  };

  useEffect(() => {
    if (!typeDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [typeDropdownOpen]);

  // Generate PDF report
  const handlePrintPDF = async () => {
    if (entries.length === 0) {
      alert('No incidents to print.');
      return;
    }
    
    try {
      setPdfGenerating(true);
      console.log('Creating jsPDF document...');
      
      // Create VFH standard PDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log('jsPDF document created successfully');
      
      // Create summary text
      const summaryText = `Summary: Total Emergency & Standby Incidents: ${entries.length} | Period: Previous 24 Hours (07:45 to 07:45)`;
      console.log('Summary text:', summaryText);
      
      // Get current user info with error handling
      let currentUser;
      try {
        console.log('Getting current user...');
        const userResponse = await supabase.auth.getUser();
        currentUser = userResponse?.data?.user || null;
        console.log('Current user:', currentUser);
      } catch (userError) {
        console.warn('Could not get current user:', userError);
        currentUser = null;
      }
      
      console.log('Setting up VFH standard PDF...');
      
      // Load DACO logo for PDF
      console.log('Loading DACO logo...');
      const logoBase64 = await getCompanyLogo();
      console.log('Logo loaded, base64 length:', logoBase64.length);
      
      // Setup VFH A4 standard PDF
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "eDOB Daily Brief Report - Emergency & Standby Incidents",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });
      
      console.log('VFH setup completed, table start Y:', vfhSetup.tableStartY);
      
      // Prepare table data
      console.log('Preparing table data for', entries.length, 'entries');

      // Compute chronological sequence map based on incident_date/time or created_at
      const seqSorted = entries.map(e => {
        const createdStr = formatDateTime(e.created_at || '');
        const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
        const keyDate = e.incident_date || cDate;
        const keyTime = (e.incident_time || cTime).split('.')[0];
        const key = `${keyDate} ${keyTime}`;
        return { id: e.id, key };
      }).sort((a, b) => a.key.localeCompare(b.key));
      const sequenceMap = new Map<string, number>();
      seqSorted.forEach((item, i) => sequenceMap.set(item.id, i + 1));
      const tableData = entries.map((entry, index) => {
        const combinedBrief = `Description: ${entry.description || 'N/A'}\nAction Taken: ${entry.action_taken || 'N/A'}`;
        const incidentType = incidentTypes.find(t => t.name === entry.incident_type);
        const created = formatDateTime(entry.created_at || '');
        const [createdDate, createdTime] = created.includes(' ') ? created.split(' ') : ['', ''];
        const fallbackDate = entry.incident_date || createdDate;
        const fallbackTime = entry.incident_time || createdTime;
        const fallbackNumber = (typeof entry.incident_number === 'number' ? entry.incident_number : undefined) ?? (index + 1);
        const row = [
          formatIncidentTagFromEntry(entry, sequenceMap.get(entry.id) ?? (index + 1), true),
          incidentType?.display_name || entry.incident_type || 'N/A',
          entry.location || 'N/A',
          combinedBrief
        ];
        console.log(`Entry ${index + 1}:`, row);
        return row;
      });
      
      console.log('Table data prepared successfully');
      
      // Create table using VFH A4 standard configuration
      console.log('Creating autoTable...');
      autoTable(doc, {
        head: [[
          'Incident Numbers',
          'Incident Type',
          'Location', 
          'Incident Brief'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig
      });
      
      console.log('autoTable completed');
      
      // Convert to data URI and store
      console.log('Converting to data URI...');
      const dataUri = doc.output('datauristring');
      console.log('Data URI generated, length:', dataUri.length);
      
      const timestamp = formatDateTime(new Date()).replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `pdf_daily_brief_report_${timestamp}`;
      console.log('Generated filename:', fileName);
      
      // Store in sessionStorage for PDF viewer
      console.log('Storing in sessionStorage...');
      sessionStorage.setItem(fileName, dataUri);
      console.log('Stored in sessionStorage successfully');
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/control/daily-occurrence-book');
      sessionStorage.setItem('pdf_source_path', '/control/daily-occurrence-book/reports');
      
      // Navigate to PDF viewer with proper URL encoding
      const encodedFileName = encodeURIComponent(fileName);
      console.log('Navigating to PDF viewer:', `/pdf-viewer/${encodedFileName}`);
      navigate(`/pdf-viewer/${encodedFileName}`);
      
      console.log('PDF generated and opened successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="reports-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="reports-title">
                eDOB Daily Brief Report
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Daily Emergency Incident Brief provides executives with a comprehensive bird's-eye view 
                of all emergency incidents that transpired during the previous 24-hour period (07:30 to 07:30). 
                This executive summary consolidates critical incident data, response actions, and outcomes to 
                support informed decision-making and operational oversight.
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
                  alt="eDOB Daily Brief Report" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/eDOB-header.png';
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

      <ReportSection>
        <SectionHeader>
          <div>
            <SectionTitle>Daily Incidents Report: Emergency Incidents</SectionTitle>
            <DatePickerContainer>
              <DatePickerLabel htmlFor="date-picker">Date:</DatePickerLabel>
              <DatePicker
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div ref={typeDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button type="button" onClick={() => setTypeDropdownOpen(o => !o)} style={{ padding: '8px 12px', border: '2px solid #1177BB', borderRadius: 6, background: '#fff', color: '#1177BB', fontWeight: 'bold', cursor: 'pointer' }}>
                  Filter Types ({selectedTypeNames.length ? selectedTypeNames.length : 'All'})
                </button>
                {typeDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 240, padding: 8, maxHeight: 260, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <button type="button" onClick={() => setSelectedTypeNames([])} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Clear</button>
                      <button type="button" onClick={() => setSelectedTypeNames(incidentTypes.map(t => t.display_name || t.name))} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Select All</button>
                    </div>
                    {(incidentTypes || []).map((t) => (
                      <label key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                        <input type="checkbox" checked={selectedTypeNames.includes(t.display_name || t.name)} onChange={() => toggleTypeSelection(t.display_name || t.name)} />
                        <span>{t.display_name || t.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </DatePickerContainer>
          </div>
          <div>
          <RefreshButton onClick={handleRefreshReports} disabled={loading || pdfGenerating}>Refresh</RefreshButton>
          <PrintButton 
            onClick={handlePrintPDF} 
            disabled={loading || entries.length === 0 || pdfGenerating}
          >
            {pdfGenerating ? 'Generating PDF...' : 'Print to PDF'}
          </PrintButton>
          </div>
        </SectionHeader>

        {loading ? (
          <LoadingMessage>Loading incident data...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : getFilteredEntries().length === 0 ? (
          <LoadingMessage>No incidents found.</LoadingMessage>
        ) : (
          <>
            <RecordCount>Total Incidents: {getFilteredEntries().length}</RecordCount>
            <TableContainer>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Incident Number</TableHeader>
                    <TableHeader>Incident Type</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Incident Brief</TableHeader>
                  </tr>
                </TableHead>
                <tbody>
                  {(() => {
                    // Build sequence map for table display
                    const viewEntries = getFilteredEntries();
                    const seqSortedUi = viewEntries.map(e => {
                      const createdStr = formatDateTime(e.created_at || '');
                      const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
                      const keyDate = e.incident_date || cDate;
                      const keyTime = (e.incident_time || cTime).split('.')[0];
                      const key = `${keyDate} ${keyTime}`;
                      return { id: e.id, key };
                    }).sort((a, b) => a.key.localeCompare(b.key));
                    const sequenceMapUi = new Map<string, number>();
                    seqSortedUi.forEach((item, i) => sequenceMapUi.set(item.id, i + 1));
                    
                    return viewEntries.map((entry, index) => {
                      const incidentType = incidentTypes.find(t => t.name === entry.incident_type);
                      const created = formatDateTime(entry.created_at || '');
                      const [createdDate, createdTime] = created.includes(' ') ? created.split(' ') : ['', ''];
                      const fallbackDate = entry.incident_date || createdDate;
                      const fallbackTime = entry.incident_time || createdTime;
                      const sequenceNum = sequenceMapUi.get(entry.id) ?? (index + 1);
                      
                      const displayName = incidentType?.display_name || entry.incident_type;
                      let incidentTypeContent;
                      
                      if (displayName?.includes(':')) {
                        incidentTypeContent = displayName.split(':').map((part, i, arr) => {
                          const partWithColon = i === arr.length - 1 ? part : `${part}:`;
                          return i === 0 ? partWithColon : <React.Fragment key={`part-${i}`}><br />{partWithColon}</React.Fragment>;
                        });
                      } else {
                        incidentTypeContent = displayName;
                      }
                      
                      return (
                        <TableRow key={entry.id} $isEven={index % 2 === 0}>
                          <TableCell>
                            <IncidentNumber>
                              <div dangerouslySetInnerHTML={{ 
                                __html: formatIncidentTagFromEntry(entry, sequenceNum, true) 
                              }} />
                            </IncidentNumber>
                          </TableCell>
                          <TableCell>
                            <IncidentBadge $color={incidentType?.color_code}>
                              {incidentTypeContent}
                            </IncidentBadge>
                          </TableCell>
                          <TableCell>{entry.location || 'N/A'}</TableCell>
                          <TableCell>
                            <strong>Description:</strong> {entry.description || 'N/A'}<br /><br />
                            <strong>Action Taken:</strong> {entry.action_taken || 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </tbody>
              </Table>
            </TableContainer>
          </>
        )}
      </ReportSection>
    </MainContent>
  );
};
