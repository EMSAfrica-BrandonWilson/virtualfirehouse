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

export const DailyDutyRostering: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('daily-duty-rostering', '/images/ControlRoom.png');
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="rostering-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="rostering-title">
                Daily Duty Rostering
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Daily Duty Rostering system manages the assignment and scheduling of Emergency Personnel across all operational shifts, ensuring appropriate staffing levels, qualification coverage, and workload distribution. This comprehensive scheduling platform coordinates dispatcher assignments, supervisor coverage, specialist availability, and training requirements while accommodating leave, certifications, and operational demands to maintain continuous 24/7 emergency response capability.
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
                  alt="Daily Duty Rostering" 
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

      {/* Roster Management Section */}
      <Section aria-labelledby="roster-management">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="roster-management">
              Shift Scheduling and Coverage
            </SubTitle>
            <Paragraph>
              Roster management encompasses shift cycle planning, personnel rotation, qualification requirements, and workload balancing to ensure optimal staffing across all operational periods, maintaining required competency levels and experience distribution throughout each shift configuration.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Personnel Coordination
            </SubTitle>
            <Paragraph>
              The rostering system coordinates leave approvals, training schedules, qualification renewals, and special assignments while maintaining minimum staffing requirements, ensuring operational capability is never compromised by personnel absences or developmental activities.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Compliance Section */}
      <Section aria-labelledby="compliance-section">
        <SubTitle id="compliance-section">
          Regulatory Compliance and Optimization
        </SubTitle>
        <Paragraph>
          Daily Duty Rostering maintains compliance with aviation regulations, labour requirements, and organizational policies governing work hours, rest periods, qualification currency, and operational readiness while optimizing resource utilization, cost efficiency, and personnel development through strategic scheduling and systematic workforce planning.
        </Paragraph>
      </Section>
    </MainContent>
  );
};