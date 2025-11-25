import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDateOnly, formatDateTimeReadable } from '../../lib/utils';
import { DevExpressButton } from '../DevExpressStyles';
import { useAuth } from '../../contexts/AuthContext';
import {
  AuthFormContainer,
  TwoColumnFormLayout,
  FormColumn,
  FullWidthColumn,
  StyledH2,
  StyledDivider,
  StyledParagraph,
  FormGroup,
  FormLabel,
  FormInput,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  HelpText,
  InfoSection,
  InfoLabel,
  InfoValue
} from '../StyledComponents';

interface ProfileData {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  bio?: string;
  created_at: string;
}

interface ProfileInformationProps {
  user: User;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({ user }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (userProfile) {
      const p = {
        id: (userProfile as any).id || '',
        user_id: user.id,
        email: user.email || '',
        full_name: (userProfile as any).full_name || '',
        first_name: (userProfile as any).first_name || '',
        last_name: (userProfile as any).last_name || '',
        display_name: (userProfile as any).display_name || '',
        phone: (userProfile as any).phone || '',
        bio: (userProfile as any).bio || '',
        created_at: (userProfile as any).created_at || formatDateTimeReadable(new Date())
      } as ProfileData;
      setProfileData(p);
      setFormData({
        full_name: p.full_name || '',
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        display_name: p.display_name || '',
        phone: p.phone || '',
        bio: p.bio || ''
      });
      setLoading(false);
    } else {
      fetchProfileData();
    }
  }, [user.id, userProfile]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const profile = data || {
        id: '',
        user_id: user.id,
        email: user.email || '',
        full_name: '',
        first_name: '',
        last_name: '',
        display_name: '',
        phone: '',
        bio: '',
        created_at: formatDateTimeReadable(new Date())
      };

      setProfileData(profile);
      setFormData({
        full_name: profile.full_name || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          ...formData,
          updated_at: formatDateTimeReadable(new Date())
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const isLoading = loading || saving;

  if (loading && !profileData) {
    return (
      <AuthFormContainer>
        <StyledH2>Profile Information</StyledH2>
        <StyledDivider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          <span style={{ marginLeft: '1rem' }}>Loading profile data...</span>
        </div>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer>
      <StyledH2>Profile Information</StyledH2>
      <StyledDivider />
      
      <form onSubmit={handleSubmit}>
        <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
          Manage your personal information and profile details. Keep your information current 
          to ensure proper system access and communication.
        </StyledParagraph>
        
        <InfoSection>
          <TwoColumnFormLayout>
            <FormColumn>
              <InfoLabel>Account Email:</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </FormColumn>
            <FormColumn>
              <InfoLabel>Account Created:</InfoLabel>
              <InfoValue>
                {profileData?.created_at ? formatDateOnly(profileData.created_at) : 'N/A'}
              </InfoValue>
            </FormColumn>
          </TwoColumnFormLayout>
        </InfoSection>

        <TwoColumnFormLayout>
          <FormColumn>
            <FormGroup>
              <FormLabel htmlFor="display_name">Display Name:</FormLabel>
              <FormInput
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="How your name appears to other users"
              />
              <HelpText>
                This is how your name will be displayed throughout the application.
              </HelpText>
            </FormGroup>
          </FormColumn>
          
          <FormColumn>
            <FormGroup>
              <FormLabel htmlFor="full_name">Full Name:</FormLabel>
              <FormInput
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Your complete legal name"
              />
            </FormGroup>
          </FormColumn>
          
          <FormColumn>
            <FormGroup>
              <FormLabel htmlFor="first_name">First Name:</FormLabel>
              <FormInput
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Your first name"
              />
            </FormGroup>
          </FormColumn>
          
          <FormColumn>
            <FormGroup>
              <FormLabel htmlFor="last_name">Last Name:</FormLabel>
              <FormInput
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Your last name"
              />
            </FormGroup>
          </FormColumn>
          
          <FullWidthColumn>
            <FormGroup>
              <FormLabel htmlFor="phone">Phone Number:</FormLabel>
              <FormInput
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Your contact phone number"
              />
            </FormGroup>
          </FullWidthColumn>
          
          <FullWidthColumn>
            <FormGroup>
              <FormLabel htmlFor="bio">Bio:</FormLabel>
              <FormInput
                as="textarea"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Tell us about yourself"
                rows={4}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </FormGroup>
          </FullWidthColumn>
          
          <FullWidthColumn>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <DevExpressButton
                type="button"
                $variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px'
                }}
              >
                Cancel
              </DevExpressButton>
              <DevExpressButton
                type="submit"
                $variant="primary"
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px'
                }}
                disabled={isLoading}
              >
                {saving && <LoadingSpinner />}
                {saving ? 'Updating Profile...' : 'Update Profile'}
              </DevExpressButton>
            </div>
          </FullWidthColumn>
        </TwoColumnFormLayout>

        {message && (
          message.type === 'success' ? (
            <SuccessMessage>{message.text}</SuccessMessage>
          ) : (
            <ErrorMessage>{message.text}</ErrorMessage>
          )
        )}
      </form>
    </AuthFormContainer>
  );
};

export default ProfileInformation;