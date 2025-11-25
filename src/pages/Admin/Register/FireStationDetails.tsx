import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const InfoCard = styled.div`
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const InfoLabel = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  color: #666;
  margin-bottom: 15px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
`;

const BackButton = styled.button`
  background: #FF9900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  
  &:hover {
    background: #e68900;
  }
`;

const FireStationDetails: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const [station, setStation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStationDetails = async () => {
      if (!stationId) {
        setError('Station ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching fire station details for ID:', stationId);

        const { data, error: fetchError } = await supabase
          .from('fire_stations_vfh')
          .select(`
            *,
            emergency_departments!inner (
              dept_name,
              department_type
            )
          `)
          .eq('id', parseInt(stationId))
          .single();

        if (fetchError) {
          console.error('❌ Error fetching station details:', fetchError);
          setError('Failed to fetch fire station details');
          return;
        }

        if (!data) {
          setError('Fire station not found');
          return;
        }

        console.log('✅ Fire station details fetched:', data);
        setStation(data);
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStationDetails();
  }, [stationId]);

  const handleBack = () => {
    navigate('/admin/register/stations');
  };

  if (loading) {
    return (
      <MainContent>
        <LoadingSpinner>Loading fire station details...</LoadingSpinner>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent>
        <BackButton onClick={handleBack}>← Back to Fire Stations</BackButton>
        <ErrorMessage>{error}</ErrorMessage>
      </MainContent>
    );
  }

  if (!station) {
    return (
      <MainContent>
        <BackButton onClick={handleBack}>← Back to Fire Stations</BackButton>
        <ErrorMessage>Fire station not found</ErrorMessage>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <BackButton onClick={handleBack}>← Back to Fire Stations</BackButton>
      
      <Title>Fire Station Details: {station.fire_station_name}</Title>
      <Divider />

      <Section>
        <h2 style={{ color: '#1177BB', marginBottom: '15px' }}>Station Information</h2>
        <InfoGrid>
          <InfoCard>
            <InfoLabel>Station Name</InfoLabel>
            <InfoValue>{station.fire_station_name}</InfoValue>
            
            <InfoLabel>Department</InfoLabel>
            <InfoValue>{station.emergency_departments?.dept_name}</InfoValue>
            
            <InfoLabel>Department Type</InfoLabel>
            <InfoValue>{station.emergency_departments?.department_type}</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>Location Details</InfoLabel>
            <InfoValue>
              {station.fire_station_building_number} {station.fire_station_street_name}<br />
              {station.fire_station_suburb}, {station.fire_station_city}
            </InfoValue>
            
            <InfoLabel>Contact Information</InfoLabel>
            <InfoValue>
              <strong>Station:</strong> {station.fire_station_telephone}<br />
              <strong>Contact Person:</strong> {station.fire_station_contact_name}<br />
              <strong>Contact Rank:</strong> {station.fire_station_contact_rank}<br />
              <strong>Contact Email:</strong> {station.fire_station_contact_email}<br />
              <strong>Contact Phone:</strong> {station.fire_station_contact_telephone}
            </InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>Staff & Equipment</InfoLabel>
            <InfoValue>
              <strong>Number of Staff:</strong> {station.number_of_station_staff || 'Not specified'}<br />
              <strong>Number of Vehicles:</strong> {station.number_of_station_vehicles || 'Not specified'}
            </InfoValue>
            
            <InfoLabel>Registration Details</InfoLabel>
            <InfoValue>
              <strong>Created:</strong> {new Date(station.created_at).toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date(station.updated_at).toLocaleDateString()}
            </InfoValue>
          </InfoCard>
        </InfoGrid>
      </Section>
    </MainContent>
  );
};

export default FireStationDetails;