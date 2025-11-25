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

const ChecklistCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChecklistItem = styled.div`
  padding: 10px 0;
`;

const ChecklistLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  
  input {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border: 1px solid #1177BB;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  strong {
    color: #0f5c99;
  }
`;

export const RefuellingLogbookReconciliation: React.FC = () => {

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="reconciliation-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="reconciliation-title">
                Reconciliation Tasks
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Reconciliation Tasks module provides a systematic approach to monthly fuel accounting and audit procedures. This essential process ensures accurate fuel consumption tracking, identifies discrepancies, validates pump readings against log entries, and generates comprehensive reports for regulatory compliance and financial accountability across all firefighting operations.
              </Paragraph>
            </Column>
            <ImageColumn>
              <RefuellingLogbookHeader />
            </ImageColumn>
          </FlexRow>

          <InfoBox>
            <strong>Monthly Requirement:</strong> Complete these reconciliation tasks at the end of each month to ensure accurate fuel accounting, identify discrepancies, and maintain compliance with regulatory requirements.
          </InfoBox>

          <SubTitle id="monthly-tasks">Monthly Reconciliation Tasks</SubTitle>
          
          <ChecklistCard role="group" aria-labelledby="monthly-tasks">
            <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Calculate total fuel consumed per vehicle
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Reconcile fuel pump readings with log book entries
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Review fuel efficiency and consumption trends
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Submit monthly fuel usage report to administration
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Archive previous month's log book records
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Investigate and document any fuel discrepancies
                </ChecklistLabel>
              </ChecklistItem>
            </ChecklistGrid>
          </ChecklistCard>
        </div>
      </Section>
    </MainContent>
  );
};