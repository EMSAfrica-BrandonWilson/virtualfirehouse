import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import {
  AuthPageContainer,
  AuthSection,
  AuthFlexRow,
  LoginFormContainer,
  TwoColumnFormLayout,
  FormColumn,
  FullWidthColumn,
  StyledH1,
  StyledH2,
  StyledDivider,
  StyledParagraph,
  FormGroup,
  FormLabel,
  FormInput,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  LinkText
} from '../components/StyledComponents';



export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('vfh_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Save email to localStorage when rememberMe changes and email exists
  useEffect(() => {
    if (email && rememberMe) {
      localStorage.setItem('vfh_saved_email', email);
    } else if (email && !rememberMe) {
      // Only clear if we're explicitly unchecking remember me
      localStorage.removeItem('vfh_saved_email');
    }
  }, [email, rememberMe]);

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn(email, password);
      console.log('Login result:', result);
      
      // Check for errors first
      if (result?.error) {
        throw new Error(result.error.message || 'Login failed');
      }
      
      // Check if user data is present
      if (result?.data?.user) {
        setSuccess('Login successful! Redirecting...');
        
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('vfh_saved_email', email);
        } else {
          localStorage.removeItem('vfh_saved_email');
        }
        
        // The useEffect will handle the redirect when user state updates
      } else {
        // This should rarely happen with valid credentials
        throw new Error('Authentication succeeded but user data is missing. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const loading = authLoading || isLoading;

  return (
    <ContentPane>
      <AuthPageContainer>
        <AuthSection>
          <StyledH1>VirtualFireHouse Login</StyledH1>
          <StyledDivider />
          
          <AuthFlexRow>
            <LoginFormContainer>
              <form onSubmit={handleSubmit} autoComplete="on">
                <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
                  Welcome to the VirtualFireHouse emergency management system. 
                  Please enter your credentials to access your account and manage emergency services operations.
                </StyledParagraph>
                
                <TwoColumnFormLayout>
                  <FormColumn>
                    <FormGroup>
                      <FormLabel htmlFor="email">Email Address:</FormLabel>
                      <FormInput
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your email address"
                        required
                      />
                    </FormGroup>
                  </FormColumn>
                  
                  <FormColumn>
                    <FormGroup>
                      <FormLabel htmlFor="password">Password:</FormLabel>
                      <FormInput
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your password"
                        required
                      />
                    </FormGroup>
                  </FormColumn>
                  
                  <FullWidthColumn>
                    <FormGroup style={{ marginTop: '-8px', marginBottom: '0' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#333'
                      }}>
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={loading}
                          style={{
                            marginRight: '8px',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                        Remember me (Keep me signed in)
                      </label>
                    </FormGroup>
                  </FullWidthColumn>
                  
                  <FullWidthColumn>
                    <DevExpressButton
                      type="submit"
                      $variant="primary"
                      style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        marginTop: '20px'
                      }}
                      disabled={loading}
                    >
                      {loading && <LoadingSpinner />}
                      {loading ? 'Signing in...' : 'Sign In to VirtualFireHouse'}
                    </DevExpressButton>
                  </FullWidthColumn>
                </TwoColumnFormLayout>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <LinkText>
                  Don't have an account? <a href="/register">Register for VirtualFireHouse</a>
                </LinkText>
              </form>
            </LoginFormContainer>
          </AuthFlexRow>
        </AuthSection>
      </AuthPageContainer>
    </ContentPane>
  );
};
