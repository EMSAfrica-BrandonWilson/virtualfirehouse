import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../../hooks/usePageImage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';

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

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '48%'};
  vertical-align: top;
  text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
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

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const SubmitButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 10px;
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #218838;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background-color: #1177BB;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  background-color: ${props => props.$variant === 'delete' ? '#dc3545' : '#ffc107'};
  color: ${props => props.$variant === 'delete' ? 'white' : '#000'};
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 5px;
  
  &:hover {
    background-color: ${props => props.$variant === 'delete' ? '#c82333' : '#e0a800'};
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

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
`;

interface DisciplinaryRecord {
  disciplinary_id: number;
  staff_id: number;
  incident_date: string;
  incident_type: string;
  description: string;
  action_taken: string;
  resolution_status: string;
}

interface DisciplinaryRecordFormData {
  incident_date: string;
  incident_type: string;
  description: string;
  action_taken: string;
  resolution_status: string;
}

export const StaffDisciplinaryRecords: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');
  const [formData, setFormData] = useState<DisciplinaryRecordFormData>({
    incident_date: '',
    incident_type: '',
    description: '',
    action_taken: '',
    resolution_status: ''
  });

  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffId, setStaffId] = useState<number | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
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
    loadRecords(id);
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

  const loadRecords = async (staffId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: {
          action: 'list',
          table: '02_admin_staff_6_disciplinary_records',
          staff_id: staffId
        }
      });

      if (error) {
        console.error('Error loading records:', error);
        setError('Failed to load disciplinary records');
        return;
      }

      setRecords(data?.data || []);
    } catch (error: any) {
      console.error('Error loading records:', error);
      setError('Failed to load disciplinary records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setFormData({
      incident_date: '',
      incident_type: '',
      description: '',
      action_taken: '',
      resolution_status: ''
    });
    setEditingRecordId(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (record: DisciplinaryRecord) => {
    setFormData({
      incident_date: record.incident_date || '',
      incident_type: record.incident_type || '',
      description: record.description || '',
      action_taken: record.action_taken || '',
      resolution_status: record.resolution_status || ''
    });
    setEditingRecordId(record.disciplinary_id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setFormData({
      incident_date: '',
      incident_type: '',
      description: '',
      action_taken: '',
      resolution_status: ''
    });
    setEditingRecordId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const requestData = {
        action: editingRecordId ? 'update' : 'create',
        table: '02_admin_staff_6_disciplinary_records',
        data: editingRecordId ? {
          id: editingRecordId,
          incident_date: formData.incident_date || null,
          incident_type: formData.incident_type || null,
          description: formData.description || null,
          action_taken: formData.action_taken || null,
          resolution_status: formData.resolution_status || null
        } : {
          staff_id: staffId,
          incident_date: formData.incident_date || null,
          incident_type: formData.incident_type || null,
          description: formData.description || null,
          action_taken: formData.action_taken || null,
          resolution_status: formData.resolution_status || null
        }
      };

      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: requestData
      });

      if (error) {
        throw new Error(error.message || 'Failed to save disciplinary record');
      }

      setSuccess(editingRecordId ? 'Record updated successfully!' : 'Record added successfully!');
      
      // Clear form and reload list
      handleCancel();
      await loadRecords(staffId);
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving the record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: number) => {
    if (!window.confirm('Are you sure you want to delete this disciplinary record?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: {
          action: 'delete',
          table: '02_admin_staff_6_disciplinary_records',
          id: recordId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete record');
      }

      setSuccess('Record deleted successfully!');
      
      if (staffId) {
        await loadRecords(staffId);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="staff-disciplinary-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="staff-disciplinary-title">Staff Disciplinary Records</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Confidential records of disciplinary actions, warnings, and corrective measures.
              </Paragraph>
            </Column>
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
            Disciplinary Records For: {staffInfo.name} ({staffInfo.employeeNumber})
          </FormHeading>
        )}
        
        <WarningBox>
          <strong>Confidential Information:</strong> This information is sensitive and should be handled with care. 
          Access is restricted to authorized personnel only.
        </WarningBox>
        
        {!basicInfoCompleted && (
          <WarningBox>
            <strong>⚠️ Notice:</strong> Please complete the Basic Information form first before entering data on this page.
          </WarningBox>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        {!showForm && (
          <AddButton onClick={handleAddNew} disabled={!basicInfoCompleted || loading}>
            Add New Disciplinary Record
          </AddButton>
        )}

        {showForm && (
          <FormContainer onSubmit={handleSubmit}>
            <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>
              {editingRecordId ? 'Edit Disciplinary Record' : 'Add New Disciplinary Record'}
            </h3>
            
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="incident_date">Incident Date *</Label>
                <Input
                  type="date"
                  id="incident_date"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="incident_type">Incident Type</Label>
                <Input
                  type="text"
                  id="incident_type"
                  name="incident_type"
                  value={formData.incident_type}
                  onChange={handleInputChange}
                  placeholder="e.g., Warning, Suspension, Reprimand"
                  disabled={loading}
                />
              </FieldColumn>
            </FieldRow>

            <FieldRow>
              <FieldColumn>
                <Label htmlFor="resolution_status">Resolution Status</Label>
                <Input
                  type="text"
                  id="resolution_status"
                  name="resolution_status"
                  value={formData.resolution_status}
                  onChange={handleInputChange}
                  placeholder="e.g., Pending, Resolved, Closed"
                  disabled={loading}
                />
              </FieldColumn>
            </FieldRow>

            <FieldRow>
              <FieldColumn>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed description of the incident"
                  disabled={loading}
                />
              </FieldColumn>
            </FieldRow>

            <FieldRow>
              <FieldColumn>
                <Label htmlFor="action_taken">Action Taken</Label>
                <TextArea
                  id="action_taken"
                  name="action_taken"
                  value={formData.action_taken}
                  onChange={handleInputChange}
                  placeholder="Enter action taken and resolution details"
                  disabled={loading}
                />
              </FieldColumn>
            </FieldRow>

            <div style={{ marginTop: '20px' }}>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingRecordId ? 'Update Record' : 'Add Record'}
              </SubmitButton>
              <CancelButton type="button" onClick={handleCancel} disabled={loading}>
                Cancel
              </CancelButton>
            </div>
          </FormContainer>
        )}

        {!showForm && records.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Incident Date</Th>
                <Th>Incident Type</Th>
                <Th>Description</Th>
                <Th>Action Taken</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.disciplinary_id}>
                  <Td>{record.incident_date || 'N/A'}</Td>
                  <Td>{record.incident_type || 'N/A'}</Td>
                  <Td title={record.description || 'N/A'}>
                    {record.description ? (record.description.length > 50 ? record.description.substring(0, 50) + '...' : record.description) : 'N/A'}
                  </Td>
                  <Td title={record.action_taken || 'N/A'}>
                    {record.action_taken ? (record.action_taken.length > 50 ? record.action_taken.substring(0, 50) + '...' : record.action_taken) : 'N/A'}
                  </Td>
                  <Td>{record.resolution_status || 'N/A'}</Td>
                  <Td>
                    <ActionButton 
                      $variant="edit" 
                      onClick={() => handleEdit(record)}
                      disabled={loading}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton 
                      $variant="delete" 
                      onClick={() => handleDelete(record.disciplinary_id)}
                      disabled={loading}
                    >
                      Delete
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {!showForm && records.length === 0 && !loading && (
          <EmptyState>
            No disciplinary records added yet. Click "Add New Disciplinary Record" to get started.
          </EmptyState>
        )}
      </FormSection>
    </MainContent>
  );
};
