import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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



export const FDWay: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('fd-way', '/images/EMSA-TheFDWay.png');
  


  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="fd-way-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="fd-way-title">
                The FD-Way
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                "The FD-Way" represents our department's fundamental approach to emergency 
                services, embodying the principles, values, and methodologies that guide 
                every aspect of our operations.
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
                  alt="The FD-Way" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-TheFDWay.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>

          <SubTitle style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
            Our Core Principles:
          </SubTitle>

          <TwoColumnRow>
            <LeftColumn>
              <ContentBox>
                <div style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <h3 style={{ color: '#1177BB', marginBottom: '10px' }}>1. Safety First</h3>
                  <Paragraph>
                    Every decision and action prioritizes the safety of our personnel, 
                    passengers, crew, and airport community.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>2. Professional Excellence</h3>
                  <Paragraph>
                    We maintain the highest standards of training, equipment, and performance 
                    in all emergency response activities.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>3. Rapid Response</h3>
                  <Paragraph>
                    Time is critical in emergency situations. We are committed to achieving 
                    optimal response times through strategic positioning and continuous readiness.
                  </Paragraph>
                </div>
              </ContentBox>
            </LeftColumn>

            <RightColumn>
              <ContentBox>
                <div style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <h3 style={{ color: '#1177BB', marginBottom: '10px' }}>4. Continuous Improvement</h3>
                  <Paragraph>
                    We regularly evaluate our procedures, training, and equipment to identify 
                    opportunities for enhancement and innovation.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>5. Community Service</h3>
                  <Paragraph>
                    Beyond emergency response, we serve our community through education, 
                    prevention programs, and collaborative partnerships.
                  </Paragraph>
                </div>
              </ContentBox>
            </RightColumn>
          </TwoColumnRow>

          <SubTitle style={{ marginTop: '30px' }}>
            Implementation:
          </SubTitle>
          <Paragraph>
            These principles are integrated into every aspect of our operations, from 
            daily training exercises to emergency response protocols, ensuring consistent 
            application of the FD-Way across all our activities.
          </Paragraph>
        </div>
      </Section>


    </MainContent>
  );
};