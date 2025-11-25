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
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
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







export const LeaveManagementLanding: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('leave-management', '/images/HR.png');


  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="leave-management-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="leave-management-title">
                Leave Management
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Leave Management system provides comprehensive tracking and administration of employee leave requests and records. Manage annual leave, sick leave, emergency leave, and other leave types while maintaining accurate records of leave balances and utilization across all departments.
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
                  alt="Leave Management" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/HR.png';
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

      {/* Leave Recording Section */}
      <Section aria-labelledby="leave-recording">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="leave-recording">
              Leave Recording
            </SubTitle>
            <Paragraph>
              Use the Leave Recording module to add new leave records or edit existing ones. The system supports multiple leave types including annual leave, sick leave, emergency leave, maternity and paternity leave, study leave, and TOIL (Time Off In Lieu). Each record captures essential details such as employee information, leave dates, duration, and supporting documentation.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Leave Records Management
            </SubTitle>
            <Paragraph>
              Access and manage all leave records in a comprehensive data table. View complete leave history, search and filter records, edit existing entries, and generate PDF reports for documentation and compliance purposes. The system maintains a complete audit trail of all leave transactions for reporting and analysis.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Individual Records and Reporting Section */}
      <Section aria-labelledby="individual-records">
        <SubTitle id="individual-records">
          Individual Leave Records and Reporting
        </SubTitle>
        <Paragraph>
          The Individual Leave Records module allows you to search and filter leave records for specific staff members. Track individual leave balances, view leave history, analyze leave patterns, and generate personalized reports. This functionality supports workforce planning, leave balance verification, and ensures compliance with organizational leave policies and labor regulations.
        </Paragraph>
      </Section>


    </MainContent>
  );
};
