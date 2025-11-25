import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDateTime, formatDateTimeReadable, formatDateOnly } from '../../lib/utils';
import { DevExpressButton } from '../DevExpressStyles';
import {
  AuthFormContainer,
  TwoColumnFormLayout,
  FullWidthColumn,
  StyledH2,
  StyledDivider,
  StyledParagraph,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  HelpText
} from '../StyledComponents';
import styled from 'styled-components';

// Custom styled components for security-specific UI elements
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

const SessionList = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
`;

const SessionItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f7fafc;
  }
`;

const SessionInfo = styled.div`
  flex: 1;
`;

const SessionTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
`;

const SessionDetails = styled.div`
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const CurrentBadge = styled.span`
  background: #48bb78;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface SecuritySettingsProps {
  user: User;
}

interface SecurityPreferences {
  two_factor_enabled: boolean;
  email_notifications: boolean;
  login_alerts: boolean;
}

interface UserSession {
  id: string;
  user_id: string;
  device_info?: string;
  location?: string;
  last_active: string;
  is_current: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    two_factor_enabled: false,
    email_notifications: true,
    login_alerts: true
  });
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSecurityPreferences();
    fetchActiveSessions();
  }, [user.id]);

  const fetchSecurityPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled, email_notifications, login_notifications')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          two_factor_enabled: data.two_factor_enabled || false,
          email_notifications: data.email_notifications !== null ? data.email_notifications : true,
          login_alerts: data.login_notifications !== null ? data.login_notifications : true
        });
      }
    } catch (error) {
      console.error('Error fetching security preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load security preferences' });
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', formatDateOnly(new Date()))
        .order('last_active', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fallback to current session only
      setSessions([{
        id: 'current',
        user_id: user.id,
        device_info: 'Current Browser Session',
        location: 'Unknown',
        last_active: formatDateTimeReadable(new Date()),
        is_current: true
      }]);
    }
  };

  const handleToggle = async (setting: keyof SecurityPreferences) => {
    const newPreferences = {
      ...preferences,
      [setting]: !preferences[setting]
    };
    
    setPreferences(newPreferences);
    
    try {
      const updateData: any = { user_id: user.id };
      
      switch (setting) {
        case 'two_factor_enabled':
          updateData.two_factor_enabled = newPreferences.two_factor_enabled;
          break;
        case 'email_notifications':
          updateData.email_notifications = newPreferences.email_notifications;
          break;
        case 'login_alerts':
          updateData.login_notifications = newPreferences.login_alerts;
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (error) throw error;

      const settingName = setting.replace('_', ' ');
      setMessage({ 
        type: 'success', 
        text: `${settingName} ${newPreferences[setting] ? 'enabled' : 'disabled'} successfully` 
      });
    } catch (error: any) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(preferences);
      setMessage({ type: 'error', text: 'Failed to update preference' });
    }
    
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSignOutAllDevices = async () => {
    if (!window.confirm('Are you sure you want to sign out of all devices? You will need to sign in again.')) {
      return;
    }

    setLoading(true);
    
    try {
      // Sign out globally (this will invalidate all sessions)
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Error signing out:', error);
      setMessage({ type: 'error', text: 'Failed to sign out of all devices' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <AuthFormContainer>
      <StyledH2>Security Settings</StyledH2>
      <StyledDivider />
      
      <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
        Protect your account with advanced security settings. Configure two-factor authentication, 
        manage notifications, and monitor active sessions across all your devices.
      </StyledParagraph>

      {message && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      {/* Security Preferences Section */}
      <TwoColumnFormLayout>
        <FullWidthColumn>
          <StyledH2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Security Preferences</StyledH2>
          
          <SettingRow>
            <SettingInfo>
              <SettingTitle>Two-Factor Authentication</SettingTitle>
              <SettingDescription>
                Add an extra layer of security to your account with 2FA
              </SettingDescription>
            </SettingInfo>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.two_factor_enabled}
                onChange={() => handleToggle('two_factor_enabled')}
              />
              <ToggleSlider />
            </Toggle>
          </SettingRow>

          <SettingRow>
            <SettingInfo>
              <SettingTitle>Email Notifications</SettingTitle>
              <SettingDescription>
                Receive security-related notifications via email
              </SettingDescription>
            </SettingInfo>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={() => handleToggle('email_notifications')}
              />
              <ToggleSlider />
            </Toggle>
          </SettingRow>

          <SettingRow>
            <SettingInfo>
              <SettingTitle>Login Alerts</SettingTitle>
              <SettingDescription>
                Get notified when someone signs into your account
              </SettingDescription>
            </SettingInfo>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.login_alerts}
                onChange={() => handleToggle('login_alerts')}
              />
              <ToggleSlider />
            </Toggle>
          </SettingRow>
        </FullWidthColumn>
      </TwoColumnFormLayout>

      {/* Active Sessions Section */}
      <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
        <TwoColumnFormLayout>
          <FullWidthColumn>
            <StyledH2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Active Sessions</StyledH2>
            <HelpText style={{ marginBottom: '20px' }}>
              Monitor where your account is currently signed in. Sign out of all devices if you suspect unauthorized access.
            </HelpText>
            
            <SessionList>
              {sessions.map((session) => (
                <SessionItem key={session.id}>
                  <SessionInfo>
                    <SessionTitle>
                      {session.device_info || 'Unknown Device'}
                      {session.is_current && <CurrentBadge>Current</CurrentBadge>}
                    </SessionTitle>
                    <SessionDetails>
                      {session.location || 'Unknown Location'} • Last active: {formatDateTime(session.last_active)}
                    </SessionDetails>
                  </SessionInfo>
                </SessionItem>
              ))}
            </SessionList>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
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
                $variant="danger"
                onClick={handleSignOutAllDevices}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px'
                }}
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Signing out...' : 'Sign out of all devices'}
              </DevExpressButton>
            </div>
          </FullWidthColumn>
        </TwoColumnFormLayout>
      </div>
    </AuthFormContainer>
  );
};

export default SecuritySettings;