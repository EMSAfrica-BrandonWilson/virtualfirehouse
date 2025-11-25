import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminCheck } from './useAdminCheck';

/**
 * Custom hook to manage the Emergency Administration sub menu visibility
 * Shows the sub menu only on Image Management and User Role Management pages
 */
export const useEmergencyAdminSubMenu = () => {
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
  const location = useLocation();
  const { isAdmin, isSystemAdmin } = useAdminCheck();

  // Pages where the sub menu should be displayed
  const targetPages = [
    '/admin/image-management',
    '/admin/user-role-management',
    '/admin/register/staff',
    '/admin/register/vehicles',
    '/admin/register/staff-dropdown-management',
    '/admin/register/vehicle-dropdown-management'
  ];

  // Check if current page should show the sub menu
  const shouldShowSubMenu = () => {
    // Must be an admin user
    if (!isAdmin) return false;
    
    // Must be on one of the target pages
    const isTargetPage = targetPages.some(page => location.pathname === page);
    
    // For User Role Management, must be System Administrator
    if (location.pathname === '/admin/user-role-management' && !isSystemAdmin) {
      return false;
    }
    
    return isTargetPage;
  };

  // Auto-show/hide sub menu based on current route
  useEffect(() => {
    const shouldShow = shouldShowSubMenu();
    setIsSubMenuVisible(shouldShow);
  }, [location.pathname, isAdmin, isSystemAdmin]);

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