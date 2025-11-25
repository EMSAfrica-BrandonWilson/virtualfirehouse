import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
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

const FieldRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FieldColumn = styled.div<{ $flex?: string }>`
  flex: ${props => props.$flex || '1'};
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled(Button)`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #218838, #1ba87d);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    transform: translateY(-2px);
  }
`;

const ActionButton = styled(Button)`
  padding: 8px 15px;
  font-size: 12px;
  margin-right: 10px;
  
  &.edit {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
  }
  
  &.delete {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
  }
  
  &.save {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
  }
  
  &.cancel {
    background: linear-gradient(135deg, #6c757d, #5a6268);
    color: white;
  }
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const EquipmentCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #c3e6cb;
`;

interface FireStation {
  id: number;
  fire_station_name: string;
}

interface Room {
  id: number;
  room_name: string;
  room_type: string;
  floor_level: string;
  equipment?: Equipment[];
}

interface Equipment {
  id: string;
  equipment_type_id: string;
  equipment_type_name: string;
  equipment_category: string;
  quantity: number;
  condition_status: string;
  notes: string;
}

interface EquipmentType {
  uuid_id: string;
  name: string;
  description: string;
}

const StationRoomEquipment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [newEquipment, setNewEquipment] = useState({
    equipment_type_id: null as string | null,
    quantity: '1',
    condition_status: 'Good',
    notes: ''
  });

  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [editEquipmentData, setEditEquipmentData] = useState({
    equipment_type_id: null as string | null,
    quantity: '1',
    condition_status: 'Good',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadFireStations();
    loadEquipmentTypes();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedStationId) {
      loadRooms();
    } else {
      setRooms([]);
      setSelectedRoomId(null);
      setSelectedRoom(null);
    }
  }, [selectedStationId]);

  useEffect(() => {
    if (selectedRoomId) {
      loadRoomWithEquipment();
    } else {
      setSelectedRoom(null);
    }
  }, [selectedRoomId]);

  const loadFireStations = async () => {
    try {
      const { data, error } = await supabase
        .from('fire_stations_vfh')
        .select('id, fire_station_name')
        .order('fire_station_name');

      if (error) throw error;
      setFireStations(data || []);
    } catch (error: any) {
      console.error('Error loading fire stations:', error);
      setError('Failed to load fire stations');
    }
  };

  const loadRooms = async () => {
    if (!selectedStationId) return;

    try {
      console.log('Loading rooms for station ID:', selectedStationId);
      const { data, error } = await supabase
        .from('fire_station_rooms')
        .select('id, room_name, room_type, floor_level')
        .eq('fire_station_id', selectedStationId)
        .order('room_name');

      console.log('Query result - data:', data);
      console.log('Query result - error:', error);
      
      if (error) {
        console.error('Detailed error info:', JSON.stringify(error, null, 2));
        throw error;
      }
      setRooms(data || []);
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      setError(`Failed to load rooms: ${error.message || 'Unknown error'}`);
    }
  };

  const loadRoomWithEquipment = async () => {
    if (!selectedRoomId) return;

    try {
      // Get room details
      const { data: roomData, error: roomError } = await supabase
        .from('fire_station_rooms')
        .select('id, room_name, room_type, floor_level')
        .eq('id', selectedRoomId)
        .single();

      if (roomError) throw roomError;

      // Get equipment for this room
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('room_equipment')
        .select('id, equipment_type_id, equipment_name, quantity, condition_status, notes')
        .eq('room_id', selectedRoomId)
        .eq('is_active', true);

      if (equipmentError) throw equipmentError;

      // Get equipment type details separately to avoid join issues
      const equipmentTypeIds = [...new Set((equipmentData || []).map(item => item.equipment_type_id))];
      let equipmentTypesMap = new Map();
      
      if (equipmentTypeIds.length > 0) {
        const { data: typesData } = await supabase
          .from('equipment_types')
          .select('uuid_id, name, description')
          .in('uuid_id', equipmentTypeIds);
        
        equipmentTypesMap = new Map((typesData || []).map(type => [type.uuid_id, type]));
      }

      const equipment = (equipmentData || []).map((item: any) => {
        const typeInfo = equipmentTypesMap.get(item.equipment_type_id);
        return {
          id: item.id,
          equipment_type_id: item.equipment_type_id,
          equipment_type_name: typeInfo?.name || item.equipment_name || 'Unknown',
          equipment_category: typeInfo?.description || 'General',
          quantity: item.quantity,
          condition_status: item.condition_status,
          notes: item.notes
        };
      });

      setSelectedRoom({
        ...roomData,
        equipment
      });
    } catch (error: any) {
      console.error('Error loading room equipment:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      setError(`Failed to load room equipment: ${error.message || 'Unknown error'}`);
    }
  };

  const loadEquipmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('uuid_id, name, description')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setEquipmentTypes(data || []);
    } catch (error: any) {
      console.error('Error loading equipment types:', error);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoomId || !newEquipment.equipment_type_id) {
      setError('Room and equipment type are required');
      return;
    }

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
        throw new Error('Only administrators can add equipment to fire stations. Please contact your system administrator for access.');
      }

      // Get current user staff ID
      const { data: staffData } = await supabase
        .from('staff_basic_info')
        .select('staff_id')
        .eq('user_id', user?.id)
        .single();

      if (!staffData) {
        throw new Error('Staff record not found. Please contact administrator to link your account.');
      }

      // Get equipment type name to populate equipment_name field
      const { data: equipmentTypeData } = await supabase
        .from('equipment_types')
        .select('name')
        .eq('uuid_id', newEquipment.equipment_type_id)
        .single();

      if (!equipmentTypeData) {
        throw new Error('Equipment type not found');
      }

      const { error } = await supabase
        .from('room_equipment')
        .insert({
          room_id: selectedRoomId,
          equipment_type_id: newEquipment.equipment_type_id,
          equipment_name: equipmentTypeData.name, // Add equipment_name field
          quantity: parseInt(newEquipment.quantity),
          condition_status: newEquipment.condition_status,
          notes: newEquipment.notes || null,
          created_by_staff_id: staffData.staff_id
        });

      if (error) throw new Error(error.message);

      setSuccess('Equipment added successfully');
      setNewEquipment({
        equipment_type_id: null,
        quantity: '1',
        condition_status: 'Good',
        notes: ''
      });
      loadRoomWithEquipment();
    } catch (error: any) {
      console.error('Error adding equipment:', error);
      setError(error.message || 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('room_equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) throw new Error(error.message);

      setSuccess('Equipment deleted successfully');
      loadRoomWithEquipment();
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      setError(error.message || 'Failed to delete equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment.id);
    setEditEquipmentData({
      equipment_type_id: equipment.equipment_type_id,
      quantity: equipment.quantity.toString(),
      condition_status: equipment.condition_status || 'Good',
      notes: equipment.notes || ''
    });
  };

  const handleUpdateEquipment = async (equipmentId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get equipment type name to populate equipment_name field
      const { data: equipmentTypeData } = await supabase
        .from('equipment_types')
        .select('name')
        .eq('uuid_id', editEquipmentData.equipment_type_id)
        .single();

      if (!equipmentTypeData) {
        throw new Error('Equipment type not found');
      }

      const { error } = await supabase
        .from('room_equipment')
        .update({
          equipment_type_id: editEquipmentData.equipment_type_id,
          equipment_name: equipmentTypeData.name, // Add equipment_name field
          quantity: parseInt(editEquipmentData.quantity),
          condition_status: editEquipmentData.condition_status,
          notes: editEquipmentData.notes || null
        })
        .eq('id', equipmentId);

      if (error) throw new Error(error.message);

      setSuccess('Equipment updated successfully');
      setEditingEquipment(null);
      loadRoomWithEquipment();
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      setError(error.message || 'Failed to update equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <Section>
        <Title>Fire Station Equipment Management</Title>
        <Divider />

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormSection>
          <FieldRow>
            <FieldColumn>
              <Label>Select Fire Station *</Label>
              <Select
                value={selectedStationId || ''}
                onChange={(e) => {
                  setSelectedStationId(e.target.value ? parseInt(e.target.value) : null);
                  setSelectedRoomId(null);
                }}
              >
                <option value="">Select a fire station...</option>
                {fireStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.fire_station_name}
                  </option>
                ))}
              </Select>
            </FieldColumn>

            <FieldColumn>
              <Label>Select Room *</Label>
              <Select
                value={selectedRoomId || ''}
                onChange={(e) => setSelectedRoomId(e.target.value || null)}
                disabled={!selectedStationId || rooms.length === 0}
              >
                <option value="">
                  {!selectedStationId 
                    ? 'Select a fire station first...' 
                    : rooms.length === 0 
                    ? 'No rooms available for this station' 
                    : 'Select a room...'}
                </option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_name} {room.room_type && `- ${room.room_type}`}
                  </option>
                ))}
              </Select>
            </FieldColumn>
          </FieldRow>
        </FormSection>

        {selectedRoom && (
          <FormSection>
            <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>
              Add Equipment to the {selectedRoom.room_name}{selectedRoom.room_type && ` - ${selectedRoom.room_type}`}
            </h3>

            <FormContainer onSubmit={handleAddEquipment}>
              
              <FieldRow>
                <FieldColumn>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <Label>Equipment Type *</Label>
                    <a href="/admin/register/dropdown-management" style={{ fontSize: '12px', color: '#1177BB', textDecoration: 'none' }}>
                      Options Link
                    </a>
                  </div>
                  <Select
                    value={newEquipment.equipment_type_id || ''}
                    onChange={(e) => setNewEquipment({ ...newEquipment, equipment_type_id: e.target.value || null })}
                    $hasError={!newEquipment.equipment_type_id && !!error}
                  >
                    <option value="">Select equipment type...</option>
                    {equipmentTypes.map((type) => (
                      <option key={type.uuid_id} value={type.uuid_id}>
                        {type.name}
                        {type.description && ` - ${type.description}`}
                      </option>
                    ))}
                  </Select>
                </FieldColumn>
                <FieldColumn>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    value={newEquipment.quantity}
                    onChange={(e) => setNewEquipment({ ...newEquipment, quantity: e.target.value })}
                    min="1"
                  />
                </FieldColumn>
              </FieldRow>

              <FieldRow>
                <FieldColumn>
                  <Label>Condition</Label>
                  <Select
                    value={newEquipment.condition_status}
                    onChange={(e) => setNewEquipment({ ...newEquipment, condition_status: e.target.value })}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </Select>
                </FieldColumn>
                <FieldColumn>
                  <Label>Notes</Label>
                  <Input
                    type="text"
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                    placeholder="Optional notes..."
                  />
                </FieldColumn>
              </FieldRow>

              <AddButton type="submit" disabled={loading || !newEquipment.equipment_type_id}>
                {loading ? 'Adding Equipment...' : 'Add Equipment'}
              </AddButton>
            </FormContainer>

            {selectedRoom.equipment && selectedRoom.equipment.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ color: '#666', marginBottom: '15px' }}>
                  Equipment in this Room ({selectedRoom.equipment.length} items)
                </h4>
                {selectedRoom.equipment.map((equipment) => (
                  <EquipmentCard key={equipment.id}>
                    {editingEquipment === equipment.id ? (
                      <div>
                        <FieldRow>
                          <FieldColumn>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <Label>Equipment Type *</Label>
                              <a href="/admin/register/dropdown-management" style={{ fontSize: '12px', color: '#1177BB', textDecoration: 'none' }}>
                                Options Link
                              </a>
                            </div>
                            <Select
                              value={editEquipmentData.equipment_type_id || ''}
                              onChange={(e) => setEditEquipmentData({ ...editEquipmentData, equipment_type_id: e.target.value || null })}
                            >
                              <option value="">Select equipment type...</option>
                              {equipmentTypes.map((type) => (
                                <option key={type.uuid_id} value={type.uuid_id}>
                                  {type.name}
                                  {type.description && ` - ${type.description}`}
                                </option>
                              ))}
                            </Select>
                          </FieldColumn>
                          <FieldColumn>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={editEquipmentData.quantity}
                              onChange={(e) => setEditEquipmentData({ ...editEquipmentData, quantity: e.target.value })}
                              min="1"
                            />
                          </FieldColumn>
                        </FieldRow>
                        <FieldRow>
                          <FieldColumn>
                            <Label>Condition</Label>
                            <Select
                              value={editEquipmentData.condition_status}
                              onChange={(e) => setEditEquipmentData({ ...editEquipmentData, condition_status: e.target.value })}
                            >
                              <option value="Excellent">Excellent</option>
                              <option value="Good">Good</option>
                              <option value="Fair">Fair</option>
                              <option value="Poor">Poor</option>
                            </Select>
                          </FieldColumn>
                          <FieldColumn>
                            <Label>Notes</Label>
                            <Input
                              type="text"
                              value={editEquipmentData.notes}
                              onChange={(e) => setEditEquipmentData({ ...editEquipmentData, notes: e.target.value })}
                              placeholder="Optional notes..."
                            />
                          </FieldColumn>
                        </FieldRow>
                        <div style={{ marginTop: '10px' }}>
                          <ActionButton className="save" onClick={() => handleUpdateEquipment(equipment.id)} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </ActionButton>
                          <ActionButton className="cancel" onClick={() => setEditingEquipment(null)}>
                            Cancel
                          </ActionButton>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{equipment.equipment_type_name}</strong>
                          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                            {equipment.equipment_category}
                          </span>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Quantity: {equipment.quantity} | Condition: {equipment.condition_status}
                            {equipment.notes && ` | Notes: ${equipment.notes}`}
                          </div>
                        </div>
                        <div>
                          <ActionButton className="edit" onClick={() => handleEditEquipment(equipment)}>
                            Edit
                          </ActionButton>
                          <ActionButton className="delete" onClick={() => handleDeleteEquipment(equipment.id)}>
                            Delete
                          </ActionButton>
                        </div>
                      </div>
                    )}
                  </EquipmentCard>
                ))}
              </div>
            )}

            {selectedRoom.equipment && selectedRoom.equipment.length === 0 && (
              <p style={{ color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
                No equipment added to this room yet.
              </p>
            )}
          </FormSection>
        )}

        {!selectedRoom && selectedStationId && selectedRoomId && (
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '20px', textAlign: 'center' }}>
            Loading room details...
          </p>
        )}

        {!selectedStationId && (
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '20px', textAlign: 'center' }}>
            Please select a fire station and room to manage equipment.
          </p>
        )}
      </Section>
    </MainContent>
  );
};

export default StationRoomEquipment;
