import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../../hooks/usePageImage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { formatDateOnly } from '../../../../lib/utils';

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

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const HeaderColumn = styled.div`
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const ImageColumn = styled.div`
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
  }
`;

const HeaderImage = styled.img`
  width: 200px;
  height: auto;
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 200px;
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

const FormHeading = styled.h2`
  font-size: 1.3rem;
  color: #1177BB;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FF9900;
`;

const WarningBox = styled.div`
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
  color: #856404;
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
`;

const ColumnTitle = styled.h3`
  font-size: 1.2rem;
  color: #1177BB;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FF9900;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UpdateLink = styled.a`
  font-size: 0.85rem;
  color: #FF9900;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ItemCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ItemFields = styled.div<{ $visible: boolean }>`
  display: ${props => props.$visible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
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
  font-size: 13px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const Select = styled.select`
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background-color: white;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  min-height: 60px;
  resize: vertical;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const SaveButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
  width: 100%;
  
  &:hover {
    background-color: #218838;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #363;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cfc;
  margin-bottom: 15px;
  font-size: 14px;
`;

interface UniformItem {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface PPEItem {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface IssuedItem {
  id: string;
  staff_id: number;
  item_type: 'uniform' | 'ppe';
  item_id: string;
  quantity: number;
  condition: string;
  description: string;
  issue_date: string;
}

interface ItemFormData {
  selected: boolean;
  quantity: number;
  condition: string;
  description: string;
  issue_date: string;
}

export const StaffEquipmentIssued: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');
  const [uniformItems, setUniformItems] = useState<UniformItem[]>([]);
  const [ppeItems, setPPEItems] = useState<PPEItem[]>([]);
  const [uniformData, setUniformData] = useState<Record<string, ItemFormData>>({});
  const [ppeData, setPPEData] = useState<Record<string, ItemFormData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffId, setStaffId] = useState<number | null>(null);
  const [basicInfoCompleted, setBasicInfoCompleted] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{ name: string; employeeNumber: string } | null>(null);

  useEffect(() => {
    const storedStaffId = sessionStorage.getItem('current_staff_id');
    const basicCompleted = sessionStorage.getItem('basic_info_completed') === 'true';
    
    setBasicInfoCompleted(basicCompleted);
    
    if (!storedStaffId) {
      return;
    }
    
    const id = parseInt(storedStaffId);
    setStaffId(id);
    loadStaffInfo(id);
    loadUniformItems();
    loadPPEItems();
    loadIssuedEquipment(id);
  }, []);

  const loadStaffInfo = async (staffId: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: {
          action: 'read',
          table: 'staff_basic_info',
          staff_id: staffId
        }
      });

      if (error) {
        console.error('Error loading staff info:', error);
        return;
      }

      if (data?.data) {
        const basicInfo = data.data;
        const fullName = `${basicInfo.first_name || ''} ${basicInfo.middle_name || ''} ${basicInfo.last_name || ''}`.replace(/\s+/g, ' ').trim();
        setStaffInfo({
          name: fullName || 'Unknown',
          employeeNumber: basicInfo.employee_number || 'N/A'
        });
      }
    } catch (error: any) {
      console.error('Error loading staff info:', error);
    }
  };

  const loadUniformItems = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_8_equipment_issued')
        .select('*')
        .eq('item_type', 'uniform')
        .order('name');

      if (error) throw error;
      setUniformItems(data || []);
    } catch (error: any) {
      console.error('Error loading uniform items:', error);
    }
  };

  const loadPPEItems = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_8_equipment_issued')
        .select('*')
        .eq('item_type', 'ppe')
        .order('name');

      if (error) throw error;
      setPPEItems(data || []);
    } catch (error: any) {
      console.error('Error loading PPE items:', error);
    }
  };

  const loadIssuedEquipment = async (staffId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_8_equipment_issued')
        .select('*')
        .eq('staff_id', staffId);

      if (error) throw error;

      const newUniformData: Record<string, ItemFormData> = {};
      const newPPEData: Record<string, ItemFormData> = {};

      (data || []).forEach((item: IssuedItem) => {
        const formData: ItemFormData = {
          selected: true,
          quantity: item.quantity || 1,
          condition: item.condition || '',
          description: item.description || '',
          issue_date: item.issue_date || ''
        };

        if (item.item_type === 'uniform') {
          newUniformData[item.item_id] = formData;
        } else if (item.item_type === 'ppe') {
          newPPEData[item.item_id] = formData;
        }
      });

      setUniformData(newUniformData);
      setPPEData(newPPEData);
    } catch (error: any) {
      console.error('Error loading issued equipment:', error);
      setError('Failed to load issued equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleUniformCheckbox = (itemId: string) => {
    setUniformData(prev => ({
      ...prev,
      [itemId]: {
        selected: !prev[itemId]?.selected,
        quantity: prev[itemId]?.quantity || 1,
        condition: prev[itemId]?.condition || '',
        description: prev[itemId]?.description || '',
        issue_date: prev[itemId]?.issue_date || formatDateOnly(new Date())
      }
    }));
  };

  const handlePPECheckbox = (itemId: string) => {
    setPPEData(prev => ({
      ...prev,
      [itemId]: {
        selected: !prev[itemId]?.selected,
        quantity: prev[itemId]?.quantity || 1,
        condition: prev[itemId]?.condition || '',
        description: prev[itemId]?.description || '',
        issue_date: prev[itemId]?.issue_date || formatDateOnly(new Date())
      }
    }));
  };

  const handleUniformFieldChange = (itemId: string, field: keyof ItemFormData, value: string | number) => {
    setUniformData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handlePPEFieldChange = (itemId: string, field: keyof ItemFormData, value: string | number) => {
    setPPEData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!staffId) {
      setError('Staff ID not found. Please complete Basic Registration Info first.');
      return;
    }

    if (!basicInfoCompleted) {
      setError('Please complete Basic Information form first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Delete all existing equipment for this staff member
      const { error: deleteError } = await supabase
        .from('02_admin_staff_8_equipment_issued')
        .delete()
        .eq('staff_id', staffId);

      if (deleteError) throw deleteError;

      // Prepare new records to insert
      const recordsToInsert: any[] = [];

      // Add selected uniform items
      Object.entries(uniformData).forEach(([itemId, data]) => {
        if (data.selected) {
          recordsToInsert.push({
            staff_id: staffId,
            item_type: 'uniform',
            item_id: itemId,
            quantity: data.quantity || 1,
            condition: data.condition || null,
            description: data.description || null,
            issue_date: data.issue_date || null
          });
        }
      });

      // Add selected PPE items
      Object.entries(ppeData).forEach(([itemId, data]) => {
        if (data.selected) {
          recordsToInsert.push({
            staff_id: staffId,
            item_type: 'ppe',
            item_id: itemId,
            quantity: data.quantity || 1,
            condition: data.condition || null,
            description: data.description || null,
            issue_date: data.issue_date || null
          });
        }
      });

      // Insert new records if any
      if (recordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('02_admin_staff_8_equipment_issued')
          .insert(recordsToInsert);

        if (insertError) throw insertError;
      }

      setSuccess('Equipment issued records saved successfully!');
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      setError(error.message || 'An error occurred while saving equipment data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="staff-equipment-issued-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <HeaderColumn>
              <Title id="staff-equipment-issued-title">Staff Equipment Issued</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Track and manage uniform and PPE (Personal Protective Equipment) issued to staff members. Select the items issued and provide details about quantity, condition, and any additional notes.
              </Paragraph>
            </HeaderColumn>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Staff Registration" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/Staff.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <FormSection>
        {staffInfo && (
          <FormHeading>
            Equipment Issued To: {staffInfo.name} ({staffInfo.employeeNumber})
          </FormHeading>
        )}
        
        {!basicInfoCompleted && (
          <WarningBox>
            <strong>⚠️ Notice:</strong> Please complete the Basic Information form first before entering data on this page.
          </WarningBox>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <TwoColumnLayout>
          {/* Uniform Issued Column */}
          <Column>
            <ColumnTitle>
              Uniform Issued
              <UpdateLink onClick={() => alert('Uniform options management coming soon')}>
                Update Options
              </UpdateLink>
            </ColumnTitle>
            
            {uniformItems.map(item => (
              <ItemCard key={item.id}>
                <ItemHeader>
                  <ItemName>{item.name}</ItemName>
                  <Checkbox
                    type="checkbox"
                    checked={uniformData[item.id]?.selected || false}
                    onChange={() => handleUniformCheckbox(item.id)}
                    disabled={!basicInfoCompleted || loading}
                  />
                </ItemHeader>
                
                <ItemFields $visible={uniformData[item.id]?.selected || false}>
                  <FieldRow>
                    <FieldColumn $flex="1">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={uniformData[item.id]?.quantity || 1}
                        onChange={(e) => handleUniformFieldChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={loading}
                      />
                    </FieldColumn>
                    <FieldColumn $flex="1">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={uniformData[item.id]?.issue_date || ''}
                        onChange={(e) => handleUniformFieldChange(item.id, 'issue_date', e.target.value)}
                        disabled={loading}
                      />
                    </FieldColumn>
                  </FieldRow>
                  
                  <FieldColumn>
                    <Label>Condition</Label>
                    <Select
                      value={uniformData[item.id]?.condition || ''}
                      onChange={(e) => handleUniformFieldChange(item.id, 'condition', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select condition</option>
                      <option value="New">New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Worn">Worn</option>
                      <option value="Damaged">Damaged</option>
                    </Select>
                  </FieldColumn>
                  
                  <FieldColumn>
                    <Label>Description/Notes</Label>
                    <TextArea
                      value={uniformData[item.id]?.description || ''}
                      onChange={(e) => handleUniformFieldChange(item.id, 'description', e.target.value)}
                      placeholder="Size, color, serial number, or other notes..."
                      disabled={loading}
                    />
                  </FieldColumn>
                </ItemFields>
              </ItemCard>
            ))}
          </Column>

          {/* PPE Issued Column */}
          <Column>
            <ColumnTitle>
              PPE Issued
              <UpdateLink onClick={() => alert('PPE options management coming soon')}>
                Update Options
              </UpdateLink>
            </ColumnTitle>
            
            {ppeItems.map(item => (
              <ItemCard key={item.id}>
                <ItemHeader>
                  <ItemName>{item.name}</ItemName>
                  <Checkbox
                    type="checkbox"
                    checked={ppeData[item.id]?.selected || false}
                    onChange={() => handlePPECheckbox(item.id)}
                    disabled={!basicInfoCompleted || loading}
                  />
                </ItemHeader>
                
                <ItemFields $visible={ppeData[item.id]?.selected || false}>
                  <FieldRow>
                    <FieldColumn $flex="1">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ppeData[item.id]?.quantity || 1}
                        onChange={(e) => handlePPEFieldChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={loading}
                      />
                    </FieldColumn>
                    <FieldColumn $flex="1">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={ppeData[item.id]?.issue_date || ''}
                        onChange={(e) => handlePPEFieldChange(item.id, 'issue_date', e.target.value)}
                        disabled={loading}
                      />
                    </FieldColumn>
                  </FieldRow>
                  
                  <FieldColumn>
                    <Label>Condition</Label>
                    <Select
                      value={ppeData[item.id]?.condition || ''}
                      onChange={(e) => handlePPEFieldChange(item.id, 'condition', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select condition</option>
                      <option value="New">New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Worn">Worn</option>
                      <option value="Damaged">Damaged</option>
                    </Select>
                  </FieldColumn>
                  
                  <FieldColumn>
                    <Label>Description/Notes</Label>
                    <TextArea
                      value={ppeData[item.id]?.description || ''}
                      onChange={(e) => handlePPEFieldChange(item.id, 'description', e.target.value)}
                      placeholder="Size, color, serial number, or other notes..."
                      disabled={loading}
                    />
                  </FieldColumn>
                </ItemFields>
              </ItemCard>
            ))}
          </Column>
        </TwoColumnLayout>

        <SaveButton onClick={handleSave} disabled={!basicInfoCompleted || loading}>
          {loading ? 'Saving...' : 'Save Equipment Issued'}
        </SaveButton>
      </FormSection>
    </MainContent>
  );
};
