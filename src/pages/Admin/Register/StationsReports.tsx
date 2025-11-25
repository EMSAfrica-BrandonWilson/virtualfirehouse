import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, cleanupTrailingBlankPages, applyFinalPageNumbers } from '../../../utils/pdfReportHelper';
import { initializePDFFontsSync } from '../../../utils/pdfFonts';
import { getPDFLogo } from '../../../utils/companyLogo';

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

const InfoBox = styled.div`
  background: #f8f9fa;
  border: 2px solid #1177BB;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.6;
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
const ImageColumn = styled.div`
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
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
const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;
const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;
const StationTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
  th { background-color: #1177BB; color: white; font-weight: 600; }
  tr:hover { background-color: #f5f5f5; }
`;
const RefreshButton = styled.button`
  background-color: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; margin-left: 10px;
`;
const PrintButton = styled.button`
  background-color: #FF9900; color: white; padding: 8px 16px; border: none; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; margin-left: 10px;
`;
const DeleteButton = styled.button`
  background-color: #dc3545; color: white; padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;
`;
const EditButton = styled.button`
  background-color: #ffc107; color: #212529; padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; margin-right: 6px;
`;
const CancelButton = styled.button`
  background-color: #6c757d; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;
`;

export const StationsReports: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<any[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<any | null>(null);

  const loadStations = async () => {
    setStationsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd3_stations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStations(data || []);
    } catch (err: any) {
      console.error('Failed to load stations:', err);
      setError(err.message || 'Failed to load stations');
    } finally {
      setStationsLoading(false);
    }
  };

  const deleteStation = async (stationId: number, stationName: string) => {
    setDeletingIds(prev => new Set(prev).add(stationId));
    try {
      const { error } = await supabase
        .from('02_admin_register_fd3_stations')
        .delete()
        .eq('id', stationId);
      if (error) throw new Error(error.message || 'Failed to delete fire station');
      setSuccess('Fire station deleted successfully!');
      await loadStations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete fire station');
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(stationId); return s; });
    }
  };

  useEffect(() => { loadStations(); }, []);

  const generatePDF = async () => {
    if (stations.length === 0) {
      setError('No fire stations to print.');
      return;
    }
    try {
      setError('');
      const doc = new jsPDF('portrait');
      try { initializePDFFontsSync(doc); } catch {}

      const departmentName = 'All Fire Departments';
      const departmentType = '';
      const departmentLogoBase64 = await getPDFLogo(undefined);
      const totalStaff = stations.reduce((sum, s) => sum + (s.number_of_station_staff || 0), 0);
      const totalVehicles = stations.reduce((sum, s) => sum + (s.number_of_station_vehicles || 0), 0);
      const summaryText = `Summary: Total Fire Stations: ${stations.length}, Total Staff Allocated: ${totalStaff}, Total Vehicles Allocated: ${totalVehicles}`;

      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogoBase64,
        data: {
          departmentName,
          departmentType,
          reportTitle: 'Registered Fire Stations Report',
          summaryText,
          currentUser: undefined
        }
      });

      const sorted = [...stations].sort((a, b) => (a.fire_station_name || '').localeCompare(b.fire_station_name || ''));
      const head = [[
        'Station Name','City','Address','Staff','Vehicles','Phone','Contact','Email','Telephone'
      ]];
      const body = sorted.map(station => [
        station.fire_station_name || '-',
        station.fire_station_city || '-',
        [
          station.fire_station_suburb || '',
          [station.fire_station_building_number || '', station.fire_station_street_name || ''].filter(Boolean).join(' ')
        ].filter(Boolean).join('\n') || '-',
        (station.number_of_station_staff || 0).toString(),
        (station.number_of_station_vehicles || 0).toString(),
        station.fire_station_telephone || '-',
        [station.fire_station_contact_name || '', station.fire_station_contact_rank || ''].filter(Boolean).join('\n') || '-',
        station.fire_station_contact_email || '-',
        station.fire_station_contact_telephone || '-'
      ]);

      autoTable(doc, { head, body, startY: vfhSetup.tableStartY, ...vfhSetup.tableConfig });
      cleanupTrailingBlankPages(doc);
      applyFinalPageNumbers(doc, { departmentName, departmentType, reportTitle: 'Registered Fire Stations Report', summaryText, currentUser: undefined });

      const pdfDataUri = doc.output('datauristring');
      const timestamp = Date.now();
      const pdfKey = `pdf_Registered_Fire_Stations_${timestamp}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      sessionStorage.setItem('pdf_source_section', '/admin/register/stations/reports');
      sessionStorage.setItem('pdf_source_path', '/admin/register/stations/reports');
      navigate(`/pdf-viewer/${pdfKey}`);
      setSuccess('PDF report generated successfully! Opening in viewer...');
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    }
  };

  return (
    <MainContent aria-label="Main content">
      <FlexRow>
        <Column style={{ flex: '1', minWidth: '0' }}>
          <Title>Registered Fire Stations</Title>
          <Divider aria-hidden="true" />
          <Paragraph>
            This page displays the directory of all registered fire stations. Use the Print to PDF button to export the current list to a standardized report and the Refresh button to reload the latest data. You can also edit a station or remove it where necessary.
          </Paragraph>
        </Column>
        <ImageColumn>
          <HeaderImage src="/images/FireStation2.jpg" alt="Station Registration" />
        </ImageColumn>
      </FlexRow>
      {error && (
        <InfoBox><InfoText style={{ color: '#c33' }}>{error}</InfoText></InfoBox>
      )}
      {success && (
        <InfoBox><InfoText style={{ color: '#363' }}>{success}</InfoText></InfoBox>
      )}

      {stations.length > 0 ? (
        <StationTable>
          <thead>
            <tr>
              <th>Station Name</th>
              <th>City</th>
              <th>Address</th>
              <th>Staff</th>
              <th>Vehicles</th>
              <th>Contact</th>
              <th>Contact Email</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...stations]
              .sort((a, b) => (a.fire_station_name || '').localeCompare(b.fire_station_name || ''))
              .map(station => (
              <tr key={station.id}>
                <td><strong>{station.fire_station_name}</strong></td>
                <td>{station.fire_station_city || '-'}</td>
                <td>
                  {station.fire_station_building_number && station.fire_station_street_name ? (
                    <>
                      {station.fire_station_building_number} {station.fire_station_street_name}<br />
                      <small>{station.fire_station_suburb || '-'}</small>
                    </>
                  ) : (
                    <small>-</small>
                  )}
                </td>
                <td><strong>{station.number_of_station_staff || 0}</strong></td>
                <td><strong>{station.number_of_station_vehicles || 0}</strong></td>
                <td>
                  {station.fire_station_contact_name ? (
                    <>
                      {station.fire_station_contact_name}<br />
                      {station.fire_station_contact_rank && <small>{station.fire_station_contact_rank}</small>}<br />
                      {station.fire_station_contact_telephone && <small>{station.fire_station_contact_telephone}</small>}
                    </>
                  ) : (
                    <small>-</small>
                  )}
                </td>
                <td>{station.fire_station_contact_email || '-'}</td>
                <td><small>{new Date(station.created_at).toLocaleDateString()}</small></td>
                <td>
                  <EditButton onClick={() => { sessionStorage.setItem('editing_station', JSON.stringify(station)); navigate('/admin/register/stations/process'); }}>
                    Edit
                  </EditButton>
                  <DeleteButton onClick={() => { setStationToDelete(station); setShowDeleteModal(true); }} disabled={deletingIds.has(station.id)}>
                    {deletingIds.has(station.id) ? 'Deleting...' : 'Delete'}
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </StationTable>
      ) : (
        <InfoBox>
          <InfoText>
            {stationsLoading ? 'Loading fire stations...' : 'No fire stations registered yet.'}
          </InfoText>
        </InfoBox>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '15px' }}>
        <PrintButton onClick={generatePDF} disabled={stations.length === 0}>Print to PDF</PrintButton>
        <RefreshButton onClick={loadStations} disabled={stationsLoading}>
          {stationsLoading ? 'Loading...' : 'Refresh List'}
        </RefreshButton>
      </div>

      {showDeleteModal && stationToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ background: '#fff', borderRadius: '10px', width: '92%', maxWidth: '560px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '22px' }}>
            <div style={{ color: '#1177BB', fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>Delete Fire Station</div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              Are you sure you want to delete "{stationToDelete.fire_station_name}"?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <DeleteButton onClick={() => { setShowDeleteModal(false); deleteStation(stationToDelete.id, stationToDelete.fire_station_name); }}>Delete</DeleteButton>
              <CancelButton onClick={() => setShowDeleteModal(false)}>Cancel</CancelButton>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
};
