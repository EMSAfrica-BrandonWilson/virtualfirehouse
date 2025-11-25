import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';

// Compute accessible text color (black/white) based on background color
const getContrastColor = (bg: string): string => {
  try {
    let r = 0, g = 0, b = 0;
    if (bg.startsWith('#')) {
      const hex = bg.replace('#', '');
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    } else if (bg.startsWith('rgb')) {
      const parts = bg
        .replace(/rgba?\(/, '')
        .replace(/\)/, '')
        .split(',')
        .map(v => parseFloat(v.trim()));
      r = parts[0] || 0;
      g = parts[1] || 0;
      b = parts[2] || 0;
    }
    // Perceived brightness
    const brightness = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    return brightness > 140 ? '#000000' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
};

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;

  @media print {
    margin: 0;
    font-size: 10pt;
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;

  @media print {
    page-break-inside: avoid;
    margin-bottom: 1rem;
  }
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

  @media print {
    display: none;
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

  const SelectorRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 4px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
  `;

  const SelectLabel = styled.label`
    color: #1177BB;
    font-weight: 600;
    font-size: 1rem;
  `;

  const SelectControl = styled.select`
    /* Use native select styling so the default arrow (triangle) appears */
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 1rem;
    color: #333;
    width: 520px;
    min-width: 520px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    transition: border-color 0.2s ease;

    &:hover {
      border-color: #99c2e6;
    }

    &:focus {
      outline: none;
      border-color: #1177BB;
      box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.15);
    }
    
    @media (max-width: 768px) {
      width: 100%;
      min-width: 100%;
    }
  `;

  const DefaultHelper = styled.div`
    flex-basis: 100%;
    font-size: calc(0.9rem + 1px);
    color: #666;
    margin-top: 2px;
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

const CalendarContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;

  @media print {
    box-shadow: none;
    padding: 0;
    page-break-inside: avoid;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #FF9900;
`;

const MonthYearDisplay = styled.h2`
  font-size: 1.8rem;
  color: #1177BB;
  margin: 0;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 10px;

  @media print {
    display: none;
  }
`;

const NavButton = styled.button`
  background-color: #1177BB;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0f5c99;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TodayButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const PrintButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #e68900;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media print {
    display: none;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #ddd;
  border: 1px solid #ddd;

  @media print {
    border: 2px solid #000;
    background-color: #000;
  }
`;

const DayHeader = styled.div`
  background-color: #1177BB;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
`;

  const DayCell = styled.div<{ $isToday?: boolean; $isCurrentMonth?: boolean; $isHoliday?: boolean }>`
  background-color: ${props => props.$isToday ? '#fff3cd' : (props.$isHoliday ? '#fff0f0' : 'white')};
  min-height: 100px;
  padding: 8px;
  position: relative;
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.4};
  border: ${props => props.$isToday ? '2px solid #FF9900' : (props.$isHoliday ? '2px solid #c33' : 'none')};
  
  @media (max-width: 768px) {
    min-height: 80px;
    padding: 4px;
  }
  `;

  const HolidayIcon = styled.span`
    display: inline-block;
    color: #c33;
    font-size: 1.5rem;
    line-height: 1;
    margin-left: 6px;
    vertical-align: middle;
  `;

  const LegendIcon = styled.span`
    display: inline-block;
    color: #c33;
    font-size: 1.65rem;
    line-height: 1;
    margin-right: 6px;
    vertical-align: middle;
  `;

const DayNumber = styled.div<{ $isToday?: boolean }>`
  font-size: 0.9rem;
  font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
  color: ${props => props.$isToday ? '#FF9900' : '#333'};
  margin-bottom: 0;
`;

const ShiftBadge = styled.div<{ $color: string }>`
  background-color: ${props => props.$color};
  color: ${props => getContrastColor(props.$color)};
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 12px;
  margin-bottom: 3px;
  text-align: center;
  font-weight: 600;
  text-shadow: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const DayHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

const NoteInput = styled.textarea`
  width: 100%;
  min-height: 44px;
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  color: #333;
  background: #fff;
  margin-top: 6px;

  &::placeholder {
    color: #888;
  }
`;

const Legend = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const LegendTitle = styled.h3`
  color: #1177BB;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 30px;
  height: 20px;
  background-color: ${props => props.$color};
  border-radius: 3px;
  border: 1px solid #ddd;
`;

const LegendLabel = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const BadgeRowTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
`;

const BadgeRowBottom = styled.div`
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-end;
  justify-content: flex-start;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border: 1px solid #fcc;
`;

interface OperationalShift {
  id: number;
  shift_name: string;
  shift_start_date: string;
  color: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  shift_duration?: number;
  active: boolean;
}

export function ShiftSystems() {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-shift-systems', '/images/ShiftSchedule.png');
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<OperationalShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentLogo, setDepartmentLogo] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [useDefinition, setUseDefinition] = useState<boolean>(false);
  const [definitionName, setDefinitionName] = useState<string | null>(null);
  const [definitions, setDefinitions] = useState<ShiftSystemDefinitionRow[]>([]);
  const [definitionsLoading, setDefinitionsLoading] = useState<boolean>(false);
  const [definitionsError, setDefinitionsError] = useState<string>('');
  const [initialized, setInitialized] = useState<boolean>(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesLoading, setNotesLoading] = useState<boolean>(false);
  const [notesError, setNotesError] = useState<string>('');
  const [saudiHolidays, setSaudiHolidays] = useState<Set<string>>(new Set());
  const [saudiHolidayNames, setSaudiHolidayNames] = useState<Record<string, string>>({});
  // Saved default selection for the Shift Calendar dropdown
  const [defaultDefinition, setDefaultDefinition] = useState<string | null>(null);

  interface ShiftSystemDefinitionRow {
    system_name: string;
    number_of_shifts: number;
    start_date: string;
    shift_names: string[];
    rotation_order: number[];
    shift_colors: string[];
    active: boolean;
  }

  // Helpers to ensure Saudi local date handling (avoid UTC shifts)
  const formatDateYMDLocal = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseYMDLocal = (s: string): Date => {
    const [yStr, mStr, dStr] = s.split('-');
    const y = parseInt(yStr || '0', 10);
    const m = parseInt(mStr || '1', 10);
    const d = parseInt(dStr || '1', 10);
    return new Date(y, (m - 1), d);
  };

  const daysBetweenLocal = (a: Date, b: Date): number => {
    const aLocal = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bLocal = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    const diffMs = aLocal.getTime() - bLocal.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  // Weekend in Saudi Arabia is Friday (5) and Saturday (6)
  const isSaudiWeekend = (d: Date): boolean => {
    const wd = d.getDay();
    return wd === 5 || wd === 6;
  };

  const isSaudiHoliday = (d: Date): boolean => {
    const ymd = formatDateYMDLocal(d);
    return saudiHolidays.has(ymd);
  };

  const getSaudiHolidayName = (d: Date): string | undefined => {
    const ymd = formatDateYMDLocal(d);
    return saudiHolidayNames[ymd];
  };

  // Fixed-date fallback holidays (if no dataset is available)
  const getDefaultSaudiHolidays = (year: number): string[] => [
    `${year}-02-22`, // Founding Day
    `${year}-09-23`, // National Day
  ];

  const getDefaultSaudiHolidayNames = (year: number): Record<string, string> => ({
    [`${year}-02-22`]: 'Saudi Founding Day',
    [`${year}-09-23`]: 'Saudi National Day',
  });

  // Count working days (Sun-Thu) excluding holidays between two dates
  const workingDaysBetweenLocal = (a: Date, b: Date): number => {
    const aLocal = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bLocal = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    if (aLocal.getTime() === bLocal.getTime()) return 0;

    let count = 0;
    if (aLocal.getTime() > bLocal.getTime()) {
      const cur = new Date(bLocal);
      while (cur.getTime() < aLocal.getTime()) {
        cur.setDate(cur.getDate() + 1);
        if (!isSaudiWeekend(cur) && !isSaudiHoliday(cur)) count++;
      }
      return count;
    } else {
      const cur = new Date(bLocal);
      while (cur.getTime() > aLocal.getTime()) {
        cur.setDate(cur.getDate() - 1);
        if (!isSaudiWeekend(cur) && !isSaudiHoliday(cur)) count--;
      }
      return count;
    }
  };

  // Load Saudi holidays from Supabase if available; fallback to localStorage
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const year = currentDate.getFullYear();
        const start = `${year}-01-01`;
        const end = `${year}-12-31`;
        const { data, error } = await supabase
          .from('public_holidays')
          .select('holiday_date, country_code')
          .eq('country_code', 'SA')
          .gte('holiday_date', start)
          .lte('holiday_date', end);
        if (error) throw error;
        const setVals = new Set<string>();
        const names: Record<string, string> = {};
        (data || []).forEach((row: any) => {
          const dStr = row?.holiday_date as string | undefined;
          const ymd = dStr?.slice(0, 10);
          if (ymd) {
            setVals.add(ymd);
            const n = (row?.holiday_name || row?.name || row?.title) as string | undefined;
            if (n) names[ymd] = n;
          }
        });
        if (setVals.size === 0) {
          // Fallback to fixed-date holidays so the UI can indicate holidays
          const defaults = getDefaultSaudiHolidays(year);
          defaults.forEach(d => setVals.add(d));
          const defaultNames = getDefaultSaudiHolidayNames(year);
          Object.assign(names, defaultNames);
        }
        setSaudiHolidays(setVals);
        setSaudiHolidayNames(names);
      } catch (err) {
        try {
          const raw = localStorage.getItem('saudi_public_holidays');
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const setVals = new Set<string>();
              const names: Record<string, string> = {};
              arr.forEach((item: any) => {
                if (typeof item === 'string') {
                  // just a date string
                  const ymd = (item as string).slice(0, 10);
                  if (ymd) setVals.add(ymd);
                } else if (item && typeof item === 'object') {
                  // support common shapes: {date, name} or {holiday_date, holiday_name}
                  const ymd = (item.date || item.holiday_date || '').slice(0, 10);
                  const n = (item.name || item.holiday_name || item.title) as string | undefined;
                  if (ymd) {
                    setVals.add(ymd);
                    if (n) names[ymd] = n;
                  }
                }
              });
              if (setVals.size === 0) {
                const year = currentDate.getFullYear();
                const defaults = getDefaultSaudiHolidays(year);
                const defaultNames = getDefaultSaudiHolidayNames(year);
                defaults.forEach(d => setVals.add(d));
                Object.assign(names, defaultNames);
              }
              setSaudiHolidays(setVals);
              setSaudiHolidayNames(names);
            } else {
              setSaudiHolidays(new Set());
              setSaudiHolidayNames({});
            }
          } else {
            const year = currentDate.getFullYear();
            const defaults = getDefaultSaudiHolidays(year);
            const defaultNames = getDefaultSaudiHolidayNames(year);
            setSaudiHolidays(new Set(defaults));
            setSaudiHolidayNames(defaultNames);
          }
        } catch {
          const year = currentDate.getFullYear();
          const defaults = getDefaultSaudiHolidays(year);
          const defaultNames = getDefaultSaudiHolidayNames(year);
          setSaudiHolidays(new Set(defaults));
          setSaudiHolidayNames(defaultNames);
        }
      }
    };
    loadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getFullYear()]);

  const getMonthRangeYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return {
      startYMD: formatDateYMDLocal(start),
      endYMD: formatDateYMDLocal(end),
      year: y,
      monthIndex: m,
    };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Load all available definitions first
        const defs = await loadAllShiftDefinitions();

        // Read saved default selection from localStorage
        const key = user ? `defaultShiftSystem:${user.id}` : 'defaultShiftSystem:guest';
        const saved = localStorage.getItem(key);
        if (saved) {
          setDefaultDefinition(saved);
          if (saved === '__operational__') {
            // Use operational shifts
            setDefinitionName(null);
            setUseDefinition(false);
            await loadShifts();
          } else {
            // Try to find and apply the saved definition from freshly loaded list
            const row = defs.find(d => d.system_name === saved);
            if (row) {
              applyDefinitionRow(row);
              setLoading(false);
            } else {
              // Saved value not found; fall back to active definition from server
              const usedDef = await loadActiveShiftSystemDefinition();
              if (!usedDef) {
                await loadShifts();
              } else {
                setLoading(false);
              }
            }
          }
        } else {
          // No saved default; use active server-side definition if present, otherwise operational_shifts
          const usedDef = await loadActiveShiftSystemDefinition();
          if (!usedDef) {
            await loadShifts();
          } else {
            setLoading(false);
          }
        }
      } finally {
        if (mounted) setInitialized(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Defer month-based loads until initial load completes
    if (!initialized) return;
    // If using a saved definition to drive the calendar, skip loading operational_shifts
    if (!useDefinition) {
      loadShifts();
    } else {
      setLoading(false);
    }
  }, [currentDate, initialized, useDefinition]);

  useEffect(() => {
    // Load any existing notes for the displayed month for the current user
    const loadNotesForMonth = async () => {
      if (!user) return; // Only load notes for logged-in users
      try {
        setNotesLoading(true);
        setNotesError('');
        const { startYMD, endYMD, year, monthIndex } = getMonthRangeYMD(currentDate);
        const { data, error } = await supabase
          .from('user_day_notes')
          .select('date,note')
          .eq('user_id', user.id)
          .gte('date', startYMD)
          .lte('date', endYMD);

        if (error) throw error;

        const map: Record<string, string> = {};
        (data || []).forEach((row: any) => {
          if (row && row.date && typeof row.note === 'string' && row.note.trim().length > 0) {
            map[row.date] = row.note;
          }
        });

        // Fallback merge from localStorage cache for this month
        const cacheKey = `notes:${user.id}:${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedMap = JSON.parse(cached);
            Object.assign(map, cachedMap);
          } catch {}
        }

        setNotes(map);
      } catch (err: any) {
        console.warn('Note loading failed, using local cache if available:', err?.message || err);
        try {
          if (user) {
            const { year, monthIndex } = getMonthRangeYMD(currentDate);
            const cacheKey = `notes:${user.id}:${year}-${String(monthIndex + 1).padStart(2, '0')}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) setNotes(JSON.parse(cached));
          }
        } catch {}
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotesForMonth();
  }, [currentDate, user?.id]);

  const saveNoteForDate = async (dateStr: string, text: string) => {
    if (!user) return;
    const trimmed = text.trim();
    const { year, monthIndex } = getMonthRangeYMD(parseYMDLocal(dateStr));
    const cacheKey = `notes:${user.id}:${year}-${String(monthIndex + 1).padStart(2, '0')}`;

    try {
      if (trimmed.length > 0) {
        await supabase
          .from('user_day_notes')
          .upsert({ user_id: user.id, date: dateStr, note: trimmed }, { onConflict: 'user_id,date' });
      } else {
        await supabase
          .from('user_day_notes')
          .delete()
          .eq('user_id', user.id)
          .eq('date', dateStr);
      }
    } catch (err) {
      console.warn('Supabase note save failed, using localStorage cache:', err);
      try {
        const existing = localStorage.getItem(cacheKey);
        const map = existing ? JSON.parse(existing) : {};
        if (trimmed.length > 0) {
          map[dateStr] = trimmed;
        } else {
          delete map[dateStr];
        }
        localStorage.setItem(cacheKey, JSON.stringify(map));
      } catch {}
    }
  };

  const handleNoteChange = (dateStr: string, value: string) => {
    setNotes(prev => ({ ...prev, [dateStr]: value }));
  };

  const handleNoteBlur = (dateStr: string) => {
    const text = notes[dateStr] || '';
    saveNoteForDate(dateStr, text);
  };

  useEffect(() => {
    loadDepartmentLogo();
  }, []);

  const loadShifts = async () => {
    // If a shift system definition is active, avoid loading operational_shifts
    if (useDefinition) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const { data, error: fetchError } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('*')
        .eq('active', true)
        .not('shift_start_date', 'is', null)
        .order('shift_start_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Avoid overriding definition-driven shifts if definition toggled on while fetching
      if (useDefinition) {
        setLoading(false);
        return;
      }
      setShifts(data || []);
    } catch (err: any) {
      console.error('Error loading shifts:', err);
      setError('Failed to load operational shifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentLogo = async () => {
    try {
      const response = await fetch('/images/daco-new-logo.jpg');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepartmentLogo(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading department logo:', err);
    }
  };

  // Prefer saved shift system definition: system name, start date, rotation order, and colors
  const loadActiveShiftSystemDefinition = async (): Promise<boolean> => {
    try {
      const { data, error: defErr } = await supabase
        .from('02_admin_shift_system_definitions')
        .select('system_name, number_of_shifts, start_date, shift_names, rotation_order, shift_colors, active')
        .eq('active', true)
        .order('system_name', { ascending: true })
        .limit(1);

      if (defErr) throw defErr;

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!row) {
        // No active definition found; fall back to operational_shifts
        setUseDefinition(false);
        return false;
      }

      const systemName = (row as any).system_name as string | null;
      const startDateStr = (row as any).start_date as string | null;
      const rotationOrder = (row as any).rotation_order as number[] | null;
      const shiftNames = (row as any).shift_names as string[] | null;
      const shiftColors = (row as any).shift_colors as string[] | null;
      const count = (row as any).number_of_shifts as number | null;

      if (!startDateStr || !rotationOrder || !shiftNames || !shiftColors || !count || count < 1) {
        // Incomplete definition; skip using it
        setUseDefinition(false);
        return false;
      }

      // Construct synthetic OperationalShift entries in the exact rotation order.
      // Position One maps to rotationOrder[0]; subsequent positions follow.
      const baseDate = parseYMDLocal(startDateStr);
      const synthetic: OperationalShift[] = rotationOrder.slice(0, count).map((shiftIdx, pos) => {
        const dt = new Date(baseDate);
        dt.setDate(baseDate.getDate() + pos);
        const name = shiftNames[shiftIdx] ?? `Shift ${shiftIdx + 1}`;
        const color = shiftColors[shiftIdx] ?? '#1177BB';
        const iso = formatDateYMDLocal(dt);
        return {
          id: pos,
          shift_name: name,
          shift_start_date: iso,
          color,
          description: '',
          start_time: undefined,
          end_time: undefined,
          shift_duration: undefined,
          active: true,
        };
      });

      setDefinitionName(systemName);
      setShifts(synthetic);
      setUseDefinition(true);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Error loading active shift system definition:', err);
      // Fall back to operational_shifts
      setUseDefinition(false);
      return false;
    }
  };

  const loadAllShiftDefinitions = async (): Promise<ShiftSystemDefinitionRow[]> => {
    try {
      setDefinitionsLoading(true);
      setDefinitionsError('');
      const { data, error: defErr } = await supabase
        .from('02_admin_shift_system_definitions')
        .select('system_name, number_of_shifts, start_date, shift_names, rotation_order, shift_colors, active')
        .order('system_name', { ascending: true });

      if (defErr) throw defErr;
      const rows = (data as any as ShiftSystemDefinitionRow[]) || [];
      setDefinitions(rows);
      return rows;
    } catch (err: any) {
      console.error('Error loading shift system definitions:', err);
      setDefinitionsError('Failed to load shift system definitions.');
      return [];
    } finally {
      setDefinitionsLoading(false);
    }
  };

  const applyDefinitionRow = (row: ShiftSystemDefinitionRow) => {
    const { system_name, number_of_shifts, start_date, rotation_order, shift_names, shift_colors } = row;
    if (!start_date || !rotation_order || !shift_names || !shift_colors || !number_of_shifts || number_of_shifts < 1) {
      setUseDefinition(false);
      setDefinitionName(null);
      return;
    }

    const baseDate = parseYMDLocal(start_date);
    const synthetic: OperationalShift[] = rotation_order.slice(0, number_of_shifts).map((shiftIdx, pos) => {
      const dt = new Date(baseDate);
      dt.setDate(baseDate.getDate() + pos);
      const name = shift_names[shiftIdx] ?? `Shift ${shiftIdx + 1}`;
      const color = shift_colors[shiftIdx] ?? '#1177BB';
      const iso = formatDateYMDLocal(dt);
      return {
        id: pos,
        shift_name: name,
        shift_start_date: iso,
        color,
        description: '',
        start_time: undefined,
        end_time: undefined,
        shift_duration: undefined,
        active: true,
      };
    });

    setDefinitionName(system_name);
    setShifts(synthetic);
    setUseDefinition(true);
    setLoading(false);
  };

  const handleDefinitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__operational__') {
      setDefinitionName(null);
      setUseDefinition(false);
      loadShifts();
      return;
    }
    const row = definitions.find(d => d.system_name === value);
    if (row) {
      applyDefinitionRow(row);
    }
  };

  /**
   * Async logo conversion function for PDF generation
   * Ensures logo is properly loaded and converted to base64 format before PDF creation
   */
  const convertLogoToBase64 = async (): Promise<string | undefined> => {
    try {
      // If logo is already loaded in state, return it directly
      if (departmentLogo) {
        return departmentLogo;
      }

      // If not loaded, fetch and convert the logo
      const response = await fetch('/images/daco-new-logo.jpg');
      if (!response.ok) {
        throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            // Update the state for future use
            setDepartmentLogo(reader.result);
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert logo to base64'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading logo blob'));
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error converting logo to base64:', err);
      return undefined;
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getShiftsForDate = (date: Date) => {
    if (shifts.length === 0) return [];

    // Get unique shifts sorted by their start date to establish the pattern
    const uniqueShifts = getUniqueShifts();
    if (uniqueShifts.length === 0) return [];

    // Find the earliest shift start date to use as the pattern starting point
    const sortedShifts = [...shifts].sort((a, b) => 
      parseYMDLocal(a.shift_start_date).getTime() - parseYMDLocal(b.shift_start_date).getTime()
    );
    const patternStartDate = parseYMDLocal(sortedShifts[0].shift_start_date);

    const isDayShift = useDefinition && typeof definitionName === 'string' && /day\s*shift/i.test(definitionName || '');
    const is4896 = useDefinition && typeof definitionName === 'string' && (
      /48-On\/96-Off/i.test(definitionName) ||
      /48(?:\s|-)?(?:on)?(?:\s|-|\/)?96(?:\s|-)?(?:off)?/i.test(definitionName)
    );
    const isTwoTwoNinetySix = useDefinition && typeof definitionName === 'string' && /2\(12hrs-Day\)\s*\/\s*2\(12hrs-Night\)\s*\/\s*96hrs-Off/i.test(definitionName || '');

    // Calculate the number of days from the pattern start to the current date
    const daysDiff = isDayShift
      ? workingDaysBetweenLocal(date, patternStartDate)
      : daysBetweenLocal(date, patternStartDate);

    if (isTwoTwoNinetySix) {
      const cycle = 8;
      const daysDiff = daysBetweenLocal(date, patternStartDate);
      const idx = ((daysDiff % cycle) + cycle) % cycle;
      const results: OperationalShift[] = [];
      uniqueShifts.forEach((baseShift, i) => {
        const offset = (i * 2) % cycle;
        const statusIdx = (idx + offset) % cycle;
        if (statusIdx === 0 || statusIdx === 1) {
          const color = baseShift.color || '#1177BB';
          results.push({
            id: i * 100 + statusIdx,
            shift_name: `${baseShift.shift_name} - Day`,
            shift_start_date: formatDateYMDLocal(date),
            color,
            description: '12-hour day shift',
            start_time: '08:00',
            end_time: '20:00',
            shift_duration: 12,
            active: true,
          } as OperationalShift);
        } else if (statusIdx === 2 || statusIdx === 3) {
          const baseColor = baseShift.color || '#1177BB';
          const nightColor = baseColor.startsWith('#') ? baseColor : '#1177BB';
          results.push({
            id: i * 100 + statusIdx,
            shift_name: `${baseShift.shift_name} - Night`,
            shift_start_date: formatDateYMDLocal(date),
            color: nightColor,
            description: '12-hour night shift',
            start_time: '20:00',
            end_time: '08:00',
            shift_duration: 12,
            active: true,
          } as OperationalShift);
        }
      });
      return results;
    }

    const blockDays = is4896 ? 2 : 1;
    const periodDays = uniqueShifts.length * blockDays;

    let dayIndex = daysDiff % periodDays;
    if (dayIndex < 0) dayIndex = (dayIndex + periodDays) % periodDays;

    const actualIndex = Math.floor(dayIndex / blockDays);

    // For day-shift schedules, there is no duty on Saudi weekends or public holidays
    if (isDayShift && (isSaudiWeekend(date) || isSaudiHoliday(date))) {
      return [];
    }

    // Return the on-duty crew (shift) for this day based on the repeating pattern
    return [uniqueShifts[actualIndex]];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];

    // Add previous month's trailing days
    const prevMonthDays = startingDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDay = prevMonth.getDate();
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      const isHolidayPrev = isSaudiHoliday(date);
      const holidayNamePrev = getSaudiHolidayName(date);
      days.push(
        <DayCell key={`prev-${day}`} $isCurrentMonth={false} $isHoliday={isHolidayPrev}>
          <DayNumber>{day}</DayNumber>
          {isHolidayPrev && (
            <HolidayIcon title={holidayNamePrev || 'Public Holiday'} aria-label={holidayNamePrev || 'Public Holiday'}>☪</HolidayIcon>
          )}
        </DayCell>
      );
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayShifts = getShiftsForDate(date);
      const isTodayDate = isToday(date);
      const ymd = formatDateYMDLocal(date);
      const isHolidayCurrent = isSaudiHoliday(date);
      const holidayNameCurrent = getSaudiHolidayName(date);
      const firstShift = dayShifts[0];

      days.push(
        <DayCell key={`current-${day}`} $isToday={isTodayDate} $isCurrentMonth={true} $isHoliday={isHolidayCurrent}>
          <DayHeaderRow>
            <DayNumber $isToday={isTodayDate}>{day}</DayNumber>
            {isHolidayCurrent && (
              <HolidayIcon title={holidayNameCurrent || 'Public Holiday'} aria-label={holidayNameCurrent || 'Public Holiday'}>☪</HolidayIcon>
            )}
          </DayHeaderRow>

          {(() => {
            const dayBadges = dayShifts.filter(s => /(^|\s)day(\s|$)/i.test(s.shift_name));
            const nightBadges = dayShifts.filter(s => /(^|\s)night(\s|$)/i.test(s.shift_name));
            const otherBadges = dayShifts.filter(s => !/(^|\s)day(\s|$)/i.test(s.shift_name) && !/(^|\s)night(\s|$)/i.test(s.shift_name));
            const topBadges = dayBadges.length > 0 ? dayBadges : otherBadges;
            return (
              <>
                <BadgeRowTop>
                  {topBadges.map(shift => (
                    <ShiftBadge 
                      key={`${shift.id}-top`} 
                      $color={shift.color || '#1177BB'}
                      title={`${shift.shift_name}\n${shift.description || ''}\n${shift.start_time ? `Time: ${shift.start_time} - ${shift.end_time}` : ''}`}
                    >
                      {shift.shift_name}
                    </ShiftBadge>
                  ))}
                </BadgeRowTop>
                <BadgeRowBottom>
                  {nightBadges.map(shift => (
                    <ShiftBadge 
                      key={`${shift.id}-bottom`} 
                      $color={shift.color || '#1177BB'}
                      title={`${shift.shift_name}\n${shift.description || ''}\n${shift.start_time ? `Time: ${shift.start_time} - ${shift.end_time}` : ''}`}
                    >
                      {shift.shift_name}
                    </ShiftBadge>
                  ))}
                </BadgeRowBottom>
              </>
            );
          })()}
        </DayCell>
      );
    }

    // Add next month's leading days to complete the grid
    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      const isHolidayNext = isSaudiHoliday(date);
      const holidayNameNext = getSaudiHolidayName(date);
      days.push(
        <DayCell key={`next-${day}`} $isCurrentMonth={false} $isHoliday={isHolidayNext}>
          <DayNumber>{day}</DayNumber>
          {isHolidayNext && (
            <HolidayIcon title={holidayNameNext || 'Public Holiday'} aria-label={holidayNameNext || 'Public Holiday'}>☪</HolidayIcon>
          )}
        </DayCell>
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthYearString = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getUniqueShifts = () => {
    const uniqueMap = new Map<string, OperationalShift>();
    // Sort shifts by start date first to maintain pattern order
    const sortedShifts = [...shifts].sort((a, b) => 
      new Date(a.shift_start_date).getTime() - new Date(b.shift_start_date).getTime()
    );
    
    sortedShifts.forEach(shift => {
      if (!uniqueMap.has(shift.shift_name)) {
        uniqueMap.set(shift.shift_name, shift);
      }
    });
    return Array.from(uniqueMap.values());
  };

  const generatePDF = async () => {
    if (!calendarRef.current) {
      setError('Calendar element not found.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');

    try {
      // Clear old PDF data from sessionStorage to prevent quota errors
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('pdf_')) {
          sessionStorage.removeItem(key);
        }
      });

      // Get the month/year for the report
      const monthYear = getMonthYearString();
      const { year, month } = getDaysInMonth(currentDate);
      
      // Calculate summary statistics
      const totalShifts = shifts.filter(s => {
        const shiftDate = new Date(s.shift_start_date);
        return shiftDate.getMonth() === month && shiftDate.getFullYear() === year;
      }).length;
      const summaryText = `Monthly Shift Schedule for ${monthYear} - Total Shifts: ${totalShifts}`;
      
      // Capture the calendar as an image using html2canvas
      const canvas = await html2canvas(calendarRef.current, {
        scale: 1.3,  // Optimized for balance between quality and file size
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: calendarRef.current.scrollWidth,
        windowHeight: calendarRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are properly cloned
          const clonedElement = clonedDoc.querySelector('[data-calendar-container]');
          if (clonedElement) {
            const el = clonedElement as HTMLElement;
            el.style.boxShadow = 'none';
            // Explicitly neutralize any transforms that could invert the calendar in the clone
            el.style.transform = 'none';
            el.style.transformOrigin = 'center center';
            // Reset any legacy rotation properties that might still be applied
            (el.style as any).rotate = '0deg';
            // Also ensure descendants do not carry transforms that affect rendering
            el.querySelectorAll('*').forEach((child) => {
              const node = child as HTMLElement;
              node.style.transform = 'none';
              node.style.transformOrigin = 'center center';
            });
          }
        }
      });
      
      // Use JPEG with higher compression for smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      
      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Ensure logo is loaded and converted for PDF generation
      const logoBase64 = await convertLogoToBase64();
      
      // Setup VFH A4 standard PDF with logo and header
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: `Operational Shift Schedule - ${monthYear}`,
          summaryText: summaryText,
          currentUser: { user, profile: userProfile }
        }
      });

      // Calculate dimensions to fill the full width of the PDF
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Use full width with small margins
      const margin = 10; // 10mm margin on each side
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = vfhSetup.tableStartY;
      const xPosition = margin; // Start at left margin
      
      // Check if image height exceeds available space
      const availableHeight = pageHeight - yPosition - 10;
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      // If image is too tall, scale it down but maintain full width
      if (imgHeight > availableHeight) {
        // Scale down proportionally to fit height while keeping full width
        finalHeight = availableHeight;
        // Keep full width - this will stretch the image slightly
        finalWidth = imgWidth;
      }
      
      // Add the calendar image to the PDF at full width
      doc.addImage(imgData, 'JPEG', xPosition, yPosition, finalWidth, finalHeight);

      // Generate filename and save to sessionStorage
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      // Set viewer context so the left-side menu stays on Shift Calendar
      sessionStorage.setItem('pdf_source_section', '/admin/register/shift-systems');
      sessionStorage.setItem('pdf_source_path', '/admin/register/shift-systems/process');
      
      navigate(`/pdf-viewer/${pdfKey}`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message, error.stack);
      setError(`Failed to generate PDF report: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="shift-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="shift-title">
                Shift Calendars
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Our shift systems registration encompasses 24/7 shift schedules, personnel rotation patterns, minimum staffing requirements, and emergency recall procedures that provide comprehensive visibility into workforce coverage and operational continuity.
              </Paragraph>
              <SelectorRow>
                <SelectLabel htmlFor="shift-system-select">Shift Calendar:</SelectLabel>
                <SelectControl
                  id="shift-system-select"
                  value={useDefinition && definitionName ? definitionName : '__operational__'}
                  onChange={handleDefinitionChange}
                >
                  <option value="__operational__">Operational Shifts (no system)</option>
                  {definitionsLoading && <option disabled>Loading calendars...</option>}
                  {!definitionsLoading && definitions.length === 0 && (
                    <option disabled>No saved calendars found</option>
                  )}
                  {!definitionsLoading && definitions.map(def => (
                    <option key={def.system_name} value={def.system_name}>
                      {def.system_name}{def.active ? ' (Active)' : ''}
                    </option>
                  ))}
                </SelectControl>
                {/* Default checkbox to persist the selected calendar */}
                <label htmlFor="shift-system-default" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    id="shift-system-default"
                    type="checkbox"
                    checked={(defaultDefinition || null) === (useDefinition && definitionName ? definitionName : '__operational__')}
                    onChange={(e) => {
                      const currentValue = useDefinition && definitionName ? definitionName : '__operational__';
                      const key = user ? `defaultShiftSystem:${user.id}` : 'defaultShiftSystem:guest';
                      if (e.target.checked) {
                        localStorage.setItem(key, currentValue);
                        setDefaultDefinition(currentValue);
                      } else {
                        localStorage.removeItem(key);
                        setDefaultDefinition(null);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  Set as default
                </label>
                <DefaultHelper aria-live="polite" id="shift-system-default-helper">
                  {(() => {
                    const selected = useDefinition && definitionName ? definitionName : '__operational__';
                    if (!defaultDefinition) return 'No default shift set.';
                    return defaultDefinition === selected
                      ? 'This shift will open by default for your account.'
                      : `Default set to "${defaultDefinition}".`;
                  })()}
                </DefaultHelper>
              </SelectorRow>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="Register Shift Systems" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/EMSA-Introduction.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Monthly Shift Calendar Section */}
      <Section>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <CalendarContainer ref={calendarRef} data-calendar-container="true">
          <CalendarHeader>
            <MonthYearDisplay>{getMonthYearString()}</MonthYearDisplay>
            <NavigationButtons>
              <NavButton onClick={goToPreviousMonth}>← Previous</NavButton>
              <TodayButton onClick={goToToday}>Today</TodayButton>
              <NavButton onClick={goToNextMonth}>Next →</NavButton>
              <PrintButton onClick={generatePDF} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? '⏳ Preparing logo & generating PDF...' : '🖨️ Print Schedule to PDF'}
              </PrintButton>
            </NavigationButtons>
          </CalendarHeader>

          {loading ? (
            <LoadingMessage>Loading shifts...</LoadingMessage>
          ) : (
            <>
              <CalendarGrid>
                <DayHeader>Sunday</DayHeader>
                <DayHeader>Monday</DayHeader>
                <DayHeader>Tuesday</DayHeader>
                <DayHeader>Wednesday</DayHeader>
                <DayHeader>Thursday</DayHeader>
                <DayHeader>Friday</DayHeader>
                <DayHeader>Saturday</DayHeader>
                {renderCalendar()}
              </CalendarGrid>

              {shifts.length > 0 && (
                <Legend>
                  <LegendTitle>Shift Legend</LegendTitle>
                  <LegendGrid>
                    {getUniqueShifts().map(shift => (
                      <LegendItem key={shift.id} $color={shift.color || '#1177BB'}>
                        <LegendColor $color={shift.color || '#1177BB'} />
                        <LegendLabel>{shift.shift_name}</LegendLabel>
                      </LegendItem>
                    ))}
                    <LegendItem key={'public-holiday'} $color={'#fff0f0'}>
                      <LegendColor $color={'#fff0f0'} />
                      <LegendLabel>
                        <LegendIcon title="Public Holiday" aria-label="Public Holiday">☪</LegendIcon>
                        Public Holiday
                      </LegendLabel>
                    </LegendItem>
                  </LegendGrid>
                </Legend>
              )}
            </>
          )}
        </CalendarContainer>
      </Section>
    </MainContent>
  );
}