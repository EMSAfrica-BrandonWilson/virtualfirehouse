import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '../components/UI/Modal';

interface ModalContextType {
  showModal: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  resolve?: () => void;
}

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showModal = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<void> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        resolve
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setModalState(prev => {
      if (prev.resolve) {
        prev.resolve();
      }
      return {
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
      };
    });
  }, []);

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        title={modalState.title}
        type={modalState.type}
      >
        {modalState.message}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};