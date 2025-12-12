import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';

// Styled Components Definitions
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

const ContentWrapper = styled.div`
  background: white;
  border: none;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormSection = styled.div`
  margin-bottom: 25px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
`;

const SectionHeader = styled.h2`
  color: #333;
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FormGroupFull = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #444;
  &.required::after {
    content: ' *';
    color: #dc3545;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  background-color: white;
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  resize: vertical;
  min-height: 80px;
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

// removed ButtonContainer (no longer used)

// removed ActionButton (no longer used)

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

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const CallTakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  background-color: ${props => {
    switch(props.$status.toLowerCase()) {
      case 'active': return '#e3f2fd';
      case 'pending': return '#fff3e0';
      case 'closed': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.$status.toLowerCase()) {
      case 'active': return '#1565c0';
      case 'pending': return '#ef6c00';
      case 'closed': return '#c62828';
      default: return '#616161';
    }
  }};
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid currentColor;
`;

export const IncidentCallTaking: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('incident-call-taking', '/images/ControlRoom.png');
  const [formData, setFormData] = useState(() => {
    const persisted = localStorage.getItem('vfh_call_taking_form');
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}
    }
    const localShift = localStorage.getItem('vfh_shift_on_duty') || '';
    const localCallTaker = localStorage.getItem('vfh_call_taker_id') || '';
    return {
      callerName: '',
      callerPhone: '',
      incidentType: '',
      location: '',
      description: '',
      priority: 'Medium',
      dateTime: new Date().toISOString().slice(0, 16),
      shiftOnDuty: localShift,
      callTaker: localCallTaker,
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`,
      incidentNumber: '',
      callName: '',
      callerNumber: '',
      secondCaller: '',
      secondCallerNumber: '',
      incidentCategory: '',
      incidentSubCategory: '',
      streetNo: '',
      streetName: '',
      suburb: ''
    };
  });
  const [isActiveIncident, setIsActiveIncident] = useState(false);

  const callerNameRef = useRef<HTMLInputElement | null>(null);
  const [callTakerOptions, setCallTakerOptions] = useState<{ staff_id: string; full_name: string }[]>([]);

  React.useEffect(() => {
    const loadCallTakers = async () => {
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
      setCallTakerOptions(options);
    };
    loadCallTakers();
  }, []);

  const getLocalDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getLocalTimeString = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const getNextIncidentSequence = () => {
    const key = 'vfh_incident_sequence';
    const currentRaw = localStorage.getItem(key);
    const current = currentRaw ? parseInt(currentRaw, 10) : 0;
    const next = isNaN(current) ? 1 : current + 1;
    localStorage.setItem(key, String(next));
    return String(next).padStart(5, '0');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'shiftOnDuty') {
      localStorage.setItem('vfh_shift_on_duty', value);
    }
    if (name === 'callTaker') {
      localStorage.setItem('vfh_call_taker_id', value);
      const override = localStorage.getItem('vfh_dispatcher_user_override');
      if (override !== '1') {
        localStorage.setItem('vfh_dispatcher_id', value);
      }
    }
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      localStorage.setItem('vfh_call_taking_form', JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting incident call:', formData);
    // TODO: Implement actual submission logic
  };

  const initiateNewIncident = () => {
    const dateStr = getLocalDateString();
    const timeStr = getLocalTimeString();
    const seqStr = getNextIncidentSequence();
    const incidentNumberStr = `${dateStr} ${timeStr} ${seqStr}`;

    const nextForm = {
      callerName: formData.callerName || '',
      callerPhone: formData.callerPhone || '',
      incidentType: formData.incidentType || '',
      location: formData.location || '',
      description: formData.description || '',
      priority: 'Medium',
      dateTime: `${dateStr}T${timeStr}`,
      shiftOnDuty: formData.shiftOnDuty,
      callTaker: formData.callTaker,
      incidentDate: dateStr,
      incidentTime: timeStr,
      incidentNumber: incidentNumberStr,
      callName: formData.callName || '',
      callerNumber: formData.callerNumber || '',
      secondCaller: formData.secondCaller || '',
      secondCallerNumber: formData.secondCallerNumber || '',
      incidentCategory: formData.incidentCategory || '',
      incidentSubCategory: formData.incidentSubCategory || '',
      streetNo: formData.streetNo || '',
      streetName: formData.streetName || '',
      suburb: formData.suburb || ''
    };
    setFormData(nextForm);
    localStorage.setItem('vfh_call_taking_form', JSON.stringify(nextForm));
    setIsActiveIncident(true);
    setTimeout(() => callerNameRef.current?.focus(), 0);
  };

  const cancelIncident = () => {
    const key = 'vfh_incident_sequence';
    const currentRaw = localStorage.getItem(key);
    const current = currentRaw ? parseInt(currentRaw, 10) : 0;
    const prev = isNaN(current) ? 0 : Math.max(0, current - 1);
    localStorage.setItem(key, String(prev));
    const cleared = {
      callerName: '',
      callerPhone: '',
      incidentType: '',
      location: '',
      description: '',
      priority: 'Medium',
      dateTime: '',
      shiftOnDuty: formData.shiftOnDuty,
      callTaker: formData.callTaker,
      incidentDate: '',
      incidentTime: '',
      incidentNumber: '',
      callName: '',
      callerNumber: '',
      secondCaller: '',
      secondCallerNumber: '',
      incidentCategory: '',
      incidentSubCategory: '',
      streetNo: '',
      streetName: '',
      suburb: ''
    };
    setFormData(cleared);
    localStorage.setItem('vfh_call_taking_form', JSON.stringify(cleared));
    setIsActiveIncident(false);
  };

  const dispatchIncident = async () => {
    try {
      const payload = {
        incident_number: formData.incidentNumber,
        incident_date: formData.incidentDate,
        incident_time: formData.incidentTime,
        shift_on_duty: formData.shiftOnDuty || null,
        call_taker_id: formData.callTaker || null,
        caller_name: formData.callName || null,
        caller_number: formData.callerNumber || null,
        second_caller_name: formData.secondCaller || null,
        second_caller_number: formData.secondCallerNumber || null,
        incident_category: formData.incidentCategory || null,
        incident_sub_category: formData.incidentSubCategory || null,
        street_no: formData.streetNo || null,
        street_name: formData.streetName || null,
        suburb: formData.suburb || null
      };

      const { error } = await supabase
        .from('03_ecc_03_01_Incident_Call_Taking')
        .insert([payload]);

      if (error) {
        alert(`Failed to save incident: ${error.message}`);
        return;
      }

      localStorage.setItem('vfh_current_incident_number', formData.incidentNumber);
      localStorage.setItem('vfh_call_taking_form', JSON.stringify(formData));
      navigate('/control/emergency-incident-logging/dispatching');
    } catch (e: any) {
      alert(`Unexpected error saving incident: ${e?.message || e}`);
    }
  };

  React.useEffect(() => {
    if (formData.incidentNumber) {
      setIsActiveIncident(true);
    }
  }, []);

  return (
    <MainContent aria-label="Main content">
      {/* Header Section - match EmergencyIncidentLogging */}
      <Section aria-labelledby="call-taking-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="call-taking-title">Incident Call Taking</Title>
              <Divider aria-hidden="true" />
              
              <Paragraph>
                Record initial incident call details including caller information, incident type, location and a concise description. This intake step initiates the incident lifecycle and ensures accurate data capture for dispatch and subsequent operational tracking. Ensure the incident number is captured immediately and shown for context across call taking, dispatching, and responding resources.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="Incident Call Taking" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/ControlRoom.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-end', gap: '16px', justifyContent: 'space-between' }}>
            <EmergencyButton onClick={initiateNewIncident}>Initiate a New Emergency Incident</EmergencyButton>
            <Input
              type="text"
              id="incidentNumber"
              name="incidentNumber"
              value={formData.incidentNumber}
              onChange={handleInputChange}
              required
              placeholder="yyyy-mm-dd hh:mm 00001"
              style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }}
              readOnly
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="shiftOnDuty" className="required">Shift on Duty</Label>
                <Select id="shiftOnDuty" name="shiftOnDuty" value={formData.shiftOnDuty} onChange={handleInputChange} required disabled={!isActiveIncident}>
                  <option value="">Select Shift...</option>
                  <option value="Blue">Blue Shift</option>
                  <option value="Green">Green Shift</option>
                  <option value="Red">Red Shift</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="callTaker" className="required">Call Taker</Label>
                <Select id="callTaker" name="callTaker" value={formData.callTaker} onChange={handleInputChange} required disabled={!isActiveIncident}>
                  <option value="">Select Call Taker...</option>
                  {callTakerOptions.map(opt => (<option key={opt.staff_id} value={opt.staff_id}>{opt.full_name}</option>))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="incidentDate" className="required">Incident Date</Label>
                <Input type="date" id="incidentDate" name="incidentDate" value={formData.incidentDate} onChange={handleInputChange} required disabled />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="incidentTime" className="required">Incident Time</Label>
                <Input type="time" id="incidentTime" name="incidentTime" value={formData.incidentTime} onChange={handleInputChange} required disabled />
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="callName" className="required">Caller Name</Label>
                <Input id="callName" name="callName" value={formData.callName} onChange={handleInputChange} required placeholder="Enter caller name" disabled={!isActiveIncident} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="callerNumber" className="required">Caller Number</Label>
                <Input type="tel" id="callerNumber" name="callerNumber" value={formData.callerNumber} onChange={handleInputChange} required placeholder="e.g., +966-XX-XXXXXXX" disabled={!isActiveIncident} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="secondCaller">2nd Caller</Label>
                <Input id="secondCaller" name="secondCaller" value={formData.secondCaller} onChange={handleInputChange} placeholder="Enter 2nd caller name" disabled={!isActiveIncident} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="secondCallerNumber">2nd Caller Number</Label>
                <Input type="tel" id="secondCallerNumber" name="secondCallerNumber" value={formData.secondCallerNumber} onChange={handleInputChange} placeholder="e.g., +966-XX-XXXXXXX" disabled={!isActiveIncident} />
              </FormGroup>
            </InlineFormGrid>
          </div>

          <div style={{ marginTop: '12px' }}>
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="incidentCategory" className="required">Incident Category</Label>
                <Select id="incidentCategory" name="incidentCategory" value={formData.incidentCategory} onChange={handleInputChange} required disabled={!isActiveIncident}>
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
                <Select id="incidentSubCategory" name="incidentSubCategory" value={formData.incidentSubCategory} onChange={handleInputChange} disabled={!isActiveIncident}>
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
                <Input id="streetNo" name="streetNo" value={formData.streetNo} onChange={handleInputChange} placeholder="e.g., 123" disabled={!isActiveIncident} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="streetName" className="required">Street Name</Label>
                <Input id="streetName" name="streetName" value={formData.streetName} onChange={handleInputChange} required placeholder="e.g., King Fahd Road" disabled={!isActiveIncident} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="suburb" className="required">Suburb</Label>
                <Input id="suburb" name="suburb" value={formData.suburb} onChange={handleInputChange} required placeholder="e.g., Dammam" disabled={!isActiveIncident} />
              </FormGroup>
            </InlineFormGrid>
          </div>
          
        </div>
      </Section>
      <ButtonRow>
        <CancelButton onClick={cancelIncident} disabled={!isActiveIncident}>Cancel Incident</CancelButton>
        <DispatchButton onClick={dispatchIncident} disabled={!isActiveIncident}>Dispatch Incident</DispatchButton>
      </ButtonRow>
    </MainContent>
  );
};
