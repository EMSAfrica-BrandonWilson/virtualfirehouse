import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import {
  AuthPageContainer,
  AuthSection,
  AuthFlexRow,
  AuthFormContainer,
  StyledH1,
  StyledH2,
  StyledDivider,
  StyledParagraph,
  TwoColumnFormLayout,
  FormColumn,
  FullWidthColumn
} from '../components/StyledComponents';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAccessDeniedPage, setActiveRestrictedMenuItems } = useUI();

  useEffect(() => {
    setIsAccessDeniedPage(true);
    
    // Show all protected menu items as restricted when on access denied page
    const allRestrictedMenuItems = ['Emergency Administration', 'Emergency Control Centre', 'Emergency Operations', 'Fire and Life Safety', 'Maintenance and Repairs', 'Training and Development'];
    setActiveRestrictedMenuItems(allRestrictedMenuItems);
    
    return () => {
      setIsAccessDeniedPage(false);
      setActiveRestrictedMenuItems([]);
    };
  }, [setIsAccessDeniedPage, setActiveRestrictedMenuItems]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <ContentPane>
      <AuthPageContainer>
        <AuthSection>
          <StyledH1>Access Restricted</StyledH1>
          <StyledDivider />
          <StyledH2>Registration Required</StyledH2>
          
          <AuthFlexRow>
            <AuthFormContainer>
              <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
                The section you are trying to access is restricted to registered users only. 
                To access the VirtualFireHouse emergency management system modules, 
                please register for an account or log in if you already have one.
              </StyledParagraph>
              
              <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
                Registered users have access to:
              </StyledParagraph>
              
              <div style={{
                marginBottom: '30px',
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#333'
              }}>
                <TwoColumnFormLayout>
                  <FormColumn>
                    <ul style={{ 
                      paddingLeft: '20px',
                      margin: 0,
                      listStyleType: 'disc'
                    }}>
                      <li>Emergency Administration</li>
                      <li>Emergency Control Centre</li>
                      <li>Emergency Operations</li>
                    </ul>
                  </FormColumn>
                  
                  <FormColumn>
                    <ul style={{ 
                      paddingLeft: '20px',
                      margin: 0,
                      listStyleType: 'disc'
                    }}>
                      <li>Fire and Life Safety</li>
                      <li>Maintenance and Repairs</li>
                      <li>Training and Development</li>
                    </ul>
                  </FormColumn>
                </TwoColumnFormLayout>
              </div>
              
              <TwoColumnFormLayout>
                <FormColumn>
                  <DevExpressButton
                    onClick={handleRegister}
                    $variant="primary"
                    style={{
                      width: '100%',
                      padding: '15px',
                      fontSize: '16px',
                      marginBottom: '10px'
                    }}
                  >
                    Register New Account
                  </DevExpressButton>
                </FormColumn>
                
                <FormColumn>
                  <DevExpressButton
                    onClick={handleLogin}
                    $variant="secondary"
                    style={{
                      width: '100%',
                      padding: '15px',
                      fontSize: '16px',
                      marginBottom: '10px'
                    }}
                  >
                    Log In
                  </DevExpressButton>
                </FormColumn>
                
                <FullWidthColumn>
                  <DevExpressButton
                    onClick={handleBackToHome}
                    $variant="secondary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      marginTop: '20px'
                    }}
                  >
                    Return to Home Page
                  </DevExpressButton>
                </FullWidthColumn>
              </TwoColumnFormLayout>
            </AuthFormContainer>
          </AuthFlexRow>
        </AuthSection>
      </AuthPageContainer>
    </ContentPane>
  );
};
