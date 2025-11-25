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

export const TwoWayRadios: React.FC = () => {
  const imageUrl = '/images/EMSA-Communications.png';
  
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="radios-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="radios-title">
                Two-way Radios Checklist
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                This checklist ensures all two-way radio communications equipment at the Emergency Control Centre is operational, properly maintained, and ready for critical emergency communications. Regular verification ensures reliable communication systems for coordinated emergency response operations.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage 
                src={imageUrl} 
                alt="Two-way Radios" 
              />
            </ImageColumn>
          </FlexRow>

          <div style={{ marginTop: '30px' }}>
            <SubTitle>Shift Change Equipment Check:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify all portable radios are accounted for and properly stored
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check battery charge levels on all units (minimum 80% required)
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test radio transmission and reception on all channels
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify proper channel programming and frequencies
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Inspect antennas for damage or loose connections
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test emergency alert and scan functions
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify base station and repeater operations
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check audio quality and volume controls
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test backup power systems for radio infrastructure
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Document radio assignments and user check-out
                </ChecklistLabel>
              </ChecklistItem>
              </ChecklistGrid>
            </ChecklistCard>

            <SubTitle>Weekly Maintenance Tasks:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Clean all radio units and charging stations
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify spare batteries are fully charged and available
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Test interoperability with external agencies
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Update radio inventory and equipment logs
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Conduct range and coverage tests
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Report any defective units for repair or replacement
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
