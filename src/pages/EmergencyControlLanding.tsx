import React from 'react';
import styled from 'styled-components';

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

export const EmergencyControlLanding: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="control-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="control-title">
                Emergency Control Centre
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The ECC is the nerve centre for all Emergency Operations at KFIA, providing 24/7 Dispatch, Incident Coordination, and Communications Management with advanced monitoring equipment and command technologies. Certified dispatchers maintain constant vigilance, monitoring all emergency frequencies and coordinating response teams. The centre operates with redundant systems, backup power, and comprehensive protocols for uninterrupted Emergency Response.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/ControlRoom.png" alt="Emergency Control Centre" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Communication Systems Section */}
      <Section aria-labelledby="communication-systems">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="communication-systems">
              Advanced Communication
            </SubTitle>
            <Paragraph>
              Our control centre features cutting-edge communication systems including digital radio networks, satellite communications, cellular backup, and direct lines to external services. Communication protocols maintain reliable contact with all field units regardless of conditions, with regular testing ensuring optimal performance.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Coordination Systems
            </SubTitle>
            <Paragraph>
              The centre employs sophisticated incident management software with computer-aided dispatch, GPS tracking, and resource management databases integrated with airport systems. This ensures efficient coordination, optimal resource allocation, minimal response times, and complete situational awareness.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Operations Management Section */}
      <Section aria-labelledby="operations-management">
        <SubTitle id="operations-management">
          24/7 Operations Management and Incident Coordination
        </SubTitle>
        <Paragraph>
          The Emergency Control Centre operates continuously with certified dispatchers maintaining constant readiness. Operations protocols include situation monitoring, resource tracking, multi-agency coordination, and real-time documentation. Staff maintain regular communication with airport operations, air traffic control, and external services, providing the critical coordination foundation for effective emergency response.
        </Paragraph>
      </Section>
    </MainContent>
  );
};