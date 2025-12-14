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
const FormRow = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: end; margin-top: 12px; `;
const TopControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;
const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
  margin-top: 12px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
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
const ModalOverlay = styled.div<{ $open: boolean }>`
  display: ${p => p.$open ? 'flex' : 'none'};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.7);
  z-index: 4000;
  align-items: center;
  justify-content: center;
`;
const ModalCard = styled.div`
  width: 520px;
  max-width: 92vw;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #dc3545;
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
const SavedRoutesContainer = styled.div`
  margin-top: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
`;
const SavedRoutesTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 8px 0;
  color: #1177BB;
`;
const SavedRoutesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const SavedRouteItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  padding: 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #eee;
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
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [savedRoutesLoading, setSavedRoutesLoading] = useState(false);
  const [savedRoutesError, setSavedRoutesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [localFavs, setLocalFavs] = useState<Record<string, boolean>>({});
  const [updatingRouteId, setUpdatingRouteId] = useState<string | null>(null);
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  const storageKey = (inc: string) => `vfh_route_directions_${inc}`;
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
      try {
        const inc = incidentNumber || '';
        if (inc) {
          const payload = { fromAddress: from, toAddress: to, directions: items, routeSummary: { distance: formatDistance(route.distance || 0), duration: formatDuration(route.duration || 0) } };
          localStorage.setItem(storageKey(inc), JSON.stringify(payload));
        }
      } catch {}
      try {
        const inc = incidentNumber || '';
        if (inc) {
          const dbPayload: any = {
            incident_number: inc,
            address_from: from,
            address_to: to,
            directions: items,
            route_distance: formatDistance(route.distance || 0),
            route_duration: formatDuration(route.duration || 0)
          };
          await supabase
            .from('03_ecc_03_09_Incident_Route_Finder')
            .insert([dbPayload]);
        }
      } catch (e) {
        // Non-fatal: keep UI state even if DB insert fails
        console.warn('Failed to save route directions to database:', (e as any)?.message || e);
      }
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
    if (!fromFocused || !fromAddress || fromAddress.trim().length < 3) {
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
  }, [fromAddress, fromFocused]);
  useEffect(() => {
    if (toDebounceRef.current) window.clearTimeout(toDebounceRef.current);
    if (!toFocused || !toAddress || toAddress.trim().length < 3) {
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
  }, [toAddress, toFocused]);
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
  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    if (!inc) {
      setDirections([]);
      setRouteSummary(null);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(inc));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.directions)) {
          setFromAddress(parsed.fromAddress || '');
          setToAddress(parsed.toAddress || '');
          setDirections(parsed.directions);
          setRouteSummary(parsed.routeSummary || null);
          setFromSuggestions([]);
          setToSuggestions([]);
          return;
        }
      }
    } catch {}
    (async () => {
      try {
        const { data } = await supabase
          .from('03_ecc_03_09_Incident_Route_Finder')
          .select('address_from,address_to,directions,route_distance,route_duration,created_at')
          .eq('incident_number', inc)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          const row: any = data[0];
          const items = Array.isArray(row?.directions) ? row.directions : [];
          const summary = { distance: row?.route_distance || '', duration: row?.route_duration || '' };
          setFromAddress(row?.address_from || '');
          setToAddress(row?.address_to || '');
          setDirections(items);
          setRouteSummary(summary);
          try {
            const payload = { fromAddress: row?.address_from || '', toAddress: row?.address_to || '', directions: items, routeSummary: summary };
            localStorage.setItem(storageKey(inc), JSON.stringify(payload));
          } catch {}
          setFromSuggestions([]);
          setToSuggestions([]);
        }
      } catch {}
    })();
  }, [incidentNumber]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'vfh_current_incident_number') {
        const inc = e.newValue || '';
        if (!inc) {
          setDirections([]);
          setRouteSummary(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    if (!inc) {
      setSavedRoutes([]);
      return;
    }
    (async () => {
      try {
        setSavedRoutesLoading(true);
        setSavedRoutesError(null);
        const { data, error } = await supabase
          .from('03_ecc_03_09_Incident_Route_Finder')
          .select('id,address_from,address_to,directions,route_distance,route_duration,created_at,is_favorite')
          .eq('incident_number', inc)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setSavedRoutes(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setSavedRoutes([]);
        setSavedRoutesError(e?.message || 'Failed to load saved routes');
      } finally {
        setSavedRoutesLoading(false);
      }
    })();
    try {
      const rawFavs = localStorage.getItem(`vfh_route_favorites_${inc}`);
      if (rawFavs) {
        const parsed = JSON.parse(rawFavs);
        if (parsed && typeof parsed === 'object') setLocalFavs(parsed);
      } else {
        setLocalFavs({});
      }
    } catch {
      setLocalFavs({});
    }
  }, [incidentNumber]);
  const loadSavedRoute = (row: any) => {
    const items = Array.isArray(row?.directions) ? row.directions : [];
    const summary = { distance: row?.route_distance || '', duration: row?.route_duration || '' };
    setFromAddress(row?.address_from || '');
    setToAddress(row?.address_to || '');
    setDirections(items);
    setRouteSummary(summary);
    const inc = incidentNumber || '';
    if (inc) {
      try {
        const payload = { fromAddress: row?.address_from || '', toAddress: row?.address_to || '', directions: items, routeSummary: summary };
        localStorage.setItem(storageKey(inc), JSON.stringify(payload));
      } catch {}
    }
  };
  const isFavorite = (row: any) => {
    if (row?.is_favorite === true) return true;
    const id = String(row?.id || '');
    return !!(id && localFavs[id]);
  };
  const toggleFavorite = async (row: any) => {
    const id = String(row?.id || '');
    if (!id) return;
    try {
      setUpdatingRouteId(id);
      const next = !isFavorite(row);
      const { error } = await supabase
        .from('03_ecc_03_09_Incident_Route_Finder')
        .update({ is_favorite: next })
        .eq('id', id);
      if (error) {
        const inc = incidentNumber || '';
        const updated = { ...localFavs, [id]: next };
        setLocalFavs(updated);
        if (inc) {
          try { localStorage.setItem(`vfh_route_favorites_${inc}`, JSON.stringify(updated)); } catch {}
        }
      } else {
        setSavedRoutes(prev => prev.map(r => (String(r.id) === id ? { ...r, is_favorite: next } : r)));
      }
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to update favorite status.');
      setSaveModalOpen(true);
    } finally {
      setUpdatingRouteId(null);
    }
  };
  const deleteRoute = async (row: any) => {
    const id = String(row?.id || '');
    if (!id) return;
    try {
      setDeletingRouteId(id);
      const { error } = await supabase
        .from('03_ecc_03_09_Incident_Route_Finder')
        .delete()
        .eq('id', id);
      if (error) {
        setSaveError(error.message || 'Failed to delete route.');
        setSaveModalOpen(true);
        return;
      }
      setSavedRoutes(prev => prev.filter(r => String(r.id) !== id));
      setLocalFavs(prev => {
        const next = { ...prev };
        delete next[id];
        const inc = incidentNumber || '';
        if (inc) {
          try { localStorage.setItem(`vfh_route_favorites_${inc}`, JSON.stringify(next)); } catch {}
        }
        return next;
      });
      const inc = incidentNumber || '';
      if (inc) {
        try {
          const raw = localStorage.getItem(storageKey(inc));
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id && String(parsed.id) === id) {
              localStorage.removeItem(storageKey(inc));
            }
          }
        } catch {}
      }
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to delete route.');
      setSaveModalOpen(true);
    } finally {
      setDeletingRouteId(null);
    }
  };
  const handleSaveAndContinue = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const inc = incidentNumber || '';
      if (!inc) {
        setSaveError('Incident number is missing.');
        setSaveModalOpen(true);
        return;
      }
      if (!fromAddress || !toAddress || directions.length === 0) {
        setSaveError('Please find a route and load directions before saving.');
        setSaveModalOpen(true);
        return;
      }
      const dist = routeSummary?.distance || '';
      const dur = routeSummary?.duration || '';
      try {
        const { data: existing } = await supabase
          .from('03_ecc_03_09_Incident_Route_Finder')
          .select('id')
          .eq('incident_number', inc)
          .eq('address_from', fromAddress || '')
          .eq('address_to', toAddress || '')
          .eq('route_distance', dist)
          .eq('route_duration', dur)
          .limit(1);
        if (existing && existing.length > 0) {
          setSaveError('This route has already been saved for this incident.');
          setSaveModalOpen(true);
          return;
        }
      } catch (e: any) {
        // If duplicate check fails, proceed to save but surface error later if save fails
      }
      const payload: any = {
        incident_number: inc,
        address_from: fromAddress || '',
        address_to: toAddress || '',
        directions,
        route_distance: dist,
        route_duration: dur
      };
      const { error } = await supabase
        .from('03_ecc_03_09_Incident_Route_Finder')
        .insert([payload]);
      if (error) {
        setSaveError(error.message || 'Failed to save route.');
        setSaveModalOpen(true);
        return;
      }
      navigate('/control/emergency-incident-logging/weather');
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save route.');
      setSaveModalOpen(true);
    } finally {
      setSaving(false);
    }
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
                Enter the origin and destination to generate turn‑by‑turn directions for the active incident. While typing, address suggestions help you pick accurate locations; once a route is found, the directions are kept on the page and can be saved to the incident record. Use the Saved Routes panel to load previous routes, mark favorites, or delete entries. The latest route auto‑restores when you return to this page, and saving is validated to prevent duplicate entries.
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
          <TopControlsRow>
            <ActionButton type="button" onClick={handleFindRoute}>Find Quickest Route</ActionButton>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </TopControlsRow>
          <FormRow>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Label htmlFor="fromAddress">Address From</Label>
              <Input id="fromAddress" name="fromAddress" type="text" placeholder="e.g., Fire Station HQ" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} onFocus={() => setFromFocused(true)} onBlur={() => { setFromFocused(false); setTimeout(() => setFromSuggestions([]), 150); }} />
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
              <Input id="toAddress" name="toAddress" type="text" placeholder="e.g., Incident Location" value={toAddress} onChange={(e) => setToAddress(e.target.value)} onFocus={() => setToFocused(true)} onBlur={() => { setToFocused(false); setTimeout(() => setToSuggestions([]), 150); }} />
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
          </FormRow>
          <TwoColumnRow>
            <div>
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
                          {d.text} ({d.distance}, {d.duration})
                        </DirectionsItem>
                      ))}
                    </DirectionsList>
                  </>
                )}
              </DirectionsContainer>
            </div>
            <div>
              <SavedRoutesContainer>
                <SavedRoutesTitle>Saved Routes for This Incident</SavedRoutesTitle>
                {savedRoutesLoading && <div>Loading saved routes...</div>}
                {savedRoutesError && <div style={{ color: '#dc3545' }}>{savedRoutesError}</div>}
                {!savedRoutesLoading && !savedRoutesError && savedRoutes.length === 0 && <div>No saved routes</div>}
                {!savedRoutesLoading && !savedRoutesError && savedRoutes.length > 0 && (
                  <SavedRoutesList>
                    {savedRoutes.map((r) => (
                      <SavedRouteItem key={r.id}>
                        <div>
                          <div><strong>{r.address_from}</strong></div>
                          <div><strong>{r.address_to}</strong></div>
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ color: '#555' }}>{r.route_distance} · {r.route_duration}</span>
                            <span style={{ marginLeft: '8px', color: '#777' }}>{new Date(r.created_at).toLocaleString()}</span>
                            {isFavorite(r) && <span style={{ marginLeft: '8px', color: '#e0a800' }}>★ Favorite</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <SecondaryButton type="button" onClick={() => loadSavedRoute(r)}>Load</SecondaryButton>
                          <SecondaryButton type="button" disabled={updatingRouteId === String(r.id)} onClick={() => toggleFavorite(r)}>
                            {isFavorite(r) ? 'Unfavorite' : 'Favorite'}
                          </SecondaryButton>
                          <SecondaryButton type="button" disabled={deletingRouteId === String(r.id)} onClick={() => deleteRoute(r)}>
                            Delete
                          </SecondaryButton>
                        </div>
                      </SavedRouteItem>
                    ))}
                  </SavedRoutesList>
                )}
              </SavedRoutesContainer>
              <div style={{ marginTop: '12px' }}>
                <ActionButton disabled={saving} onClick={handleSaveAndContinue}>Save & Continue to Weather Information</ActionButton>
              </div>
            </div>
          </TwoColumnRow>
        </div>
      </Section>
      <ModalOverlay $open={saveModalOpen}>
        <ModalCard role="dialog" aria-modal="true" aria-labelledby="save-error-title">
          <ModalTitle id="save-error-title">Action Failed</ModalTitle>
          <div style={{ color: '#333' }}>{saveError || 'An unexpected error occurred while saving.'}</div>
          <ModalActions>
            <SecondaryButton type="button" onClick={() => setSaveModalOpen(false)}>Close</SecondaryButton>
          </ModalActions>
        </ModalCard>
      </ModalOverlay>
    </MainContent>
  );
};
