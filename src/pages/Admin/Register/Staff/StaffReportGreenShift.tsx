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

const StaffListSection = styled.div`
  margin-top: 2rem;
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

const RefreshButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background-color: #218838;
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

const StaffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #28a745;
    color: white;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
`;

const EditButton = styled.button`
  background-color: #ffc107;
  color: #212529;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 5px;
  
  &:hover {
    background-color: #e0a800;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c82333;
  }
`;

const InfoBox = styled.div`
  background-color: #e8f5e9;
  border-left: 4px solid #28a745;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
`;

interface StaffMember {
  staff_id: number;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  nationality?: string;
  operational_shift_id?: number;
  photo_url?: string;
}

export const StaffReportGreenShift: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [greenShiftId, setGreenShiftId] = useState<number | null>(null);

  useEffect(() => {
    loadGreenShiftId();
  }, []);

  useEffect(() => {
    if (greenShiftId !== null) {
      loadStaff();
    }
  }, [greenShiftId]);

  const loadGreenShiftId = async () => {
    try {
      const { data, error } = await supabase
        .from('02_admin_register_fd2_operational_shifts')
        .select('id')
        .ilike('shift_name', '%green%')
        .single();

      if (error) throw error;
      if (data) setGreenShiftId(data.id);
    } catch (error: any) {
      console.error('Error loading Green Shift ID:', error);
      setError('Failed to load shift information');
    }
  };

  const loadStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_1_registration')
        .select('*')
        .eq('operational_shift_id', greenShiftId)
        .order('employee_number', { ascending: true });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      setError(error.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember: StaffMember) => {
    sessionStorage.setItem('current_staff_id', staffMember.staff_id.toString());
    sessionStorage.setItem('current_employee_number', staffMember.employee_number);
    navigate('/admin/register/staff/basic-info');
  };

  const handleDelete = async (staffMember: StaffMember) => {
    if (!window.confirm(`Delete ${staffMember.first_name} ${staffMember.last_name} (${staffMember.employee_number})?`)) return;
    setLoading(true);
    setError('');
    try {
      const { error: depErr } = await supabase
        .from('shift_assignments')
        .delete()
        .eq('staff_id', staffMember.staff_id);
      if (depErr) throw depErr;
      const { error } = await supabase
        .from('02_admin_staff_1_registration')
        .delete()
        .eq('staff_id', staffMember.staff_id);
      if (error) throw error;
      setStaff(prev => prev.filter(s => s.staff_id !== staffMember.staff_id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <FlexRow>
        <Column style={{ flex: '1', minWidth: '0' }}>
          <Title>Staff Report - Green Shift</Title>
          <Divider />
          <Paragraph>
            Comprehensive report of all staff members assigned to Green Shift operational schedule.
          </Paragraph>
        </Column>
        <ImageColumn>
          {imageLoading ? (
            <ImagePlaceholder>Loading image...</ImagePlaceholder>
          ) : imageUrl ? (
            <HeaderImage src={imageUrl} alt="Staff Reports" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/Staff.png'; }} />
          ) : (
            <ImagePlaceholder>No image available</ImagePlaceholder>
          )}
        </ImageColumn>
      </FlexRow>

      <StaffListSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SubTitle>Green Shift Staff Members</SubTitle>
          <RefreshButton onClick={loadStaff} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </RefreshButton>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {greenShiftId && (
          <InfoBox>
            <strong>Filter:</strong> Showing staff assigned to Green Shift (ID: {greenShiftId})
          </InfoBox>
        )}

        {loading ? (
          <p>Loading staff members...</p>
        ) : staff.length === 0 ? (
          <p>No staff members assigned to Green Shift.</p>
        ) : (
          <StaffTable>
            <thead>
              <tr>
                <th>Employee Number</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Last Name</th>
                <th>Nationality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.staff_id}>
                  <td>{member.employee_number}</td>
                  <td>{member.first_name}</td>
                  <td>{member.middle_name || '-'}</td>
                  <td>{member.last_name}</td>
                  <td>{member.nationality || '-'}</td>
                  <td>
                    <EditButton onClick={() => handleEdit(member)}>
                      Edit
                    </EditButton>
                    <DeleteButton onClick={() => handleDelete(member)} disabled={loading}>
                      Delete
                    </DeleteButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StaffTable>
        )}
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <strong>Total Staff:</strong> {staff.length}
        </div>
      </StaffListSection>
    </MainContent>
  );
};
