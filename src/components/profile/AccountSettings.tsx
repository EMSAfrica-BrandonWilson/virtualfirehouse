import React, { useState } from 'react';
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
  FormInput,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  HelpText,
  WarningBox
} from '../StyledComponents';

interface AccountSettingsProps {
  user: User;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/functions/v1/delete-user-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          confirmationText: confirmationText
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete account');
      }

      setMessage({ type: 'success', text: result.message });
      setShowDeleteConfirmation(false);
      setConfirmationText('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <AuthFormContainer>
      <StyledH2>Account Settings</StyledH2>
      <StyledDivider />
      
      <StyledParagraph style={{ textAlign: 'center', marginBottom: '30px' }}>
        Manage your account security settings, change your password, and control account access. 
        Keep your account secure with strong authentication measures.
      </StyledParagraph>

      {/* Change Password Section */}
      <form onSubmit={handlePasswordChange} style={{ marginBottom: '40px' }}>
        <TwoColumnFormLayout>
          <FullWidthColumn>
            <StyledH2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Change Password</StyledH2>
          </FullWidthColumn>

          <FormColumn>
            <FormGroup>
              <FormLabel htmlFor="current-password">Current Password:</FormLabel>
              <FormInput
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={loading}
                required
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <FormLabel htmlFor="new-password">New Password:</FormLabel>
              <FormInput
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={loading}
                required
                minLength={6}
              />
              <HelpText>
                Minimum 6 characters required for security
              </HelpText>
            </FormGroup>
          </FormColumn>

          <FullWidthColumn>
            <FormGroup>
              <FormLabel htmlFor="confirm-password">Confirm New Password:</FormLabel>
              <FormInput
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={loading}
                required
                minLength={6}
              />
            </FormGroup>
          </FullWidthColumn>

          <FullWidthColumn>
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
                type="submit"
                $variant="primary"
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px'
                }}
                disabled={loading}
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Updating...' : 'Update Password'}
              </DevExpressButton>
            </div>
          </FullWidthColumn>
        </TwoColumnFormLayout>
      </form>

      {message && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      {/* Danger Zone Section */}
      <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
        <TwoColumnFormLayout>
          <FullWidthColumn>
            <StyledH2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#e53e3e' }}>Danger Zone</StyledH2>
            
            <WarningBox>
              <strong>Warning:</strong> Deleting your account is permanent and cannot be undone. 
              All your data will be permanently removed from our servers.
            </WarningBox>

            {!showDeleteConfirmation ? (
              <DevExpressButton
                type="button"
                $variant="danger"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px'
                }}
              >
                Delete Account
              </DevExpressButton>
            ) : (
              <div>
                <FormGroup>
                  <FormLabel htmlFor="confirm-delete">Type "DELETE" to confirm account deletion:</FormLabel>
                  <FormInput
                    id="confirm-delete"
                    type="text"
                    value={confirmationText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmationText(e.target.value)}
                    placeholder="Type DELETE here"
                    disabled={loading}
                    style={{ marginBottom: '15px' }}
                  />
                </FormGroup>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <DevExpressButton
                    type="button"
                    $variant="secondary"
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setConfirmationText('');
                      setMessage(null);
                    }}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </DevExpressButton>
                  <DevExpressButton
                    type="button"
                    $variant="danger"
                    onClick={handleDeleteAccount}
                    disabled={loading || confirmationText !== 'DELETE'}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '16px'
                    }}
                  >
                    {loading && <LoadingSpinner />}
                    {loading ? 'Processing...' : 'Confirm Deletion'}
                  </DevExpressButton>
                </div>
              </div>
            )}
          </FullWidthColumn>
        </TwoColumnFormLayout>
      </div>
    </AuthFormContainer>
  );
};

export default AccountSettings;