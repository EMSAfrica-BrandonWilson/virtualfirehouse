import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HeaderState {
  departmentName: string;
  departmentType: string;
  logoUrl: string;
}

interface HeaderContextType {
  headerState: HeaderState;
  updateHeader: (updates: Partial<HeaderState>) => void;
  clearHeader: () => void;
  resetHeader: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

interface HeaderProviderProps {
  children: ReactNode;
}

const HEADER_STORAGE_KEY = 'vfh_header_state';

const defaultHeaderState: HeaderState = {
  departmentName: '',
  departmentType: '',
  logoUrl: ''
};

export const HeaderProvider: React.FC<HeaderProviderProps> = ({ children }) => {
  const [headerState, setHeaderState] = useState<HeaderState>(() => {
    // Initialize state with localStorage data if available
    try {
      const savedState = localStorage.getItem(HEADER_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log('Initializing header state from localStorage:', parsedState);
        return parsedState;
      }
    } catch (error) {
      console.error('Error loading header state from localStorage during initialization:', error);
    }
    return defaultHeaderState;
  });

  // Additional effect to handle localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HEADER_STORAGE_KEY && e.newValue) {
        try {
          const parsedState = JSON.parse(e.newValue);
          console.log('Header state updated from storage event:', parsedState);
          setHeaderState(parsedState);
        } catch (error) {
          console.error('Error parsing header state from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);



  const updateHeader = (updates: Partial<HeaderState>) => {
    setHeaderState(prev => {
      const newState = { ...prev, ...updates };
      console.log('Updating header state:', updates, 'New state:', newState);
      
      // Immediately save to localStorage
      try {
        localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(newState));
        console.log('Header state immediately saved to localStorage:', newState);
      } catch (error) {
        console.error('Error immediately saving header state:', error);
      }
      
      return newState;
    });
  };

  const clearHeader = () => {
    console.log('Clearing header state');
    setHeaderState(defaultHeaderState);
  };

  const resetHeader = () => {
    console.log('Resetting header state');
    try {
      localStorage.removeItem(HEADER_STORAGE_KEY);
      setHeaderState(defaultHeaderState);
      console.log('Header state reset to default');
    } catch (error) {
      console.error('Error resetting header state:', error);
    }
  };

  return (
    <HeaderContext.Provider value={{
      headerState,
      updateHeader,
      clearHeader,
      resetHeader
    }}>
      {children}
    </HeaderContext.Provider>
  );
};
