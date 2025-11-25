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

export const AdminRegister: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register', '/images/RegisterYourService.png');
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="register-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="register-title">
                Register Your Service
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Service Registration system provides a comprehensive platform for registering and managing emergency service assets, personnel, equipment, and operational capabilities within the King Fahd International Airport emergency services framework. This centralized system maintains detailed records of departmental capabilities, personnel qualifications, equipment specifications, and operational readiness status to support strategic planning, resource allocation, and regulatory compliance.
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
                  alt="Service Registration" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    e.currentTarget.src = '/images/EMSA-Introduction.png';
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

      {/* Registration Categories Section */}
      <Section aria-labelledby="registration-categories">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="registration-categories">
              Service Registration Categories and
            </SubTitle>
            <Paragraph>
              The registration system encompasses multiple categories including department, personnel, equipment, vehicle, and facility registration, each maintaining specific data fields and requirements relevant to that asset type for comprehensive service management.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Documentation Standards
            </SubTitle>
            <Paragraph>
              All registrations follow standardized documentation protocols that ensure consistency, accuracy, and compliance with aviation industry standards, covering specifications, maintenance schedules, inspection records, and operational status across all asset types.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Management System Section */}
      <Section aria-labelledby="management-system">
        <SubTitle id="management-system">
          Registration Management and Data Integrity
        </SubTitle>
        <Paragraph>
          The Service Registration system provides comprehensive management capabilities with automated validation procedures, data integrity checks, and audit trails that ensure accurate, up-to-date records of all emergency service assets and personnel while supporting operational planning, regulatory compliance, and resource optimization.
        </Paragraph>
      </Section>
    </MainContent>
  );
};