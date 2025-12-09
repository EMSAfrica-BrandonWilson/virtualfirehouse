import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { formatDateTime, formatDateTimeReadable } from '../../lib/utils';
import { getRoleIndex } from '../../utils/pdfReportHelper';

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

const Column = styled.div`
  flex: 1;
  min-width: 0;
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

const FormSection = styled.div`
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
`;

const FireStationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const DatePickerLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
`;

const FireStationLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
`;

const DatePicker = styled.input`
  padding: 10px 15px;
  border: 2px solid #1177BB;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #0e5a8a;
  }
`;

const FireStationSelect = styled.select`
  padding: 10px 15px;
  border: 2px solid #1177BB;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 200px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #0e5a8a;
  }
`;

const ShiftContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ShiftLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
`;

const ShiftSelect = styled.select`
  padding: 10px 15px;
  border: 2px solid #1177BB;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 150px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #0e5a8a;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin: 0;
`;

const ClearModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ClearModalBox = styled.div`
  background: #ffffff;
  border-radius: 10px;
  width: 92%;
  max-width: 560px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 22px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: bold;
  color: #1177BB;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #1177BB;
  }
`;

const Select = styled.select`
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #1177BB;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background: white;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #1177BB;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background-color: #FF9900;
    color: white;
    
    &:hover {
      background-color: #e68800;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #545b62;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background-color: #dc3545;
    color: white;
    
    &:hover {
      background-color: #c82333;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const StaffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StaffTableHeader = styled.th`
  background: #1177BB;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  font-size: 1rem;
  border-bottom: 2px solid #0e5a8a;
`;

const StaffTableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
  color: #333;
`;

const StaffTableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
  
  &:hover {
    background: #e3f2fd;
  }
`;

export const DutyRosterCapturing: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('duty-roster-capturing', '/images/ControlRoom.png');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFireStation, setSelectedFireStation] = useState<string>('All Stations');
  const [selectedShift, setSelectedShift] = useState<string>('All Shifts');
  const [fireStations, setFireStations] = useState<any[]>([]);
  const [operationalShifts, setOperationalShifts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleLoadMessage, setVehicleLoadMessage] = useState<string>('');
  
  // State to track vehicle selections across all dropdowns
  const [vehicleSelections, setVehicleSelections] = useState<{[key: string]: string}>({});
  
  // State for staff data from staff_basic_info table
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [crew2Members, setCrew2Members] = useState<any[]>([]);
  const [crew1Members, setCrew1Members] = useState<any[]>([]);
  const [driverMembers, setDriverMembers] = useState<any[]>([]);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [formResetKey, setFormResetKey] = useState<number>(0);
  const [oicMembers, setOICMembers] = useState<any[]>([]);
  
  // State to track staff selections across all dropdowns
  const [staffSelections, setStaffSelections] = useState<{[key: string]: string}>({});

  // Station ordering as per StaffReportBlueShift
  const stationOrderList = [
    'main fire station',
    'sub fire station 1',
    'sub fire station 2', 
    'sub fire station 3',
    'medic tango'
  ];
  const stationOrderMap = new Map(stationOrderList.map((name, idx) => [name, idx]));
  
  // Rank formatting function from StaffReportBlueShift
  const formatRankName = (name?: string): string => {
    if (!name) return '-';
    // Fix specific misspelling without changing DB values globally
    const lower = name.toLowerCase();
    if (lower.includes('ambulance attendent') || lower.includes('ambulance attendant')) {
      return 'Ambulance Assistant';
    }
    return name;
  };

  // Station ordering helpers from StaffReportBlueShift
  const normalizeStation = (name?: string) => (name || '').toLowerCase().replace(/\./g, '').trim();
  const getStationIndex = (name?: string) => {
    const key = normalizeStation(name);
    return stationOrderMap.has(key) ? (stationOrderMap.get(key) as number) : 9999;
  };

  useEffect(() => {
    console.log('Initial data loading triggered...');
    console.log('Current fireStations before load:', fireStations.length);
    loadFireStations();
    loadOperationalShifts();
    loadVehicles();
    loadStaffMembers(); // No station parameter needed
    loadOICMembers();
    loadCrew2Members();
    loadCrew1Members();
    loadDriverMembers();
  }, [selectedDate]);

  // Reload vehicles when selected date changes since vehicle assignments are date-specific
  useEffect(() => {
    console.log('Selected date changed to:', selectedDate, '- reloading vehicles');
    loadVehicles();
    // Clear vehicle selections when date changes since available vehicles may change
    setVehicleSelections({});
  }, [selectedDate]);

  // Clear vehicle selections when fire station changes since available vehicles may change
  useEffect(() => {
    setVehicleSelections({});
  }, [selectedFireStation]);

  // Clear staff selections when fire station changes (but don't reload staff since staff filtering is only by shift)
  useEffect(() => {
    console.log('Fire station changed to:', selectedFireStation, '- clearing staff selections');
    // Clear staff selections when station changes (but staff data remains the same since filtering is only by shift)
    setStaffSelections({});
  }, [selectedFireStation]);

  // Reload staff when shift changes since shift dropdown filters staff
  useEffect(() => {
    console.log('Shift changed to:', selectedShift, '- reloading staff');
    loadStaffMembers();
    loadOICMembers();
    loadDriverMembers();
    loadCrew1Members();
    loadCrew2Members();
    // Clear staff selections when shift changes since available staff may change
    setStaffSelections({});
  }, [selectedShift]);

  // Monitor fire stations loading
  useEffect(() => {
    console.log('Fire stations state changed:', fireStations.length, 'stations');
    if (fireStations.length > 0) {
      console.log('Fire stations available, dropdown should be enabled');
      console.log('Available stations:', fireStations.map(s => s.fire_station_name || s.station_name));
    }
  }, [fireStations]);

  // Removed roster filtering logic since the second form was removed

  useEffect(() => {
    // If fire stations are loaded and none match the selected station, reset to 'All Stations'
    if (fireStations.length > 0 && selectedFireStation !== 'All Stations') {
      const stationExists = fireStations.some(station => station.fire_station_name === selectedFireStation);
      if (!stationExists) {
        setSelectedFireStation('All Stations');
      }
    }
  }, [fireStations, selectedFireStation, selectedShift]);

  // Filter vehicles based on selected fire station and exclude already selected vehicles
  const getFilteredVehicles = (excludeVehicle?: string) => {
    console.log('=== GET FILTERED VEHICLES DEBUG ===');
    console.log('Total vehicles in state:', vehicles.length);
    console.log('Selected fire station:', selectedFireStation);
    console.log('Exclude vehicle:', excludeVehicle);
    console.log('Current vehicle selections:', vehicleSelections);
    
    let filteredVehicles = vehicles;
    
    // Fire Station Allocation ONLY filters Response Vehicle dropdown
    if (selectedFireStation !== 'All Stations') {
      console.log('Filtering vehicles by fire station:', selectedFireStation);
      filteredVehicles = filteredVehicles.filter(vehicle => {
        const matches = vehicle.fire_station === selectedFireStation;
        console.log(`Vehicle ${vehicle.call_sign}: fire_station="${vehicle.fire_station}", selected="${selectedFireStation}", matches=${matches}`);
        return matches;
      });
      console.log('After fire station filter:', filteredVehicles.length, 'vehicles');
    } else {
      console.log('No fire station filtering applied (All Stations selected)');
    }
    
    // Get all selected vehicle values (excluding the current dropdown if specified)
    const selectedVehicleValues = Object.values(vehicleSelections).filter(v => v && v !== excludeVehicle);
    console.log('Selected vehicle values to exclude:', selectedVehicleValues);
    
    // Return vehicles with disabled status for already selected ones
    const result = filteredVehicles.map(vehicle => {
      const vehicleValue = `${vehicle.call_sign} ${vehicle.vehicle_type}`;
      const isAlreadySelected = selectedVehicleValues.includes(vehicleValue);
      console.log(`Vehicle ${vehicleValue}: isAlreadySelected=${isAlreadySelected}`);
      return {
        ...vehicle,
        disabled: isAlreadySelected
      };
    });
    
    console.log('Final filtered vehicles count:', result.length);
    console.log('=== GET FILTERED VEHICLES DEBUG END ===');
    return result;
  };

  const loadCrew2Members = async () => {
    try {
      let selectedShiftId = null;
      if (selectedShift !== 'All Shifts') {
        const { data: shiftData } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id')
          .eq('shift_name', selectedShift)
          .single();
        if (shiftData) selectedShiftId = shiftData.id;
      }

      // Use 02_admin_staff_1_registration directly
      let query = supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, middle_name, last_name, rank_id')
        .in('rank_id', [5, '5'])
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });

      if (selectedShiftId) {
        query = query.eq('operational_shift_id', selectedShiftId);
      }

      const { data: rows, error: err } = await query;
      
      const transformed = (rows || []).map((row: any) => ({
        staff_id: String(row?.staff_id ?? row?.id ?? ''),
        full_name: [row?.first_name, row?.middle_name, row?.last_name].filter(Boolean).join(' ').trim(),
        rank_id: row?.rank_id
      })).filter((r: any) => r.full_name);
      setCrew2Members(transformed);
    } catch (err) {
      console.error('Error loading Crew2 members:', err);
      setCrew2Members([]);
    }
  };

  const loadCrew1Members = async () => {
    try {
      let selectedShiftId = null;
      if (selectedShift !== 'All Shifts') {
        const { data: shiftData } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id')
          .eq('shift_name', selectedShift)
          .single();
        if (shiftData) selectedShiftId = shiftData.id;
      }

      // Use 02_admin_staff_1_registration directly
      let query = supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, middle_name, last_name, rank_id')
        .in('rank_id', [5, '5'])
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });

      if (selectedShiftId) {
        query = query.eq('operational_shift_id', selectedShiftId);
      }

      const { data: rows, error: err } = await query;
      
      const transformed = (rows || []).map((row: any) => ({
        staff_id: String(row?.staff_id ?? row?.id ?? ''),
        full_name: [row?.first_name, row?.middle_name, row?.last_name].filter(Boolean).join(' ').trim(),
        rank_id: row?.rank_id
      })).filter((r: any) => r.full_name);
      setCrew1Members(transformed);
    } catch (err) {
      console.error('Error loading Crew1 members:', err);
      setCrew1Members([]);
    }
  };

  const loadDriverMembers = async () => {
    try {
      let selectedShiftId = null;
      if (selectedShift !== 'All Shifts') {
        const { data: shiftData } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id')
          .eq('shift_name', selectedShift)
          .single();
        if (shiftData) selectedShiftId = shiftData.id;
      }

      // Use 02_admin_staff_1_registration directly
      // Note: Rank 51 is used for drivers. Some drivers might have different ranks in registration,
      // but we filter by rank_id=51 here.
      // If drivers are missing, it might be due to strict rank filtering.
      let query = supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, middle_name, last_name, rank_id')
        .in('rank_id', [51, '51'])
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });

      if (selectedShiftId) {
        query = query.eq('operational_shift_id', selectedShiftId);
      }

      const { data: rows, error: err } = await query;

      const transformed = (rows || []).map((row: any) => ({
        staff_id: String(row?.staff_id ?? row?.id ?? ''),
        full_name: [row?.first_name, row?.middle_name, row?.last_name].filter(Boolean).join(' ').trim(),
        rank_id: row?.rank_id
      })).filter((r: any) => r.full_name);
      
      console.log(`Drivers loaded for shift ${selectedShift}: ${transformed.length}`);
      setDriverMembers(transformed);
    } catch (err) {
      console.error('Error loading Driver members:', err);
      setDriverMembers([]);
    }
  };

  // Get fire station ID by name
  const getFireStationIdByName = (stationName: string): number | null => {
    if (stationName === 'All Stations') return null;
    const station = fireStations.find(s => s.fire_station_name === stationName || s.station_name === stationName);
    return station?.id || null;
  };

  // Handle vehicle selection changes
  const handleVehicleSelection = (dropdownId: string, value: string) => {
    setVehicleSelections(prev => ({
      ...prev,
      [dropdownId]: value
    }));
  };

  // Handle staff selection changes
  const handleStaffSelection = (dropdownId: string, value: string) => {
    setStaffSelections(prev => ({
      ...prev,
      [dropdownId]: value
    }));
  };

  const handleClearAllFields = () => {
    setVehicleSelections({});
    setStaffSelections({});
    setSelectedFireStation('All Stations');
    setSelectedShift('All Shifts');
    setFormResetKey(prev => prev + 1);
  };

  const getFilteredStaff = (excludeStaff?: string) => {
    let filteredStaff = staffMembers;
    if (excludeStaff && excludeStaff.startsWith('crew2-')) {
      filteredStaff = filteredStaff.filter(s => String(s?.rank_id ?? '').trim() === '5');
    }
    const selectedStaffValues = Object.values(staffSelections).filter(s => s && s !== excludeStaff);
    return filteredStaff.map(staff => ({
      ...staff,
      disabled: selectedStaffValues.includes(staff.full_name)
    }));
  };

  const loadFireStations = async () => {
    try {
      console.log('Loading fire stations from table 02_admin_register_fd3_stations...');
      console.log('Current fireStations state before load:', fireStations.length);
      const { data, error } = await supabase
        .from('02_admin_register_fd3_stations')
        .select('id, fire_station_name')
        // Filter by fire_department_id = 8 as per database check (default department)
        .eq('department_id', 8)
        .order('fire_station_name', { ascending: true });

      if (error) {
        console.error('Error loading fire stations:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return;
      }

      const rows = data || [];
      const transformed = rows.map((row: any) => {
        const name = String(row?.fire_station_name ?? row?.station_name ?? '').trim();
        return { id: row?.id, fire_station_name: name };
      }).filter(s => s.fire_station_name);

      const sortedData = transformed.sort((a, b) => a.fire_station_name.localeCompare(b.fire_station_name));
      setFireStations(sortedData);
    } catch (error) {
      console.error('Error loading fire stations:', error);
    }
  };

  const loadOperationalShifts = async () => {
    try {
      console.log('Loading operational shifts from database...');
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('shift_name')
        .order('shift_name', { ascending: true });

      if (error) {
        console.error('Error loading operational shifts:', error);
        return;
      }

      if (data) {
        console.log('Operational shifts loaded:', data);
        setOperationalShifts(data);
      }
    } catch (error) {
      console.error('Error loading operational shifts:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select('call_sign, vehicle_type, station_assignment')
        .eq('assignment_date', selectedDate)
        .eq('status', 'In Service')
        .order('call_sign', { ascending: true });

      if (error) {
        setVehicles([]);
        setVehicleLoadMessage('Failed to load vehicle assignments');
        return;
      }

      const rows = data || [];
      const transformedData = rows.map(vehicle => ({
        call_sign: vehicle.call_sign,
        vehicle_type: vehicle.vehicle_type,
        fire_station: vehicle.station_assignment || 'Unassigned'
      }));

      setVehicles(transformedData);
      setVehicleLoadMessage(rows.length === 0 ? 'No vehicles in service for the selected date' : '');
    } catch (error) {
      console.error('Error loading vehicles:', error);
      console.error('Full error stack:', error);
    }
  };

  const loadStaffMembers = async () => {
    try {
      console.log('Loading staff members from staff_basic_info table...');
      console.log('Current selectedShift:', selectedShift);
      console.log('Loading all shifts for shift name mapping...');
      
      // Get the operational_shift_id for the selected shift name
      let selectedShiftId = null;
      let shiftMap = new Map<number, string>(); // Map to store shift names
      if (selectedShift !== 'All Shifts') {
        const { data: shiftData } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id')
          .eq('shift_name', selectedShift)
          .single();
        
        if (shiftData) {
          selectedShiftId = shiftData.id;
        }
      }
      
      // Load all operational shifts to create a map for shift names
      const { data: allShifts } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('id, shift_name');
      
      if (allShifts) {
        allShifts.forEach(shift => {
          shiftMap.set(shift.id, shift.shift_name);
        });
      }
      
      // 1) Load ALL staff (no station filtering since Shift dropdown only filters staff)
      let staffQuery = supabase
        .from('staff_basic_info')
        .select(`
          staff_id,
          employee_number,
          first_name,
          middle_name,
          last_name,
          nationality,
          telephone_number,
          rank_id,
          fire_station_id,
          operational_shift_id,
          photo_url
        `)
        .order('employee_number', { ascending: true });

      // Filter by operational shift if a specific shift is selected (Shift dropdown filters staff)
      if (selectedShiftId) {
        staffQuery = staffQuery.eq('operational_shift_id', selectedShiftId);
      }

      const { data: staffRows, error: staffErr } = await staffQuery;

      let rows = staffRows || [];
      if (staffErr || rows.length === 0) {
        console.warn('Primary staff_basic_info query failed or returned no rows; falling back to 02_admin_staff_1_registration');
        const { data: fallbackRows, error: fallbackErr } = await supabase
          .from('02_admin_staff_1_registration')
          .select('staff_id, first_name, middle_name, last_name, rank_id')
          .order('first_name', { ascending: true })
          .order('last_name', { ascending: true });
        if (fallbackErr) {
          console.error('Fallback staff registration query failed:', fallbackErr);
          rows = [];
        } else {
          // Map minimal fields to the expected structure
          rows = (fallbackRows || []).map((r: any) => ({
            staff_id: r.staff_id,
            employee_number: '',
            first_name: r.first_name,
            middle_name: r.middle_name,
            last_name: r.last_name,
            nationality: '',
            telephone_number: '',
            rank_id: r.rank_id,
            fire_station_id: null,
            operational_shift_id: null,
            photo_url: null
          }));
        }
      }

      // 2) Build lookup sets for rank and station IDs
      const rankIds = Array.from(
        new Set(
          rows
            .map((r: any) => r.rank_id)
            .filter((v: any) => v !== null && v !== undefined)
        )
      );
      const stationIds = Array.from(
        new Set(
          rows
            .map((r: any) => r.fire_station_id)
            .filter((v: any) => v !== null && v !== undefined)
        )
      );

      // 3) Fetch ranks and stations in separate queries and build maps
      let rankMap = new Map<string, string>();
      let stationMap = new Map<number, string>();

      if (rankIds.length > 0) {
        const { data: rankRows, error: rankErr } = await supabase
          .from('ranks')
          .select('id, name')
          .in('id', rankIds as string[]);
        if (rankErr) {
          console.warn('Rank lookup failed:', rankErr);
        } else {
          (rankRows || []).forEach((r: any) => {
            rankMap.set(r.id, r.name);
          });
        }
      }

      if (stationIds.length > 0) {
        const { data: stationRows, error: stationErr } = await supabase
          .from('fire_stations_vfh')
          .select('id, fire_station_name')
          .in('id', stationIds as number[]);
        if (stationErr) {
          console.warn('Station lookup failed:', stationErr);
        } else {
          (stationRows || []).forEach((s: any) => {
            stationMap.set(s.id, s.fire_station_name);
          });
        }
      }

      // 4) Transform final staff records with resolved names
      let transformed = rows.map((row: any) => ({
        staff_id: row.staff_id,
        employee_number: row.employee_number,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        nationality: row.nationality,
        telephone_number: row.telephone_number,
        operational_shift_id: row.operational_shift_id,
        operational_shift_name: row.operational_shift_id ? (shiftMap.get(row.operational_shift_id) || '-') : '-',
        photo_url: row.photo_url,
        rank_name: (row.rank_id ? (rankMap.get(row.rank_id) || '-') : '-'),
        fire_station_name: (row.fire_station_id ? (stationMap.get(row.fire_station_id) || '-') : '-'),
        fire_station_id: row.fire_station_id,
        rank_id: row.rank_id,
        full_name: `${row.first_name} ${row.last_name}`
      }));

      // Apply display formatting fixes (e.g., Ambulance Attendant)
      transformed = transformed.map(item => ({
        ...item,
        rank_name: formatRankName(item.rank_name)
      }));

      console.log('Staff data transformation complete. Sample staff:');
      console.log('First 3 staff members:', transformed.slice(0, 3).map(s => ({
        name: s.full_name,
        shift_id: s.operational_shift_id,
        shift_name: s.operational_shift_name,
        station: s.fire_station_name
      })));

      // 5) Order by Station sequence, then Rank sequence, then Employee number
      transformed.sort((a, b) => {
        const sa = getStationIndex(a.fire_station_name);
        const sb = getStationIndex(b.fire_station_name);
        if (sa !== sb) return sa - sb;

        const ra = getRoleIndex(a.rank_name);
        const rb = getRoleIndex(b.rank_name);
        if (ra !== rb) return ra - rb;

        return (a.employee_number || '').localeCompare(b.employee_number || '');
      });

      console.log(`Staff members loaded and sorted: ${transformed.length} records`);
      console.log('Sample staff data:', transformed.slice(0, 3));
      
      setStaffMembers(transformed);
    } catch (error) {
      console.error('Error loading staff members:', error);
    }
  };

  const loadOICMembers = async () => {
    try {
      let selectedShiftId = null;
      if (selectedShift !== 'All Shifts') {
        const { data: shiftData } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id')
          .eq('shift_name', selectedShift)
          .single();
        if (shiftData) selectedShiftId = shiftData.id;
      }

      // Use 02_admin_staff_1_registration for filtering capability as staff_basic_info seems empty/unreliable
      let query = supabase
        .from('02_admin_staff_1_registration')
        .select('staff_id, first_name, middle_name, last_name')
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });

      if (selectedShiftId) {
        query = query.eq('operational_shift_id', selectedShiftId);
      }

      const { data, error } = await query;
      
      let rows = data || [];
      
      const transformed = rows.map((row: any) => ({
        staff_id: String(row?.staff_id ?? row?.id ?? ''),
        full_name: [row?.first_name, row?.middle_name, row?.last_name].filter(Boolean).join(' ').trim()
      })).filter((r: any) => r.full_name);
      setOICMembers(transformed);
    } catch (err) {
      console.error('Error loading OIC members:', err);
      setOICMembers([]);
    }
  };

  // Removed loadRosterData, handleDelete, and getStatusBadgeStyle functions since the second form was removed

  // Build a lookup map of staff_id -> fire_station_name for station-based filtering in dropdowns
  const staffStationNameMap = new Map<string, string>();
  staffMembers.forEach((s: any) => {
    staffStationNameMap.set(String(s.staff_id || ''), String(s.fire_station_name || ''));
  });

  const canonicalStation = (name: string) => String(name || '').toLowerCase().trim();

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="capturing-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="capturing-title">
                Duty Roster Capturing
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Duty Roster system provides a comprehensive view of daily personnel duty assignments across operational shifts and fire stations. This platform displays current staff assignments, shift rotations, and role allocations while maintaining accurate records of personnel availability, deployment status, and operational coverage to ensure optimal emergency response capability and workforce management.
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
                  alt="Duty Roster Capturing" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/ControlRoom.png';
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

      {/* Daily Duty Roster Entry form removed as requested */}

      {/* Current Roster Section */}
      <Section>
        <FormSection>
          <SectionHeader>
            <ShiftContainer>
              <ShiftLabel htmlFor="shift">Shift</ShiftLabel>
              <ShiftSelect
                id="shift"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                disabled={operationalShifts.length === 0}
              >
                <option value="All Shifts">All Shifts</option>
                {operationalShifts.map((shift) => (
                  <option key={shift.shift_name} value={shift.shift_name}>
                    {shift.shift_name}
                  </option>
                ))}
              </ShiftSelect>
            </ShiftContainer>
            <FireStationContainer>
              <FireStationLabel htmlFor="fire-station">Fire Station Allocation</FireStationLabel>
              <FireStationSelect
                id="fire-station"
                value={selectedFireStation}
                onChange={(e) => setSelectedFireStation(e.target.value)}
              >
                <option value="All Stations">All Stations</option>
                {fireStations.map((station) => {
                  const stationName = station.fire_station_name || station.station_name;
                  return (
                    <option key={stationName} value={stationName}>
                      {stationName}
                    </option>
                  );
                })}
              </FireStationSelect>
            </FireStationContainer>
            <DatePickerContainer style={{ marginTop: '0' }}>
              <DatePickerLabel htmlFor="roster-date">View Date</DatePickerLabel>
              <DatePicker
                id="roster-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </DatePickerContainer>
          </SectionHeader>
          
          {/* Vehicle Assignment Table */}
          <div style={{ marginTop: '30px', marginBottom: '20px' }}>
            {vehicleLoadMessage && (
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                color: '#856404', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                fontSize: '0.9rem'
              }}>
                ℹ️ {vehicleLoadMessage}
              </div>
            )}
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <thead>
                <tr style={{ background: '#1177BB' }}>
                  <th style={{ width: '18%', color: 'white', padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0e5a8a' }}>Response Vehicle</th>
                  <th style={{ width: '18%', color: 'white', padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0e5a8a' }}>Officer In Charge</th>
                  <th style={{ width: '18%', color: 'white', padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0e5a8a' }}>Driver/Operator</th>
                  <th style={{ width: '18%', color: 'white', padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0e5a8a' }}>Fire Crew 1</th>
                  <th style={{ width: '18%', color: 'white', padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0e5a8a' }}>Fire Crew 2</th>
                  <th style={{ width: '10%', color: 'white', padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0e5a8a' }}>Daily Duty</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((rowIndex) => {
                  const dropdownId = `vehicle-${rowIndex}`;
                  const currentSelection = vehicleSelections[dropdownId] || '';
                  
                  return (
                    <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ width: '18%', padding: '8px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <select 
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                          value={currentSelection}
                          onChange={(e) => handleVehicleSelection(dropdownId, e.target.value)}
                        >
                          <option value="">Select Vehicle</option>
                          {getFilteredVehicles(currentSelection).map((vehicle) => (
                            <option 
                              key={`${vehicle.call_sign}-${vehicle.vehicle_type}`} 
                              value={`${vehicle.call_sign} ${vehicle.vehicle_type}`}
                              disabled={vehicle.disabled}
                              style={vehicle.disabled ? { color: '#999', fontStyle: 'italic' } : {}}
                            >
                              {vehicle.disabled ? '🔒 ' : ''}{vehicle.call_sign} {vehicle.vehicle_type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ width: '18%', padding: '8px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <select 
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                          key={`oic-${rowIndex}-${formResetKey}`}
                          value={staffSelections[`oic-${rowIndex}`] || ''}
                          onChange={(e) => handleStaffSelection(`oic-${rowIndex}`, e.target.value)}
                        >
                          <option value="">Select OIC</option>
                          {(() => {
                            const selectedNames = Object.values(staffSelections).filter(Boolean) as string[];
                            const stationFilter = selectedFireStation && selectedFireStation !== 'All Stations' ? selectedFireStation : '';
                            const stationFilterCanon = canonicalStation(stationFilter);
                            const oicOptions = (oicMembers || [])
                              .filter((m: any) => {
                                if (!stationFilterCanon) return true;
                                const name = canonicalStation(staffStationNameMap.get(String(m.staff_id || '')) || '');
                                return name === stationFilterCanon;
                              })
                              .map((m: any) => ({
                                ...m,
                                disabled: selectedNames.includes(m.full_name)
                              }));
                            const finalOic = stationFilterCanon && oicOptions.length === 0 ? (oicMembers || []).map((m: any) => ({
                              ...m,
                              disabled: selectedNames.includes(m.full_name)
                            })) : oicOptions;
                            return finalOic.map((staff: any) => (
                              <option
                                key={staff.staff_id}
                                value={staff.full_name}
                                disabled={staff.disabled}
                                style={staff.disabled ? { color: '#999', fontStyle: 'italic' } : {}}
                              >
                                {staff.disabled ? '🔒 ' : ''}{staff.full_name}
                              </option>
                            ));
                          })()}
                        </select>
                      </td>
                      <td style={{ width: '18%', padding: '8px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <select 
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                          key={`driver-${rowIndex}-${formResetKey}`}
                          value={staffSelections[`driver-${rowIndex}`] || ''}
                          onChange={(e) => handleStaffSelection(`driver-${rowIndex}`, e.target.value)}
                        >
                          <option value="">Select D/O</option>
                          {(() => {
                            const selectedNames = Object.values(staffSelections).filter(Boolean) as string[];
                            const stationFilter = selectedFireStation && selectedFireStation !== 'All Stations' ? selectedFireStation : '';
                            const stationFilterCanon = canonicalStation(stationFilter);
                            const source = (driverMembers && driverMembers.length > 0) ? driverMembers : getFilteredStaff(`driver-${rowIndex}`);
                            let filtered = source.filter((s: any) => {
                              if (!stationFilterCanon) return true;
                              const name = canonicalStation(staffStationNameMap.get(String(s.staff_id || '')) || '');
                              return name === stationFilterCanon;
                            });
                            if (stationFilterCanon && filtered.length === 0) filtered = source;
                            const options = filtered.map((s: any) => ({
                              ...s,
                              disabled: selectedNames.includes(s.full_name)
                            }));
                            return options.map((staff: any) => (
                              <option
                                key={staff.staff_id}
                                value={staff.full_name}
                                disabled={staff.disabled}
                                style={staff.disabled ? { color: '#999', fontStyle: 'italic' } : {}}
                              >
                                {staff.disabled ? '🔒 ' : ''}{staff.full_name}
                              </option>
                            ));
                          })()}
                        </select>
                      </td>
                      <td style={{ width: '18%', padding: '8px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <select 
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                          key={`crew1-${rowIndex}-${formResetKey}`}
                          value={staffSelections[`crew1-${rowIndex}`] || ''}
                          onChange={(e) => handleStaffSelection(`crew1-${rowIndex}`, e.target.value)}
                        >
                          <option value="">Select Crew1</option>
                          {(() => {
                            const selectedNames = Object.values(staffSelections).filter(Boolean) as string[];
                            const stationFilter = selectedFireStation && selectedFireStation !== 'All Stations' ? selectedFireStation : '';
                            const stationFilterCanon = canonicalStation(stationFilter);
                            const source = (crew1Members && crew1Members.length > 0) ? crew1Members : getFilteredStaff(`crew1-${rowIndex}`);
                            let filtered = source.filter((s: any) => {
                              if (!stationFilterCanon) return true;
                              const name = canonicalStation(staffStationNameMap.get(String(s.staff_id || '')) || '');
                              return name === stationFilterCanon;
                            });
                            if (stationFilterCanon && filtered.length === 0) filtered = source;
                            const options = filtered.map((s: any) => ({
                              ...s,
                              disabled: selectedNames.includes(s.full_name)
                            }));
                            return options.map((staff: any) => (
                              <option
                                key={staff.staff_id}
                                value={staff.full_name}
                                disabled={staff.disabled}
                                style={staff.disabled ? { color: '#999', fontStyle: 'italic' } : {}}
                              >
                                {staff.disabled ? '🔒 ' : ''}{staff.full_name}
                              </option>
                            ));
                          })()}
                        </select>
                      </td>
                      <td style={{ width: '18%', padding: '8px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <select 
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                          key={`crew2-${rowIndex}-${formResetKey}`}
                          value={staffSelections[`crew2-${rowIndex}`] || ''}
                          onChange={(e) => handleStaffSelection(`crew2-${rowIndex}`, e.target.value)}
                        >
                          <option value="">Select Crew2</option>
                          {(() => {
                            const selectedNames = Object.values(staffSelections).filter(Boolean) as string[];
                            const stationFilter = selectedFireStation && selectedFireStation !== 'All Stations' ? selectedFireStation : '';
                            const stationFilterCanon = canonicalStation(stationFilter);
                            const source = (crew2Members && crew2Members.length > 0) ? crew2Members : getFilteredStaff(`crew2-${rowIndex}`);
                            let filtered = source.filter((s: any) => {
                              if (!stationFilterCanon) return true;
                              const name = canonicalStation(staffStationNameMap.get(String(s.staff_id || '')) || '');
                              return name === stationFilterCanon;
                            });
                            if (stationFilterCanon && filtered.length === 0) filtered = source;
                            const options = filtered.map((s: any) => ({
                              ...s,
                              disabled: selectedNames.includes(s.full_name)
                            }));
                            return options.map((staff: any) => (
                              <option
                                key={staff.staff_id}
                                value={staff.full_name}
                                disabled={staff.disabled}
                                style={staff.disabled ? { color: '#999', fontStyle: 'italic' } : {}}
                              >
                                {staff.disabled ? '🔒 ' : ''}{staff.full_name}
                              </option>
                            ));
                          })()}
                        </select>
                      </td>
                    <td style={{ width: '10%', padding: '8px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <input type="text" placeholder="Enter duty status" style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Clear Button */}
          <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <button 
              onClick={() => setShowClearModal(true)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              🗑️ Clear All Fields
            </button>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6c757d' }}>
              This will clear all vehicle and staff selections
            </div>
          </div>
          <ClearModalOverlay $isOpen={showClearModal}>
            <ClearModalBox>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#1177BB', fontSize: '1.4rem' }}>Confirm Clear</h3>
                <button type="button" onClick={() => setShowClearModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>×</button>
              </div>
              <p style={{ color: '#333', fontSize: '1rem', marginTop: 0 }}>Are you sure you want to clear all fields? This action cannot be undone.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setShowClearModal(false)} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={() => { handleClearAllFields(); setShowClearModal(false); }} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Clear All</button>
              </div>
            </ClearModalBox>
          </ClearModalOverlay>
          
        </FormSection>
      </Section>
    </MainContent>
  );
};
