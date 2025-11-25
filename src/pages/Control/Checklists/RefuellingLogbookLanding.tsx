import React from 'react';
import styled from 'styled-components';
import RefuellingLogbookHeader from '../../../components/RefuellingLogbookHeader';

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

const InfoBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  strong {
    color: #856404;
  }
`;

const ContentCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const List = styled.ul`
  font-size: 1rem;
  line-height: 1.8;
  margin-left: 20px;
  
  li {
    margin-bottom: 10px;
  }
`;

export const RefuellingLogbookLanding: React.FC = () => {
  
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="refuelling-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="refuelling-title">
                Refuelling Log Book
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Refuelling Log Book is a comprehensive digital management system for tracking all fire appliance refuelling operations at the Emergency Control Centre. This module provides integrated tools for data entry, record management, safety verification, and monthly reconciliation to ensure fuel accountability, regulatory compliance, and operational efficiency across all firefighting vehicles and equipment.
              </Paragraph>
            </Column>

            <ImageColumn>
              <RefuellingLogbookHeader />
            </ImageColumn>
          </FlexRow>

          <SubTitle>Overview</SubTitle>
          <ContentCard>
            <Paragraph>
              The Refuelling Log Book system is a comprehensive digital solution for tracking and managing all fuel-related activities within the Emergency Control Centre. This system provides multiple modules to support efficient fuel management:
            </Paragraph>
            <List>
              <li><strong>Logbook Entry Tool:</strong> Digital form for recording refuelling operations with automatic timestamp and validation</li>
              <li><strong>Logbook Records:</strong> Complete database of all refuelling entries with search, filter, and PDF export capabilities</li>
              <li><strong>Safety Verification:</strong> Essential safety checklist to ensure compliance with safety protocols during refuelling</li>
              <li><strong>Reconciliation Tasks:</strong> Monthly procedures for fuel accounting, discrepancy investigation, and reporting</li>
            </List>
          </ContentCard>

          <SubTitle>Key Features</SubTitle>
          <ContentCard>
            <List>
              <li>Real-time data entry with automated timestamp capture</li>
              <li>Comprehensive vehicle and operator tracking</li>
              <li>Fuel consumption analysis and reporting</li>
              <li>Safety compliance verification</li>
              <li>Monthly reconciliation and audit trails</li>
              <li>PDF report generation for regulatory compliance</li>
              <li>Secure access control and data protection</li>
            </List>
          </ContentCard>

          <SubTitle>Regulatory Compliance</SubTitle>
          <ContentCard>
            <Paragraph>
              This system is designed to meet ICAO Annex 14 requirements and GACAR Part 139 regulations for airport rescue and firefighting services. All records are maintained in accordance with aviation safety standards and environmental protection guidelines.
            </Paragraph>
            <Paragraph>
              Regular audits and reconciliation procedures ensure accurate fuel accounting and help identify potential issues such as fuel discrepancies, equipment malfunctions, or unauthorized usage.
            </Paragraph>
          </ContentCard>
          
        </div>
      </Section>
    </MainContent>
  );
};
