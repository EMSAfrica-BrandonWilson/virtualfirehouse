import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;
const Section = styled.section` margin-bottom: 2rem;`;
const FlexRow = styled.div`
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;
const Column = styled.div<{ $width?: string }>`
  width: ${p => p.$width || '48%'}; vertical-align: top; text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
`;
const ImageColumn = styled.div`
  width: 240px; display: flex; justify-content: center; align-items: flex-start;
  @media (max-width: 768px) { width: 100% !important; justify-content: center; margin-top: 20px; }
`;
const Title = styled.h1` font-size: 2.2rem; color: #FF9900; font-weight: bold; margin-bottom: 10px;`;
const Divider = styled.hr` width: 100%; border: 5px solid #FF9900; border-radius: 3px; margin: 15px 0;`;
const Paragraph = styled.p` font-size: 125%; letter-spacing: 1.25px; line-height: 25px; text-align: justify; margin-bottom: 15px;`;
const HeaderImage = styled.img` width: 224px; height: auto; max-width: 224px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1);`;
const ImagePlaceholder = styled.div` width: 224px; height: 160px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; box-shadow: 0 2px 8px rgba(0,0,0,.1);`;
const Input = styled.input` width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; &:focus { border-color: #1177BB; outline: none; }`;

const AuditContainer = styled.div`
  margin-top: 16px;
  border: 2px solid #1177BB;
  border-radius: 8px;
  background: #f9fafb;
  padding: 12px;
`;

const AuditTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Th = styled.th`
  background-color: #1177BB;
  color: white;
  padding: 10px;
  text-align: left;
  font-size: 13px;
`;

const Td = styled.td`
  border-bottom: 1px solid #eee;
  padding: 10px;
  font-size: 13px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #1177BB;
  color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #1a86cc; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const IncidentRecordModificationHistory: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-record-mod-history', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [auditRows, setAuditRows] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    if (!inc) {
      setAuditRows([]);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('03_ecc_03_10_Incident_Audit_Log')
          .select('id,incident_number,action_type,page_name,description,performed_by,performed_at')
          .eq('incident_number', inc)
          .order('performed_at', { ascending: true });
        if (error) throw error;
        setAuditRows(Array.isArray(data) ? data : []);
      } catch {
        setAuditRows([]);
      }
    })();
    const ch = supabase
      .channel(`incident-audit-${inc}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: '03_ecc_03_10_Incident_Audit_Log', filter: `incident_number=eq.${inc}` }, payload => {
        const row: any = payload?.new || payload?.old;
        if (!row) return;
        if (payload.eventType === 'INSERT') {
          setAuditRows(prev => [...prev, row]);
        } else if (payload.eventType === 'DELETE') {
          setAuditRows(prev => prev.filter(r => r.id !== row.id));
        } else if (payload.eventType === 'UPDATE') {
          setAuditRows(prev => prev.map(r => (r.id === row.id ? row : r)));
        }
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(ch); } catch {}
    };
  }, [incidentNumber]);
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="history-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="history-title">Record Modification History</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Review the change history for this incident record. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Record Modification History" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <AuditContainer>
            <div style={{ color: '#1177BB', fontWeight: 700, marginBottom: '8px' }}>
              Incident Audit Log
            </div>
            {auditRows.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#666' }}>No audit entries recorded yet.</div>
            ) : (
              <AuditTable>
                <thead>
                  <tr>
                    <Th>Time</Th>
                    <Th>User</Th>
                    <Th>Action</Th>
                    <Th>Page</Th>
                    <Th>Details</Th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map(row => (
                    <tr key={row.id}>
                      <Td>{new Date(row.performed_at).toLocaleString()}</Td>
                      <Td>{row.performed_by || '—'}</Td>
                      <Td>{row.action_type || '—'}</Td>
                      <Td>{row.page_name || '—'}</Td>
                      <Td>{row.description || '—'}</Td>
                    </tr>
                  ))}
                </tbody>
              </AuditTable>
            )}
          </AuditContainer>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={() => navigate('/control/emergency-incident-logging/incident-report')}>Save & Continue to Incident Report</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
