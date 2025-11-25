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

export const AdminHumanResources: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('human-resources', '/images/HR.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="hr-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="hr-title">
                Human Resources Section
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Human Resources Section provides comprehensive workforce management and personnel administration for all emergency service operations at King Fahd International Airport. We manage recruitment, employee development, performance management, organizational structure, training coordination, compensation administration, and employee relations while ensuring compliance with employment regulations and industry standards.
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
                  alt="Human Resources" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/HR.png';
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

      {/* HR Functions Section */}
      <Section aria-labelledby="hr-functions">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="hr-functions">
              Personnel Management
            </SubTitle>
            <Paragraph>
              Our personnel management systems include employee record keeping, performance evaluations, career development, and professional growth initiatives. We manage recruitment from position analysis through onboarding, maintain organizational charts and job descriptions, and coordinate with department heads to ensure optimal staffing levels and operational effectiveness.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Organizational Development
            </SubTitle>
            <Paragraph>
              Our organizational development function focuses on workforce optimization, succession planning, and efficiency improvements. We analyze effectiveness, implement enhancement initiatives, and manage shift scheduling and workforce deployment to ensure operational readiness. We also oversee compensation, benefits, and employee relations programs that support workforce satisfaction and retention.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Workforce Excellence Section */}
      <Section aria-labelledby="workforce-excellence">
        <SubTitle id="workforce-excellence">
          Workforce Development and Employee Relations
        </SubTitle>
        <Paragraph>
          We maintain workforce development programs supporting professional growth, skill enhancement, and career advancement. Our employee relations initiatives promote positive workplace culture, effective communication, and teamwork. We manage grievance procedures, conflict resolution, and workplace safety to create a professional environment. Our HR systems include performance management, recognition programs, and development planning that align individual growth with organizational objectives, ensuring our organization maintains a qualified, motivated workforce to deliver exceptional emergency services.
        </Paragraph>
      </Section>
    </MainContent>
  );
};