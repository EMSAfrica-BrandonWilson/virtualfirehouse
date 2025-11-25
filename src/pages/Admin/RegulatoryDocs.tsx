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

export const AdminRegulatoryDocs: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('regulatory-docs', '/images/Rules1.png');
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="regulatory-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="regulatory-title">
                Regulatory Documents
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Regulatory Documents section provides comprehensive access to ICAO standards, GACAR regulations, local requirements, and industry best practices governing emergency service operations at King Fahd International Airport. Our document management system maintains current versions of all applicable regulations, standards, compliance documentation, and industry guidelines, while tracking regulatory changes that impact operational procedures to ensure ongoing compliance and operational excellence.
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
                  alt="Regulatory Documents" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    e.currentTarget.src = '/images/Rules1.png';
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

      {/* Document Categories Section */}
      <Section aria-labelledby="document-categories">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="document-categories">
              International Standards
            </SubTitle>
            <Paragraph>
              Our international standards collection includes ICAO Annex 14, ICAO Document 9137 Airport Services Manual, and relevant publications establishing global standards for airport emergency services. We maintain current editions, monitor updates, and provide implementation guidance, best practices, and compliance checklists with regular briefings on regulatory changes and operational implications.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              National and Local Regulations
            </SubTitle>
            <Paragraph>
              This section encompasses GACAR Part 139 and Part 5 provisions, Saudi aviation regulations, local ordinances, and regional standards governing emergency operations. Our compliance tracking system monitors status, provides alerts for updates, and coordinates with regulatory authorities to ensure ongoing compliance and effective communication.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Compliance Management Section */}
      <Section aria-labelledby="compliance-management">
        <SubTitle id="compliance-management">
          Compliance Management and Documentation Control
        </SubTitle>
        <Paragraph>
          The Regulatory Documents section provides comprehensive compliance management and documentation control ensuring adherence to all regulatory requirements. Our system includes regular assessments, audit preparations, corrective action management, detailed compliance records, inspection reports, and certification documentation. Document control procedures ensure personnel access to current regulatory information with proper retirement of outdated documents. Through systematic regulatory document management, compliance monitoring, regulatory training, and staff education, we maintain full compliance with applicable requirements and industry standards.
        </Paragraph>
      </Section>
    </MainContent>
  );
};