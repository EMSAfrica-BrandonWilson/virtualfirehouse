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

export const ShiftSystemsLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register-shift-systems', '/images/ShiftSchedule.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="shift-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="shift-title">
                Shift Systems Registration
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Shift systems registration establishes and maintains comprehensive 24/7 operational schedules for all emergency services personnel at King Fahd International Airport. This critical system defines shift patterns, rotation schedules, minimum staffing requirements, and emergency recall procedures to ensure continuous operational coverage and regulatory compliance with ICAO and GACAR standards.
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
                  alt="Shift Systems Registration" 
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

      {/* Shift Pattern Configuration Section */}
      <Section aria-labelledby="shift-patterns">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="shift-patterns">
              Shift Pattern Configuration
            </SubTitle>
            <Paragraph>
              Shift systems registration defines operational shift patterns including duration, start times, rotation cycles, and duty periods. The system accommodates various shift models such as 24/48 schedules, rotating shifts, and specialized assignments to optimize personnel coverage while maintaining work-life balance and preventing fatigue in compliance with labor regulations.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Staffing Requirements and Allocations
            </SubTitle>
            <Paragraph>
              The registration system establishes minimum staffing levels by shift, station, and operational role to ensure adequate emergency response capabilities at all times. It maintains detailed records of personnel assignments, specialized qualifications, and backup coverage to support operational readiness and regulatory compliance requirements.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Coverage and Coordination Section */}
      <Section aria-labelledby="coverage-coordination">
        <SubTitle id="coverage-coordination">
          Continuous Coverage and Emergency Response Coordination
        </SubTitle>
        <Paragraph>
          Shift systems registration integrates with personnel management and station operations to provide real-time visibility into workforce deployment and availability. The system supports emergency recall procedures, overtime management, leave coordination, and shift swaps while maintaining comprehensive audit trails. Automated scheduling algorithms optimize personnel assignments to ensure maximum operational efficiency and continuous coverage across all King Fahd International Airport emergency services facilities.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
