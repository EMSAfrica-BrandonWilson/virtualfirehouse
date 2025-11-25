import React from 'react';
import { useParams } from 'react-router-dom';
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

const sections = [
  { name: 'Building Maintenance', slug: 'building-maintenance' },
  { name: 'Equipment Maintenance', slug: 'equipment-maintenance' },
  { name: 'PPE Maintenance', slug: 'ppe-maintenance' },
  { name: 'Vehicle Maintenance', slug: 'vehicle-maintenance' },
];

export const MaintenanceLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="maintenance-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="maintenance-title">
                {activeSection ? activeSection.name : 'Maintenance and Repairs'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  <>This is the landing page for {activeSection.name}. Use the left-hand sub menu to navigate within this section.</>
                ) : (
                  <>The Maintenance and Repairs division ensures operational readiness of all emergency equipment, vehicles, and facilities at King Fahd International Airport through comprehensive preventive maintenance, repair services, and fleet management. Our operations cover equipment servicing, fleet management, facility maintenance, and asset management with rigorous schedules and quality standards ensuring maximum reliability and availability.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/Repairs.jpeg" alt="Maintenance and Repairs" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {!activeSection && (
        <Section aria-labelledby="equipment-management">
          <FlexRow>
            <Column $width="48%">
              <SubTitle id="equipment-management">
                Equipment Maintenance and
              </SubTitle>
              <Paragraph>
                Our program covers all emergency apparatus including aircraft rescue vehicles, hazmat units, rescue equipment, and medical devices. Following manufacturer specifications, we conduct regular inspections, testing, calibrations, and performance evaluations. Emergency equipment receives priority maintenance with full documentation for compliance and reliability tracking.
              </Paragraph>
            </Column>
            <Column $width="48%">
              <SubTitle>
                Fleet Management
              </SubTitle>
              <Paragraph>
                Fleet management includes vehicle maintenance, fuel management, parts inventory, and readiness monitoring with detailed records for each vehicle. Our certified technicians maintain expertise in specialized emergency vehicles and coordinate with manufacturers for technical support and repairs. We also manage vehicle replacement planning and lifecycle management.
              </Paragraph>
            </Column>
          </FlexRow>
        </Section>
      )}

      {!activeSection && (
        <Section aria-labelledby="asset-management">
          <SubTitle id="asset-management">
            Infrastructure Maintenance and Asset Management
          </SubTitle>
          <Paragraph>
            We manage infrastructure maintenance covering fire stations, training facilities, equipment storage, communication systems, and support infrastructure through regular inspections and preventive maintenance. Asset management programs track equipment lifecycles, costs, and replacement planning to optimize resources. Our inventory systems ensure spare parts availability and efficient procurement, maintaining all emergency resources in peak condition.
          </Paragraph>
        </Section>
      )}
    </MainContent>
  );
};