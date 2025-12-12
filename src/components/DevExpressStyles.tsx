import styled, { createGlobalStyle } from 'styled-components';

// DevExpress Aqua theme colors
export const DevExpressTheme = {
  primary: '#1177BB',
  steel: '#4682B4', 
  orange: '#FF9900',
  lightBlue: '#BFDBFF',
  darkBlue: '#5689C5',
  lightGray: '#E1E1E1',
  darkGray: '#999999',
  white: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#4B4B57'
};

// Global DevExpress-like styles
export const DevExpressGlobalStyles = createGlobalStyle`
  body {
    font-family: Verdana, Arial, sans-serif;
    font-size: 11px;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  
  .dx-theme-aqua {
    font-family: Verdana, Arial, sans-serif;
  }
  
  /* Reset transforms for non-PDF content only */
  *:not(.react-pdf__Page):not(.react-pdf__Page__canvas):not(.react-pdf__Page__textContent):not(.react-pdf__Page__annotations) {
    transform: none !important;
    transform-origin: unset !important;
  }
  
  /* Allow PDF content to maintain its transforms for rotation */
  .react-pdf__Page,
  .react-pdf__Page__canvas,
  .react-pdf__Page__textContent,
  .react-pdf__Page__annotations {
    transform-origin: center center !important;
  }
  
  /* Animation for PDF viewer indicator */
  @keyframes pulse {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  }
`;

// Header styled components
export const HeaderPane = styled.div`
  background: linear-gradient(to bottom, #1177BB 0%, #0E5A8A 100%);
  color: white;
  height: 88px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  position: relative;
  border-bottom: 2px solid #0D4F7C;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const LogoSection = styled.div`
  width: 189px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 20px;
`;

export const LogoImage = styled.img`
  max-width: 189px;
  max-height: 76px;
  object-fit: contain;
  background: transparent;
`;

export const TitleSection = styled.div`
  flex: 1;
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  line-height: 1.3;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
  letter-spacing: 0.5px;
  
  /* Make the first line (main title) even more prominent */
  & > span:first-child {
    font-size: 28px;
    font-weight: 900;
    display: block;
    margin-bottom: 2px;
  }
`;

export const LoginSection = styled.div`
  width: 200px;
  text-align: left;
  color: white;
  font-size: 13px;
  font-weight: bold;
  
  a {
    color: white;
    text-decoration: none;
    border-bottom: 1px dashed white;
    
    &:hover {
      color: #FFD700;
      border-bottom-color: #FFD700;
    }
  }
`;

// Menu styled components
export const MenuBar = styled.div`
  background: linear-gradient(to bottom, #4682B4 0%, #36678F 100%);
  height: 35px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #2C5282;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 5px;
  position: relative;
`;

export const MenuItem = styled.div<{ $active?: boolean; $isFirst?: boolean; $isLast?: boolean }>`
  background: ${props => props.$active ? '#FF9900' : '#4682B4'};
  color: white;
  padding: 8px 16px;
  margin: 2px 1px;
  margin-left: ${props => props.$isFirst ? '1px' : '6px'};
  margin-right: ${props => props.$isLast ? '1px' : '6px'};
  font-family: Verdana, Arial, sans-serif;
  font-size: 10pt;
  font-weight: normal;
  cursor: pointer;
  border: 1px solid transparent;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
  position: relative;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.$active ? '#FF7400' : '#FFC100'};
    color: ${props => props.$active ? 'white' : 'black'};
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

export const ClockDisplay = styled.div`
  background: transparent;
  color: white;
  padding: 4px 12px;
  margin: 2px 1px;
  margin-left: auto;
  font-family: Verdana, Arial, sans-serif;
  font-size: 9pt;
  font-weight: bold;
  border: none;
  box-shadow: none;
  height: 31px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  min-width: 120px;
  cursor: default;
`;

// Content panes
export const ContentPane = styled.div`
  background: white;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const LeftPane = styled.div`
  background: #E1E1E1;
  padding: 5px;
  border-right: 1px solid #CCCCCC;
  overflow: auto;
`;

export const RightPane = styled.div`
  background: #E1E1E1;
  padding: 5px;
  border-left: 1px solid #CCCCCC;
  overflow: auto;
`;

// Vertical menu items
export const VerticalMenuItem = styled.div<{ $active?: boolean; $isInactive?: boolean }>`
  background: ${props => props.$isInactive ? '#CCCCCC' : (props.$active ? '#FF9900' : '#4682B4')};
  color: ${props => props.$isInactive ? '#666666' : 'white'};
  padding: 8px 12px;
  margin: 1px 0;
  font-family: Verdana, Arial, sans-serif;
  font-size: 10pt;
  cursor: ${props => props.$isInactive ? 'default' : 'pointer'};
  border: 1px dotted #CCCCCC;
  transition: all 0.2s ease;
  font-weight: ${props => props.$isInactive ? 'bold' : 'normal'};
  font-style: ${props => props.$isInactive ? 'italic' : 'normal'};
  position: relative;
  border-left: ${props => props.$active ? '4px solid #FF6B00' : '1px dotted #CCCCCC'};
  box-shadow: ${props => props.$active ? 'inset 0 0 8px rgba(0, 0, 0, 0.2), 0 0 4px rgba(255, 153, 0, 0.4)' : 'none'};
  
  &:hover {
    background: ${props => props.$isInactive ? '#CCCCCC' : (props.$active ? '#FF7400' : '#FFC100')};
    color: ${props => props.$isInactive ? '#666666' : (props.$active ? 'white' : 'black')};
    border-left: ${props => props.$active ? '4px solid #FF6B00' : '1px dotted #FFC100'};
    box-shadow: ${props => props.$active ? 'inset 0 0 8px rgba(0, 0, 0, 0.2), 0 0 8px rgba(255, 153, 0, 0.6)' : '0 2px 4px rgba(255, 193, 0, 0.3)'};
    transform: ${props => props.$isInactive ? 'none' : 'translateX(2px)'};
  }
  
  /* Enhanced visual indicator for PDF viewer context */
  &::before {
    content: '';
    position: absolute;
    left: -2px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${props => props.$active ? 'linear-gradient(to bottom, #FF6B00, #FF9900, #FF7400)' : 'transparent'};
    border-radius: 0 2px 2px 0;
    transition: all 0.3s ease;
  }
  
  /* PDF viewer indicator dot */
  &::after {
    content: '';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: ${props => props.$active ? '#FFD700' : 'transparent'};
    border-radius: 50%;
    box-shadow: ${props => props.$active ? '0 0 4px rgba(255, 215, 0, 0.8)' : 'none'};
    transition: all 0.3s ease;
  }
`;

// Footer
export const FooterPane = styled.div`
  background: #EDEDED;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #CCCCCC;
  font-family: Verdana, Arial, sans-serif;
  font-size: 13px;
  color: #0000FF;
  
  a {
    color: #0000FF;
    text-decoration: none;
    margin: 0 5px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Buttons
export const DevExpressButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'disabled' | 'danger' | 'success' | 'warning' | 'info' }>`
  /* Override all browser default button styles */
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background: ${props => {
    switch(props.$variant) {
      case 'primary': return '#FF9900';
      case 'disabled': return '#FF9900';
      case 'danger': return '#dc3545';
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#FF9900';
    }
  }} !important;
  color: white !important;
  border: 1px solid ${props => {
    switch(props.$variant) {
      case 'primary': return '#E68900';
      case 'disabled': return '#E68900';
      case 'danger': return '#c82333';
      case 'success': return '#1e7e34';
      case 'warning': return '#e0a800';
      case 'info': return '#138496';
      default: return '#E68900';
    }
  }} !important;
  padding: 8px 16px !important;
  font-family: Verdana, Arial, sans-serif !important;
  font-size: 11px !important;
  font-weight: bold !important;
  cursor: ${props => props.$variant === 'disabled' ? 'not-allowed' : 'pointer'} !important;
  border-radius: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  opacity: ${props => props.$variant === 'disabled' ? '0.8' : '1'} !important;
  
  &:hover {
    background: ${props => {
      if (props.$variant === 'disabled') return '#FF9900';
      switch(props.$variant) {
        case 'primary': return '#FFB533';
        case 'danger': return '#e64553';
        case 'success': return '#34ce57';
        case 'warning': return '#ffd533';
        case 'info': return '#46b5d1';
        default: return '#FFB533';
      }
    }} !important;
  }
  
  &:focus {
    background: ${props => {
      switch(props.$variant) {
        case 'primary': return '#FF9900';
        case 'disabled': return '#FF9900';
        case 'danger': return '#dc3545';
        case 'success': return '#28a745';
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        default: return '#FF9900';
      }
    }} !important;
    outline: none !important;
  }
  
  &:active {
    background: ${props => {
      switch(props.$variant) {
        case 'primary': return '#E68900';
        case 'disabled': return '#FF9900';
        case 'danger': return '#c82333';
        case 'success': return '#1e7e34';
        case 'warning': return '#e0a800';
        case 'info': return '#138496';
        default: return '#E68900';
      }
    }} !important;
  }
`;

// Image containers
export const DirectorImageContainer = styled.div`
  background: #4682B4;
  width: 100%;
  margin-bottom: 10px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 170px;
    object-fit: contain;
    object-position: center;
    display: block;
    background: #4682B4;
  }
`;

export const AdvertiseImageContainer = styled.div`
  background: #4682B4;
  width: 100%;
  margin-top: 10px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 90px;
    object-fit: contain;
    object-position: center;
    display: block;
    background: #4682B4;
  }
`;
