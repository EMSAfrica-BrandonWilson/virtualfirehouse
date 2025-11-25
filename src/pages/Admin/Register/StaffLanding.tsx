import React, { useState } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';
import { supabase } from '../../../lib/supabase';

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

// Bulk import UI styles
const FileInput = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
`;

const SubmitButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  &:hover {
    background-color: #f57c00;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background-color: #fdecea;
  border: 1px solid #f5c6cb;
  padding: 10px 12px;
  border-radius: 6px;
  margin: 10px 0;
`;

const SuccessMessage = styled.div`
  color: #2e7d32;
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  padding: 10px 12px;
  border-radius: 6px;
  margin: 10px 0;
`;

export const StaffLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');

  // Bulk import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ total: number; success: number; failed: number }>({ total: 0, success: 0, failed: 0 });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [deduping, setDeduping] = useState(false);

  const normalizeKey = (key: string) => key.toLowerCase().replace(/[\s_]+/g, '');

  const normalizeRow = (row: Record<string, any>) => {
    const norm: Record<string, any> = {};
    Object.entries(row).forEach(([k, v]) => { norm[normalizeKey(String(k))] = v; });
    return norm;
  };

  const getEdgeErrorMessage = (error: any, data: any): string | null => {
    try {
      // Prefer structured error from function response
      if (data && data.error && data.error.message) return String(data.error.message);
      // Supabase error context often contains raw body
      const body = error?.context?.body;
      if (body) {
        if (typeof body === 'string') {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.error?.message) return String(parsed.error.message);
          } catch {}
          return body;
        }
        if (body?.error?.message) return String(body.error.message);
      }
      // Fallback to error message
      if (error?.message) return String(error.message);
      return null;
    } catch {
      return null;
    }
  };

  const parseCSVRows = async (text: string): Promise<Record<string, any>[]> => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => normalizeKey(h));
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
      rows.push(row);
    }
    return rows;
  };

  const parseFileRows = async (file: File): Promise<Record<string, any>[]> => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const text = await file.text();
      return parseCSVRows(text);
    }
    const XLSX = await import('xlsx');
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const raw: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!raw || raw.length === 0) return [];
    const headers = (raw[0] as any[]).map(h => normalizeKey(String(h || '')));
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < raw.length; i++) {
      const r = raw[i] as any[];
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => { row[h] = r[idx]; });
      rows.push(row);
    }
    return rows;
  };

  const toId = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const toISODate = (v: any): string | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  const fetchLookups = async () => {
    const lookups: any = { deptByName: {}, stationByName: {}, rankByName: {}, shiftByName: {} };
    try {
      // Departments via edge function
      const { data: deptResp, error: deptErr } = await supabase.functions.invoke('get-departments', { method: 'GET' });
      const departments = deptErr ? [] : (deptResp?.data?.departments || []);
      departments.forEach((d: any) => { lookups.deptByName[(d.dept_name || '').toLowerCase().trim()] = d.id; });

      // Fire stations
      const { data: stations } = await supabase.from('fire_stations_vfh').select('id, fire_station_name');
      (stations || []).forEach((s: any) => { lookups.stationByName[(s.fire_station_name || '').toLowerCase().trim()] = s.id; });

      // Ranks
      const { data: ranks } = await supabase.from('ranks').select('id, name');
      (ranks || []).forEach((r: any) => { lookups.rankByName[(r.name || '').toLowerCase().trim()] = r.id; });

      // Operational shifts
      const { data: shifts } = await supabase.from('02_admin_register_fd2_operational_shifts').select('id, shift_name');
      (shifts || []).forEach((sh: any) => { lookups.shiftByName[(sh.shift_name || '').toLowerCase().trim()] = sh.id; });
    } catch (e) {
      // proceed with what we have
    }
    return lookups;
  };

  const mapRowToPayload = (row: Record<string, any>, lookups: any) => {
    const norm: Record<string, any> = {};
    Object.entries(row).forEach(([k, v]) => { norm[normalizeKey(String(k))] = v; });

    // Required fields for Basic Info: DepartmentId/Name, StationId/Name, EmployeeNumber
    const departmentId = toId(norm.departmentid) || lookups.deptByName[(norm.departmentname || '').toLowerCase().trim()] || null;
    const stationId = toId(norm.firestationid) || lookups.stationByName[(norm.stationname || norm.firestationname || '').toLowerCase().trim()] || null;

    // Optional lookups
    const operationalShiftId = toId(norm.operationalshiftid) || lookups.shiftByName[(norm.operationalshiftname || norm.shiftname || '').toLowerCase().trim()] || null;
    const rankId = (norm.rankid as string) || lookups.rankByName[(norm.rankname || '').toLowerCase().trim()] || null;

    return {
      employeeNumber: norm.employeenumber || '',
      nationalIdNumber: norm.nationalidnumber || norm.idnumber || '',
      firstName: norm.firstname || '',
      middleName: norm.middlename || '',
      lastName: norm.lastname || '',
      dateOfBirth: toISODate(norm.dateofbirth),
      gender: norm.gender || '',
      nationality: norm.nationality || '',
      telephoneNumber: norm.telephonenumber || norm.phonenumber || '',
      emailAddress: norm.emailaddress || norm.email || '',
      employmentStartDate: toISODate(norm.employmentstartdate || norm.hiredate),
      departmentId,
      stationId,
      operationalShiftId,
      rankId,
    };
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImportFile(file);
    setImportFileName(file ? file.name : '');
  };

  const startImport = async () => {
    if (!selectedImportFile) {
      setError('Please select an Excel/CSV file to import.');
      return;
    }
    setImportErrors([]);
    setSuccess('');
    setError('');
    setImporting(true);
    try {
      const rows = await parseFileRows(selectedImportFile);
      const lookups = await fetchLookups();
      let successCount = 0;
      let failedCount = 0;
      setImportProgress({ total: rows.length, success: 0, failed: 0 });
      for (let i = 0; i < rows.length; i++) {
        const norm = normalizeRow(rows[i]);
        const payload = mapRowToPayload(norm, lookups);

        const rowErrors: string[] = [];
        if (!payload.departmentId) {
          const deptName = (norm.departmentname || '').toString().trim();
          rowErrors.push(deptName ? `Unknown DepartmentName '${deptName}'` : 'Missing DepartmentId/DepartmentName');
        }
        if (!payload.stationId) {
          const stationName = (norm.stationname || norm.firestationname || '').toString().trim();
          rowErrors.push(stationName ? `Unknown StationName '${stationName}'` : 'Missing FireStationId/StationName');
        }
        if (!payload.employeeNumber) rowErrors.push('Missing EmployeeNumber');

        if (rowErrors.length > 0) {
          setImportErrors(prev => [...prev, `Row ${i + 1}: ${rowErrors.join('; ')}`]);
          failedCount++;
          setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          continue;
        }
        try {
          const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
            method: 'POST',
            body: {
              action: 'create',
              table: 'staff_basic_info',
              data: {
                employee_number: payload.employeeNumber,
                national_id_number: payload.nationalIdNumber || null,
                first_name: payload.firstName || null,
                middle_name: payload.middleName || null,
                last_name: payload.lastName || null,
                date_of_birth: payload.dateOfBirth || null,
                gender: payload.gender || null,
                nationality: payload.nationality || null,
                telephone_number: payload.telephoneNumber || null,
                email_address: payload.emailAddress || null,
                employment_start_date: payload.employmentStartDate || null,
                fire_dept_id: payload.departmentId,
                fire_station_id: payload.stationId,
                operational_shift_id: payload.operationalShiftId,
                rank_id: payload.rankId || null
              }
            }
          });
          if (error || !data?.data) {
            const msg = getEdgeErrorMessage(error, data) || 'Unknown error';
            throw new Error(msg);
          }
          successCount++;
          setImportProgress(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (err: any) {
          setImportErrors(prev => [...prev, `Row ${i + 1}: ${err.message || 'Failed to import'}`]);
          failedCount++;
          setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }
      setSuccess(`Basic Info import complete. ${successCount} succeeded, ${failedCount} failed.`);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import staff basic info from file');
    } finally {
      setImporting(false);
    }
  };

  const runDedupe = async () => {
    setError('');
    setSuccess('');
    const confirmed = window.confirm('This will delete duplicate Basic Info records by Employee Number, keeping the oldest entry. Continue?');
    if (!confirmed) return;
    setDeduping(true);
    try {
      const { data, error } = await supabase.functions.invoke('dedupe-staff-basic-info', {
        method: 'POST',
        body: { dryRun: false }
      });
      if (!error && data?.data) {
        const result = data?.data;
        const deleted = result?.deleted_count ?? 0;
        const groups = result?.duplicate_groups ?? 0;
        setSuccess(`Deduplication complete. Deleted ${deleted} duplicates across ${groups} groups.`);
      } else {
        // Fallback: do client-side discovery and delete via staff-multi-form-crud
        const { data: rows, error: listErr } = await supabase
          .from('staff_basic_info')
          .select('staff_id, employee_number, created_at')
          .order('employee_number', { ascending: true })
          .order('created_at', { ascending: true });

        if (listErr) {
          const msg = getEdgeErrorMessage(listErr, null) || 'Failed to list staff_basic_info for fallback dedupe';
          throw new Error(msg);
        }

        const groupsMap = new Map<string, Array<{ staff_id: number; created_at?: string }>>();
        for (const r of rows || []) {
          const key = String(r.employee_number || '').trim();
          if (!key) continue;
          const arr = groupsMap.get(key) || [];
          arr.push({ staff_id: r.staff_id, created_at: r.created_at });
          groupsMap.set(key, arr);
        }

        let deletedCount = 0;
        let groupCount = 0;
        for (const [_, arr] of groupsMap.entries()) {
          if (arr.length <= 1) continue;
          groupCount++;
          const sorted = arr.slice().sort((a, b) => (new Date(a.created_at || 0).getTime()) - (new Date(b.created_at || 0).getTime()));
          const keep = sorted[0];
          const toDelete = sorted.slice(1);
          for (const del of toDelete) {
            const { error: delErr } = await supabase.functions.invoke('staff-multi-form-crud', {
              method: 'DELETE',
              body: { table: 'staff_basic_info', id: del.staff_id, idColumn: 'staff_id' }
            });
            if (delErr) {
              const msg = getEdgeErrorMessage(delErr, null) || `Failed to delete staff_id=${del.staff_id}`;
              throw new Error(msg);
            }
            deletedCount++;
          }
        }

        setSuccess(`Deduplication complete. Deleted ${deletedCount} duplicates across ${groupCount} groups.`);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to delete duplicates');
    } finally {
      setDeduping(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="staff-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="staff-title">
                Staff Registration
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Staff registration maintains comprehensive personnel records for all emergency services personnel at King Fahd International Airport. This critical system captures essential employee information, qualifications, certifications, training records, and operational assignments to ensure appropriate staffing levels, regulatory compliance, and effective emergency response capabilities.
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
                  alt="Staff Registration" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/staff.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  No image available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Bulk Staff Import */}
      <Section aria-labelledby="bulk-import">
        <SubTitle id="bulk-import">Bulk Staff Import (Excel/CSV)</SubTitle>
        <Paragraph>
          Upload an Excel (.xlsx/.xls) or CSV file with columns like
          <code> DepartmentId, StaffIdNumber, FirstName, LastName </code>. You may also use names such as
          <code> DepartmentName, StationName, PositionName, RankName</code>; we’ll match them to IDs.
        </Paragraph>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <FlexRow>
          <Column $width="48%">
            <label htmlFor="staffImportFile" style={{ fontWeight: 600, color: '#1177BB', fontSize: '14px', marginBottom: '5px' }}>Select Excel/CSV file</label>
            <FileInput
              type="file"
              id="staffImportFile"
              name="staffImportFile"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFileChange}
            />
            {importFileName && (
              <small style={{ color: '#1177BB' }}>Selected: {importFileName}</small>
            )}
            <SubmitButton type="button" disabled={importing || !selectedImportFile} onClick={startImport}>
              {importing ? 'Importing...' : 'Start Import'}
            </SubmitButton>
            <div style={{ marginTop: '10px' }}>
              <SubmitButton type="button" disabled={deduping} onClick={runDedupe}>
                {deduping ? 'Deduping...' : 'Delete Duplicate Basic Info Records'}
              </SubmitButton>
            </div>
            {(importing || importProgress.total > 0) && (
              <div style={{ marginTop: '10px', color: '#1177BB' }}>
                Progress: {importProgress.success} succeeded, {importProgress.failed} failed of {importProgress.total}
              </div>
            )}
          </Column>
          <Column $width="48%">
            {importErrors.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <SubTitle style={{ fontSize: '1rem' }}>Import Errors</SubTitle>
                <ul style={{ color: '#c33' }}>
                  {importErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </Column>
        </FlexRow>
      </Section>

      {/* Personnel Information Section */}
      <Section aria-labelledby="personnel-info">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="personnel-info">
              Personnel Identity and Contact
            </SubTitle>
            <Paragraph>
              Staff registration documents complete personnel details including full name, employee identification number, contact information, emergency contacts, and demographic data. This foundational information supports personnel management, emergency notifications, and administrative coordination across all operational activities.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Qualifications and Certifications
            </SubTitle>
            <Paragraph>
              The system maintains detailed records of professional qualifications, certifications, medical fitness status, specialised training, and licensure information. This comprehensive certification tracking ensures compliance with ICAO standards, GACAR regulations, and operational readiness requirements for all personnel.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Assignment and Development Section */}
      <Section aria-labelledby="assignment-development">
        <SubTitle id="assignment-development">
          Operational Assignment and Professional Development
        </SubTitle>
        <Paragraph>
          Staff registration integrates with shift scheduling, station assignments, and equipment allocations to provide real-time visibility into personnel deployment and operational capabilities. The system tracks career progression, training completion, performance evaluations, and professional development milestones to support continuous improvement and maintain the highest standards of emergency response professionalism at King Fahd International Airport.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
