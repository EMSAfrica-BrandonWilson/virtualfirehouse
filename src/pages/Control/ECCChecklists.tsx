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

export const ECCChecklists: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('ecc-checklists', '/images/ControlRoom.png');
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="checklists-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="checklists-title">
                ECC Checklists
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The ECC Checklists library provides comprehensive procedural guides and verification tools for all Emergency Control Centre operations, ensuring systematic completion of critical tasks and standardized execution of operational procedures. These structured checklists cover shift handovers, equipment checks, system verifications, emergency protocols, quality assurance procedures, and special operations, supporting consistent performance, error prevention, and regulatory compliance throughout all emergency control centre activities.
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
                  alt="ECC Checklists" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/ControlRoom.png';
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

      {/* Checklist Categories Section */}
      <Section aria-labelledby="checklist-categories">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="checklist-categories">
              Operational Checklists
            </SubTitle>
            <Paragraph>
              Operational checklists encompass daily opening procedures, shift change protocols, system status verifications, equipment functionality checks, communication system tests, and routine operational tasks, ensuring all critical systems and processes are verified and documented at prescribed intervals.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Emergency Response Checklists
            </SubTitle>
            <Paragraph>
              Emergency response checklists guide personnel through specific incident types including aircraft emergencies, hazardous materials incidents, medical emergencies, security events, and major disasters, ensuring comprehensive, consistent response actions and coordination procedures for each scenario.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Quality Assurance Section */}
      <Section aria-labelledby="quality-assurance">
        <SubTitle id="quality-assurance">
          Quality Assurance and Continuous Improvement
        </SubTitle>
        <Paragraph>
          ECC Checklists undergo regular review and refinement based on operational experience, regulatory changes, technological updates, and lessons learned from exercises and actual incidents. Systematic checklist utilization supports quality assurance, standardization, training consistency, and evidence-based operational improvement while ensuring all personnel follow established best practices for emergency control centre operations.
        </Paragraph>
      </Section>
    </MainContent>
  );
};