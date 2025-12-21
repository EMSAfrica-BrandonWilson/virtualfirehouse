import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { usePageImage } from '../../hooks/usePageImage';

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
  width: ${p => p.$width || '48%'};
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
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
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
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  &:focus { border-color: #1177BB; outline: none; }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  &:focus { border-color: #1177BB; outline: none; }
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
  transition: background-color 0.2s ease;
  &:hover { background-color: #1a86cc; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;


const InfoBanner = styled.div`
  background: #e3f2fd;
  color: #0d47a1;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

const FIRE_RISK_EXPLANATIONS: Record<string, string> = {
  'Moderate': 'Fuels are drying; small fires start easily.',
  'High': 'Fine fuels ignite readily; faster spread.',
  'Very High': 'Fast spread with torching; escalate dispatch.',
  'Extreme': 'Rapid growth; direct control difficult.',
  'Catastrophic': 'Explosive behavior; possible evacuations.'
};

function normalizeRiskLevel(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const s = v.trim().toLowerCase();
  if (s.includes('catastrophic')) return 'Catastrophic';
  if (s.includes('extreme')) return 'Extreme';
  if (s.includes('very high')) return 'Very High';
  if (s === '6' || s.includes('6')) return 'Very High';
  if (s.includes('high')) return 'High';
  if (s === '5' || s.includes('5')) return 'High';
  if (s.includes('moderate')) return 'Moderate';
  if (s === '4' || s.includes('4')) return 'Moderate';
  return undefined;
}

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: end;
  margin-top: 12px;
`;

const TopControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #444;
`;

const WidgetContainer = styled.div`
  margin-top: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
`;

export const IncidentWeatherInformation: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-weather-information', '/images/ControlRoom.png');
  const navigate = useNavigate();
  const [incidentNumber, setIncidentNumber] = useState('');
  const [weatherSaving, setWeatherSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  
  // Form State
  const [tempText, setTempText] = useState('');
  const [fireText, setFireText] = useState('');
  const [aqiText, setAqiText] = useState('');
  const [pollutantsText, setPollutantsText] = useState('');

  useEffect(() => {
    setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || '');
    
    // Initialize Tomorrow.io SDK
    const existing = document.getElementById('tomorrow-sdk');
    if (!existing) {
      const js = document.createElement('script');
      js.id = 'tomorrow-sdk';
      js.src = 'https://www.tomorrow.io/v1/widget/sdk/sdk.bundle.min.js';
      document.head.appendChild(js);
    } else {
        const w: any = window as any;
        if (w.__TOMORROW__ && typeof w.__TOMORROW__.renderWidget === 'function') {
          w.__TOMORROW__.renderWidget();
        }
    }
  }, []);

  useEffect(() => {
    if (!incidentNumber) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('03_ecc_03_10_Weather_Information')
          .select('created_at, weather_jsonb')
          .eq('incident_number', incidentNumber)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (data && data.length > 0) {
          setLastSavedAt(data[0].created_at);
        }
      } catch {}
    })();
  }, [incidentNumber]);

  const handleSaveWeather = async () => {
    if (!incidentNumber) return;
    setWeatherSaving(true);
    try {
      if (!tempText && !fireText && !aqiText && !pollutantsText) {
         if (!window.confirm('Manual weather fields are empty. Save empty data anyway?')) {
           setWeatherSaving(false);
           return;
         }
      }

      const tempVal = tempText.replace(/[^0-9.-]/g, '');
      const riskVal = normalizeRiskLevel(fireText);
      const aqiVal = aqiText.replace(/[^0-9]/g, '');

      const weatherData = {
        temperature_raw: tempText,
        fire_risk_raw: fireText,
        air_quality_raw: aqiText,
        pollutants_raw: pollutantsText,
        extracted: {
          temperature: tempVal,
          fire_risk_index: riskVal,
          air_quality_index: aqiVal,
          pollutants: pollutantsText
        }
      };

      const payload = {
        incident_number: incidentNumber,
        location_id: '102851',
        weather_text: [tempVal ? `Temp: ${tempVal}°C` : '', riskVal ? `Fire Risk: ${riskVal}` : ''].filter(Boolean).join(' · '),
        weather_jsonb: weatherData,
        fire_risk_explanation: riskVal ? FIRE_RISK_EXPLANATIONS[riskVal] : null,
        temperature: tempVal ? `${tempVal}°C` : null,
        fire_risk_index: riskVal,
        air_quality_index: aqiVal,
        pollutants_forecast: pollutantsText,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('03_ecc_03_10_Weather_Information').insert([payload]);
      if (error) throw error;
      
      setLastSavedAt(payload.created_at);
      alert('Weather information saved successfully.');
      navigate('/control/emergency-incident-logging/media');
    } catch (err: any) {
      alert('Failed to save weather: ' + err.message);
    } finally {
      setWeatherSaving(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="weather-info-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="weather-info-title">Weather Information</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                This page allows for the manual entry of weather conditions relevant to the incident. 
                Weather data can be crucial for understanding fire behavior and resource deployment.
                Please enter available data below and verify with the widget if needed.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Weather Information" onError={(e: any) => { e.target.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>

          <TopControlsRow>
            <Input 
              value={incidentNumber} 
              readOnly 
              placeholder="Incident Number" 
              style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} 
            />
          </TopControlsRow>

          {lastSavedAt && <InfoBanner>Last saved: {new Date(lastSavedAt).toLocaleString()}</InfoBanner>}

          <FormRow>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Label>Temperature (°C)</Label>
              <Input 
                value={tempText}
                onChange={e => setTempText(e.target.value)}
                placeholder="e.g. 24" 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Label>Fire Risk Index</Label>
              <Select 
                value={fireText}
                onChange={e => setFireText(e.target.value)}
              >
                <option value="">Select Risk...</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
                <option value="Extreme">Extreme</option>
                <option value="Catastrophic">Catastrophic</option>
              </Select>
            </div>
          </FormRow>

          <FormRow>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Label>Air Quality Index</Label>
              <Input 
                value={aqiText}
                onChange={e => setAqiText(e.target.value)}
                placeholder="e.g. 45" 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Label>Pollutants</Label>
              <Input 
                value={pollutantsText}
                onChange={e => setPollutantsText(e.target.value)}
                placeholder="e.g. Ozone" 
              />
            </div>
          </FormRow>

          <WidgetContainer>
             <div className="tomorrow" data-location-id="102851" data-language="EN" data-unit-system="METRIC" data-skin="light" data-widget-type="upcoming" style={{ paddingBottom: '22px' }}></div>
          </WidgetContainer>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <ActionButton onClick={handleSaveWeather} disabled={weatherSaving}>
              {weatherSaving ? 'Saving...' : 'Save & Continue'}
            </ActionButton>
          </div>

        </div>
      </Section>
    </MainContent>
  );
};
