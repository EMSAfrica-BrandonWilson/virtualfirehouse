import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import {
  AuthPageContainer,
  AuthSection,
  AuthFlexRow,
  AuthFormContainer,
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
  LinkText,
  HelpText
} from '../components/StyledComponents';



export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const { signUpUser, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, fullName } = formData;

    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim()) {
      setError('Email, password, confirm password, and full name are required.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUpUser(formData.email, formData.password, formData.fullName, formData.displayName || formData.fullName);
      console.log('Registration result:', result);
      
      // Check for errors first
      if (result?.error) {
        const msg = String(result.error.message || '').toLowerCase();
        if (msg.includes('rate limit')) {
          setError('Too many registration attempts. Please check your inbox for a previous confirmation email or try again in a few minutes.');
          setCanResend(true);
          return;
        }
        throw new Error(result.error.message || 'Registration failed');
      }
      
      // Check if registration was successful
      if (result?.data?.user) {
        console.log('Registration successful for user:', result.data.user.email);
        setSuccess('Registration successful! Please check your email to verify your account.');

        try {
          const requesterEmail = result.data.user.email || formData.email;
          const requesterName = formData.fullName || formData.displayName || '';
          await supabase
            .from('01_home_contact_us')
            .insert([{ name: requesterName, email: requesterEmail, subject: 'Access Request', message: `New access request from ${requesterName} (${requesterEmail})`, status: 'Pending' }]);
          const { data: admins } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('role', 'System Administrator');
          const adminEmails = (admins || []).map((a: any) => a.email).filter((e: any) => !!e);
          for (const adminEmail of adminEmails) {
            await supabase.functions.invoke('email-pdf', {
              method: 'POST',
              body: { to: adminEmail, subject: 'New VirtualFireHouse Access Request', message: `A new user has requested access: ${requesterName} (${requesterEmail}). Approve at /admin/user-role-management.` }
            });
          }
        } catch {}
        
        // Clear form on successful registration
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          displayName: ''
        });
        
        // If email confirmation is required (user.email_confirmed_at is null),
        // redirect to login after showing success message
        if (!result.data.user.email_confirmed_at) {
          console.log('Email confirmation required, redirecting to login in 3 seconds');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          console.log('User automatically confirmed, AuthContext will handle redirect');
        }
        // If user is automatically confirmed, the useEffect will handle redirect
      } else {
        throw new Error('Registration completed but user data is missing. Please try logging in.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: formData.email });
      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if (msg.includes('rate limit')) {
          setResendMessage('Please wait a few minutes before requesting another email.');
        } else {
          setResendMessage('Failed to resend confirmation email. Please try again later.');
        }
        return;
      }
      setResendMessage('Verification email resent. Please check your inbox and spam folder.');
      setCanResend(false);
      setTimeout(() => setCanResend(true), 60000);
    } catch {
      setResendMessage('Failed to resend confirmation email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const loading = authLoading || isLoading;

  return (
    <ContentPane>
      <AuthPageContainer>
        <AuthSection>
          <StyledH1>VirtualFireHouse Registration</StyledH1>
          <StyledDivider />
          <StyledH2>Create Your Emergency Services Account</StyledH2>
          
          <AuthFlexRow>
            <AuthFormContainer>
              <form onSubmit={handleSubmit}>
                <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
                  Join the VirtualFireHouse emergency management system to access comprehensive 
                  emergency services coordination tools, training resources, and operational management capabilities.
                </StyledParagraph>
                
                <TwoColumnFormLayout>
                  <FormColumn>
                    <FormGroup>
                      <FormLabel htmlFor="fullName">Full Name:</FormLabel>
                      <FormInput
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Enter your complete legal name"
                        required
                      />
                    </FormGroup>
                  </FormColumn>
                  
                  <FormColumn>
                    <FormGroup>
                      <FormLabel htmlFor="displayName">Display Name (Optional):</FormLabel>
                      <FormInput
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Preferred display name"
                      />
                      <HelpText>
                        How your name appears to other users. Defaults to full name if blank.
                      </HelpText>
                    </FormGroup>
                  </FormColumn>
                  
                  <FormColumn>
                    <FormGroup>
                      <FormLabel htmlFor="email">Email Address:</FormLabel>
                      <FormInput
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
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
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Choose a secure password"
                        required
                      />
                      <HelpText>
                        Minimum 6 characters required for security
                      </HelpText>
                    </FormGroup>
                  </FormColumn>
                  
                  <FullWidthColumn>
                    <FormGroup>
                      <FormLabel htmlFor="confirmPassword">Confirm Password:</FormLabel>
                      <FormInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Re-enter your password to confirm"
                        required
                      />
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
                      {loading ? 'Creating Account...' : 'Create VirtualFireHouse Account'}
                    </DevExpressButton>
                  </FullWidthColumn>
                </TwoColumnFormLayout>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {canResend && (
                  <div style={{ marginTop: '10px' }}>
                    <DevExpressButton
                      type="button"
                      $variant="primary"
                      style={{ padding: '10px 16px' }}
                      disabled={resendLoading || !formData.email}
                      onClick={handleResendConfirmation}
                    >
                      {resendLoading ? 'Resending…' : 'Resend Confirmation Email'}
                    </DevExpressButton>
                    {resendMessage && <HelpText>{resendMessage}</HelpText>}
                  </div>
                )}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <LinkText>
                  Already have an account? <a href="/login">Sign in to VirtualFireHouse</a>
                </LinkText>
              </form>
            </AuthFormContainer>
          </AuthFlexRow>
        </AuthSection>
      </AuthPageContainer>
    </ContentPane>
  );
};
