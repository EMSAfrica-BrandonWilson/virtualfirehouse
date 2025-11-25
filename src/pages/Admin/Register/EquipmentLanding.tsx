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

export const EquipmentLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-equipment', '/images/Equipment.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="equipment-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="equipment-title">
                Equipment Registration
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Equipment registration maintains comprehensive inventories of all specialized emergency response equipment, tools, and apparatus used by King Fahd International Airport fire services. This critical system tracks equipment specifications, maintenance schedules, calibration records, and operational assignments to ensure readiness, regulatory compliance, and effective emergency operations.
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
                  alt="Equipment Registration" 
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

      {/* Equipment Categories Section */}
      <Section aria-labelledby="equipment-categories">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="equipment-categories">
              Equipment Classification and Inventory
            </SubTitle>
            <Paragraph>
              Equipment registration organizes assets into functional categories including firefighting equipment, rescue tools, hazmat response gear, medical equipment, communications devices, and safety apparatus. The system maintains detailed records of equipment type, model, serial numbers, acquisition dates, and assigned locations to support effective inventory management and resource allocation.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Technical Specifications and Capabilities
            </SubTitle>
            <Paragraph>
              The registration system documents comprehensive technical specifications including manufacturer details, operational parameters, capacity ratings, power requirements, and compatibility information. This detailed technical data supports operational planning, training requirements, and ensures proper equipment deployment during emergency responses.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Maintenance and Compliance Section */}
      <Section aria-labelledby="maintenance-compliance">
        <SubTitle id="maintenance-compliance">
          Maintenance Tracking and Regulatory Compliance
        </SubTitle>
        <Paragraph>
          Equipment registration integrates with preventive maintenance programs to track service schedules, inspection dates, calibration records, and testing requirements. The system maintains comprehensive documentation of equipment condition, repair history, and certification status to ensure regulatory compliance with ICAO standards, GACAR requirements, and manufacturer specifications. Automated alerts support proactive maintenance scheduling and ensure continuous operational readiness of all emergency response equipment at King Fahd International Airport.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
