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

const ChartHeader = styled.h3`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin: 30px 0 20px 0;
  text-align: center;
`;

const ChartImageContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
`;

const ChartImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const HRManagementStructure: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="management-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="management-title">
                Management Structure
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Management Structure defines the hierarchical organization and leadership framework for all emergency service operations at King Fahd International Airport. Our management structure establishes clear lines of authority, accountability, and communication that ensure effective coordination and decision-making across all emergency service divisions. The hierarchy encompasses executive leadership, department heads, supervisory personnel, and operational staff, each with clearly defined roles, responsibilities, and reporting relationships that support effective emergency service delivery and organizational performance.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage 
                src="/images/HR-Executive-Team.png" 
                alt="Management Structure" 
              />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Organizational Chart Section */}
      <Section>
        <ChartImageContainer>
          <ChartImage 
            src="/images/ManStructure.png" 
            alt="Fire Rescue Services Management Structure" 
          />
        </ChartImageContainer>
      </Section>
    </MainContent>
  );
};