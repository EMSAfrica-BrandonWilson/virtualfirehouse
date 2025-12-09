import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';
import { supabase } from '../../../lib/supabase';

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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

// Align form containers and inputs to Staff Basic Info styles
const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: min-content;
  gap: 20px;
  margin-bottom: 15px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 2px;
`;

const Input = styled.input`
  height: 36px;
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const Select = styled.select`
  height: 36px;
  padding: 6px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

// Inline row for name + color picker
const NameColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Inline row for label + control on one line
const InlineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Styled color input to match form controls
const ColorInput = styled.input`
  height: 32px;
  width: 42px;
  padding: 0;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1177BB;
  box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

// Compact variant for reducing visual height
const CompactFieldColumn = styled(FieldColumn)`
  gap: 8px;
  padding: 12px;
  max-height: 260px;
  overflow: auto;
`;

const RefreshButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const AddButton = styled.button`
  background-color: #FF9900;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;

  &:hover {
    background-color: #e68900;
  }
`;

const SaveButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;

  &:hover {
    background-color: #0f5c99;
  }
`;

const StatusBar = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: #334155;
`;

// Palette for registered system buttons to make them stand out
const registeredButtonPalette = ['#1177BB', '#FF9900', '#6BCB77', '#845EC2', '#FF6B6B', '#4D96FF'];

// Styled button for registered systems
const RegisteredSystemButton = styled.button<{ $color: string }>`
  background-color: ${(props) => props.$color};
  color: white;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.05s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  text-align: left;

  &:hover {
    filter: brightness(0.92);
  }

  &:active {
    transform: translateY(1px);
  }
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

export const ShiftSystemDefinition: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-shift-systems', '/images/ShiftSchedule.png');

  // Form state
  type PatternDef = {
    patternName: string;
    numberOfShifts: number;
    shiftNames: string[];
    rotationOrder: number[];
    startDate: string;
    startTime: string;
    durationHours: number;
    shiftColors: string[];
  };
  const [shiftSystemName, setShiftSystemName] = useState<string>('');
  const defaultPalette = ['#1177BB', '#FF9900', '#6BCB77', '#845EC2', '#FF6B6B', '#FFD93D', '#4D96FF', '#FF9671', '#2E8B57', '#A0522D', '#1E90FF', '#9B59B6'];
  const makeDefaultShiftNames = (count: number) => Array.from({ length: count }, (_, i) => `Shift ${i + 1}`);
  const [patterns, setPatterns] = useState<PatternDef[]>([{
    patternName: 'Pattern 1',
    numberOfShifts: 3,
    shiftNames: makeDefaultShiftNames(3),
    rotationOrder: [0, 1, 2],
    startDate: '',
    startTime: '08:00',
    durationHours: 12,
    shiftColors: defaultPalette.slice(0, 3),
  }]);
  const [selectedPatternIndex, setSelectedPatternIndex] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [loadingSystem, setLoadingSystem] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<boolean>(true); // fields inactive by default
  const [lastLoadedSystemName, setLastLoadedSystemName] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const current = patterns[selectedPatternIndex];

  // Keep arrays in sync with number of shifts
  const setNumberOfShifts = (value: number) => {
    setPatterns((prev) => {
      const next = [...prev];
      const p = { ...next[selectedPatternIndex] };
      p.numberOfShifts = Math.max(1, Math.min(12, value || 1));
      // sync arrays
      const names = [...p.shiftNames];
      if (p.numberOfShifts > names.length) {
        for (let i = names.length; i < p.numberOfShifts; i++) names.push(`Shift ${i + 1}`);
      } else if (p.numberOfShifts < names.length) {
        names.length = p.numberOfShifts;
      }
      p.shiftNames = names;

      p.rotationOrder = Array.from({ length: p.numberOfShifts }, (_, i) => i);

      const colors = [...p.shiftColors];
      if (p.numberOfShifts > colors.length) {
        for (let i = colors.length; i < p.numberOfShifts; i++) colors.push(defaultPalette[i % defaultPalette.length]);
      } else if (p.numberOfShifts < colors.length) {
        colors.length = p.numberOfShifts;
      }
      p.shiftColors = colors;

      next[selectedPatternIndex] = p;
      return next;
    });
  };

  const endTimePreview = useMemo(() => {
    if (!current?.startTime) return '';
    const [hStr, mStr] = current.startTime.split(':');
    const startMinutes = (parseInt(hStr || '0', 10) * 60) + parseInt(mStr || '0', 10);
    const totalMinutes = startMinutes + Math.round((current?.durationHours || 0) * 60);
    const endMinutes = totalMinutes % (24 * 60);
    const crossesMidnight = totalMinutes >= 24 * 60;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const hh = String(endH).padStart(2, '0');
    const mm = String(endM).padStart(2, '0');
    return `${hh}:${mm}${crossesMidnight ? ' (next day)' : ''}`;
  }, [current?.startTime, current?.durationHours]);

  const rotationWarning = useMemo(() => {
    const seen = new Set<number>();
    for (const idx of (current?.rotationOrder || [])) {
      if (seen.has(idx)) return 'Rotation order contains duplicates.';
      seen.add(idx);
    }
    if ((current?.rotationOrder?.length || 0) !== (current?.numberOfShifts || 0)) return 'Rotation order must include all shifts.';
    return '';
  }, [current?.rotationOrder, current?.numberOfShifts]);

  const handleNameChange = (i: number, value: string) => {
    setPatterns((prev) => {
      const next = [...prev];
      const p = { ...next[selectedPatternIndex] };
      const names = [...p.shiftNames];
      names[i] = value;
      p.shiftNames = names;
      next[selectedPatternIndex] = p;
      return next;
    });
  };

  const handleRotationChange = (pos: number, value: number) => {
    setPatterns((prev) => {
      const next = [...prev];
      const p = { ...next[selectedPatternIndex] };
      const order = [...p.rotationOrder];
      order[pos] = value;
      p.rotationOrder = order;
      next[selectedPatternIndex] = p;
      return next;
    });
  };

  const handleColorChange = (i: number, value: string) => {
    setPatterns((prev) => {
      const next = [...prev];
      const p = { ...next[selectedPatternIndex] };
      const colors = [...p.shiftColors];
      colors[i] = value;
      p.shiftColors = colors;
      next[selectedPatternIndex] = p;
      return next;
    });
  };

  const handleRefresh = async () => {
    const name = (lastLoadedSystemName || shiftSystemName).trim();
    if (name) {
      await loadShiftSystem(name);
      setViewMode(true);
      setSaveMessage(`Refreshed from database: "${name}"`);
    } else {
      setSaveMessage('No saved shift selected. Click Add to create one.');
      setViewMode(true);
    }
  };

  const handleAdd = () => {
    setViewMode(false);
    setShiftSystemName('');
    setIsDefault(false);
    // Reset current pattern to defaults for new entry
    setPatterns(() => [{
      patternName: 'Pattern 1',
      numberOfShifts: 3,
      shiftNames: makeDefaultShiftNames(3),
      rotationOrder: [0, 1, 2],
      startDate: '',
      startTime: '08:00',
      durationHours: 12,
      shiftColors: defaultPalette.slice(0, 3),
    }]);
    setSelectedPatternIndex(0);
    setSaveMessage('');
  };

  const handleEdit = () => {
    setViewMode(false);
    setSaveMessage('Fields unlocked for editing. Make your changes and save.');
  };

  const addPattern = () => {
    setPatterns((prev) => {
      const next = [...prev];
      const idx = next.length;
      next.push({
        patternName: `Pattern ${idx + 1}`,
        numberOfShifts: 3,
        shiftNames: makeDefaultShiftNames(3),
        rotationOrder: [0, 1, 2],
        startDate: '',
        startTime: '08:00',
        durationHours: 12,
        shiftColors: defaultPalette.slice(0, 3),
      });
      return next;
    });
    setSelectedPatternIndex((prev) => prev + 1);
  };

  const deleteSelectedPattern = () => {
    setPatterns((prev) => {
      if (prev.length <= 1) return prev; // keep at least one
      const next = [...prev];
      next.splice(selectedPatternIndex, 1);
      return next;
    });
    setSelectedPatternIndex((prev) => Math.max(0, prev - 1));
  };

  const setPatternName = (value: string) => {
    setPatterns((prev) => {
      const next = [...prev];
      const p = { ...next[selectedPatternIndex], patternName: value };
      next[selectedPatternIndex] = p;
      return next;
    });
  };

  const handleSave = async () => {
    setSaveMessage('');
    if (!shiftSystemName.trim()) {
      setSaveMessage('Please enter a Shift System Name before saving.');
      return;
    }
    if (rotationWarning) {
      setSaveMessage(`Cannot save: ${rotationWarning}`);
      return;
    }
    setSaving(true);
    try {
      // If setting this as default, unset others first (optional but safer)
      if (isDefault) {
        await supabase
          .from('02_admin_shift_system_definitions')
          .update({ is_default: false })
          .neq('system_name', shiftSystemName.trim());
      }

      const payload = {
        system_name: shiftSystemName.trim(),
        number_of_shifts: current.numberOfShifts,
        start_date: current.startDate || null,
        start_time: current.startTime || null,
        duration_hours: current.durationHours,
        shift_names: current.shiftNames,
        rotation_order: current.rotationOrder,
        shift_colors: current.shiftColors,
        active: true,
        is_default: isDefault
      };
      const { error } = await supabase
        .from('02_admin_shift_system_definitions')
        .upsert([payload], { onConflict: 'system_name' });
      if (error) {
        const msg = error?.message || '';
        // Fallback if unique/exclusion constraint is missing: manual insert-or-update
        if (msg.toLowerCase().includes('no unique or exclusion constraint')) {
          const { data: existsRows, error: existErr } = await supabase
            .from('02_admin_shift_system_definitions')
            .select('id')
            .eq('system_name', payload.system_name)
            .limit(1);
          if (existErr) throw existErr;
          const exists = Array.isArray(existsRows) && existsRows.length > 0;
          if (exists) {
            const { error: updErr } = await supabase
              .from('02_admin_shift_system_definitions')
              .update(payload)
              .eq('system_name', payload.system_name);
            if (updErr) throw updErr;
          } else {
            const { error: insErr } = await supabase
              .from('02_admin_shift_system_definitions')
              .insert([payload]);
            if (insErr) throw insErr;
          }
        } else {
          throw error;
        }
      }
      // After successful save, reload from DB and lock fields
      await loadShiftSystem(payload.system_name);
      setLastLoadedSystemName(payload.system_name);
      setViewMode(true);
      setSaveMessage('Shift system definition saved successfully.');
      // Refresh registered list after successful save
      await loadRegisteredSystems();
    } catch (err: any) {
      console.error('Error saving shift system:', err);
      const msg = err?.message || 'Failed to save shift system.';
      // Provide a clearer hint when the DB schema is missing expected columns
      if (typeof msg === 'string' && msg.toLowerCase().includes('schema cache')) {
        setSaveMessage('Database is missing the shift_system_definitions table or columns. Please apply the migration.');
      } else {
        setSaveMessage(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // Registered shift systems listing
  const [registeredSystems, setRegisteredSystems] = useState<string[]>([]);
  const [registeredLoading, setRegisteredLoading] = useState<boolean>(false);
  const [registeredError, setRegisteredError] = useState<string>('');

  const loadRegisteredSystems = async () => {
    setRegisteredLoading(true);
    setRegisteredError('');
    try {
      const { data, error } = await supabase
        .from('02_admin_shift_system_definitions')
        .select('system_name, is_default')
        .order('system_name', { ascending: true });
      if (error) throw error;
      setRegisteredSystems((data || []).map((row: any) => row.system_name).filter(Boolean));
      
      // Auto-load default if available and no system currently loaded
      if (!shiftSystemName) {
        const defaultSystem = (data || []).find((row: any) => row.is_default);
        if (defaultSystem) {
           // We found a default system, let's load it
           // Use a slight timeout to ensure state is ready if called from useEffect
           setTimeout(() => loadShiftSystem(defaultSystem.system_name), 0);
        }
      }
    } catch (err: any) {
      console.error('Error loading registered shift systems:', err);
      setRegisteredError(err?.message || 'Failed to load registered shift systems.');
    } finally {
      setRegisteredLoading(false);
    }
  };

  React.useEffect(() => {
    loadRegisteredSystems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadShiftSystem = async (name: string) => {
    setSaveMessage('Loading selected shift system...');
    setLoadingSystem(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_shift_system_definitions')
        .select('system_name, number_of_shifts, start_date, start_time, duration_hours, shift_names, rotation_order, shift_colors, active, is_default')
        .eq('system_name', name)
        .single();
      if (error) throw error;
      if (!data) {
        setSaveMessage('No data found for the selected shift system.');
        return;
      }
      setShiftSystemName((data as any).system_name || name);
      setLastLoadedSystemName((data as any).system_name || name);
      setIsDefault(!!(data as any).is_default);
      
      const loaded: PatternDef = {
        patternName: 'Pattern 1',
        numberOfShifts: (data as any).number_of_shifts ?? 1,
        startDate: (data as any).start_date ?? '',
        startTime: (data as any).start_time ?? '08:00',
        durationHours: (data as any).duration_hours ?? 12,
        shiftNames: Array.isArray((data as any).shift_names) ? (data as any).shift_names : [],
        rotationOrder: Array.isArray((data as any).rotation_order) ? (data as any).rotation_order : [],
        shiftColors: Array.isArray((data as any).shift_colors) ? (data as any).shift_colors : [],
      };
      setPatterns([loaded]);
      setSelectedPatternIndex(0);
      setViewMode(true);
      setSaveMessage(`Loaded "${(data as any).system_name || name}" into the form.`);
    } catch (err: any) {
      console.error('Error loading shift system:', err);
      const msg = err?.message || 'Failed to load selected shift system.';
      setSaveMessage(msg);
    } finally {
      setLoadingSystem(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section with image */}
      <Section aria-labelledby="shift-definition-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="shift-definition-title">
                Shift System Definition
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Define your department’s primary shift system model. This establishes how personnel rotate across duty periods—for example fixed 24/48 cycles, rotating day–evening–night shifts, split shifts, or a custom operational schedule tailored to your department.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="Shift System Definition" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/RegisterYourService.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  No image available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Definition Form Section */}
      <FormSection>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SubTitle>Shift System Setup</SubTitle>
          <div>
            <AddButton onClick={handleAdd} type="button" disabled={!viewMode}>Add New Shift</AddButton>
            <SaveButton onClick={handleSave} type="button" disabled={saving || viewMode}>
              {saving ? 'Saving...' : 'Save Shift System'}
            </SaveButton>
            <RefreshButton onClick={handleEdit} type="button" disabled={!viewMode}>Edit</RefreshButton>
          </div>
        </div>


        <FormContainer onSubmit={(e) => e.preventDefault()}>
          <FieldColumn>
            <InlineRow>
              <Label htmlFor={viewMode ? 'systemNameSelect' : 'systemName'} style={{ marginBottom: 0 }}>Shift System Name</Label>
              {viewMode ? (
                <Select
                  id="systemNameSelect"
                  value={shiftSystemName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setShiftSystemName(name);
                    if (name) {
                      loadShiftSystem(name);
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  <option value="">Select a saved shift system...</option>
                  {registeredSystems.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  id="systemName"
                  type="text"
                  value={shiftSystemName}
                  onChange={(e) => setShiftSystemName(e.target.value)}
                  placeholder="Enter a name for this shift system"
                  style={{ flex: 1 }}
                />
              )}
            </InlineRow>
            <InlineRow style={{ marginTop: 10 }}>
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={viewMode}
                style={{ width: 18, height: 18, cursor: viewMode ? 'not-allowed' : 'pointer' }}
              />
              <Label htmlFor="isDefault" style={{ marginBottom: 0, cursor: viewMode ? 'not-allowed' : 'pointer' }}>
                Set as Default System (Automatically displayed)
              </Label>
            </InlineRow>
          </FieldColumn>

          <ThreeColumnRow>
            {/* Column 1 spans two rows */}
            <FieldColumn style={{ gridColumn: '1', gridRow: '1 / 3' }}>
              <Label htmlFor="numShifts">Number of Shifts</Label>
              <Input
                id="numShifts"
                type="number"
                min={1}
                max={12}
                value={current.numberOfShifts}
                onChange={(e) => setNumberOfShifts(parseInt(e.target.value || '1', 10))}
                disabled={viewMode}
                placeholder="Limits how many shifts can be defined and used."
                title="Limits how many shifts can be defined and used."
              />

              <Label htmlFor="startDate">Shift Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={current.startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setPatterns((prev) => {
                    const next = [...prev];
                    next[selectedPatternIndex] = { ...next[selectedPatternIndex], startDate: val };
                    return next;
                  });
                }}
                disabled={viewMode}
                placeholder="Determines when the shift schedule will commence."
                title="Determines when the shift schedule will commence."
              />

              <Label htmlFor="startTime">Shift Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={current.startTime}
                onChange={(e) => {
                  const val = e.target.value;
                  setPatterns((prev) => {
                    const next = [...prev];
                    next[selectedPatternIndex] = { ...next[selectedPatternIndex], startTime: val };
                    return next;
                  });
                }}
                disabled={viewMode}
                placeholder="Daily time when shifts begin."
                title="Daily time when shifts begin."
              />

              <Label htmlFor="duration">Shift Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={24}
                value={current.durationHours}
                onChange={(e) => {
                  const val = parseInt(e.target.value || '0', 10);
                  setPatterns((prev) => {
                    const next = [...prev];
                    next[selectedPatternIndex] = { ...next[selectedPatternIndex], durationHours: val };
                    return next;
                  });
                }}
                disabled={viewMode}
                placeholder="Used to calculate shift end time and next shift start."
                title="Used to calculate shift end time and next shift start."
              />

              <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>End Time Preview</div>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  {current.startTime ? `Ends at ${endTimePreview}` : 'Select a start time'}
                </div>
              </div>
            </FieldColumn>

            {/* Column 2 (shortened height) */}
            <CompactFieldColumn style={{ gridColumn: '2', gridRow: '1' }}>
              <Label>Names of Shifts</Label>
              {Array.from({ length: current.numberOfShifts }, (_, i) => (
                <div key={`name-${i}`}>
                  <div style={{ fontSize: 12, color: '#334155' }}>Shift {i + 1}</div>
                  <NameColorRow>
                    <Input
                      type="text"
                      value={current.shiftNames[i] || ''}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      placeholder={`Enter name for shift ${i + 1}`}
                      disabled={viewMode}
                    />
                    <ColorInput
                      type="color"
                      value={current.shiftColors[i] || defaultPalette[i % defaultPalette.length]}
                      onChange={(e) => handleColorChange(i, e.target.value)}
                      aria-label={`Colour for shift ${i + 1}`}
                      title="Select colour"
                      disabled={viewMode}
                    />
                  </NameColorRow>
                </div>
              ))}
            </CompactFieldColumn>

            {/* Column 3 (shortened height) */}
            <CompactFieldColumn style={{ gridColumn: '3', gridRow: '1' }}>
              <Label>Shift Pattern (Rotation Order)</Label>
              {Array.from({ length: current.numberOfShifts }, (_, pos) => (
                <div key={`rot-${pos}`}>
                  <div style={{ fontSize: 12, color: '#334155' }}>Position {pos + 1}</div>
                  <Select
                    value={current.rotationOrder[pos] ?? 0}
                    onChange={(e) => handleRotationChange(pos, parseInt(e.target.value, 10))}
                    disabled={viewMode}
                  >
                    {current.shiftNames.map((name, idx) => (
                      <option key={`opt-${idx}`} value={idx}>
                        {name || `Shift ${idx + 1}`}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
              {rotationWarning && (
                <div style={{ fontSize: 12, color: '#b91c1c' }}>{rotationWarning}</div>
              )}
            </CompactFieldColumn>
          {/* Registered Shift Systems spanning columns 2–3 (inside grid) */}
          <FieldColumn style={{ gridColumn: '2 / 4', gridRow: '2' }}>
            <Label>Registered Shift Systems</Label>
            {registeredLoading && (
              <div style={{ fontSize: 13, color: '#334155' }}>Loading...</div>
            )}
            {registeredError && (
              <div style={{ fontSize: 12, color: '#b91c1c' }}>{registeredError}</div>
            )}
            {!registeredLoading && !registeredError && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {registeredSystems.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#64748b' }}>No shift systems found.</div>
                ) : (
                  registeredSystems.map((name, idx) => (
                    <RegisteredSystemButton
                      key={name}
                      $color={registeredButtonPalette[idx % registeredButtonPalette.length]}
                      onClick={() => loadShiftSystem(name)}
                      title="Click to load into form"
                    >
                      {name}
                    </RegisteredSystemButton>
                  ))
                )}
              </div>
            )}
          </FieldColumn>
          </ThreeColumnRow>

          {saveMessage && (
            <StatusBar role="status">{saveMessage}</StatusBar>
          )}
        </FormContainer>
      </FormSection>
    </MainContent>
  );
};