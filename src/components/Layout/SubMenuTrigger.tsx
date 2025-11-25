import React from 'react';
import styled from 'styled-components';

const TriggerButton = styled.button<{ $isVisible: boolean }>`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  border: 2px solid #fff;
  box-shadow: 0 4px 16px rgba(255, 165, 0, 0.4);
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #000;
  font-weight: bold;
  transition: all 0.3s ease;
  opacity: ${props => props.$isVisible ? 0.9 : 1};
  
  &:hover {
    background: linear-gradient(135deg, #ff8c00, #ff7700);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 165, 0, 0.6);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    top: 60px;
    right: 15px;
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
`;

const TriggerIcon = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
`;

interface SubMenuTriggerProps {
  isSubMenuVisible: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export const SubMenuTrigger: React.FC<SubMenuTriggerProps> = ({
  isSubMenuVisible,
  onClick,
  ariaLabel = "Toggle Emergency Administration sub menu"
}) => {
  return (
    <TriggerButton
      $isVisible={isSubMenuVisible}
      onClick={onClick}
      aria-label={ariaLabel}
      title={isSubMenuVisible ? "Close sub menu" : "Open Emergency Administration sub menu"}
    >
      <TriggerIcon $isOpen={isSubMenuVisible}>
        {isSubMenuVisible ? '×' : '☰'}
      </TriggerIcon>
    </TriggerButton>
  );
};