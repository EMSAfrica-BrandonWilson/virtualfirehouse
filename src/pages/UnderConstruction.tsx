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
  width: 20%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
  }
`;

const ContentColumn = styled.div`
  width: 80%;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
`;

const SubTitle = styled.h3`
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

const CenteredParagraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: center;
  margin-bottom: 15px;
`;

const HeaderImage = styled.img`
  width: 90%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionImage = styled.img`
  width: 95%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &.small {
    width: 55%;
  }
`;

export function UnderConstruction() {
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="construction-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow style={{ gap: '0px' }}>
            <ContentColumn>
              <Title id="construction-title">
                This Page is Under Construction
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                We are very hard at work putting this page and its content together 
                so you can enjoy our complete work of art to the fullest.
              </Paragraph>
            </ContentColumn>
            <ImageColumn>
              <HeaderImage 
                src="/images/UnderConstruction.png" 
                alt="Under Construction" 
              />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Two-Column Section */}
      <Section aria-labelledby="working-section">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="working-section">
              We Are Working At It...
            </SubTitle>
            <div style={{ textAlign: 'center' }}>
              <CenteredParagraph>
                <SectionImage 
                  src="/images/UnderConstruction3.png" 
                  alt="Working At It" 
                />
              </CenteredParagraph>
            </div>
          </Column>
          <Column $width="48%">
            <SubTitle>
              We Are Busy Negotiating
            </SubTitle>
            <div style={{ textAlign: 'center' }}>
              <CenteredParagraph>
                <SectionImage 
                  className="small" 
                  src="/images/UnderConstruction2.png" 
                  alt="Busy Negotiating" 
                />
              </CenteredParagraph>
            </div>
          </Column>
        </FlexRow>
      </Section>
    </MainContent>
  );
}