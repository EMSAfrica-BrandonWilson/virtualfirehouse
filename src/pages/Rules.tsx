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

export const Rules: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('rules', '/images/EMSA-Rules.png');

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="rules-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="rules-title">
                Our Rules of Conduct
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The following rules of conduct establish the standards of behavior and 
                performance expected from all members of our Airport Rescue and 
                Firefighting Services.
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
                  alt="Rules of Conduct" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-Rules.png';
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
            Professional Standards:
          </SubTitle>
          <div style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
            <ol>
              <li style={{ marginBottom: '10px' }}>
                <strong>Safety Compliance:</strong> All personnel must strictly adhere to 
                safety protocols and procedures at all times.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Equipment Readiness:</strong> Maintain all equipment in optimal 
                condition and report any deficiencies immediately.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Response Time:</strong> Respond to all emergency calls within 
                established time parameters.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Training Participation:</strong> Attend all required training 
                sessions and maintain current certifications.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Professional Appearance:</strong> Maintain appropriate uniform 
                and grooming standards at all times.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Communication:</strong> Use proper radio protocols and maintain 
                clear, professional communication.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Teamwork:</strong> Support fellow team members and work 
                collaboratively toward common objectives.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Confidentiality:</strong> Respect the confidentiality of 
                sensitive information and incident reports.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Continuous Improvement:</strong> Seek opportunities to enhance 
                skills, knowledge, and departmental operations.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Community Relations:</strong> Maintain positive relationships 
                with airport personnel and the public.
              </li>
            </ol>
          </div>
        </div>
      </Section>
    </MainContent>
  );
};