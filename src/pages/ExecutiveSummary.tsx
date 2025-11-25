import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../hooks/usePageImage';

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

const TwoColumnRow = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const RightColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const Column = styled.div`
  flex: 1;
  min-width: 0;
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

const ContentBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
`;

export const ExecutiveSummary: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('executive-summary', '/images/EMSA-Summary.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="summary-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="summary-title">
                Executive Summary
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The King Fahd International Airport (KFIA) Rescue and Firefighting Services 
                represents a world-class emergency response organization dedicated to protecting 
                lives and property within one of the world's largest airport complexes.
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
                  alt="Executive Summary" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-Summary.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>

          <TwoColumnRow>
            <LeftColumn>
              <ContentBox>
                <SubTitle>
                  Organizational Overview:
                </SubTitle>
                <Paragraph>
                  Our department operates 24/7/365 with specialized teams trained in aircraft 
                  rescue and firefighting (ARFF), hazardous materials response, emergency medical 
                  services, and fire prevention. We maintain strategic response stations throughout 
                  the airport to ensure compliance with ICAO response time requirements.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Key Performance Indicators:
                </SubTitle>
                <ul style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <li>Response time: Target 3 minutes to any point on airport</li>
                  <li>Personnel: Fully certified ARFF technicians and officers</li>
                  <li>Equipment: Modern fleet of specialized firefighting apparatus</li>
                  <li>Training: Continuous education and simulation exercises</li>
                  <li>Compliance: Meeting all international aviation safety standards</li>
                </ul>
              </ContentBox>
            </LeftColumn>

            <RightColumn>
              <ContentBox>
                <SubTitle>
                  Strategic Objectives:
                </SubTitle>
                <Paragraph>
                  Our strategic focus centers on maintaining operational readiness, advancing 
                  technological capabilities, enhancing personnel training, and strengthening 
                  partnerships with airport stakeholders and external emergency services.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Future Initiatives:
                </SubTitle>
                <Paragraph>
                  Looking ahead, we are committed to implementing advanced emergency response 
                  technologies, expanding our training facilities, and developing innovative 
                  approaches to airport safety and security management.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  International Standards:
                </SubTitle>
                <Paragraph>
                  We maintain strict adherence to ICAO Annex 14 requirements, NFPA standards, 
                  and other internationally recognized aviation firefighting protocols to ensure 
                  the highest level of safety and operational effectiveness.
                </Paragraph>
              </ContentBox>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>
    </MainContent>
  );
};