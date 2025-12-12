import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { DropdownOptionsModal } from '../../components/UI/DropdownOptionsModal';

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
const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  background-color: white;
  &:focus { border-color: #1177BB; outline: none; }
`;
const SelectInline = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;
const OptionButton = styled.button`
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

const InlineButton = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 13px;
  background-color: #1177BB;
  color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #1a86cc; }
  &:active { transform: translateY(1px); }
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

export const IncidentEquipmentUsed: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-equipment-used', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>(['Fire Engine', 'Rescue Saw', 'Thermal Camera']);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [vehiclesUsed, setVehiclesUsed] = useState('');
  const [vehiclesOptions, setVehiclesOptions] = useState<string[]>(['Engine 1', 'Rescue 2', 'Ladder 1', 'Tender 3']);
  const [quantity, setQuantity] = useState('');
  const [timeUsed, setTimeUsed] = useState('');
  const [perUnitRate, setPerUnitRate] = useState('');
  const [costOfUse, setCostOfUse] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    setIncidentNumber(inc);
    if (!inc) return;
    try {
      const saved = localStorage.getItem(`vfh_equipment_used:${inc}`);
      if (saved) {
        const p = JSON.parse(saved);
        setEquipmentUsed(p.equipmentUsed || '');
        if (Array.isArray(p.equipmentOptions)) setEquipmentOptions(p.equipmentOptions);
        setVehiclesUsed(p.vehiclesUsed || '');
        if (Array.isArray(p.vehiclesOptions)) setVehiclesOptions(p.vehiclesOptions);
        setQuantity(p.quantity || '');
        setTimeUsed(p.timeUsed || '');
        setPerUnitRate(p.perUnitRate || '');
        setCostOfUse(p.costOfUse || '');
        if (Array.isArray(p.items)) setItems(p.items);
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (!incidentNumber) return;
    const snapshot = { equipmentUsed, equipmentOptions, vehiclesUsed, vehiclesOptions, quantity, timeUsed, perUnitRate, costOfUse, items };
    try { localStorage.setItem(`vfh_equipment_used:${incidentNumber}`, JSON.stringify(snapshot)); } catch {}
  }, [incidentNumber, equipmentUsed, equipmentOptions, vehiclesUsed, vehiclesOptions, quantity, timeUsed, perUnitRate, costOfUse, items]);
  useEffect(() => {
    const q = parseFloat(quantity || '0') || 0;
    const r = parseFloat(perUnitRate || '0') || 0;
    const c = q * r;
    setCostOfUse(Number.isFinite(c) ? c.toFixed(2) : '');
  }, [quantity, perUnitRate]);
  const totalCost = (() => {
    const sum = items.reduce((acc, it) => {
      if (it.type === 'Equipment') {
        const v = parseFloat(it.costOfUse || '0') || 0;
        return acc + v;
      }
      return acc;
    }, 0);
    return Number.isFinite(sum) ? sum.toFixed(2) : '';
  })();
  const handleSaveAndContinue = async () => {
    try {
      if (!incidentNumber) {
        navigate('/control/emergency-incident-logging/route-finder');
        return;
      }
      const { error: delErr } = await supabase
        .from('03_ecc_03_07_Equipment_Used')
        .delete()
        .eq('incident_number', incidentNumber);
      if (delErr) {
        console.warn('Delete existing Equipment Used items failed:', delErr.message || delErr);
      }
      const rows = items.map(it => ({
        incident_number: incidentNumber,
        item_type: it.type,
        item_name: it.name,
        quantity: it.type === 'Equipment' ? ((it.quantity && it.quantity !== '') ? parseFloat(it.quantity) : null) : null,
        time_used: it.type === 'Equipment' ? (it.timeUsed || null) : null,
        per_unit_rate: it.type === 'Equipment' ? ((it.perUnitRate && it.perUnitRate !== '') ? parseFloat(it.perUnitRate) : null) : null
      }));
      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from('03_ecc_03_07_Equipment_Used')
          .insert(rows);
        if (insErr) {
          console.warn('Insert Equipment Used items failed:', insErr.message || insErr);
        }
      }
    } catch (e: any) {
      console.warn('Unexpected error saving Equipment Used items:', e?.message || e);
    } finally {
      navigate('/control/emergency-incident-logging/route-finder');
    }
  };
  const addVehicle = () => {
    if (!vehiclesUsed) return;
    const next = [...items, { type: 'Vehicle', name: vehiclesUsed }];
    setItems(next);
  };
  const addEquipment = () => {
    if (!equipmentUsed) return;
    const next = [...items, { type: 'Equipment', name: equipmentUsed, quantity, timeUsed, perUnitRate, costOfUse }];
    setItems(next);
  };
  const removeItem = (idx: number) => {
    const next = items.slice();
    next.splice(idx, 1);
    setItems(next);
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="equipment-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="equipment-title">Equipment Used</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Record equipment and tools utilized during the incident response. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Equipment Used" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Label htmlFor="vehiclesUsed">Fire Vehicles Used</Label>
                <SelectInline>
                  <Select id="vehiclesUsed" name="vehiclesUsed" value={vehiclesUsed} onChange={(e) => setVehiclesUsed(e.target.value)} style={{ width: '280px' }}>
                    <option value="">Select...</option>
                    {vehiclesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                  <InlineButton type="button" onClick={addVehicle}>Add Vehicle</InlineButton>
                </SelectInline>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Label htmlFor="equipmentUsed">Equipment Used</Label>
                <SelectInline>
                  <Select id="equipmentUsed" name="equipmentUsed" value={equipmentUsed} onChange={(e) => setEquipmentUsed(e.target.value)} style={{ width: '280px' }}>
                    <option value="">Select...</option>
                    {equipmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                  <OptionButton type="button" onClick={() => setShowEquipModal(true)}>Options</OptionButton>
                  <InlineButton type="button" onClick={addEquipment}>Add Equipment</InlineButton>
                </SelectInline>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '160px' }}>
                <Label htmlFor="timeUsed">Time Used</Label>
                <Input id="timeUsed" name="timeUsed" type="time" value={timeUsed} onChange={(e) => setTimeUsed(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '160px' }}>
                <Label htmlFor="perUnitRate">Per Unit Rate</Label>
                <Input id="perUnitRate" name="perUnitRate" type="number" min="0" step="0.01" value={perUnitRate} onChange={(e) => setPerUnitRate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '160px' }}>
                <Label htmlFor="costOfUse">Cost of Use</Label>
                <Input id="costOfUse" name="costOfUse" type="number" step="0.01" value={costOfUse} readOnly />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '180px', marginLeft: 'auto' }}>
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input id="totalCost" name="totalCost" type="number" step="0.01" value={totalCost} readOnly />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr 120px 140px 120px 120px', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Action</div>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Type</div>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Name</div>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Quantity</div>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Time Used</div>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Per Unit Rate</div>
                <div style={{ fontWeight: 700, color: '#1177BB' }}>Cost of Use</div>
                {items.length === 0 ? (
                  <>
                    <div style={{ gridColumn: '1 / -1', color: '#666', padding: '8px 0' }}>No items added</div>
                  </>
                ) : (
                  items.map((it, idx) => (
                    <React.Fragment key={idx}>
                      <div><InlineButton type="button" onClick={() => removeItem(idx)}>Remove</InlineButton></div>
                      <div>{it.type}</div>
                      <div>{it.name}</div>
                      <div>{it.type === 'Equipment' ? (it.quantity || '') : ''}</div>
                      <div>{it.type === 'Equipment' ? (it.timeUsed || '') : ''}</div>
                      <div>{it.type === 'Equipment' ? (it.perUnitRate || '') : ''}</div>
                      <div>{it.type === 'Equipment' ? (it.costOfUse || '') : ''}</div>
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
            <DropdownOptionsModal
              isOpen={showEquipModal}
              title="Manage Equipment Used Options"
              options={equipmentOptions}
              onClose={() => setShowEquipModal(false)}
              onUpdate={(next) => setEquipmentOptions(next)}
            />
          </div>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={handleSaveAndContinue}>Save & Continue to Incident Route Finder</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
