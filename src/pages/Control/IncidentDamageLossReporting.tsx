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
const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const LossGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const ReadOnlyInput = styled(Input)`
  background-color: #f3f3f3;
  color: #333;
`;
const MemoTextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;
  &:focus { border-color: #1177BB; outline: none; }
`;
const ReadOnlyMemo = styled(MemoTextArea)`
  background-color: #f3f3f3;
  color: #333;
  font-size: 11px;
  line-height: 1.3;
  min-height: 120px;
  resize: none;
  overflow: hidden;
  padding-bottom: 6px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
`;
const RecordsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
`;
const RecordItem = styled.li`
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr 1fr 1fr;
  column-gap: 8px;
  align-items: start;
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #eee;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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

export const IncidentDamageLossReporting: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-damage-loss', '/images/ControlRoom.png');
  const navigate = useNavigate();
  const [incidentNumber, setIncidentNumber] = useState('');
  const [structureLoss, setStructureLoss] = useState<string>('');
  const [contentsLoss, setContentsLoss] = useState<string>('');
  const [otherLoss, setOtherLoss] = useState<string>('');
  const [salvageValue, setSalvageValue] = useState<string>('');
  const [possibleCause, setPossibleCause] = useState<string>('');
  const [areaOfOrigin, setAreaOfOrigin] = useState<string>('');
  const [records, setRecords] = useState<Array<{
    structureLoss: string;
    contentsLoss: string;
    otherLoss: string;
    salvageValue: string;
    possibleCause: string;
    areaOfOrigin: string;
  }>>([]);
  const disclaimerText = "Loss estimates provided herein are the opinion of the Fire Department based on observation at the time of inspection. They are for informational and statistical purposes only. These figures are NOT intended to represent a claim settlement amount. Final determination of loss value is the responsibility of the property owner and their insurance company.";

  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    setIncidentNumber(inc);
    if (!inc) return;
    try {
      const saved = localStorage.getItem(`vfh_damage_loss:${inc}`);
      if (saved) {
        const p = JSON.parse(saved);
        setStructureLoss(p.structureLoss || '');
        setContentsLoss(p.contentsLoss || '');
        setOtherLoss(p.otherLoss || '');
        setSalvageValue(p.salvageValue || '');
        setPossibleCause(p.possibleCause || '');
        setAreaOfOrigin(p.areaOfOrigin || '');
      }
      const savedList = localStorage.getItem(`vfh_damage_loss_list:${inc}`);
      if (savedList) {
        const arr = JSON.parse(savedList);
        if (Array.isArray(arr)) setRecords(arr);
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (!incidentNumber) return;
    const snapshot = {
      structureLoss, contentsLoss, otherLoss, salvageValue,
      possibleCause, areaOfOrigin
    };
    try { localStorage.setItem(`vfh_damage_loss:${incidentNumber}`, JSON.stringify(snapshot)); } catch {}
  }, [incidentNumber, structureLoss, contentsLoss, otherLoss, salvageValue, possibleCause, areaOfOrigin]);
  useEffect(() => {
    if (!incidentNumber) return;
    try { localStorage.setItem(`vfh_damage_loss_list:${incidentNumber}`, JSON.stringify(records)); } catch {}
  }, [incidentNumber, records]);

  const addRecord = () => {
    const rec = {
      structureLoss: structureLoss || '',
      contentsLoss: contentsLoss || '',
      otherLoss: otherLoss || '',
      salvageValue: salvageValue || '',
      possibleCause: possibleCause || '',
      areaOfOrigin: areaOfOrigin || ''
    };
    setRecords(prev => [...prev, rec]);
    setStructureLoss('');
    setContentsLoss('');
    setOtherLoss('');
    setSalvageValue('');
    setPossibleCause('');
    setAreaOfOrigin('');
  };
  const removeRecord = (idx: number) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };
  const handleSaveAndContinue = async () => {
    try {
      if (incidentNumber) {
        const parent = { incident_number: incidentNumber };
        const { error: upsertErr } = await supabase
          .from('03_ecc_03_06_Damage_Loss_Reporting')
          .upsert([parent], { onConflict: 'incident_number' });
        if (upsertErr) {
          console.warn('Save Damage/Loss parent failed:', upsertErr.message || upsertErr);
        }
        const { error: delErr } = await supabase
          .from('03_ecc_03_06_Damage_Loss_Reporting_Items')
          .delete()
          .eq('incident_number', incidentNumber);
        if (delErr) {
          console.warn('Delete existing Damage/Loss items failed:', delErr.message || delErr);
        }
        const items = records.map(r => ({
          incident_number: incidentNumber,
          structure_loss: r.structureLoss ? parseFloat(r.structureLoss) : null,
          contents_loss: r.contentsLoss ? parseFloat(r.contentsLoss) : null,
          other_loss: r.otherLoss ? parseFloat(r.otherLoss) : null,
          salvage_value: r.salvageValue ? parseFloat(r.salvageValue) : null,
          possible_cause: r.possibleCause || null,
          area_of_origin: r.areaOfOrigin || null
        }));
        if (items.length > 0) {
          const { error: insertErr } = await supabase
            .from('03_ecc_03_06_Damage_Loss_Reporting_Items')
            .insert(items);
          if (insertErr) {
            console.warn('Insert Damage/Loss items failed:', insertErr.message || insertErr);
          }
        }
      }
    } catch (e: any) {
      console.warn('Unexpected error saving Damage/Loss items:', e?.message || e);
    } finally {
      navigate('/control/emergency-incident-logging/equipment-used');
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="damage-loss-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="damage-loss-title">Damage / Loss Reporting</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Capture property damage, asset loss and related financial impacts for the incident. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Damage / Loss Reporting" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
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
            <LossGrid>
              <FormGroup>
                <Label htmlFor="structureLoss">Structure/Building Loss</Label>
                <Input
                  id="structureLoss"
                  name="structureLoss"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={structureLoss}
                  onChange={(e) => setStructureLoss(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="contentsLoss">Contents/Personal Property Loss</Label>
                <Input
                  id="contentsLoss"
                  name="contentsLoss"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={contentsLoss}
                  onChange={(e) => setContentsLoss(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="otherLoss">Other Property Loss</Label>
                <Input
                  id="otherLoss"
                  name="otherLoss"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={otherLoss}
                  onChange={(e) => setOtherLoss(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="salvageValue">Salvage Value</Label>
                <Input
                  id="salvageValue"
                  name="salvageValue"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={salvageValue}
                  onChange={(e) => setSalvageValue(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="totalEstimatedLoss">Total Estimated Loss</Label>
                <ReadOnlyInput
                  id="totalEstimatedLoss"
                  name="totalEstimatedLoss"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  readOnly
                  value={(() => {
                    const s = parseFloat(structureLoss || '0') || 0;
                    const c = parseFloat(contentsLoss || '0') || 0;
                    const o = parseFloat(otherLoss || '0') || 0;
                    const v = parseFloat(salvageValue || '0') || 0;
                    const total = s + c + o - v;
                    return Number.isFinite(total) ? total.toFixed(2) : '';
                  })()}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="possibleCause">Possible Cause of Fire</Label>
                <MemoTextArea
                  id="possibleCause"
                  name="possibleCause"
                  value={possibleCause}
                  onChange={(e) => setPossibleCause(e.target.value)}
                  placeholder="Enter possible cause details"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="areaOfOrigin">Area of Origin</Label>
                <MemoTextArea
                  id="areaOfOrigin"
                  name="areaOfOrigin"
                  value={areaOfOrigin}
                  onChange={(e) => setAreaOfOrigin(e.target.value)}
                  placeholder="Enter area of origin"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="disclaimer">Disclaimer</Label>
                <ReadOnlyMemo
                  id="disclaimer"
                  name="disclaimer"
                  readOnly
                  value={disclaimerText}
                />
              </FormGroup>
            </LossGrid>
          </div>
          <div style={{ marginTop: '12px' }}>
            <ActionButton type="button" onClick={addRecord}>Add Record</ActionButton>
          </div>
        </div>
      </Section>
      <Section aria-labelledby="records-added">
        <div style={{ marginTop: '12px' }}>
          {records.length === 0 ? (
            <p style={{ color: '#666' }}>No records added yet.</p>
          ) : (
            <>
              <Label id="records-added">Records Added</Label>
              <RecordsList>
                {records.map((r, idx) => (
                  <RecordItem key={idx}>
                    <ActionButton type="button" onClick={() => removeRecord(idx)} style={{ backgroundColor: '#dc3545' }}>Remove</ActionButton>
                    <span><strong>Structure:</strong> {r.structureLoss || '—'}</span>
                    <span><strong>Contents:</strong> {r.contentsLoss || '—'}</span>
                    <span><strong>Other:</strong> {r.otherLoss || '—'}</span>
                    <span><strong>Salvage:</strong> {r.salvageValue || '—'}</span>
                    <span>
                      <strong>Estimated:</strong>{' '}
                      {(() => {
                        const s = parseFloat(r.structureLoss || '0') || 0;
                        const c = parseFloat(r.contentsLoss || '0') || 0;
                        const o = parseFloat(r.otherLoss || '0') || 0;
                        const v = parseFloat(r.salvageValue || '0') || 0;
                        const total = s + c + o - v;
                        return Number.isFinite(total) ? total.toFixed(2) : '—';
                      })()}
                    </span>
                  </RecordItem>
                ))}
              </RecordsList>
            </>
          )}
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={handleSaveAndContinue}>Save & Continue to Equipment Used</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
