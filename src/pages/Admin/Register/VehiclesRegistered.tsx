import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, cleanupTrailingBlankPages, applyFinalPageNumbers } from '../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../utils/companyLogo';
import { getCurrentLocalDate, getStartOfDay, daysBetween } from '../../../lib/utils';
import { usePageImage } from '../../../hooks/usePageImage';

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
  align-items: stretch;
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
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  
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
  margin: 15px 0;
`;

const Paragraph = styled.p`
  font-size: 112.5%;
  letter-spacing: 0.5px;
  line-height: 24px;
  text-align: justify;
  margin: 8px 0 0 0;
  color: #444;
`;

const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 100%;
  min-height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 2px;
  box-sizing: border-box;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const VehicleListSection = styled.div`
  margin-top: 2rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

// Modal styles for delete confirmation
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 520px;
  max-width: calc(100vw - 40px);
  padding: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`;

const ModalBody = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #555;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalButton = styled.button<{ $variant?: 'cancel' | 'delete' }>`
  background-color: ${props => props.$variant === 'delete' ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  width: 92px;
  text-align: center;
  transition: opacity 0.3s ease;
  &:hover { opacity: 0.9; }
  &:disabled { background-color: #9aa0a6; cursor: not-allowed; }
`;

const RefreshButton = styled.button`
  background-color: #1177BB;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 10px;
`;

const PrintButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background-color: #1177BB;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #0f5c99;
`;

const TableRow = styled.tr`
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  &:hover { background-color: #f8f9fa; }
`;

const TableCell = styled.td`
  padding: 6px 8px;
  font-size: 12px;
  color: #333;
  vertical-align: middle;
`;

const GatePassExpiryCell = styled.td<{ $expiryStatus: 'valid' | 'warning' | 'urgent' | 'expired' | 'none' }>`
  padding: 6px 8px;
  font-size: 12px;
  color: #333;
  vertical-align: middle;
  width: 120px;
  min-width: 120px;
  white-space: nowrap;
  font-weight: 500;
  border-left: 4px solid ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#28a745';
      case 'warning': return '#ffc107';
      case 'urgent': return '#fd7e14';
      case 'expired': return '#dc3545';
      case 'none': return '#6c757d';
      default: return '#6c757d';
    }
  }};
  background-color: ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#f8fff9';
      case 'warning': return '#fffef7';
      case 'urgent': return '#fff8f5';
      case 'expired': return '#fff5f5';
      case 'none': return '#f8f9fa';
      default: return 'white';
    }
  }};
`;

const ExpiryStatusBadge = styled.span<{ $expiryStatus: 'valid' | 'warning' | 'urgent' | 'expired' | 'none' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  margin-left: 8px;
  background-color: ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'urgent': return '#fdf2e9';
      case 'expired': return '#f8d7da';
      case 'none': return '#e9ecef';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.$expiryStatus) {
      case 'valid': return '#155724';
      case 'warning': return '#856404';
      case 'urgent': return '#8a4a03';
      case 'expired': return '#721c24';
      case 'none': return '#495057';
      default: return '#495057';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  background: transparent;
  color: ${props => props.$variant === 'delete' ? '#dc3545' : '#1177BB'};
  border: none;
  padding: 0;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  &:hover { opacity: 0.8; }
`;

interface Vehicle {
  id: string;
  [key: string]: any;
}

export const VehiclesRegistered: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-vehicles', '/images/FireEngine.png');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; info: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadVehicles();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('*');

      if (error) throw new Error(error.message || 'Failed to load departments');
      
      const list = (data || []).map((row: any) => ({
        id: row.id ?? row.dept_id ?? row.department_id ?? row.pk ?? null,
        dept_name: row.dept_name ?? row.department_name ?? row.name ?? '',
        dept_type: row.dept_type ?? row.department_type ?? '',
        dept_picture_url: row.dept_picture_url ?? row.department_logo_url ?? null
      })).filter((d: any) => d.id !== null && d.dept_name);
      
      setDepartments(list);
    } catch (err: any) {
      console.error('Error loading departments:', err);
      setError(err.message || 'Failed to load departments');
    }
  };

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd4_vehicles')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const transformedVehicles: Vehicle[] = (data as any[]).map((vehicle: any) => ({
          ...vehicle,
          id: String(vehicle.id),
          call_sign_name: vehicle.vehicle_callsign || vehicle.veh_call_sign || vehicle.call_sign || vehicle.call_sign_name || '',
          veh_call_sign: vehicle.vehicle_callsign || vehicle.veh_call_sign || vehicle.call_sign || ''
        }));
        
        setVehicles(transformedVehicles);
      }
    } catch (err: any) {
      console.error('Error loading vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleDelete = (vehicleId: string, vehicleInfo: string) => {
    setPendingDelete({ id: vehicleId, info: vehicleInfo });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setError('');
    setSuccess('');
    try {
      const { error } = await supabase
        .from('02_admin_register_fd4_vehicles')
        .delete()
        .eq('id', pendingDelete.id);
        
      if (error) throw error;
      setSuccess('Vehicle deleted successfully!');
      setPendingDelete(null);
      await loadVehicles();
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      setError(err.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setPendingDelete(null);
  };

  const handleEdit = (vehicle: Vehicle) => {
    // Store for editing and navigate to process page
    sessionStorage.setItem('editing_vehicle', JSON.stringify(vehicle));
    navigate('/admin/register/vehicles/process');
  };

  const handleRefresh = async () => {
    await loadVehicles();
  };

  const getGatePassExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) {
      return { status: 'none' as const, daysRemaining: null, description: 'No expiry date' };
    }
    const today = getStartOfDay(getCurrentLocalDate());
    const expiry = getStartOfDay(expiryDate);
    const daysRemaining = daysBetween(today, expiry);
    if (daysRemaining < 0) return { status: 'expired' as const, daysRemaining, description: `Expired ${Math.abs(daysRemaining)} days ago` };
    if (daysRemaining <= 7) return { status: 'urgent' as const, daysRemaining, description: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining` };
    if (daysRemaining <= 30) return { status: 'warning' as const, daysRemaining, description: `${daysRemaining} days remaining` };
    return { status: 'valid' as const, daysRemaining, description: `${daysRemaining} days remaining` };
  };

  // Format a date-like string to display only the date portion
  const formatDateOnly = (value: string) => {
    if (!value) return '-';
    const trimmed = value.trim();
    const tIndex = trimmed.indexOf('T');
    if (tIndex > 0) return trimmed.slice(0, tIndex);
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex > 0) return trimmed.slice(0, spaceIndex);
    const match = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    try {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString();
      }
    } catch {}
    return trimmed;
  };

  const generatePDF = async () => {
    if (vehicles.length === 0) { setError('No vehicles to print.'); return; }
    setIsGeneratingPDF(true); setError(''); setSuccess('');
    try {
      let departmentName = 'Airport Rescue & Fire Fighting Services';
      let departmentType = '';
      let departmentLogoUrl = null as string | null;
      if (departments.length > 0) {
        const dept = departments[0];
        departmentName = dept.dept_name || departmentName;
        // Support both API shapes: department_type and dept_type
        departmentType = (dept as any).department_type || (dept as any).dept_type || '';
        // Support both logo url fields: dept_picture_url and department_logo_url
        departmentLogoUrl = (dept as any).dept_picture_url || (dept as any).department_logo_url || null;
      }
      // Create new PDF document (landscape)
      const doc = new jsPDF('landscape');
      // Summary footer text
      const totalVehicles = vehicles.length;
      const summaryText = `Summary: Total Vehicles: ${totalVehicles}`;
      // Convert logo to base64 if available
      const logoBase64: string | undefined = await getPDFLogo(departmentLogoUrl) || undefined;
      // Setup standardized VFH PDF (header, logo, footer hooks, table config)
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64,
        data: {
          departmentName,
          departmentType,
          reportTitle: 'Registered Vehicles Report',
          summaryText,
        }
      });

      const head = [[
        'Picture',
        'Call Sign',
        'Type',
        'Model',
        'Year',
        'Age',
        'MMS#',
        'Gate Pass#',
        'Gate Pass Expiry Date'
      ]];
      const body = sortedVehicles.map(v => [
        v.vehicle_picture_url ? 'Image' : 'No Image',
        v.vehicle_callsign || v.call_sign_name || v.veh_call_sign || '-',
        v.vehicle_type || '-',
        v.vehicle_model || '-',
        v.vehicle_year ?? '-',
        v.vehicle_age ?? '-',
        formatMmsNumber(String(v.vehicle_mms_number || '')),
        v.vehicle_gate_pass || '-',
        formatDateOnly(String(v.vehicle_gate_pass_expiry_date || ''))
      ]);

      autoTable(doc, {
        head,
        body,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        columnStyles: { 0: { cellWidth: 20 } }
      });

      cleanupTrailingBlankPages(doc);
      applyFinalPageNumbers(doc, {
        departmentName,
        departmentType,
        reportTitle: 'Registered Vehicles Report',
        summaryText,
        currentUser: undefined
      });

      // Output to viewer via sessionStorage and navigate
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      sessionStorage.setItem('pdf_source_section', '/admin/register');
      sessionStorage.setItem('pdf_source_path', '/admin/register/vehicles/registered');
      navigate(`/pdf-viewer/${pdfKey}`);
      setSuccess('PDF report generated successfully! Opening in viewer...');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Split gate pass string into alphabetic prefix and the rest (numbers/symbols)
  const splitGatePass = (value: string) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return { prefix: '', suffix: '' };
    // Prefer alphabetic prefix followed by any non-letter content
    const m = trimmed.match(/^([A-Za-z]+)([^A-Za-z].*)$/);
    if (m) {
      return { prefix: m[1], suffix: m[2].trim() };
    }
    // Fallback: split where numbers start
    const m2 = trimmed.match(/^(.+?)(\d.*)$/);
    if (m2) {
      return { prefix: m2[1].trim(), suffix: m2[2].trim() };
    }
    // No clear split; treat entire string as prefix
    return { prefix: trimmed, suffix: '' };
  };

  // Format MMS number by removing a trailing '.0' if present
  const formatMmsNumber = (value: string) => {
    if (!value) return '-';
    const trimmed = value.toString().trim();
    const withoutDecimal = trimmed.endsWith('.0') ? trimmed.slice(0, -2) : trimmed;
    // If it's exactly a 5-digit number, add leading 0 only if missing
    if (/^\d{5}$/.test(withoutDecimal)) {
      return withoutDecimal.startsWith('0') ? withoutDecimal : `0${withoutDecimal}`;
    }
    // If it contains a contiguous 5-digit sequence, pad that specific segment
    const contiguous = withoutDecimal.match(/\d{5}/);
    if (contiguous) {
      const seq = contiguous[0];
      if (!seq.startsWith('0')) {
        return withoutDecimal.replace(seq, `0${seq}`);
      }
    }
    return withoutDecimal;
  };

  const sortedVehicles = React.useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const aKey = (a.vehicle_callsign || a.call_sign_name || a.veh_call_sign || '').toString().toUpperCase();
      const bKey = (b.vehicle_callsign || b.call_sign_name || b.veh_call_sign || '').toString().toUpperCase();
      return aKey.localeCompare(bKey, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [vehicles]);

  const toLabel = (key: string) => {
    const map: Record<string, string> = {
      vehicle_picture_url: 'Picture',
      vehicle_callsign: 'Call Sign',
      vehicle_type: 'Type',
      vehicle_model: 'Model',
      vehicle_year: 'Year',
      vehicle_age: 'Age',
      vehicle_mms_number: 'MMS#',
      vehicle_gate_pass: 'Gate Pass#',
      vehicle_gate_pass_expiry_date: 'Expiry Date'
    };
    return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
  };

  const formatFieldValue = (key: string, value: any) => {
    if (!value && value !== 0) return '-';
    if (key === 'vehicle_mms_number') return formatMmsNumber(String(value));
    return String(value);
  };

  const displayFields = React.useMemo(() => {
    const present = (key: string) => vehicles.some(v => key in v);
    const fields = [
      'vehicle_picture_url',
      'vehicle_callsign',
      'vehicle_type',
      'vehicle_model',
      'vehicle_year',
      'vehicle_age',
      'vehicle_mms_number',
      'vehicle_gate_pass',
      'vehicle_gate_pass_expiry_date'
    ].filter(present);
    return fields;
  }, [vehicles]);

  return (
    <MainContent>
      <Section aria-labelledby="registered-vehicles-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="registered-vehicles-title">Registered Vehicles</Title>
              <Divider />
              <Paragraph>
                This page lists all registered vehicles, sorted by their Call Sign.
                Use Refresh to pull the latest data and Print Report to export a PDF.
                You can edit or delete entries as needed; gate pass expiry status is shown.
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
                  alt="Register Vehicles" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/FireEngine.png';
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

      <VehicleListSection>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <SubTitle>Registered Vehicles ({vehicles.length})</SubTitle>
          <div>
            <RefreshButton onClick={handleRefresh} disabled={vehiclesLoading}>
              {vehiclesLoading ? 'Loading...' : 'Refresh'}
            </RefreshButton>
            <PrintButton onClick={generatePDF} disabled={isGeneratingPDF || vehicles.length === 0}>
              {isGeneratingPDF ? 'Generating...' : 'Print Report'}
            </PrintButton>
          </div>
        </div>

        {vehiclesLoading ? (
          <div>Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div>No vehicles registered yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                {displayFields.map(key => (
                  key === 'vehicle_picture_url' ? (
                    <TableHeader key={key}>Picture</TableHeader>
                  ) : (
                    <TableHeader key={key}>{toLabel(key)}</TableHeader>
                  )
                ))}
                <TableHeader style={{ width: '92px' }}>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  {displayFields.map(key => (
                    key === 'vehicle_picture_url' ? (
                      <TableCell key={key}>
                        {vehicle.vehicle_picture_url ? (
                          <img src={vehicle.vehicle_picture_url} alt="Vehicle" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e0e0' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>
                            No Image
                          </div>
                        )}
                      </TableCell>
                    ) : key === 'vehicle_gate_pass_expiry_date' ? (
                      <TableCell key={key}>
                        {(() => {
                          const raw = vehicle[key];
                          const formatted = formatDateOnly(String(raw || ''));
                          const { status, description } = getGatePassExpiryStatus(String(raw || ''));
                          const styles: Record<string, React.CSSProperties> = {
                            valid: { backgroundColor: '#f8fff9', borderLeft: '3px solid #28a745' },
                            warning: { backgroundColor: '#fffef7', borderLeft: '3px solid #ffc107' },
                            urgent: { backgroundColor: '#fff8f5', borderLeft: '3px solid #fd7e14' },
                            expired: { backgroundColor: '#fff5f5', borderLeft: '3px solid #dc3545' },
                            none: { backgroundColor: '#f8f9fa', borderLeft: '3px solid #6c757d' }
                          };
                          const style = styles[status] || styles.none;
                          return (
                            <div style={{ ...style, borderRadius: '4px', padding: '2px 6px', display: 'inline-block' }} title={description}>
                              {formatted || '-'}
                            </div>
                          );
                        })()}
                      </TableCell>
                    ) : (
                      <TableCell key={key}>{formatFieldValue(key, vehicle[key])}</TableCell>
                    )
                  ))}
                  <TableCell style={{ width: '92px' }}>
                    <ActionButtons>
                      <ActionButton $variant="edit" onClick={() => handleEdit(vehicle)}>Edit</ActionButton>
                      <ActionButton $variant="delete" onClick={() => handleDelete(vehicle.id, `${vehicle.vehicle_callsign || vehicle.call_sign_name || vehicle.veh_call_sign || vehicle.vehicle_name} (${vehicle.vehicle_type || ''})`)}>Delete</ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}

        {pendingDelete && (
          <ModalBackdrop role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <ModalContent>
              <ModalTitle id="delete-modal-title">Confirm Delete</ModalTitle>
              <ModalBody>
                Are you sure you want to delete vehicle: <strong>{pendingDelete.info}</strong>?
              </ModalBody>
              <ModalActions>
                <ModalButton $variant="cancel" onClick={cancelDelete} disabled={isDeleting}>Cancel</ModalButton>
                <ModalButton $variant="delete" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </ModalButton>
              </ModalActions>
            </ModalContent>
          </ModalBackdrop>
        )}

        {!vehiclesLoading && vehicles.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057', fontWeight: '600' }}>
              Gate Pass Expiry Status Legend:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#f8fff9', borderLeft: '3px solid #28a745', borderRadius: '2px' }}></div>
                <span><strong>Valid:</strong> More than 30 days remaining</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#fffef7', borderLeft: '3px solid #ffc107', borderRadius: '2px' }}></div>
                <span><strong>Soon:</strong> 8-30 days remaining</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#fff8f5', borderLeft: '3px solid #fd7e14', borderRadius: '2px' }}></div>
                <span><strong>Urgent:</strong> 1-7 days remaining</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#fff5f5', borderLeft: '3px solid #dc3545', borderRadius: '2px' }}></div>
                <span><strong>Expired:</strong> Past expiry date</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#f8f9fa', borderLeft: '3px solid #6c757d', borderRadius: '2px' }}></div>
                <span><strong>No Date:</strong> No expiry date set</span>
              </div>
            </div>
          </div>
        )}
      </VehicleListSection>
    </MainContent>
  );
};

// Named export is declared above; no additional export needed
