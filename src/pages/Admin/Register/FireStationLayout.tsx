import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const SubTitle = styled.h3`
  color: #1177BB;
  font-weight: 600;
  margin-bottom: 15px;
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
    color: #666;
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

const RoomCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
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

const InfoMessage = styled.div`
  background-color: #d1ecf1;
  color: #0c5460;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #bee5eb;
`;

const LoadingSpinner = styled.span`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  display: inline-block;
  margin-right: 8px;
  
  &:before {
    content: '⏳';
    animation: spin 1s linear infinite;
  }
`;

interface Room {
  id: string;
  menu_item_id: string;
  fire_station_id: number;
  room_name: string;
  room_description?: string;
  room_type?: string;
  floor_level?: string;
  area_sqft?: number;
  created_by_staff_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface FireStation {
  id: number;
  department_id: number;
  fire_station_name: string;
}

export const FireStationLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const [selectedFireStationId, setSelectedFireStationId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<{[key: string]: Array<{value: string, text: string}>}>({});
  const [loading, setLoading] = useState(false);
  const [fireStationsLoading, setFireStationsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingRoomNames, setExistingRoomNames] = useState<Set<string>>(new Set());

  const [newRoom, setNewRoom] = useState({
    room_name: '',
    room_description: '',
    room_type: '',
    floor_level: ''
  });

  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editRoomData, setEditRoomData] = useState({
    room_name: '',
    room_description: '',
    room_type: '',
    floor_level: ''
  });

  useEffect(() => {
    loadFireStations();
    loadDropdownOptions();
  }, []);

  useEffect(() => {
    if (selectedFireStationId) {
      loadRooms();
    } else {
      setRooms([]);
      setExistingRoomNames(new Set());
    }
  }, [selectedFireStationId]);

  const loadFireStations = async () => {
    setFireStationsLoading(true);
    try {
      const { data: staffData } = await supabase
        .from('staff_basic_info')
        .select('fire_dept_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!staffData?.fire_dept_id) {
        setError('Staff record not found. Please contact administrator.');
        setFireStationsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('02_admin_register_fd3_stations')
        .select('id, department_id, fire_station_name')
        .eq('department_id', staffData.fire_dept_id)
        .order('fire_station_name');

      if (error) throw error;
      setFireStations(data || []);
    } catch (error: any) {
      console.error('Error loading fire stations:', error);
      setError('Failed to load fire stations');
    } finally {
      setFireStationsLoading(false);
    }
  };

  const loadRooms = async () => {
    if (!selectedFireStationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fire_station_rooms')
        .select(`
          id,
          menu_item_id,
          fire_station_id,
          room_name,
          room_description,
          room_type,
          floor_level,
          area_sqft,
          created_by_staff_id,
          created_at,
          updated_at,
          is_active
        `)
        .eq('fire_station_id', selectedFireStationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
      
      // Track existing room names to disable them in dropdown
      const roomNames = new Set<string>();
      (data || []).forEach(room => {
        if (room.room_name) {
          roomNames.add(room.room_name);
        }
      });
      setExistingRoomNames(roomNames);
      
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError(`Failed to load rooms: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownOptions = async () => {
    try {
      // Load Room Types from 02_admin_register_fd2_types
      const { data: typesData, error: typesError } = await supabase
        .from('02_admin_register_fd2_types')
        .select('name, display_name')
        .eq('is_active', true)
        .order('display_name');

      if (typesError) throw typesError;

      // Load Room Names from 02_admin_register_fd85_equipment_location
      const { data: namesData, error: namesError } = await supabase
        .from('02_admin_register_fd85_equipment_location')
        .select('name')
        .eq('active', true)
        .order('name');

      if (namesError) throw namesError;

      // Hardcoded Room Levels (Floors) as there is no specific table for this yet
      const roomLevels = [
        'Basement 2', 'Basement 1', 
        'Ground Floor', 
        '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', 
        'Roof'
      ];

      const groupedOptions: {[key: string]: Array<{value: string, text: string}>} = {
        room_types: (typesData || []).map(t => ({
          value: t.name,
          text: t.display_name || t.name
        })),
        room_names: (namesData || []).map(n => ({
          value: n.name,
          text: n.name
        })),
        room_levels: roomLevels.map(l => ({
          value: l,
          text: l
        }))
      };

      setDropdownOptions(groupedOptions);
    } catch (error: any) {
      console.error('Error loading dropdown options:', error);
      console.error('Dropdown error details:', JSON.stringify(error, null, 2));
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFireStationId) {
      setError('Please select a fire station first');
      return;
    }

    if (!newRoom.room_type) {
      setError('Room type is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('user_id', user?.id)
        .eq('role_name', 'administrator')
        .single();

      if (roleError || !roleData) {
        throw new Error('Only administrators can add rooms to fire stations. Please contact your system administrator for access.');
      }

      const { data: staffData } = await supabase
        .from('staff_basic_info')
        .select('staff_id')
        .eq('user_id', user?.id)
        .single();

      if (!staffData) {
        throw new Error('Staff record not found. Please contact administrator to link your account.');
      }

      const { error } = await supabase
        .from('fire_station_rooms')
        .insert({
          menu_item_id: '4df0c008-a0d3-4533-820e-ab28a69c51ce', // Equipment & Rooms menu item
          fire_station_id: selectedFireStationId,
          room_name: newRoom.room_name || null,
          room_description: newRoom.room_description || null,
          room_type: newRoom.room_type,
          floor_level: newRoom.floor_level || null,
          created_by_staff_id: staffData.staff_id
        });

      if (error) throw new Error(error.message);

      setSuccess('Room added successfully');
      setNewRoom({
        room_name: '',
        room_description: '',
        room_type: '',
        floor_level: ''
      });
      await loadRooms();
    } catch (error: any) {
      console.error('Error adding room:', error);
      setError(error.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room? All equipment in this room will also be deleted.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('fire_station_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw new Error(error.message);

      setSuccess('Room deleted successfully');
      loadRooms();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room.id);
    setEditRoomData({
      room_name: room.room_name || '',
      room_description: room.room_description || '',
      room_type: room.room_type || '',
      floor_level: room.floor_level || ''
    });
  };

  const renderRoomNameOptions = () => {
    const roomNameOptions = dropdownOptions.room_names || [];
    return roomNameOptions.map((option) => {
      const isExisting = existingRoomNames.has(option.value);
      return (
        <option 
          key={option.value} 
          value={option.value}
          disabled={isExisting}
          style={{
            color: isExisting ? '#999' : '#000',
            backgroundColor: isExisting ? '#f5f5f5' : 'white'
          }}
        >
          {option.text}{isExisting ? ' (Already exists)' : ''}
        </option>
      );
    });
  };

  const handleUpdateRoom = async (roomId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('fire_station_rooms')
        .update({
          room_name: editRoomData.room_name,
          room_description: editRoomData.room_description || null,
          room_type: editRoomData.room_type || null,
          floor_level: editRoomData.floor_level || null
        })
        .eq('id', roomId);

      if (error) throw new Error(error.message);

      setSuccess('Room updated successfully');
      setEditingRoom(null);
      loadRooms();
    } catch (error: any) {
      console.error('Error updating room:', error);
      setError(error.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <Section>
        <Title>Fire Station Rooms Management</Title>
        <Divider />

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormSection>
          <SubTitle>Select Fire Station</SubTitle>
          {fireStationsLoading ? (
            <InfoMessage>
              <LoadingSpinner />
              Loading fire stations...
            </InfoMessage>
          ) : (
            <FieldColumn>
              <Label>Fire Station *</Label>
              <Select
                value={selectedFireStationId || ''}
                onChange={(e) => setSelectedFireStationId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Select a fire station...</option>
                {fireStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.fire_station_name}
                  </option>
                ))}
              </Select>
            </FieldColumn>
          )}
        </FormSection>

        {selectedFireStationId && (
          <FormSection>
            <SubTitle>Add New Room</SubTitle>
            <FormContainer onSubmit={handleAddRoom}>
              <FieldRow>
                <FieldColumn>
                  <Label>Room Type *</Label>
                  <Select
                    value={newRoom.room_type}
                    onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
                    $hasError={!newRoom.room_type && !!error}
                  >
                    <option value="">Select room type...</option>
                    {(dropdownOptions.room_types || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.text}
                      </option>
                    ))}
                  </Select>
                </FieldColumn>
                <FieldColumn>
                  <Label>Room Name</Label>
                  <Select
                    value={newRoom.room_name}
                    onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
                  >
                    <option value="">Select room name...</option>
                    {renderRoomNameOptions()}
                  </Select>
                  {existingRoomNames.size > 0 && (
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      Room names marked as "(Already exists)" cannot be selected for this fire station.
                    </small>
                  )}
                </FieldColumn>
                <FieldColumn>
                  <Label>Room Level</Label>
                  <Select
                    value={newRoom.floor_level}
                    onChange={(e) => setNewRoom({ ...newRoom, floor_level: e.target.value })}
                  >
                    <option value="">Select floor level...</option>
                    {(dropdownOptions.room_levels || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.text}
                      </option>
                    ))}
                  </Select>
                </FieldColumn>
              </FieldRow>

              <FieldColumn>
                <Label>Description</Label>
                <TextArea
                  value={newRoom.room_description}
                  onChange={(e) => setNewRoom({ ...newRoom, room_description: e.target.value })}
                  placeholder="Additional details about the room..."
                />
              </FieldColumn>

              <AddButton type="submit" disabled={loading || !newRoom.room_type}>
                {loading ? 'Adding Room...' : 'Add Room'}
              </AddButton>
            </FormContainer>
          </FormSection>
        )}

        {selectedFireStationId && (
          <>
            {loading && rooms.length === 0 ? (
              <InfoMessage>
                <LoadingSpinner />
                Loading rooms...
              </InfoMessage>
            ) : rooms.length > 0 ? (
              <FormSection>
                <SubTitle>Existing Rooms ({rooms.length})</SubTitle>
                {rooms.map((room) => (
                  <RoomCard key={room.id}>
                    {editingRoom === room.id ? (
                      <div>
                        <h4 style={{ color: '#1177BB', marginBottom: '15px' }}>Edit Room</h4>
                        <FieldRow>
                          <FieldColumn>
                            <Label>Room Type *</Label>
                            <Select
                              value={editRoomData.room_type}
                              onChange={(e) => setEditRoomData({ ...editRoomData, room_type: e.target.value })}
                            >
                              <option value="">Select room type...</option>
                              {(dropdownOptions.room_types || []).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.text}
                                </option>
                              ))}
                            </Select>
                          </FieldColumn>
                          <FieldColumn>
                            <Label>Room Name</Label>
                            <Select
                              value={editRoomData.room_name}
                              onChange={(e) => setEditRoomData({ ...editRoomData, room_name: e.target.value })}
                            >
                              <option value="">Select room name...</option>
                              {renderRoomNameOptions()}
                            </Select>
                            {existingRoomNames.size > 0 && (
                              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                                Room names marked as "(Already exists)" cannot be selected for this fire station.
                              </small>
                            )}
                          </FieldColumn>
                          <FieldColumn>
                            <Label>Room Level</Label>
                            <Select
                              value={editRoomData.floor_level}
                              onChange={(e) => setEditRoomData({ ...editRoomData, floor_level: e.target.value })}
                            >
                              <option value="">Select floor level...</option>
                              {(dropdownOptions.room_levels || []).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.text}
                                </option>
                              ))}
                            </Select>
                          </FieldColumn>
                        </FieldRow>
                        <FieldColumn>
                          <Label>Description</Label>
                          <TextArea
                            value={editRoomData.room_description}
                            onChange={(e) => setEditRoomData({ ...editRoomData, room_description: e.target.value })}
                            placeholder="Additional details about the room..."
                          />
                        </FieldColumn>
                        <div style={{ marginTop: '15px' }}>
                          <ActionButton className="save" onClick={() => handleUpdateRoom(room.id)} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                          </ActionButton>
                          <ActionButton className="cancel" onClick={() => setEditingRoom(null)}>
                            Cancel
                          </ActionButton>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ color: '#1177BB', marginBottom: '8px' }}>
                              {room.room_name || 'Unnamed Room'}
                              {room.room_type && ` - ${room.room_type}`}
                            </h4>
                            
                            {room.room_description && (
                              <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#666' }}>
                                {room.room_description}
                              </p>
                            )}
                            
                            <div style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                              {room.floor_level && `Floor: ${room.floor_level} | `}
                              {room.area_sqft && `Area: ${room.area_sqft} sq ft | `}
                              Created: {new Date(room.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div>
                            <ActionButton className="edit" onClick={() => handleEditRoom(room)}>
                              Edit
                            </ActionButton>
                            <ActionButton className="delete" onClick={() => handleDeleteRoom(room.id)}>
                              Delete
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </RoomCard>
                ))}
              </FormSection>
            ) : (
              <InfoMessage>
                No rooms have been added to this fire station yet. Use the form above to add your first room.
              </InfoMessage>
            )}
          </>
        )}

        {!selectedFireStationId && (
          <InfoMessage>
            Please select a fire station to view and manage its rooms.
          </InfoMessage>
        )}
      </Section>
    </MainContent>
  );
};

export default FireStationLayout;
