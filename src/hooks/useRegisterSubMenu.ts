import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminCheck } from './useAdminCheck';

/**
 * Custom hook to manage the Register section sub menu visibility
 * Shows the sub menu on the Register landing page and all register sub-pages
 */
export const useRegisterSubMenu = () => {
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAdminCheck();

  // Pages where the sub menu should be displayed
  const shouldShowSubMenu = () => {
    // Must be an admin user
    if (!isAdmin) return false;
    
    // Show on any page that starts with /admin/register
    return location.pathname.startsWith('/admin/register');
  };

  // Auto-show/hide sub menu based on current route
  useEffect(() => {
    const shouldShow = shouldShowSubMenu();
    setIsSubMenuVisible(shouldShow);
  }, [location.pathname, isAdmin]);

  const showSubMenu = () => setIsSubMenuVisible(true);
  const hideSubMenu = () => setIsSubMenuVisible(false);
  const toggleSubMenu = () => setIsSubMenuVisible(!isSubMenuVisible);

  return {
    isSubMenuVisible,
    shouldShowSubMenu: shouldShowSubMenu(),
    showSubMenu,
    hideSubMenu,
    toggleSubMenu
  };
};
