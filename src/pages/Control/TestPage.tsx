import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';

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

const ButtonRow = styled.div`
  display: flex; gap: 12px; justify-content: flex-start; margin-top: 16px;
`;
const ActionButton = styled.button`
  padding: 10px 18px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; background-color: #1177BB; color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #1a86cc; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const InlineFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1360px;
  margin: 12px 0 0;
  align-items: start;
  justify-items: stretch;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #444;
  &.required::after { content: ' *'; color: #dc3545; }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  background-color: white;
  &:focus { border-color: #1177BB; outline: none; }
`;

const EmergencyButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #dc3545;
  color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #c82333; }
  &:active { transform: translateY(1px); }
`;

const CancelButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #6c757d;
  color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #5a6268; }
  &:active { transform: translateY(1px); }
`;

const DispatchButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #FF9900;
  color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #FFB533; }
  &:active { transform: translateY(1px); }
`;

const PrimaryButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #dc3545;
  color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #c82333; }
  &:active { transform: translateY(1px); }
`;

const FormGroupWide = styled(FormGroup)`
  grid-column: span 2;
`;

export const TestPage: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('test-page', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  const [ctForm, setCtForm] = useState({
    shiftOnDuty: '',
    callTaker: '',
    incidentDate: '',
    incidentTime: '',
    callName: '',
    callerNumber: '',
    secondCaller: '',
    secondCallerNumber: '',
    incidentCategory: '',
    incidentSubCategory: '',
    streetNo: '',
    streetName: '',
    suburb: ''
  });
  const onCtChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCtForm(prev => ({ ...prev, [name]: value }));
  };
  const [isActive, setIsActive] = useState(false);
  const [dispatcherOptions, setDispatcherOptions] = useState<{ staff_id: string; full_name: string }[]>([]);
  const [stationOptions, setStationOptions] = useState<{ id: string; name: string }[]>([]);
  const [dispatched, setDispatched] = useState<Array<{ id: string; name: string; time: string }>>([]);
  const [form, setForm] = useState({
    shiftOnDuty: '',
    dispatcher: '',
    dispatchDate: '',
    dispatchTime: '',
    incidentNumber: '',
    assignedStation: '',
    assignedVehicle: ''
  });
  useEffect(() => {
    setForm(prev => ({ ...prev, incidentNumber }));
  }, [incidentNumber]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, middle_name, last_name, rank_id')
        .in('rank_id', [6, '6'])
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });
      const rows = Array.isArray(data) ? data : [];
      const opts = rows.map((r: any) => ({
        staff_id: String(r?.staff_id ?? ''),
        full_name: [r?.first_name, r?.middle_name, r?.last_name].filter(Boolean).join(' ').trim()
      })).filter(o => o.staff_id && o.full_name);
      setDispatcherOptions(opts);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('02_admin_register_fd3_stations')
        .select('id, fire_station_name')
        .order('fire_station_name', { ascending: true });
      const rows = Array.isArray(data) ? data : [];
      setStationOptions(rows.map((r: any) => ({ id: String(r.id), name: r.fire_station_name })));
    })();
  }, []);
  const getTimeStr = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next: any = { ...prev, [name]: value };
      if (name === 'assignedStation') next.assignedVehicle = getTimeStr();
      if (name === 'shiftOnDuty') localStorage.setItem('vfh_shift_on_duty', value);
      if (name === 'dispatcher') {
        localStorage.setItem('vfh_dispatcher_id', value);
        localStorage.setItem('vfh_dispatcher_user_override', '1');
      }
      return next;
    });
  };
  const addDispatch = () => {
    if (!form.assignedStation || !form.assignedVehicle) return;
    const exists = dispatched.some(d => d.id === form.assignedStation);
    if (exists) return;
    const station = stationOptions.find(s => s.id === form.assignedStation);
    const name = station?.name || form.assignedStation;
    setDispatched(prev => [...prev, { id: form.assignedStation, name, time: form.assignedVehicle }]);
    setForm(prev => ({ ...prev, assignedStation: '', assignedVehicle: '' }));
  };
  const removeDispatch = (id: string) => {
    setDispatched(prev => prev.filter(d => d.id !== id));
  };
  const onInitiate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const timeStr = getTimeStr();
    setForm(prev => ({ ...prev, dispatchDate: dateStr, dispatchTime: timeStr, incidentNumber: incidentNumber }));
    setIsActive(true);
  };
  const onDispatch = async () => {
    const payload: any = {
      incident_number: form.incidentNumber,
      dispatch_date: form.dispatchDate,
      dispatch_time: form.dispatchTime,
      dispatcher_id: form.dispatcher || null,
      dispatched_stations: dispatched.map(d => ({ station_id: d.id, station_name: d.name, dispatched_time: d.time }))
    };
    try {
      const { error } = await supabase
        .from('03_ecc_03_02_Incident_Call_Dispatching')
        .upsert([payload], { onConflict: 'incident_number' });
      if (error) { alert(`Failed to save dispatching: ${error.message}`); return; }
      navigate('/control/emergency-incident-logging/resources');
    } catch (e: any) {
      alert(`Unexpected error: ${e?.message || e}`);
    }
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="test-page-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="test-page-title">Test page</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Coordinate and record dispatch actions for emergency incidents, including resource assignment, timing, and category classification. Initiate a dispatch to activate the input fields and capture operational details.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Test page" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <EmergencyButton>Initiate a New Emergency Incident</EmergencyButton>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="shiftOnDuty" className="required">Shift on Duty</Label>
                <Select id="shiftOnDuty" name="shiftOnDuty" value={ctForm.shiftOnDuty} onChange={onCtChange} required>
                  <option value="">Select Shift...</option>
                  <option value="Blue">Blue Shift</option>
                  <option value="Green">Green Shift</option>
                  <option value="Red">Red Shift</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="callTaker" className="required">Call Taker</Label>
                <Select id="callTaker" name="callTaker" value={ctForm.callTaker} onChange={onCtChange} required>
                  <option value="">Select Call Taker...</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="incidentDate" className="required">Incident Date</Label>
                <Input type="date" id="incidentDate" name="incidentDate" value={ctForm.incidentDate} onChange={onCtChange} required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="incidentTime" className="required">Incident Time</Label>
                <Input type="time" id="incidentTime" name="incidentTime" value={ctForm.incidentTime} onChange={onCtChange} required />
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="callName" className="required">Caller Name</Label>
                <Input id="callName" name="callName" value={ctForm.callName} onChange={onCtChange} required placeholder="Enter caller name" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="callerNumber" className="required">Caller Number</Label>
                <Input type="tel" id="callerNumber" name="callerNumber" value={ctForm.callerNumber} onChange={onCtChange} required placeholder="e.g., +966-XX-XXXXXXX" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="secondCaller">2nd Caller</Label>
                <Input id="secondCaller" name="secondCaller" value={ctForm.secondCaller} onChange={onCtChange} placeholder="Enter 2nd caller name" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="secondCallerNumber">2nd Caller Number</Label>
                <Input type="tel" id="secondCallerNumber" name="secondCallerNumber" value={ctForm.secondCallerNumber} onChange={onCtChange} placeholder="e.g., +966-XX-XXXXXXX" />
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="incidentCategory" className="required">Incident Category</Label>
                <Select id="incidentCategory" name="incidentCategory" value={ctForm.incidentCategory} onChange={onCtChange} required>
                  <option value="">Select Incident Category...</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Incident">Incident</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Training">Training</option>
                  <option value="Routine">Routine</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="incidentSubCategory">Incident Sub-Category</Label>
                <Select id="incidentSubCategory" name="incidentSubCategory" value={ctForm.incidentSubCategory} onChange={onCtChange}>
                  <option value="">Select Sub-Category...</option>
                  <option value="Fire">Fire</option>
                  <option value="Medical">Medical</option>
                  <option value="Rescue">Rescue</option>
                  <option value="HazMat">Hazardous Materials</option>
                  <option value="Other">Other</option>
                </Select>
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="streetNo">Street No</Label>
                <Input id="streetNo" name="streetNo" value={ctForm.streetNo} onChange={onCtChange} placeholder="e.g., 123" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="streetName" className="required">Street Name</Label>
                <Input id="streetName" name="streetName" value={ctForm.streetName} onChange={onCtChange} required placeholder="e.g., King Fahd Road" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="suburb" className="required">Suburb</Label>
                <Input id="suburb" name="suburb" value={ctForm.suburb} onChange={onCtChange} required placeholder="e.g., Dammam" />
              </FormGroup>
            </InlineFormGrid>
          </div>

          <ButtonRow>
            <CancelButton>Cancel Incident</CancelButton>
            <DispatchButton>Dispatch Incident</DispatchButton>
          </ButtonRow>
        </div>
      </Section>
    </MainContent>
  );
};
