import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTimeReadable } from '../../lib/utils';
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
const ConfirmText = styled.span` font-size: 125%; letter-spacing: 1.25px; line-height: 25px; `;
const SmallInfo = styled.div` font-size: 125%; letter-spacing: 1.25px; line-height: 25px; color: #1177BB; margin-left: 28px; font-weight: 700; `;


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

const ConfirmModalOverlay = styled.div<{ $open: boolean }>`
  display: ${p => p.$open ? 'flex' : 'none'};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

const ConfirmModalBox = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  max-width: 520px;
  width: 92%;
  text-align: left;
  border-left: 5px solid #1177BB;
`;

const ConfirmModalTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #1177BB;
  font-size: 1.4rem;
  font-weight: 700;
`;

const ConfirmModalText = styled.p`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.05rem;
  line-height: 1.6;
`;

const ConfirmModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  background-color: #1177BB;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  &:hover { background-color: #1a86cc; }
`;

const CancelButton = styled.button`
  background-color: #e9ecef;
  color: #212529;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  &:hover { background-color: #dee2e6; }
`;

const TopControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
`;

const WidgetContainer = styled.div`
  margin-top: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
`;

const ActionRow = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
`;

export const IncidentRecordLockStatus: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-record-lock-status', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [dispatcherConfirm, setDispatcherConfirm] = useState(false);
  const [oicConfirm, setOicConfirm] = useState(false);
  const [adminConfirm, setAdminConfirm] = useState(false);
  const [dispatcherMeta, setDispatcherMeta] = useState('');
  const [adminMeta, setAdminMeta] = useState('');
  const [oicMeta, setOicMeta] = useState('');
  const [dispatcherDisabled, setDispatcherDisabled] = useState(false);
  const [oicDisabled, setOicDisabled] = useState(true);
  const [adminDisabled, setAdminDisabled] = useState(true);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [showDispatcherConfirm, setShowDispatcherConfirm] = useState(false);
  const [showOicConfirm, setShowOicConfirm] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [dispatcherBy, setDispatcherBy] = useState('');
  const [dispatcherAt, setDispatcherAt] = useState('');
  const [oicBy, setOicBy] = useState('');
  const [oicAt, setOicAt] = useState('');
  const [adminBy, setAdminBy] = useState('');
  const [adminAt, setAdminAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { getDisplayName } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  const storageKey = incidentNumber ? `vfh_lock_status_${incidentNumber}` : '';
  const savePageState = () => {
    if (!storageKey) return;
    const snapshot = {
      incidentNumber,
      dispatcherConfirm,
      oicConfirm,
      adminConfirm,
      dispatcherMeta,
      oicMeta,
      adminMeta,
      dispatcherDisabled,
      oicDisabled,
      adminDisabled,
      saveDisabled,
      dispatcherBy,
      dispatcherAt,
      oicBy,
      oicAt,
      adminBy,
      adminAt
    };
    try { localStorage.setItem(storageKey, JSON.stringify(snapshot)); } catch {}
  };
  const loadPageState = () => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw || '{}');
        setIncidentNumber(s.incidentNumber ?? incidentNumber);
        setDispatcherConfirm(!!s.dispatcherConfirm);
        setOicConfirm(!!s.oicConfirm);
        setAdminConfirm(!!s.adminConfirm);
        setDispatcherMeta(s.dispatcherMeta ?? '');
        setOicMeta(s.oicMeta ?? '');
        setAdminMeta(s.adminMeta ?? '');
        setDispatcherDisabled(!!s.dispatcherDisabled);
        setOicDisabled(!!s.oicDisabled);
        setAdminDisabled(!!s.adminDisabled);
        setSaveDisabled(!!s.saveDisabled);
        setDispatcherBy(s.dispatcherBy ?? '');
        setDispatcherAt(s.dispatcherAt ?? '');
        setOicBy(s.oicBy ?? '');
        setOicAt(s.oicAt ?? '');
        setAdminBy(s.adminBy ?? '');
        setAdminAt(s.adminAt ?? '');
      }
    } catch {}
  };
  useEffect(() => {
    if (!incidentNumber) return;
    loadPageState();
    (async () => {
      try {
        const { data, error } = await supabase
          .from('03_ecc_03_13_Record_Lock_Status')
          .select('*')
          .eq('incident_number', incidentNumber)
          .maybeSingle();
        if (!error && data) {
          setDispatcherConfirm(!!data.dispatcher_confirmed);
          setOicConfirm(!!data.oic_confirmed);
          setAdminConfirm(!!data.admin_confirmed);
          setDispatcherMeta(data.dispatcher_confirmed_by && data.dispatcher_confirmed_at
            ? `Incident completion confirmed by ${data.dispatcher_confirmed_by} on ${formatDateTimeReadable(data.dispatcher_confirmed_at)}`
            : '');
          setOicMeta(data.oic_confirmed_by && data.oic_confirmed_at
            ? `OIC, ${data.oic_confirmed_by}, confirm that the incident is ready for reconciliation, ${formatDateTimeReadable(data.oic_confirmed_at)}.`
            : '');
          setAdminMeta(data.admin_confirmed_by && data.admin_confirmed_at
            ? `Admin Officer, ${data.admin_confirmed_by}, confirm that the incident had been reconcilled and will now be archived, ${formatDateTimeReadable(data.admin_confirmed_at)}`
            : '');
          setDispatcherDisabled(!!data.dispatcher_confirmed);
          setOicDisabled(!data.dispatcher_confirmed ? true : !!data.oic_confirmed);
          setAdminDisabled(!data.oic_confirmed ? true : !!data.admin_confirmed);
          setSaveDisabled(!data.admin_confirmed);
          setDispatcherBy(data.dispatcher_confirmed_by || '');
          setDispatcherAt(data.dispatcher_confirmed_at || '');
          setOicBy(data.oic_confirmed_by || '');
          setOicAt(data.oic_confirmed_at || '');
          setAdminBy(data.admin_confirmed_by || '');
          setAdminAt(data.admin_confirmed_at || '');
          savePageState();
        }
      } catch {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentNumber]);
  const handleSaveRecord = async () => {
    if (saving) return;
    if (!incidentNumber) {
      setSaveError('No incident number found. Cannot save.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        incident_number: incidentNumber,
        dispatcher_confirmed: dispatcherDisabled,
        dispatcher_confirmed_by: dispatcherBy || null,
        dispatcher_confirmed_at: dispatcherAt || null,
        oic_confirmed: oicDisabled,
        oic_confirmed_by: oicBy || null,
        oic_confirmed_at: oicAt || null,
        admin_confirmed: adminDisabled,
        admin_confirmed_by: adminBy || null,
        admin_confirmed_at: adminAt || null,
        updated_at: new Date().toISOString()
      } as any;
      const { error } = await supabase
        .from('03_ecc_03_13_Record_Lock_Status')
        .upsert(payload, { onConflict: 'incident_number' })
        .select()
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      navigate('/control/emergency-incident-logging/report');
    } catch (e: any) {
      console.error('Save error:', e);
      setSaveError(e?.message || 'Failed to save record lock status');
    } finally {
      setSaving(false);
    }
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="lock-status-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="lock-status-title">Record Lock Status</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                This page completes the incident record through three confirmations. The Dispatcher marks the incident as complete, the Officer In Charge confirms it is ready for reconciliation, and the Admin verifies reconciliation and archival. When all confirmations are captured, use the Save action to continue to the Incident Report for final review.
              </Paragraph>
              {saveError && (
                <div style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>
                  Error: {saveError}
                </div>
              )}
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Record Lock Status" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <TopControlsRow>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </TopControlsRow>

          <WidgetContainer>
            <div role="group" aria-label="Record lock confirmations" style={{ display: 'grid', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={dispatcherConfirm}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      setDispatcherConfirm(true);
                      setShowDispatcherConfirm(true);
                    } else {
                      setDispatcherConfirm(false);
                      setDispatcherMeta('');
                    }
                  }}
                  disabled={dispatcherDisabled}
                  style={{ width: '20px', height: '20px' }}
                />
                <ConfirmText>Dispatcher confirm the incident is complete and ready to be finilished by the Officer In Charge:</ConfirmText>
              </label>
              {dispatcherConfirm && (
                <SmallInfo>
                  <strong>{dispatcherMeta}</strong>
                </SmallInfo>
              )}
              <Divider style={{ margin: '10px 0', borderColor: '#eee', borderWidth: '1px' }} />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <input
                   type="checkbox"
                   checked={oicConfirm}
                   onChange={(e) => {
                     const checked = e.target.checked;
                     if (checked) {
                       setOicConfirm(true);
                       setShowOicConfirm(true);
                     } else {
                       setOicConfirm(false);
                       setOicMeta('');
                     }
                   }}
                   disabled={oicDisabled}
                   style={{ width: '20px', height: '20px' }}
                 />
                 <ConfirmText>Officer In Charge confirm that the incident is complete and ready for reconciling:</ConfirmText>
               </label>
              {oicConfirm && (
                <SmallInfo>
                  <strong>{oicMeta}</strong>
                </SmallInfo>
              )}
              <Divider style={{ margin: '10px 0', borderColor: '#eee', borderWidth: '1px' }} />

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <input
                   type="checkbox"
                   checked={adminConfirm}
                   onChange={(e) => {
                     const checked = e.target.checked;
                     if (checked) {
                       setAdminConfirm(true);
                       setShowAdminConfirm(true);
                     } else {
                       setAdminConfirm(false);
                       setAdminMeta('');
                     }
                   }}
                   disabled={adminDisabled}
                   style={{ width: '20px', height: '20px' }}
                 />
                 <ConfirmText>Administrative Assistant/Officer confirm that the incident has been reconcilled and is now archived.</ConfirmText>
               </label>
              {adminConfirm && (
                <SmallInfo>
                  <strong>{adminMeta}</strong>
                </SmallInfo>
              )}
            </div>
          </WidgetContainer>

          <ActionRow>
            <ActionButton
              onClick={handleSaveRecord}
              disabled={saveDisabled}
            >
              Save & Continue to the Incident Report
            </ActionButton>
          </ActionRow>
          
        </div>
      </Section>
      <ConfirmModalOverlay $open={showDispatcherConfirm}>
        <ConfirmModalBox>
          <ConfirmModalTitle>Confirm Incident Completion</ConfirmModalTitle>
          <ConfirmModalText>
            Please confirm that the incident is complete and ready to be finished by the Officer In Charge.
          </ConfirmModalText>
          <ConfirmModalActions>
            <CancelButton
              onClick={() => {
                setShowDispatcherConfirm(false);
                setDispatcherConfirm(false);
                savePageState();
              }}
            >
              Cancel
            </CancelButton>
            <ConfirmButton
              onClick={() => {
                setDispatcherMeta(`Incident completion confirmed by ${getDisplayName()} on ${formatDateTimeReadable(new Date())}`);
                setDispatcherBy(getDisplayName());
                setDispatcherAt(new Date().toISOString());
                setDispatcherDisabled(true);
                setOicDisabled(false);
                setShowDispatcherConfirm(false);
                savePageState();
              }}
            >
              Confirm
            </ConfirmButton>
          </ConfirmModalActions>
        </ConfirmModalBox>
      </ConfirmModalOverlay>
      <ConfirmModalOverlay $open={showOicConfirm}>
        <ConfirmModalBox>
          <ConfirmModalTitle>Confirm OIC Reconciliation Readiness</ConfirmModalTitle>
          <ConfirmModalText>
            Please confirm that the incident is now completed and ready for reconciling.
          </ConfirmModalText>
          <ConfirmModalActions>
            <CancelButton
              onClick={() => {
                setShowOicConfirm(false);
                setOicConfirm(false);
                savePageState();
              }}
            >
              Cancel
            </CancelButton>
            <ConfirmButton
              onClick={() => {
                setOicMeta(`OIC, ${getDisplayName()}, confirm that the incident is ready for reconciliation, ${formatDateTimeReadable(new Date())}.`);
                setOicBy(getDisplayName());
                setOicAt(new Date().toISOString());
                setOicDisabled(true);
                setAdminDisabled(false);
                setShowOicConfirm(false);
                savePageState();
              }}
            >
              Confirm
            </ConfirmButton>
          </ConfirmModalActions>
        </ConfirmModalBox>
      </ConfirmModalOverlay>
      <ConfirmModalOverlay $open={showAdminConfirm}>
        <ConfirmModalBox>
          <ConfirmModalTitle>Confirm Admin Archival</ConfirmModalTitle>
          <ConfirmModalText>
            Please confirm that the incident had been reconcilled and will now be archived.
          </ConfirmModalText>
          <ConfirmModalActions>
            <CancelButton
              onClick={() => {
                setShowAdminConfirm(false);
                setAdminConfirm(false);
                savePageState();
              }}
            >
              Cancel
            </CancelButton>
            <ConfirmButton
              onClick={() => {
                setAdminMeta(`Admin Officer, ${getDisplayName()}, confirm that the incident had been reconcilled and will now be archived, ${formatDateTimeReadable(new Date())}`);
                setAdminBy(getDisplayName());
                setAdminAt(new Date().toISOString());
                setAdminDisabled(true);
                setSaveDisabled(false);
                setShowAdminConfirm(false);
                savePageState();
              }}
            >
              Confirm
            </ConfirmButton>
          </ConfirmModalActions>
        </ConfirmModalBox>
      </ConfirmModalOverlay>
    </MainContent>
  );
};
