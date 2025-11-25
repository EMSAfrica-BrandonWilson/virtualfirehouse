import React from 'react';
import styled from 'styled-components';
import { HeaderPane, HeaderContent, LogoSection, LogoImage, TitleSection, LoginSection, MenuBar, MenuItem, FooterPane } from '../DevExpressStyles';
import { Clock } from '../UI/Clock';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface RootMasterProps {
  children: React.ReactNode;
}

// Define HOME page related paths
const homePagePaths = [
  '/', '/vision', '/mission', '/intro', '/summary', '/fd-way', 
  '/philosophy', '/rules', '/about-us', '/contact-us', '/guestbook', 
  '/about-emsa', '/terms', '/trademarks', '/privacy', '/login', '/register',
  '/visitor-statistics', '/account/manage'
];

const menuItems = [
  { name: 'Home', path: '/', text: 'Home' },
  { name: 'Administration', path: '/admin', text: 'Emergency Administration' },
  { name: 'ECC', path: '/control', text: 'Emergency Control Centre' },
  { name: 'Ops', path: '/operations', text: 'Emergency Operations' },
  { name: 'FireSafety', path: '/fire-safety', text: 'Fire and Life Safety' },
  { name: 'Maintenance', path: '/maintenance', text: 'Maintenance and Repairs' },
  { name: 'Training', path: '/training', text: 'Training and Development' }
];



// Enhanced LogoSection with dynamic updates
const DynamicLogoSection = styled(LogoSection)<{ $hasDynamicLogo?: boolean }>`
  ${props => props.$hasDynamicLogo && `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 180px;
    
    img {
      background: transparent;
      padding: 5px 0;
      max-height: 50px;
      max-width: 170px;
      object-fit: contain;
      border-radius: 4px;
    }
  `}
`;

// Enhanced TitleSection with dynamic updates
const DynamicTitleSection = styled(TitleSection)<{ $hasDynamicContent?: boolean }>`
  ${props => props.$hasDynamicContent && `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  `}
`;

const DynamicTitle = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 2px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
  letter-spacing: 0.5px;
  line-height: 1.3;
`;

const DynamicSubtitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
`;

const StaticSubtitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
`;

export const RootMaster: React.FC<RootMasterProps> = ({ children }) => {
  const { user, signOut, getDisplayName, userProfile, loading } = useAuth();
  const { headerState } = useHeader();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path: string) => {
    // Check if the path requires authentication
    const protectedPaths = ['/admin', '/control', '/operations', '/fire-safety', '/maintenance', '/training'];
    const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));
    
    if (isProtectedPath && !user) {
      // Store the attempted path for better UX feedback
      sessionStorage.setItem('attemptedPath', path);
      // If trying to access a protected path without authentication, redirect to access denied
      navigate('/access-denied', { state: { from: path } });
    } else {
      // Clear any stored attempted path
      sessionStorage.removeItem('attemptedPath');
      // Allow navigation
      navigate(path);
    }
  };

  // Helper function to get active horizontal menu item based on current path
  const getActiveHorizontalMenuItem = (currentPath: string) => {
    // For PDF viewer, check the source path in sessionStorage
    if (currentPath.startsWith('/pdf-viewer')) {
      const sourcePath = sessionStorage.getItem('pdf_source_path');
      if (sourcePath) {
        if (sourcePath.startsWith('/admin')) return 'Administration';
        if (sourcePath.startsWith('/control')) return 'ECC';
        if (sourcePath.startsWith('/operations')) return 'Ops';
        if (sourcePath.startsWith('/fire-safety')) return 'FireSafety';
        if (sourcePath.startsWith('/maintenance')) return 'Maintenance';
        if (sourcePath.startsWith('/training')) return 'Training';
      }
      return null;
    }
    
    if (homePagePaths.includes(currentPath)) return 'Home';
    
    // Check more specific paths first - Emergency Control Centre takes precedence
    if (currentPath.startsWith('/control')) return 'ECC';
    if (currentPath.startsWith('/admin')) return 'Administration';
    if (currentPath.startsWith('/operations')) return 'Ops';
    if (currentPath.startsWith('/fire-safety')) return 'FireSafety';
    if (currentPath.startsWith('/maintenance')) return 'Maintenance';
    if (currentPath.startsWith('/training')) return 'Training';
    
    return null;
  };

  const activeHorizontalItem = getActiveHorizontalMenuItem(location.pathname);

  // Determine if we have dynamic header content
  const hasDynamicContent = headerState.departmentName && headerState.departmentName.trim().length > 0;
  const hasDynamicLogo = headerState.logoUrl && headerState.logoUrl.trim().length > 0;

  const headerContent = (
    <HeaderPane>
      <HeaderContent>
        <LoginSection>
          {user ? (
            <>
              Welcome<br />
              <span style={{ fontSize: '14px' }}>
                <a href="/account/manage" title="Manage Your Account">
                  {loading ? 'Loading...' : getDisplayName()}
                </a>
              </span><br /><br />
              [<a href="#" onClick={(e) => { 
                e.preventDefault(); 
                signOut().then(() => {
                  navigate('/');
                }).catch(console.error);
              }}>Log Out</a>]
            </>
          ) : (
            <>
              <a href="/login">Log In</a><br /><br />
              <a href="/register">Register Here</a>
            </>
          )}
        </LoginSection>
        
        <DynamicTitleSection $hasDynamicContent={hasDynamicContent}>
          {hasDynamicContent ? (
            <>
              <DynamicTitle>
                {headerState.departmentName && headerState.departmentName.trim().length > 0 
                  ? headerState.departmentName 
                  : 'Emergency Department'}
              </DynamicTitle>
              <DynamicSubtitle>
                {headerState.departmentType && headerState.departmentType.trim().length > 0 
                  ? headerState.departmentType 
                  : 'Fire & Rescue Services'}
              </DynamicSubtitle>
            </>
          ) : (
            <>
              <DynamicTitle>Airport Rescue & FireFighting Services</DynamicTitle>
              <StaticSubtitle>King Fahd International Airport</StaticSubtitle>
            </>
          )}
        </DynamicTitleSection>
        
        <DynamicLogoSection $hasDynamicLogo={hasDynamicLogo}>
          {hasDynamicLogo ? (
            <LogoImage 
              src={headerState.logoUrl}
              alt="Department Logo"
              title={headerState.departmentName}
              style={{
                background: 'transparent',
                padding: '5px 0',
                maxHeight: '50px',
                maxWidth: '170px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <a href="https://daco.sa/" target="_blank" rel="noopener noreferrer">
              <LogoImage 
                src="/images/DACONewLogo.png" 
                alt="DACO Logo"
                title="Dammam Airports Company"
              />
            </a>
          )}
        </DynamicLogoSection>
      </HeaderContent>
    </HeaderPane>
  );

  const navigationContent = (
    <MenuBar>
      {menuItems.map((item, index) => {
        // Check if this menu item requires authentication
        const protectedPaths = ['/admin', '/control', '/operations', '/fire-safety', '/maintenance', '/training'];
        const isProtectedItem = protectedPaths.some(protectedPath => item.path.startsWith(protectedPath));
        const isAccessRestricted = isProtectedItem && !user;
        const isFirst = index === 0;
        const isLast = index === menuItems.length - 1;
        
        return (
          <MenuItem 
            key={item.name}
            $active={activeHorizontalItem === item.name}
            $isFirst={isFirst}
            $isLast={isLast}
            onClick={() => handleMenuClick(item.path)}
            title={isAccessRestricted ? 'Registration required to access this section' : item.text}
            style={{
              opacity: isAccessRestricted ? 0.7 : 1,
              cursor: isAccessRestricted ? 'not-allowed' : 'pointer'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              {item.text}
              {isAccessRestricted && (
                <div style={{
                  fontSize: '8px',
                  color: '#FF6B6B',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  marginTop: '1px'
                }}>
                  [Login Required]
                </div>
              )}
            </div>
          </MenuItem>
        );
      })}
      <Clock />
    </MenuBar>
  );



  const footerContent = (
    <FooterPane>
      <p style={{ margin: 0, textAlign: 'center', fontSize: '13px', fontVariant: 'small-caps' }}>
        <a href="/terms">Terms of Use</a> |
        <a href="/trademarks">Trademarks</a> |
        <a href="/privacy">Privacy Statement</a> |
        <a href="/about-emsa">EMSAfrica Pty Ltd</a>
      </p>
    </FooterPane>
  );

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      transform: 'none',
      transformOrigin: 'center center'
    }}>
      {headerContent}
      {navigationContent}
      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        /* Allow PDF content to maintain transforms */
        transform: 'none'
      }}>
        {children}
      </div>
      {footerContent}
    </div>
  );
};