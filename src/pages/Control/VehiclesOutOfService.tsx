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

const Paragraph = styled.p`
  margin-bottom: 8px;
  line-height: 1.6;
  color: #333;
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

const StatusChip = styled.span<{ status: string }>`
  background-color: ${props => {
    const status = props.status.toLowerCase();
    switch (status) {
      case 'out of service':
        return '#f44336';
      case 'maintenance':
        return '#ff9800';
      case 'repair':
        return '#2196f3';
      case 'at station':
        return '#ff5722';
      case 'in workshop':
        return '#9c27b0';
      case 'operational':
        return '#4caf50';
      case 'on standby':
        return '#ffeb3b';
      case 'in service':
        return '#4caf50';
      default:
        return '#757575';
    }
  }};
  color: ${props => {
    const status = props.status.toLowerCase();
    if (status === 'on standby' || status === 'operational' || status === 'in service') return '#333';
    return 'white';
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 20px 0;
  border: 2px solid #f44336;
  border-radius: 8px;
  
  table {
    transition: none;
  }
  
  th {
    transition: none;
  }
  
  thead {
    transition: none;
  }
  
  tr {
    transition: none;
  }
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
  
  tr {
    background-color: #f44336 !important;
    transition: none;
    
    &:hover {
      background-color: #f44336 !important;
    }
  }
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
  transition: none;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: #f44336;
    color: white;
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

const FooterSection = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  padding: 15px;
  border-radius: 8px;
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
`;

const MaintenanceTypeSelect = styled.select`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
`;

const ReasonTextArea = styled.textarea`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 40px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
`;

const EditButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 4px;
  
  &:hover {
    background-color: #218838;
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

      // Handle call_sign specifically - extract numeric part for proper sorting
      if (sortConfig.key === 'call_sign') {
        aValue = a.call_sign || a.vehicle_number || '';
        bValue = b.call_sign || b.vehicle_number || '';

        // Extract letters and numbers for proper alphanumeric sorting
        const aMatch = (aValue as string).match(/^([A-Za-z]+)(\d+)$/);
        const bMatch = (bValue as string).match(/^([A-Za-z]+)(\d+)$/);

        if (aMatch && bMatch) {
          const [, aLetters, aNumbers] = aMatch;
          const [, bLetters, bNumbers] = bMatch;

          // First compare letters
          if (aLetters !== bLetters) {
            return sortConfig.direction === 'asc'
              ? aLetters.localeCompare(bLetters)
              : bLetters.localeCompare(aLetters);
          }

          // Then compare numbers
          const aNum = parseInt(aNumbers, 10);
          const bNum = parseInt(bNumbers, 10);
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
      }

      // Default string comparison
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  };

  // Memoized calculations for flash cards to prevent infinite re-renders
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

  // Memoized sorted vehicles to prevent infinite re-renders
  const sortedVehicles = useMemo(() => {
    return getSortedVehicles();
  }, [vehicles, sortConfig]);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get stored authentication token
  const getStoredToken = () => {
    // Try multiple possible token storage locations
    const token = localStorage.getItem('supabase.auth.token') ||
      sessionStorage.getItem('supabase.auth.token') ||
      localStorage.getItem('sb-yhrecxzygcapozirquzw-auth-token') ||
      sessionStorage.getItem('sb-yhrecxzygcapozirquzw-auth-token');

    console.log('Token retrieval attempt:', token ? 'Token found' : 'No token found');
    return token;
  };

  // API functions for database operations
  const fetchDailyRecord = async (date: string) => {
    try {
      console.log('=== DEBUG: fetchDailyRecord called with date:', date);

      const { data, error } = await supabase
        .from('daily_vehicle_records')
        .select('*')
        .eq('record_date', date)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching daily record:', error);
        throw error;
      }

      console.log('Daily record found:', !!data);
      if (data) {
        console.log('Record data:', {
          id: data.id,
          record_date: data.record_date,
          vehicles_count: data.vehicles_data?.length || 0
        });
      }

      return data;
    } catch (error) {
      console.error('Error in fetchDailyRecord:', error);
      throw error;
    }
  };

  const saveDailyRecord = async (recordDate: string, vehiclesData: Vehicle[]) => {
    try {
      if (!user) throw new Error('User not authenticated');

      console.log('=== Starting saveDailyRecord ===');
      console.log('Record date:', recordDate);
      console.log('Vehicles count:', vehiclesData.length);
      console.log('User ID:', user.id);

      // Log sample vehicle data
      if (vehiclesData.length > 0) {
        console.log('Sample vehicle data:', {
          call_sign: vehiclesData[0].call_sign,
          maintenance_type: vehiclesData[0].maintenance_type,
          reason_text: vehiclesData[0].reason_text
        });
      }

      // First, check if a record already exists for this date
      const { data: existingRecord, error: checkError } = await supabase
        .from('daily_vehicle_records')
        .select('id')
        .eq('record_date', recordDate)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking for existing record:', checkError);
        throw new Error(`Failed to check existing record: ${checkError.message}`);
      }

      let result;
      if (existingRecord) {
        console.log('Record already exists for date:', recordDate, 'Updating existing record...');
        // Update existing record
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
          console.error('=== Supabase update error ===', error);
          throw new Error(`Failed to update record: ${error.message}`);
        }

        result = data;
        console.log('=== Record updated successfully ===');
      } else {
        console.log('No existing record found for date:', recordDate, 'Creating new record...');
        // Create new record
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
          console.error('=== Supabase insert error ===', error);
          throw new Error(`Failed to save record: ${error.message}`);
        }

        result = data;
        console.log('=== Record created successfully ===');
      }

      console.log('Saved/Updated record ID:', result.id);
      console.log('Saved/Updated record date:', result.record_date);
      console.log('Saved/Updated vehicles count:', result.vehicles_data?.length || 0);

      return result;
    } catch (error) {
      console.error('=== Error saving/updating daily record ===', error);
      throw error;
    }
  };

  const updateDailyRecord = async (recordDate: string, vehiclesData: Vehicle[]) => {
    try {
      if (!user) throw new Error('User not authenticated');

      console.log('=== Starting updateDailyRecord ===');
      console.log('Record date:', recordDate);
      console.log('Vehicles count:', vehiclesData.length);
      console.log('User ID:', user.id);

      // Log sample vehicle data
      if (vehiclesData.length > 0) {
        console.log('Sample vehicle data:', {
          call_sign: vehiclesData[0].call_sign,
          maintenance_type: vehiclesData[0].maintenance_type,
          reason_text: vehiclesData[0].reason_text
        });
      }

      const updateData = {
        vehicles_data: vehiclesData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };

      console.log('Update data prepared:', {
        vehicles_data_length: updateData.vehicles_data.length,
        updated_by: updateData.updated_by,
        updated_at: updateData.updated_at
      });

      const { data, error } = await supabase
        .from('daily_vehicle_records')
        .update(updateData)
        .eq('record_date', recordDate)
        .select()
        .single();

      if (error) {
        console.error('=== Supabase update error ===', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw new Error(`Failed to update record: ${error.message}`);
      }

      console.log('=== Record updated successfully ===');
      console.log('Updated record ID:', data.id);
      console.log('Updated record date:', data.record_date);
      console.log('Updated vehicles count:', data.vehicles_data?.length || 0);

      return data;
    } catch (error) {
      console.error('=== Error updating daily record ===', error);
      throw error;
    }
  };

  // Load assignments for totals (status from station_assignments)
  const loadAllAssignmentsForDate = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select('*')
        .eq('assignment_date', date)
        .order('call_sign', { ascending: true });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Error loading all assignments for totals:', e);
      return [];
    }
  };

  // Load vehicles from Supabase - Get complete list from vehicle_assignments for current date
  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentDate = selectedDate;
      console.log('Loading vehicles for date:', currentDate);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();

      // Calculate 7 days ago date first
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Load all assignments for today to compute totals by status
      const allAssignmentsToday = await loadAllAssignmentsForDate(currentDate);
      const uniqueAll = (allAssignmentsToday || []).filter((item, idx, arr) => {
        const key = (item.call_sign || '').toString().trim().toUpperCase();
        return arr.findIndex(x => (x.call_sign || '').toString().trim().toUpperCase() === key) === idx;
      });
      setAllVehicles(uniqueAll);

      // Load vehicle assignments data from the vehicle_assignments table for out of service vehicles
      console.log('Loading vehicle assignments for out of service vehicles...');

      const { data: assignments, error: assignmentsError } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select(`
          *,
          vehicle_id
        `)
        .eq('assignment_date', currentDate)
        .eq('status', 'Out of Service')
        .order('updated_at', { ascending: false }); // Get most recent updates first

      if (assignmentsError) {
        console.error('Error loading assignments:', assignmentsError);
        throw assignmentsError;
      }

      console.log('Assignments loaded:', assignments?.length || 0, 'out of service vehicles today');

      // Debug: Check if reason fields are present in the out of service assignments
      if (assignments && assignments.length > 0) {
        console.log('Sample out of service assignment:', {
          first: assignments[0],
          has_notes: 'notes' in assignments[0],
          notes_value: assignments[0].notes,
          updated_at: assignments[0].updated_at
        });
      }

      // Load existing daily record to get updated maintenance information
      console.log('Loading existing daily record for maintenance information...');
      const { data: existingRecord, error: recordError } = await supabase
        .from('daily_vehicle_records')
        .select('*')
        .eq('record_date', currentDate)
        .single();

      if (recordError && recordError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.log('Error loading daily record (but continuing):', recordError);
      }

      console.log('Existing daily record found:', !!existingRecord);
      if (existingRecord) {
        console.log('Existing record vehicles count:', existingRecord.vehicles_data?.length || 0);
      }

      // Remove duplicate vehicles (same call_sign) and keep only the most recent one
      const uniqueAssignments = assignments?.reduce((acc: any[], assignment: any) => {
        const existingIndex = acc.findIndex(a => a.call_sign === assignment.call_sign);
        if (existingIndex === -1) {
          acc.push(assignment);
        } else if (new Date(assignment.updated_at) > new Date(acc[existingIndex].updated_at)) {
          acc[existingIndex] = assignment;
        }
        return acc;
      }, []) || [];

      console.log('Unique assignments after deduplication:', uniqueAssignments.length, 'vehicles');

      // Debug: Log the first assignment to see available date fields
      if (uniqueAssignments.length > 0) {
        console.log('First assignment object:', uniqueAssignments[0]);
        console.log('Available date fields:', {
          created_at: uniqueAssignments[0].created_at,
          updated_at: uniqueAssignments[0].updated_at,
          assignment_date: uniqueAssignments[0].assignment_date
        });

        // Test the calculation with the actual data
        const testAssignment = uniqueAssignments[0];
        const testDate = testAssignment.updated_at || testAssignment.created_at;
        console.log('Testing with actual assignment date:', testDate);
        const testResult = getDaysOutOfService(testDate);
        console.log('Test result:', testResult, 'days out');
      }

      // Transform data to match Vehicle interface
      const vehiclesOutOfService: Vehicle[] = uniqueAssignments.map((assignment: any) => {

        // Debug: Log the assignment dates before transformation
        console.log('Transforming assignment:', {
          call_sign: assignment.call_sign,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
          assignment_date: assignment.assignment_date,
          status: assignment.status
        });

        // Look for existing maintenance data in the daily record
        let maintenanceType = 'Planned Maintenance' as 'Corrective Maintenance' | 'Planned Maintenance';
        let reasonText = assignment.notes || '';

        if (existingRecord && existingRecord.vehicles_data) {
          const existingVehicle = existingRecord.vehicles_data.find((v: any) => v.call_sign === assignment.call_sign);
          if (existingVehicle) {
            maintenanceType = existingVehicle.maintenance_type || maintenanceType;
            reasonText = existingVehicle.reason_text || reasonText;
            console.log(`Found existing maintenance data for ${assignment.call_sign}:`, {
              maintenanceType,
              reasonText: reasonText?.substring(0, 50) + '...'
            });
          }
        }

        return {
          id: assignment.id || `temp-${Math.random()}`,
          vehicle_number: assignment.call_sign || 'N/A',
          vehicle_type: assignment.vehicle_type || 'N/A',
          status: assignment.status || 'Out of Service',
          readiness: assignment.readiness || 'N/A',
          assigned_station: assignment.station_assignment || 'Unassigned',
          driver_name: assignment.crew_members || '',
          call_sign: assignment.call_sign || '',
          vehicle_make: assignment.vehicle_make || '',
          vehicle_model: assignment.vehicle_model || '',
          out_of_service_reason: assignment.readiness === 'In Workshop' ? 'In Workshop for Maintenance' :
            assignment.readiness === 'At Station' ? 'At Station' : 'Out of Service',
          // Use assignment_date as it's the date when the vehicle was marked out of service
          // Fallback to updated_at then created_at if assignment_date is not available
          out_of_service_date: assignment.assignment_date || assignment.updated_at || assignment.created_at || new Date().toISOString(),
          in_service_date: assignment.status === 'In Service' ? assignment.updated_at || new Date().toISOString() : undefined,
          estimated_return_date: assignment.updated_at || null,
          maintenance_notes: `Status: ${assignment.status} | Readiness: ${assignment.readiness} | Station: ${assignment.station_assignment}`,
          maintenance_type: maintenanceType,
          reason_text: reasonText,
          created_at: assignment.created_at || new Date().toISOString(),
          updated_at: assignment.updated_at || new Date().toISOString()
        };
      }).filter(Boolean) || [];

      console.log('Transformed vehicles:', vehiclesOutOfService.length, 'vehicles');

      // Debug: Check reason_text values for first few vehicles
      if (vehiclesOutOfService.length > 0) {
        vehiclesOutOfService.slice(0, 3).forEach((vehicle, index) => {
          console.log(`Vehicle ${index + 1} reason data:`, {
            call_sign: vehicle.call_sign,
            reason_text: vehicle.reason_text,
            has_reason_text: !!vehicle.reason_text
          });
        });
      }

      // Debug: Log the first transformed vehicle to see the final data
      if (vehiclesOutOfService.length > 0) {
        console.log('First transformed vehicle:', {
          call_sign: vehiclesOutOfService[0].call_sign,
          out_of_service_date: vehiclesOutOfService[0].out_of_service_date,
          in_service_date: vehiclesOutOfService[0].in_service_date,
          status: vehiclesOutOfService[0].status,
          maintenance_type: vehiclesOutOfService[0].maintenance_type,
          reason_text: vehiclesOutOfService[0].reason_text
        });
      }
      const uniqueOOS = (vehiclesOutOfService || []).filter((item, idx, arr) => {
        const key = (item.call_sign || '').toString().trim().toUpperCase();
        return arr.findIndex(x => (x.call_sign || '').toString().trim().toUpperCase() === key) === idx;
      });
      setVehicles(uniqueOOS);
      setLastUpdated(new Date()); // Update last updated timestamp

      // Log vehicle breakdown by category for debugging - using today's assignments (same as Vehicles In Service)
      const fireVehicles = uniqueAll.filter(v => (v.call_sign || '').toUpperCase().startsWith('F'));
      const commandVehicles = uniqueAll.filter(v => (v.call_sign || '').toUpperCase().startsWith('C'));
      const ambulances = uniqueAll.filter(v => (v.call_sign || '').toLowerCase().startsWith('med'));
      const utilityVehicles = uniqueAll.filter(v => (v.call_sign || '').toUpperCase().startsWith('X'));

      console.log('Vehicle breakdown (today\'s assignments):');
      console.log('- Fire Vehicles (F*):', fireVehicles.length, 'total,', vehiclesOutOfService.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')).length, 'out of service');
      console.log('- Command Vehicles (C*):', commandVehicles.length, 'total,', vehiclesOutOfService.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')).length, 'out of service');
      console.log('- Ambulances (Med*):', ambulances.length, 'total,', vehiclesOutOfService.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')).length, 'out of service');
      console.log('- Utility Vehicles (X*):', utilityVehicles.length, 'total,', vehiclesOutOfService.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')).length, 'out of service');
      console.log('- Total vehicles:', uniqueAll.length, 'total,', vehiclesOutOfService.length, 'out of service');

    } catch (err: any) {
      console.error('Error in loadVehicles:', err);
      setError(err.message || 'Failed to load vehicles out of service');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  // Minimal loading function to test basic functionality
  const loadMinimalData = async () => {
    try {
      console.log('=== DEBUG: Starting minimal data load ===');
      setLoading(true);
      setError(null);

      // Set minimal mock data to test rendering
      const mockVehicles: Vehicle[] = [
        {
          id: 'test-1',
          vehicle_number: 'F01',
          vehicle_type: 'Fire Truck',
          status: 'Out of Service',
          readiness: 'In Workshop',
          assigned_station: 'Station 1',
          call_sign: 'F01',
          out_of_service_reason: 'Test maintenance',
          out_of_service_date: new Date().toISOString(),
          maintenance_type: 'Planned Maintenance',
          reason_text: 'Test reason',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockAllVehicles = [
        { call_sign: 'F01', vehicle_type: 'Fire Truck' },
        { call_sign: 'F02', vehicle_type: 'Fire Engine' },
        { call_sign: 'C01', vehicle_type: 'Command Vehicle' },
        { call_sign: 'Med01', vehicle_type: 'Ambulance' },
        { call_sign: 'X01', vehicle_type: 'Utility Vehicle' }
      ];

      setVehicles(mockVehicles);
      setAllVehicles(mockAllVehicles);

      console.log('Minimal data load completed');
    } catch (err: any) {
      console.error('Error in minimal load:', err);
      setError(`Minimal load failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load daily record from database - Try direct Supabase query first
  const loadDailyRecord = async () => {
    try {
      console.log('=== DEBUG: Starting loadDailyRecord ===');
      console.log('Current user:', user);
      console.log('User profile:', userProfile);

      const currentDate = selectedDate;
      console.log('Current date:', currentDate);

      // Try direct Supabase query first (bypass edge function)
      console.log('Attempting direct Supabase query...');
      const { data: records, error: dbError } = await supabase
        .from('daily_vehicle_records')
        .select('*')
        .eq('record_date', currentDate)
        .single();

      if (dbError) {
        console.log('Direct query failed or no record found, skipping edge function and loading vehicles directly...');
        console.log('DB Error details:', dbError);

        // Skip edge function due to 401 error, just load vehicles directly
        console.log('No record found, calling loadVehicles...');
        await loadVehicles();
      } else if (records) {
        console.log('Direct query successful:', records);

        // Process the direct query result
        setCurrentRecord(records);
        setVehicles(records.vehicles_data || []);

        // Initialize maintenance types from the record
        const types: { [key: string]: 'Corrective Maintenance' | 'Planned Maintenance' } = {};
        (records.vehicles_data || []).forEach(vehicle => {
          if (vehicle.maintenance_type) {
            types[vehicle.id] = vehicle.maintenance_type;
          }
        });
        setMaintenanceTypes(types);
        console.log('Direct query processing complete');
      } else {
        console.log('No record found via direct query, calling loadVehicles...');
        await loadVehicles();
      }
    } catch (err: any) {
      console.error('Error in loadDailyRecord:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });

      // If no record found, load current vehicles
      if (err.message && err.message.includes('No record found')) {
        console.log('No record found error, calling loadVehicles...');
        await loadVehicles();
      } else if (err.message && err.message.includes('401')) {
        console.log('401 authentication error, loading vehicles directly...');
        await loadVehicles();
      } else {
        console.log('Setting error state...');
        setError(err.message || 'Failed to load daily record');
      }
    }
  };

  useEffect(() => {
    if (user) {
      console.log('=== DEBUG: useEffect triggered with user:', user);

      // Start with minimal data to ensure page renders
      loadMinimalData();

      // Then try to load real data in background
      const loadRealData = async () => {
        try {
          console.log('Attempting to load daily record...');
          await loadDailyRecord();
          console.log('Daily record loaded successfully');
        } catch (error) {
          console.error('Failed to load daily record, falling back to direct vehicle loading:', error);

          // Fallback: directly load vehicles from vehicle_assignments table
          try {
            console.log('Starting fallback loading...');
            setLoading(true);
            setError(null);

            await loadVehicles();
            console.log('Fallback loading completed');
          } catch (fallbackError) {
            console.error('Fallback loading also failed:', fallbackError);
            setError('Unable to load vehicles. Please check your connection and try refreshing.');
          } finally {
            setLoading(false);
          }
        }
      };

      // Delay real data loading to ensure page renders first
      setTimeout(() => {
        loadRealData();
      }, 1000);
    } else {
      console.log('No user found, skipping load');
    }
  }, [user]);

  // Optional: Add a visibility change listener to refresh data when the page becomes visible
  // This is now disabled to prevent excessive refreshes
  /*
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, refreshing data...');
        handleRefreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);
  */

  // Optional: Add window focus event listener to refresh data when user returns to the tab
  // This is now disabled to prevent excessive refreshes
  /*
  useEffect(() => {
    const handleWindowFocus = () => {
      if (user) {
        console.log('Window focused, refreshing data...');
        handleRefreshData();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [user]);
  */

  // Optional: Add periodic refresh every 5 minutes when the page is active
  // This is now disabled to prevent excessive refreshes - use manual refresh instead
  /*
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    if (user && !document.hidden) {
      refreshInterval = setInterval(() => {
        console.log('Periodic refresh triggered...');
        handleRefreshData();
      }, 300000); // Refresh every 5 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);
  */

  // Test the calculation function - run only once on mount
  useEffect(() => {
    console.log('=== Testing Days Out Calculation ===');

    // Test with various date formats
    const testCases = [
      '2024-11-12T10:00:00Z', // ISO string
      '2024-11-12', // Date only
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    ];

    testCases.forEach((testDate, index) => {
      const result = getDaysOutOfService(testDate);
      console.log(`Test ${index + 1} - Input: "${testDate}", Result: ${result} days`);
    });

    // Manual calculation test
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const manualResult = Math.ceil((new Date().getTime() - twoDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
    console.log('Manual calculation for 2 days ago:', manualResult, 'days');
    console.log('Function result for 2 days ago:', getDaysOutOfService(twoDaysAgo.toISOString()));
  }, []); // Empty dependency array to run only once

  const getDaysOutOfService = (outOfServiceDate?: string, inServiceDate?: string) => {
    if (!outOfServiceDate) return 'N/A';

    try {
      const startDate = new Date(outOfServiceDate);
      const today = new Date();

      // Check if the date is valid
      if (isNaN(startDate.getTime())) {
        return 'N/A';
      }

      // Calculate difference in milliseconds
      const diffTime = today.getTime() - startDate.getTime();

      // Convert to days
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Ensure we don't return negative days
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
    console.log('handleReasonTextChange called:', { vehicleId, newReasonText });
    setVehicles(prev => prev.map(vehicle =>
      vehicle.id === vehicleId
        ? { ...vehicle, reason_text: newReasonText }
        : vehicle
    ));
  };

  // Individual vehicle edit functions
  const handleIndividualEdit = (vehicleId: string) => {
    setEditingVehicleId(vehicleId);
  };

  const handleIndividualUpdate = async (vehicleId: string) => {
    try {
      setError(null);
      setSuccess(null);

      console.log('=== Starting individual vehicle update ===');
      console.log('Vehicle ID:', vehicleId);
      console.log('Current user:', user?.id);

      // Find the vehicle being updated
      const vehicleToUpdate = vehicles.find(v => v.id === vehicleId);
      if (!vehicleToUpdate) {
        throw new Error('Vehicle not found');
      }

      console.log('Vehicle to update:', {
        call_sign: vehicleToUpdate.call_sign,
        maintenance_type: vehicleToUpdate.maintenance_type,
        reason_text: vehicleToUpdate.reason_text
      });

      // Update the specific vehicle in the database
      const currentDate = getCurrentDate();
      console.log('Current date for record:', currentDate);

      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === vehicleId
          ? {
            ...vehicle,
            maintenance_type: maintenanceTypes[vehicleId] || vehicle.maintenance_type || 'Planned Maintenance',
            reason_text: vehicle.reason_text || '' // Ensure reason_text is preserved
          }
          : vehicle
      );

      const updatedVehicle = updatedVehicles.find(v => v.id === vehicleId);
      console.log('Updated vehicle data:', {
        call_sign: updatedVehicle?.call_sign,
        maintenance_type: updatedVehicle?.maintenance_type,
        reason_text: updatedVehicle?.reason_text,
        total_vehicles: updatedVehicles.length
      });

      console.log('Current record exists:', !!currentRecord);

      if (currentRecord) {
        console.log('Updating existing record...');
        const result = await updateDailyRecord(currentDate, updatedVehicles);
        console.log('Update result:', !!result);
        setSuccess(`Vehicle ${vehicleToUpdate.call_sign || vehicleToUpdate.vehicle_number} updated successfully!`);
      } else {
        console.log('Creating new record...');
        const result = await saveDailyRecord(currentDate, updatedVehicles);
        console.log('Save result:', !!result);
        setSuccess('Daily record updated successfully!');
      }

      console.log('=== Individual update completed successfully ===');

      // Exit individual edit mode
      setEditingVehicleId(null);
      // Reload the record to get updated data
      await loadDailyRecord();

    } catch (err: any) {
      console.error('=== Individual update failed ===', err);
      setError(err.message || 'Failed to update vehicle');
    }
  };

  const handleIndividualCancel = (vehicleId: string) => {
    setEditingVehicleId(null);
    // Optionally, you could reload the data to discard changes
  };

  const handleSaveRecord = async () => {
    try {
      setError(null);
      setSuccess(null);

      const currentDate = getCurrentDate();
      const vehiclesWithMaintenanceType = vehicles.map(vehicle => ({
        ...vehicle,
        maintenance_type: maintenanceTypes[vehicle.id] || 'Planned Maintenance',
        reason_text: vehicle.reason_text || '' // Ensure reason_text is preserved
      }));

      if (currentRecord) {
        // Update existing record
        await updateDailyRecord(currentDate, vehiclesWithMaintenanceType);
        setSuccess('Daily record updated successfully!');
      } else {
        // Create new record
        await saveDailyRecord(currentDate, vehiclesWithMaintenanceType);
        setSuccess('Daily record saved successfully!');
      }

      setIsEditing(false);
      // Reload the record to get updated data
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
    // Reload the record to reset any unsaved changes
    loadDailyRecord();
  };

  // Force refresh to get latest data from database
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== Starting data refresh ===');
      console.log('Current date:', getCurrentDate());
      console.log('Refreshing from vehicle_assignments table...');

      // Clear any cached data to ensure fresh load
      setVehicles([]);
      setAllVehicles([]);
      setCurrentRecord(null);

      // Always load fresh data from the vehicle_assignments table
      // This ensures we get the latest Out of Service vehicles from the Vehicle Station Assignment form
      await loadVehicles();

      // Clear any existing record to ensure we're working with live data
      setCurrentRecord(null);
      setIsEditing(false);

      console.log('=== Data refresh completed ===');
      setLastUpdated(new Date()); // Update timestamp after successful refresh

    } catch (err: any) {
      console.error('Error during data refresh:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Date navigation handlers
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

  const generatePDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Use actual logged-in user data for PDF attribution
      const currentUser = {
        email: user?.email || '',
        profile: {
          display_name: userProfile?.display_name || '',
          full_name: userProfile?.full_name || ''
        }
      };

      // Get company logo
      const logoBase64 = await getCompanyLogo();

      // Use memoized sorted vehicles for PDF generation
      const pdfSortedVehicles = [...vehicles].sort((a, b) => {
        const aCallSign = (a.call_sign || a.vehicle_number || '').toString();
        const bCallSign = (b.call_sign || b.vehicle_number || '').toString();

        // Extract letters and numbers for proper alphanumeric sorting
        const aMatch = aCallSign.match(/^([A-Za-z]+)(\d+)$/);
        const bMatch = bCallSign.match(/^([A-Za-z]+)(\d+)$/);

        if (aMatch && bMatch) {
          const [, aLetters, aNumbers] = aMatch;
          const [, bLetters, bNumbers] = bMatch;

          // First compare letters
          if (aLetters !== bLetters) {
            return aLetters.localeCompare(bLetters);
          }

          // Then compare numbers
          const aNum = parseInt(aNumbers, 10);
          const bNum = parseInt(bNumbers, 10);
          return aNum - bNum;
        }

        // Default string comparison
        return aCallSign.localeCompare(bCallSign);
      });

      // Prepare table data with sorted vehicles
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
            console.error('Error calculating days out for vehicle:', vehicle.call_sign, error);
            return 'N/A';
          }
        })(),
        maintenanceTypes[vehicle.id] || vehicle.maintenance_type || 'Planned Maintenance',
        vehicle.reason_text || 'N/A'
      ]);

      // Setup VFH A4 standard PDF
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

      // Calculate optimal column widths for full page width (A4 landscape: 297mm width, minus margins)
      const pageWidth = 297; // A4 landscape width in mm
      const margin = 14; // Left and right margins (increased to prevent overflow)
      const availableWidth = pageWidth - (margin * 2); // Available width for table: 269mm

      // Generate table with optimized configuration for full width
      const tableConfig = {
        ...vfhSetup.tableConfig,
        startY: vfhSetup.tableStartY,
        tableWidth: availableWidth, // Use full available width
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
          0: { cellWidth: availableWidth * 0.15, fontStyle: 'bold' as any }, // Call Sign (15%)
          1: { cellWidth: availableWidth * 0.15 }, // Vehicle Type (15%)
          2: { cellWidth: availableWidth * 0.10, halign: 'center' as any }, // Days Out (10%)
          3: { cellWidth: availableWidth * 0.15 }, // Maintenance Type (15%)
          4: { cellWidth: availableWidth * 0.45 } // Out of Service Reason (45%)
        },
        showHead: 'everyPage' as any,
        margin: { left: margin, right: margin, top: vfhSetup.tableStartY }
      };

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        ...tableConfig
      });

      // Instead of downloading, save PDF to sessionStorage and open in viewer
      const fileName = `vehicles-out-of-service-${getCurrentDate()}`;
      const pdfDataUri = doc.output('datauristring');

      // Store the PDF data in sessionStorage
      sessionStorage.setItem(`pdf_${fileName}`, pdfDataUri);

      // Store the source section for proper navigation context
      sessionStorage.setItem('pdf_source_section', location.pathname);
      sessionStorage.setItem('pdf_source_path', location.pathname);

      // Navigate to PDF viewer in the middle column
      navigate(`/pdf-viewer/${encodeURIComponent(`pdf_${fileName}`)}`);

    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    }
  };

  // Load data when selectedDate changes
  useEffect(() => {
    if (user) {
      console.log('=== Date changed, reloading data for:', selectedDate);
      loadDailyRecord();
    }
  }, [selectedDate, user]);

  if (authLoading) {
    return (
      <MainContent>
        <LoadingContainer>
          <div>Checking authentication...</div>
          <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#666' }}>
            Debug: Auth loading state
          </div>
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
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
          <strong>Debug Info:</strong>
          <div>User: {user ? 'Present' : 'Not found'}</div>
          <div>User Profile: {userProfile ? 'Present' : 'Not found'}</div>
          <div>Auth token: {getStoredToken() ? 'Present' : 'Not found'}</div>
          <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
          <div>Current Session Status: Not authenticated</div>
        </div>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
          <strong>Note:</strong> The flash cards data will show correct totals once you log in and the page loads properly.
        </div>
      </MainContent>
    );
  }

  if (loading) {
    return (
      <MainContent>
        <LoadingContainer>
          <div>Loading vehicles out of service...</div>
          <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#666' }}>
            Debug: Loading state active - User: {user ? 'Logged in' : 'Not logged in'}
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#888' }}>
            Check browser console for detailed logs
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#888' }}>
            Profile: {userProfile ? 'Loaded' : 'Not loaded'} | Auth Loading: {authLoading ? 'Yes' : 'No'}
          </div>
          <div style={{ fontSize: '0.7rem', marginTop: '5px', color: '#999' }}>
            Debug: loadAllVehicles called, loadVehicles called, data loading in progress...
          </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <br />
            <small>Debug: Check console for more details</small>
          </ErrorAlert>
        </Section>
      )}

      {success && (
        <Section>
          <SuccessAlert>
            <strong>Success:</strong> {success}
          </SuccessAlert>
        </Section>
      )}



      {/* Summary Cards */}
      <Section>
        <FlexRow>
          {/* Command Vehicles */}
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

          {/* Fire Vehicles */}
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

          {/* Ambulances */}
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

          {/* Utility Vehicles */}
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

          {/* Total Out of Service */}
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

      {/* Action Buttons - Below Flash Cards */}
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
          <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#666', display: 'flex', alignItems: 'center' }}>
            {vehicles.length} vehicles out of service • Last updated: {lastUpdated.toLocaleTimeString()}
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
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#757575' }}>
                    No vehicles currently marked as "Out of Service" in today's Vehicle Station Assignment
                  </TableCell>
                </TableRow>
              ) : (
                sortedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <strong>{vehicle.vehicle_number || vehicle.call_sign || 'N/A'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
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
                          console.error('Error calculating days out for vehicle:', vehicle.call_sign, error);
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
};