import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DevExpressButton } from '../DevExpressStyles';
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
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  HelpText
} from '../StyledComponents';
import styled from 'styled-components';
import { getCurrentTimezone, formatDateTimeReadable } from '../../lib/utils';

// Custom styled components for preferences-specific UI elements
const FormSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #2d3748;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
  
  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  background: #fafafa;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #cbd5e0;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h3`
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const SettingDescription = styled.p`
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 1rem;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #3182ce;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

interface PreferencesProps {
  user: User;
}

interface UserPreferences {
  language: string;
  timezone: string;
  theme: string;
  email_frequency: string;
  marketing_emails: boolean;
  newsletter: boolean;
  notifications: boolean;
}

const Preferences: React.FC<PreferencesProps> = ({ user }) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    timezone: getCurrentTimezone(),
    theme: 'light',
    email_frequency: 'daily',
    marketing_emails: false,
    newsletter: true,
    notifications: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, [user.id]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('language, timezone, theme, email_frequency, marketing_emails, newsletter, email_notifications, push_notifications, browser_notifications')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          language: data.language || 'en',
          timezone: data.timezone || getCurrentTimezone(),
          theme: data.theme || 'light',
          email_frequency: data.email_frequency || 'daily',
          marketing_emails: data.marketing_emails || false,
          newsletter: data.newsletter !== null ? data.newsletter : true,
          notifications: data.push_notifications !== null ? data.push_notifications : true
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    }
  };

  const handleSelectChange = (field: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field: keyof UserPreferences) => {
    setPreferences(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          language: preferences.language,
          timezone: preferences.timezone,
          theme: preferences.theme,
          email_frequency: preferences.email_frequency,
          marketing_emails: preferences.marketing_emails,
          newsletter: preferences.newsletter,
          push_notifications: preferences.notifications,
          updated_at: formatDateTimeReadable(new Date())
        });
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <AuthFormContainer>
      <StyledH2>Preferences</StyledH2>
      <StyledDivider />
      
      <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
        Customize your experience with personalized settings. Configure display preferences, 
        communication options, and notification settings to match your workflow.
      </StyledParagraph>

      {message && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      {/* Display Preferences Section */}
      <TwoColumnFormLayout>
        <FullWidthColumn>
          <StyledH2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Display Preferences</StyledH2>
        </FullWidthColumn>
        
        <FormColumn>
          <FormGroup>
            <FormLabel htmlFor="language">Language:</FormLabel>
            <FormSelect
              id="language"
              value={preferences.language}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('language', e.target.value)}
              disabled={loading}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
            </FormSelect>
          </FormGroup>
        </FormColumn>

        <FormColumn>
          <FormGroup>
            <FormLabel htmlFor="timezone">Timezone:</FormLabel>
            <FormSelect
              id="timezone"
              value={preferences.timezone}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('timezone', e.target.value)}
              disabled={loading}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </FormSelect>
          </FormGroup>
        </FormColumn>

        <FullWidthColumn>
          <FormGroup>
            <FormLabel htmlFor="theme">Theme:</FormLabel>
            <FormSelect
              id="theme"
              value={preferences.theme}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('theme', e.target.value)}
              disabled={loading}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">System</option>
            </FormSelect>
            <HelpText>
              Choose how the application appears. "System" will follow your device's theme setting.
            </HelpText>
          </FormGroup>
        </FullWidthColumn>
      </TwoColumnFormLayout>

      {/* Communication Preferences Section */}
      <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
        <TwoColumnFormLayout>
          <FullWidthColumn>
            <StyledH2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Communication Preferences</StyledH2>
            
            <FormGroup style={{ marginBottom: '25px' }}>
              <FormLabel htmlFor="email_frequency">Email Frequency:</FormLabel>
              <FormSelect
                id="email_frequency"
                value={preferences.email_frequency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('email_frequency', e.target.value)}
                disabled={loading}
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never</option>
              </FormSelect>
              <HelpText>
                Control how often you receive system emails and updates.
              </HelpText>
            </FormGroup>

            <SettingRow>
              <SettingInfo>
                <SettingTitle>Marketing Emails</SettingTitle>
                <SettingDescription>
                  Receive promotional emails about new features and offers
                </SettingDescription>
              </SettingInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={preferences.marketing_emails}
                  onChange={() => handleToggle('marketing_emails')}
                  disabled={loading}
                />
                <ToggleSlider />
              </Toggle>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingTitle>Newsletter</SettingTitle>
                <SettingDescription>
                  Stay updated with our monthly newsletter
                </SettingDescription>
              </SettingInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={preferences.newsletter}
                  onChange={() => handleToggle('newsletter')}
                  disabled={loading}
                />
                <ToggleSlider />
              </Toggle>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingTitle>Push Notifications</SettingTitle>
                <SettingDescription>
                  Receive push notifications for important updates
                </SettingDescription>
              </SettingInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={() => handleToggle('notifications')}
                  disabled={loading}
                />
                <ToggleSlider />
              </Toggle>
            </SettingRow>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <DevExpressButton
                type="button"
                $variant="secondary"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px'
                }}
              >
                Cancel
              </DevExpressButton>
              <DevExpressButton
                type="button"
                $variant="primary"
                onClick={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px'
                }}
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Saving...' : 'Save Preferences'}
              </DevExpressButton>
            </div>
          </FullWidthColumn>
        </TwoColumnFormLayout>
      </div>
    </AuthFormContainer>
  );
};

export default Preferences;