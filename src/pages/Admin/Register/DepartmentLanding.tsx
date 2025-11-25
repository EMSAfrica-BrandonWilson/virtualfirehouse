import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';

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
  width: 200px;
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
  width: 200px;
  height: auto;
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 200px;
  height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const DepartmentLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-department', '/images/RegisterYourService.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="dept-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="dept-title">
                Department Registration Overview
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Department registration establishes the foundational organizational structure for emergency services at King Fahd International Airport. This comprehensive system maintains critical information about departmental identity, operational scope, leadership hierarchy, and administrative details essential for coordinated emergency response operations.
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
                  alt="Department Registration" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/RegisterYourService.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  No image available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Core Information Section */}
      <Section aria-labelledby="core-info">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="core-info">
              Department Identity and Structure
            </SubTitle>
            <Paragraph>
              Department registration captures essential organizational details including official department name, type classification, operational jurisdiction, contact information, and organizational hierarchy. This foundational data ensures proper identification and coordination across all airport emergency services and external agencies.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Administrative Framework
            </SubTitle>
            <Paragraph>
              The registration system maintains comprehensive administrative records including department establishment date, governing regulations, accreditation status, and compliance certifications. This framework supports regulatory adherence and provides critical documentation for audits and operational reviews.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Management and Resources Section */}
      <Section aria-labelledby="management-resources">
        <SubTitle id="management-resources">
          Leadership and Resource Management
        </SubTitle>
        <Paragraph>
          Department registration establishes leadership accountability through detailed records of department heads, operational commanders, and administrative contacts. The system integrates with personnel, equipment, and station registrations to provide comprehensive visibility into departmental capabilities, resource allocation, and operational readiness for effective emergency response coordination.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
