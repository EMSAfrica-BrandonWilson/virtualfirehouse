import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';

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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

export const VehiclesLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-vehicles', '/images/RegisterYourService.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="vehicles-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="vehicles-title">
                Vehicle Registration
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Vehicle registration maintains detailed records of all emergency response apparatus and support vehicles within the King Fahd International Airport fleet. This comprehensive system tracks vehicle specifications, ARFF capabilities, maintenance schedules, and operational status to ensure optimal fleet readiness and effective emergency response coverage in compliance with ICAO and GACAR requirements.
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
                  alt="Vehicle Registration" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/RegisterYourService.png';
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

      {/* Vehicle Specifications Section */}
      <Section aria-labelledby="vehicle-specs">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="vehicle-specs">
              Vehicle Identification and Specifications
            </SubTitle>
            <Paragraph>
              Vehicle registration documents essential details including vehicle identification number, make, model, year, registration number, and classification type. The system maintains comprehensive technical specifications including dimensions, weight capacity, engine specifications, and specialized ARFF capabilities to support operational planning and deployment strategies.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              ARFF Capabilities and Equipment
            </SubTitle>
            <Paragraph>
              The registration system records critical firefighting capabilities including water tank capacity, foam concentrate capacity, discharge rates, agent types, pump specifications, and specialized equipment configurations. This detailed capability tracking ensures appropriate apparatus deployment and supports compliance with airport category requirements and response time objectives.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Maintenance and Assignment Section */}
      <Section aria-labelledby="maintenance-assignment">
        <SubTitle id="maintenance-assignment">
          Maintenance Tracking and Operational Assignment
        </SubTitle>
        <Paragraph>
          Vehicle registration integrates with maintenance scheduling systems to track service intervals, inspection dates, repair history, and parts replacement records. The system maintains real-time operational status, station assignments, and crew allocations to ensure continuous fleet readiness. Comprehensive records support regulatory inspections, warranty management, and lifecycle planning for the King Fahd International Airport emergency services fleet.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
