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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1360px;
  margin: 12px auto 0;
  align-items: start;
  justify-items: stretch;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
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

export const IncidentCallDispatching: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('incident-call-dispatching', '/images/ControlRoom.png');
  const [isActive, setIsActive] = useState(false);
  const [dispatcherOptions, setDispatcherOptions] = useState<{ staff_id: string; full_name: string }[]>([]);
  const [stationOptions, setStationOptions] = useState<{ id: string; name: string }[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<{ value: string; label: string }[]>([]);
  const focusRef = useRef<HTMLInputElement | null>(null);
  const [dispatched, setDispatched] = useState<Array<{ id: string; name: string; time: string }>>([]);

  const [form, setForm] = useState(() => {
    const localShift = localStorage.getItem('vfh_shift_on_duty') || '';
    const localDispatcher = localStorage.getItem('vfh_dispatcher_id') || localStorage.getItem('vfh_call_taker_id') || '';
    return {
      shiftOnDuty: localShift,
      dispatcher: localDispatcher,
      dispatchDate: '',
      dispatchTime: '',
      incidentNumber: '',
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
      assignedStation4: '',
      assignedVehicle4: '',
      primaryResource3: '',
      secondaryResource3: '',
      incidentCategory: '',
      incidentSubCategory: '',
      streetNo: '',
      streetName: '',
      suburb: ''
    };
  });

  useEffect(() => {
    const loadDispatchers = async () => {
      const { data } = await supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, middle_name, last_name, rank_id')
        .in('rank_id', [6, '6'])
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });
      const rows = Array.isArray(data) ? data : [];
      const options = rows.map((r: any) => ({
        staff_id: String(r?.staff_id ?? ''),
        full_name: [r?.first_name, r?.middle_name, r?.last_name].filter(Boolean).join(' ').trim()
      })).filter(o => o.staff_id && o.full_name);
      setDispatcherOptions(options);
    };
    loadDispatchers();
  }, []);

  useEffect(() => {
    const loadStations = async () => {
      let defaultDeptId: number | null = null;
      const { data: deptData } = await supabase
        .from('02_admin_register_fd1_departments')
        .select('id, is_default')
        .eq('is_default', true)
        .limit(1);
      if (Array.isArray(deptData) && deptData.length > 0) {
        defaultDeptId = Number(deptData[0].id);
      }

      let query = supabase
        .from('02_admin_register_fd3_stations')
        .select('id, fire_station_name')
        .order('fire_station_name', { ascending: true });
      if (defaultDeptId) {
        query = query.eq('department_id', defaultDeptId);
      }
      const { data } = await query;
      const rows = Array.isArray(data) ? data : [];
      setStationOptions(rows.map((r: any) => ({ id: String(r.id), name: r.fire_station_name })));
    };
    loadStations();
  }, []);

  useEffect(() => {
    const loadInServiceVehicles = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('03_ecc_02_duty_roster_01_station_assignments')
          .select('call_sign, vehicle_type, status')
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
          label: `${r.call_sign || ''} ${r.vehicle_type || ''}`.trim()
        })));
      } catch {
        setVehicleOptions([]);
      }
    };
    loadInServiceVehicles();
  }, []);

  useEffect(() => {
    const carried = localStorage.getItem('vfh_current_incident_number');
    if (carried) {
      setForm(prev => ({ ...prev, incidentNumber: carried }));
    }
  }, []);

  useEffect(() => {
    const persisted = localStorage.getItem('vfh_call_taking_form');
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (parsed && parsed.shiftOnDuty) {
          setForm(prev => ({ ...prev, shiftOnDuty: parsed.shiftOnDuty }));
        }
      } catch {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'shiftOnDuty') localStorage.setItem('vfh_shift_on_duty', value);
    if (name === 'dispatcher') {
      localStorage.setItem('vfh_dispatcher_id', value);
      localStorage.setItem('vfh_dispatcher_user_override', '1');
    }
    setForm(prev => {
      const next = { ...prev, [name]: value } as any;
      const now = getTimeStr();
      if (name === 'assignedStation') next.assignedVehicle = now;
      // Additional rows removed in favor of dynamic list
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

  const storageKey = (inc: string) => `vfh_dispatched_stations:${inc}`;
  const storageFormKey = (inc: string) => `vfh_dispatching_form:${inc}`;

  useEffect(() => {
    const carried = localStorage.getItem('vfh_current_incident_number');
    const inc = form.incidentNumber || carried || '';
    if (inc) {
      try {
        const saved = localStorage.getItem(storageKey(inc));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setDispatched(parsed);
        }
      } catch {}
      try {
        const savedForm = localStorage.getItem(storageFormKey(inc));
        if (savedForm) {
          const parsedForm = JSON.parse(savedForm);
          if (parsedForm && typeof parsedForm === 'object') {
            setForm(prev => ({ ...prev, ...parsedForm }));
          }
        }
      } catch {}
      if (dispatched.length === 0) {
        (async () => {
          const { data } = await supabase
            .from('03_ecc_03_02_Incident_Call_Dispatching')
            .select('dispatch_date, dispatch_time, dispatcher_id, dispatched_stations')
            .eq('incident_number', inc)
            .limit(1);
          const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
          if (row) {
            const list = Array.isArray(row.dispatched_stations) ? row.dispatched_stations : [];
            setDispatched(list.map((x: any) => ({ id: String(x.station_id || ''), name: String(x.station_name || ''), time: String(x.dispatched_time || '') })).filter(d => d.id));
            setForm(prev => ({
              ...prev,
              dispatchDate: String(row.dispatch_date || prev.dispatchDate || ''),
              dispatchTime: String(row.dispatch_time || prev.dispatchTime || ''),
              dispatcher: String(row.dispatcher_id || prev.dispatcher || '')
            }));
          }
        })();
      }
    }
  }, [form.incidentNumber]);

  useEffect(() => {
    const inc = form.incidentNumber || localStorage.getItem('vfh_current_incident_number') || '';
    if (inc) {
      try {
        localStorage.setItem(storageKey(inc), JSON.stringify(dispatched));
      } catch {}
    }
  }, [dispatched, form.incidentNumber]);

  useEffect(() => {
    const inc = form.incidentNumber || localStorage.getItem('vfh_current_incident_number') || '';
    if (inc) {
      const snapshot = {
        shiftOnDuty: form.shiftOnDuty,
        dispatcher: form.dispatcher,
        dispatchDate: form.dispatchDate,
        dispatchTime: form.dispatchTime,
        assignedStation: form.assignedStation,
        assignedVehicle: form.assignedVehicle,
        assignedStation2: form.assignedStation2,
        assignedVehicle2: form.assignedVehicle2,
        assignedStation3: form.assignedStation3,
        assignedVehicle3: form.assignedVehicle3,
        assignedStation4: form.assignedStation4,
        assignedVehicle4: form.assignedVehicle4,
        primaryResource: form.primaryResource,
        secondaryResource: form.secondaryResource,
        primaryResource2: form.primaryResource2,
        secondaryResource2: form.secondaryResource2,
        primaryResource3: form.primaryResource3,
        secondaryResource3: form.secondaryResource3,
        incidentCategory: form.incidentCategory,
        incidentSubCategory: form.incidentSubCategory,
        streetNo: form.streetNo,
        streetName: form.streetName,
        suburb: form.suburb
      };
      try {
        localStorage.setItem(storageFormKey(inc), JSON.stringify(snapshot));
      } catch {}
    }
  }, [form, form.incidentNumber]);

  const getDateStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getTimeStr = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const nextSeq = () => {
    const key = 'vfh_incident_sequence';
    const currentRaw = localStorage.getItem(key);
    const current = currentRaw ? parseInt(currentRaw, 10) : 0;
    const next = isNaN(current) ? 1 : current + 1;
    localStorage.setItem(key, String(next));
    return String(next).padStart(5, '0');
  };

  const getSelectedStationIds = (): Set<string> => {
    const current = form.assignedStation ? [form.assignedStation] : [];
    const dispatchedIds = dispatched.map(d => d.id);
    return new Set([...current, ...dispatchedIds]);
  };

  // Removed vehicle uniqueness helper as vehicles are not selected here

  const onInitiate = () => {
    const dateStr = getDateStr();
    const timeStr = getTimeStr();
    const carried = localStorage.getItem('vfh_current_incident_number') || '';
    setForm(prev => ({
      ...prev,
      dispatchDate: dateStr,
      dispatchTime: timeStr,
      incidentNumber: prev.incidentNumber || carried
    }));
    setIsActive(true);
    setTimeout(() => focusRef.current?.focus(), 0);
  };

  const onCancel = () => {
    const key = 'vfh_incident_sequence';
    const currentRaw = localStorage.getItem(key);
    const current = currentRaw ? parseInt(currentRaw, 10) : 0;
    const prev = isNaN(current) ? 0 : Math.max(0, current - 1);
    localStorage.setItem(key, String(prev));
    setIsActive(false);
  };

  const onDispatch = async () => {
    const dispatchedStations = dispatched.map(d => ({ station_id: d.id, station_name: d.name, dispatched_time: d.time }));
    const payload: any = {
      incident_number: form.incidentNumber,
      dispatch_date: form.dispatchDate,
      dispatch_time: form.dispatchTime,
      dispatcher_id: form.dispatcher || null,
      dispatched_stations: dispatchedStations
    };
    try {
      const { error } = await supabase
        .from('03_ecc_03_02_Incident_Call_Dispatching')
        .upsert([payload], { onConflict: 'incident_number' });
      if (error) {
        alert(`Failed to save dispatching: ${error.message}`);
        return;
      }
      const inc = form.incidentNumber || '';
      if (inc) {
        localStorage.setItem('vfh_current_incident_number', inc);
        try { localStorage.setItem(storageKey(inc), JSON.stringify(dispatched)); } catch {}
        try {
          const snapshot = {
            shiftOnDuty: form.shiftOnDuty,
            dispatcher: form.dispatcher,
            dispatchDate: form.dispatchDate,
            dispatchTime: form.dispatchTime
          };
          localStorage.setItem(storageFormKey(inc), JSON.stringify(snapshot));
        } catch {}
      }
      alert('Dispatching saved');
      navigate('/control/emergency-incident-logging/resources');
    } catch (e: any) {
      alert(`Unexpected error saving dispatching: ${e?.message || e}`);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="dispatching-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="dispatching-title">Incident Call Dispatching</Title>
              <Divider aria-hidden="true" />
              
              <Paragraph>
                Coordinate and record dispatch actions for emergency incidents, including resource assignment, timing, and category classification. Initiate a dispatch to activate the input fields and capture operational details.
              </Paragraph>
              

            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Incident Call Dispatching" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input
              type="text"
              id="incidentNumber"
              name="incidentNumber"
              value={form.incidentNumber}
              onChange={handleChange}
              required
              placeholder="yyyy-mm-dd hh:mm 00001"
              style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }}
              readOnly
            />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PrimaryButton onClick={onInitiate}>Initiate Dispatch</PrimaryButton>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="dispatcher" className="required">Dispatcher</Label>
                <Select id="dispatcher" name="dispatcher" value={form.dispatcher} onChange={handleChange} required disabled={!isActive}>
                  <option value="">Select Dispatcher...</option>
                  {dispatcherOptions.map(opt => (
                    <option key={opt.staff_id} value={opt.staff_id}>{opt.full_name}</option>
                  ))}
                </Select>
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroupWide>
                <Label htmlFor="assignedStation" className="required">Responding Fire Stations</Label>
                <Select id="assignedStation" name="assignedStation" value={form.assignedStation} onChange={handleChange} disabled={!isActive} required>
                  <option value="">Select a fire station...</option>
                  {stationOptions.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </Select>
              </FormGroupWide>
              <FormGroup>
                <Label htmlFor="assignedVehicle">Dispatched Time</Label>
                <Input id="assignedVehicle" name="assignedVehicle" value={form.assignedVehicle} onChange={handleChange} disabled={!isActive} readOnly placeholder="hh:mm" />
              </FormGroup>
              <FormGroup>
                <Label>&nbsp;</Label>
                <DispatchButton type="button" onClick={addDispatch} disabled={!isActive || !form.assignedStation || !form.assignedVehicle}>Add Dispatch</DispatchButton>
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Section>
              <h3 style={{ color: '#1177BB', margin: '0 0 10px' }}>Dispatched Stations</h3>
              {dispatched.length === 0 ? (
                <p style={{ color: '#666' }}>No stations dispatched yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dispatched.map(d => (
                    <li key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee' }}>
                      <span><strong>{d.name}</strong> — dispatched at {d.time}</span>
                      <CancelButton type="button" onClick={() => removeDispatch(d.id)} disabled={!isActive}>Remove</CancelButton>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
          
        </div>
      </Section>

      <ButtonRow>
        <DispatchButton onClick={onDispatch} disabled={!isActive || dispatched.length === 0}>Proceed to Responding Resources</DispatchButton>
      </ButtonRow>
    </MainContent>
  );
};
