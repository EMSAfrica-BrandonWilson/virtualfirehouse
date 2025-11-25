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

export const AdministrationLanding: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="admin-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="admin-title">
                Emergency Administration
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Emergency Administration division provides administrative oversight for airport emergency services, managing strategic planning, policy development, regulatory compliance, and coordination to ensure operational excellence per ICAO and GACAR standards. Our functions include budget management, HR coordination, legal compliance, and strategic initiatives supporting emergency operations. We oversee personnel, equipment procurement, facilities, and inter-agency coordination.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/AdminHome.png" alt="Emergency Administration Services" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Leadership and Structure Section */}
      <Section aria-labelledby="leadership-structure">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="leadership-structure">
              Administrative Oversight and Policy Development
            </SubTitle>
            <Paragraph>
              We develop and implement policies governing emergency operations, including SOPs, regulatory compliance, and international safety standards. Coordinating with stakeholders—airport operations, airlines, and regulators—our framework ensures seamless service delivery and continuous improvement.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Strategic Planning and Resource Management
            </SubTitle>
            <Paragraph>
              Strategic planning encompasses resource allocation, budgeting, and organizational optimization. We assess operational requirements, technology needs, and personnel development to maintain industry leadership. Resource management includes equipment procurement, facility planning, workforce development, inter-agency coordination, and mutual aid agreements.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Strategic Planning Section */}
      <Section aria-labelledby="strategic-planning">
        <SubTitle id="strategic-planning">
          Organizational Excellence and Leadership Coordination
        </SubTitle>
        <Paragraph>
          Emergency Administration serves as the central coordination hub for all department functions. Our leadership oversees operational effectiveness, personnel management, and continuous improvement while maintaining accountability and transparency. Our structure promotes efficient decision-making, clear communication, and effective resource utilization, regularly incorporating best practices to maintain our position as a premier regional ARFF operation.
        </Paragraph>
      </Section>
    </MainContent>
  );
};