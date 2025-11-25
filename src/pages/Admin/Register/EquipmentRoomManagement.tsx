import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import { usePageImage } from '../../../hooks/usePageImage';
import { supabase } from '../../../lib/supabase';
import { DevExpressButton, DevExpressTheme, ContentPane } from '../../../components/DevExpressStyles';
import { DevExpressTable } from '../../../components/UI/DevExpressTable';
import { DevExpressForm } from '../../../components/UI/DevExpressForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';
import { formatDateTime, formatDateOnly, formatDateTimeReadable } from '../../../lib/utils';

// Styled Components
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
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const EquipmentListSection = styled.div`
  margin-top: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#1177BB' : '#f8f9fa'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.$active ? '#FF9900' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#1177BB' : '#e9ecef'};
  }
`;

const TabContent = styled.div<{ $hidden?: boolean }>`
  display: ${props => props.$hidden ? 'none' : 'block'};
`;

const TabActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
`;

const InfoCard = styled.div`
  background: #e7f3ff;
  border: 1px solid #b6e3ff;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #0969da;
`;

const SummaryCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    color: #1177BB;
    display: block;
  }
  
  .label {
    font-size: 0.9rem;
    color: #666;
    margin-top: 5px;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #373;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #cfc;
`;

const RefreshButton = styled(DevExpressButton)`
  margin-left: 10px;
`;

// Interface Definitions
interface FireStation {
  id: number;
  fire_station_name: string;
  department_id: number;
  department_name?: string;
}

interface MenuItem {
  id: string;
  menu_item_name: string;
  fire_station_id: number;
  fire_station_name: string;
  department_id: number;
  is_active: boolean;
}

interface Room {
  id: string;
  menu_item_id: string;
  fire_station_id: number;
  room_name: string;
  room_description?: string;
  room_type?: string;
  floor_level?: string;
  area_sqft?: number;
  created_at: string;
  updated_at: string;
  menu_item_name?: string;
  fire_station_name?: string;
  is_active: boolean;
}

interface EquipmentType {
  id: string;
  equipment_type_name: string;
  equipment_category?: string;
  description?: string;
  is_active: boolean;
}

interface Equipment {
  id: string;
  room_id: string;
  equipment_type_id: string;
  equipment_name: string;
  equipment_model?: string;
  equipment_serial_number?: string;
  equipment_manufacturer?: string;
  purchase_date?: string;
  last_maintenance_date?: string;
  next_maintenance_due?: string;
  condition_status: string;
  quantity: number;
  value_usd?: number;
  location_within_room?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  room_name?: string;
  fire_station_name?: string;
  equipment_type_name?: string;
  equipment_category?: string;
  is_active: boolean;
}

// Form interfaces
interface RoomFormData {
  menu_item_id: string;
  room_name: string;
  room_description: string;
  room_type: string;
  floor_level: string;
  area_sqft: string;
}

interface EquipmentFormData {
  room_id: string;
  equipment_type_id: string;
  equipment_name: string;
  equipment_model: string;
  equipment_serial_number: string;
  equipment_manufacturer: string;
  purchase_date: string;
  last_maintenance_date: string;
  next_maintenance_due: string;
  condition_status: string;
  quantity: string;
  value_usd: string;
  location_within_room: string;
  notes: string;
}

const CONDITION_STATUS_OPTIONS = [
  'Excellent',
  'Good', 
  'Fair',
  'Poor'
];

const ROOM_TYPE_OPTIONS = [
  'Equipment Storage',
  'Garage',
  'Office',
  'Dormitory',
  'Training Room',
  'Kitchen',
  'Meeting Room',
  'Storage Room',
  'Equipment Bay',
  'Maintenance Shop',
  'Equipment Check Room',
  'Other'
];

export const EquipmentRoomManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('equipment-room-management', '/images/Equipment.png');

  // State Management
  const [activeTab, setActiveTab] = useState<'rooms' | 'equipment'>('rooms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data State
  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  
  // Form State
  const [roomFormData, setRoomFormData] = useState<RoomFormData>({
    menu_item_id: '',
    room_name: '',
    room_description: '',
    room_type: '',
    floor_level: '',
    area_sqft: ''
  });
  
  const [equipmentFormData, setEquipmentFormData] = useState<EquipmentFormData>({
    room_id: '',
    equipment_type_id: '',
    equipment_name: '',
    equipment_model: '',
    equipment_serial_number: '',
    equipment_manufacturer: '',
    purchase_date: '',
    last_maintenance_date: '',
    next_maintenance_due: '',
    condition_status: 'Good',
    quantity: '1',
    value_usd: '',
    location_within_room: '',
    notes: ''
  });

  // Edit State
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);

  // Access Control Check
  if (!isAdmin) {
    return (
      <MainContent>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Access Denied</h2>
          <p>This page requires administrator privileges.</p>
        </div>
      </MainContent>
    );
  }

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadFireStations(),
      loadEquipmentTypes()
    ]);
  };

  const loadFireStations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fire-stations-crud', {
        method: 'GET'
      });

      if (error) throw error;

      if (data?.data?.stations) {
        setFireStations(data.data.stations);
      }
    } catch (error: any) {
      console.error('Error loading fire stations:', error);
      setError('Failed to load fire stations');
    }
  };

  const loadEquipmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('room_equipment_types')
        .select('*')
        .eq('is_active', true)
        .order('equipment_type_name');

      if (error) throw error;

      setEquipmentTypes(data || []);
    } catch (error: any) {
      console.error('Error loading equipment types:', error);
      setError('Failed to load equipment types');
    }
  };

  const loadMenuItems = async (fireStationId: number) => {
    try {
      const { data, error } = await supabase
        .from('user_fire_station_menu_items')
        .select(`
          *,
          fire_stations_vfh!inner(fire_station_name)
        `)
        .eq('fire_station_id', fireStationId)
        .eq('is_active', true)
        .order('menu_item_name');

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        fire_station_name: item.fire_stations_vfh?.fire_station_name || ''
      })) || [];

      setMenuItems(formattedData);
    } catch (error: any) {
      console.error('Error loading menu items:', error);
      setError('Failed to load menu items');
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fire_station_rooms')
        .select(`
          *,
          user_fire_station_menu_items!inner(
            menu_item_name,
            fire_stations_vfh!inner(
              fire_station_name,
              department_id
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(room => ({
        ...room,
        menu_item_name: room.user_fire_station_menu_items?.menu_item_name || '',
        fire_station_name: room.user_fire_station_menu_items?.fire_stations_vfh?.fire_station_name || ''
      })) || [];

      setRooms(formattedData);
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_equipment')
        .select(`
          *,
          fire_station_rooms!inner(
            room_name,
            user_fire_station_menu_items!inner(
              fire_stations_vfh!inner(fire_station_name)
            )
          ),
          room_equipment_types!inner(
            equipment_type_name,
            equipment_category
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        room_name: item.fire_station_rooms?.room_name || '',
        fire_station_name: item.fire_station_rooms?.user_fire_station_menu_items?.fire_stations_vfh?.fire_station_name || '',
        equipment_type_name: item.room_equipment_types?.equipment_type_name || '',
        equipment_category: item.room_equipment_types?.equipment_category || ''
      })) || [];

      setEquipment(formattedData);
    } catch (error: any) {
      console.error('Error loading equipment:', error);
      setError('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  // Room Management Functions
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if user has administrator role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('user_id', user?.id)
        .eq('role_name', 'administrator')
        .single();

      if (roleError || !roleData) {
        throw new Error('Only administrators can manage rooms. Please contact your system administrator for access.');
      }

      // Get current user staff ID from staff_basic_info table (for audit trail)
      const { data: staffData, error: staffError } = await supabase
        .from('staff_basic_info')
        .select('staff_id')
        .eq('user_id', user?.id)
        .single();

      if (staffError || !staffData) {
        console.error('Staff record not found:', staffError);
        throw new Error('Unable to find staff record for current user. Please contact administrator.');
      }

      // Get the fire station ID from the selected menu item
      const selectedMenuItem = menuItems.find(item => item.id === roomFormData.menu_item_id);
      if (!selectedMenuItem) {
        throw new Error('Please select a valid menu item');
      }

      const submitData = {
        menu_item_id: roomFormData.menu_item_id,
        fire_station_id: selectedMenuItem.fire_station_id,
        room_name: roomFormData.room_name,
        room_description: roomFormData.room_description || null,
        room_type: roomFormData.room_type || null,
        floor_level: roomFormData.floor_level || null,
        area_sqft: roomFormData.area_sqft ? parseFloat(roomFormData.area_sqft) : null,
        created_by_staff_id: staffData.staff_id
      };

      if (editingRoom) {
        // Update room
        const { error } = await supabase
          .from('fire_station_rooms')
          .update({
            ...submitData,
            updated_at: formatDateTime(new Date())
          })
          .eq('id', editingRoom);

        if (error) throw error;
        setSuccess('Room updated successfully!');
        setEditingRoom(null);
      } else {
        // Create new room
        const { error } = await supabase
          .from('fire_station_rooms')
          .insert(submitData);

        if (error) throw error;
        setSuccess('Room created successfully!');
      }

      // Reset form
      setRoomFormData({
        menu_item_id: '',
        room_name: '',
        room_description: '',
        room_type: '',
        floor_level: '',
        area_sqft: ''
      });

      await loadRooms();
    } catch (error: any) {
      console.error('Error saving room:', error);
      setError(error.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomEdit = (room: Room) => {
    setRoomFormData({
      menu_item_id: room.menu_item_id,
      room_name: room.room_name,
      room_description: room.room_description || '',
      room_type: room.room_type || '',
      floor_level: room.floor_level || '',
      area_sqft: room.area_sqft?.toString() || ''
    });
    setEditingRoom(room.id);
    setActiveTab('rooms');
  };

  const handleRoomDelete = async (record: any) => {
    const roomId = record.id;
    const roomName = record.room_name;
    if (!window.confirm(`Are you sure you want to delete the room "${roomName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fire_station_rooms')
        .update({ is_active: false })
        .eq('id', roomId);

      if (error) throw error;
      
      setSuccess('Room deleted successfully!');
      await loadRooms();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError('Failed to delete room');
    }
  };

  // Equipment Management Functions
  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if user has administrator role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('user_id', user?.id)
        .eq('role_name', 'administrator')
        .single();

      if (roleError || !roleData) {
        throw new Error('Only administrators can manage equipment. Please contact your system administrator for access.');
      }

      // Get current user staff ID from staff_basic_info table (for audit trail)
      const { data: staffData, error: staffError } = await supabase
        .from('staff_basic_info')
        .select('staff_id')
        .eq('user_id', user?.id)
        .single();

      if (staffError || !staffData) {
        console.error('Staff record not found:', staffError);
        throw new Error('Unable to find staff record for current user. Please contact administrator.');
      }

      const submitData = {
        room_id: equipmentFormData.room_id,
        equipment_type_id: equipmentFormData.equipment_type_id,
        equipment_name: equipmentFormData.equipment_name,
        equipment_model: equipmentFormData.equipment_model || null,
        equipment_serial_number: equipmentFormData.equipment_serial_number || null,
        equipment_manufacturer: equipmentFormData.equipment_manufacturer || null,
        purchase_date: equipmentFormData.purchase_date || null,
        last_maintenance_date: equipmentFormData.last_maintenance_date || null,
        next_maintenance_due: equipmentFormData.next_maintenance_due || null,
        condition_status: equipmentFormData.condition_status,
        quantity: parseInt(equipmentFormData.quantity),
        value_usd: equipmentFormData.value_usd ? parseFloat(equipmentFormData.value_usd) : null,
        location_within_room: equipmentFormData.location_within_room || null,
        notes: equipmentFormData.notes || null,
        created_by_staff_id: staffData.staff_id
      };

      if (editingEquipment) {
        // Update equipment
        const { error } = await supabase
          .from('room_equipment')
          .update({
            ...submitData,
            updated_at: formatDateTime(new Date())
          })
          .eq('id', editingEquipment);

        if (error) throw error;
        setSuccess('Equipment updated successfully!');
        setEditingEquipment(null);
      } else {
        // Create new equipment
        const { error } = await supabase
          .from('room_equipment')
          .insert(submitData);

        if (error) throw error;
        setSuccess('Equipment added successfully!');
      }

      // Reset form
      setEquipmentFormData({
        room_id: '',
        equipment_type_id: '',
        equipment_name: '',
        equipment_model: '',
        equipment_serial_number: '',
        equipment_manufacturer: '',
        purchase_date: '',
        last_maintenance_date: '',
        next_maintenance_due: '',
        condition_status: 'Good',
        quantity: '1',
        value_usd: '',
        location_within_room: '',
        notes: ''
      });

      await loadEquipment();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      setError(error.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentEdit = (item: Equipment) => {
    setEquipmentFormData({
      room_id: item.room_id,
      equipment_type_id: item.equipment_type_id,
      equipment_name: item.equipment_name,
      equipment_model: item.equipment_model || '',
      equipment_serial_number: item.equipment_serial_number || '',
      equipment_manufacturer: item.equipment_manufacturer || '',
      purchase_date: item.purchase_date || '',
      last_maintenance_date: item.last_maintenance_date || '',
      next_maintenance_due: item.next_maintenance_due || '',
      condition_status: item.condition_status,
      quantity: item.quantity.toString(),
      value_usd: item.value_usd?.toString() || '',
      location_within_room: item.location_within_room || '',
      notes: item.notes || ''
    });
    setEditingEquipment(item.id);
    setActiveTab('equipment');
  };

  const handleEquipmentDelete = async (record: any) => {
    const equipmentId = record.id;
    const equipmentName = record.equipment_name;
    if (!window.confirm(`Are you sure you want to delete the equipment "${equipmentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('room_equipment')
        .update({ is_active: false })
        .eq('id', equipmentId);

      if (error) throw error;
      
      setSuccess('Equipment deleted successfully!');
      await loadEquipment();
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      setError('Failed to delete equipment');
    }
  };

  // Helper Functions
  const resetRoomForm = () => {
    setRoomFormData({
      menu_item_id: '',
      room_name: '',
      room_description: '',
      room_type: '',
      floor_level: '',
      area_sqft: ''
    });
    setEditingRoom(null);
    setError('');
    setSuccess('');
  };

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      room_id: '',
      equipment_type_id: '',
      equipment_name: '',
      equipment_model: '',
      equipment_serial_number: '',
      equipment_manufacturer: '',
      purchase_date: '',
      last_maintenance_date: '',
      next_maintenance_due: '',
      condition_status: 'Good',
      quantity: '1',
      value_usd: '',
      location_within_room: '',
      notes: ''
    });
    setEditingEquipment(null);
    setError('');
    setSuccess('');
  };

  // Helper function to convert image URL to base64
  const convertImageToBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn('Failed to fetch logo image:', response.statusText);
        return null;
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data:image/...;base64, prefix to get just the base64 data
          const base64Data = base64String.split(',')[1];
          resolve(base64Data || null);
        };
        reader.onerror = () => {
          console.warn('Failed to read logo image as base64');
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Error converting logo to base64:', error);
      return null;
    }
  };

  const generatePDFReport = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF('landscape');
      
      // Calculate summary data
      const totalRooms = rooms.length;
      const totalEquipment = equipment.length;
      const totalValue = equipment.reduce((sum, item) => sum + (item.value_usd || 0), 0);
      const equipmentByCategory = equipment.reduce((acc, item) => {
        acc[item.equipment_category || 'Uncategorized'] = (acc[item.equipment_category || 'Uncategorized'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert logo to base64 asynchronously
      let logoBase64 = null;
      if (imageUrl) {
        logoBase64 = await convertImageToBase64(imageUrl);
      }

      // Setup PDF with VFH standard
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64,
        data: {
          departmentName: 'Fire Station Equipment & Room Management',
          departmentType: 'Emergency Services',
          reportTitle: 'Equipment & Room Management Report',
          summaryText: `Summary: Total Rooms: ${totalRooms}, Total Equipment: ${totalEquipment}, Total Value: $${totalValue.toFixed(2)}`,
          currentUser: user
        }
      });

      // Create room summary table
      autoTable(doc, {
        head: [['Fire Station', 'Room Name', 'Type', 'Floor Level', 'Area (sqft)']],
        body: rooms.map(room => [
          room.fire_station_name || '-',
          room.room_name || '-',
          room.room_type || '-',
          room.floor_level || '-',
          room.area_sqft?.toString() || '-'
        ]),
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });

      // Add new page for equipment
      doc.addPage();
      
      // Create equipment table
      autoTable(doc, {
        head: [['Fire Station', 'Room', 'Equipment', 'Type', 'Category', 'Condition', 'Quantity', 'Value']],
        body: equipment.map(item => [
          item.fire_station_name || '-',
          item.room_name || '-',
          item.equipment_name || '-',
          item.equipment_type_name || '-',
          item.equipment_category || '-',
          item.condition_status || '-',
          item.quantity.toString(),
          item.value_usd ? `$${item.value_usd.toFixed(2)}` : '-'
        ]),
        startY: 60,
        ...vfhSetup.tableConfig
      });

      // Generate filename and save to sessionStorage
      const pdfDataUri = doc.output('datauristring');
      const timestamp = formatDateOnly(new Date());
      const pdfKey = `equipment_room_management_${timestamp}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/register');
      sessionStorage.setItem('pdf_source_path', '/admin/register/equipment-room-management');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess('PDF report generated successfully!');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'rooms') {
      loadRooms();
    } else if (activeTab === 'equipment') {
      loadEquipment();
    }
  }, [activeTab]);

  // Room Form Fields
  const roomFormFields = [
    {
      name: 'menu_item_id',
      label: 'Fire Station Menu Item',
      type: 'select' as const,
      required: true,
      options: menuItems.map(item => ({
        value: item.id,
        label: `${item.fire_station_name} - ${item.menu_item_name}`
      }))
    },
    {
      name: 'room_name',
      label: 'Room Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter room name'
    },
    {
      name: 'room_description',
      label: 'Room Description',
      type: 'textarea' as const,
      placeholder: 'Enter room description'
    },
    {
      name: 'room_type',
      label: 'Room Type',
      type: 'select' as const,
      options: ROOM_TYPE_OPTIONS.map(type => ({ value: type, label: type }))
    },
    {
      name: 'floor_level',
      label: 'Floor Level',
      type: 'text' as const,
      placeholder: 'e.g., Ground Floor, Level 1, Basement'
    },
    {
      name: 'area_sqft',
      label: 'Area (sq ft)',
      type: 'number' as const,
      placeholder: 'Enter area in square feet'
    }
  ];

  // Equipment Form Fields
  const equipmentFormFields = [
    {
      name: 'room_id',
      label: 'Room',
      type: 'select' as const,
      required: true,
      options: rooms.map(room => ({
        value: room.id,
        label: `${room.fire_station_name} - ${room.room_name}`
      }))
    },
    {
      name: 'equipment_type_id',
      label: 'Equipment Type',
      type: 'select' as const,
      required: true,
      options: equipmentTypes.map(type => ({
        value: type.id,
        label: `${type.equipment_category || 'General'} - ${type.equipment_type_name}`
      }))
    },
    {
      name: 'equipment_name',
      label: 'Equipment Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter equipment name'
    },
    {
      name: 'equipment_model',
      label: 'Model',
      type: 'text' as const,
      placeholder: 'Enter equipment model'
    },
    {
      name: 'equipment_serial_number',
      label: 'Serial Number',
      type: 'text' as const,
      placeholder: 'Enter serial number'
    },
    {
      name: 'equipment_manufacturer',
      label: 'Manufacturer',
      type: 'text' as const,
      placeholder: 'Enter manufacturer'
    },
    {
      name: 'purchase_date',
      label: 'Purchase Date',
      type: 'date' as const
    },
    {
      name: 'last_maintenance_date',
      label: 'Last Maintenance',
      type: 'date' as const
    },
    {
      name: 'next_maintenance_due',
      label: 'Next Maintenance Due',
      type: 'date' as const
    },
    {
      name: 'condition_status',
      label: 'Condition Status',
      type: 'select' as const,
      required: true,
      options: CONDITION_STATUS_OPTIONS.map(status => ({ value: status, label: status }))
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number' as const,
      required: true
    },
    {
      name: 'value_usd',
      label: 'Value (USD)',
      type: 'number' as const,
      placeholder: 'Enter value in USD'
    },
    {
      name: 'location_within_room',
      label: 'Location Within Room',
      type: 'text' as const,
      placeholder: 'e.g., North Wall, Bay 3'
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Enter additional notes'
    }
  ];

  // Room Table Columns
  const roomColumns = [
    { key: 'fire_station_name', title: 'Fire Station' },
    { key: 'menu_item_name', title: 'Menu Item' },
    { key: 'room_name', title: 'Room Name' },
    { key: 'room_type', title: 'Type' },
    { key: 'floor_level', title: 'Floor Level' },
    { key: 'area_sqft', title: 'Area (sqft)' },
    {
      key: 'created_at',
      title: 'Created',
      render: (value: string) => formatDateTime(value)
    }
  ];

  // Equipment Table Columns
  const equipmentColumns = [
    { key: 'fire_station_name', title: 'Fire Station' },
    { key: 'room_name', title: 'Room' },
    { key: 'equipment_name', title: 'Equipment' },
    { key: 'equipment_type_name', title: 'Type' },
    { key: 'equipment_category', title: 'Category' },
    { key: 'condition_status', title: 'Condition' },
    { key: 'quantity', title: 'Quantity' },
    {
      key: 'value_usd',
      title: 'Value',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '-'
    }
  ];

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="equipment-room-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="equipment-room-title">
                Equipment & Room Management
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Equipment and Room Management system provides comprehensive management of fire station rooms and associated equipment. This system enables tracking of room information, equipment inventory, maintenance schedules, and operational readiness to ensure all equipment is properly organized and maintained.
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
                  alt="Equipment & Room Management" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/Equipment.png';
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

      {/* Summary Section */}
      <Section>
        <SummaryCard>
          <SummaryItem>
            <span className="value">{rooms.length}</span>
            <div className="label">Total Rooms</div>
          </SummaryItem>
          <SummaryItem>
            <span className="value">{equipment.length}</span>
            <div className="label">Total Equipment</div>
          </SummaryItem>
          <SummaryItem>
            <span className="value">{equipmentTypes.length}</span>
            <div className="label">Equipment Types</div>
          </SummaryItem>
          <SummaryItem>
            <span className="value">${equipment.reduce((sum, item) => sum + (item.value_usd || 0), 0).toLocaleString()}</span>
            <div className="label">Total Equipment Value</div>
          </SummaryItem>
        </SummaryCard>
      </Section>

      {/* Fire Station Selection */}
      {fireStations.length > 0 && (
        <Section>
          <InfoCard>
            <strong>Quick Actions:</strong> Select a fire station to load its menu items for room creation.
            <div style={{ marginTop: '10px' }}>
              {fireStations.slice(0, 3).map(station => (
                <DevExpressButton
                  key={station.id}
                  onClick={() => loadMenuItems(station.id)}
                  style={{ marginRight: '10px', marginBottom: '5px' }}
                >
                  Load {station.fire_station_name} Menu Items
                </DevExpressButton>
              ))}
              {fireStations.length > 3 && (
                <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                  ... and {fireStations.length - 3} more stations
                </span>
              )}
            </div>
          </InfoCard>
        </Section>
      )}

      {/* Tab Navigation */}
      <Section>
        <TabContainer>
          <Tab 
            $active={activeTab === 'rooms'} 
            onClick={() => setActiveTab('rooms')}
          >
            Room Management
          </Tab>
          <Tab 
            $active={activeTab === 'equipment'} 
            onClick={() => setActiveTab('equipment')}
          >
            Equipment Management
          </Tab>
        </TabContainer>

        {/* Tab Content */}
        <TabContent $hidden={false}>
          {/* Rooms Tab */}
          <TabContent $hidden={activeTab !== 'rooms'}>
            <TabActionBar>
              <h3>Room Management</h3>
              <div>
                <DevExpressButton onClick={() => loadRooms()} disabled={loading}>
                  Refresh
                </DevExpressButton>
                <RefreshButton onClick={resetRoomForm} disabled={loading}>
                  Reset Form
                </RefreshButton>
              </div>
            </TabActionBar>

            {/* Room Form */}
            <FormSection>
              <SubTitle>
                {editingRoom ? 'Edit Room Information' : 'Create New Room'}
              </SubTitle>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <form onSubmit={handleRoomSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Fire Station Menu Item *
                    </label>
                    <select
                      value={roomFormData.menu_item_id}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, menu_item_id: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    >
                      <option value="">Select Menu Item</option>
                      {menuItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.fire_station_name} - {item.menu_item_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={roomFormData.room_name}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, room_name: e.target.value }))}
                      placeholder="Enter room name"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Room Description
                    </label>
                    <textarea
                      value={roomFormData.room_description}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, room_description: e.target.value }))}
                      placeholder="Enter room description"
                      rows={3}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Room Type
                    </label>
                    <select
                      value={roomFormData.room_type}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, room_type: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="">Select Room Type</option>
                      {ROOM_TYPE_OPTIONS.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Floor Level
                    </label>
                    <input
                      type="text"
                      value={roomFormData.floor_level}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, floor_level: e.target.value }))}
                      placeholder="e.g., Ground Floor, Level 1, Basement"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Area (sq ft)
                    </label>
                    <input
                      type="number"
                      value={roomFormData.area_sqft}
                      onChange={(e) => setRoomFormData(prev => ({ ...prev, area_sqft: e.target.value }))}
                      placeholder="Enter area in square feet"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <DevExpressButton 
                    type="submit"
                    disabled={loading}
                    $variant="primary"
                  >
                    {loading ? 'Saving...' : (editingRoom ? 'Update Room' : 'Create Room')}
                  </DevExpressButton>
                  
                  {editingRoom && (
                    <DevExpressButton 
                      type="button"
                      onClick={resetRoomForm}
                      style={{ marginLeft: '10px' }}
                      $variant="secondary"
                    >
                      Cancel Edit
                    </DevExpressButton>
                  )}
                </div>
              </form>
            </FormSection>

            {/* Rooms List */}
            <EquipmentListSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <SubTitle>Registered Rooms ({rooms.length})</SubTitle>
                <DevExpressButton onClick={generatePDFReport} disabled={loading}>
                  Generate PDF Report
                </DevExpressButton>
              </div>
              
              {loading ? (
                <div>Loading rooms...</div>
              ) : rooms.length === 0 ? (
                <div>No rooms registered yet.</div>
              ) : (
                <DevExpressTable
                  data={rooms}
                  columns={roomColumns}
                  onEdit={handleRoomEdit}
                  onDelete={handleRoomDelete}
                  title="Fire Station Rooms"
                />
              )}
            </EquipmentListSection>
          </TabContent>

          {/* Equipment Tab */}
          <TabContent $hidden={activeTab !== 'equipment'}>
            <TabActionBar>
              <h3>Equipment Management</h3>
              <div>
                <DevExpressButton onClick={() => loadEquipment()} disabled={loading}>
                  Refresh
                </DevExpressButton>
                <RefreshButton onClick={resetEquipmentForm} disabled={loading}>
                  Reset Form
                </RefreshButton>
              </div>
            </TabActionBar>

            {/* Equipment Form */}
            <FormSection>
              <SubTitle>
                {editingEquipment ? 'Edit Equipment Information' : 'Add New Equipment'}
              </SubTitle>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <form onSubmit={handleEquipmentSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Room *
                    </label>
                    <select
                      value={equipmentFormData.room_id}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, room_id: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    >
                      <option value="">Select Room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.fire_station_name} - {room.room_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Equipment Type *
                    </label>
                    <select
                      value={equipmentFormData.equipment_type_id}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, equipment_type_id: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    >
                      <option value="">Select Equipment Type</option>
                      {equipmentTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.equipment_category || 'General'} - {type.equipment_type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.equipment_name}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, equipment_name: e.target.value }))}
                      placeholder="Enter equipment name"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Model
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.equipment_model}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, equipment_model: e.target.value }))}
                      placeholder="Enter equipment model"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.equipment_serial_number}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, equipment_serial_number: e.target.value }))}
                      placeholder="Enter serial number"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.equipment_manufacturer}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, equipment_manufacturer: e.target.value }))}
                      placeholder="Enter manufacturer"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={equipmentFormData.purchase_date}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Last Maintenance
                    </label>
                    <input
                      type="date"
                      value={equipmentFormData.last_maintenance_date}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, last_maintenance_date: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Next Maintenance Due
                    </label>
                    <input
                      type="date"
                      value={equipmentFormData.next_maintenance_due}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, next_maintenance_due: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Condition Status *
                    </label>
                    <select
                      value={equipmentFormData.condition_status}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, condition_status: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    >
                      {CONDITION_STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={equipmentFormData.quantity}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      min="1"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Value (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={equipmentFormData.value_usd}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, value_usd: e.target.value }))}
                      placeholder="Enter value in USD"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Location Within Room
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.location_within_room}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, location_within_room: e.target.value }))}
                      placeholder="e.g., North Wall, Bay 3"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Notes
                    </label>
                    <textarea
                      value={equipmentFormData.notes}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Enter additional notes"
                      rows={3}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <DevExpressButton 
                    type="submit"
                    disabled={loading}
                    $variant="primary"
                  >
                    {loading ? 'Saving...' : (editingEquipment ? 'Update Equipment' : 'Add Equipment')}
                  </DevExpressButton>
                  
                  {editingEquipment && (
                    <DevExpressButton 
                      type="button"
                      onClick={resetEquipmentForm}
                      style={{ marginLeft: '10px' }}
                      $variant="secondary"
                    >
                      Cancel Edit
                    </DevExpressButton>
                  )}
                </div>
              </form>
            </FormSection>

            {/* Equipment List */}
            <EquipmentListSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <SubTitle>Equipment Inventory ({equipment.length})</SubTitle>
                <DevExpressButton onClick={generatePDFReport} disabled={loading}>
                  Generate PDF Report
                </DevExpressButton>
              </div>
              
              {loading ? (
                <div>Loading equipment...</div>
              ) : equipment.length === 0 ? (
                <div>No equipment registered yet.</div>
              ) : (
                <DevExpressTable
                  data={equipment}
                  columns={equipmentColumns}
                  onEdit={handleEquipmentEdit}
                  onDelete={handleEquipmentDelete}
                  title="Room Equipment"
                />
              )}
            </EquipmentListSection>
          </TabContent>
        </TabContent>
      </Section>
    </MainContent>
  );
};

export default EquipmentRoomManagement;