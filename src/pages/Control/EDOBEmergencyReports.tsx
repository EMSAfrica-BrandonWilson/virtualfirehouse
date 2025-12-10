import React, { useState, useEffect, useRef } from 'react';
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
  width: 152px;
  height: auto;
  max-width: 152px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 152px;
  height: 108px;
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
  border: 2px solid #4caf50;
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
  border: 2px solid #4caf50;
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
  border: 2px solid #1177BB;
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

const IncidentBadge = styled.span<{ type: string; color?: string }>`
  background: ${props => props.color || (props.type === 'Emergency' ? '#dc3545' : props.type === 'Incident' ? '#ffc107' : props.type === 'Maintenance' ? '#17a2b8' : props.type === 'Training' ? '#28a745' : props.type === 'Routine' ? '#6f42c1' : '#6c757d')};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
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
  const [dailyBriefDateTime, setDailyBriefDateTime] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return `${today}T07:30`;
  });
  const [selectedPrimaryIncidents, setSelectedPrimaryIncidents] = useState<string[]>([]);
  const [primaryDropdownOpen, setPrimaryDropdownOpen] = useState(false);
  const primaryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedSecondaryIncidents, setSelectedSecondaryIncidents] = useState<string[]>([]);
  const [secondaryDropdownOpen, setSecondaryDropdownOpen] = useState(false);
  const secondaryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  
  // Database entries state
  const [entries, setEntries] = useState<EDOBEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EDOBEntry[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [incidentTypeMap, setIncidentTypeMap] = useState<Record<string, { display: string; primary: string; color: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);
  const displayEntries = filteredEntries.slice(0, currentPage * entriesPerPage);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter]);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some(e => e.isIntersecting);
      if (isVisible && currentPage < totalPages) {
        setCurrentPage(p => Math.min(p + 1, totalPages));
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [bottomRef, currentPage, totalPages]);

  useEffect(() => {
    setSelectedEntryIds([]);
  }, [filteredEntries]);
  
  // Load incident types from database
  // Improved normalization to handle various formats (underscores, spaces, casing)
  const canonicalKey = (s: string) => String(s || '').toLowerCase().trim().replace(/[\s_-]+/g, '');

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
      const map: Record<string, { display: string; primary: string; color: string }> = {};
      
      rows.forEach((t: any) => {
        const rawName = String(t?.name || '');
        const rawDisplay = String(t?.display_name || '');
        const rawId = String(t?.id || '');
        
        const displayVal = rawDisplay || rawName;
        const primaryVal = String(t?.incident_types || '');
        const colorVal = String(t?.color_code || '#6c757d'); // Default color if missing
        
        const entry = { display: displayVal, primary: primaryVal, color: colorVal };
        
        // Map multiple variations to ensure we catch it
        if (rawName) {
           map[rawName] = entry; // exact name
           map[rawName.toLowerCase()] = entry; // lower name
           map[canonicalKey(rawName)] = entry; // canonical name
        }
        
        if (rawDisplay) {
           map[rawDisplay] = entry; // exact display
           map[rawDisplay.toLowerCase()] = entry; // lower display
           map[canonicalKey(rawDisplay)] = entry; // canonical display
        }
        
        if (rawId) {
           map[rawId] = entry;
        }
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

  const loadEntriesByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('03_ecc_01_edob_01_entries')
        .select('*')
        .eq('incident_date', date)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (err) {
      console.error('Failed to load eDOB entries by date:', err);
      setError('Failed to load eDOB entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter entries based on selected filters
  const filterEntries = (primaryFilter: string, typeFilter: string, reporterFilter: string, locationFilter: string, incidentNumberFilter: string, dateFilter: string) => {
    let filtered = entries;
    
    if (selectedPrimaryIncidents.length > 0) {
      const set = new Set(selectedPrimaryIncidents);
      filtered = filtered.filter(entry => {
        const key = canonicalKey(entry.incident_type || '');
        const entryPrimaryIncident = incidentTypeMap[key]?.primary || '';
        return set.has(entryPrimaryIncident);
      });
    } else if (primaryFilter && primaryFilter !== 'All Primary Incidents') {
      filtered = filtered.filter(entry => {
        const key = canonicalKey(entry.incident_type || '');
        const entryPrimaryIncident = incidentTypeMap[key]?.primary || '';
        return entryPrimaryIncident === primaryFilter;
      });
    }
    
    if (selectedSecondaryIncidents.length > 0) {
      const set = new Set(selectedSecondaryIncidents);
      filtered = filtered.filter(entry => set.has(String(entry.incident_type || '')));
    } else if (typeFilter && typeFilter !== 'All Secondary Incidents') {
      filtered = filtered.filter(entry => entry.incident_type === typeFilter);
    }
    
    if (reporterFilter && reporterFilter !== 'All Reporters') {
      filtered = filtered.filter(entry => entry.reported_by === reporterFilter);
    }
    
    if (selectedLocations.length > 0) {
      const set = new Set(selectedLocations);
      filtered = filtered.filter(entry => set.has(String(entry.location || '')));
    } else if (locationFilter && locationFilter !== 'All Locations') {
      filtered = filtered.filter(entry => entry.location === locationFilter);
    }
    
    if (incidentNumberFilter) {
      const searchNumber = parseInt(incidentNumberFilter);
      if (!isNaN(searchNumber)) {
        filtered = filtered.filter(entry => entry.incident_number === searchNumber);
      }
    }
    
    if (dateFilter) {
      filtered = filtered.filter(entry => String(entry.incident_date || '').slice(0, 10) === dateFilter);
    }
    
    if (dailyBriefDateTime) {
      const end = new Date(dailyBriefDateTime);
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

      const getEntryDateTime = (e: EDOBEntry): Date | null => {
        const dStr = String(e.incident_date || '').trim();
        const tRaw = String(e.incident_time || '').trim();
        const tStr = (tRaw.split('.')[0] || '00:00:00');
        if (dStr) {
          const dt = new Date(`${dStr}T${tStr}`);
          if (!isNaN(dt.getTime())) return dt;
        }
        const created = e.created_at ? new Date(e.created_at) : null;
        return created && !isNaN(created.getTime()) ? created : null;
      };

      filtered = filtered.filter(e => {
        const dt = getEntryDateTime(e);
        return dt ? dt >= start && dt <= end : false;
      });
    }
    
    setFilteredEntries(filtered);
  };
  
  // Handle filter changes
  const handlePrimaryIncidentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPrimaryIncidentFilter(value);
    setSelectedPrimaryIncidents([]);
    
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

  const togglePrimaryIncidentSelection = (name: string) => {
    setSelectedPrimaryIncidents(prev => {
      const exists = prev.includes(name);
      const next = exists ? prev.filter(n => n !== name) : [...prev, name];
      filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
      return next;
    });
  };

  const clearPrimaryIncidentSelection = () => {
    setSelectedPrimaryIncidents([]);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };

  const selectAllPrimaryIncidents = () => {
    const all = uniquePrimaryIncidents.filter(Boolean);
    setSelectedPrimaryIncidents(all);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };

  useEffect(() => {
    if (!primaryDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (primaryDropdownRef.current && !primaryDropdownRef.current.contains(e.target as Node)) {
        setPrimaryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [primaryDropdownOpen]);

  useEffect(() => {
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  }, [selectedPrimaryIncidents]);

  useEffect(() => {
    if (!secondaryDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (secondaryDropdownRef.current && !secondaryDropdownRef.current.contains(e.target as Node)) {
        setSecondaryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [secondaryDropdownOpen]);

  useEffect(() => {
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  }, [selectedSecondaryIncidents]);

  useEffect(() => {
    if (!locationDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [locationDropdownOpen]);

  useEffect(() => {
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  }, [selectedLocations]);

  const toggleSecondaryIncidentSelection = (name: string) => {
    setSelectedSecondaryIncidents(prev => {
      const exists = prev.includes(name);
      const next = exists ? prev.filter(n => n !== name) : [...prev, name];
      filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
      return next;
    });
  };

  const clearSecondaryIncidentSelection = () => {
    setSelectedSecondaryIncidents([]);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };

  const selectAllSecondaryIncidents = () => {
    const all = filteredIncidentTypes.map(t => t.name).filter(Boolean);
    setSelectedSecondaryIncidents(all);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };

  const toggleLocationSelection = (loc: string) => {
    setSelectedLocations(prev => {
      const exists = prev.includes(loc);
      const next = exists ? prev.filter(n => n !== loc) : [...prev, loc];
      filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
      return next;
    });
  };

  const clearLocationSelection = () => {
    setSelectedLocations([]);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };

  const selectAllLocations = () => {
    const all = uniqueLocations.filter(Boolean);
    setSelectedLocations(all);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
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
  
  const handleDailyBriefDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDailyBriefDateTime(value);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, incidentNumberFilter, dateFilter);
  };

  const handleClearAllFilters = async () => {
    try {
      setPrimaryIncidentFilter('');
      setIncidentTypeFilter('');
      setReportedByFilter('');
      setLocationFilter('');
      setIncidentNumberFilter('');
      setDateFilter('');
      setDailyBriefDateTime('');
      setSelectedPrimaryIncidents([]);
      setSelectedSecondaryIncidents([]);
      setSelectedLocations([]);
      setSelectedEntryIds([]);
      setPrimaryDropdownOpen(false);
      setSecondaryDropdownOpen(false);
      setLocationDropdownOpen(false);
      setCurrentPage(1);
      await loadEntries();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };
  
  const handleIncidentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIncidentNumberFilter(value);
    filterEntries(primaryIncidentFilter, incidentTypeFilter, reportedByFilter, locationFilter, value, dateFilter);
  };
  
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    // Reset other filters to avoid conflicting zero-results after date change
    setSelectedPrimaryIncidents([]);
    setSelectedSecondaryIncidents([]);
    setSelectedLocations([]);
    setPrimaryIncidentFilter('');
    setIncidentTypeFilter('');
    setLocationFilter('');
    setReportedByFilter('');
    setIncidentNumberFilter('');
    setCurrentPage(1);
    if (value) {
      await loadEntriesByDate(value);
    } else {
      await loadEntries();
    }
    filterEntries('', '', '', '', '', value);
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
    
    const entriesToPrint = selectedEntryIds.length > 0
      ? filteredEntries.filter(e => selectedEntryIds.includes(e.id))
      : filteredEntries;

    if (entriesToPrint.length === 0) {
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
      console.log('Preparing table data for', entriesToPrint.length, 'entries');
      // Compute chronological sequence map for filtered entries
      const seqSorted = entriesToPrint.map(e => {
        const createdStr = formatDateTime(e.created_at || '');
        const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
        const keyDate = e.incident_date || cDate;
        const keyTime = (e.incident_time || cTime).split('.')[0];
        const key = `${keyDate} ${keyTime}`;
        return { id: e.id, key };
      }).sort((a, b) => a.key.localeCompare(b.key));
      const sequenceMap = new Map<string, number>();
      seqSorted.forEach((item, i) => sequenceMap.set(item.id, i + 1));

      const tableData = entriesToPrint.map((entry, index) => {
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
        ...vfhSetup.tableConfig,
        willDrawCell: (data) => {
          // Add color badge to Incident Type column (index 1)
          if (data.section === 'body' && data.column.index === 1) {
            const entry = entriesToPrint[data.row.index];
            if (entry) {
              const rawType = entry.incident_type || '';
              const typeInfo = 
                incidentTypeMap[rawType] || 
                incidentTypeMap[rawType.toLowerCase()] || 
                incidentTypeMap[canonicalKey(rawType)];
              const badgeColor = typeInfo?.color || '#6c757d';
              
              // Set text color to white
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
              
              // Draw badge background
              doc.setFillColor(badgeColor);
              
              // Calculate badge dimensions (with padding)
              const paddingX = 2;
              const paddingY = 2;
              const x = data.cell.x + paddingX;
              const y = data.cell.y + paddingY;
              const w = data.cell.width - (paddingX * 2);
              const h = data.cell.height - (paddingY * 2);
              
              doc.roundedRect(x, y, w, h, 3, 3, 'F');
            }
          }
        }
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
                <FilterLabel>Filter By Primary Incidents:</FilterLabel>
                <div ref={primaryDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    type="button"
                    onClick={() => setPrimaryDropdownOpen(o => !o)}
                    style={{ padding: '8px 12px', border: '2px solid #1177BB', borderRadius: 6, background: '#fff', color: '#1177BB', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Filter Primary ({selectedPrimaryIncidents.length ? selectedPrimaryIncidents.length : 'All'})
                  </button>
                  {primaryDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 280, padding: 8, maxHeight: 280, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button type="button" onClick={clearPrimaryIncidentSelection} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Clear</button>
                        <button type="button" onClick={selectAllPrimaryIncidents} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Select All</button>
                      </div>
                      {(uniquePrimaryIncidents.filter(Boolean) || []).map((incident) => (
                        <label key={incident} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                          <input type="checkbox" checked={selectedPrimaryIncidents.includes(incident)} onChange={() => togglePrimaryIncidentSelection(incident)} />
                          <span>{incident}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>Filter By Secondary Incidents:</FilterLabel>
                <div ref={secondaryDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    type="button"
                    onClick={() => setSecondaryDropdownOpen(o => !o)}
                    style={{ padding: '8px 12px', border: '2px solid #1177BB', borderRadius: 6, background: '#fff', color: '#1177BB', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Filter Secondary ({selectedSecondaryIncidents.length ? selectedSecondaryIncidents.length : 'All'})
                  </button>
                  {secondaryDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 280, padding: 8, maxHeight: 280, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button type="button" onClick={clearSecondaryIncidentSelection} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Clear</button>
                        <button type="button" onClick={selectAllSecondaryIncidents} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Select All</button>
                      </div>
                      {(filteredIncidentTypes || []).map((type) => (
                        <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                          <input type="checkbox" checked={selectedSecondaryIncidents.includes(type.name)} onChange={() => toggleSecondaryIncidentSelection(type.name)} />
                          <span>{type.display_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>Filter By Location:</FilterLabel>
                <div ref={locationDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    type="button"
                    onClick={() => setLocationDropdownOpen(o => !o)}
                    style={{ padding: '8px 12px', border: '2px solid #1177BB', borderRadius: 6, background: '#fff', color: '#1177BB', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Filter Locations ({selectedLocations.length ? selectedLocations.length : 'All'})
                  </button>
                  {locationDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 280, padding: 8, maxHeight: 280, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button type="button" onClick={clearLocationSelection} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Clear</button>
                        <button type="button" onClick={selectAllLocations} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: '#f7f7f7', cursor: 'pointer' }}>Select All</button>
                      </div>
                      {(uniqueLocations.filter(Boolean) || []).map((loc) => (
                        <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                          <input type="checkbox" checked={selectedLocations.includes(loc)} onChange={() => toggleLocationSelection(loc)} />
                          <span>{loc}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </FilterGroup>
              <FilterGroup>
                <FilterLabel htmlFor="daily-brief-datetime">Daily Brief Report (Date & Time):</FilterLabel>
                <FilterInput
                  id="daily-brief-datetime"
                  type="datetime-local"
                  value={dailyBriefDateTime}
                  onChange={handleDailyBriefDateTimeChange}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel style={{ visibility: 'hidden' }}>Refresh</FilterLabel>
                <button type="button" onClick={handleClearAllFilters} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#f7f7f7', cursor: 'pointer' }}>Refresh</button>
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
                    <colgroup>
                      <col style={{ width: '6%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '46%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <TableHeaderCell style={{ width: '6%', textAlign: 'center' }}>Select</TableHeaderCell>
                        <TableHeaderCell>Incident Number</TableHeaderCell>
                        <TableHeaderCell>Incident Type</TableHeaderCell>
                        <TableHeaderCell>Location</TableHeaderCell>
                        <TableHeaderCell>Incident Brief</TableHeaderCell>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Compute sequence map for displayed entries
                        const seqSortedUi = displayEntries.map(e => {
                          const createdStr = formatDateTime(e.created_at || '');
                          const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
                          const keyDate = e.incident_date || cDate;
                          const keyTime = (e.incident_time || cTime).split('.')[0];
                          const key = `${keyDate} ${keyTime}`;
                          return { id: e.id, key };
                        }).sort((a, b) => a.key.localeCompare(b.key));
                        const sequenceMapUi = new Map<string, number>();
                        seqSortedUi.forEach((item, i) => sequenceMapUi.set(item.id, i + 1));
                        
                        return displayEntries.map((entry, index) => {
                          const isEmergency = entry.incident_type === 'Emergency';
                          const created = formatDateTime(entry.created_at || '');
                          const [createdDate, createdTime] = created.includes(' ') ? created.split(' ') : ['', ''];
                          const fallbackDate = entry.incident_date || createdDate;
                          const fallbackTime = entry.incident_time || createdTime;
                          const sequenceNum = sequenceMapUi.get(entry.id) ?? (index + 1);
                          
                          return (
                            <tr key={entry.id}>
                              <TableCell $isEmergency={isEmergency} style={{ width: '6%', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedEntryIds.includes(entry.id)}
                                  onChange={() => {
                                    setSelectedEntryIds(prev => {
                                      const exists = prev.includes(entry.id);
                                      return exists ? prev.filter(id => id !== entry.id) : [...prev, entry.id];
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell $isEmergency={isEmergency} style={{ whiteSpace: 'nowrap', fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#dc3545' }}>
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
                                {(() => {
                                  // Look up display name and color from database table based on the stored incident type
                                  const rawType = entry.incident_type || '';
                                  
                                  // Try multiple lookup strategies
                                  const typeInfo = 
                                    incidentTypeMap[rawType] || 
                                    incidentTypeMap[rawType.toLowerCase()] || 
                                    incidentTypeMap[canonicalKey(rawType)];
                                  
                                  const displayName = typeInfo?.display || rawType || 'N/A';
                                  const badgeColor = typeInfo?.color || undefined;
                                  
                                  return (
                                    <IncidentBadge type={rawType} color={badgeColor}>
                                      {displayName}
                                    </IncidentBadge>
                                  );
                                })()}
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
                <div ref={bottomRef} style={{ height: '1px' }} />
                
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
