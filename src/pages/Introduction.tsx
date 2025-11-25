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

export const Introduction: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('introduction', '/images/EMSA-Introduction.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="introduction-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="introduction-title">
                Introduction
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Welcome to the King Fahd International Airport Rescue and Firefighting Services. 
                This comprehensive system serves as the central hub for all emergency response 
                operations at one of the world's largest airports.
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
                  alt="Introduction" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/EMSA-Introduction.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <Paragraph>
            King Fahd International Airport (KFIA) spans over 780 square kilometers and 
            serves millions of passengers annually. Our Airport Rescue and Firefighting (ARFF) 
            services are designed to meet and exceed international aviation safety standards, 
            ensuring the highest level of protection for all airport users.
          </Paragraph>
          <SubTitle>
            Key Responsibilities:
          </SubTitle>
          <ul style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
            <li>Aircraft emergency response and firefighting operations</li>
            <li>Hazardous materials incident management</li>
            <li>Emergency medical services and rescue operations</li>
            <li>Fire prevention and safety inspections</li>
            <li>Training and education programs</li>
            <li>Equipment maintenance and readiness</li>
          </ul>
          <Paragraph>
            Our department operates under the highest international standards, including 
            ICAO Annex 14 requirements and local aviation authority regulations. We maintain 
            a state-of-the-art fleet of specialized firefighting vehicles and equipment, 
            staffed by highly trained and certified personnel.
          </Paragraph>
          <Paragraph>
            The strategic location of King Fahd International Airport positions us as a critical 
            component of the Kingdom's aviation infrastructure. Our commitment to excellence 
            ensures that we remain prepared to respond to any emergency situation with speed, 
            professionalism, and effectiveness.
          </Paragraph>
        </div>
      </Section>
    </MainContent>
  );
};