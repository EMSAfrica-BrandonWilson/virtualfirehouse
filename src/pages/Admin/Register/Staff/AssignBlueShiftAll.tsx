import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 6px;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

const Paragraph = styled.p`
  font-size: 105%;
  line-height: 24px;
  margin-bottom: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const PrimaryButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover { background-color: #0f5c99; }
  &:disabled { background-color: #cccccc; cursor: not-allowed; }
`;

const SecondaryButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: #5a6268; }
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #363;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cfc;
  margin-top: 10px;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin-top: 10px;
  font-size: 14px;
`;

export const AssignBlueShiftAll: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blueShiftId, setBlueShiftId] = useState<number | null>(null);
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      setError(null);
      try {
        // Ensure Blue Shift exists and get its ID
        const { data: found, error: findErr } = await supabase
          .from('02_admin_register_fd2_operational_shifts')
          .select('id')
          .eq('shift_name', 'Blue Shift')
          .limit(1)
          .single();
        let id: number | null = (found as any)?.id ?? null;
        if (findErr && findErr.code !== 'PGRST116') {
          console.warn('Find Blue Shift error:', findErr?.message || findErr);
        }
        if (!id) {
          const { data: inserted, error: insertErr } = await supabase
            .from('02_admin_register_fd2_operational_shifts')
            .insert({ shift_name: 'Blue Shift', active: true })
            .select('id')
            .single();
          if (insertErr) throw new Error(insertErr.message || 'Failed to create Blue Shift');
          id = (inserted as any)?.id ?? null;
        }
        setBlueShiftId(id);

        // Get staff count
        const { count, error: countErr } = await supabase
          .from('staff_basic_info')
          .select('staff_id', { count: 'exact', head: true });
        if (countErr) {
          console.warn('Count staff error:', countErr?.message || countErr);
        }
        setStaffCount(count ?? null);
      } catch (e: any) {
        setError(e?.message || 'Initialization failed');
      }
    };
    init();
  }, []);

  const assignAll = async () => {
    if (!blueShiftId) {
      setError('Blue Shift ID not available.');
      return;
    }
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const { error: updateErr } = await supabase
        .from('staff_basic_info')
        .update({ operational_shift_id: blueShiftId })
        .neq('staff_id', null); // update all existing rows
      if (updateErr) throw new Error(updateErr.message || 'Update failed');

      setSuccess('All staff records set to Blue Shift successfully.');
    } catch (e: any) {
      setError(e?.message || 'Failed to assign Blue Shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <Title>Assign Blue Shift to All Staff</Title>
      <Divider />
      <Paragraph>
        This tool sets every current staff record’s operational shift to "Blue Shift".
        It will create the "Blue Shift" option if it doesn’t already exist.
      </Paragraph>

      <Paragraph>
        Detected staff records: {staffCount ?? '...'} | Blue Shift ID: {blueShiftId ?? '...'}
      </Paragraph>

      <ButtonRow>
        <PrimaryButton onClick={assignAll} disabled={loading || !blueShiftId}>
          {loading ? 'Assigning...' : 'Assign Blue Shift to All'}
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/admin/register/staff/reports-shifts')}>View Shift Reports</SecondaryButton>
      </ButtonRow>

      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </MainContent>
  );
};