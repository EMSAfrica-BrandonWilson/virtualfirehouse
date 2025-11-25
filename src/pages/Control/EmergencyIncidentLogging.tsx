import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';

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

export const EmergencyIncidentLogging: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('emergency-incident-logging', '/images/ControlRoom.png');
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="logging-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="logging-title">
                Emergency Incident Logging
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Emergency Incident Logging system provides real-time documentation and tracking of all emergency events from initial notification through final resolution. This critical system captures comprehensive incident data including call details, response actions, resource deployment, timeline milestones, and outcome information, creating detailed records that support operational coordination, post-incident analysis, regulatory reporting, and continuous improvement initiatives while maintaining complete situational awareness throughout emergency operations.
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
                  alt="Emergency Incident Logging" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/ControlRoom.png';
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

      {/* Data Capture Section */}
      <Section aria-labelledby="data-capture">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="data-capture">
              Comprehensive Data Capture
            </SubTitle>
            <Paragraph>
              The logging system records all essential incident information including location coordinates, emergency type classification, caller details, hazard information, weather conditions, responding units, action timelines, and resource utilization, ensuring complete documentation of every operational aspect.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Real-Time Tracking
            </SubTitle>
            <Paragraph>
              Incident status is continuously updated throughout the emergency response lifecycle, tracking dispatch times, arrival times, operational milestones, resource changes, and incident evolution, providing command personnel with current situational awareness and supporting effective decision-making.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Analysis Section */}
      <Section aria-labelledby="analysis-section">
        <SubTitle id="analysis-section">
          Incident Analysis and Reporting
        </SubTitle>
        <Paragraph>
          Emergency Incident Logging data supports comprehensive analysis of response performance, trend identification, resource utilization patterns, and operational effectiveness. Detailed incident records facilitate regulatory reporting, statistical analysis, training development, and evidence-based improvements to emergency response capabilities and operational procedures.
        </Paragraph>
      </Section>
    </MainContent>
  );
};