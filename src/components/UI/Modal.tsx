import React from 'react';
import styled from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $type?: string }>`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  text-align: center;
  border-left: 5px solid ${props => {
    switch (props.$type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#1177BB';
    }
  }};
`;

const ModalTitle = styled.h3<{ $type?: string }>`
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#28a745';
      case 'warning': return '#856404';
      case 'error': return '#dc3545';
      default: return '#1177BB';
    }
  }};
  margin-bottom: 20px;
  font-size: 1.4rem;
  font-weight: bold;
`;

const ModalText = styled.p`
  color: #333;
  margin-bottom: 25px;
  line-height: 1.5;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: left;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const ModalButton = styled.button<{ $type?: string }>`
  background-color: ${props => {
    switch (props.$type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#1177BB';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'warning': return '#212529';
      default: return 'white';
    }
  }};
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #333;
  }
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent $type={type} onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <CloseButton onClick={onClose}>&times;</CloseButton>
        )}
        <ModalTitle $type={type}>{title}</ModalTitle>
        <ModalText>{children}</ModalText>
        <ButtonContainer>
          <ModalButton $type={type} onClick={onClose}>
            OK
          </ModalButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};