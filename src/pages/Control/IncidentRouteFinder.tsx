import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';

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
const Label = styled.label` font-weight: bold; font-size: 12px; margin-bottom: 5px; color: #444;`;
const FormRow = styled.div` display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; margin-top: 12px; `;
const DirectionsContainer = styled.div`
  margin-top: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
`;
const DirectionsTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 8px 0;
  color: #1177BB;
`;
const DirectionsList = styled.ol`
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
`;
const DirectionsItem = styled.li`
  margin-bottom: 6px;
`;
const SuggestionList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
  margin-top: 6px;
  z-index: 2000;
  max-height: 240px;
  overflow: auto;
`;
const SuggestionItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  &:hover { background: #f2f8fc; }
`;
const MapFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 85vh;
  min-height: 600px;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
  margin-top: 12px;
  @media (max-width: 768px) {
    height: 75vh;
    min-height: 520px;
  }
`;
const SecondaryButton = styled.button`
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
`;
const MapOverlay = styled.div<{ $open: boolean }>`
  display: ${p => p.$open ? 'flex' : 'none'};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.7);
  z-index: 3000;
  align-items: center;
  justify-content: center;
`;
const MapContainer = styled.div`
  width: 96vw;
  height: 92vh;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const FullMapFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 8px;
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

export const IncidentRouteFinder: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-route-finder', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [directions, setDirections] = useState<{ text: string; distance: string; duration: string }[]>([]);
  const [routeSummary, setRouteSummary] = useState<{ distance: string; duration: string } | null>(null);
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState<string | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<{ label: string }[]>([]);
  const [toSuggestions, setToSuggestions] = useState<{ label: string }[]>([]);
  const [autoLoading, setAutoLoading] = useState(false);
  const fromDebounceRef = React.useRef<number | null>(null);
  const toDebounceRef = React.useRef<number | null>(null);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  const formatDistance = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };
  const formatDuration = (s: number) => {
    const mins = Math.round(s / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m ? `${h} h ${m} min` : `${h} h`;
    }
    return `${mins} min`;
  };
  const actionText = (type?: string, modifier?: string) => {
    const mod = modifier ? modifier.replace('_', ' ') : '';
    switch (type) {
      case 'depart': return 'Start';
      case 'arrive': return 'Arrive at destination';
      case 'turn': return `Turn ${mod}`.trim();
      case 'merge': return 'Merge';
      case 'on ramp': return 'Take ramp';
      case 'off ramp': return 'Exit ramp';
      case 'fork': return `Keep ${mod}`.trim();
      case 'roundabout': return 'Enter roundabout';
      case 'rotary': return 'Enter rotary';
      case 'end of road': return `Turn ${mod} at end of road`.trim();
      case 'continue': return 'Continue';
      case 'new name': return 'Continue onto';
      default: return 'Continue';
    }
  };
  const fetchTurnByTurn = async (from: string, to: string) => {
    try {
      setDirLoading(true);
      setDirError(null);
      setDirections([]);
      setRouteSummary(null);
      const geocode = async (q: string) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, { headers: { Accept: 'application/json' } });
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Address not found');
        const item = data[0];
        return { lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
      };
      const [fromPt, toPt] = await Promise.all([geocode(from), geocode(to)]);
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${fromPt.lon},${fromPt.lat};${toPt.lon},${toPt.lat}?overview=false&alternatives=false&steps=true`;
      const rRes = await fetch(routeUrl, { headers: { Accept: 'application/json' } });
      const rJson = await rRes.json();
      if (rJson.code !== 'Ok' || !rJson.routes || rJson.routes.length === 0) throw new Error('Route not found');
      const route = rJson.routes[0];
      const leg = route.legs?.[0];
      const steps = Array.isArray(leg?.steps) ? leg.steps : [];
      const items = steps.map((st: any) => {
        const act = actionText(st.maneuver?.type, st.maneuver?.modifier);
        const road = st.name ? ` onto ${st.name}` : '';
        return {
          text: `${act}${road}`.trim(),
          distance: formatDistance(st.distance || 0),
          duration: formatDuration(st.duration || 0)
        };
      });
      setDirections(items);
      setRouteSummary({ distance: formatDistance(route.distance || 0), duration: formatDuration(route.duration || 0) });
    } catch (e: any) {
      setDirError(e?.message || 'Failed to load directions');
    } finally {
      setDirLoading(false);
    }
  };
  const fetchAddressSuggestions = async (q: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=7&countrycodes=za&addressdetails=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((it: any) => ({ label: it.display_name as string }));
  };
  useEffect(() => {
    if (fromDebounceRef.current) window.clearTimeout(fromDebounceRef.current);
    if (!fromAddress || fromAddress.trim().length < 3) {
      setFromSuggestions([]);
      return;
    }
    fromDebounceRef.current = window.setTimeout(async () => {
      try {
        setAutoLoading(true);
        const items = await fetchAddressSuggestions(fromAddress.trim());
        setFromSuggestions(items);
      } catch {
        setFromSuggestions([]);
      } finally {
        setAutoLoading(false);
      }
    }, 250);
    return () => {
      if (fromDebounceRef.current) window.clearTimeout(fromDebounceRef.current);
    };
  }, [fromAddress]);
  useEffect(() => {
    if (toDebounceRef.current) window.clearTimeout(toDebounceRef.current);
    if (!toAddress || toAddress.trim().length < 3) {
      setToSuggestions([]);
      return;
    }
    toDebounceRef.current = window.setTimeout(async () => {
      try {
        setAutoLoading(true);
        const items = await fetchAddressSuggestions(toAddress.trim());
        setToSuggestions(items);
      } catch {
        setToSuggestions([]);
      } finally {
        setAutoLoading(false);
      }
    }, 250);
    return () => {
      if (toDebounceRef.current) window.clearTimeout(toDebounceRef.current);
    };
  }, [toAddress]);
  const selectFromSuggestion = (label: string) => {
    setFromAddress(label);
    setFromSuggestions([]);
  };
  const selectToSuggestion = (label: string) => {
    setToAddress(label);
    setToSuggestions([]);
  };
  const handleFindRoute = () => {
    if (!fromAddress || !toAddress) {
      setDirections([]);
      setRouteSummary(null);
      setDirError('Please enter both addresses');
      return;
    }
    fetchTurnByTurn(fromAddress, toAddress);
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="route-finder-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="route-finder-title">Incident Route Finder</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Plan and visualize optimal response routes for the incident. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Incident Route Finder" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <FormRow>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Label htmlFor="fromAddress">Address From</Label>
              <Input id="fromAddress" name="fromAddress" type="text" placeholder="e.g., Fire Station HQ" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} onBlur={() => setTimeout(() => setFromSuggestions([]), 150)} />
              {fromSuggestions.length > 0 && (
                <SuggestionList>
                  {fromSuggestions.map((s, idx) => (
                    <SuggestionItem key={`${s.label}-${idx}`} type="button" onMouseDown={() => selectFromSuggestion(s.label)}>
                      {s.label}
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Label htmlFor="toAddress">Address To</Label>
              <Input id="toAddress" name="toAddress" type="text" placeholder="e.g., Incident Location" value={toAddress} onChange={(e) => setToAddress(e.target.value)} onBlur={() => setTimeout(() => setToSuggestions([]), 150)} />
              {toSuggestions.length > 0 && (
                <SuggestionList>
                  {toSuggestions.map((s, idx) => (
                    <SuggestionItem key={`${s.label}-${idx}`} type="button" onMouseDown={() => selectToSuggestion(s.label)}>
                      {s.label}
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </div>
            <ActionButton type="button" onClick={handleFindRoute}>Find Quickest Route</ActionButton>
          </FormRow>
          <DirectionsContainer>
            <DirectionsTitle>Turn-by-Turn Directions</DirectionsTitle>
            {dirLoading && <div>Loading directions...</div>}
            {dirError && <div style={{ color: '#dc3545' }}>{dirError}</div>}
            {!dirLoading && !dirError && directions.length === 0 && <div>No directions to display</div>}
            {!dirLoading && !dirError && directions.length > 0 && (
              <>
                {routeSummary && (
                  <div style={{ marginBottom: '8px', color: '#555' }}>
                    Total: {routeSummary.distance} · {routeSummary.duration}
                  </div>
                )}
                <DirectionsList>
                  {directions.map((d, i) => (
                    <DirectionsItem key={i}>
                      {i + 1}. {d.text} ({d.distance}, {d.duration})
                    </DirectionsItem>
                  ))}
                </DirectionsList>
              </>
            )}
          </DirectionsContainer>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={() => navigate('/control/emergency-incident-logging/weather')}>Save & Continue to Weather Information</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
