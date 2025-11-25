import React from 'react';
import { useParams } from 'react-router-dom';
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

const sections = [
  { name: 'Airport Rescue & Fire Fighting', slug: 'airport-rescue-fire-fighting' },
  { name: 'Hazardous Chemical Handling', slug: 'hazardous-chemical-handling' },
  { name: 'Highrise Rescue Operations', slug: 'highrise-rescue-operations' },
  { name: 'Maritime Fire Fighting', slug: 'maritime-fire-fighting' },
  { name: 'Medical Rescue Operations', slug: 'medical-rescue-operations' },
  { name: 'Road Traffic Accidents', slug: 'road-traffic-accidents' },
  { name: 'Nuclear Fire Risk Management', slug: 'nuclear-fire-risk-management' },
  { name: 'Petro-Chemical Fire Fighting', slug: 'petro-chemical-fire-fighting' },
  { name: 'Swift Water Rescue', slug: 'swift-water-rescue' },
  { name: 'Trench Collapse Operations', slug: 'trench-collapse-operations' },
  { name: 'Wildland Fire Fighting', slug: 'wildland-fire-fighting' }
];

export const OperationsLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="operations-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            

            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="operations-title">
                {activeSection ? activeSection.name : 'Emergency Operations'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  <>This is the landing page for {activeSection.name}. Use the sub vertical menu on the left to navigate within this section.</>
                ) : (
                  <>The Emergency Operations division coordinates field response and tactical operations at King Fahd International Airport. Our teams specialize in aircraft rescue and firefighting (ARFF), hazardous materials response, technical rescue, and emergency medical services. Our framework includes emergency response protocols, incident command systems, and specialized equipment operations. We maintain rigorous training and readiness standards for all airport emergency scenarios.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/OpsDefault.png" alt="Emergency Operations" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {!activeSection && (
        <Section aria-labelledby="field-response">
          <FlexRow>
            <Column $width="48%">
              <SubTitle id="field-response">
                Field Response Procedures and
              </SubTitle>
              <Paragraph>
                Our field operations follow established protocols ensuring rapid, coordinated action. Teams deploy specialized apparatus including ARFF vehicles, hazmat units, rescue equipment, and medical systems. We maintain standardized procedures with flexibility for unique incidents through continuous training.
              </Paragraph>
            </Column>
            <Column $width="48%">
              <SubTitle>
                Tactical Operations Management
              </SubTitle>
              <Paragraph>
                Tactical operations include incident command systems, resource deployment, and coordinated response management. We implement proven protocols ensuring clear authority, effective communication, and optimal resource use. Close coordination with airport operations, air traffic control, and external agencies provides seamless multi-agency response.
              </Paragraph>
            </Column>
          </FlexRow>
        </Section>
      )}

      {!activeSection && (
        <Section aria-labelledby="operational-excellence">
          <SubTitle id="operational-excellence">
            Operational Readiness and Response Team Coordination
          </SubTitle>
          <Paragraph>
            We maintain operational readiness through continuous training, equipment maintenance, and performance evaluation. Teams undergo regular certification, multi-agency exercises, and proficiency training in all specialized areas. Regular inspections, testing, and drills ensure peak capabilities. Our coordination includes resource management, personnel deployment, and tactical support for all emergency activities.
          </Paragraph>
        </Section>
      )}
    </MainContent>
  );
};