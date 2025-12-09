import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import styled from 'styled-components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../utils/pdfReportHelper';
import { getCompanyLogo } from '../../utils/companyLogo';

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
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    flex-wrap: wrap;
  }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '18.5%'};
  vertical-align: top;
  text-align: left;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #f44336;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #f44336;
  border-radius: 3px;
  margin: 15px 0;
`;

const SummaryCard = styled.div`
  background: white;
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
  text-align: center;
`;

const CardContent = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CountNumber = styled.div<{ $isTotal?: boolean }>`
  font-size: ${props => props.$isTotal ? '3.5rem' : '2.8rem'};
  font-weight: bold;
  margin: 8px 0;
  text-align: center;
  width: 100%;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 20px 0;
  border: 2px solid #f44336;
  border-radius: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
`;

const TableHeader = styled.thead`
  background-color: #f44336;
  color: white;
`;

const SortableHeaderCell = styled.th<{ $isActive?: boolean }>`
  padding: 12px 8px;
  text-align: left;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  position: relative;
  border-right: 1px solid #d32f2f;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: #d32f2f;
  }
  
  ${props => props.$isActive && `
    background-color: #d32f2f;
  `}
  
  &::after {
    content: '';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    opacity: 0.6;
  }
  
  &.asc::after {
    border-bottom: 6px solid white;
    border-top: none;
  }
  
  &.desc::after {
    border-top: 6px solid white;
    border-bottom: none;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TableCell = styled.td`
  padding: 12px 8px;
  text-align: left;
  border-right: 1px solid #e0e0e0;
  
  &:last-child {
    border-right: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 8px;
  text-align: left;
  border-right: 1px solid #e0e0e0;
  background-color: #f44336;
  color: white;
  font-weight: bold;
  
  &:last-child {
    border-right: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
  color: #f44336;
`;

const ErrorAlert = styled.div`
  background-color: #ffebee;
  border: 2px solid #f44336;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
`;

const SuccessAlert = styled.div`
  background-color: #e8f5e8;
  border: 2px solid #4caf50;
  color: #2e7d32;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => {
    switch (props.$variant) {
      case 'success':
        return '#4caf50';
      case 'secondary':
        return '#757575';
      default:
        return '#f44336';
    }
  }};
  color: white;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    background-color: ${props => {
    switch (props.$variant) {
      case 'success':
        return '#45a049';
      case 'secondary':
        return '#5a5a5a';
      default:
        return '#d32f2f';
    }
  }};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const MaintenanceTypeSelect = styled.select`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #f44336;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ReasonTextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #f44336;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  status: string;
  readiness: string;
  assigned_station: string;
  driver_name?: string;
  crew_members?: string;
  call_sign?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  out_of_service_reason?: string;
  out_of_service_date?: string;
  in_service_date?: string;
  estimated_return_date?: string;
  maintenance_notes?: string;
  maintenance_type?: 'Corrective Maintenance' | 'Planned Maintenance';
  reason_text?: string;
  created_at?: string;
  updated_at?: string;
}

interface DailyRecord {
  id?: number;
  record_date: string;
  vehicles_data: Vehicle[];
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export default function VehiclesOutOfService() {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<{ [key: string]: 'Corrective Maintenance' | 'Planned Maintenance' }>({});
  const [currentRecord, setCurrentRecord] = useState<DailyRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'call_sign', direction: 'asc' });
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Helper function to get current date
  const getCurrentDate = (): string => {
    return selectedDate;
  };

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatInputDateTime = (iso?: string): string => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      return `${y}-${m}-${day}T${hh}:${mm}`;
    } catch { return ''; }
  };

  const handleOutOfServiceDateChange = (vehicleId: string, value: string) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, out_of_service_date: value } : v));
  };

  // Get sorted vehicles
  const getSortedVehicles = () => {
    if (!vehicles || vehicles.length === 0) return [];

    return [...vehicles].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof Vehicle];
      let bValue = b[sortConfig.key as keyof Vehicle];

      // Handle call_sign specifically
      if (sortConfig.key === 'call_sign') {
        aValue = a.call_sign || a.vehicle_number || '';
        bValue = b.call_sign || b.vehicle_number || '';

        const aMatch = (aValue as string).match(/^([A-Za-z]+)(\d+)$/);
        const bMatch = (bValue as string).match(/^([A-Za-z]+)(\d+)$/);

        if (aMatch && bMatch) {
          const [, aLetters, aNumbers] = aMatch;
          const [, bLetters, bNumbers] = bMatch;

          if (aLetters !== bLetters) {
            return sortConfig.direction === 'asc'
              ? aLetters.localeCompare(bLetters)
              : bLetters.localeCompare(aLetters);
          }

          const aNum = parseInt(aNumbers, 10);
          const bNum = parseInt(bNumbers, 10);
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
      }

      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  };

  // Memoized calculations for flash cards
  const vehicleCounts = useMemo(() => {
    if (!vehicles || !allVehicles) return {
      commandOutOfService: 0,
      commandTotal: 0,
      fireOutOfService: 0,
      fireTotal: 0,
      ambulanceOutOfService: 0,
      ambulanceTotal: 0,
      utilityOutOfService: 0,
      utilityTotal: 0,
      totalOutOfService: 0,
      totalVehicles: 0
    };

    const commandOutOfService = vehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')).length;
    const commandTotal = allVehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')).length;
    const fireOutOfService = vehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')).length;
    const fireTotal = allVehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')).length;
    const ambulanceOutOfService = vehicles.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')).length;
    const ambulanceTotal = allVehicles.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')).length;
    const utilityOutOfService = vehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')).length;
    const utilityTotal = allVehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')).length;

    return {
      commandOutOfService,
      commandTotal,
      fireOutOfService,
      fireTotal,
      ambulanceOutOfService,
      ambulanceTotal,
      utilityOutOfService,
      utilityTotal,
      totalOutOfService: vehicles.length,
      totalVehicles: allVehicles.length
    };
  }, [vehicles, allVehicles]);

  // Memoized sorted vehicles
  const sortedVehicles = useMemo(() => {
    return getSortedVehicles();
  }, [vehicles, sortConfig]);

  const getDaysOutOfService = (outOfServiceDate?: string) => {
    if (!outOfServiceDate) return 'N/A';

    try {
      const startDate = new Date(outOfServiceDate);
      const endDate = new Date(selectedDate);

      if (isNaN(startDate.getTime())) {
        return 'N/A';
      }

      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error in getDaysOutOfService:', error);
      return 'N/A';
    }
  };

  const handleMaintenanceTypeChange = (vehicleId: string, newType: 'Corrective Maintenance' | 'Planned Maintenance') => {
    setMaintenanceTypes(prev => ({
      ...prev,
      [vehicleId]: newType
    }));
    setVehicles(prev => prev.map(vehicle =>
      vehicle.id === vehicleId
        ? { ...vehicle, maintenance_type: newType }
        : vehicle
    ));
  };

  const handleReasonTextChange = (vehicleId: string, newReasonText: string) => {
    setVehicles(prev => prev.map(vehicle =>
      vehicle.id === vehicleId
        ? { ...vehicle, reason_text: newReasonText }
        : vehicle
    ));
  };

  const handleIndividualEdit = (vehicleId: string) => {
    setEditingVehicleId(vehicleId);
  };

  const handleIndividualUpdate = async (vehicleId: string) => {
    try {
      setError(null);
      setSuccess(null);

      const vehicleToUpdate = vehicles.find(v => v.id === vehicleId);
      if (!vehicleToUpdate) {
        throw new Error('Vehicle not found');
      }

      const currentDate = getCurrentDate();
      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === vehicleId
          ? {
            ...vehicle,
            maintenance_type: maintenanceTypes[vehicleId] || vehicle.maintenance_type || 'Planned Maintenance',
            reason_text: vehicle.reason_text || ''
          }
          : vehicle
      );

      if (currentRecord) {
        await updateDailyRecord(currentDate, updatedVehicles);
        setSuccess(`Vehicle ${vehicleToUpdate.call_sign || vehicleToUpdate.vehicle_number} updated successfully!`);
      } else {
        await saveDailyRecord(currentDate, updatedVehicles);
        setSuccess('Daily record updated successfully!');
      }

      setEditingVehicleId(null);
      await loadDailyRecord();
    } catch (err: any) {
      console.error('Individual update failed:', err);
      setError(err.message || 'Failed to update vehicle');
    }
  };

  const handleIndividualCancel = (vehicleId: string) => {
    setEditingVehicleId(null);
  };

  const handleSaveRecord = async () => {
    try {
      setError(null);
      setSuccess(null);

      const currentDate = getCurrentDate();
      const vehiclesWithMaintenanceType = vehicles.map(vehicle => ({
        ...vehicle,
        maintenance_type: maintenanceTypes[vehicle.id] || 'Planned Maintenance',
        reason_text: vehicle.reason_text || ''
      }));

      if (currentRecord) {
        await updateDailyRecord(currentDate, vehiclesWithMaintenanceType);
        setSuccess('Daily record updated successfully!');
      } else {
        await saveDailyRecord(currentDate, vehiclesWithMaintenanceType);
        setSuccess('Daily record saved successfully!');
      }

      setIsEditing(false);
      await loadDailyRecord();
    } catch (err: any) {
      setError(err.message || 'Failed to save record');
    }
  };

  const handleEditMode = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadDailyRecord();
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentDate = getCurrentDate();
      console.log('Refreshing data from station assignments for:', currentDate);

      // Fetch from station assignments table
      const { data: assignments, error: fetchError } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select('*')
        .eq('assignment_date', currentDate);

      if (fetchError) throw fetchError;

      if (assignments) {
        // Fetch previous day's record to preserve original out_of_service_date
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        const { data: prevRecord } = await supabase
          .from('daily_vehicle_records')
          .select('*')
          .eq('record_date', prevDateStr)
          .single();
          
        const prevVehiclesMap = new Map();
        if (prevRecord && prevRecord.vehicles_data) {
          prevRecord.vehicles_data.forEach((v: any) => {
             // Map by call_sign (preferred) or vehicle_number
             const key = (v.call_sign || v.vehicle_number || '').trim().toUpperCase();
             if (key) prevVehiclesMap.set(key, v);
          });
        }

        // Filter for out of service vehicles
        // Include vehicles explicitly marked as Out of Service, Workshop, or having is_workshop flag
        // Also include any vehicle that is NOT 'In Service' and NOT 'Available'
        const outOfServiceVehicles = assignments.filter(a =>
          a.status === 'Out of Service' ||
          a.status === 'Workshop' ||
          a.is_workshop === true ||
          (a.status !== 'In Service' && a.status !== 'Available')
        );

        console.log('Found out of service vehicles from assignments:', outOfServiceVehicles);

        const newVehicles: Vehicle[] = outOfServiceVehicles.map(a => {
          const callSignKey = (a.call_sign || '').trim().toUpperCase();
          const prevVehicle = prevVehiclesMap.get(callSignKey);
          
          // If vehicle was out of service yesterday, keep the original date to increment "Days Out" count
          // Otherwise, assume it went out of service today (start of assignment date)
          const outOfServiceDate = prevVehicle && prevVehicle.out_of_service_date 
            ? prevVehicle.out_of_service_date 
            : `${a.assignment_date}T00:00:00`;
            
          return {
            id: a.id.toString(), // assignments id is bigint/number
            vehicle_number: a.call_sign || 'N/A', // Mapping call_sign to vehicle_number as fallback
            vehicle_type: a.vehicle_type || 'N/A',
            status: a.status || 'Out of Service',
            readiness: a.readiness || 'N/A',
            assigned_station: a.station_assignment || 'Unassigned',
            driver_name: a.crew_members || '',
            crew_members: a.crew_members || '',
            call_sign: a.call_sign || '',
            vehicle_make: a.vehicle_make || '',
            vehicle_model: a.vehicle_model || '',
            out_of_service_reason: a.notes || '', // Map notes to reason
            out_of_service_date: outOfServiceDate,
            reason_text: a.notes || (prevVehicle ? prevVehicle.reason_text : ''),
            maintenance_type: (prevVehicle ? prevVehicle.maintenance_type : 'Planned Maintenance'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });

        setVehicles(newVehicles);
        
        // Reset current record so user can save this new snapshot
        setCurrentRecord(null);
        setLastUpdated(new Date());
        
        // Update maintenance types state for the new vehicles
        const types: { [key: string]: 'Corrective Maintenance' | 'Planned Maintenance' } = {};
        newVehicles.forEach(v => {
            types[v.id] = 'Planned Maintenance';
        });
        setMaintenanceTypes(types);

        setSuccess(`Refreshed data: Found ${newVehicles.length} out of service vehicles.`);
      } else {
          setVehicles([]);
          setSuccess('No assignments found for this date.');
      }

    } catch (err: any) {
      console.error('Error during data refresh:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Load all vehicle assignments for a specific date (for counting purposes)
  const loadAllAssignmentsForDate = async (date: string) => {
    let { data: allAssignments, error: allError } = await supabase
      .from('03_ecc_02_duty_roster_01_station_assignments')
      .select('*')
      .eq('assignment_date', date)
      .order('call_sign', { ascending: true });

    // FALLBACK: If no assignments found for this date, fetch the most recent available assignment set
    // This ensures the "Total" denominator in flash cards is correct even if roster data is missing for past dates
    if (!allError && (!allAssignments || allAssignments.length === 0)) {
        console.log(`No assignments found for ${date}, fetching most recent available data for denominator...`);
        
        // Find the most recent date that has data
        const { data: latestDateData } = await supabase
           .from('03_ecc_02_duty_roster_01_station_assignments')
           .select('assignment_date')
           .order('assignment_date', { ascending: false })
           .limit(1);
           
        if (latestDateData && latestDateData.length > 0) {
            const fallbackDate = latestDateData[0].assignment_date;
            console.log(`Using fallback fleet data from ${fallbackDate}`);
            
            const { data: fallbackData, error: fallbackError } = await supabase
               .from('03_ecc_02_duty_roster_01_station_assignments')
               .select('*')
               .eq('assignment_date', fallbackDate)
               .order('call_sign', { ascending: true });
               
            if (!fallbackError && fallbackData) {
                allAssignments = fallbackData;
            }
        }
    }

    if (allError) {
      console.error('Error loading all assignments:', allError);
      throw allError;
    }

    const sortedAllVehicles = (allAssignments || []).sort((a, b) => {
      const callSignA = (a.call_sign || '').toUpperCase();
      const callSignB = (b.call_sign || '').toUpperCase();
      return callSignA.localeCompare(callSignB);
    });

    const uniqueAllVehicles = sortedAllVehicles.filter((item, idx, arr) => {
      const key = (item.call_sign || '').toString().trim().toUpperCase();
      return arr.findIndex(x => (x.call_sign || '').toString().trim().toUpperCase() === key) === idx;
    });

    setAllVehicles(uniqueAllVehicles);
    return uniqueAllVehicles;
  };

  // Update an existing daily record
  const updateDailyRecord = async (recordDate: string, vehiclesData: Vehicle[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {
      vehicles_data: vehiclesData,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('daily_vehicle_records')
      .update(updateData)
      .eq('record_date', recordDate)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update record: ${error.message}`);
    }

    setCurrentRecord(data);
    return data;
  };

  // Save a new daily record
  const saveDailyRecord = async (recordDate: string, vehiclesData: Vehicle[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: existingRecord, error: checkError } = await supabase
      .from('daily_vehicle_records')
      .select('id')
      .eq('record_date', recordDate)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing record:', checkError);
      throw new Error(`Failed to check existing record: ${checkError.message}`);
    }

    if (existingRecord) {
      return updateDailyRecord(recordDate, vehiclesData);
    }

    const insertData = {
      record_date: recordDate,
      vehicles_data: vehiclesData,
      created_by: user.id,
      updated_by: user.id
    };

    const { data, error } = await supabase
      .from('daily_vehicle_records')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create record: ${error.message}`);
    }

    setCurrentRecord(data);
    return data;
  };

  // Helper function to load vehicles from the daily record (PRIMARY SOURCE)
  const loadVehiclesFromRecord = (record: DailyRecord) => {
    console.log('loadVehiclesFromRecord called with:', record);

    if (record.vehicles_data && Array.isArray(record.vehicles_data)) {
      console.log('Raw vehicles_data:', record.vehicles_data);
      const types: { [key: string]: 'Corrective Maintenance' | 'Planned Maintenance' } = {};

      // Convert record vehicles to Vehicle objects
      const vehiclesFromRecord: Vehicle[] = record.vehicles_data.map((rv: any) => {
        // Ensure we have a stable ID if possible, or generate one
        const vId = rv.id || `temp-${Math.random().toString(36).substr(2, 9)}`;

        types[vId] = rv.maintenance_type || 'Planned Maintenance';

        return {
          id: vId,
          vehicle_number: rv.vehicle_number || rv.call_sign || 'N/A',
          vehicle_type: rv.vehicle_type || 'N/A',
          status: rv.status || 'Out of Service',
          readiness: rv.readiness || 'N/A',
          assigned_station: rv.assigned_station || 'Unassigned',
          driver_name: rv.driver_name || rv.crew_members || '',
          call_sign: rv.call_sign || rv.vehicle_number || '',
          vehicle_make: rv.vehicle_make || '',
          vehicle_model: rv.vehicle_model || '',
          out_of_service_date: rv.out_of_service_date,
          in_service_date: rv.in_service_date,
          estimated_return_date: rv.estimated_return_date,
          maintenance_notes: rv.maintenance_notes || '',
          maintenance_type: rv.maintenance_type || 'Planned Maintenance',
          reason_text: rv.reason_text || '',
          created_at: rv.created_at || new Date().toISOString(),
          updated_at: rv.updated_at || new Date().toISOString()
        };
      });

      console.log('Processed vehicles for display:', vehiclesFromRecord);
      setVehicles(vehiclesFromRecord);
      setMaintenanceTypes(types);
    } else {
      console.log('No vehicles_data found in record or invalid format');
      setVehicles([]);
    }
  };

  // Load daily record for the selected date - with automatic copying from previous day
  const loadDailyRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentDate = getCurrentDate();

      // Load all vehicles for counting purposes (flash cards)
      await loadAllAssignmentsForDate(currentDate);

      // Load daily record for the selected date
      const { data: record, error: recordError } = await supabase
        .from('daily_vehicle_records')
        .select('*')
        .eq('record_date', currentDate)
        .single();

      if (recordError && recordError.code !== 'PGRST116') {
        console.error('Error loading daily record:', recordError);
      }

      // If no record exists for this date, automatically copy from the most recent previous date
      if (!record || recordError?.code === 'PGRST116') {
        console.log(`No record found for ${currentDate} - attempting to copy from previous date`);

        // Find the most recent record before this date that HAS DATA
        // Fetch last 5 records to skip potential empty ones
        const { data: previousRecords, error: prevError } = await supabase
          .from('daily_vehicle_records')
          .select('*')
          .lt('record_date', currentDate)
          .order('record_date', { ascending: false })
          .limit(5);

        if (!prevError && previousRecords && previousRecords.length > 0) {
          // Find the first record that has non-empty vehicles_data
          const previousRecord = previousRecords.find(r => r.vehicles_data && Array.isArray(r.vehicles_data) && r.vehicles_data.length > 0);

          if (previousRecord) {
            console.log(`Found previous record from ${previousRecord.record_date} with ${previousRecord.vehicles_data.length} vehicles - copying forward`);

            // Copy the previous record to the current date
            if (user) {
              try {
                // Deep copy the vehicles data
                let vehiclesToCopy = JSON.parse(JSON.stringify(previousRecord.vehicles_data));

                // IF TODAY: Cross-check with live roster to remove vehicles that are back in service
                const todayStr = new Date().toISOString().split('T')[0];
                if (currentDate === todayStr) {
                   const { data: liveAssignments } = await supabase
                     .from('03_ecc_02_duty_roster_01_station_assignments')
                     .select('call_sign, status, is_workshop')
                     .eq('assignment_date', todayStr);
                     
                   if (liveAssignments && liveAssignments.length > 0) {
                     const inServiceSet = new Set(
                       liveAssignments
                         .filter(a => a.status === 'In Service' || a.status === 'Available')
                         .map(a => (a.call_sign || '').trim().toUpperCase())
                     );
                     
                     // Filter out vehicles that are now In Service
                     const originalCount = vehiclesToCopy.length;
                     vehiclesToCopy = vehiclesToCopy.filter((v: any) => {
                       const key = (v.call_sign || v.vehicle_number || '').trim().toUpperCase();
                       // Keep if NOT in service set
                       return !inServiceSet.has(key);
                     });
                     
                     if (vehiclesToCopy.length < originalCount) {
                       console.log(`Removed ${originalCount - vehiclesToCopy.length} vehicles that are back in service.`);
                     }
                   }
                }

                const newRecordData = {
                  record_date: currentDate,
                  vehicles_data: vehiclesToCopy,
                  created_by: user.id,
                  updated_by: user.id,
                  notes: `Auto-copied from ${previousRecord.record_date}`
                };

                const { data: newRecord, error: insertError } = await supabase
                  .from('daily_vehicle_records')
                  .insert(newRecordData)
                  .select()
                  .single();

                if (!insertError && newRecord) {
                  console.log(`Successfully created record for ${currentDate} from ${previousRecord.record_date}`);
                  setCurrentRecord(newRecord);

                  // Use the record data as primary source for vehicles
                  loadVehiclesFromRecord(newRecord);
                } else {
                  console.error('Error creating new record:', insertError);
                  setCurrentRecord(null);
                  setVehicles([]);
                }
              } catch (copyError) {
                console.error('Error copying previous record:', copyError);
                setCurrentRecord(null);
                setVehicles([]);
              }
            } else {
              setCurrentRecord(null);
              setVehicles([]);
            }
          } else {
            console.log('No previous record with data found in the last 5 records');
            setCurrentRecord(null);
            setVehicles([]);
          }
        } else {
          console.log('No previous records found to copy from');
          setCurrentRecord(null);
          setVehicles([]);
        }
      } else if (record) {
        // Record exists for this date - use it as primary source
        console.log(`Found existing record for ${currentDate}`);
        
        // IF TODAY: Cross-check with live roster to remove vehicles that are back in service
        // We update the local view but maybe NOT the DB immediately (unless user saves), 
        // OR we update DB to keep it clean?
        // Let's filter for display first.
        let displayRecord = record;
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (currentDate === todayStr) {
           const { data: liveAssignments } = await supabase
             .from('03_ecc_02_duty_roster_01_station_assignments')
             .select('call_sign, status, is_workshop')
             .eq('assignment_date', todayStr);
             
           if (liveAssignments && liveAssignments.length > 0) {
             const inServiceSet = new Set(
               liveAssignments
                 .filter(a => a.status === 'In Service' || a.status === 'Available')
                 .map(a => (a.call_sign || '').trim().toUpperCase())
             );
             
             if (record.vehicles_data && Array.isArray(record.vehicles_data)) {
                 const filteredVehicles = record.vehicles_data.filter((v: any) => {
                   const key = (v.call_sign || v.vehicle_number || '').trim().toUpperCase();
                   return !inServiceSet.has(key);
                 });
                 
                 if (filteredVehicles.length !== record.vehicles_data.length) {
                     console.log(`Filtered out ${record.vehicles_data.length - filteredVehicles.length} vehicles that are back in service.`);
                     displayRecord = { ...record, vehicles_data: filteredVehicles };
                     
                     // Optional: Auto-save the cleanup to DB?
                     // For now, let's just update the display so the user sees the correct list.
                     // They can click "Save Record" to persist the removal if they are in edit mode.
                 }
             }
           }
        }

        setCurrentRecord(displayRecord);
        loadVehiclesFromRecord(displayRecord);
      } else {
        setCurrentRecord(null);
        setVehicles([]);
      }
    } catch (err: any) {
      console.error('Error in loadDailyRecord:', err);
      setError(err.message || 'Failed to load daily record');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const currentUser = {
        email: user?.email || '',
        profile: {
          display_name: userProfile?.display_name || '',
          full_name: userProfile?.full_name || ''
        }
      };

      const logoBase64 = await getCompanyLogo();

      const pdfSortedVehicles = [...vehicles].sort((a, b) => {
        const aCallSign = (a.call_sign || a.vehicle_number || '').toString();
        const bCallSign = (b.call_sign || b.vehicle_number || '').toString();

        const aMatch = aCallSign.match(/^([A-Za-z]+)(\d+)$/);
        const bMatch = bCallSign.match(/^([A-Za-z]+)(\d+)$/);

        if (aMatch && bMatch) {
          const [, aLetters, aNumbers] = aMatch;
          const [, bLetters, bNumbers] = bMatch;

          if (aLetters !== bLetters) {
            return aLetters.localeCompare(bLetters);
          }

          const aNum = parseInt(aNumbers, 10);
          const bNum = parseInt(bNumbers, 10);
          return aNum - bNum;
        }

        return aCallSign.localeCompare(bCallSign);
      });

      const tableHeaders = ['Call Sign', 'Vehicle Type', 'Days Out', 'Maintenance Type', 'Out of Service Reason'];
      const tableData = pdfSortedVehicles.map(vehicle => [
        `${vehicle.vehicle_number || vehicle.call_sign || 'N/A'}\n${vehicle.vehicle_make} ${vehicle.vehicle_model}`.trim(),
        vehicle.vehicle_type || 'N/A',
        (() => {
          try {
            const date = vehicle.out_of_service_date || vehicle.updated_at || vehicle.created_at;
            if (!date) return 'N/A';
            const testDate = new Date(date);
            if (isNaN(testDate.getTime())) return 'N/A';
            return getDaysOutOfService(date);
          } catch (error) {
            return 'N/A';
          }
        })(),
        maintenanceTypes[vehicle.id] || vehicle.maintenance_type || 'Planned Maintenance',
        vehicle.reason_text || 'N/A'
      ]);

      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Vehicles Out of Service Report",
          summaryText: `Total Vehicles Out of Service: ${vehicles.length} - Generated on ${new Date().toLocaleDateString()}`,
          currentUser
        }
      });

      const pageWidth = 297;
      const margin = 14;
      const availableWidth = pageWidth - (margin * 2);

      const tableConfig = {
        ...vfhSetup.tableConfig,
        startY: vfhSetup.tableStartY,
        tableWidth: availableWidth,
        headStyles: {
          fillColor: [244, 67, 54] as [number, number, number],
          textColor: 255,
          fontStyle: 'bold' as any,
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: availableWidth * 0.15, fontStyle: 'bold' as any },
          1: { cellWidth: availableWidth * 0.15 },
          2: { cellWidth: availableWidth * 0.10, halign: 'center' as any },
          3: { cellWidth: availableWidth * 0.15 },
          4: { cellWidth: availableWidth * 0.45 }
        },
        showHead: 'everyPage' as any,
        margin: { left: margin, right: margin, top: vfhSetup.tableStartY }
      };

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        ...tableConfig
      });

      const fileName = `vehicles-out-of-service-${getCurrentDate()}`;
      const pdfDataUri = doc.output('datauristring');

      sessionStorage.setItem(`pdf_${fileName}`, pdfDataUri);
      sessionStorage.setItem('pdf_source_section', location.pathname);
      sessionStorage.setItem('pdf_source_path', location.pathname);

      navigate(`/pdf-viewer/${encodeURIComponent(`pdf_${fileName}`)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    }
  };

  useEffect(() => {
    if (user) {
      loadDailyRecord();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDailyRecord();
    }
  }, [selectedDate, user]);

  if (authLoading) {
    return (
      <MainContent>
        <LoadingContainer>
          <div>Checking authentication...</div>
        </LoadingContainer>
      </MainContent>
    );
  }

  if (!user) {
    return (
      <MainContent>
        <Title>Access Denied</Title>
        <ErrorAlert>
          You must be logged in to access this page. Please <a href="/login" style={{ color: '#f44336' }}>log in</a> to continue.
        </ErrorAlert>
      </MainContent>
    );
  }

  if (loading) {
    return (
      <MainContent>
        <LoadingContainer>
          <div>Loading vehicles out of service...</div>
        </LoadingContainer>
      </MainContent>
    );
  }

  return (
    <MainContent>
      {/* Header Section */}
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Title>Vehicles: Out of Service</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: ' 10px' }}>
            <button
              onClick={handlePrevDay}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ← Previous Day
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '14px',
                border: '2px solid #f44336',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            />
            <button
              onClick={handleNextDay}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Next Day →
            </button>
          </div>
        </div>
        <Divider />
      </Section>

      {/* Status Messages */}
      {error && (
        <Section>
          <ErrorAlert>
            <strong>Error:</strong> {error}
          </ErrorAlert>
        </Section>
      )}

      {/* Summary Cards */}
      <Section>
        <FlexRow>
          <Column>
            <SummaryCard>
              <CardTitle>Command Vehicles</CardTitle>
              <CardContent>
                <CountNumber style={{ color: '#f44336' }}>
                  {vehicleCounts.commandOutOfService} / {vehicleCounts.commandTotal}
                </CountNumber>
              </CardContent>
            </SummaryCard>
          </Column>

          <Column>
            <SummaryCard>
              <CardTitle>Fire Vehicles</CardTitle>
              <CardContent>
                <CountNumber style={{ color: '#ff5722' }}>
                  {vehicleCounts.fireOutOfService} / {vehicleCounts.fireTotal}
                </CountNumber>
              </CardContent>
            </SummaryCard>
          </Column>

          <Column>
            <SummaryCard>
              <CardTitle>Ambulances</CardTitle>
              <CardContent>
                <CountNumber style={{ color: '#2196f3' }}>
                  {vehicleCounts.ambulanceOutOfService} / {vehicleCounts.ambulanceTotal}
                </CountNumber>
              </CardContent>
            </SummaryCard>
          </Column>

          <Column>
            <SummaryCard>
              <CardTitle>Utility Vehicles</CardTitle>
              <CardContent>
                <CountNumber style={{ color: '#9c27b0' }}>
                  {vehicleCounts.utilityOutOfService} / {vehicleCounts.utilityTotal}
                </CountNumber>
              </CardContent>
            </SummaryCard>
          </Column>

          <Column>
            <SummaryCard>
              <CardTitle>Total Out of Service</CardTitle>
              <CardContent>
                <CountNumber $isTotal={true} style={{ color: '#f44336' }}>
                  {vehicleCounts.totalOutOfService} / {vehicleCounts.totalVehicles}
                </CountNumber>
              </CardContent>
            </SummaryCard>
          </Column>
        </FlexRow>
      </Section>

      {/* Action Buttons */}
      <Section>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginTop: '20px', flexWrap: 'wrap' }}>
          <ActionButton $variant="primary" onClick={generatePDF}>
            Print to PDF
          </ActionButton>
          <ActionButton $variant="secondary" onClick={handleRefreshData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </ActionButton>
          {!isEditing ? (
            <ActionButton $variant="success" onClick={handleEditMode}>
              {currentRecord ? 'Edit Record' : 'Create Daily Record'}
            </ActionButton>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <ActionButton $variant="success" onClick={handleSaveRecord}>
                Save Record
              </ActionButton>
              <ActionButton $variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </ActionButton>
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            {success ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#2e7d32', 
                backgroundColor: '#e8f5e8', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid #4caf50',
                whiteSpace: 'nowrap'
              }}>
                ✓ {success.replace(/^Success:\s*/i, '').replace(/^Refreshed data:\s*/i, '')} • Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Vehicles Table */}
      <Section>
        <TableContainer>
          <StyledTable>
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '38%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <SortableHeaderCell
                  onClick={() => handleSort('call_sign')}
                  $isActive={sortConfig.key === 'call_sign'}
                  className={sortConfig.key === 'call_sign' ? sortConfig.direction : ''}
                >
                  Call Sign
                </SortableHeaderCell>
                <TableHeaderCell>Vehicle Type</TableHeaderCell>
                <TableHeaderCell>Out of Service Date/Time</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'center' }}>Days Out</TableHeaderCell>
                <TableHeaderCell>Maintenance Type</TableHeaderCell>
                <TableHeaderCell>Out of Service Reason</TableHeaderCell>
                <TableHeaderCell style={{ width: '120px', textAlign: 'center' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#757575' }}>
                    No vehicles currently marked as "Out of Service"
                  </TableCell>
                </TableRow>
              ) : (
                sortedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <strong>{vehicle.vehicle_number || vehicle.call_sign || 'N/A'}</strong>
                      <div style={{ fontSize: '1rem', color: '#666', marginTop: '4px' }}>
                        {vehicle.vehicle_make} {vehicle.vehicle_model}
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.vehicle_type || 'N/A'}</TableCell>
                    <TableCell>
                      {editingVehicleId === vehicle.id ? (
                        <input
                          type="datetime-local"
                          value={formatInputDateTime(vehicle.out_of_service_date || vehicle.updated_at || vehicle.created_at)}
                          onChange={(e) => handleOutOfServiceDateChange(vehicle.id, e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #dee2e6', borderRadius: 4 }}
                        />
                      ) : (
                        (() => {
                          const iso = vehicle.out_of_service_date || vehicle.updated_at || vehicle.created_at;
                          const str = formatInputDateTime(iso);
                          return str ? str.replace('T', ' ') : 'N/A';
                        })()
                      )}
                    </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      {(() => {
                        try {
                          const date = vehicle.out_of_service_date || vehicle.updated_at || vehicle.created_at;
                          if (!date) return 'N/A';
                          const testDate = new Date(date);
                          if (isNaN(testDate.getTime())) return 'N/A';
                          return getDaysOutOfService(date);
                        } catch (error) {
                          return 'N/A';
                        }
                      })()}
                    </TableCell>
                    <TableCell style={{ minWidth: '220px' }}>
                      <MaintenanceTypeSelect
                        value={maintenanceTypes[vehicle.id] || vehicle.maintenance_type || 'Planned Maintenance'}
                        onChange={(e) => handleMaintenanceTypeChange(vehicle.id, e.target.value as 'Corrective Maintenance' | 'Planned Maintenance')}
                        disabled={editingVehicleId !== vehicle.id}
                      >
                        <option value="Planned Maintenance">Planned Maintenance</option>
                        <option value="Corrective Maintenance">Corrective Maintenance</option>
                      </MaintenanceTypeSelect>
                    </TableCell>
                    <TableCell style={{ minWidth: '350px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        {editingVehicleId === vehicle.id ? (
                          <ReasonTextArea
                            value={vehicle.reason_text || ''}
                            onChange={(e) => handleReasonTextChange(vehicle.id, e.target.value)}
                            placeholder="Enter detailed reason for out of service status..."
                            rows={3}
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <div style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            minHeight: '60px',
                            fontSize: '14px',
                            lineHeight: '1.4'
                          }}>
                            {vehicle.reason_text || 'No reason provided'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'center' }}>
                        {editingVehicleId === vehicle.id ? (
                          <>
                            <ActionButton
                              $variant="success"
                              onClick={() => handleIndividualUpdate(vehicle.id)}
                              style={{ fontSize: '12px', padding: '4px 8px', minWidth: '60px' }}
                            >
                              Update
                            </ActionButton>
                            <ActionButton
                              $variant="secondary"
                              onClick={() => handleIndividualCancel(vehicle.id)}
                              style={{ fontSize: '12px', padding: '4px 8px', minWidth: '60px' }}
                            >
                              Cancel
                            </ActionButton>
                          </>
                        ) : (
                          <ActionButton
                            $variant="primary"
                            onClick={() => handleIndividualEdit(vehicle.id)}
                            style={{ fontSize: '12px', padding: '4px 8px', minWidth: '60px' }}
                            disabled={editingVehicleId !== null}
                          >
                            Edit
                          </ActionButton>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </StyledTable>
        </TableContainer>
      </Section>
    </MainContent>
  );
}