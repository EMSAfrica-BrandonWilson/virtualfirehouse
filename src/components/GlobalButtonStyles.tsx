import styled, { createGlobalStyle } from 'styled-components';

// Global button styles that match the horizontal menubar color scheme
export const GlobalButtonStyles = createGlobalStyle`
  /* Site-wide button styling to match horizontal menubar */
  button:not(.custom-styled):not(.dx-button):not(.no-global-styles) {
    background: #4682B4 !important;
    color: white !important;
    border: 1px solid #36678F !important;
    padding: 8px 16px !important;
    font-family: Verdana, Arial, sans-serif !important;
    font-size: 11px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    border-radius: 0 !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: #5A9BCE !important;
      color: white !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    }
    
    &:active {
      background: #36678F !important;
      color: white !important;
    }
    
    &:disabled {
      background: #CCCCCC !important;
      color: #666666 !important;
      border-color: #999999 !important;
      cursor: not-allowed !important;
      
      &:hover {
        background: #CCCCCC !important;
        color: #666666 !important;
        box-shadow: none !important;
      }
    }
  }
  
  /* Primary action buttons (for important actions) */
  button.primary-action:not(.dx-button):not(.no-global-styles) {
    background: #FF9900 !important;
    border-color: #E68900 !important;
    
    &:hover {
      background: #FFB533 !important;
    }
    
    &:active {
      background: #E68900 !important;
    }
  }
  
  /* Success buttons */
  button.success-action:not(.dx-button):not(.no-global-styles) {
    background: #28a745 !important;
    border-color: #1e7e34 !important;
    
    &:hover {
      background: #34ce57 !important;
    }
    
    &:active {
      background: #1e7e34 !important;
    }
  }
  
  /* Danger buttons */
  button.danger-action:not(.dx-button):not(.no-global-styles) {
    background: #dc3545 !important;
    border-color: #c82333 !important;
    
    &:hover {
      background: #e64553 !important;
    }
    
    &:active {
      background: #c82333 !important;
    }
  }
  
  /* Warning buttons */
  button.warning-action:not(.dx-button):not(.no-global-styles) {
    background: #ffc107 !important;
    color: black !important;
    border-color: #e0a800 !important;
    
    &:hover {
      background: #ffd533 !important;
      color: black !important;
    }
    
    &:active {
      background: #e0a800 !important;
      color: black !important;
    }
  }
  
  /* Info buttons */
  button.info-action:not(.dx-button):not(.no-global-styles) {
    background: #17a2b8 !important;
    border-color: #138496 !important;
    
    &:hover {
      background: #46b5d1 !important;
    }
    
    &:active {
      background: #138496 !important;
    }
  }
`;

// Styled button components for explicit use
export const MenuBarButton = styled.button<{ $variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' }>`
  background: ${props => {
    switch(props.$variant) {
      case 'primary': return '#FF9900';
      case 'success': return '#28a745';
      case 'danger': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#4682B4';
    }
  }};
  color: ${props => props.$variant === 'warning' ? 'black' : 'white'};
  border: 1px solid ${props => {
    switch(props.$variant) {
      case 'primary': return '#E68900';
      case 'success': return '#1e7e34';
      case 'danger': return '#c82333';
      case 'warning': return '#e0a800';
      case 'info': return '#138496';
      default: return '#36678F';
    }
  }};
  padding: 8px 16px;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      switch(props.$variant) {
        case 'primary': return '#FFB533';
        case 'success': return '#34ce57';
        case 'danger': return '#e64553';
        case 'warning': return '#ffd533';
        case 'info': return '#46b5d1';
        default: return '#5A9BCE';
      }
    }};
    color: ${props => props.$variant === 'warning' ? 'black' : 'white'};
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  &:active {
    background: ${props => {
      switch(props.$variant) {
        case 'primary': return '#E68900';
        case 'success': return '#1e7e34';
        case 'danger': return '#c82333';
        case 'warning': return '#e0a800';
        case 'info': return '#138496';
        default: return '#36678F';
      }
    }};
  }
  
  &:disabled {
    background: #CCCCCC;
    color: #666666;
    border-color: #999999;
    cursor: not-allowed;
    
    &:hover {
      background: #CCCCCC;
      color: #666666;
      box-shadow: none;
    }
  }
`;