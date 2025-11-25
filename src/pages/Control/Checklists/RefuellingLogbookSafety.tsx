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

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 200px;
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
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  strong {
    color: #856404;
  }
`;

export const RefuellingLogbookSafety: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      <Section>
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title>Safety Verification</Title>
              <Divider />
              <Paragraph>
                The Safety Verification checklist ensures all refuelling operations comply with airport safety regulations and fire prevention protocols. This essential tool guides operators through critical safety steps before, during, and after each refuelling operation to prevent incidents, protect personnel, and maintain environmental safety standards in accordance with ICAO and GACAR requirements.
              </Paragraph>
            </Column>
            <ImageColumn>
              <RefuellingLogbookHeader />
            </ImageColumn>
          </FlexRow>

          <InfoBox>
            <strong>Safety First:</strong> All refuelling operations must be conducted in accordance with airport safety regulations and fire prevention protocols. Complete this checklist before, during, and after each refuelling operation.
          </InfoBox>

          <SubTitle>Safety Verification Checklist</SubTitle>
          
          <ChecklistCard>
            <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify engine is shut off before refuelling
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check for proper grounding during fuel transfer
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Ensure no smoking or open flames in refuelling area
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify fire extinguisher is readily available
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check for fuel leaks or spills during operation
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Confirm proper fuel cap seal after refuelling
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Document spill response actions if applicable
                </ChecklistLabel>
              </ChecklistItem>
            </ChecklistGrid>
          </ChecklistCard>
        </div>
      </Section>
    </MainContent>
  );
};