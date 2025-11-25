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

export const Notams: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('notams', '/images/ControlRoom.png');
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="notams-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="notams-title">
                NOTAMs
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Notice to Airmen (NOTAM) management is a critical function of the Emergency Control Centre, 
                ensuring timely dissemination of essential aeronautical information affecting flight operations 
                and airport safety. The ECC monitors, processes, and coordinates NOTAM information related to 
                emergency services, runway conditions, hazards, and operational restrictions at King Fahd 
                International Airport.
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
                  alt="NOTAMs Management" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/ControlRoom.png';
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

      {/* NOTAM Categories Section */}
      <Section aria-labelledby="notam-categories">
        <SubTitle id="notam-categories">
          NOTAM Categories Monitored
        </SubTitle>
        <FlexRow>
          <Column $width="48%">
            <Paragraph>
              <strong>Airport Rescue and Firefighting (ARFF) Related:</strong> NOTAMs concerning changes 
              to fire station operations, equipment availability, emergency response capabilities, and 
              firefighting coverage levels. These include temporary reductions in service levels, equipment 
              maintenance periods, and special operational procedures.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <Paragraph>
              <strong>Runway and Taxiway Conditions:</strong> Critical information about runway surface 
              conditions, foreign object debris (FOD), construction activities, and temporary closures 
              that may affect emergency response vehicle access and aircraft incident response capabilities.
            </Paragraph>
          </Column>
        </FlexRow>
        <FlexRow>
          <Column $width="48%">
            <Paragraph>
              <strong>Hazardous Materials and Safety:</strong> NOTAMs related to hazardous cargo operations, 
              fuel spill incidents, chemical hazards, and environmental concerns requiring emergency service 
              awareness and specialized response protocols.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <Paragraph>
              <strong>Emergency Procedures:</strong> Updates to emergency response procedures, evacuation 
              protocols, mutual aid agreements, and coordination requirements with air traffic control, 
              airport operations, and external emergency services.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Processing and Coordination Section */}
      <Section aria-labelledby="processing-coordination">
        <SubTitle id="processing-coordination">
          NOTAM Processing and Coordination
        </SubTitle>
        <Paragraph>
          The Emergency Control Centre maintains continuous monitoring of the aeronautical information 
          system, reviewing all NOTAMs for relevance to emergency operations. When emergency-related 
          NOTAMs are received, ECC staff immediately assess operational impacts, notify relevant 
          personnel, update response procedures, and coordinate with airport operations and air traffic 
          control to ensure seamless integration of emergency services with overall airport operations. The centre also initiates NOTAMs when emergency service capabilities are affected by equipment 
          maintenance, training exercises, or operational constraints. This ensures all airport stakeholders 
          and aircraft operators receive timely notification of any temporary changes to fire protection 
          coverage levels or emergency response capabilities as required by ICAO Annex 14 and local 
          aviation regulations.
        </Paragraph>
      </Section>


    </MainContent>
  );
};
