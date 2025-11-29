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

export const Home: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('home', '/images/EMSA-Home.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="home-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="home-title">
                Home: Airport Rescue & FireFighting
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Southern African Fire Emergency Rescue Services (SAFER Services) is a virtual concept by Brandon Wilson promoting open information sharing and an efficient Emergency Management Service. The content reflects Brandon's lifelong knowledge and experience and is intended for demonstration purposes only.
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
                  alt="EMS Africa Logo" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-Home.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* About Fire Brigades Section */}
      <Section aria-labelledby="about-fire-brigades">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="about-fire-brigades">
              About Fire Brigades, Fire Departments and Fire Services
            </SubTitle>
            <Paragraph>
              A Fire Brigade, Fire Department, or Fire Service (used interchangeably) is a public or private organization providing fire protection for municipalities or districts, staffed by career firefighters, volunteers, or both. The first fire department originated in ancient Rome, where firefighters patrolled with authority to enforce fire codes. Insurance companies later formed fire departments in the 18th century.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              ...
            </SubTitle>
            <Paragraph>
              Benjamin Franklin, considered the father of fire departments in Western culture, established the Union Volunteer Fire Company in Philadelphia in 1736. Boston created America's first publicly funded fire department in 1679. By the late 19th century, central command became essential as competing fire companies would dispute over uninsured properties, leading to devastating fires and loss of life.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Jurisdiction Section */}
      <Section aria-labelledby="about-jurisdiction">
        <SubTitle id="about-jurisdiction">
          About the Emergency Service's Jurisdiction
        </SubTitle>
        <Paragraph>
          Emergency services jurisdictions are controlled by governmental bodies such as municipalities, provinces, or state departments, with private departments also designated as fire services. Municipal control is most common, managing fire station placement, equipment, and personnel. Fire departments conduct periodic surveys to optimize resource deployment and ensure proper coverage, strategically positioning stations and apparatus for rapid dispatcher response to incidents.
        </Paragraph>
      </Section>
    </MainContent>
  );
};