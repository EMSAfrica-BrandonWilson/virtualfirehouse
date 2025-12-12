import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { DropdownOptionsModal } from '../../components/UI/DropdownOptionsModal';
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

const InlineFourGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
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
`;

const OptionsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
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

const OptionsPanel = styled.div`
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
`;
const PropertiesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
`;
const PropertyItem = styled.li`
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  column-gap: 8px;
  align-items: start;
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #eee;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
const RemoveButton = styled(ActionButton)`
  min-width: 120px;
  text-align: center;
`;

export const IncidentPropertyInformation: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-property-information', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [occupantName, setOccupantName] = useState('');
  const [occupantContact, setOccupantContact] = useState('');
  const [legalDescription, setLegalDescription] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [legalOptions, setLegalOptions] = useState<string[]>(['Lot/Block', 'Erf Parcel Number']);
  const [typeOptions, setTypeOptions] = useState<string[]>(['Single-Family Dwelling', 'Commercial Warehouse', 'Apartment Building']);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newLegalOption, setNewLegalOption] = useState('');
  const [newTypeOption, setNewTypeOption] = useState('');
  const [properties, setProperties] = useState<Array<{
    ownerName: string;
    ownerContact: string;
    occupantName: string;
    occupantContact: string;
    legalDescription: string;
    propertyType: string;
  }>>([]);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  useEffect(() => {
    if (!incidentNumber) return;
    try {
      const saved = localStorage.getItem(`vfh_property_info:${incidentNumber}`);
      if (saved) {
        const p = JSON.parse(saved);
        setOwnerName(p.ownerName || '');
        setOwnerContact(p.ownerContact || '');
        setOccupantName(p.occupantName || '');
        setOccupantContact(p.occupantContact || '');
        setLegalDescription(p.legalDescription || '');
        setPropertyType(p.propertyType || '');
        if (Array.isArray(p.legalOptions)) setLegalOptions(p.legalOptions);
        if (Array.isArray(p.typeOptions)) setTypeOptions(p.typeOptions);
      }
      const savedList = localStorage.getItem(`vfh_property_info_list:${incidentNumber}`);
      if (savedList) {
        const arr = JSON.parse(savedList);
        if (Array.isArray(arr)) setProperties(arr);
      }
    } catch {}
  }, [incidentNumber]);
  useEffect(() => {
    if (!incidentNumber) return;
    const snapshot = {
      ownerName, ownerContact, occupantName, occupantContact,
      legalDescription, propertyType,
      legalOptions, typeOptions
    };
    try { localStorage.setItem(`vfh_property_info:${incidentNumber}`, JSON.stringify(snapshot)); } catch {}
  }, [incidentNumber, ownerName, ownerContact, occupantName, occupantContact, legalDescription, propertyType, legalOptions, typeOptions]);
  useEffect(() => {
    if (!incidentNumber) return;
    try { localStorage.setItem(`vfh_property_info_list:${incidentNumber}`, JSON.stringify(properties)); } catch {}
  }, [incidentNumber, properties]);
  const addLegalOption = () => {
    const t = newLegalOption.trim();
    if (!t) return;
    if (!legalOptions.includes(t)) setLegalOptions(prev => [...prev, t]);
    setNewLegalOption('');
  };
  const addTypeOption = () => {
    const t = newTypeOption.trim();
    if (!t) return;
    if (!typeOptions.includes(t)) setTypeOptions(prev => [...prev, t]);
    setNewTypeOption('');
  };
  const removeLegalOption = (opt: string) => setLegalOptions(prev => prev.filter(o => o !== opt));
  const removeTypeOption = (opt: string) => setTypeOptions(prev => prev.filter(o => o !== opt));
  const addProperty = () => {
    const record = {
      ownerName: ownerName || '',
      ownerContact: ownerContact || '',
      occupantName: occupantName || '',
      occupantContact: occupantContact || '',
      legalDescription: legalDescription || '',
      propertyType: propertyType || ''
    };
    setProperties(prev => [...prev, record]);
    setOwnerName('');
    setOwnerContact('');
    setOccupantName('');
    setOccupantContact('');
    setLegalDescription('');
    setPropertyType('');
  };
  const removeProperty = (idx: number) => {
    setProperties(prev => prev.filter((_, i) => i !== idx));
  };
  const handleSaveAndContinue = async () => {
    try {
      const parent = {
        incident_number: incidentNumber || '',
        owner_name: ownerName || '',
        owner_contact: ownerContact || '',
        occupant_name: occupantName || '',
        occupant_contact: occupantContact || '',
        legal_description: legalDescription || '',
        property_type: propertyType || ''
      };
      const { error: upsertErr } = await supabase
        .from('03_ecc_03_08_Property_Information')
        .upsert([parent], { onConflict: 'incident_number' });
      if (upsertErr) {
        console.warn('Save Property Information failed:', upsertErr.message || upsertErr);
      }
      if (incidentNumber) {
        const { error: delItemsErr } = await supabase
          .from('03_ecc_03_08_Property_Information_Items')
          .delete()
          .eq('incident_number', incidentNumber);
        if (delItemsErr) {
          console.warn('Delete existing property items failed:', delItemsErr.message || delItemsErr);
        }
        const items = properties.map(p => ({
          incident_number: incidentNumber,
          owner_name: p.ownerName || '',
          owner_contact: p.ownerContact || '',
          occupant_name: p.occupantName || '',
          occupant_contact: p.occupantContact || '',
          legal_description: p.legalDescription || '',
          property_type: p.propertyType || ''
        }));
        if (items.length > 0) {
          const { error: insertItemsErr } = await supabase
            .from('03_ecc_03_08_Property_Information_Items')
            .insert(items);
          if (insertItemsErr) {
            console.warn('Insert property items failed:', insertItemsErr.message || insertItemsErr);
          }
        }
        const { error: delLegalErr } = await supabase
          .from('03_ecc_03_08_Property_Information_Legal_Options')
          .delete()
          .eq('incident_number', incidentNumber);
        if (delLegalErr) {
          console.warn('Delete legal options failed:', delLegalErr.message || delLegalErr);
        }
        const legalRows = legalOptions.map(opt => ({
          incident_number: incidentNumber,
          option_text: opt
        }));
        if (legalRows.length > 0) {
          const { error: insertLegalErr } = await supabase
            .from('03_ecc_03_08_Property_Information_Legal_Options')
            .insert(legalRows);
          if (insertLegalErr) {
            console.warn('Insert legal options failed:', insertLegalErr.message || insertLegalErr);
          }
        }
        const { error: delTypeErr } = await supabase
          .from('03_ecc_03_08_Property_Information_Type_Options')
          .delete()
          .eq('incident_number', incidentNumber);
        if (delTypeErr) {
          console.warn('Delete type options failed:', delTypeErr.message || delTypeErr);
        }
        const typeRows = typeOptions.map(opt => ({
          incident_number: incidentNumber,
          option_text: opt
        }));
        if (typeRows.length > 0) {
          const { error: insertTypeErr } = await supabase
            .from('03_ecc_03_08_Property_Information_Type_Options')
            .insert(typeRows);
          if (insertTypeErr) {
            console.warn('Insert type options failed:', insertTypeErr.message || insertTypeErr);
          }
        }
      }
    } catch (e: any) {
      console.warn('Unexpected error saving Property Information:', e?.message || e);
    } finally {
      navigate('/control/emergency-incident-logging/damage-loss');
    }
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="property-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="property-title">Property Information</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Record the property details involved in the incident. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Property Information" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <div style={{ marginTop: '12px' }}>
            <InlineFourGrid>
              <FormGroup>
                <Label htmlFor="ownerName">Property Owner's Name</Label>
                <Input id="ownerName" name="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Owner name" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="ownerContact">Owner's Contact Information</Label>
                <Input id="ownerContact" name="ownerContact" value={ownerContact} onChange={(e) => setOwnerContact(e.target.value)} placeholder="Phone / Email" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="occupantName">Occupant's Name (if different from owner)</Label>
                <Input id="occupantName" name="occupantName" value={occupantName} onChange={(e) => setOccupantName(e.target.value)} placeholder="Occupant name" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="occupantContact">Occupant's Contact Information</Label>
                <Input id="occupantContact" name="occupantContact" value={occupantContact} onChange={(e) => setOccupantContact(e.target.value)} placeholder="Phone / Email" />
              </FormGroup>
            </InlineFourGrid>
          </div>
          <div style={{ marginTop: '12px' }}>
            <OptionsRow>
              <div style={{ flex: '1 1 420px' }}>
                <FormGroup>
                  <Label htmlFor="legalDescription">Legal Description of the Property</Label>
                  <SelectInline>
                    <Select id="legalDescription" name="legalDescription" value={legalDescription} onChange={(e) => setLegalDescription(e.target.value)}>
                      <option value="">Select...</option>
                      {legalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                    <OptionButton type="button" onClick={() => setShowLegalModal(true)}>Options</OptionButton>
                  </SelectInline>
                </FormGroup>
              </div>
              <div style={{ flex: '1 1 420px' }}>
                <FormGroup>
                  <Label htmlFor="propertyType">Type of Property</Label>
                  <SelectInline>
                    <Select id="propertyType" name="propertyType" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                      <option value="">Select...</option>
                      {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                    <OptionButton type="button" onClick={() => setShowTypeModal(true)}>Options</OptionButton>
                  </SelectInline>
                </FormGroup>
              </div>
            </OptionsRow>
            <DropdownOptionsModal
              isOpen={showLegalModal}
              title="Manage Legal Description Options"
              options={legalOptions}
              onClose={() => setShowLegalModal(false)}
              onUpdate={(next) => setLegalOptions(next)}
            />
            <DropdownOptionsModal
              isOpen={showTypeModal}
              title="Manage Property Type Options"
              options={typeOptions}
              onClose={() => setShowTypeModal(false)}
              onUpdate={(next) => setTypeOptions(next)}
            />
            <div style={{ marginTop: '12px' }}>
              <ActionButton type="button" onClick={addProperty}>Add Property</ActionButton>
            </div>
          </div>
        </div>
      </Section>
      <Section aria-labelledby="properties-added">
        <div style={{ marginTop: '12px' }}>
          {properties.length === 0 ? (
            <p style={{ color: '#666' }}>No properties added yet.</p>
          ) : (
            <>
              <Label id="properties-added">Properties Added</Label>
              <PropertiesList>
                {properties.map((p, idx) => (
                  <PropertyItem key={idx}>
                    <RemoveButton type="button" onClick={() => removeProperty(idx)}>Remove</RemoveButton>
                    <span><strong>Owner:</strong> {p.ownerName || '—'}</span>
                    <span><strong>Type:</strong> {p.propertyType || '—'}</span>
                    <span><strong>Legal:</strong> {p.legalDescription || '—'}</span>
                  </PropertyItem>
                ))}
              </PropertiesList>
            </>
          )}
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={handleSaveAndContinue}>Save & Continue to Damage / Loss Reporting</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
