import React from 'react';
import styled from 'styled-components';

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

const InfoBox = styled.div`
  background: #f8f9fa;
  border: 2px solid #1177BB;
  border-radius: 8px;
  padding: 30px;
  margin-top: 20px;
  text-align: center;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.6;
`;

export const VehiclesReports: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      <Title>Registered Vehicles Report</Title>
      <Divider aria-hidden="true" />
      
      <InfoBox>
        <InfoText>
          This section will display comprehensive reports of all registered emergency vehicles including apparatus specifications, ARFF capabilities, maintenance records, and operational status.
        </InfoText>
        <InfoText>
          Reports functionality will be implemented to provide detailed views, export capabilities, and analytics for vehicle registrations.
        </InfoText>
      </InfoBox>
    </MainContent>
  );
};
