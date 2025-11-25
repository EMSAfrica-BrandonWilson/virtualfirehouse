import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminCheck } from '../../hooks/useAdminCheck';

const SubMenuContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 120px;
  right: 20px;
  width: 280px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 1rem;
  z-index: 1000;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease-in-out;
  border: 2px solid #ffa500;
  
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin: 1rem 0;
    border-radius: 8px;
  }
`;

const SubMenuHeader = styled.h3`
  color: #ffa500;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 165, 0, 0.3);
  text-align: center;
`;

const SubMenuItem = styled.button<{ $isActive: boolean }>`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #ffa500, #ff8c00)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$isActive ? '#000' : '#fff'};
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$isActive 
    ? '#ffa500' 
    : 'rgba(255, 255, 255, 0.2)'};
  
  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, #ff8c00, #ff7700)' 
      : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #ffa500;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 165, 0, 0.2);
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

interface EmergencyAdminSubMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export const EmergencyAdminSubMenu: React.FC<EmergencyAdminSubMenuProps> = ({ 
  isVisible, 
  onClose 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSystemAdmin } = useAdminCheck();

  // Emergency Administration menu items
  const adminMenuItems = [
    { name: 'register', path: '/admin/register', text: 'Register Your Service' },
    { name: 'hr', path: '/admin/hr', text: 'Human Resources Section' },
    { name: 'monthly-shift-calendar', path: '/admin/service/monthly-shift-calendar', text: 'Monthly Shift Calendar' },
    { name: 'finance', path: '/admin/finance', text: 'Finance Section' },
    { name: 'regulatory-docs', path: '/admin/regulatory-docs', text: 'Regulatory Documents' },
    { name: 'sops', path: '/admin/sops', text: 'Standard Operating Procedures' },
    { name: 'orders', path: '/admin/orders', text: 'Station Orders' },
    { name: 'image-management', path: '/admin/image-management', text: 'Image Management' },
    ...(isSystemAdmin ? [{ name: 'user-role-management', path: '/admin/user-role-management', text: 'User Role Management' }] : []),
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const isCurrentPath = (path: string) => {
    // Check for exact match first
    if (location.pathname === path) {
      return true;
    }
    
    // Special handling for register section:
    // If we're on staff or vehicle dropdown management pages,
    // highlight the parent register section as active
    if (path === '/admin/register') {
      return location.pathname.startsWith('/admin/register/');
    }
    
    return false;
  };

  return (
    <SubMenuContainer $isVisible={isVisible}>
      <CloseButton onClick={onClose} aria-label="Close sub menu">
        ×
      </CloseButton>
      
      <SubMenuHeader>
        Emergency Administration
      </SubMenuHeader>
      
      {adminMenuItems.map((item) => (
        <SubMenuItem
          key={item.name}
          $isActive={isCurrentPath(item.path)}
          onClick={() => handleMenuClick(item.path)}
          aria-label={`Navigate to ${item.text}`}
        >
          {item.text}
        </SubMenuItem>
      ))}
    </SubMenuContainer>
  );
};