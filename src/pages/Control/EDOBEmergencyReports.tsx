import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { formatDateTime, formatDateTimeReadable, formatIncidentTag, formatIncidentTagFromEntry } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, applyFinalPageNumbers, cleanupTrailingBlankPages } from '../../utils/pdfReportHelper';
import { getCompanyLogo } from '../../utils/companyLogo';

// Display date/time directly since incident data is stored in local Saudi Arabian time (UTC+3)
// Updated: Font consistency and incident number wrapping implemented 2025-11-03 14:34:17
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

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const HeaderImage = styled.img`
  width: 190px;
  height: auto;
  max-width: 190px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 190px;
  height: 135px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormHeading = styled.h3`
  font-size: 1.2rem;
  color: #1177BB;
  font-weight: bold;
  margin: 0 0 15px 0;
  width: 100%;
`;

const ControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 15px;
`;

const LeftControls = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  flex: 1;
`;

const RightControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  margin-left: auto;
`;





const RecordCountText = styled.span`
  font-size: 1rem;
  color: #666;
  font-weight: bold;
  white-space: nowrap;
`;

const RecordCountContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 5px;
`;

const RecordCountActions = styled.div`
  display: flex;
  align-items: flex-end;
`;



const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1rem;
  margin-bottom: 3px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #1177BB;
  border-radius: 4px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
  }
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #1177BB;
  border-radius: 4px;
  font-size: 0.95rem;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #1177BB;
  color: white;
  
  &:hover {
    opacity: 0.8;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const PrintButton = styled(ActionButton)`
  background-color: #FF9900;
  padding: 10px 20px;
  font-size: 1.1rem;
  
  &:hover {
    background-color: #e68a00;
  }
`;



const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  
  th, td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
    font-size: 14px;
  }
  
  th {
    background-color: #1177BB;
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
  
  @media (max-width: 768px) {
    th, td {
      padding: 8px;
      font-size: 14px;
    }
  }
`;

const TableCell = styled.td<{ $isEmergency?: boolean }>`
  font-size: 16px;
  
  &:first-child {
    font-weight: normal;
    color: ${props => props.$isEmergency ? '#dc3545' : '#1177BB'};
    white-space: nowrap;
    width: 120px;
  }
  
  &:nth-child(2) {
    color: ${props => props.$isEmergency ? '#dc3545' : 'inherit'};
    width: 140px;
    white-space: nowrap;
  }
  
  &:nth-child(3) {
    color: ${props => props.$isEmergency ? '#dc3545' : 'inherit'};
    font-weight: bold;
    width: 160px;
    white-space: nowrap;
  }
  
  &:nth-child(4) {
    color: ${props => props.$isEmergency ? '#dc3545' : 'inherit'};
    width: auto;
  }
`;

const TableHeaderCell = styled.th`
  &:first-child {
    width: 120px;
  }
  &:nth-child(2) {
    width: 140px;
  }
  &:nth-child(3) {
    width: 160px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid #1177BB;
  border-radius: 4px;
  background-color: ${props => props.$active ? '#1177BB' : 'white'};
  color: ${props => props.$active ? 'white' : '#1177BB'};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #FF9900;
    border-color: #FF9900;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EntriesTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 20px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #666;
`;

const NoEntriesMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 1rem;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  color: #DC143C;
  font-size: 14px;
  margin: 20px 0;
  padding: 15px;
  background: #FFE4E1;
  border: 2px solid #DC143C;
  border-radius: 6px;
`;



const TruncateText = styled.div`
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
`;

const IncidentBadge = styled.span<{ type: string }>`
  color: ${props => {
    switch(props.type) {
      case 'Emergency': return '#dc3545';
      case 'Incident': return '#ffc107';
      case 'Maintenance': return '#17a2b8';
      case 'Training': return '#28a745';
      case 'Routine': return '#6f42c1';
      default: return '#6c757d';
    }
  }};
  padding: 4px 8px;
  font-size: 14px;
  font-weight: normal;
  line-height: 1;
  vertical-align: middle;
  display: inline-block;
  margin-right: 10px;
`;

const ReportCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }
`;

const ReportTitle = styled.h3`
  color: #1177BB;
  font-size: 1.3rem;
  margin-bottom: 10px;
`;

const ReportDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const ReportButton = styled.button`
  background: #1177BB;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: #0e5a8a;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const EDOBEmergencyReports: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('edob-emergency-reports', '/images/eDOB-header.png');
  
  // Filter state
  const [primaryIncidentFilter, setPrimaryIncidentFilter] = useState('');
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('');
  const [reportedByFilter, setReportedByFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [incidentNumberFilter, setIncidentNumberFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Database entries state
  const [entries, setEntries] = useState<EDOBEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EDOBEntry[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [incidentTypeMap, setIncidentTypeMap] = useState<Record<string, { display: string; primary: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 15;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter]);
  
  // Load incident types from database
  const canonicalKey = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const loadIncidentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('03_ecc_01_edob_02_incident_types')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      const rows = data || [];
      setIncidentTypes(rows as any);
      const map: Record<string, { display: string; primary: string }> = {};
      rows.forEach((t: any) => {
        const nameKey = canonicalKey(String(t?.name || ''));
        const displayKey = canonicalKey(String(t?.display_name || ''));
        const idKey = t?.id !== undefined && t?.id !== null ? canonicalKey(String(t.id)) : '';
        const displayVal = String(t?.display_name || t?.name || '');
        const primaryVal = String(t?.incident_types || '');
        if (nameKey) map[nameKey] = { display: displayVal, primary: primaryVal };
        if (displayKey && !map[displayKey]) map[displayKey] = { display: displayVal, primary: primaryVal };
        if (idKey && !map[idKey]) map[idKey] = { display: displayVal, primary: primaryVal };
      });
      setIncidentTypeMap(map);
    } catch (err) {
      console.error('Failed to load incident types:', err);
    }
  };
  
  // Load entries from database
  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('03_ecc_01_edob_01_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setEntries(data || []);
      setFilteredEntries(data || []);
      
      // Dynamically populate reportedByOptions from actual data
      const uniqueReporters = [...new Set(data?.map(entry => entry.reported_by).filter(Boolean) || [])];
      if (uniqueReporters.length > 0) {
        // Note: We can't modify the const array, so we'll use it as-is and filter dynamically
      }
    } catch (err) {
      console.error('Failed to load eDOB entries:', err);
      setError('Failed to load eDOB entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter entries based on selected filters
  const filterEntries = (primaryFilter: string, typeFilter: string, reporterFilter: string, locationFilter: string, incidentNumberFilter: string, dateFilter: string) => {
    let filtered = entries;
    
    if (primaryFilter && primaryFilter !== 'All Primary Incidents') {
      filtered = filtered.filter(entry => {
        const key = canonicalKey(entry.incident_type || '');
        const entryPrimaryIncident = incidentTypeMap[key]?.primary || '';
        return entryPrimaryIncident === primaryFilter;
      });
    }
    
    if (typeFilter && typeFilter !== 'All Secondary Incidents') {
      filtered = filtered.filter(entry => entry.incident_type === typeFilter);
    }
    
    if (reporterFilter && reporterFilter !== 'All Reporters') {
      filtered = filtered.filter(entry => entry.reported_by === reporterFilter);
    }
    
    if (locationFilter && locationFilter !== 'All Locations') {
      filtered = filtered.filter(entry => entry.location === locationFilter);
    }
    
    if (incidentNumberFilter) {
      const searchNumber = parseInt(incidentNumberFilter);
      if (!isNaN(searchNumber)) {
        filtered = filtered.filter(entry => entry.incident_number === searchNumber);
      }
    }
    
    if (dateFilter) {
      filtered = filtered.filter(entry => entry.incident_date === dateFilter);
    }
    
    setFilteredEntries(filtered);
  };
  
  // Handle filter changes
  const handlePrimaryIncidentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPrimaryIncidentFilter(value);
    
    // Reset secondary incident filter if it's no longer valid for the selected primary incident
    const filteredSecondaryTypes = value && value !== 'All Primary Incidents'
      ? incidentTypes.filter(type => type.incident_types === value)
      : incidentTypes;
    
    const isCurrentSecondaryValid = !incidentTypeFilter || 
      incidentTypeFilter === 'All Secondary Incidents' || 
      filteredSecondaryTypes.some(type => type.name === incidentTypeFilter);
    
    const newSecondaryFilter = isCurrentSecondaryValid ? incidentTypeFilter : '';
    setIncidentTypeFilter(newSecondaryFilter);
    
    filterEntries(value, newSecondaryFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };
  
  const handleIncidentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIncidentTypeFilter(value);
    filterEntries(primaryIncidentFilter, value, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };
  
  const handleReportedByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setReportedByFilter(value);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, value, locationFilter, incidentNumberFilter, dateFilter);
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLocationFilter(value);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, value, incidentNumberFilter, dateFilter);
  };
  
  const handleIncidentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIncidentNumberFilter(value);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, value, dateFilter);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, value);
  };
  
  // Load entries and incident types on component mount
  useEffect(() => {
    loadIncidentTypes();
    loadEntries();
  }, []);
  
  // Get unique reporters from entries for dropdown options
  const uniqueReporters = [...new Set(entries.map(entry => entry.reported_by).filter(Boolean))];
  const allReportedByOptions = ['All Reporters', ...uniqueReporters];
  
  // Get unique locations from entries for dropdown options
  const uniqueLocations = [...new Set(entries.map(entry => entry.location).filter(Boolean))];
  const allLocationOptions = ['All Locations', ...uniqueLocations];
  
  // Get unique primary incidents (emergency types) from incident types
  const uniquePrimaryIncidents = [...new Set(incidentTypes.map(type => type.incident_types).filter(Boolean))];
  const allPrimaryIncidentOptions = ['All Primary Incidents', ...uniquePrimaryIncidents];
  
  // Filter secondary incidents (incident types) based on selected primary incident
  const filteredIncidentTypes = primaryIncidentFilter && primaryIncidentFilter !== 'All Primary Incidents'
    ? incidentTypes.filter((type: any) => type.incident_types === primaryIncidentFilter)
    : incidentTypes;
  
  // Handle print functionality using VFH standard PDF
  const handlePrint = async () => {
    console.log('=== handlePrint called ===');
    console.log('Filtered entries count:', filteredEntries.length);
    
    if (filteredEntries.length === 0) {
      alert('No entries to print. Please adjust your filters.');
      return;
    }
    
    try {
      console.log('Creating jsPDF document...');
      
      // Create VFH standard PDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log('jsPDF document created successfully');
      
      // Prepare filter text for summary
        const filterText = [
        primaryIncidentFilter && primaryIncidentFilter !== 'All Primary Incidents' ? `Primary Incident: ${primaryIncidentFilter}` : '',
        incidentTypeFilter ? `Secondary Incident: ${incidentTypeMap[canonicalKey(incidentTypeFilter)]?.display || incidentTypeFilter}` : '',
        locationFilter && locationFilter !== 'All Locations' ? `Location: ${locationFilter}` : '',
        incidentNumberFilter ? `Incident #: ${incidentNumberFilter}` : '',
        dateFilter ? `Date: ${dateFilter}` : ''
      ].filter(Boolean).join(' | ');
      
      // Create summary text
      const summaryText = `Summary: Total Emergency Entries: ${filteredEntries.length}${filterText ? ` | Filters Applied: ${filterText}` : ''}`;
      console.log('Summary text:', summaryText);
      
      // Get current user info with error handling
      let currentUser;
      try {
        console.log('Getting current user...');
        const userResponse = await supabase.auth.getUser();
        currentUser = userResponse?.data?.user || null;
        console.log('Current user:', currentUser);
        
        // Get user profile to get display_name
        if (currentUser?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, full_name, first_name, last_name')
            .eq('user_id', currentUser.id)
            .single();
          
          if (profileData && !profileError) {
            // Merge profile data with user data for getUserName function
            currentUser.profile = {
              ...currentUser.profile,
              ...profileData
            };
            console.log('Updated user with profile:', currentUser);
          }
        }
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
          reportTitle: "eDOB Emergency Incident Reports",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });
      
      console.log('VFH setup completed, table start Y:', vfhSetup.tableStartY);
      
      // Prepare table data
      console.log('Preparing table data for', filteredEntries.length, 'entries');
      // Compute chronological sequence map for filtered entries
      const seqSorted = filteredEntries.map(e => {
        const createdStr = formatDateTime(e.created_at || '');
        const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
        const keyDate = e.incident_date || cDate;
        const keyTime = (e.incident_time || cTime).split('.')[0];
        const key = `${keyDate} ${keyTime}`;
        return { id: e.id, key };
      }).sort((a, b) => a.key.localeCompare(b.key));
      const sequenceMap = new Map<string, number>();
      seqSorted.forEach((item, i) => sequenceMap.set(item.id, i + 1));

      const tableData = filteredEntries.map((entry, index) => {
        const combinedBrief = `Description: ${entry.description || 'N/A'}\nAction Taken: ${entry.action_taken || 'N/A'}`;
        const created = formatDateTime(entry.created_at || '');
        const [createdDate, createdTime] = created.includes(' ') ? created.split(' ') : ['', ''];
        const fallbackDate = entry.incident_date || createdDate;
        const fallbackTime = entry.incident_time || createdTime;
        const fallbackNumber = (typeof entry.incident_number === 'number' ? entry.incident_number : undefined) ?? (index + 1);
        const seqNum = sequenceMap.get(entry.id) ?? (index + 1);
        const seqStr = String(seqNum).padStart(6,'0').replace(/(\d{3})(\d{3})/, '$1,$2');
        const timeRaw = (fallbackTime || '').split('.')[0];
        const [hh='00', mm='00', ss='00'] = timeRaw.split(':');
        const timeStr = `${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:${ss.padStart(2,'0')}`;
        const dateStr = (fallbackDate || '').trim();
        const incidentNumberCell = `${dateStr}\n${timeStr}\n${seqStr}`;
        const row = [
          incidentNumberCell,
          incidentTypeMap[canonicalKey(entry.incident_type || '')]?.display || entry.incident_type || 'N/A',
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
          'Incident Number',
          'Incident Type',
          'Location', 
          'Incident Brief'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig
      });
      
      console.log('autoTable completed');
      
      // Apply final page numbers after table is complete
      console.log('Applying final page numbers...');
      applyFinalPageNumbers(doc, {
        departmentName: "King Fahd International Airport",
        departmentType: "Airport Rescue & Fire Fighting Services",
        reportTitle: "eDOB Emergency Incident Reports",
        summaryText: summaryText,
        currentUser: currentUser
      });
      
      // Clean up any trailing blank pages
      console.log('Cleaning up trailing blank pages...');
      cleanupTrailingBlankPages(doc);
      
      // Convert to data URI and store
      console.log('Converting to data URI...');
      const dataUri = doc.output('datauristring');
      console.log('Data URI generated, length:', dataUri.length);
      
      const timestamp = formatDateTime(new Date()).replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `pdf_emergency_reports_${timestamp}`;
      console.log('Generated filename:', fileName);
      
      // Store in sessionStorage for PDF viewer
      console.log('Storing in sessionStorage...');
      sessionStorage.setItem(fileName, dataUri);
      console.log('Stored in sessionStorage successfully');
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/control/daily-occurrence-book');
      sessionStorage.setItem('pdf_source_path', '/control/daily-occurrence-book/emergency-reports');
      
      // Navigate to PDF viewer with proper URL encoding
      const encodedFileName = encodeURIComponent(fileName);
      console.log('Navigating to PDF viewer:', `/pdf-viewer/${encodedFileName}`);
      navigate(`/pdf-viewer/${encodedFileName}`);
      
      console.log('=== handlePrint completed successfully ===');
      
    } catch (error) {
      console.error('=== handlePrint error ===');
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  

  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="emergency-reports-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="emergency-reports-title">
                eDOB Emergency Incident Reports
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Specialized emergency incident reporting and analytics derived from eDOB entries. 
                Generate detailed emergency response reports, incident trend analysis, and 
                performance metrics for regulatory compliance and operational improvement.
              </Paragraph>
              
              {/* Search Form - inline with content */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                <FilterGroup>
                  <FilterLabel htmlFor="incident-number-filter">Search By Incident #:</FilterLabel>
                  <FilterInput 
                    id="incident-number-filter"
                    type="number"
                    placeholder="Search by number"
                    value={incidentNumberFilter}
                    onChange={handleIncidentNumberChange}
                  />
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel htmlFor="date-filter">Search By Date:</FilterLabel>
                  <FilterInput 
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={handleDateChange}
                  />
                </FilterGroup>
              </div>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="eDOB Emergency Incident Reports" 
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
          
          {/* Filter Controls and Record Count */}
          <FilterContainer>
            <LeftControls>
              <FilterGroup>
                <FilterLabel htmlFor="primary-incident-filter">Filter By Primary Incidents:</FilterLabel>
                <FilterSelect 
                  id="primary-incident-filter"
                  value={primaryIncidentFilter} 
                  onChange={handlePrimaryIncidentChange}
                >
                  {allPrimaryIncidentOptions.map((incident) => (
                    <option key={incident} value={incident}>
                      {incident}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel htmlFor="incident-type-filter">Filter By Secondary Incidents:</FilterLabel>
                <FilterSelect 
                  id="incident-type-filter"
                  value={incidentTypeFilter} 
                  onChange={handleIncidentTypeChange}
                >
                  <option value="">All Secondary Incidents</option>
                  {filteredIncidentTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.display_name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel htmlFor="location-filter">Filter By Location:</FilterLabel>
                <FilterSelect 
                  id="location-filter"
                  value={locationFilter} 
                  onChange={handleLocationChange}
                >
                  {allLocationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
            </LeftControls>
            
            <RightControls>
              <RecordCountContainer>
                <FilterLabel style={{ marginBottom: '0' }}>Showing:</FilterLabel>
                <RecordCountText>
                  {currentEntries.length} of {filteredEntries.length} entries
                </RecordCountText>
              </RecordCountContainer>
              
              <PrintButton 
                onClick={handlePrint}
                disabled={filteredEntries.length === 0}
                title="Print filtered data"
              >
                🖨️ Print Report
              </PrintButton>
            </RightControls>
          </FilterContainer>
          
          {/* Entries Display */}
          <Section aria-labelledby="entries-table">
            <EntriesTitle id="entries-table">eDOB Entries</EntriesTitle>
            
            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}
            
            {loading ? (
              <LoadingMessage>Loading eDOB entries...</LoadingMessage>
            ) : filteredEntries.length === 0 ? (
              <NoEntriesMessage>
                {entries.length === 0 ? 'No eDOB entries found. Create entries in the eDOB Entry Form.' : 'No entries match the selected filters.'}
              </NoEntriesMessage>
            ) : (
              <>

                
                {/* Data Table */}
                <TableContainer>
                  <DataTable>
                    <thead>
                      <tr>
                        <TableHeaderCell>Incident Number</TableHeaderCell>
                        <TableHeaderCell>Incident Type</TableHeaderCell>
                        <TableHeaderCell>Location</TableHeaderCell>
                        <TableHeaderCell>Incident Brief</TableHeaderCell>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Compute sequence map for current page entries
                        const seqSortedUi = currentEntries.map(e => {
                          const createdStr = formatDateTime(e.created_at || '');
                          const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
                          const keyDate = e.incident_date || cDate;
                          const keyTime = (e.incident_time || cTime).split('.')[0];
                          const key = `${keyDate} ${keyTime}`;
                          return { id: e.id, key };
                        }).sort((a, b) => a.key.localeCompare(b.key));
                        const sequenceMapUi = new Map<string, number>();
                        seqSortedUi.forEach((item, i) => sequenceMapUi.set(item.id, i + 1));
                        
                        return currentEntries.map((entry, index) => {
                          const isEmergency = entry.incident_type === 'Emergency';
                          const created = formatDateTime(entry.created_at || '');
                          const [createdDate, createdTime] = created.includes(' ') ? created.split(' ') : ['', ''];
                          const fallbackDate = entry.incident_date || createdDate;
                          const fallbackTime = entry.incident_time || createdTime;
                          const sequenceNum = sequenceMapUi.get(entry.id) ?? (index + 1);
                          
                          return (
                            <tr key={entry.id}>
                              <TableCell $isEmergency={isEmergency} style={{ whiteSpace: 'nowrap', fontFamily: 'Courier New, monospace', fontWeight: 'normal' }}>
                                {(() => {
                                  const dateStr = (fallbackDate || '').trim();
                                  const timeRaw = (fallbackTime || '').trim();
                                  const timeNoFrac = timeRaw.split('.')[0];
                                  const timeParts = timeNoFrac.split(':');
                                  const hh = timeParts[0] || '00';
                                  const mm = timeParts[1] || '00';
                                  const ss = timeParts[2] || '00';
                                  const timeStr = `${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:${ss.padStart(2,'0')}`;
                                  const seq = String(sequenceNum || 0).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1,$2');
                                  return (
                                    <div>
                                      <div>{dateStr}</div>
                                      <div>{timeStr}</div>
                                      <div>{seq}</div>
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell $isEmergency={isEmergency}>
                                <IncidentBadge type={entry.incident_type}>
                                  {incidentTypeMap[canonicalKey(entry.incident_type || '')]?.display || entry.incident_type}
                                </IncidentBadge>
                              </TableCell>
                              <TableCell $isEmergency={isEmergency} style={{ fontSize: '14px' }}>
                                {entry.location}
                              </TableCell>
                              <TableCell $isEmergency={isEmergency}>
                                <TruncateText title={`Description: ${entry.description}\nAction Taken: ${entry.action_taken}`}>
                                  <div><strong>Description:</strong> {entry.description}</div>
                                  <div><strong>Action Taken:</strong> {entry.action_taken}</div>
                                </TruncateText>
                              </TableCell>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </DataTable>
                </TableContainer>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <PaginationContainer>
                    <PaginationButton 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </PaginationButton>
                    
                    {/* Page numbers */}
                    {(() => {
                      const pageNumbers = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start page if we're near the end
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(
                          <PaginationButton
                            key={i}
                            $active={currentPage === i}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </PaginationButton>
                        );
                      }
                      
                      return pageNumbers;
                    })()}
                    
                    <PaginationButton 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </PaginationButton>
                    
                    <span style={{ fontSize: '0.95rem', color: '#666' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationContainer>
                )}
              </>
            )}
          </Section>
        </div>
      </Section>
    </MainContent>
  );
};