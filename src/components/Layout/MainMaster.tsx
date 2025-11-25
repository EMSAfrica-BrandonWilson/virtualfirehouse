import React, { useState, useEffect } from 'react';
import { DevExpressSplitter } from '../DevExpressSplitter';
import { LeftPane, ContentPane, VerticalMenuItem } from '../DevExpressStyles';
import { EnhancedRightPane } from '../UI/EnhancedRightPane';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../../contexts/UIContext';
import { useAdminCheck } from '../../hooks/useAdminCheck';
import { useUserFireStations } from '../../hooks/useUserFireStations';
import { useUserFireStationMenuItems } from '../../hooks/useUserFireStationMenuItems';



interface MainMasterProps {
  children: React.ReactNode;
}

// Define HOME page related paths
const homePagePaths = [
  '/', '/vision', '/mission', '/intro', '/summary', '/fd-way', 
  '/philosophy', '/rules', '/about-us', '/contact-us', '/guestbook', 
  '/about-emsa', '/terms', '/trademarks', '/privacy', '/login', '/register',
  '/visitor-statistics'
];

// Helper function to format PDF source path for display
const getDisplayPathName = (path: string): string => {
  if (!path) return 'Unknown';
  
  const pathMap: { [key: string]: string } = {
    '/control/daily-duty-rostering/vehicle-station-assignment': 'Vehicle Station Assignment',
    '/control/daily-duty-rostering/vehicles-in-service': 'Vehicles: In Service',
    '/control/daily-duty-rostering/vehicles-out-of-service': 'Vehicles: Out of Service',
    '/control/daily-occurrence-book/reports': 'eDOB Reports',
    '/control/daily-occurrence-book/emergency-reports': 'Emergency Reports',
    '/control/ecc-checklists/refuelling-log-book/records': 'Refuelling Logbook',
    '/admin/register/staff/reports': 'Staff Reports',
    '/admin/register/equipment-room-management': 'Equipment & Room Management',
    '/admin/hr/leave-management/records': 'Leave Records',
    '/admin/hr/leave-management/individual': 'Individual Leave Records',
    '/admin/regulatory-docs/compliance': 'Compliance Records',
    '/admin/regulatory-docs/icao': 'ICAO Documents',
    '/admin/regulatory-docs/gacar': 'GACAR Regulations',
    '/admin/regulatory-docs/local': 'Local Regulations',
    '/admin/orders': 'Station Orders',
    '/admin/sops': 'Standard Operating Procedures',
    '/contact-us': 'Contact Us',
    '/guestbook': 'Guestbook'
  };
  
  return pathMap[path] || path.split('/').pop()?.replace(/-/g, ' ') || 'Document';
};

// Clean contextual left navigation based on current route
const getLeftMenuItems = (currentPath: string, isSystemAdmin: boolean = false, userFireStations: any[] = [], userFireStationMenuItems: any[] = []) => {
  // Handle PDF viewer with context from source section
  if (currentPath.startsWith('/pdf-viewer/')) {
    const pdfSourceSection = sessionStorage.getItem('pdf_source_section');
    const pdfSourcePath = sessionStorage.getItem('pdf_source_path');
    
    // Debug: Log what we're getting from sessionStorage
    console.log('📋 PDF Viewer Menu Generation Debug:');
    console.log('- currentPath:', currentPath);
    console.log('- pdfSourceSection:', pdfSourceSection);
    console.log('- pdfSourcePath:', pdfSourcePath);
    
    if (pdfSourceSection && pdfSourcePath) {
      console.log('- Using source path:', pdfSourcePath, 'to generate menu items');
      // Use the stored source path to determine menu items for precise sub-menus
      return getLeftMenuItems(pdfSourcePath, isSystemAdmin, userFireStations, userFireStationMenuItems);
    }
  }
  // Home Page Sub-Navigation - show for all HOME-related pages
  if (homePagePaths.includes(currentPath)) {
    return [
      { name: 'vision', path: '/vision', text: 'Our Vision Statement' },
      { name: 'mission', path: '/mission', text: 'Our Mission Statement' },
      { name: 'intro', path: '/intro', text: 'Introduction' },
      { name: 'summary', path: '/summary', text: 'Executive Summary' },
      { name: 'fd-way', path: '/fd-way', text: 'The FD-Way' },
      { name: 'philosophy', path: '/philosophy', text: 'Philosophy and Culture' },
      { name: 'rules', path: '/rules', text: 'Our Rules of Conduct' },
      { name: 'about-us', path: '/about-us', text: 'About Us' },
      { name: 'contact-us', path: '/contact-us', text: 'Contact Us' },
      { name: 'guestbook', path: '/guestbook', text: 'Sign Our Guestbook' },
      { name: 'about-emsa', path: '/about-emsa', text: 'About EMS Africa Pty Ltd' },
    ];
  }
  
  // Emergency Administration Module with comprehensive menu structure
  if (currentPath.startsWith('/admin')) {
    // Main admin sections
    if (currentPath === '/admin') {
      return [
        { name: 'register', path: '/admin/register', text: 'Register Your Service' },
        { name: 'hr', path: '/admin/hr', text: 'Human Resources Section' },
        { name: 'finance', path: '/admin/finance', text: 'Finance Section' },
        { name: 'regulatory-docs', path: '/admin/regulatory-docs', text: 'Regulatory Documents' },
        { name: 'sops', path: '/admin/sops', text: 'Std Operating Procedures' },
        { name: 'orders', path: '/admin/orders', text: 'Station Orders' },

        ...(isSystemAdmin ? [{ name: 'user-role-management', path: '/admin/user-role-management', text: 'User Role Management' }] : []),
      ];
    }
    
    // Leave Management sub-menu (detailed view when in leave-management section)
    if (currentPath.startsWith('/admin/hr/leave-management')) {
      return [
        { name: 'leave-management-overview', path: '/admin/hr/leave-management', text: 'Leave Management Overview' },
        { name: 'leave-recording', path: '/admin/hr/leave-management/recording', text: 'Leave Recording' },
        { name: 'leave-records', path: '/admin/hr/leave-management/records', text: 'Leave Records' },
        { name: 'individual-leave-records', path: '/admin/hr/leave-management/individual', text: 'Individual Leave Records' },
        { name: 'leave-statistics', path: '/admin/hr/leave-management/statistics', text: 'Leave Statistics' },
      ];
    }
    
    // Human Resources sub-menu
    if (currentPath.startsWith('/admin/hr')) {
      return [
        { name: 'hr-main', path: '/admin/hr', text: 'Human Resources Section' },
        { name: 'management-structure', path: '/admin/hr/management-structure', text: 'Management Structure' },
        { name: 'organizational-structure', path: '/admin/hr/organizational-structure', text: 'Organisational Structure' },
        { name: 'shift-structure', path: '/admin/hr/shift-structure', text: 'Shift Structure' },
        { name: 'leave-management', path: '/admin/hr/leave-management', text: 'Leave Management' },
        { name: 'job-descriptions', path: '/admin/hr/job-descriptions', text: 'Job Descriptions' },
        { name: 'recruitment-process', path: '/admin/hr/recruitment-process', text: 'Recruitment Process' },
        { name: 'hr-reports', path: '/admin/hr/reports', text: 'HR Reports' },
      ];
    }
    
    // Finance sub-menu
    if (currentPath.startsWith('/admin/finance')) {
      return [
        { name: 'finance-main', path: '/admin/finance', text: 'Finance Section' },
        { name: 'budget-planning', path: '/admin/finance/budget-planning', text: 'Budget Planning' },
        { name: 'financial-reports', path: '/admin/finance/reports', text: 'Financial Reports' },
        { name: 'expense-tracking', path: '/admin/finance/expense-tracking', text: 'Expense Tracking' },
        { name: 'procurement', path: '/admin/finance/procurement', text: 'Procurement Management' },
        { name: 'audit-records', path: '/admin/finance/audit-records', text: 'Audit Records' },
      ];
    }
    
    // Regulatory Documents sub-menu
    if (currentPath.startsWith('/admin/regulatory-docs')) {
      return [
        { name: 'regulatory-main', path: '/admin/regulatory-docs', text: 'Regulatory Documents' },
        { name: 'icao-docs', path: '/admin/regulatory-docs/icao', text: 'ICAO Documents' },
        { name: 'gacar-docs', path: '/admin/regulatory-docs/gacar', text: 'GACAR Regulations' },
        { name: 'local-regulations', path: '/admin/regulatory-docs/local', text: 'Local Regulations' },
        { name: 'compliance-records', path: '/admin/regulatory-docs/compliance', text: 'Compliance Records' },
      ];
    }
    
    // Standard Operating Procedures - show main admin menu
    if (currentPath.startsWith('/admin/sops')) {
      return [
        { name: 'register', path: '/admin/register', text: 'Register Your Service' },
        { name: 'hr', path: '/admin/hr', text: 'Human Resources Section' },
        { name: 'finance', path: '/admin/finance', text: 'Finance Section' },
        { name: 'regulatory-docs', path: '/admin/regulatory-docs', text: 'Regulatory Documents' },
        { name: 'sops', path: '/admin/sops', text: 'Std Operating Procedures' },
        { name: 'orders', path: '/admin/orders', text: 'Station Orders' },
        ...(isSystemAdmin ? [{ name: 'user-role-management', path: '/admin/user-role-management', text: 'User Role Management' }] : []),
      ];
    }
    
    // Station Orders - show main admin menu
    if (currentPath.startsWith('/admin/orders')) {
      return [
        { name: 'register', path: '/admin/register', text: 'Register Your Service' },
        { name: 'hr', path: '/admin/hr', text: 'Human Resources Section' },
        { name: 'finance', path: '/admin/finance', text: 'Finance Section' },
        { name: 'regulatory-docs', path: '/admin/regulatory-docs', text: 'Regulatory Documents' },
        { name: 'sops', path: '/admin/sops', text: 'Std Operating Procedures' },
        { name: 'orders', path: '/admin/orders', text: 'Station Orders' },
        ...(isSystemAdmin ? [{ name: 'user-role-management', path: '/admin/user-role-management', text: 'User Role Management' }] : []),
      ];
    }
    
    // Register section - Department sub-menu
    if (currentPath.startsWith('/admin/register/department')) {
      return [
        { name: 'department-overview', path: '/admin/register/department', text: 'Department Overview' },
        { name: 'registration-form', path: '/admin/register/department/process', text: 'Department Registration' },
        { name: 'department-reports', path: '/admin/register/department/reports', text: 'Department Reports' },
        { name: 'department-details', path: '/admin/register/department/details', text: 'Department Information' },
      ];
    }
    
    // Register section - Stations sub-menu
    if (currentPath.startsWith('/admin/register/stations')) {
      const baseMenuItems = [
        { name: 'stations-overview', path: '/admin/register/stations', text: 'Fire Station Overview' },
        { name: 'stations-process', path: '/admin/register/stations/process', text: 'Fire Station Registration' },
      ];

      // Add custom user-added menu items below Fire Station Registration
      const customMenuItems = userFireStationMenuItems.map((menuItem) => ({
        name: `custom-menu-${menuItem.id}`,
        path: `/admin/register/stations/custom/${menuItem.id}`,
        text: menuItem.menu_item_name
      }));

      // Add dynamic fire station menu items
      const stationMenuItems = userFireStations.map((station, index) => ({
        name: `station-${station.id}`,
        path: `/admin/register/stations/${station.id}`,
        text: station.fire_station_name
      }));

      const remainingMenuItems = [
        { name: 'stations-layout', path: '/admin/register/stations/layout', text: '+ Fire Station Rooms' },
        { name: 'stations-equipment', path: '/admin/register/stations/equipment', text: '+ Station Room Equipment' },
        { name: 'stations-reports', path: '/admin/register/stations/reports', text: 'Fire Station Reports' },
        { name: 'stations-details', path: '/admin/register/stations/details', text: 'Fire Station Details' },
      ];

      return [...baseMenuItems, ...customMenuItems, ...stationMenuItems, ...remainingMenuItems];
    }
    
    // Register section - Staff sub-menu
    if (currentPath.startsWith('/admin/register/staff')) {
      return [
        { name: 'staff-overview', path: '/admin/register/staff', text: 'Staff Registration Overview' },
        { name: 'basic-info', path: '/admin/register/staff/basic-info', text: 'Basic Registration Info' },
        { name: 'address-info', path: '/admin/register/staff/address-info', text: 'Staff Address Info' },
        { name: 'document-expiry', path: '/admin/register/staff/document-expiry', text: 'Document Expiry Tracking' },
        { name: 'training-records', path: '/admin/register/staff/training-records', text: 'Training Records' },
        { name: 'achievement-records', path: '/admin/register/staff/achievement-records', text: 'Achievement Records' },
        { name: 'disciplinary-records', path: '/admin/register/staff/disciplinary-records', text: 'Disciplinary Records' },
        { name: 'emergency-contact', path: '/admin/register/staff/emergency-contact', text: 'Emergency Contact Info' },
        { name: 'equipment-issued', path: '/admin/register/staff/equipment-issued', text: 'Equipment Issued' },
        { name: 'report-blue', path: '/admin/register/staff/report-blue-shift', text: 'Report: Shift Distribution Lists' },
        { name: 'report-green', path: '/admin/register/staff/report-green-shift', text: 'Report: Green Shift' },
        { name: 'report-red', path: '/admin/register/staff/report-red-shift', text: 'Report: Red Shift' },
        { name: 'report-shifts', path: '/admin/register/staff/reports-shifts', text: 'Reports: Shifts' },
      ];
    }
    
    // Register section - Vehicles sub-menu
    if (currentPath.startsWith('/admin/register/vehicles')) {
      return [
        { name: 'vehicles-overview', path: '/admin/register/vehicles', text: 'Registration Overview' },
        { name: 'vehicles-process', path: '/admin/register/vehicles/process', text: 'Vehicle Registration' },
        { name: 'vehicles-registered', path: '/admin/register/vehicles/registered', text: 'Registered Vehicles' },
        { name: 'vehicles-reports', path: '/admin/register/vehicles/reports', text: 'Vehicle Reports' },
      ];
    }
    
    // Register section - Equipment sub-menu
    if (currentPath.startsWith('/admin/register/equipment')) {
      return [
        { name: 'equipment-overview', path: '/admin/register/equipment', text: 'Equipment Overview' },
        { name: 'equipment-process', path: '/admin/register/equipment/process', text: 'Equipment Registration' },
        { name: 'equipment-registered', path: '/admin/register/equipment/registered', text: 'Registered Equipment Lists' },
        { name: 'equipment-reports', path: '/admin/register/equipment/reports', text: 'Equipment Reports' },
      ];
    }
    
    // Register section - Shift Systems sub-menu
    if (currentPath.startsWith('/admin/register/shift-systems')) {
      return [
        { name: 'shift-systems-overview', path: '/admin/register/shift-systems', text: 'Shift Systems Overview' },
        { name: 'shift-systems-definition', path: '/admin/register/shift-systems/definition', text: 'Shift System Definition' },
        { name: 'shift-systems-process', path: '/admin/register/shift-systems/process', text: 'Shift Calendar' },
      ];
    }
    
    // Register main section (only when on /admin/register exactly or dropdown management pages)
    if (currentPath === '/admin/register' || 
        currentPath === '/admin/dropdown-management' || 
        currentPath === '/admin/register/dropdown-management') {
      return [
        { name: 'register-main', path: '/admin/register', text: 'Register Your Service' },
        { name: 'register-department', path: '/admin/register/department', text: 'Register Your Departments' },
        { name: 'register-stations', path: '/admin/register/stations', text: 'Register Your Fire Stations' },
        { name: 'register-staff', path: '/admin/register/staff', text: 'Register Your Staff' },
        { name: 'register-vehicles', path: '/admin/register/vehicles', text: 'Register Your Vehicles' },
        { name: 'register-equipment', path: '/admin/register/equipment', text: 'Register Your Equipment' },
        { name: 'register-shift-systems', path: '/admin/register/shift-systems', text: 'Register Your Shift Systems' },
      ];
    }

    // Stations section (only when on /admin/register/stations exactly)
    if (currentPath === '/admin/register/stations') {
      return [
        { name: 'register-main', path: '/admin/register', text: 'Register Your Service' },
        { name: 'register-department', path: '/admin/register/department', text: 'Register Your Departments' },
        { name: 'register-stations', path: '/admin/register/stations', text: 'Register Your Fire Stations' },
        { name: 'register-staff', path: '/admin/register/staff', text: 'Register Your Staff' },
        { name: 'register-vehicles', path: '/admin/register/vehicles', text: 'Register Your Vehicles' },
        { name: 'register-equipment', path: '/admin/register/equipment', text: 'Register Your Equipment' },
        { name: 'register-shift-systems', path: '/admin/register/shift-systems', text: 'Register Your Shift Systems' },
      ];
    }
  }
  
  // Emergency Control Centre Module with comprehensive menu structure
  if (currentPath.startsWith('/control')) {
    // Daily Occurrence Book sub-menu
    if (currentPath.startsWith('/control/daily-occurrence-book')) {
      return [
        { name: 'daily-occurrence-book-main', path: '/control/daily-occurrence-book', text: 'Daily Occurrence Book' },
        { name: 'edob-entry-form', path: '/control/daily-occurrence-book/entry-form', text: 'eDOB Entry Form' },
        { name: 'edob-reports', path: '/control/daily-occurrence-book/reports', text: 'eDOB Daily Brief Report' },
        { name: 'edob-emergency-reports', path: '/control/daily-occurrence-book/emergency-reports', text: 'eDOB Reports: Emergencies' },
        { name: 'edob-report-recipients', path: '/control/daily-occurrence-book/report-recipients', text: 'eDOB Report Recipients' },
      ];
    }

    // Daily Duty Rostering sub-menu
    if (currentPath.startsWith('/control/daily-duty-rostering')) {
      return [
        { name: 'daily-duty-rostering-main', path: '/control/daily-duty-rostering', text: 'Daily Duty Rostering' },
        { name: 'vehicle-station-assignment', path: '/control/daily-duty-rostering/vehicle-station-assignment', text: 'Vehicles: Station Assignment' },
        { name: 'vehicles-in-service', path: '/control/daily-duty-rostering/vehicles-in-service', text: 'Vehicles: In Service' },
        { name: 'vehicles-out-of-service', path: '/control/daily-duty-rostering/vehicles-out-of-service', text: 'Vehicles: Out of Service' },
        { name: 'duty-roster-capturing', path: '/control/daily-duty-rostering/capturing', text: 'Duty Roster Capturing' },
        { name: 'duty-roster-reports', path: '/control/daily-duty-rostering/reports', text: 'Duty Roster Reports' },
      ];
    }
    
    // Refuelling Logbook sub-menu (must come before general ECC Checklists)
    if (currentPath.startsWith('/control/ecc-checklists/refuelling-log-book')) {
      return [
        { name: 'refuelling-logbook-landing', path: '/control/ecc-checklists/refuelling-log-book', text: 'Refuelling Logbook' },
        { name: 'logbook-entry-tool', path: '/control/ecc-checklists/refuelling-log-book/entry', text: 'Logbook Entry Tool' },
        { name: 'logbook-records', path: '/control/ecc-checklists/refuelling-log-book/records', text: 'Logbook Records' },
        { name: 'safety-verification', path: '/control/ecc-checklists/refuelling-log-book/safety', text: 'Safety Verification' },
        { name: 'reconciliation-tasks', path: '/control/ecc-checklists/refuelling-log-book/reconciliation', text: 'Reconciliation Tasks' },
      ];
    }
    
    // ECC Checklists sub-menu
    if (currentPath.startsWith('/control/ecc-checklists')) {
      return [
        { name: 'ecc-checklists-main', path: '/control/ecc-checklists', text: 'ECC Checklists' },
        { name: 'appliance-bay-doors', path: '/control/ecc-checklists/appliance-bay-doors', text: 'Appliance Bay Doors' },
        { name: 'two-way-radios', path: '/control/ecc-checklists/two-way-radios', text: 'Two-way Radios' },
        { name: 'telephones', path: '/control/ecc-checklists/telephones', text: 'Telephones' },
        { name: 'refuelling-log-book', path: '/control/ecc-checklists/refuelling-log-book', text: 'Refuelling Log Book' },
      ];
    }
    
    // NOTAMs sub-menu
    if (currentPath.startsWith('/control/notams')) {
      return [
        { name: 'notams-main', path: '/control/notams', text: 'NOTAMs' },
        { name: 'notam-capture', path: '/control/notams/capture', text: 'NOTAM Capture' },
        { name: 'notams-register', path: '/control/notams/register', text: 'NOTAM Register' },
      ];
    }
    
    return [
      { name: 'daily-occurrence-book', path: '/control/daily-occurrence-book', text: 'Daily Occurrence Book' },
      { name: 'daily-duty-rostering', path: '/control/daily-duty-rostering', text: 'Daily Duty Rostering' },
      { name: 'emergency-incident-logging', path: '/control/emergency-incident-logging', text: 'Emergency Incident Logging' },
      { name: 'emergency-incident-reports', path: '/control/emergency-incident-reports', text: 'Emergency Incident Reports' },
      { name: 'ecc-checklists', path: '/control/ecc-checklists', text: 'ECC Checklists' },
      { name: 'notams', path: '/control/notams', text: 'NOTAMs' },
    ];
  }
  
  // Operations landing and sub-sections
  if (currentPath.startsWith('/operations')) {
    const opsSections = [
      { name: 'airport-rescue-fire-fighting', path: '/operations/airport-rescue-fire-fighting', text: 'Airport Rescue & Fire Fighting' },
      { name: 'hazardous-chemical-handling', path: '/operations/hazardous-chemical-handling', text: 'Hazardous Chemical Handling' },
      { name: 'highrise-rescue-operations', path: '/operations/highrise-rescue-operations', text: 'Highrise Rescue Operations' },
      { name: 'maritime-fire-fighting', path: '/operations/maritime-fire-fighting', text: 'Maritime Fire Fighting' },
      { name: 'medical-rescue-operations', path: '/operations/medical-rescue-operations', text: 'Medical Rescue Operations' },
      { name: 'road-traffic-accidents', path: '/operations/road-traffic-accidents', text: 'Road Traffic Accidents' },
      { name: 'nuclear-fire-risk-management', path: '/operations/nuclear-fire-risk-management', text: 'Nuclear Fire Risk Management' },
      { name: 'petro-chemical-fire-fighting', path: '/operations/petro-chemical-fire-fighting', text: 'Petro-Chemical Fire Fighting' },
      { name: 'swift-water-rescue', path: '/operations/swift-water-rescue', text: 'Swift Water Rescue' },
      { name: 'trench-collapse-operations', path: '/operations/trench-collapse-operations', text: 'Trench Collapse Operations' },
      { name: 'wildland-fire-fighting', path: '/operations/wildland-fire-fighting', text: 'Wildland Fire Fighting' },
    ];

    if (currentPath === '/operations') {
      return opsSections;
    }

    // Sub vertical menu per operations section: start with landing page link
    const slug = currentPath.split('/')[2] || '';
    const active = opsSections.find(s => s.name === slug);
    if (active) {
      return [
        { name: active.name, path: active.path, text: active.text },
      ];
    }
    return opsSections;
  }

  // Fire Safety landing and sub-sections
  if (currentPath.startsWith('/fire-safety')) {
    const fsSections = [
      { name: 'fire-by-laws', path: '/fire-safety/fire-by-laws', text: 'Fire By Laws' },
      { name: 'fire-codes', path: '/fire-safety/fire-codes', text: 'Fire Codes' },
      { name: 'fire-publications', path: '/fire-safety/fire-publications', text: 'Fire Publications' },
      { name: 'health-and-safety', path: '/fire-safety/health-and-safety', text: 'Health and Safety' },
      { name: 'hot-work-permits', path: '/fire-safety/hot-work-permits', text: 'Hot Work Permits' },
      { name: 'incident-investigations', path: '/fire-safety/incident-investigations', text: 'Incident Investigations' },
      { name: 'occupancy-inspections', path: '/fire-safety/occupancy-inspections', text: 'Occupancy Inspections' },
      { name: 'pier-education', path: '/fire-safety/pier-education', text: 'PIER Education' },
    ];

    if (currentPath === '/fire-safety') {
      return fsSections;
    }

    const slug = currentPath.split('/')[2] || '';
    const active = fsSections.find(s => s.name === slug);
    if (active) {
      return [
        { name: active.name, path: active.path, text: active.text },
      ];
    }
    return fsSections;
  }

  // Maintenance landing and sub-sections
  if (currentPath.startsWith('/maintenance')) {
    const mSections = [
      { name: 'building-maintenance', path: '/maintenance/building-maintenance', text: 'Building Maintenance' },
      { name: 'equipment-maintenance', path: '/maintenance/equipment-maintenance', text: 'Equipment Maintenance' },
      { name: 'ppe-maintenance', path: '/maintenance/ppe-maintenance', text: 'PPE Maintenance' },
      { name: 'vehicle-maintenance', path: '/maintenance/vehicle-maintenance', text: 'Vehicle Maintenance' },
    ];

    if (currentPath === '/maintenance') {
      return mSections;
    }

    const slug = currentPath.split('/')[2] || '';
    const active = mSections.find(s => s.name === slug);
    if (active) {
      return [
        { name: active.name, path: active.path, text: active.text },
      ];
    }
    return mSections;
  }

  // Training landing and sub-sections
  if (currentPath.startsWith('/training')) {
    const tSections = [
      { name: 'training-programmes', path: '/training/training-programmes', text: 'Training Programmes' },
      { name: 'training-courses', path: '/training/training-courses', text: 'Training Courses' },
      { name: 'practical-examinations', path: '/training/practical-examinations', text: 'Practical Examinations' },
      { name: 'theoratical-examinations', path: '/training/theoratical-examinations', text: 'Theoratical Examinations' },
    ];

    if (currentPath === '/training') {
      return tSections;
    }

    const slug = currentPath.split('/')[2] || '';
    const active = tSections.find(s => s.name === slug);
    if (active) {
      return [
        { name: active.name, path: active.path, text: active.text },
      ];
    }
    return tSections;
  }

  // Other Emergency Service Landing Pages - static content pages, no sub-navigation
  if (currentPath.startsWith('/maintenance') ||
      currentPath.startsWith('/training')) {
    return [];
  }
  
  // Profile Management Sub-Navigation
  if (currentPath.startsWith('/account/manage')) {
    return [
      { name: 'profile', path: '/account/manage', text: 'Profile Information', action: () => window.dispatchEvent(new CustomEvent('changeProfileSection', { detail: 'profile' })) },
      { name: 'account', path: '/account/manage', text: 'Account Settings', action: () => window.dispatchEvent(new CustomEvent('changeProfileSection', { detail: 'account' })) },
      { name: 'security', path: '/account/manage', text: 'Security Settings', action: () => window.dispatchEvent(new CustomEvent('changeProfileSection', { detail: 'security' })) },
      { name: 'preferences', path: '/account/manage', text: 'Preferences', action: () => window.dispatchEvent(new CustomEvent('changeProfileSection', { detail: 'preferences' })) },
    ];
  }
  
  // Authentication Pages
  if (currentPath === '/login' || currentPath === '/register') {
    return [
      { name: 'login', path: '/login', text: 'Sign In' },
      { name: 'register', path: '/register', text: 'Create Account' },
    ];
  }
  
  // Default - no navigation items for other pages
  return [];
};

export const MainMaster: React.FC<MainMasterProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAccessDeniedPage } = useUI();
  const { isSystemAdmin } = useAdminCheck();
  const { fireStations } = useUserFireStations();
  const { menuItems: userFireStationMenuItems } = useUserFireStationMenuItems();
  const [activeProfileSection, setActiveProfileSection] = useState('profile');
  


  // Listen for profile section changes
  useEffect(() => {
    const handleProfileSectionChange = (event: CustomEvent) => {
      setActiveProfileSection(event.detail);
    };

    window.addEventListener('changeProfileSection', handleProfileSectionChange as EventListener);
    return () => {
      window.removeEventListener('changeProfileSection', handleProfileSectionChange as EventListener);
    };
  }, []);

  // Reset profile section to default when navigating away from profile management
  useEffect(() => {
    if (!location.pathname.startsWith('/account/manage')) {
      setActiveProfileSection('profile');
    }
  }, [location.pathname]);



  // Get dynamic left menu items based on current route
  const leftMenuItems = getLeftMenuItems(location.pathname, isSystemAdmin, fireStations, userFireStationMenuItems);

  const handleLeftMenuClick = (path: string, action?: () => void) => {
    if (action) {
      // Execute custom action (like changing tabs)
      action();
    } else {
      // Navigate to different route
      navigate(path);
    }
  };

  const leftPaneContent = (
    <LeftPane>
      {leftMenuItems.map((item, index) => {
        // Determine if this item is active
        let isActive = false;
        
        if ('action' in item) {
          // For items with actions (tabs within modules), check the specific active state
          if (location.pathname.startsWith('/account/manage')) {
            isActive = activeProfileSection === item.name;
          }
        } else {
          // For regular navigation items (like home sub-pages), check against pathname
          isActive = location.pathname === item.path;
          
          // Handle PDF viewer context - when PDF viewer is active, use stored source path for highlighting
          if (location.pathname.startsWith('/pdf-viewer/')) {
            const pdfSourcePath = sessionStorage.getItem('pdf_source_path');
            if (pdfSourcePath) {
              isActive = pdfSourcePath === item.path;
            }
          }
          
          // Special cases: When on dropdown management pages, set corresponding register section as active
          if (location.pathname === '/admin/register/dropdown-management' && item.name === 'stations-layout') {
            isActive = true;
          }
        }
        
        return (
          <VerticalMenuItem 
            key={`${item.name}-${index}`}
            $active={isActive}
            $isInactive={'isInactive' in item && item.isInactive}
            onClick={() => !('isInactive' in item && item.isInactive) && handleLeftMenuClick(item.path, ('action' in item) ? item.action : undefined)}
          >
            {item.text}
            {isActive && <span style={{marginLeft: '8px', fontSize: '10px', color: '#FF9900'}}>●</span>}
          </VerticalMenuItem>
        );
      })}
    </LeftPane>
  );

  const rightPaneContent = <EnhancedRightPane />;

  // Conditionally hide right pane on access denied page
  if (isAccessDeniedPage) {
    return (
      <>
        <DevExpressSplitter 
          orientation="horizontal" 
          sizes={[0.2, 0.8]}
          minSizes={[100, 400]}
        >
          {leftPaneContent}
          <ContentPane>{children}</ContentPane>
        </DevExpressSplitter>
        

      </>
    );
  }

  return (
    <>
      <DevExpressSplitter 
        orientation="horizontal" 
        sizes={[0.15, 0.7, 0.15]}
        minSizes={[100, 400, 100]}
      >
        {leftPaneContent}
        <ContentPane>{children}</ContentPane>
        {rightPaneContent}
      </DevExpressSplitter>

    </>
  );
};