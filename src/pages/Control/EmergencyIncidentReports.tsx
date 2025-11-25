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

export const EmergencyIncidentReports: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('emergency-incident-reports', '/images/ControlRoom.png');
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="reports-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="reports-title">
                Emergency Incident Reports
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Emergency Incident Reports system generates comprehensive analytical reports from incident data, providing detailed documentation of emergency operations, response performance, and operational outcomes. These formal reports synthesize incident information, response actions, resource utilization, and lessons learned into structured documents that support regulatory compliance, organizational accountability, performance assessment, and operational improvement while maintaining detailed historical records of emergency service delivery at KFIA.
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
                  alt="Emergency Incident Reports" 
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

      {/* Report Types Section */}
      <Section aria-labelledby="report-types">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="report-types">
              Report Categories and Formats
            </SubTitle>
            <Paragraph>
              The reporting system generates multiple report types including operational incident reports, statistical summaries, trend analyses, performance metrics, and regulatory submissions, each formatted according to specific requirements and serving distinct organizational, operational, or compliance purposes.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Analysis and Insights
            </SubTitle>
            <Paragraph>
              Reports incorporate analytical elements including response time analysis, resource efficiency assessment, outcome evaluation, and pattern identification, transforming raw incident data into actionable intelligence that supports strategic planning, training development, and operational enhancement.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Distribution Section */}
      <Section aria-labelledby="distribution-section">
        <SubTitle id="distribution-section">
          Report Distribution and Utilization
        </SubTitle>
        <Paragraph>
          Emergency Incident Reports are distributed to relevant stakeholders including emergency services leadership, airport management, regulatory authorities, and external agencies as required. These reports inform decision-making, support continuous improvement initiatives, demonstrate regulatory compliance, and provide evidence-based documentation of emergency service performance and organizational effectiveness.
        </Paragraph>
      </Section>
    </MainContent>
  );
};