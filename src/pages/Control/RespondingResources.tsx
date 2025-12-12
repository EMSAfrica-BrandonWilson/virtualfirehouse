import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';

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
  @media (max-width: 768px) { flex-direction: column; }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '48%'};
  vertical-align: top;
  text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
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

const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #444;
  &.required::after { content: ' *'; color: #dc3545; }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FormGroupWide = styled(FormGroup)`
  grid-column: span 2;
`;

const FormGroupMedium = styled(FormGroup)`
  grid-column: span 2;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  &:focus { border-color: #1177BB; outline: none; }
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

const InlineFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  max-width: 1360px;
  margin: 12px auto 0;
  align-items: start;
  justify-items: stretch;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const RespondingResources: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('responding-resources', '/images/ControlRoom.png');
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [stationOptions, setStationOptions] = useState<{ id: string; name: string }[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<{ value: string; label: string; station: string }[]>([]);
  const [responding, setResponding] = useState<{ station_id: string; station_name: string; vehicle_value: string; vehicle_label: string; time?: string }[]>([]);
  const focusRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState(() => ({
    incidentNumber: localStorage.getItem('vfh_current_incident_number') || '',
    assignedStation: '',
    assignedVehicle: '',
    primaryResource: '',
    secondaryResource: '',
    assignedStation2: '',
    assignedVehicle2: '',
    primaryResource2: '',
    secondaryResource2: '',
    assignedStation3: '',
    assignedVehicle3: '',
    primaryResource3: '',
    secondaryResource3: ''
  }));

  
  const filteredVehicleOptions = React.useMemo(() => {
    const selectedStation = stationOptions.find(s => s.id === form.assignedStation)?.name || '';
    if (!selectedStation) return vehicleOptions;
    const key = selectedStation.toString().trim().toLowerCase();
    return vehicleOptions.filter(v => (v.station || '').toString().trim().toLowerCase() === key);
  }, [vehicleOptions, stationOptions, form.assignedStation]);

  const storageVehiclesKey = (inc: string) => `vfh_responding_vehicles:${inc}`;

  const getTimeStr = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    const loadDispatchedStations = async () => {
      const inc = localStorage.getItem('vfh_current_incident_number') || form.incidentNumber || '';
      if (!inc) { setStationOptions([]); return; }
      try {
        const saved = localStorage.getItem(`vfh_dispatched_stations:${inc}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const opts = parsed.map((d: any) => ({ id: String(d.id || ''), name: String(d.name || '') })).filter(o => o.id && o.name);
            setStationOptions(opts);
            return;
          }
        }
      } catch {}
      try {
        const { data } = await supabase
          .from('03_ecc_03_02_Incident_Call_Dispatching')
          .select('dispatched_stations')
          .eq('incident_number', inc)
          .limit(1);
        const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
        const list = row && Array.isArray(row.dispatched_stations) ? row.dispatched_stations : [];
        const opts = list.map((x: any) => ({ id: String(x.station_id || ''), name: String(x.station_name || '') })).filter(o => o.id && o.name);
        setStationOptions(opts);
      } catch {
        setStationOptions([]);
      }
    };
    loadDispatchedStations();
  }, [form.incidentNumber]);

  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || form.incidentNumber || '';
    if (!inc) return;
    try {
      const saved = localStorage.getItem(storageVehiclesKey(inc));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setResponding(parsed);
      }
    } catch {}
  }, [form.incidentNumber]);

  useEffect(() => {
    const loadInServiceVehicles = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('03_ecc_02_duty_roster_01_station_assignments')
          .select('call_sign, vehicle_type, status, station_assignment')
          .eq('assignment_date', today)
          .eq('status', 'In Service')
          .order('call_sign', { ascending: true });
        const rows = Array.isArray(data) ? data : [];
        const deduped = rows.filter((item, idx, arr) => {
          const key = (item.call_sign || '').toString().trim().toUpperCase();
          return arr.findIndex(x => (x.call_sign || '').toString().trim().toUpperCase() === key) === idx;
        });
        setVehicleOptions(deduped.map((r: any) => ({
          value: String(r.call_sign || ''),
          label: `${r.call_sign || ''} ${r.vehicle_type || ''}`.trim(),
          station: String(r.station_assignment || '')
        })));
      } catch {
        setVehicleOptions([]);
      }
    };
    loadInServiceVehicles();
  }, []);

  useEffect(() => {
    const carried = localStorage.getItem('vfh_current_incident_number');
    if (carried) setForm(prev => ({ ...prev, incidentNumber: carried }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value } as any;
      if (name === 'assignedStation') next.assignedVehicle = '';
      return next;
    });
  };

  const getSelectedStationIds = (): Set<string> => {
    return new Set([
      form.assignedStation,
      form.assignedStation2,
      form.assignedStation3
    ].filter(Boolean) as string[]);
  };

  const getSelectedVehicleValues = (): Set<string> => {
    const existing = responding.map(r => r.vehicle_value);
    return new Set([form.assignedVehicle, ...existing].filter(Boolean) as string[]);
  };

  const addRespondingVehicle = () => {
    const inc = localStorage.getItem('vfh_current_incident_number') || form.incidentNumber || '';
    if (!inc || !form.assignedStation || !form.assignedVehicle) return;
    const station = stationOptions.find(s => s.id === form.assignedStation);
    const vehicle = vehicleOptions.find(v => v.value === form.assignedVehicle);
    if (!station || !vehicle) return;
    const exists = responding.some(r => r.vehicle_value === vehicle.value);
    if (exists) return;
    const entry = {
      station_id: station.id,
      station_name: station.name,
      vehicle_value: vehicle.value,
      vehicle_label: vehicle.label,
      time: getTimeStr()
    };
    const next = [...responding, entry];
    setResponding(next);
    try { localStorage.setItem(storageVehiclesKey(inc), JSON.stringify(next)); } catch {}
    setForm(prev => ({ ...prev, assignedVehicle: '' }));
  };

  const removeRespondingVehicle = (vehicleValue: string) => {
    const inc = localStorage.getItem('vfh_current_incident_number') || form.incidentNumber || '';
    const next = responding.filter(r => r.vehicle_value !== vehicleValue);
    setResponding(next);
    if (inc) {
      try { localStorage.setItem(storageVehiclesKey(inc), JSON.stringify(next)); } catch {}
    }
  };

  const onInitiate = () => {
    setIsActive(true);
    setTimeout(() => focusRef.current?.focus(), 0);
  };

  const onCancel = () => {
    setForm(prev => ({
      ...prev,
      assignedStation: '', assignedVehicle: '', primaryResource: '', secondaryResource: '',
      assignedStation2: '', assignedVehicle2: '', primaryResource2: '', secondaryResource2: '',
      assignedStation3: '', assignedVehicle3: '', primaryResource3: '', secondaryResource3: ''
    }));
    setIsActive(false);
  };

  const onDispatch = async () => {
    const inc = localStorage.getItem('vfh_current_incident_number') || form.incidentNumber || '';
    if (!inc || responding.length === 0) return;
    const payload = {
      incident_number: inc,
      responding_vehicles: responding
    } as any;
    try {
      const { error } = await supabase
        .from('03_ecc_03_03_Responding_Resources')
        .upsert([payload], { onConflict: 'incident_number' });
      if (error) {
        alert(`Failed to save responding resources: ${error.message}`);
        return;
      }
      navigate('/control/emergency-incident-logging/narrative');
    } catch (e: any) {
      alert(`Unexpected error saving resources: ${e?.message || e}`);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="resources-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="resources-title">Responding Resources</Title>
              <Divider aria-hidden="true" />
              
              <Paragraph>
                Allocate responding stations and vehicles for the active incident. Initiate resources to enable selection fields and enforce unique assignments across dropdowns.
              </Paragraph>
              

            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Responding Resources" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={form.incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PrimaryButton onClick={onInitiate}>Initiate Resources</PrimaryButton>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroupWide>
                <Label htmlFor="assignedStation">Responding Fire Station/s</Label>
                <Select id="assignedStation" name="assignedStation" value={form.assignedStation} onChange={handleChange} disabled={!isActive}>
                  <option value="">Select a fire station...</option>
                  {stationOptions.map(st => {
                    const selected = getSelectedStationIds();
                    const isDisabled = selected.has(st.id) && form.assignedStation !== st.id;
                    return (
                      <option key={st.id} value={st.id} disabled={isDisabled}>{st.name}</option>
                    );
                  })}
                </Select>
              </FormGroupWide>
              <FormGroupWide>
                <Label htmlFor="assignedVehicle">Responding Fire Vehicle/s</Label>
                <Select id="assignedVehicle" name="assignedVehicle" value={form.assignedVehicle} onChange={handleChange} disabled={!isActive}>
                  <option value="">Select vehicle...</option>
                  {filteredVehicleOptions.map(v => {
                    const selected = getSelectedVehicleValues();
                    const isDisabled = selected.has(v.value) && form.assignedVehicle !== v.value;
                    return (
                      <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                    );
                  })}
                </Select>
              </FormGroupWide>
              <FormGroup>
                <Label>&nbsp;</Label>
                <DispatchButton type="button" onClick={addRespondingVehicle} disabled={!isActive || !form.assignedStation || !form.assignedVehicle}>Add Responding Vehicle</DispatchButton>
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Section>
              <h3 style={{ color: '#1177BB', margin: '0 0 10px' }}>Responding Vehicles</h3>
              {responding.length === 0 ? (
                <p style={{ color: '#666' }}>No responding vehicles added yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {responding.map(rv => (
                    <li key={rv.vehicle_value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee' }}>
                      <span><strong>{rv.vehicle_label}</strong> — from {rv.station_name}{rv.time ? ` at ${rv.time}` : ''}</span>
                      <CancelButton type="button" onClick={() => removeRespondingVehicle(rv.vehicle_value)} disabled={!isActive}>Remove</CancelButton>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </div>
      </Section>

      <ButtonRow>
        <DispatchButton onClick={onDispatch} disabled={!isActive || responding.length === 0}>Save & Continue to Incident Narrative</DispatchButton>
      </ButtonRow>
    </MainContent>
  );
};
