import React from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';

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

export const AdminFinance: React.FC = () => {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('finance', '/images/EMSA-Introduction.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="finance-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="finance-title">
                Finance Section
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Finance Section manages budgeting, spending, procurement, and
                reporting for emergency services at King Fahd International Airport.
                We focus on efficient resource use and strong fiscal oversight to
                support safe, reliable operations.
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
                  alt="Finance Section" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/EMSA-Introduction.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <Paragraph>
            We handle budgets, cost analysis, procurement, audits, and compliance.
            Clear controls and reporting provide transparency and accountability in
            all fiscal matters.
          </Paragraph>
        </div>
      </Section>

      {/* Financial Management Section */}
      <Section aria-labelledby="financial-management">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="financial-management">
              Budget Planning and Forecasting
            </SubTitle>
            <Paragraph>
              We assess operational needs and priorities to build annual budgets,
              capital plans, and long‑term forecasts. We track variances, authorize
              spending, and monitor performance to maintain fiscal discipline and
              align resources with organizational goals.
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Financial Control Systems
            </SubTitle>
            <Paragraph>
              We oversee procurement, authorizations, and audit trails for all
              transactions. Contract administration and payment processing follow
              regulations and policies. Segregation of duties, clear approvals, and
              documentation help prevent fraud and ensure accountability.
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      {/* Fiscal Excellence Section */}
      <Section aria-labelledby="fiscal-excellence">
        <SubTitle id="fiscal-excellence">
          Financial Reporting and Fiscal Accountability
        </SubTitle>
        <Paragraph>
          We publish monthly statements, variance reports, and performance metrics
          to support informed decisions. We work with auditors to meet standards
          and regulations. Accountability measures—like cost‑benefit and ROI
          analysis—drive efficiency and continuous improvement. Our financial
          insights guide strategy and operations, ensuring sound stewardship of
          resources.
        </Paragraph>
      </Section>
    </MainContent>
  );
};