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
  { name: 'Training Programmes', slug: 'training-programmes' },
  { name: 'Training Courses', slug: 'training-courses' },
  { name: 'Practical Examinations', slug: 'practical-examinations' },
  { name: 'Theoratical Examinations', slug: 'theoratical-examinations' },
];

export const TrainingLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="training-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="training-title">
                {activeSection ? activeSection.name : 'Training and Development'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  <>This is the landing page for {activeSection.name}. Use the left-hand sub menu to navigate within this section.</>
                ) : (
                  <>The Training and Development division provides professional development, certification programs, and continuing education for all emergency service personnel at King Fahd International Airport, ensuring the highest competency and emergency response capabilities. Our curriculum includes initial certification, recurrent training, specialized skills development, leadership training, and advancement programs, delivered through state-of-the-art facilities and simulation equipment.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/FireTraining.png" alt="Training and Development" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {!activeSection && (
        <Section aria-labelledby="professional-development">
          <FlexRow>
            <Column $width="48%">
              <SubTitle id="professional-development">
                Professional Development Programs and
              </SubTitle>
              <Paragraph>
                Our programs cover aircraft rescue and firefighting, hazardous materials response, emergency medical services, and technical rescue operations. We provide initial and recurrent training meeting industry standards and regulatory requirements, incorporating the latest emergency response techniques through theoretical, practical, and scenario-based exercises.
              </Paragraph>
            </Column>
            <Column $width="48%">
              <SubTitle>
                Certification and Skills Training
              </SubTitle>
              <Paragraph>
                We focus on maintaining certifications and developing specialized competencies through accredited programs coordinated with recognized certification bodies and educational institutions. Skills training covers equipment operation, tactical procedures, safety protocols, and emergency response techniques, including cross-training for operational flexibility. All programs include performance evaluations and competency assessments.
              </Paragraph>
            </Column>
          </FlexRow>
        </Section>
      )}

      {!activeSection && (
        <Section aria-labelledby="career-advancement">
          <SubTitle id="career-advancement">
            Leadership Development and Career Advancement Resources
          </SubTitle>
          <Paragraph>
            We provide leadership development and career advancement resources supporting professional growth and organizational excellence. Programs develop supervisory skills, management capabilities, and strategic thinking through continuing education, workshops, and career counseling. Resources include specialized courses, conferences, and professional networks, with partnerships providing advanced learning opportunities. Our comprehensive approach ensures personnel have the knowledge, skills, and leadership capabilities to excel and contribute to exceptional emergency services at King Fahd International Airport.
          </Paragraph>
        </Section>
      )}
    </MainContent>
  );
};