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

export const AboutUs: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('about-us', '/images/EMSA-AboutUs.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="about-us-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="about-us-title">
                About Us
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Fire Department is committed to providing the highest level of customer 
                service and resources to our community and members. We save lives and protect 
                property through professional emergency services, fire prevention programs, 
                and public education initiatives.
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
                  alt="About Us" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-AboutUs.png';
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
                  Department History:
                </SubTitle>
                <Paragraph>
                  King Fahd International Airport's firefighting services were established 
                  to meet the specific challenges of airport emergency response. Our department 
                  has evolved from a basic firefighting unit to a comprehensive emergency 
                  services organization capable of handling complex aviation incidents.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Our Team:
                </SubTitle>
                <Paragraph>
                  Our highly trained personnel include certified Aircraft Rescue and Firefighting 
                  (ARFF) technicians, emergency medical technicians, hazardous materials 
                  specialists, and fire prevention officers. Each team member undergoes 
                  rigorous training and maintains current certifications in their specialized areas.
                </Paragraph>
              </ContentBox>
            </LeftColumn>

            <RightColumn>
              <ContentBox>
                <SubTitle>
                  Service Area:
                </SubTitle>
                <Paragraph>
                  We provide comprehensive emergency services to King Fahd International Airport, 
                  covering over 780 square kilometers of airport property including runways, 
                  taxiways, terminal buildings, cargo areas, and support facilities. Our 
                  strategic station locations ensure rapid response times to any location 
                  within the airport complex.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Community Commitment:
                </SubTitle>
                <Paragraph>
                  Beyond emergency response, we are committed to serving our airport community 
                  through fire prevention education, safety inspections, and collaborative 
                  partnerships with airlines, ground handling companies, and other airport 
                  stakeholders.
                </Paragraph>
              </ContentBox>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>
    </MainContent>
  );
};