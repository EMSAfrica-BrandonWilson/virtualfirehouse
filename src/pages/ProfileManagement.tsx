import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
  StyledH1
} from '../components/StyledComponents';
import ProfileInformation from '../components/profile/ProfileInformation';
import AccountSettings from '../components/profile/AccountSettings';
import SecuritySettings from '../components/profile/SecuritySettings';
import Preferences from '../components/profile/Preferences';

const ContentArea = styled.div`
  padding: 30px;
  background: white;
  min-height: calc(100vh - 200px);
  
  @media (max-width: 968px) {
    padding: 20px;
    min-height: auto;
  }
`;



type ProfileSection = 'profile' | 'account' | 'security' | 'preferences';



const AccountSettingsSection: React.FC<{ user: any }> = ({ user }) => (
  <AccountSettings user={user} />
);

const SecuritySettingsSection: React.FC<{ user: any }> = ({ user }) => (
  <SecuritySettings user={user} />
);

const PreferencesSection: React.FC<{ user: any }> = ({ user }) => (
  <Preferences user={user} />
);

export const ProfileManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');

  // Listen for profile section changes from the main sidebar
  useEffect(() => {
    const handleProfileSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail as ProfileSection);
    };

    window.addEventListener('changeProfileSection', handleProfileSectionChange as EventListener);
    return () => {
      window.removeEventListener('changeProfileSection', handleProfileSectionChange as EventListener);
    };
  }, []);

  if (!user) {
    return (
      <ContentArea>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <StyledH1>Please log in to manage your profile.</StyledH1>
        </div>
      </ContentArea>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInformation user={user} />;
      case 'account':
        return <AccountSettingsSection user={user} />;
      case 'security':
        return <SecuritySettingsSection user={user} />;
      case 'preferences':
        return <PreferencesSection user={user} />;
      default:
        return <ProfileInformation user={user} />;
    }
  };

  return (
    <ContentArea>
      {renderContent()}
    </ContentArea>
  );
};
