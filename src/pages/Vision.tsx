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

export const Vision: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('vision', '/images/EMSA-Vision.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="vision-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="vision-title">
                Vision
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Our vision is to be recognised as the premier Airport Rescue and Firefighting Service 
                in the Kingdom of Saudi Arabia. We strive to set the standard for emergency response 
                excellence at King Fahd International Airport through our commitment to continuous 
                improvement, innovation, and professional development.
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
                  alt="Vision Statement" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-Vision.png';
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
            Vision Statement
          </SubTitle>
          <Paragraph>
            We envision a department where highly trained professionals utilise cutting-edge 
            technology and proven methodologies to ensure the safety of all aircraft passengers, 
            crew members, and airport personnel. Our vision encompasses not only emergency response 
            capabilities but also proactive fire prevention and safety education initiatives.
          </Paragraph>
          <Paragraph>
            Through our comprehensive approach to emergency preparedness, we aim to maintain the 
            highest levels of operational readiness while fostering a culture of continuous learning 
            and improvement. Our vision includes the development of strategic partnerships with 
            international aviation safety organisations and the adoption of best practices from 
            leading airports worldwide.
          </Paragraph>
        </div>
      </Section>
    </MainContent>
  );
};