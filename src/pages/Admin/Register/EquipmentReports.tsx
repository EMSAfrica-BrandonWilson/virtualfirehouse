import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
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

const HeaderImage = styled.img`
  width: 171px;
  height: auto;
  max-width: 171px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 171px;
  height: 122px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border: 2px solid #1177BB;
  border-radius: 8px;
  padding: 30px;
  margin-top: 20px;
  text-align: center;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.6;
`;

export const EquipmentReports: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-equipment', '/images/Equipment.png');
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="equipment-reports-title">
        <FlexRow>
          <Column style={{ flex: '1', minWidth: '0' }}>
            <Title id="equipment-reports-title">Equipment Reports</Title>
            <Divider aria-hidden="true" />
            <Paragraph>
              The Equipment Reports page centralizes analytical views of registered firefighting and emergency response equipment at KFIA-ARFF. It provides summaries of asset inventories, condition and readiness, maintenance schedules and upcoming service windows. Use these insights to identify trends, plan procurement and prioritize maintenance work orders. Export-ready layouts enable sharing with leadership and audit teams for oversight and compliance.
            </Paragraph>
          </Column>
          <ImageColumn>
            {imageLoading ? (
              <ImagePlaceholder>Loading image...</ImagePlaceholder>
            ) : imageUrl ? (
              <HeaderImage
                src={imageUrl}
                alt="Equipment Reports"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  (e.target as HTMLImageElement).src = '/images/FireEngine.png';
                }}
              />
            ) : (
              <ImagePlaceholder>{imageError || 'No image available'}</ImagePlaceholder>
            )}
          </ImageColumn>
        </FlexRow>
      </Section>
      <InfoBox>
        <InfoText>
          This section will display comprehensive reports of all registered emergency equipment including tool specifications, maintenance schedules, calibration records, and operational assignments.
        </InfoText>
        <InfoText>
          Reports functionality will be implemented to provide detailed views, export capabilities, and analytics for equipment registrations.
        </InfoText>
      </InfoBox>
    </MainContent>
  );
};
