import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../hooks/usePageImage';

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

const RegistrationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const RegistrationCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-left: 4px solid #FF9900;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  text-align: justify;
`;

export const RegisterLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('register', '/images/RegisterYourService.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="register-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="register-title">
                Register Your Service
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Service Registration system provides a comprehensive platform for registering and managing all emergency service assets, personnel, equipment, and operational capabilities within the King Fahd International Airport emergency services framework. This centralized system maintains detailed records of departmental capabilities, personnel qualifications, equipment specifications, and operational readiness status to support strategic planning, resource allocation, and regulatory compliance with ICAO Annex 14 and GACAR Part 139 requirements.
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
                  alt="Service Registration" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/EMSA-Introduction.png';
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



      {/* Registration Categories */}
      <Section aria-labelledby="registration-categories">
        <SubTitle id="registration-categories">
          Registration Categories
        </SubTitle>
        <RegistrationGrid>
          <RegistrationCard>
            <CardTitle>Register Department</CardTitle>
            <CardDescription>
              Establish and manage the organizational structure of your emergency service department. Define departmental hierarchy, divisions, units, and reporting relationships. Maintain records of departmental capabilities, operational scope, jurisdictional boundaries, and strategic objectives aligned with airport emergency response requirements.
            </CardDescription>
          </RegistrationCard>

          <RegistrationCard>
            <CardTitle>Register Stations</CardTitle>
            <CardDescription>
              Register and manage all fire station facilities including main stations, satellite facilities, and strategic response positions. Document station locations, coverage areas, facility specifications, equipment housed, personnel assignments, and operational readiness status to ensure optimal emergency response coverage across the airport.
            </CardDescription>
          </RegistrationCard>

          <RegistrationCard>
            <CardTitle>Register Staff</CardTitle>
            <CardDescription>
              Maintain comprehensive personnel records including firefighter qualifications, certifications, training history, medical fitness, and operational assignments. Track ARFF certification levels, specialized qualifications, rank structure, seniority, contact information, and emergency notification details for all department personnel.
            </CardDescription>
          </RegistrationCard>

          <RegistrationCard>
            <CardTitle>Register Vehicles</CardTitle>
            <CardDescription>
              Register and track all emergency response vehicles including ARFF apparatus, support vehicles, command units, and specialized equipment carriers. Document vehicle specifications, agent capacities, pump performance ratings, maintenance schedules, inspection records, and operational status ensuring fleet readiness and regulatory compliance.
            </CardDescription>
          </RegistrationCard>

          <RegistrationCard>
            <CardTitle>Register Equipment</CardTitle>
            <CardDescription>
              Catalog all specialized emergency equipment including firefighting tools, rescue equipment, communication devices, personal protective equipment, and support apparatus. Maintain detailed records of equipment specifications, maintenance requirements, inspection schedules, inventory levels, and deployment locations supporting operational readiness.
            </CardDescription>
          </RegistrationCard>

          <RegistrationCard>
            <CardTitle>Register Shift Systems</CardTitle>
            <CardDescription>
              Configure and manage shift rotation systems, duty schedules, and staffing patterns ensuring 24/7 operational coverage. Define shift schedules, rotation cycles, minimum staffing requirements, qualification requirements per shift, and relief protocols maintaining consistent emergency response capabilities throughout all operational periods.
            </CardDescription>
          </RegistrationCard>
        </RegistrationGrid>
      </Section>

      {/* System Benefits Section */}
      <Section aria-labelledby="system-benefits">
        <SubTitle id="system-benefits">
          Registration System Benefits and Operational Excellence
        </SubTitle>
        <Paragraph>
          The comprehensive Service Registration system provides real-time visibility into all emergency service capabilities, enabling data-driven decision making, resource optimization, and strategic planning. Automated reporting features generate compliance documentation, readiness assessments, and operational statistics supporting regulatory requirements, internal audits, and continuous improvement initiatives. The integrated approach ensures accurate, current information availability for operational planning, training coordination, equipment procurement, and emergency response activation.
        </Paragraph>
      </Section>
    </MainContent>
  );
};
