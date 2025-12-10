import React, { useState, useRef, useEffect } from 'react';
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
  const [isActive, setIsActive] = useState(false);
  const [dispatcherOptions, setDispatcherOptions] = useState<{ staff_id: string; full_name: string }[]>([]);
  const [stationOptions, setStationOptions] = useState<{ id: string; name: string }[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<{ value: string; label: string }[]>([]);
  const focusRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState(() => ({
    dispatcher: localStorage.getItem('vfh_dispatcher_id') || '',
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
      if (Array.isArray(deptData) && deptData.length > 0) defaultDeptId = Number(deptData[0].id);

      let query = supabase
        .from('02_admin_register_fd3_stations')
        .select('id, fire_station_name')
        .order('fire_station_name', { ascending: true });
      if (defaultDeptId) query = query.eq('department_id', defaultDeptId);
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
    if (carried) setForm(prev => ({ ...prev, incidentNumber: carried }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'dispatcher') localStorage.setItem('vfh_dispatcher_id', value);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getSelectedStationIds = (): Set<string> => {
    return new Set([
      form.assignedStation,
      form.assignedStation2,
      form.assignedStation3
    ].filter(Boolean) as string[]);
  };

  const getSelectedVehicleValues = (): Set<string> => {
    return new Set([
      form.assignedVehicle,
      form.primaryResource,
      form.secondaryResource,
      form.assignedVehicle2,
      form.primaryResource2,
      form.secondaryResource2,
      form.assignedVehicle3,
      form.primaryResource3,
      form.secondaryResource3
    ].filter(Boolean) as string[]);
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

  const onDispatch = () => {};

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
              <PrimaryButton onClick={onInitiate}>Initiate Resources</PrimaryButton>

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
                  <FormGroup>
                    <Label htmlFor="incidentNumber" className="required">Incident Number</Label>
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
                  </FormGroup>
                </InlineFormGrid>
              </div>

              <div style={{ marginTop: '12px' }}>
                <InlineFormGrid>
                  <FormGroup>
                    <Label htmlFor="assignedStation">Responding Station 1</Label>
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
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="assignedVehicle">First Response</Label>
                    <Select id="assignedVehicle" name="assignedVehicle" value={form.assignedVehicle} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.assignedVehicle !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="primaryResource">Second Response</Label>
                    <Select id="primaryResource" name="primaryResource" value={form.primaryResource} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.primaryResource !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="secondaryResource">Third Response</Label>
                    <Select id="secondaryResource" name="secondaryResource" value={form.secondaryResource} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.secondaryResource !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                </InlineFormGrid>
              </div>

              <div style={{ marginTop: '12px' }}>
                <InlineFormGrid>
                  <FormGroup>
                    <Label htmlFor="assignedStation2">Responding Station 2</Label>
                    <Select id="assignedStation2" name="assignedStation2" value={form.assignedStation2} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select a fire station...</option>
                      {stationOptions.map(st => {
                        const selected = getSelectedStationIds();
                        const isDisabled = selected.has(st.id) && form.assignedStation2 !== st.id;
                        return (
                          <option key={st.id} value={st.id} disabled={isDisabled}>{st.name}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="assignedVehicle2">First Response</Label>
                    <Select id="assignedVehicle2" name="assignedVehicle2" value={form.assignedVehicle2} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.assignedVehicle2 !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="primaryResource2">Second Response</Label>
                    <Select id="primaryResource2" name="primaryResource2" value={form.primaryResource2} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.primaryResource2 !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="secondaryResource2">Third Response</Label>
                    <Select id="secondaryResource2" name="secondaryResource2" value={form.secondaryResource2} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.secondaryResource2 !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                </InlineFormGrid>
              </div>

              <div style={{ marginTop: '12px' }}>
                <InlineFormGrid>
                  <FormGroup>
                    <Label htmlFor="assignedStation3">Responding Station 3</Label>
                    <Select id="assignedStation3" name="assignedStation3" value={form.assignedStation3} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select a fire station...</option>
                      {stationOptions.map(st => {
                        const selected = getSelectedStationIds();
                        const isDisabled = selected.has(st.id) && form.assignedStation3 !== st.id;
                        return (
                          <option key={st.id} value={st.id} disabled={isDisabled}>{st.name}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="assignedVehicle3">First Response</Label>
                    <Select id="assignedVehicle3" name="assignedVehicle3" value={form.assignedVehicle3} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.assignedVehicle3 !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="primaryResource3">Second Response</Label>
                    <Select id="primaryResource3" name="primaryResource3" value={form.primaryResource3} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.primaryResource3 !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="secondaryResource3">Third Response</Label>
                    <Select id="secondaryResource3" name="secondaryResource3" value={form.secondaryResource3} onChange={handleChange} disabled={!isActive}>
                      <option value="">Select vehicle...</option>
                      {vehicleOptions.map(v => {
                        const selected = getSelectedVehicleValues();
                        const isDisabled = selected.has(v.value) && form.secondaryResource3 !== v.value;
                        return (
                          <option key={v.value} value={v.value} disabled={isDisabled}>{v.label}</option>
                        );
                      })}
                    </Select>
                  </FormGroup>
                </InlineFormGrid>
              </div>

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
        </div>
      </Section>

      <ButtonRow>
        <CancelButton onClick={onCancel} disabled={!isActive}>Cancel</CancelButton>
        <DispatchButton onClick={onDispatch} disabled={!isActive}>Save Resources</DispatchButton>
      </ButtonRow>
    </MainContent>
  );
};

