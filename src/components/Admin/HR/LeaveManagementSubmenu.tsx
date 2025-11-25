import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const SubmenuContainer = styled.div`
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #1177BB;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SubmenuTitle = styled.h3`
  font-size: 1.1rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FF9900;
`;

const SubmenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SubmenuItem = styled.li<{ $isActive: boolean }>`
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SubmenuButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  padding: 12px 15px;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #1177BB, #0d5a8f)' 
    : '#fff'};
  color: ${props => props.$isActive ? '#fff' : '#333'};
  border: 2px solid ${props => props.$isActive ? '#1177BB' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, #0d5a8f, #094571)' 
      : '#f8f9fa'};
    border-color: #1177BB;
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(17, 119, 187, 0.2);
  }
  
  &:active {
    transform: translateX(3px);
  }
`;

interface LeaveManagementSubmenuProps {
  className?: string;
}

export const LeaveManagementSubmenu: React.FC<LeaveManagementSubmenuProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      path: '/admin/hr/leave-management', 
      text: 'Leave Management',
      exact: true 
    },
    { 
      path: '/admin/hr/leave-management/recording', 
      text: 'Leave Recording' 
    },
    { 
      path: '/admin/hr/leave-management/records', 
      text: 'Leave Records' 
    },
    { 
      path: '/admin/hr/leave-management/individual', 
      text: 'Individual Leave Records' 
    },
  ];

  const isCurrentPath = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <SubmenuContainer className={className}>
      <SubmenuTitle>Leave Management</SubmenuTitle>
      <SubmenuList>
        {menuItems.map((item) => (
          <SubmenuItem 
            key={item.path}
            $isActive={isCurrentPath(item.path, item.exact)}
          >
            <SubmenuButton
              $isActive={isCurrentPath(item.path, item.exact)}
              onClick={() => handleNavigation(item.path)}
              aria-label={`Navigate to ${item.text}`}
              aria-current={isCurrentPath(item.path, item.exact) ? 'page' : undefined}
            >
              {item.text}
            </SubmenuButton>
          </SubmenuItem>
        ))}
      </SubmenuList>
    </SubmenuContainer>
  );
};
