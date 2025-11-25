import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDateTime, formatDateTimeReadable } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, createStandardizedFooter } from '../../utils/pdfReportHelper';
import { getCompanyLogo } from '../../utils/companyLogo';
import { Modal } from '../../components/UI/Modal';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 1rem;
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

const AssignmentSection = styled.div`
  margin-top: 0px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
`;

const DatePickerLabel = styled.label`
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

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'success' | 'info' | 'warning' }>`
  background-color: ${props => {
    switch (props.$variant) {
      case 'success': return '#28a745';
      case 'info': return '#17a2b8';
      case 'warning': return '#ffc107';
      default: return '#FF9900';
    }
  }} !important;
  color: ${props => props.$variant === 'warning' ? '#333' : 'white'} !important;
  padding: 10px 20px;
  border: none !important;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 20px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: #1177BB;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  font-size: 1rem;
  border-bottom: 2px solid #0e5a8a;
`;

const FilterHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const FilterLabel = styled.span`
  font-size: 0.85rem;
  font-weight: bold;
  opacity: 0.9;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  font-size: 0.8rem;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
    border-color: #FF9900;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  option {
    background: white;
    color: #333;
    padding: 2px;
  }
  
  option[value="All"] {
    font-weight: bold;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
  color: #333;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
  
  &:hover {
    background: #e3f2fd;
  }
`;

const StatusSelect = styled.select<{ $isOutOfService?: boolean }>`
  padding: 6px 10px;
  border: 2px solid ${props => props.$isOutOfService ? '#dc3545' : '#28a745'};
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${props => props.$isOutOfService ? '#fff' : '#fff'};
  background: ${props => props.$isOutOfService ? '#dc3545' : '#28a745'};
  cursor: pointer;
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: ${props => props.$isOutOfService ? '#c82333' : '#218838'};
  }
  
  option {
    background: white;
    color: #333;
  }
`;

const ReadinessSelect = styled.select<{ $readinessType?: string }>`
  padding: 6px 10px;
  border: 2px solid ${props => {
    if (props.$readinessType === 'At Station' || props.$readinessType === 'In Workshop') return '#dc3545';
    if (props.$readinessType === 'Operational') return '#28a745';
    return '#ffc107'; // On Standby
  }};
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${props => {
    if (props.$readinessType === 'At Station' || props.$readinessType === 'In Workshop') return '#fff';
    if (props.$readinessType === 'Operational') return '#fff';
    return '#333'; // On Standby
  }};
  background: ${props => {
    if (props.$readinessType === 'At Station' || props.$readinessType === 'In Workshop') return '#dc3545';
    if (props.$readinessType === 'Operational') return '#28a745';
    return '#ffc107'; // On Standby
  }};
  cursor: pointer;
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: ${props => {
      if (props.$readinessType === 'At Station' || props.$readinessType === 'In Workshop') return '#c82333';
      if (props.$readinessType === 'Operational') return '#218838';
      return '#e0a800'; // On Standby
    }};
  }
  
  option {
    background: white;
    color: #333;
  }
`;

const StationSelect = styled.select`
  padding: 6px 10px;
  border: 2px solid #1177BB;
  border-radius: 4px;
  font-size: 0.9rem;
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
  
  option {
    background: white;
    color: #333;
  }
`;

const AuditInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #17a2b8;
  font-size: 0.85rem;
  color: #666;
`;

const Alert = styled.div<{ $type?: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  margin: 10px 0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: ${props => {
    switch (props.$type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      default: return '#d1ecf1'; // info
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      default: return '#0c5460'; // info
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      default: return '#bee5eb'; // info
    }
  }};
`;

export const VehicleStationAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('vehicle-station-assignment', '/images/ControlRoom.png');
  const { user, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editableStatus, setEditableStatus] = useState<{[key: string]: string}>({});
  const [editableReadiness, setEditableReadiness] = useState<{[key: string]: string}>({});
  const [editableStationAssignment, setEditableStationAssignment] = useState<{[key: string]: string}>({});
  const [fireStations, setFireStations] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: 'All',
    readiness: 'All',
    stationAssignment: 'All'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showHistoricalModal, setShowHistoricalModal] = useState(false);

  useEffect(() => {
    // Check for new day and copy assignments if needed, then load latest data
    const initializeWithNewDayCheck = async () => {
      await checkAndHandleNewDay(); // Check if it's a new day and copy if needed
      await loadLatestAssignments(); // Load the latest data (including any copied assignments)
      await loadFireStations();
      setHasUnsavedChanges(false);
    };
    
    initializeWithNewDayCheck();
  }, []); // Load on initial mount only
  
  useEffect(() => {
    // Reload when user manually changes date
    loadAssignments();
  }, [selectedDate]);

  const checkAndHandleNewDay = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we have data for today
        const { data: todayData, error: todayError } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select('*')
        .eq('assignment_date', today)
        .limit(1);
      
      if (todayError) {
        console.error('Error checking today\'s data:', todayError);
        return false;
      }
      
      // If no data for today, check for the most recent previous day
      if (!todayData || todayData.length === 0) {
        console.log(`No data found for today (${today}). Checking for most recent previous day...`);
        
        // Get the most recent assignment from previous days
        const { data: recentData, error: recentError } = await supabase
          .from('03_ecc_02_duty_roster_01_station_assignments')
          .select('*')
          .lt('assignment_date', today) // Less than today (previous days)
          .order('assignment_date', { ascending: false })
          .limit(100); // Get up to 100 recent assignments
        
        if (recentError) {
          console.error('Error checking recent data:', recentError);
          return false;
        }
        
        if (recentData && recentData.length > 0) {
          // Group by vehicle_id to get the latest assignment for each vehicle
          const latestByVehicle = {};
          recentData.forEach(assignment => {
            const vehicleId = assignment.vehicle_id;
            if (!latestByVehicle[vehicleId] || assignment.updated_at > latestByVehicle[vehicleId].updated_at) {
              latestByVehicle[vehicleId] = assignment;
            }
          });
          
          const assignmentsToCopy = Object.values(latestByVehicle);
          console.log(`Found ${assignmentsToCopy.length} unique vehicle assignments from previous days to copy.`);
          
          // Copy assignments to today
          const copiedData = await copyAssignmentsToNewDay(assignmentsToCopy, today);
          return !!copiedData;
        } else {
          console.log('No previous day data found to copy.');
          return false;
        }
      } else {
        console.log(`Data already exists for today (${today}). No copying needed.`);
        return false;
      }
    } catch (error) {
      console.error('Exception during new day check:', error);
      return false;
    }
  };

  const copyAssignmentsToNewDay = async (sourceAssignments: any[], targetDate: string) => {
    try {
      console.log(`Copying ${sourceAssignments.length} assignments to new day: ${targetDate}`);
      
      // Create copies of the source assignments for the target date
      const assignmentsToCopy = sourceAssignments.map((assignment: any) => ({
        assignment_date: targetDate,
        vehicle_id: assignment.vehicle_id,
        call_sign: assignment.call_sign,
        vehicle_type: assignment.vehicle_type,
        vehicle_make: assignment.vehicle_make,
        vehicle_model: assignment.vehicle_model,
        status: assignment.status,
        readiness: assignment.readiness,
        station_assignment: assignment.station_assignment,
        crew_members: assignment.crew_members,
        last_check_time: assignment.last_check_time,
        is_workshop: assignment.is_workshop,
        created_by: user?.id,
        updated_by: user?.id
      }));
      
      // Save the copied assignments to database
      const { data: copyData, error: copyError } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .upsert(assignmentsToCopy, { onConflict: 'assignment_date,vehicle_id' })
        .select();
      
      if (copyError) {
        console.error('Error copying assignments to new day:', copyError);
        showMessage('error', `Failed to copy assignments to new day: ${copyError.message}`);
        return null;
      } else {
        console.log(`Successfully copied ${assignmentsToCopy.length} assignments to new day: ${targetDate}`);
        showMessage('success', `Automatically copied ${assignmentsToCopy.length} assignments to new day`);
        return copyData;
      }
    } catch (error) {
      console.error('Exception during assignment copying:', error);
      showMessage('error', `Exception copying assignments: ${error.message}`);
      return null;
    }
  };

  const loadLatestAssignments = async () => {
    try {
      setLoading(true);
      
      // First, get all vehicles directly from vehicles table
      const { data: vehiclesRows, error: vehiclesError } = await supabase
        .from('02_admin_register_fd4_vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;
      const vehiclesList = Array.isArray(vehiclesRows) ? vehiclesRows : [];
      if (vehiclesList.length === 0) { setAssignments([]); return; }

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      // Try to find the most recent assignments by checking recent dates
      let targetDate = selectedDate || new Date().toISOString().split('T')[0];
      let latestAssignments: any[] = [];
      let foundLatestData = false;
      
      // Check the last 30 days for the most recent assignments (most recent first)
      const today = new Date();
      const datesToCheck = [];
      
      // Always check the selected date first (highest priority)
      datesToCheck.push(targetDate);
      
      // Then check today and previous 30 days (most recent first)
      for (let i = 0; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr !== targetDate) { // Avoid duplicate
          datesToCheck.push(dateStr);
        }
      }
      
      let allFoundAssignments: any[] = [];
      
      // Check each date and collect all assignments
      for (const checkDate of datesToCheck) {
        try {
          const { data: assignmentsData, error: fetchError } = await supabase
            .from('03_ecc_02_duty_roster_01_station_assignments')
            .select('*')
            .eq('assignment_date', checkDate)
            .order('call_sign', { ascending: true });

          if (fetchError) {
            console.log(`Error fetching data for date ${checkDate}:`, fetchError.message);
          } else if (assignmentsData && assignmentsData.length > 0) {
            // Add date information to each assignment for tracking
            const assignmentsWithDate = assignmentsData.map((assignment: any) => ({
              ...assignment,
              assignment_date: checkDate
            }));
            allFoundAssignments = allFoundAssignments.concat(assignmentsWithDate);
            console.log(`Found ${assignmentsData.length} assignments for date ${checkDate}`);
          }
        } catch (error) {
          console.log(`No data for date ${checkDate}, continuing...`);
        }
      }
      
      // If we found assignments, find the most recently updated ones
      if (allFoundAssignments.length > 0) {
        // Group by vehicle_id and keep only the most recent update for each vehicle
        const latestByVehicle: {[key: string]: any} = {};
        
        allFoundAssignments.forEach((assignment: any) => {
          const vehicleId = assignment.vehicle_id;
          const currentUpdateTime = assignment.updated_at || assignment.created_at;
          const existingUpdateTime = latestByVehicle[vehicleId]?.updated_at || latestByVehicle[vehicleId]?.created_at;
          
          // Keep the most recent update for each vehicle
          if (!latestByVehicle[vehicleId] || currentUpdateTime > existingUpdateTime) {
            latestByVehicle[vehicleId] = assignment;
          }
        });
        
        // Convert back to array
        latestAssignments = Object.values(latestByVehicle);
        
        // Find the most recent update date among all assignments
        const mostRecentDate = allFoundAssignments.reduce((latest: string, assignment: any) => {
          const assignmentDate = assignment.updated_at || assignment.created_at || assignment.assignment_date;
          return assignmentDate > latest ? assignmentDate : latest;
        }, '');
        
        if (mostRecentDate) {
          targetDate = mostRecentDate.split('T')[0]; // Extract date part
          foundLatestData = true;
          console.log(`Found ${latestAssignments.length} most recent assignments, latest update: ${mostRecentDate}`);
        }
      }

      // Map vehicles to assignments using the latest available data
      const vehicleAssignments = vehiclesList.map((vehicle: any) => {
        // Convert vehicle.id to number for proper comparison with assignment.vehicle_id
        const vehicleId = parseInt(vehicle.id, 10);
        const existingAssignment = latestAssignments.find((assignment: any) => assignment.vehicle_id === vehicleId);
        
        return {
          id: vehicleId,
          call_sign: vehicle.vehicle_callsign || vehicle.veh_call_sign || vehicle.call_sign || vehicle.callsign || vehicle.call_sign_name || 'N/A',
          vehicle_type: vehicle.vehicle_type_name || vehicle.vehicle_type || vehicle.veh_type || 'N/A',
          vehicle_make: vehicle.vehicle_make_name || vehicle.vehicle_make || vehicle.veh_make || 'N/A',
          vehicle_model: vehicle.vehicle_model || vehicle.model || 'N/A',
          vehicle_id: vehicleId,
          status: existingAssignment?.status || 'In Service',
          readiness: existingAssignment?.readiness || 'Operational',
          station_assignment: existingAssignment?.station_assignment || 'Main Fire Station',
          crew_members: existingAssignment?.crew_members || '',
          last_check: existingAssignment?.last_check_time || '08:00:00',
          created_at: existingAssignment?.created_at,
          updated_at: existingAssignment?.updated_at,
          is_database_record: !!existingAssignment,
          assignment_date: targetDate
        };
      });

      // Initialize editable values
      const initialStatus: {[key: string]: string} = {};
      const initialReadiness: {[key: string]: string} = {};
      const initialStationAssignment: {[key: string]: string} = {};

      vehicleAssignments.forEach(assignment => {
        initialStatus[assignment.id] = assignment.status;
        initialReadiness[assignment.id] = assignment.readiness;
        initialStationAssignment[assignment.id] = assignment.station_assignment;
      });

      setEditableStatus(initialStatus);
      setEditableReadiness(initialReadiness);
      setEditableStationAssignment(initialStationAssignment);
      setAssignments(vehicleAssignments);
      
      // Update the selected date to show the actual date being displayed
      if (foundLatestData && targetDate !== selectedDate) {
        setSelectedDate(targetDate);
        showMessage('info', `Showing latest assignment data from ${targetDate}`);
      }
      
    } catch (error) {
      console.error('Error loading latest assignments:', error);
      setAssignments([]);
      showMessage('error', `Failed to load latest assignments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      
      // First, get all vehicles directly from vehicles table
      const { data: vehiclesRows, error: vehiclesError } = await supabase
        .from('02_admin_register_fd4_vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;
      const vehiclesList = Array.isArray(vehiclesRows) ? vehiclesRows : [];
      if (vehiclesList.length === 0) { setAssignments([]); return; }

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      // Try to find the most recent assignments by checking recent dates
      let targetDate = selectedDate;
      let latestAssignments: any[] = [];
      let foundLatestData = false;
      let mostRecentUpdate: string = '';
      let foundSelectedDateData = false;
      let allFoundAssignments: any[] = [];
      
      // Check the last 30 days for the most recent assignments
      const checkRecentDates = async () => {
        const today = new Date();
        const datesToCheck = [];
        
        // Always check the selected date first (highest priority)
        datesToCheck.push(selectedDate);
        
        // Then check today and previous 30 days (most recent first)
        for (let i = 0; i <= 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          if (dateStr !== selectedDate) { // Avoid duplicate
            datesToCheck.push(dateStr);
          }
        }
        
        // Use the outer scope variables
        
        // Check each date and collect all assignments
        for (const checkDate of datesToCheck) {
          try {
            const { data: assignmentsData, error: fetchError } = await supabase
              .from('03_ecc_02_duty_roster_01_station_assignments')
              .select('*')
              .eq('assignment_date', checkDate)
              .order('call_sign', { ascending: true });

            if (fetchError) {
              console.log(`Error fetching data for date ${checkDate}:`, fetchError.message);
            } else if (assignmentsData && assignmentsData.length > 0) {
              // Add date information to each assignment for tracking
              const assignmentsWithDate = assignmentsData.map((assignment: any) => ({
                ...assignment,
                assignment_date: checkDate
              }));
              allFoundAssignments = allFoundAssignments.concat(assignmentsWithDate);
              
              // If we found data for the selected date, prioritize it
              if (checkDate === selectedDate) {
                console.log(`Found assignment data for selected date: ${checkDate} (${assignmentsData.length} records)`);
                // Continue checking other dates but mark that we found selected date data
                foundSelectedDateData = true;
              }
            }
          } catch (error) {
            console.log(`Error loading data for date ${checkDate}:`, error);
          }
        }
        
        // If we found assignments, prioritize selected date data, then find most recent updates
        if (allFoundAssignments.length > 0) {
          // Group by vehicle_id and prioritize selected date, then most recent update
          const latestByVehicle: {[key: string]: any} = {};
          
          allFoundAssignments.forEach((assignment: any) => {
            const vehicleId = assignment.vehicle_id;
            const currentUpdateTime = assignment.updated_at || assignment.created_at;
            const isFromSelectedDate = assignment.assignment_date === selectedDate;
            const existingAssignment = latestByVehicle[vehicleId];
            const existingIsFromSelectedDate = existingAssignment?.assignment_date === selectedDate;
            const existingUpdateTime = existingAssignment?.updated_at || existingAssignment?.created_at;
            
            // Priority logic:
            // 1. If current assignment is from selected date, use it
            // 2. If existing is from selected date, keep it
            // 3. Otherwise, use the most recent update
            if (!existingAssignment) {
              latestByVehicle[vehicleId] = assignment;
            } else if (isFromSelectedDate && !existingIsFromSelectedDate) {
              // Current is from selected date, existing is not - use current
              latestByVehicle[vehicleId] = assignment;
            } else if (!isFromSelectedDate && existingIsFromSelectedDate) {
              // Existing is from selected date, current is not - keep existing
              // Do nothing
            } else if (currentUpdateTime > existingUpdateTime) {
              // Both are from same date category, use most recent
              latestByVehicle[vehicleId] = assignment;
            }
          });
          
          // Convert back to array
          latestAssignments = Object.values(latestByVehicle);
          
          // Check if we have data for the selected date
          const hasSelectedDateData = latestAssignments.some(assignment => assignment.assignment_date === selectedDate);
          
          if (hasSelectedDateData || foundSelectedDateData) {
            foundLatestData = true;
            console.log(`Found ${latestAssignments.length} assignments for selected date: ${selectedDate}`);
          } else {
            // No data for selected date, check if we should copy from most recent
            const mostRecentDate = allFoundAssignments.reduce((latest: string, assignment: any) => {
              const assignmentDate = assignment.updated_at || assignment.created_at || assignment.assignment_date;
              return assignmentDate > latest ? assignmentDate : latest;
            }, '');
            
            if (mostRecentDate) {
              const mostRecentDateStr = mostRecentDate.split('T')[0]; // Extract date part
              
              // Check if we're trying to load today's date and there's no data
              const today = new Date().toISOString().split('T')[0];
              const isLoadingToday = selectedDate === today;
              
              if (isLoadingToday && mostRecentDateStr !== today) {
                // It's a new day and we have data from previous days - copy it over
                console.log(`New day detected (${today}). Copying assignments from ${mostRecentDateStr} to today.`);
                
                // Copy assignments to new day
                const copiedData = await copyAssignmentsToNewDay(latestAssignments, today);
                
                if (copiedData) {
                  // Use the copied data
                  latestAssignments = copiedData;
                  targetDate = today;
                  foundLatestData = true;
                } else {
                  // If copying failed, just use the most recent data without saving
                  targetDate = mostRecentDateStr;
                  foundLatestData = true;
                  mostRecentUpdate = mostRecentDate;
                  console.log(`Copying failed, using most recent from: ${targetDate}`);
                }
              } else {
                // Not today or no data to copy, just use the most recent
                targetDate = mostRecentDateStr;
                foundLatestData = true;
                mostRecentUpdate = mostRecentDate;
                console.log(`No data for selected date, using most recent from: ${targetDate}`);
              }
            }
          }
        }
      };
      
      await checkRecentDates();

      // If no data found in recent dates, use default values
      if (!foundLatestData) {
        console.log('No recent assignment data found, using default values');
        console.log(`Selected date: ${selectedDate}, Found selected date data: ${foundSelectedDateData}`);
        console.log(`Total assignments found: ${allFoundAssignments.length}`);
      } else {
        console.log(`Successfully loaded data. Selected date: ${selectedDate}, Target date: ${targetDate}`);
        console.log(`Assignments loaded: ${latestAssignments.length}`);
      }

      // Map vehicles to assignments using the latest available data
      const vehicleAssignments = vehiclesList.map((vehicle: any) => {
        // Convert vehicle.id to number for proper comparison with assignment.vehicle_id
        const vehicleId = parseInt(vehicle.id, 10);
        const existingAssignment = latestAssignments.find((assignment: any) => assignment.vehicle_id === vehicleId);
        
        return {
          id: vehicleId,
          call_sign: vehicle.vehicle_callsign || vehicle.veh_call_sign || vehicle.call_sign || vehicle.callsign || vehicle.call_sign_name || 'N/A',
          vehicle_type: vehicle.vehicle_type_name || vehicle.vehicle_type || vehicle.veh_type || 'N/A',
          vehicle_make: vehicle.vehicle_make_name || vehicle.vehicle_make || vehicle.veh_make || 'N/A',
          vehicle_model: vehicle.vehicle_model || vehicle.model || 'N/A',
          vehicle_id: vehicleId,
          status: existingAssignment?.status || 'In Service',
          readiness: existingAssignment?.readiness || 'Operational',
          station_assignment: existingAssignment?.station_assignment || 'Main Fire Station',
          crew_members: existingAssignment?.crew_members || '',
          last_check: existingAssignment?.last_check_time || '08:00:00',
          created_at: existingAssignment?.created_at,
          updated_at: existingAssignment?.updated_at,
          is_database_record: !!existingAssignment,
          assignment_date: targetDate
        };
      });

      // Initialize editable values
      const initialStatus: {[key: string]: string} = {};
      const initialReadiness: {[key: string]: string} = {};
      const initialStationAssignment: {[key: string]: string} = {};

      vehicleAssignments.forEach(assignment => {
        initialStatus[assignment.id] = assignment.status;
        initialReadiness[assignment.id] = assignment.readiness;
        initialStationAssignment[assignment.id] = assignment.station_assignment;
      });

      setEditableStatus(initialStatus);
      setEditableReadiness(initialReadiness);
      setEditableStationAssignment(initialStationAssignment);
      setAssignments(vehicleAssignments);
      
      // Update the selected date to show the actual date being displayed
      if (targetDate !== selectedDate && foundLatestData) {
        setSelectedDate(targetDate);
        showMessage('info', `Showing latest assignment data from ${targetDate}`);
      }
      
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
      showMessage('error', `Failed to load assignments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFireStations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fire-stations-crud', {
        method: 'GET'
      });

      if (error) {
        throw error;
      }

      if (data?.data?.stations) {
        setFireStations(data.data.stations);
      } else {
        setFireStations([]);
      }
    } catch (error) {
      console.error('Error loading fire stations:', error);
      setFireStations([]);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDateChange = (newDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (newDate < today) {
      // Show modal for historical dates
      setShowHistoricalModal(true);
    } else {
      // Allow date change for today or future dates
      setSelectedDate(newDate);
    }
  };

  const handleStatusChange = (assignmentId: string, newStatus: string) => {
    setEditableStatus(prev => ({
      ...prev,
      [assignmentId]: newStatus
    }));

    // Automatically synchronize readiness based on status change
    let defaultReadiness = 'Operational';
    if (newStatus === 'Out of Service') {
      defaultReadiness = 'At Station';
    }
    setEditableReadiness(prev => ({
      ...prev,
      [assignmentId]: defaultReadiness
    }));

    // Handle station assignment based on status and readiness
    const currentReadiness = editableReadiness[assignmentId] || defaultReadiness;
    if (newStatus === 'Out of Service' && currentReadiness === 'In Workshop') {
      setEditableStationAssignment(prev => ({
        ...prev,
        [assignmentId]: 'In Workshop'
      }));
    } else if (newStatus === 'In Service') {
      setEditableStationAssignment(prev => ({
        ...prev,
        [assignmentId]: 'Main Fire Station'
      }));
    }

    setHasUnsavedChanges(true);
  };

  const handleReadinessChange = (assignmentId: string, newReadiness: string) => {
    setEditableReadiness(prev => ({
      ...prev,
      [assignmentId]: newReadiness
    }));

    // Automatically synchronize status based on readiness change
    let defaultStatus = 'In Service';
    if (newReadiness === 'At Station' || newReadiness === 'In Workshop') {
      defaultStatus = 'Out of Service';
    }
    setEditableStatus(prev => ({
      ...prev,
      [assignmentId]: defaultStatus
    }));

    // Handle station assignment based on status and readiness
    if (defaultStatus === 'Out of Service' && newReadiness === 'In Workshop') {
      setEditableStationAssignment(prev => ({
        ...prev,
        [assignmentId]: 'In Workshop'
      }));
    } else if (defaultStatus === 'In Service' || newReadiness === 'Operational' || newReadiness === 'On Standby') {
      setEditableStationAssignment(prev => ({
        ...prev,
        [assignmentId]: 'Main Fire Station'
      }));
    }

    setHasUnsavedChanges(true);
  };

  const handleStationAssignmentChange = (assignmentId: string, newStation: string) => {
    setEditableStationAssignment(prev => ({
      ...prev,
      [assignmentId]: newStation
    }));

    setHasUnsavedChanges(true);
  };

  const handleFilterChange = (filterType: 'status' | 'readiness' | 'stationAssignment', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const saveAssignments = async () => {
    try {
      setSaving(true);

      // Helper function to ensure proper time format (HH:MM:SS)
      const formatTime = (timeValue: string | null): string | null => {
        if (!timeValue) return null;
        
        // If it's already in HH:MM:SS format, return as is
        if (timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return timeValue;
        }
        
        // If it's in HH:MM format, add seconds
        if (timeValue.match(/^\d{2}:\d{2}$/)) {
          return `${timeValue}:00`;
        }
        
        // If it's in any other format, try to parse and convert
        try {
          const date = new Date(`2000-01-01T${timeValue}`);
          return date.toTimeString().slice(0, 8); // HH:MM:SS format
        } catch {
          return null; // Return null if we can't parse it
        }
      };

      const assignmentsToSave = assignments.map(assignment => ({
        vehicle_id: assignment.vehicle_id,
        call_sign: assignment.call_sign,
        vehicle_type: assignment.vehicle_type,
        vehicle_make: assignment.vehicle_make,
        vehicle_model: assignment.vehicle_model,
        status: editableStatus[assignment.id] || assignment.status,
        readiness: editableReadiness[assignment.id] || assignment.readiness,
        station_assignment: editableStationAssignment[assignment.id] || assignment.station_assignment,
        crew_members: assignment.crew_members || '',
        last_check_time: formatTime(assignment.last_check), // Ensure proper time format
        is_workshop: (editableStationAssignment[assignment.id] || assignment.station_assignment) === 'In Workshop',
        created_by: user?.id,
        updated_by: user?.id
        // Note: assignment_date is handled by the API function from the date parameter
      }));

      console.log('Saving assignments:', {
        action: 'save',
        date: selectedDate,
        assignmentsCount: assignmentsToSave.length,
        firstAssignment: assignmentsToSave[0]
      });

      // Debug time formatting for first few assignments
      console.log('Time formatting debug:', assignments.slice(0, 3).map(assignment => ({
        vehicle_id: assignment.vehicle_id,
        original_last_check: assignment.last_check,
        formatted_last_check: formatTime(assignment.last_check)
      })));

      // Use direct Supabase client instead of edge function
      const { data, error } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .upsert(
          assignmentsToSave.map(assignment => ({
            assignment_date: selectedDate,
            vehicle_id: assignment.vehicle_id,
            call_sign: assignment.call_sign,
            vehicle_type: assignment.vehicle_type,
            vehicle_make: assignment.vehicle_make,
            vehicle_model: assignment.vehicle_model,
            status: assignment.status,
            readiness: assignment.readiness,
            station_assignment: assignment.station_assignment,
            crew_members: assignment.crew_members,
            last_check_time: assignment.last_check_time,
            is_workshop: assignment.is_workshop,
            created_by: assignment.created_by,
            updated_by: assignment.updated_by
          })),
          { onConflict: 'assignment_date,vehicle_id' }
        )
        .select();

      console.log('Save response:', { data, error });
      console.log('Save response data details:', JSON.stringify(data, null, 2));

      if (error) {
        console.error('Save function error:', error);
        throw new Error(`Save failed: ${error.message || 'Unknown error'}`);
      }

      if (!data || data.length === 0) {
        console.warn('Save operation returned empty results');
        showMessage('info', 'Save completed but no data was returned');
        return;
      }

      console.log('Processing save response, data:', data);
      console.log('First result:', data?.[0]);
      
      // Direct Supabase response contains the saved assignments directly
      const savedAssignments = data;
      
      console.log('Saved assignments:', savedAssignments);
      console.log('Number of successfully saved assignments:', savedAssignments.length);
      
      showMessage('success', `Successfully saved ${savedAssignments.length} assignments for ${selectedDate}`);
      setHasUnsavedChanges(false);
      
      // Update assignments to reflect saved status and update with saved values
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => {
          const savedAssignment = savedAssignments.find((saved: any) => saved.vehicle_id === assignment.vehicle_id);
          if (savedAssignment) {
            console.log('Updating assignment with saved data:', savedAssignment);
            // Update with saved data and mark as database record
            return {
              ...assignment,
              status: savedAssignment.status,
              readiness: savedAssignment.readiness,
              station_assignment: savedAssignment.station_assignment,
              crew_members: savedAssignment.crew_members || assignment.crew_members,
              last_check: savedAssignment.last_check_time || assignment.last_check_time,
              is_database_record: true,
              created_at: savedAssignment.created_at || assignment.created_at,
              updated_at: savedAssignment.updated_at || assignment.updated_at,
              assignment_date: selectedDate,
              id: savedAssignment.id // Add the database ID
            };
          }
          return {
            ...assignment,
            is_database_record: true
          };
        })
      );
      
      // Refresh the data to ensure we have the latest information
      setTimeout(() => {
        // Force reload data for the current selected date
        console.log(`Reloading assignments for date: ${selectedDate} after save operation`);
        loadAssignments();
      }, 1500); // Increased delay to ensure database transaction completes
      
    } catch (error) {
      console.error('Error saving assignments:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showMessage('error', `Failed to save assignments: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredAssignments = assignments
    .filter(assignment => {
      const currentStatus = editableStatus[assignment.id] || assignment.status;
      const currentReadiness = editableReadiness[assignment.id] || assignment.readiness;
      const currentStation = editableStationAssignment[assignment.id] || assignment.station_assignment;

      const statusMatch = filters.status === 'All' || currentStatus === filters.status;
      const readinessMatch = filters.readiness === 'All' || currentReadiness === filters.readiness;
      const stationMatch = filters.stationAssignment === 'All' || currentStation === filters.stationAssignment;

      return statusMatch && readinessMatch && stationMatch;
    })
    .sort((a, b) => {
      // Sort by call sign alphabetically
      const callSignA = a.call_sign || '';
      const callSignB = b.call_sign || '';
      return callSignA.localeCompare(callSignB);
    });

  const getReadinessOptions = (status: string): string[] => {
    switch (status) {
      case 'In Service':
        return ['Operational', 'On Standby'];
      case 'Out of Service':
        return ['At Station', 'In Workshop'];
      default:
        return ['Operational', 'On Standby'];
    }
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
      const logoBase64 = await getCompanyLogo();
      
      // Setup VFH A4 standard PDF
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Vehicles: Station Assignment",
          summaryText: `Total Assignments: ${filteredAssignments.length} - Daily Vehicle Assignments for ${selectedDate}`,
          currentUser
        }
      });

      // Add table headers
      const tableHeaders = [
        'Call Sign',
        'Vehicle Type',
        'Make',
        'Model',
        'Status',
        'Readiness',
        'Station Assignment'
      ];

      const tableData = filteredAssignments.map(assignment => [
        assignment.call_sign || '',
        assignment.vehicle_type || '',
        assignment.vehicle_make || '',
        assignment.vehicle_model || '',
        editableStatus[assignment.id] || assignment.status || '',
        editableReadiness[assignment.id] || assignment.readiness || '',
        editableStationAssignment[assignment.id] || 'Main Fire Station'
      ]);

      // Use the table configuration from VFH setup which includes proper footer
      const tableConfig = {
        ...vfhSetup.tableConfig,
        startY: 50,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak' as const,
          ...vfhSetup.tableConfig.styles
        },
        headStyles: {
          fillColor: [17, 119, 187] as [number, number, number],
          textColor: 255,
          fontStyle: 'bold' as const,
          fontSize: 10,
          ...vfhSetup.tableConfig.headStyles
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250] as [number, number, number],
          ...vfhSetup.tableConfig.alternateRowStyles
        },
        margin: { top: 50, right: 5, bottom: 30, left: 5 },
        tableWidth: 'auto' as const,
        columnStyles: {
          0: { cellWidth: 'auto' as const }, // Call Sign
          1: { cellWidth: 'auto' as const }, // Vehicle Type
          2: { cellWidth: 'auto' as const }, // Make
          3: { cellWidth: 'auto' as const }, // Model
          4: { cellWidth: 'auto' as const }, // Status
          5: { cellWidth: 'auto' as const }, // Readiness
          6: { cellWidth: 'auto' as const }  // Station Assignment
        }
      };

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        ...tableConfig
      });

      // Generate PDF as data URI
      const dataUri = doc.output('datauristring');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `pdf_Vehicle_Station_Assignment_${selectedDate}_${timestamp}`;
      
      // Store in sessionStorage for PDF viewer
      sessionStorage.setItem(fileName, dataUri);
      
      // Store navigation context for PDF viewer menu highlighting
      sessionStorage.setItem('pdf_source_section', '/control/daily-duty-rostering');
      sessionStorage.setItem('pdf_source_path', '/control/daily-duty-rostering/vehicle-station-assignment');
      
      // Navigate to PDF viewer with proper URL encoding
      const encodedFileName = encodeURIComponent(fileName);
      const pdfViewerUrl = `/pdf-viewer/${encodedFileName}`;
      navigate(pdfViewerUrl);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showMessage('error', `Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="assignment-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="assignment-title">
                Vehicles: Station Assignment
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Vehicle Station Assignment system manages the deployment of Emergency Response Vehicles across fire stations and operational areas. The system captures all data to the database with change tracking and ensures only one record per day per vehicle.
              </Paragraph>
              
              {message && (
                <Alert $type={message.type}>
                  {message.text}
                </Alert>
              )}
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="Vehicles: Station Assignment" 
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

      {/* Assignment Report Section */}
      <Section aria-labelledby="assignment-report" style={{ marginTop: '0px' }}>
        <AssignmentSection>
          <SectionHeader>
            <SectionTitle id="assignment-report">
              Daily Vehicles: Station Assignment
            </SectionTitle>
            <div>
              <DatePickerContainer>
                <DatePickerLabel htmlFor="assignment-date">Date</DatePickerLabel>
                <DatePicker
                  id="assignment-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </DatePickerContainer>
            </div>
          </SectionHeader>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading registered vehicles and assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No vehicles found.</p>
              <p>Please register some vehicles in the Admin section first.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <ButtonContainer>
                  <ActionButton 
                    $variant="success" 
                    onClick={saveAssignments}
                    disabled={saving || !hasUnsavedChanges}
                  >
                    {saving ? 'Saving...' : (hasUnsavedChanges ? 'Save All Changes' : 'All Changes Saved')}
                  </ActionButton>
                  
                  <ActionButton $variant="primary" onClick={generatePDF}>
                    Print to PDF
                  </ActionButton>
                  
                  {hasUnsavedChanges && (
                    <ActionButton 
                      $variant="warning" 
                      onClick={() => {
                        // Revert to original database values without full reload
                        const revertedStatus: {[key: string]: string} = {};
                        const revertedReadiness: {[key: string]: string} = {};
                        const revertedStationAssignment: {[key: string]: string} = {};

                        assignments.forEach(assignment => {
                          revertedStatus[assignment.id] = assignment.status;
                          revertedReadiness[assignment.id] = assignment.readiness;
                          revertedStationAssignment[assignment.id] = assignment.station_assignment;
                        });

                        setEditableStatus(revertedStatus);
                        setEditableReadiness(revertedReadiness);
                        setEditableStationAssignment(revertedStationAssignment);
                        setHasUnsavedChanges(false);
                      }}
                    >
                      Discard Changes
                    </ActionButton>
                  )}
                </ButtonContainer>
              </div>

              <TableContainer>
                <DataTable>
                  <thead>
                    <TableRow>
                      <TableHeader>Call Sign</TableHeader>
                      <TableHeader>Vehicle Type</TableHeader>
                      <TableHeader>Make</TableHeader>
                      <TableHeader>Model</TableHeader>
                      <TableHeader>
                        <FilterHeader>
                          <FilterLabel>Status</FilterLabel>
                          <FilterSelect 
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                          >
                            <option value="All">All Status</option>
                            <option value="In Service">In Service</option>
                            <option value="Out of Service">Out of Service</option>
                          </FilterSelect>
                        </FilterHeader>
                      </TableHeader>
                      <TableHeader>
                        <FilterHeader>
                          <FilterLabel>Readiness</FilterLabel>
                          <FilterSelect 
                            value={filters.readiness}
                            onChange={(e) => handleFilterChange('readiness', e.target.value)}
                          >
                            <option value="All">All Readiness</option>
                            <option value="Operational">Operational</option>
                            <option value="On Standby">On Standby</option>
                            <option value="At Station">At Station</option>
                            <option value="In Workshop">In Workshop</option>
                          </FilterSelect>
                        </FilterHeader>
                      </TableHeader>
                      <TableHeader>
                        <FilterHeader>
                          <FilterLabel>Station Assignment</FilterLabel>
                          <FilterSelect 
                            value={filters.stationAssignment}
                            onChange={(e) => handleFilterChange('stationAssignment', e.target.value)}
                          >
                            <option value="All">All Stations</option>
                            <option value="Main Fire Station">Main Fire Station</option>
                            <option value="Sub Fire Station 1">Sub Fire Station 1</option>
                            <option value="Sub Fire Station 2">Sub Fire Station 2</option>
                            <option value="Sub Fire Station 3">Sub Fire Station 3</option>
                            <option value="Medic Tango">Medic Tango</option>
                            <option value="In Workshop">In Workshop</option>
                          </FilterSelect>
                        </FilterHeader>
                      </TableHeader>
                    </TableRow>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <strong>{assignment.call_sign}</strong>
                          {assignment.is_database_record && (
                            <div style={{ fontSize: '0.75rem', color: '#28a745' }}>
                              ✓ Saved
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{assignment.vehicle_type}</TableCell>
                        <TableCell>{assignment.vehicle_make}</TableCell>
                        <TableCell>{assignment.vehicle_model}</TableCell>
                        <TableCell>
                          <StatusSelect 
                            value={editableStatus[assignment.id] || 'In Service'}
                            onChange={(e) => handleStatusChange(assignment.id, e.target.value)}
                            $isOutOfService={(editableStatus[assignment.id] || 'In Service') === 'Out of Service'}
                          >
                            <option value="In Service">In Service</option>
                            <option value="Out of Service">Out of Service</option>
                          </StatusSelect>
                        </TableCell>
                        <TableCell>
                          <ReadinessSelect 
                            value={editableReadiness[assignment.id] || assignment.readiness}
                            onChange={(e) => handleReadinessChange(assignment.id, e.target.value)}
                            $readinessType={editableReadiness[assignment.id] || assignment.readiness}
                          >
                            {getReadinessOptions(editableStatus[assignment.id] || assignment.status).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </ReadinessSelect>
                        </TableCell>
                        <TableCell>
                          <StationSelect
                            value={editableStationAssignment[assignment.id] || 'Main Fire Station'}
                            onChange={(e) => handleStationAssignmentChange(assignment.id, e.target.value)}
                          >
                            <option value="Main Fire Station">Main Fire Station</option>
                            <option value="Sub Fire Station 1">Sub Fire Station 1</option>
                            <option value="Sub Fire Station 2">Sub Fire Station 2</option>
                            <option value="Sub Fire Station 3">Sub Fire Station 3</option>
                            <option value="Medic Tango">Medic Tango</option>
                            <option value="In Workshop">In Workshop</option>
                          </StationSelect>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </DataTable>
              </TableContainer>

              {/* Show audit information for saved assignments */}
              {assignments.some(a => a.is_database_record) && (
                <AuditInfo>
                  <strong>Database Information:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Data is saved to database with change tracking</li>
                    <li>Only one record per vehicle per day (enforced by database)</li>
                    <li>All changes are logged with date/time and user information</li>
                    <li>Green checkmarks indicate assignments saved to database</li>
                  </ul>
                </AuditInfo>
              )}

              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#666', 
                  marginBottom: '10px',
                  fontStyle: 'italic' 
                }}>
                  Showing {filteredAssignments.length} of {assignments.length} vehicles
                  {filters.status !== 'All' && ` (Status: ${filters.status})`}
                  {filters.readiness !== 'All' && ` (Readiness: ${filters.readiness})`}
                  {filters.stationAssignment !== 'All' && ` (Station: ${filters.stationAssignment})`}
                  {hasUnsavedChanges && ' - You have unsaved changes!'}
                </p>
              </div>
            </>
          )}
        </AssignmentSection>
      </Section>
      
      {/* Historical Data Modal */}
      <Modal
        isOpen={showHistoricalModal}
        onClose={() => setShowHistoricalModal(false)}
        title="Historical Data Not Available"
        type="warning"
      >
        Historical vehicle assignment data before today is not available. 
        You can only view and edit assignments for today and future dates.
      </Modal>
    </MainContent>
  );
};