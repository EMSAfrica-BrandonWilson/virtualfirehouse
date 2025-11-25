import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFH_A4_P, cleanupTrailingBlankPages, applyFinalPageNumbers, getRoleIndex } from '../../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../../utils/companyLogo';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

// Page container with orientation toggle for wider landscape view
const PageContainer = styled.div<{ $orientation: 'portrait' | 'landscape' }>`
  max-width: ${(p) => (p.$orientation === 'portrait' ? '820px' : '1200px')};
  margin: 0 auto;
  background: #ffffff;
  padding: 12px 18px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  @media print {
    width: ${(p) => (p.$orientation === 'portrait' ? '210mm' : '297mm')};
    padding: 0;
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

const PageHeader = styled.header<{ $accent: string }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 4px solid ${(p) => p.$accent};
  margin-bottom: 12px;

  .title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
  }
  .meta {
    text-align: right;
    font-size: 0.95rem;
    color: #555;
    line-height: 1.4;
  }
`;

const PageFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding-top: 8px;
  border-top: 2px dashed #ddd;
  color: #666;
  font-size: 0.95rem;
`;

const ToggleButton = styled.button`
  background-color: #00a3a3;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: #008c8c; }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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

const PrintButton = styled.button`
  background-color: #6c63ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a54d6;
  }
`;

const ShiftSelect = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
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

const StaffTable = styled.table<{ $headerColor: string; $headerTextColor: string }>`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: ${(props) => props.$headerColor};
    color: ${(props) => props.$headerTextColor};
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }

  /* Station row header styling */
  tbody tr.station-header td {
    background-color: #eef7ff;
    color: #333;
    font-weight: 700;
    border-top: 2px solid #ddd;
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

const InfoBox = styled.div`
  background-color: #e3f2fd;
  border-left: 4px solid #0066cc;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
`;

interface StaffMember {
  staff_id: number;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  nationality?: string;
  operational_shift_id?: number;
  photo_url?: string;
  telephone_number?: string;
  rank_name?: string;
  fire_station_name?: string;
}

interface Shift {
  id: number;
  shift_name: string;
}

export const StaffReportBlueShift: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [selectedShiftName, setSelectedShiftName] = useState<string>('');
  const [isDefaultShift, setIsDefaultShift] = useState<boolean>(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [collapsedStations, setCollapsedStations] = useState<Record<string, boolean>>({});
  
  // Load current user for attribution in PDF footer
  useEffect(() => {
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
      } catch (err) {
        console.error('Error loading current user for PDF:', err);
      }
    };
    loadCurrentUser();
  }, []);

  const getShiftHeaderColor = (name?: string): string => {
    const n = (name || '').toLowerCase();
    if (n.includes('blue')) return 'rgb(0,0,255)';
    if (n.includes('green')) return 'rgb(0,255,0)';
    if (n.includes('red')) return 'rgb(255,0,0)';
    if (n.includes('day')) return 'rgb(128,128,128)'; // grey
    return '#0066cc';
  };

  const getShiftHeaderRgb = (name?: string): [number, number, number] => {
    const n = (name || '').toLowerCase();
    if (n.includes('blue')) return [0, 0, 255];
    if (n.includes('green')) return [0, 255, 0];
    if (n.includes('red')) return [255, 0, 0];
    if (n.includes('day')) return [128, 128, 128];
    return [0, 102, 204];
  };

  const getHeaderTextColor = (name?: string): string => {
    const n = (name || '').toLowerCase();
    if (n.includes('green')) return 'black';
    if (n.includes('day')) return 'black';
    return 'white';
  };

  // Role ordering is standardized via helper in pdfReportHelper

  const formatRankName = (name?: string): string => {
    if (!name) return '-';
    // Fix specific misspelling without changing DB values globally
    const lower = name.toLowerCase();
    if (lower.includes('ambulance attendent') || lower.includes('ambulance attendant')) {
      return 'Ambulance Assistant';
    }
    return name;
  };

  // Station ordering helpers
  const stationOrderList = [
    'main fire station',
    'sub fire station 1',
    'sub fire station 2',
    'sub fire station 3',
    'medic tango'
  ];
  const stationOrderMap = new Map(stationOrderList.map((name, idx) => [name, idx]));
  const normalizeStation = (name?: string) => (name || '').toLowerCase().replace(/\./g, '').trim();
  const getStationIndex = (name?: string) => {
    const key = normalizeStation(name);
    return stationOrderMap.has(key) ? (stationOrderMap.get(key) as number) : 9999;
  };

  useEffect(() => {
    loadShifts();
  }, []);

  useEffect(() => {
    if (selectedShiftId !== null) {
      loadStaff();
    }
  }, [selectedShiftId]);

  const loadShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('id, shift_name')
        .order('shift_name', { ascending: true });

      if (error) throw error;
      const shiftList = (data || []) as Shift[];
      setShifts(shiftList);

      // Default selection: use stored default or Blue shift if available
      const storedId = localStorage.getItem('default_shift_id');
      const storedName = localStorage.getItem('default_shift_name');

      if (storedId) {
        const idNum = parseInt(storedId, 10);
        const match = shiftList.find(s => s.id === idNum);
        if (match) {
          setSelectedShiftId(match.id);
          setSelectedShiftName(match.shift_name);
          setIsDefaultShift(true);
          return;
        }
      }

      const blue = shiftList.find(s => s.shift_name?.toLowerCase().includes('blue'));
      const initial = blue || shiftList[0];
      if (initial) {
        setSelectedShiftId(initial.id);
        setSelectedShiftName(initial.shift_name);
        setIsDefaultShift(false);
      }
    } catch (error: any) {
      console.error('Error loading shifts:', error);
      setError('Failed to load shift information');
    }
  };

  const loadStaff = async () => {
    setLoading(true);
    setError('');
    try {
      // 1) Load staff for Blue Shift without nested relationships (avoids schema cache relationship errors)
      const { data: staffRows, error: staffErr } = await supabase
        .from('02_admin_staff_1_registration')
        .select(`
          staff_id,
          employee_number,
          first_name,
          middle_name,
          last_name,
          nationality,
          telephone_number,
          rank_id,
          fire_station_id,
          operational_shift_id,
          photo_url
        `)
        .eq('operational_shift_id', selectedShiftId)
        .order('employee_number', { ascending: true });

      if (staffErr) throw staffErr;

      const rows = staffRows || [];

      // 2) Build lookup sets for rank and station IDs
      const rankIds = Array.from(
        new Set(
          rows
            .map((r: any) => r.rank_id)
            .filter((v: any) => v !== null && v !== undefined)
        )
      );
      const stationIds = Array.from(
        new Set(
          rows
            .map((r: any) => r.fire_station_id)
            .filter((v: any) => v !== null && v !== undefined)
        )
      );

      // 3) Fetch ranks and stations in separate queries and build maps
      let rankMap = new Map<string, string>();
      let stationMap = new Map<number, string>();

      if (rankIds.length > 0) {
        const { data: rankRows, error: rankErr } = await supabase
          .from('02_admin_staff_9_ranks')
          .select('id, name')
          .in('id', rankIds as string[]);
        if (rankErr) {
          // Non-fatal: proceed without rank names
          console.warn('Rank lookup failed:', rankErr);
        } else {
          (rankRows || []).forEach((r: any) => {
            rankMap.set(r.id, r.name);
          });
        }
      }

      if (stationIds.length > 0) {
        const { data: stationRows, error: stationErr } = await supabase
          .from('fire_stations_vfh')
          .select('id, fire_station_name')
          .in('id', stationIds as number[]);
        if (stationErr) {
          // Non-fatal: proceed without station names
          console.warn('Station lookup failed:', stationErr);
        } else {
          (stationRows || []).forEach((s: any) => {
            stationMap.set(s.id, s.fire_station_name);
          });
        }
      }

      // 4) Transform final staff records with resolved names
      let transformed = rows.map((row: any) => ({
        staff_id: row.staff_id,
        employee_number: row.employee_number,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        nationality: row.nationality,
        telephone_number: row.telephone_number,
        operational_shift_id: row.operational_shift_id,
        photo_url: row.photo_url,
        rank_name: (row.rank_id ? rankMap.get(row.rank_id) : undefined) || '-',
        fire_station_name: (row.fire_station_id ? stationMap.get(row.fire_station_id) : undefined) || '-',
      }));

      // Apply display formatting fixes (e.g., Ambulance Attendant)
      transformed = transformed.map(item => ({
        ...item,
        rank_name: formatRankName(item.rank_name)
      }));

      // 5) Order rows; for Day Shift prioritize Rank, otherwise Station → Rank → Emp #
      transformed.sort((a, b) => {
        const isDay = (selectedShiftName || '').toLowerCase().includes('day');
        const rnA = String(a.rank_name || '').toLowerCase();
        const rnB = String(b.rank_name || '').toLowerCase();
        if (isDay) {
          if (rnA !== rnB) return rnA.localeCompare(rnB);
          const sa = getStationIndex(a.fire_station_name);
          const sb = getStationIndex(b.fire_station_name);
          if (sa !== sb) return sa - sb;
          return (a.employee_number || '').localeCompare(b.employee_number || '');
        } else {
          const sa = getStationIndex(a.fire_station_name);
          const sb = getStationIndex(b.fire_station_name);
          if (sa !== sb) return sa - sb;
          const ra = getRoleIndex(a.rank_name);
          const rb = getRoleIndex(b.rank_name);
          if (ra !== rb) return ra - rb;
          return (a.employee_number || '').localeCompare(b.employee_number || '');
        }
      });

      setStaff(transformed);
      setGeneratedAt(new Date());
    } catch (error: any) {
      console.error('Error loading staff:', error);
      setError(error.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    const sel = shifts.find(s => s.id === id);
    setSelectedShiftId(sel ? sel.id : null);
    setSelectedShiftName(sel ? sel.shift_name : '');
    // If default checkbox is active, update stored default
    if (sel && isDefaultShift) {
      localStorage.setItem('default_shift_id', String(sel.id));
      localStorage.setItem('default_shift_name', sel.shift_name);
    }
  };

  const handleDefaultToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsDefaultShift(checked);
    if (checked && selectedShiftId && selectedShiftName) {
      localStorage.setItem('default_shift_id', String(selectedShiftId));
      localStorage.setItem('default_shift_name', selectedShiftName);
    } else {
      localStorage.removeItem('default_shift_id');
      localStorage.removeItem('default_shift_name');
    }
  };

  const handlePrintPdf = async () => {
    // Generate PDF in portrait orientation as requested
    // Use standardized VFH-A4 Portrait wrapper for document setup

    // Resolve department information (name, type, logo) similar to other PDFs
    let departmentName = 'King Fahd International Airport';
    let departmentType = 'Airport Rescue & Fire Fighting Services';
    let departmentLogoUrl: string | null | undefined = null;
    try {
      const { data: deptRows, error: deptErr } = await supabase
        .from('emergency_departments')
        .select('dept_name, department_type, dept_type, dept_picture_url')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!deptErr && Array.isArray(deptRows) && deptRows.length > 0) {
        const d: any = deptRows[0];
        departmentName = d.dept_name || departmentName;
        departmentType = d.department_type || d.dept_type || departmentType;
        departmentLogoUrl = d.dept_picture_url || null;
      }
    } catch (e) {
      console.warn('Department info lookup failed; using defaults:', e);
    }

    // Generate base64 logo using centralized helper (DACO-first fallback)
    let logoBase64 = '';
    try {
      logoBase64 = await getPDFLogo(departmentLogoUrl || undefined);
    } catch (logoErr) {
      console.warn('Logo generation failed; continuing without logo:', logoErr);
    }

    // Build summary text consistent with standardized PDFs
    const summaryText = `Shift: ${selectedShiftName || '—'} | Total Staff: ${staff.length}`;

    // Setup standardized VFH A4 Portrait header/footer and table config
    const { doc, tableStartY, tableConfig, filename } = setupVFH_A4_P({
      logoBase64: logoBase64 || undefined,
      data: {
        departmentName,
        departmentType,
        reportTitle: `Staff Distribution List for ${selectedShiftName || '— Shift'}`,
        summaryText,
        currentUser,
      },
    });

    // Build grouped rows matching the UI (no Station column; group headers per station)
    const groups = new Map<string, StaffMember[]>();
    for (const s of staff) {
      const key = s.fire_station_name || 'Unknown Station';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    }

    const columns = ['Employee Name', 'Emp #', 'Rank', 'Telephone #', 'Nationality'];
    const body: any[] = [];
    for (const [stationName, members] of groups.entries()) {
      body.push([
        { content: `${stationName} — ${members.length} staff`, colSpan: 5, styles: { fillColor: [238,247,255], fontStyle: 'bold', halign: 'left' } }
      ]);
      for (const m of members) {
        body.push([
          `${m.first_name} ${m.last_name}`,
          m.employee_number || '-',
          m.rank_name || '-',
          m.telephone_number || '-',
          m.nationality || '-',
        ]);
      }
    }

    // Render table using standardized layout with shift-based header coloring
    const headerRGB = getShiftHeaderRgb(selectedShiftName);
    const headerTextColor = getHeaderTextColor(selectedShiftName).toLowerCase() === 'black' ? 0 : 255;
    const tableConfigWithShiftColor = {
      ...tableConfig,
      headStyles: {
        ...tableConfig.headStyles,
        fillColor: headerRGB,
        textColor: headerTextColor,
      },
    };
    autoTable(doc, {
      head: [columns],
      body,
      startY: tableStartY,
      ...tableConfigWithShiftColor,
    });

    // Remove any trailing blank pages and finalize page numbers with accurate totals
    cleanupTrailingBlankPages(doc);
    applyFinalPageNumbers(doc, {
      departmentName,
      departmentType,
      reportTitle: `Staff Distribution List for ${selectedShiftName || '— Shift'}`,
      summaryText,
      currentUser,
    });

    // Generate PDF Blob and open in in-app viewer (middle column)
    const arrayBuffer = doc.output('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

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

    // Store Blob URL and navigation context for PDF viewer
    sessionStorage.setItem(pdfKey, blobUrl);
    sessionStorage.setItem('pdf_source_section', '/admin/register/staff');
    sessionStorage.setItem('pdf_source_path', '/admin/register/staff/report-blue-shift');

    // Navigate to the PDF viewer within the application viewport
    navigate(`/pdf-viewer/${pdfKey}`);
  };

  const toggleStationCollapsed = (name: string) => {
    setCollapsedStations(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleEdit = (staffMember: StaffMember) => {
    sessionStorage.setItem('current_staff_id', staffMember.staff_id.toString());
    sessionStorage.setItem('current_employee_number', staffMember.employee_number);
    navigate('/admin/register/staff/basic-info');
  };

  return (
    <MainContent>
      <PageContainer $orientation={pageOrientation}>
        <PageHeader $accent={getShiftHeaderColor(selectedShiftName)}>
          <div className="title">Staff Station Distribution List</div>
          <div className="meta">
            <div>Shift: {selectedShiftName || '—'}</div>
            <div>View: {pageOrientation === 'portrait' ? 'Portrait' : 'Landscape'}</div>
            <div>Generated: {generatedAt ? generatedAt.toLocaleString() : '—'}</div>
          </div>
        </PageHeader>

        <Paragraph>
          Distribution list of staff with station assignments and contact details.
        </Paragraph>

        <StaffListSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SubTitle>Staff Members</SubTitle>
          <ControlsRow>
            <ShiftSelect value={selectedShiftId ?? ''} onChange={handleShiftChange}>
              <option value="" disabled>Select shift</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>{shift.shift_name}</option>
              ))}
            </ShiftSelect>
            <CheckboxLabel>
              <input type="checkbox" checked={isDefaultShift} onChange={handleDefaultToggle} />
              Set as default shift
            </CheckboxLabel>
            <ToggleButton onClick={() => setPageOrientation(o => (o === 'portrait' ? 'landscape' : 'portrait'))}>
              {pageOrientation === 'portrait' ? 'Switch to Landscape' : 'Switch to Portrait'}
            </ToggleButton>
            <PrintButton onClick={handlePrintPdf}>
              Print to PDF
            </PrintButton>
            <RefreshButton onClick={loadStaff} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </RefreshButton>
          </ControlsRow>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {selectedShiftId && (
          <InfoBox>
            <strong>Filter:</strong> Showing staff assigned to {selectedShiftName} (ID: {selectedShiftId})
          </InfoBox>
        )}

        {loading ? (
          <p>Loading staff members...</p>
        ) : staff.length === 0 ? (
          <p>No staff members found for the selected shift.</p>
        ) : (
          <StaffTable $headerColor={getShiftHeaderColor(selectedShiftName)} $headerTextColor={getHeaderTextColor(selectedShiftName)}>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Emp #</th>
                <th>Rank</th>
                <th>Telephone #</th>
                <th>Nationality</th>
              </tr>
            </thead>
            <tbody>
              {
                // Group staff by station in the current sorted order, with subtotals and collapsible groups
                (() => {
                  const groups = new Map<string, StaffMember[]>();
                  for (const m of staff) {
                    const key = m.fire_station_name || 'Unknown Station';
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key)!.push(m);
                  }
                  const rows: React.ReactNode[] = [];
                  for (const [stationName, members] of groups.entries()) {
                    const isDay = (selectedShiftName || '').toLowerCase().includes('day');
                    const sortedMembers = isDay
                      ? [...members].sort((a, b) => {
                          const rnA = String(a.rank_name || '').toLowerCase();
                          const rnB = String(b.rank_name || '').toLowerCase();
                          if (rnA !== rnB) return rnA.localeCompare(rnB);
                          return (a.employee_number || '').localeCompare(b.employee_number || '');
                        })
                      : members;
                    const collapsed = !!collapsedStations[stationName];
                    rows.push(
                      <tr className="station-header" key={`hdr-${stationName}`} onClick={() => toggleStationCollapsed(stationName)} style={{ cursor: 'pointer' }}>
                        <td colSpan={5}>{stationName} — {members.length} staff {collapsed ? '(collapsed)' : ''}</td>
                      </tr>
                    );
                    if (!collapsed) {
                      for (const member of sortedMembers) {
                        rows.push(
                          <tr key={member.staff_id}>
                            <td>{member.first_name} {member.last_name}</td>
                            <td>{member.employee_number}</td>
                            <td>{member.rank_name || '-'}</td>
                            <td>{member.telephone_number || '-'}</td>
                            <td>{member.nationality || '-'}</td>
                          </tr>
                        );
                      }
                    }
                  }
                  return rows;
                })()
              }
            </tbody>
          </StaffTable>
        )}
        
        </StaffListSection>

        <PageFooter>
          <div><strong>Total Staff:</strong> {staff.length}</div>
          <div>{selectedShiftName ? `Shift: ${selectedShiftName}` : ''}</div>
          <div>Generated: {generatedAt ? generatedAt.toLocaleString() : '—'}</div>
        </PageFooter>

      </PageContainer>
    </MainContent>
  );
};
