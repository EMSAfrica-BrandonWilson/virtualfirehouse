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
  { name: 'Fire By Laws', slug: 'fire-by-laws' },
  { name: 'Fire Codes', slug: 'fire-codes' },
  { name: 'Fire Publications', slug: 'fire-publications' },
  { name: 'Health and Safety', slug: 'health-and-safety' },
  { name: 'Hot Work Permits', slug: 'hot-work-permits' },
  { name: 'Incident Investigations', slug: 'incident-investigations' },
  { name: 'Occupancy Inspections', slug: 'occupancy-inspections' },
  { name: 'PIER Education', slug: 'pier-education' },
];

export const FireSafetyLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="fire-safety-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="fire-safety-title">
                {activeSection ? activeSection.name : 'Fire and Life Safety'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  <>This is the landing page for {activeSection.name}. Use the left-hand sub menu to navigate within this section.</>
                ) : (
                  <>The Fire and Life Safety division provides proactive fire prevention, life safety education, and safety program management at King Fahd International Airport through building inspections, code enforcement, and community education initiatives. Our safety programs include fire prevention planning, building assessments, educational outreach, and compliance oversight to ensure all facilities meet international aviation safety standards.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/FireSafety.jpg" alt="Fire and Life Safety" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {!activeSection && (
        <Section aria-labelledby="prevention-programs">
          <FlexRow>
            <Column $width="48%">
              <SubTitle id="prevention-programs">
                Fire Prevention Programs and
              </SubTitle>
              <Paragraph>
                Our fire prevention programs include building inspections, code enforcement, hazard identification, and safety system evaluations. We conduct regular facility inspections and work with tenants, contractors, and managers to identify hazards and implement mitigation measures.
              </Paragraph>
            </Column>
            <Column $width="48%">
              <SubTitle>
                Life Safety Education
              </SubTitle>
              <Paragraph>
                Our life safety education provides training programs and awareness initiatives for airport personnel and the public, covering fire prevention, emergency procedures, evacuation protocols, and hazard recognition through seminars, workshops, and awareness campaigns.
              </Paragraph>
            </Column>
          </FlexRow>
        </Section>
      )}

      {!activeSection && (
        <Section aria-labelledby="safety-excellence">
          <SubTitle id="safety-excellence">
            Risk Assessment and Community Safety Programs
          </SubTitle>
          <Paragraph>
            We conduct comprehensive risk assessments including facility evaluations, hazard analysis, fire load assessments, and emergency egress reviews. Our community safety programs extend beyond airport boundaries, providing fire safety education and emergency preparedness training to local communities and airport partners.
          </Paragraph>
        </Section>
      )}
    </MainContent>
  );
};