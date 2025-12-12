import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
  overflow-x: hidden;
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

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  &:focus { border-color: #1177BB; outline: none; }
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #444;
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

const TextArea = styled.textarea`
  width: 332px;
  min-width: 332px;
  max-width: 332px;
  padding: 8px 32px 8px 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
  overflow-x: hidden;
  &:focus { border-color: #1177BB; outline: none; }
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

const InlineRow = styled.div`
  display: grid;
  grid-template-columns: 120px 120px 120px 332px 130px;
  column-gap: 10px;
  align-items: end;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;
const SmallGroup = styled(FormGroup)`
  width: 120px;
`;

const DescriptionGroup = styled(FormGroup)`
  width: 332px;
  min-width: 332px;
  max-width: 332px;
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

export const IncidentCasualtiesAndFatalities: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-casualties-fatalities', '/images/ControlRoom.png');
  const navigate = useNavigate();
  const [incidentNumber, setIncidentNumber] = useState('');
  const [entry, setEntry] = useState({ type: '', gender: '', ageGroup: '', description: '' });
  const [records, setRecords] = useState<Array<{ type: string; gender: string; ageGroup: string; description: string }>>([]);

  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    setIncidentNumber(inc);
  }, []);

  useEffect(() => {
    if (!incidentNumber) return;
    try {
      const saved = localStorage.getItem(`vfh_casualties:${incidentNumber}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecords(parsed);
      }
    } catch {}
  }, [incidentNumber]);

  useEffect(() => {
    if (!incidentNumber) return;
    try { localStorage.setItem(`vfh_casualties:${incidentNumber}`, JSON.stringify(records)); } catch {}
  }, [records, incidentNumber]);

  const onEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const addRecord = () => {
    if (!entry.type || !entry.gender || !entry.ageGroup || !entry.description.trim()) return;
    setRecords(prev => [...prev, { ...entry }]);
    setEntry({ type: '', gender: '', ageGroup: '', description: '' });
  };

  const removeRecord = (idx: number) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };

  const onSave = async () => {
    try {
      const payload: any = {
        incident_number: incidentNumber,
        entries: records
      };
      const { error } = await supabase
        .from('03_ecc_03_05_Casualties_&_Fatalities')
        .upsert([payload], { onConflict: 'incident_number' });
      if (error) {
        alert(`Failed to save casualties: ${error.message}`);
        return;
      }
      navigate('/control/emergency-incident-logging/damage-loss');
    } catch (e: any) {
      alert(`Unexpected error saving casualties: ${e?.message || e}`);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="casualties-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="casualties-title">Incident Casualties and Fatalities</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Record casualties and fatalities associated with the incident. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Incident Casualties and Fatalities" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input
              type="text"
              value={incidentNumber}
              readOnly
              placeholder="yyyy-mm-dd hh:mm 00001"
              style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }}
            />
          </div>
          <div style={{ marginTop: '12px' }}>
            <InlineRow>
              <SmallGroup>
                <Label htmlFor="type">Casualty / Fatality</Label>
                <DropdownFixed id="type" name="type" value={entry.type} onChange={onEntryChange}>
                  <option value="">Select...</option>
                  <option value="Casualty">Casualty</option>
                  <option value="Fatality">Fatality</option>
                </DropdownFixed>
              </SmallGroup>
              <SmallGroup>
                <Label htmlFor="gender">Gender</Label>
                <DropdownFixed id="gender" name="gender" value={entry.gender} onChange={onEntryChange}>
                  <option value="">Select...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </DropdownFixed>
              </SmallGroup>
              <SmallGroup>
                <Label htmlFor="ageGroup">Age Group</Label>
                <DropdownFixed id="ageGroup" name="ageGroup" value={entry.ageGroup} onChange={onEntryChange}>
                  <option value="">Select...</option>
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                </DropdownFixed>
              </SmallGroup>
              <DescriptionGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea id="description" name="description" value={entry.description} onChange={onEntryChange} placeholder="Enter details" />
              </DescriptionGroup>
              <FormGroup>
                <Label>&nbsp;</Label>
                <ButtonFixed type="button" onClick={addRecord}>Add</ButtonFixed>
              </FormGroup>
            </InlineRow>
          </div>

          <div style={{ marginTop: '12px' }}>
            <Section>
              {records.length === 0 ? (
                <p style={{ color: '#666' }}>No casualties or fatalities added yet.</p>
              ) : (
                <RecordsList>
                  {records.map((r, idx) => (
                    <RecordItem key={idx}>
                      <ButtonFixed type="button" onClick={() => removeRecord(idx)}>Remove</ButtonFixed>
                      <RecordMeta><strong>{r.type}</strong> — {r.gender}, {r.ageGroup}</RecordMeta>
                      <RecordDesc>{r.description}</RecordDesc>
                    </RecordItem>
                  ))}
                </RecordsList>
              )}
            </Section>
          </div>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={onSave}>Save & Continue to Damage / Loss Reporting</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
const AddContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
`;

const ButtonFixed = styled(ActionButton)`
  min-width: 120px;
  text-align: center;
`;

const RecordsList = styled.ul`
  list-style: none;
  padding: 0 8px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const RecordItem = styled.li`
  display: grid;
  grid-template-columns: 120px auto 1fr;
  column-gap: 8px;
  align-items: start;
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #eee;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const RecordMeta = styled.span`
  white-space: normal;
`;

const RecordDesc = styled.span`
  color: #333;
  overflow-wrap: anywhere;
  word-break: break-word;
`;
const DropdownFixed = styled(Select)`
  width: 120px;
  min-width: 120px;
  max-width: 120px;
`;
