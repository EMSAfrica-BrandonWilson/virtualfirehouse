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

export const DailyOccurrenceBook: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('daily-occurrence-book', '/images/ControlRoom.png');
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="occurrence-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="occurrence-title">
                Electronic Daily Occurrence Book (eDOB)
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Daily Occurrence Book serves as the official record of all events, activities, and incidents occurring within the Emergency Control Centre during each operational shift. This comprehensive documentation system maintains chronological records of emergency calls, dispatch activities, unit status changes, facility issues, and significant events, ensuring complete accountability and providing critical reference information for operational review, incident analysis, and regulatory compliance.
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
                  alt="Daily Occurrence Book" 
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

      {/* Documentation Standards Section */}
      <Section aria-labelledby="documentation-standards">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="documentation-standards">
              Recording Standards and Protocols
            </SubTitle>
            <Paragraph>
              All entries follow standardized recording protocols that capture essential information including date, time, personnel on duty, incident details, actions taken, and outcomes, ensuring consistency and completeness in documentation across all shifts and operational scenarios.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Operational Continuity
            </SubTitle>
            <Paragraph>
              The eDOB facilitates seamless shift transitions by providing incoming personnel with comprehensive situational awareness of ongoing incidents, pending actions, facility status, and operational issues requiring attention, maintaining operational continuity throughout 24/7 operations.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Record Management Section */}
      <Section aria-labelledby="record-management">
        <SubTitle id="record-management">
          Record Management and Compliance
        </SubTitle>
        <Paragraph>
          Daily Occurrence Book entries are maintained according to regulatory requirements and organizational policies, with systematic archiving procedures, secure storage protocols, and controlled access ensuring the integrity, availability, and confidentiality of operational records for investigations, audits, trend analysis, and compliance verification.
        </Paragraph>
      </Section>
    </MainContent>
  );
};