import React, { useState, useEffect } from 'react';
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
  &.required::after { content: ' *'; color: #dc3545; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  resize: vertical;
  min-height: 100px;
  &:focus { border-color: #1177BB; outline: none; }
`;

const InlineFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 960px;
  margin: 12px 0 0;
  align-items: start;
  justify-items: stretch;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;
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

export const IncidentNarrative: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-narrative', '/images/ControlRoom.png');
  const navigate = useNavigate();
  const [incidentNumber, setIncidentNumber] = useState('');
  const [oicName, setOicName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<{ oic: string; text: string; time: string }[]>([]);

  const storageKey = (inc: string) => `vfh_incident_narrative:${inc}`;
  const oicKey = (inc: string) => `vfh_incident_narrative_oic:${inc}`;
  const getTimeStr = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    setIncidentNumber(inc);
    if (inc) {
      try {
        const saved = localStorage.getItem(storageKey(inc));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setMessages(parsed);
        }
      } catch {}
      try {
        const oicSaved = localStorage.getItem(oicKey(inc));
        if (oicSaved) setOicName(oicSaved);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (incidentNumber) {
      try { localStorage.setItem(storageKey(incidentNumber), JSON.stringify(messages)); } catch {}
    }
  }, [messages, incidentNumber]);

  useEffect(() => {
    if (incidentNumber) {
      try { localStorage.setItem(oicKey(incidentNumber), oicName); } catch {}
    }
  }, [oicName, incidentNumber]);

  const addMessage = () => {
    if (!incidentNumber || !oicName.trim() || !messageText.trim()) return;
    const entry = { oic: oicName.trim(), text: messageText.trim(), time: getTimeStr() };
    setMessages(prev => [...prev, entry]);
    setMessageText('');
    try { localStorage.setItem(oicKey(incidentNumber), oicName.trim()); } catch {}
  };

  const removeMessage = (idx: number) => {
    setMessages(prev => prev.filter((_, i) => i !== idx));
  };

  const onSave = async () => {
    try {
      const payload: any = {
        incident_number: incidentNumber,
        oic_name: oicName.trim(),
        messages: messages
      };
      const { error } = await supabase
        .from('03_ecc_03_04_Incident_Narrative')
        .upsert([payload], { onConflict: 'incident_number' });
      if (error) {
        alert(`Failed to save narrative: ${error.message}`);
        return;
      }
      navigate('/control/emergency-incident-logging/casualties');
    } catch (e: any) {
      alert(`Unexpected error saving narrative: ${e?.message || e}`);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="narrative-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="narrative-title">Incident Narrative</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Capture the narrative and detailed account of the incident. The incident number is shown for context. Record Officer in Charge messages and operational updates throughout the incident lifecycle.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Incident Narrative" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
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
            <InlineFormGrid>
              <FormGroup>
                <Label htmlFor="oicName" className="required">Officer in Charge</Label>
                <Input id="oicName" name="oicName" value={oicName} onChange={(e) => setOicName(e.target.value)} placeholder="Enter OIC name" required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="messageText" className="required">Message</Label>
                <TextArea id="messageText" name="messageText" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Enter message to control centre" required />
              </FormGroup>
            </InlineFormGrid>
            <ButtonRow>
              <ActionButton onClick={addMessage} disabled={!oicName.trim() || !messageText.trim()}>Add Message</ActionButton>
            </ButtonRow>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Section>
              <h3 style={{ color: '#1177BB', margin: '0 0 10px' }}>Messages from OIC</h3>
              {messages.length === 0 ? (
                <p style={{ color: '#666' }}>No messages captured yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {messages.map((m, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderBottom: '1px solid #eee' }}>
                      <ActionButton onClick={() => removeMessage(idx)}>Remove</ActionButton>
                      <span><strong>{m.oic}</strong> — {m.text} <em style={{ color: '#666' }}>at {m.time}</em></span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={onSave}>Save & Continue to Casualties & Fatalities</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
