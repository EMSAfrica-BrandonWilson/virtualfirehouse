import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isAccessDeniedPage: boolean;
  setIsAccessDeniedPage: (value: boolean) => void;
  activeRestrictedMenuItems: string[];
  setActiveRestrictedMenuItems: (items: string[]) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [isAccessDeniedPage, setIsAccessDeniedPage] = useState(false);
  const [activeRestrictedMenuItems, setActiveRestrictedMenuItems] = useState<string[]>([]);

  return (
    <UIContext.Provider value={{
      isAccessDeniedPage,
      setIsAccessDeniedPage,
      activeRestrictedMenuItems,
      setActiveRestrictedMenuItems
    }}>
      {children}
    </UIContext.Provider>
  );
};
