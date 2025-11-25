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

export const Philosophy: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('philosophy', '/images/EMSA-Philosophy.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="philosophy-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="philosophy-title">
                Philosophy and Culture
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Our department's philosophy centers on the belief that every life is precious 
                and worthy of our best efforts. This fundamental principle shapes our culture 
                and guides our daily operations.
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
                  alt="Philosophy and Culture" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-Philosophy.png';
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
            Cultural Values:
          </SubTitle>

          <TwoColumnRow>
            <LeftColumn>
              <ContentBox>
                <div style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <h3 style={{ color: '#1177BB', marginBottom: '10px' }}>Integrity</h3>
                  <Paragraph>
                    We conduct ourselves with honesty, transparency, and ethical behavior 
                    in all interactions and decisions.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>Respect</h3>
                  <Paragraph>
                    We treat all individuals with dignity and respect, recognizing the value 
                    of diversity and different perspectives.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>Teamwork</h3>
                  <Paragraph>
                    Emergency response requires seamless coordination. We function as one 
                    unified team, supporting each other and working toward common goals.
                  </Paragraph>
                </div>
              </ContentBox>
            </LeftColumn>

            <RightColumn>
              <ContentBox>
                <div style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <h3 style={{ color: '#1177BB', marginBottom: '10px' }}>Innovation</h3>
                  <Paragraph>
                    We embrace new technologies, methods, and ideas that enhance our 
                    capability to serve and protect our community.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>Accountability</h3>
                  <Paragraph>
                    We take responsibility for our actions and decisions, continuously 
                    striving to meet and exceed established standards and expectations.
                  </Paragraph>
                  
                  <h3 style={{ color: '#1177BB', marginBottom: '10px', marginTop: '25px' }}>Excellence</h3>
                  <Paragraph>
                    We are committed to achieving the highest standards in all our endeavors, 
                    from emergency response to community service, through dedication, 
                    professionalism, and continuous learning.
                  </Paragraph>
                </div>
              </ContentBox>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>
    </MainContent>
  );
};