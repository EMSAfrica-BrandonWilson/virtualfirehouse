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

const TwoColumnRow = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const RightColumn = styled.div`
  flex: 1;
  min-width: 300px;
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
  margin-bottom: 5px;
`;

const Tagline = styled.h2`
  font-size: 1.3rem;
  color: #1177BB;
  font-style: normal;
  margin-bottom: 10px;
  font-weight: bold;
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

const ContentBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
`;

export const AboutEMSAfrica: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="about-emsa-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="about-emsa-title">
                About EMSAfrica
              </Title>
              <Tagline>
                Where Technology Meets Humanity
              </Tagline>
              <Divider aria-hidden="true" />
              <Paragraph>
                Emergency Management Services Africa (EMSAfrica Pty Ltd) is a specialized consulting firm dedicated to 
                improving Emergency Management Services and fire safety standards 
                across the African continent and the Middle East region.
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/EMSAfrica1.png" alt="EMS Africa" />
            </ImageColumn>
          </FlexRow>

          <TwoColumnRow>
            <LeftColumn>
              <ContentBox>
                <SubTitle>
                  Company Overview:
                </SubTitle>
                <Paragraph>
                  Founded with the vision of enhancing emergency response capabilities 
                  in developing regions, EMS Africa provides comprehensive consulting 
                  services in emergency management systems, training programs, and 
                  operational excellence initiatives.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Services Offered:
                </SubTitle>
                <ul style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <li><strong>Emergency Management Consulting:</strong> Strategic planning and implementation guidance</li>
                  <li><strong>Training and Development:</strong> Customized programs for emergency responders</li>
                  <li><strong>System Design:</strong> Emergency response system architecture and optimization</li>
                  <li><strong>Technology Solutions:</strong> Modern communication and dispatch systems</li>
                  <li><strong>Standards Compliance:</strong> International certification and accreditation support</li>
                </ul>
              </ContentBox>
            </LeftColumn>

            <RightColumn>
              <ContentBox>
                <SubTitle>
                  Regional Focus:
                </SubTitle>
                <Paragraph>
                  Our expertise spans across Southern and Eastern Africa, with 
                  expanding operations in the Gulf Cooperation Council (GCC) 
                  countries. We specialize in adapting international emergency 
                  management standards to local contexts and requirements.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Partnership Approach:
                </SubTitle>
                <Paragraph>
                  EMS Africa works closely with government agencies, airport authorities, 
                  industrial facilities, and healthcare organizations to develop 
                  sustainable emergency response capabilities that meet both local 
                  needs and international standards.
                </Paragraph>
                
                <SubTitle style={{ marginTop: '30px' }}>
                  Contact Information:
                </SubTitle>
                <Paragraph>
                  For more information about EMS Africa's services and capabilities, 
                  please visit our website or contact our regional offices in 
                  Johannesburg, Cape Town, and Dubai.
                </Paragraph>
              </ContentBox>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>
    </MainContent>
  );
};