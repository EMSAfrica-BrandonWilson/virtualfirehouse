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
const Section = styled.section` margin-bottom: 0;`;
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
const TopControlsRow = styled.div` display: flex; gap: 12px; align-items: end; margin-top: 12px; justify-content: space-between; `;
const RightControls = styled.div` display: flex; align-items: end; justify-content: flex-end; `;
const CardsRow = styled.div` display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; @media (max-width: 1000px) { grid-template-columns: 1fr; } `;
const GuidePanel = styled.div` background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.06); `;
const GuideTitle = styled.h3` margin: 0 0 8px; color: #1177BB; font-weight: bold; `;
const GuideList = styled.ul` list-style: none; padding: 0; margin: 0; `;
const GuideItem = styled.li` margin-bottom: 10px; color: #333; font-size: 14px; `;
const ExtractPanel = styled.div` background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.06); margin-bottom: 12px; `;
const ExtractTitle = styled.h3` margin: 0 0 8px; color: #1177BB; font-weight: bold; `;
const ExtractContent = styled.div` font-size: 14px; color: #333; white-space: pre-wrap; `;
const InfoBanner = styled.div` background: #f2f8fc; border: 1px solid #cfe7f6; color: #0c5a8a; padding: 10px 12px; border-radius: 6px; font-size: 13px; `;
const FIRE_RISK_EXPLANATIONS: Record<string, string> = {
  'Moderate': 'Fuels are drying; small fires start easily, spread with wind; maintain crews on standby.',
  'High': 'Fine fuels ignite readily; faster spread and spotting possible; pre-position resources and tighten permits.',
  'Very High': 'Fast spread with torching and crown run in aligned wind/terrain; escalate dispatch and consider restrictions.',
  'Extreme': 'Rapid growth, long-range spotting, direct control difficult; restrict high-risk activities; stage strike teams.',
  'Catastrophic': 'Explosive behavior, sustained crown fire, major spotting; possible evacuations and activity bans; indirect tactics likely.'
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
function parseWidgetText(text: string): any {
  const t = text || '';
  const riskMatch = t.match(/(Catastrophic|Extreme|Very\s+High|High|Moderate)/i);
  const riskLevel = normalizeRiskLevel(riskMatch ? riskMatch[1] : undefined);
  const tempMatch = t.match(/(-?\d{1,2})\s*°\s*C|(-?\d{1,2})\s*°\s*$/i);
  const windMatch = t.match(/(\d{1,3})\s*(?:km\/h|kph|mph)/i);
  const humMatch = t.match(/(\d{1,3})\s*%\s*humidity|humidity\s*[:\-]?\s*(\d{1,3})\s*%/i);
  const idxMatch = t.match(/\b([4-8])\b/);
  const res: any = {};
  if (riskLevel) res.fire_risk_level = riskLevel;
  if (idxMatch) res.fire_risk_index = parseInt(idxMatch[1], 10);
  if (tempMatch) {
    const m = tempMatch[1] || tempMatch[2];
    if (m) res.temperature_c = parseInt(m, 10);
  }
  if (windMatch) res.wind_speed = parseInt(windMatch[1], 10);
  if (humMatch) {
    const m = humMatch[1] || humMatch[2];
    if (m) res.humidity_percent = parseInt(m, 10);
  }
  return res;
}
function parseFromTomorrowSDK(): any {
  try {
    const w: any = (window as any).__TOMORROW__;
    if (!w) return {};
    const s = JSON.stringify(w);
    if (!s) return {};
    return parseWidgetText(s);
  } catch {
    return {};
  }
}

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 0;
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

export const IncidentWeatherInformation: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-weather-information', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [firstLocationExtract, setFirstLocationExtract] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  useEffect(() => {
    const existing = document.getElementById('tomorrow-sdk');
    if (existing) {
      const w: any = window as any;
      if (w.__TOMORROW__ && typeof w.__TOMORROW__.renderWidget === 'function') {
        w.__TOMORROW__.renderWidget();
      }
      return;
    }
    const fjs = document.getElementsByTagName('script')[0];
    const js = document.createElement('script');
    js.id = 'tomorrow-sdk';
    js.src = 'https://www.tomorrow.io/v1/widget/sdk/sdk.bundle.min.js';
    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      document.head.appendChild(js);
    }
  }, []);
  useEffect(() => {
    const hideBranding = () => {
      document.querySelectorAll('.tomorrow').forEach(el => {
        el.querySelectorAll('a, img').forEach(node => {
          if (node instanceof HTMLAnchorElement && node.href.includes('weather.tomorrow.io')) {
            node.remove();
          } else if (node instanceof HTMLImageElement && node.src.includes('weather-website-client.tomorrow.io')) {
            node.remove();
          }
        });
      });
    };
    hideBranding();
    const obs = new MutationObserver(hideBranding);
    document.querySelectorAll('.tomorrow').forEach(el => {
      obs.observe(el, { childList: true, subtree: true });
    });
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const target = document.querySelector('.tomorrow');
    if (!target) return;
    const updateExtract = () => {
      const el = document.querySelector('.tomorrow');
      if (el) {
        const text = (el as HTMLElement).innerText || '';
        if (text && text.trim().length > 0) {
          setFirstLocationExtract(text.trim());
        } else {
          const sdkParsed = parseFromTomorrowSDK();
          const risk = sdkParsed?.fire_risk_level ? `Risk: ${sdkParsed.fire_risk_level}` : '';
          const idx = typeof sdkParsed?.fire_risk_index === 'number' ? `Index: ${sdkParsed.fire_risk_index}` : '';
          const temp = typeof sdkParsed?.temperature_c === 'number' ? `Temp: ${sdkParsed.temperature_c} °C` : '';
          const wind = typeof sdkParsed?.wind_speed === 'number' ? `Wind: ${sdkParsed.wind_speed}` : '';
          const hum = typeof sdkParsed?.humidity_percent === 'number' ? `Humidity: ${sdkParsed.humidity_percent}%` : '';
          const line = [risk, idx, temp, wind, hum].filter(Boolean).join(' · ');
          if (line) setFirstLocationExtract(line);
        }
      }
    };
    updateExtract();
    const mo = new MutationObserver(() => updateExtract());
    mo.observe(target, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    if (!inc) {
      setLastSavedAt(null);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from('03_ecc_03_10_Weather_Information')
          .select('created_at')
          .eq('incident_number', inc)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          setLastSavedAt(data[0].created_at as string);
        } else {
          setLastSavedAt(null);
        }
      } catch {
        setLastSavedAt(null);
      }
    })();
  }, [incidentNumber]);
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="weather-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="weather-title">Weather Information</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Record weather observations relevant to the incident. The Fire Risk Index indicates the likelihood and potential severity of fire spread based on current conditions (temperature, wind, humidity) and fuel state; values typically range from Low to Extreme and should guide resource staging and operational readiness.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Weather Information" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        <TopControlsRow style={{ justifyContent: 'flex-end', marginBottom: '12px' }}>
          <RightControls>
            <Input aria-label="Incident Number" type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </RightControls>
        </TopControlsRow>
        <CardsRow>
          <div style={{ maxWidth: '900px', width: '100%' }}>
            {firstLocationExtract && (
              <ExtractPanel>
                <ExtractTitle>Extracted Weather (First Location)</ExtractTitle>
                <ExtractContent>{firstLocationExtract}</ExtractContent>
              </ExtractPanel>
            )}
            <div
              className="tomorrow"
              data-location-id="102851,2071466,102862"
              data-language="EN"
              data-unit-system="METRIC"
              data-skin="light"
              data-widget-type="fire"
              style={{ 
                paddingBottom: '22px', 
                position: 'relative',
                marginBottom: '30px'
              }}
            ></div>
            <div
              className="tomorrow"
              data-location-id="102835,2071463,2071224"
              data-language="EN"
              data-unit-system="METRIC"
              data-skin="light"
              data-widget-type="fire"
              style={{ 
                paddingBottom: '22px', 
                position: 'relative'
              }}
            ></div>
          </div>
          <GuidePanel>
            <GuideTitle>Fire Risk Ratings</GuideTitle>
            <GuideList>
              <GuideItem><strong>4 — Moderate:</strong> Fuels are drying; small fires start easily, spread with wind; maintain crews on standby.</GuideItem>
              <GuideItem><strong>5 — High:</strong> Fine fuels ignite readily; faster spread and spotting possible; pre-position resources and tighten permits.</GuideItem>
              <GuideItem><strong>6 — Very High:</strong> Fast spread with torching and crown run in aligned wind/terrain; escalate dispatch and consider restrictions.</GuideItem>
              <GuideItem><strong>7 — Extreme:</strong> Rapid growth, long-range spotting, direct control difficult; restrict high-risk activities; stage strike teams.</GuideItem>
              <GuideItem><strong>8 — Catastrophic:</strong> Explosive behavior, sustained crown fire, major spotting; possible evacuations and activity bans; indirect tactics likely.</GuideItem>
            </GuideList>
          </GuidePanel>
        </CardsRow>
        </div>
      </Section>
      <ButtonRow>
        {lastSavedAt && (
          <InfoBanner>
            Last saved: {new Date(lastSavedAt).toLocaleString()}
          </InfoBanner>
        )}
        <ActionButton disabled={saving} onClick={async () => {
          try {
            setSaving(true);
            const inc = incidentNumber || '';
            const el = document.querySelector('.tomorrow') as HTMLElement | null;
            const locIdRaw = el?.getAttribute('data-location-id') || null;
            const locId = locIdRaw ? (locIdRaw.split(',')[0] || locIdRaw) : null;
            const freshText = (firstLocationExtract && firstLocationExtract.trim().length > 0)
              ? firstLocationExtract
              : ((el?.innerText || '') as string).trim();
            let parsed = freshText ? parseWidgetText(freshText) : {};
            if (!parsed || Object.keys(parsed).length === 0) {
              parsed = parseFromTomorrowSDK();
            }
            const riskExplanation = parsed?.fire_risk_level ? FIRE_RISK_EXPLANATIONS[parsed.fire_risk_level] || null : null;
            const payload: any = {
              incident_number: inc,
              location_id: locId,
              weather_text: freshText || '',
              weather_jsonb: parsed,
              fire_risk_explanation: riskExplanation,
              created_at: new Date().toISOString()
            };
            const { error } = await supabase
              .from('03_ecc_03_10_Weather_Information')
              .insert([payload]);
            if (error) {
              console.warn('Failed to save Weather Information:', error.message || error);
            }
            setLastSavedAt(payload.created_at);
          } catch {}
          finally {
            setSaving(false);
            navigate('/control/emergency-incident-logging/media');
          }
        }}>Save & Continue to Multi-Media Files</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
