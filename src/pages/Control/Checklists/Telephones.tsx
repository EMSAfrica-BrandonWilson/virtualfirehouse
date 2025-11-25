import React from 'react';
import styled from 'styled-components';

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

const ChecklistCard = styled.div`
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
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

export const Telephones: React.FC = () => {
  const imageUrl = '/images/EMSA-Telephone.png';
  
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="telephones-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="telephones-title">
                Telephones Checklist
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                This checklist ensures all telephone communication systems at the Emergency Control Centre are operational and properly configured for emergency communications. Regular verification maintains reliable landline and VoIP systems essential for coordinated emergency response and external agency communications.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage 
                src={imageUrl} 
                alt="Telephones" 
              />
            </ImageColumn>
          </FlexRow>

          <div style={{ marginTop: '30px' }}>
            <SubTitle>Daily System Check:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify dial tone on all telephone lines (main and emergency lines)
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test incoming and outgoing call functionality
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check emergency hotline numbers and direct connect systems
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify caller ID and call logging systems are operational
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test conference call capabilities and multi-line functions
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check voicemail system access and message retrieval
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify backup telephone systems and redundant lines
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test call transfer and hold functions
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Inspect handsets, cords, and physical equipment condition
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Document all tests and report any line failures
                </ChecklistLabel>
              </ChecklistItem>
              </ChecklistGrid>
            </ChecklistCard>

            <SubTitle>Weekly Verification Tasks:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test all speed dial and emergency contact numbers
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify telephone directory is current and accurate
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check battery backup systems for VoIP phones
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test satellite phone systems if applicable
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify integration with call recording systems
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Clean all telephone equipment and consoles
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Update emergency contact lists and post near telephones
                </ChecklistLabel>
              </ChecklistItem>
              </ChecklistGrid>
            </ChecklistCard>

            <SubTitle>Monthly System Review:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Conduct full system diagnostic with telecommunications provider
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Review call logs and system usage reports
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test automatic failover systems and redundancy protocols
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Coordinate with IT to verify network infrastructure for VoIP
                </ChecklistLabel>
              </ChecklistItem>
              </ChecklistGrid>
            </ChecklistCard>
          </div>
        </div>
      </Section>
    </MainContent>
  );
};
