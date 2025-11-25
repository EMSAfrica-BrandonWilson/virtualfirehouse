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

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

export function RankStructure() {
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-rank-structure', '/images/EMSA-Introduction.png');

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="rank-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="rank-title">
                Register Rank Structure
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Rank Structure Registration system provides comprehensive
                management of the emergency services hierarchy at King Fahd
                International Airport. This system maintains detailed records
                of rank classifications, command responsibilities, qualification
                requirements, and succession planning that support effective
                organizational structure and ensure clear command authority
                across all emergency service functions.
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
                  alt="Register Rank Structure" 
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
            Our rank structure registration encompasses command positions,
            operational ranks, specialized roles, and qualification pathways
            that provide comprehensive visibility into organizational hierarchy
            and professional advancement opportunities.
          </Paragraph>
        </div>
      </Section>

      {/* Rank Structure Registration Form Section */}
      <Section aria-labelledby="rank-registration-form">
        <FormSection>
          <SubTitle id="rank-registration-form">
            Rank Structure Registration Form
          </SubTitle>
          <Paragraph>
            Rank structure registration forms and organizational management tools will be
            implemented here to support comprehensive rank management, qualification tracking,
            and succession planning for all emergency services personnel.
          </Paragraph>
        </FormSection>
      </Section>
    </MainContent>
  );
}