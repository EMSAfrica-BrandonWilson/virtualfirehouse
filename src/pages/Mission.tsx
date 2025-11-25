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

export const Mission: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('mission', '/images/EMSA-Mission.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="mission-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="mission-title">
                Our Mission Statement
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Fire Department is committed to providing the highest level of public 
                safety services for our community. We safely protect lives and property 
                while maintaining the highest standards of professional excellence.
              </Paragraph>
              <Paragraph>
                Our mission is to serve King Fahd International Airport and the surrounding 
                community by providing comprehensive emergency services including aircraft 
                rescue and firefighting, hazardous materials response, emergency medical 
                services, and fire prevention programs.
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
                  alt="Mission Statement" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-Mission.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <SubTitle>
            Core Mission Elements:
          </SubTitle>
          <ul style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
            <li><strong>Emergency Response:</strong> Rapid response to aircraft emergencies, fires, and hazardous material incidents</li>
            <li><strong>Life Safety:</strong> Protection of passengers, crew, and airport personnel</li>
            <li><strong>Property Protection:</strong> Minimizing damage to aircraft and airport infrastructure</li>
            <li><strong>Training Excellence:</strong> Continuous education and skill development for all personnel</li>
            <li><strong>Community Service:</strong> Supporting the broader airport community through prevention and education</li>
          </ul>
          <Paragraph>
            We are committed to maintaining operational readiness through rigorous training programs, 
            state-of-the-art equipment, and adherence to international aviation safety standards. 
            Our mission extends beyond emergency response to include proactive safety measures, 
            community education, and collaboration with airport stakeholders.
          </Paragraph>
        </div>
      </Section>
    </MainContent>
  );
};