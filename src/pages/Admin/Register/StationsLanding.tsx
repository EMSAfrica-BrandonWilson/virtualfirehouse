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

export const StationsLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-stations', '/images/FireStation2.jpg');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="stations-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="stations-title">
                Station Registration
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Station registration maintains comprehensive records of all fire station facilities within the King Fahd International Airport emergency services network. This system captures critical facility information, geographic coordinates, operational capabilities, and resource assignments to ensure optimal emergency response coverage across the entire airport complex.
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
                  alt="Station Registration" 
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

      {/* Facility Information Section */}
      <Section aria-labelledby="facility-info">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="facility-info">
              Facility Infrastructure
            </SubTitle>
            <Paragraph>
              Station registration documents essential facility details including station name, location coordinates, physical address, facility type, and construction specifications. This comprehensive data supports strategic resource placement, response time optimization, and effective coordination during multi-station emergency operations.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Operational Capacity
            </SubTitle>
            <Paragraph>
              The registration system maintains detailed records of station operational capabilities including apparatus bay capacity, communications equipment, emergency power systems, and specialized facilities. This information ensures proper resource allocation and supports operational planning for emergency response activities.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Resource Assignment Section */}
      <Section aria-labelledby="resource-assignment">
        <SubTitle id="resource-assignment">
          Resource Assignment and Coverage Areas
        </SubTitle>
        <Paragraph>
          Station registration integrates with personnel, vehicle, and equipment systems to maintain real-time visibility into assigned resources and operational readiness at each facility. The system defines primary and secondary response areas, mutual aid agreements, and strategic positioning to ensure comprehensive emergency coverage throughout King Fahd International Airport and surrounding jurisdictions.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
