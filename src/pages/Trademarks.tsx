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

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
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

export const Trademarks: React.FC = () => {
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="trademarks-title">
        <div style={{ marginTop: '10px' }}>
          <Title id="trademarks-title">
            Trademarks
          </Title>
          <Divider aria-hidden="true" />
          <Paragraph>
            This page is currently under construction. Please check back later for trademark information.
          </Paragraph>
        </div>
      </Section>
    </MainContent>
  );
};