import React, { useEffect } from 'react';
import styled from 'styled-components';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // ms
  onClose?: () => void;
}

const ToastContainer = styled.div<{ $type: ToastType }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  background-color: ${({ $type }) => ($type === 'success' ? '#28a745' : $type === 'error' ? '#dc3545' : '#1177BB')};
`;

const CloseButton = styled.button`
  border: none;
  background: rgba(255,255,255,0.2);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
  &:hover { background: rgba(255,255,255,0.3); }
`;

const Icon = styled.span`
  font-size: 16px;
`;

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose?.(); }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <ToastContainer role="status" aria-live="polite" $type={type}>
      <Icon>{icon}</Icon>
      <span>{message}</span>
      <CloseButton onClick={onClose}>Close</CloseButton>
    </ToastContainer>
  );
};

export default Toast;