import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { ModalProvider } from './hooks/useModal';
import { RootMaster } from './components/Layout/RootMaster';
import { MainMaster } from './components/Layout/MainMaster';
import { DevExpressGlobalStyles } from './components/DevExpressStyles';
import { GlobalButtonStyles } from './components/GlobalButtonStyles';
import { Home } from './pages/Home';
import { Vision } from './pages/Vision';
import { Mission } from './pages/Mission';
import { Introduction } from './pages/Introduction';
import { ExecutiveSummary } from './pages/ExecutiveSummary';
import { FDWay } from './pages/FDWay';
import { Philosophy } from './pages/Philosophy';
import { Rules } from './pages/Rules';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { Guestbook } from './pages/Guestbook';
import { AboutEMSAfrica } from './pages/AboutEMSAfrica';
import { TermsOfUse } from './pages/TermsOfUse';
import { Trademarks } from './pages/Trademarks';
import { PrivacyStatement } from './pages/PrivacyStatement';
import { AdministrationLanding } from './pages/AdministrationLanding';
import { RegisterLanding } from './pages/RegisterLanding';
import { EmergencyControlLanding } from './pages/EmergencyControlLanding';
import { OperationsLanding } from './pages/OperationsLanding';
import { FireSafetyLanding } from './pages/FireSafetyLanding';
import { MaintenanceLanding } from './pages/MaintenanceLanding';
import { TrainingLanding } from './pages/TrainingLanding';

// Control section components
import { DailyOccurrenceBook } from './pages/Control/DailyOccurrenceBook';
import { EDOBEntryForm } from './pages/Control/EDOBEntryForm';
// Lazy-loaded heavy pages
// const EDOBReports = lazy(() => import('./pages/Control/EDOBReports').then(m => ({ default: m.EDOBReports })));
const EDOBEmergencyReports = lazy(() => import('./pages/Control/EDOBEmergencyReports').then(m => ({ default: m.EDOBEmergencyReports })));
import { EDOBReportRecipients } from './pages/Control/EDOBReportRecipients';
import { DailyDutyRostering } from './pages/Control/DailyDutyRostering';
import { VehicleStationAssignment } from './pages/Control/VehicleStationAssignment';
const DutyRosterCapturing = lazy(() => import('./pages/Control/DutyRosterCapturing').then(m => ({ default: m.DutyRosterCapturing })));
const DutyRosterReports = lazy(() => import('./pages/Control/DutyRosterReports').then(m => ({ default: m.DutyRosterReports })));
import { VehiclesInService } from './pages/Control/VehiclesInService';
import VehiclesOutOfService from './pages/Control/VehiclesOutOfService';
import { EmergencyIncidentLogging } from './pages/Control/EmergencyIncidentLogging';
import { IncidentCallTaking } from './pages/Control/IncidentCallTaking';
const EmergencyIncidentReports = lazy(() => import('./pages/Control/EmergencyIncidentReports').then(m => ({ default: m.EmergencyIncidentReports })));
import { ECCChecklists } from './pages/Control/ECCChecklists';
import { ApplianceBayDoors } from './pages/Control/Checklists/ApplianceBayDoors';
import { TwoWayRadios } from './pages/Control/Checklists/TwoWayRadios';
import { Telephones } from './pages/Control/Checklists/Telephones';
import { RefuellingLogBook } from './pages/Control/Checklists/RefuellingLogBook';
import { RefuellingLogbookLanding } from './pages/Control/Checklists/RefuellingLogbookLanding';
import { RefuellingLogbookEntry } from './pages/Control/Checklists/RefuellingLogbookEntry';
import { RefuellingLogbookRecords } from './pages/Control/Checklists/RefuellingLogbookRecords';
import { RefuellingLogbookSafety } from './pages/Control/Checklists/RefuellingLogbookSafety';
import { RefuellingLogbookReconciliation } from './pages/Control/Checklists/RefuellingLogbookReconciliation';
import { Notams } from './pages/Control/Notams';
import { NotamsRegister } from './pages/Control/Notams/NotamsRegister';
import { NotamCapture } from './pages/Control/Notams/NotamCapture';

// Admin section components
// Note: AdminRegister is now replaced by RegisterLanding as the main landing page
// import { AdminRegister } from './pages/Admin/Register';
import { AdminHumanResources } from './pages/Admin/HumanResources';
import { AdminFinance } from './pages/Admin/Finance';
import { AdminRegulatoryDocs } from './pages/Admin/RegulatoryDocs';
import { ICAODocuments } from './pages/Admin/ICAODocuments';
import { GACARDocuments } from './pages/Admin/GACARDocuments';
import { LocalRegulationsDocuments } from './pages/Admin/LocalRegulationsDocuments';
import { ComplianceRecordsDocuments } from './pages/Admin/ComplianceRecordsDocuments';
import { AdminSOPs } from './pages/Admin/SOPs';
import { AdminOrders } from './pages/Admin/Orders';
// import { ImageManagement } from './components/Admin/ImageManagement';
import UserRoleManagement from './components/Admin/UserRoleManagement';
import AuthDebug from './components/debug/AuthDebug';



// HR sub-section components
import { HRManagementStructure } from './pages/Admin/HR/ManagementStructure';
import { HROrganizationalStructure } from './pages/Admin/HR/OrganizationalStructure';
import { HRShiftStructure } from './pages/Admin/HR/ShiftStructure';
import { LeaveManagementLanding } from './pages/Admin/HR/LeaveManagementLanding';
import { LeaveRecording } from './pages/Admin/HR/LeaveRecording';
import { LeaveRecords } from './pages/Admin/HR/LeaveRecords';
import { IndividualLeaveRecords } from './pages/Admin/HR/IndividualLeaveRecords';
import { LeaveStatistics } from './pages/Admin/HR/LeaveStatistics';

// Register sub-section components and pages
const DepartmentLanding = lazy(() => import('./pages/Admin/Register/DepartmentLanding').then(m => ({ default: m.DepartmentLanding })));
const StationsLanding = lazy(() => import('./pages/Admin/Register/StationsLanding').then(m => ({ default: m.StationsLanding })));
const StaffLanding = lazy(() => import('./pages/Admin/Register/StaffLanding').then(m => ({ default: m.StaffLanding })));
const VehiclesLanding = lazy(() => import('./pages/Admin/Register/VehiclesLanding').then(m => ({ default: m.VehiclesLanding })));
const EquipmentLanding = lazy(() => import('./pages/Admin/Register/EquipmentLanding').then(m => ({ default: m.EquipmentLanding })));
const ShiftSystemsLanding = lazy(() => import('./pages/Admin/Register/ShiftSystemsLanding').then(m => ({ default: m.ShiftSystemsLanding })));
const DepartmentReports = lazy(() => import('./pages/Admin/Register/DepartmentReports').then(m => ({ default: m.DepartmentReports })));
const StationsReports = lazy(() => import('./pages/Admin/Register/StationsReports').then(m => ({ default: m.StationsReports })));
const AllStationsReports = lazy(() => import('./pages/Admin/Register/AllStationsReports').then(m => ({ default: m.AllStationsReports })));
const FireStationDetails = lazy(() => import('./pages/Admin/Register/FireStationDetails'));
const StaffReports = lazy(() => import('./pages/Admin/Register/StaffReports').then(m => ({ default: m.StaffReports })));
const StaffBasicInfo = lazy(() => import('./pages/Admin/Register/Staff/StaffBasicInfo').then(m => ({ default: m.StaffBasicInfo })));
const StaffAddressInfo = lazy(() => import('./pages/Admin/Register/Staff/StaffAddressInfo').then(m => ({ default: m.StaffAddressInfo })));
const StaffDocumentExpiry = lazy(() => import('./pages/Admin/Register/Staff/StaffDocumentExpiry').then(m => ({ default: m.StaffDocumentExpiry })));
const StaffTrainingRecords = lazy(() => import('./pages/Admin/Register/Staff/StaffTrainingRecords').then(m => ({ default: m.StaffTrainingRecords })));
const StaffAchievementRecords = lazy(() => import('./pages/Admin/Register/Staff/StaffAchievementRecords').then(m => ({ default: m.StaffAchievementRecords })));
const StaffDisciplinaryRecords = lazy(() => import('./pages/Admin/Register/Staff/StaffDisciplinaryRecords').then(m => ({ default: m.StaffDisciplinaryRecords })));
const StaffEmergencyContact = lazy(() => import('./pages/Admin/Register/Staff/StaffEmergencyContact').then(m => ({ default: m.StaffEmergencyContact })));
const StaffEquipmentIssued = lazy(() => import('./pages/Admin/Register/Staff/StaffEquipmentIssued').then(m => ({ default: m.StaffEquipmentIssued })));
const StaffReportBlueShift = lazy(() => import('./pages/Admin/Register/Staff/StaffReportBlueShift').then(m => ({ default: m.StaffReportBlueShift })));
const StaffReportGreenShift = lazy(() => import('./pages/Admin/Register/Staff/StaffReportGreenShift').then(m => ({ default: m.StaffReportGreenShift })));
const StaffReportRedShift = lazy(() => import('./pages/Admin/Register/Staff/StaffReportRedShift').then(m => ({ default: m.StaffReportRedShift })));
const StaffShiftReports = lazy(() => import('./pages/Admin/Register/Staff/StaffShiftReports').then(m => ({ default: m.StaffShiftReports })));
const AssignBlueShiftAll = lazy(() => import('./pages/Admin/Register/Staff/AssignBlueShiftAll').then(m => ({ default: m.AssignBlueShiftAll })));
const VehiclesReports = lazy(() => import('./pages/Admin/Register/VehiclesReports').then(m => ({ default: m.VehiclesReports })));
const EquipmentReports = lazy(() => import('./pages/Admin/Register/EquipmentReports').then(m => ({ default: m.EquipmentReports })));
  const ShiftSystemsReports = lazy(() => import('./pages/Admin/Register/ShiftSystemsReports').then(m => ({ default: m.ShiftSystemsReports })));
  const ShiftSystemDefinition = lazy(() => import('./pages/Admin/Register/ShiftSystemDefinition').then(m => ({ default: m.ShiftSystemDefinition })));
const RegisterDepartmentRestored = lazy(() => import('./pages/Admin/Register/DepartmentRestored').then(m => ({ default: m.RegisterDepartmentRestored })));
const DepartmentInformationReport = lazy(() => import('./pages/Admin/Register/DepartmentInformationReport').then(m => ({ default: m.DepartmentInformationReport })));
const RegisterStations = lazy(() => import('./pages/Admin/Register/Stations').then(m => ({ default: m.RegisterStations })));
const RegisterStaffEnhanced = lazy(() => import('./pages/Admin/Register/StaffEnhanced').then(m => ({ default: m.RegisterStaffEnhanced })));
const Vehicles = lazy(() => import('./pages/Admin/Register/Vehicles').then(m => ({ default: m.Vehicles })));
import { VehiclesRegistered } from './pages/Admin/Register/VehiclesRegistered';
import { EquipmentRegistered } from './pages/Admin/Register/EquipmentRegistered';
const Equipment = lazy(() => import('./pages/Admin/Register/Equipment').then(m => ({ default: m.Equipment })));
const ShiftSystems = lazy(() => import('./pages/Admin/Register/ShiftSystems').then(m => ({ default: m.ShiftSystems })));
import { DropdownManagement } from './pages/Admin/DropdownManagement';
const StaffDropdownManagement = lazy(() => import('./pages/Admin/Register/StaffDropdownManagement').then(m => ({ default: m.StaffDropdownManagement })));
const VehicleDropdownManagement = lazy(() => import('./pages/Admin/Register/VehicleDropdownManagement').then(m => ({ default: m.VehicleDropdownManagement })));
const EquipmentDropdownManagement = lazy(() => import('./pages/Admin/Register/EquipmentDropdownManagement').then(m => ({ default: m.EquipmentDropdownManagement })));
const DepartmentDropdownManagement = lazy(() => import('./pages/Admin/Register/DepartmentDropdownManagement').then(m => ({ default: m.DepartmentDropdownManagement })));
const DropdownManagementComponent = lazy(() => import('./pages/Admin/Register/DropdownManagement'));
const RankStructure = lazy(() => import('./pages/Admin/Register/RankStructure').then(m => ({ default: m.RankStructure })));
const EquipmentRoomManagement = lazy(() => import('./pages/Admin/Register/EquipmentRoomManagement'));
const FireStationLayout = lazy(() => import('./pages/Admin/Register/FireStationLayout'));
const StationRoomEquipment = lazy(() => import('./pages/Admin/Register/StationRoomEquipment'));
import { MonthlyShiftCalendar } from './pages/Admin/Service/MonthlyShiftCalendar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProfileManagement } from './pages/ProfileManagement';
import { VisitorStatistics } from './pages/VisitorStatistics';
import { AccessDenied } from './pages/AccessDenied';
import { UnderConstruction } from './pages/UnderConstruction';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RouteGuard } from './components/RouteGuard';
const PDFViewer = lazy(() => import('./components/PDFViewer').then(m => ({ default: m.PDFViewer })));
import DevBanner from './components/DevBanner';

function App() {
  useEffect(() => {
    document.title = 'VirtualFireHouse (VFH)';
  }, []);

  return (
    <>
      <DevExpressGlobalStyles />
      <GlobalButtonStyles />
      <DevBanner />
      <UIProvider>
        <HeaderProvider>
          <AuthProvider>
            <ModalProvider>
              <Router>
          <RouteGuard>
            <RootMaster>
              <Suspense fallback={<div>Loading...</div>}>
              <Routes>
              <Route path="/" element={
                <MainMaster>
                  <Home />
                </MainMaster>
              } />
              
              {/* HOME Page Submenu Routes */}
              <Route path="/vision" element={
                <MainMaster>
                  <Vision />
                </MainMaster>
              } />
              
              <Route path="/mission" element={
                <MainMaster>
                  <Mission />
                </MainMaster>
              } />
              
              <Route path="/intro" element={
                <MainMaster>
                  <Introduction />
                </MainMaster>
              } />
              
              <Route path="/summary" element={
                <MainMaster>
                  <ExecutiveSummary />
                </MainMaster>
              } />
              
              <Route path="/fd-way" element={
                <MainMaster>
                  <FDWay />
                </MainMaster>
              } />
              
              <Route path="/philosophy" element={
                <MainMaster>
                  <Philosophy />
                </MainMaster>
              } />
              
              <Route path="/rules" element={
                <MainMaster>
                  <Rules />
                </MainMaster>
              } />
              
              <Route path="/about-us" element={
                <MainMaster>
                  <AboutUs />
                </MainMaster>
              } />
              
              <Route path="/contact-us" element={
                <MainMaster>
                  <ContactUs />
                </MainMaster>
              } />
              
              <Route path="/guestbook" element={
                <MainMaster>
                  <Guestbook />
                </MainMaster>
              } />
              
              <Route path="/about-emsa" element={
                <MainMaster>
                  <AboutEMSAfrica />
                </MainMaster>
              } />
              
              {/* Footer Pages */}
              <Route path="/terms" element={
                <MainMaster>
                  <TermsOfUse />
                </MainMaster>
              } />
              
              <Route path="/trademarks" element={
                <MainMaster>
                  <Trademarks />
                </MainMaster>
              } />
              
              <Route path="/privacy" element={
                <MainMaster>
                  <PrivacyStatement />
                </MainMaster>
              } />
              
              {/* Protected Module Pages - Require Authentication */}
              <Route path="/admin" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AdministrationLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Admin section routes */}
              <Route path="/admin/register" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RegisterLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AdminHumanResources />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/finance" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AdminFinance />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/regulatory-docs" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AdminRegulatoryDocs />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/regulatory-docs/icao" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ICAODocuments />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/regulatory-docs/gacar" element={
                <MainMaster>
                  <ProtectedRoute>
                    <GACARDocuments />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/regulatory-docs/local" element={
                <MainMaster>
                  <ProtectedRoute>
                    <LocalRegulationsDocuments />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/regulatory-docs/compliance" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ComplianceRecordsDocuments />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/sops" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AdminSOPs />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/orders" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AdminOrders />
                  </ProtectedRoute>
                </MainMaster>
              } />
              

              
              <Route path="/admin/user-role-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <UserRoleManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/debug/auth" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AuthDebug />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* HR sub-section routes */}
              <Route path="/admin/hr/management-structure" element={
                <MainMaster>
                  <ProtectedRoute>
                    <HRManagementStructure />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/organizational-structure" element={
                <MainMaster>
                  <ProtectedRoute>
                    <HROrganizationalStructure />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/shift-structure" element={
                <MainMaster>
                  <ProtectedRoute>
                    <HRShiftStructure />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/leave-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <LeaveManagementLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/leave-management/recording" element={
                <MainMaster>
                  <ProtectedRoute>
                    <LeaveRecording />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/leave-management/records" element={
                <MainMaster>
                  <ProtectedRoute>
                    <LeaveRecords />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/leave-management/individual" element={
                <MainMaster>
                  <ProtectedRoute>
                    <IndividualLeaveRecords />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/hr/leave-management/statistics" element={
                <MainMaster>
                  <ProtectedRoute>
                    <LeaveStatistics />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Register section routes - Three-level hierarchy */}
              
              {/* Department routes */}
              <Route path="/admin/register/department" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DepartmentLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/department/process" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RegisterDepartmentRestored />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/department/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DepartmentReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/department/details" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DepartmentInformationReport />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Stations routes */}
              <Route path="/admin/register/stations" element={
                <MainMaster>
                  <ProtectedRoute>
                    <StationsLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/stations/process" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RegisterStations />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/stations/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <StationsReports />
                  </ProtectedRoute>
                </MainMaster>
              } />

              <Route path="/admin/register/stations/all" element={
                <MainMaster>
                  <ProtectedRoute>
                    <AllStationsReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/stations/:stationId" element={
                <MainMaster>
                  <ProtectedRoute>
                    <FireStationDetails />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/stations/layout" element={
                <MainMaster>
                  <ProtectedRoute>
                    <FireStationLayout />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/stations/equipment" element={
                <MainMaster>
                  <ProtectedRoute>
                    <StationRoomEquipment />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/dropdown-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DropdownManagementComponent />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              
              {/* Staff routes */}
              <Route path="/admin/register/staff" element={
                <MainMaster>
                  <ProtectedRoute>
                    <StaffLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/staff/process" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RegisterStaffEnhanced />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/staff/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <StaffReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* NEW STAFF FORM ROUTES */}
              <Route path="/admin/register/staff/basic-info" element={
                <MainMaster><ProtectedRoute><StaffBasicInfo /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/address-info" element={
                <MainMaster><ProtectedRoute><StaffAddressInfo /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/document-expiry" element={
                <MainMaster><ProtectedRoute><StaffDocumentExpiry /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/training-records" element={
                <MainMaster><ProtectedRoute><StaffTrainingRecords /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/achievement-records" element={
                <MainMaster><ProtectedRoute><StaffAchievementRecords /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/disciplinary-records" element={
                <MainMaster><ProtectedRoute><StaffDisciplinaryRecords /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/emergency-contact" element={
                <MainMaster><ProtectedRoute><StaffEmergencyContact /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/equipment-issued" element={
                <MainMaster><ProtectedRoute><StaffEquipmentIssued /></ProtectedRoute></MainMaster>
              } />
              
              {/* NEW SHIFT REPORT ROUTES */}
              <Route path="/admin/register/staff/report-blue-shift" element={
                <MainMaster><ProtectedRoute><StaffReportBlueShift /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/report-green-shift" element={
                <MainMaster><ProtectedRoute><StaffReportGreenShift /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/report-red-shift" element={
                <MainMaster><ProtectedRoute><StaffReportRedShift /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/reports-shifts" element={
                <MainMaster><ProtectedRoute><StaffShiftReports /></ProtectedRoute></MainMaster>
              } />
              <Route path="/admin/register/staff/assign-blue-shift-all" element={
                <MainMaster><ProtectedRoute><AssignBlueShiftAll /></ProtectedRoute></MainMaster>
              } />
              
              {/* Vehicles routes */}
              <Route path="/admin/register/vehicles" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehiclesLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/vehicles/process" element={
                <MainMaster>
                  <ProtectedRoute>
                    <Vehicles />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/vehicles/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehiclesReports />
                  </ProtectedRoute>
                </MainMaster>
              } />

              {/* Registered Vehicles page */}
              <Route path="/admin/register/vehicles/registered" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehiclesRegistered />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Equipment routes */}
              <Route path="/admin/register/equipment" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EquipmentLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/equipment/process" element={
                <MainMaster>
                  <ProtectedRoute>
                    <Equipment />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/equipment/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EquipmentReports />
                  </ProtectedRoute>
                </MainMaster>
              } />

              {/* Registered Equipment page */}
              <Route path="/admin/register/equipment/registered" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EquipmentRegistered />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Equipment Room Management routes */}
              <Route path="/admin/register/stations/:stationId/equipment" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EquipmentRoomManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/stations/:stationId/equipment/:roomId" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EquipmentRoomManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Shift Systems routes */}
              <Route path="/admin/register/shift-systems" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ShiftSystemsLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              <Route path="/admin/register/shift-systems/definition" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ShiftSystemDefinition />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/shift-systems/process" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ShiftSystems />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/shift-systems/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ShiftSystemsReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Rank Structure (utility page) */}
              <Route path="/admin/register/rank-structure" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RankStructure />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/dropdown-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DropdownManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/staff-dropdown-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <StaffDropdownManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/vehicle-dropdown-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehicleDropdownManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/equipment-dropdown-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EquipmentDropdownManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/register/department-dropdown-management" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DepartmentDropdownManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/admin/service/monthly-shift-calendar" element={
                <MainMaster>
                  <ProtectedRoute>
                    <MonthlyShiftCalendar />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EmergencyControlLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Emergency Control Centre sub-section routes */}
              <Route path="/control/daily-occurrence-book" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DailyOccurrenceBook />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-occurrence-book/entry-form" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EDOBEntryForm />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* Removed EDOBReports route */}
              
              <Route path="/control/daily-occurrence-book/emergency-reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EDOBEmergencyReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-occurrence-book/report-recipients" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EDOBReportRecipients />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-duty-rostering" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DailyDutyRostering />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-duty-rostering/vehicle-station-assignment" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehicleStationAssignment />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-duty-rostering/capturing" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DutyRosterCapturing />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-duty-rostering/reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <DutyRosterReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-duty-rostering/vehicles-in-service" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehiclesInService />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/daily-duty-rostering/vehicles-out-of-service" element={
                <MainMaster>
                  <ProtectedRoute>
                    <VehiclesOutOfService />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/emergency-incident-logging" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EmergencyIncidentLogging />
                  </ProtectedRoute>
                </MainMaster>
              } />

              <Route path="/control/emergency-incident-logging/call-taking" element={
                <MainMaster>
                  <ProtectedRoute>
                    <IncidentCallTaking />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/emergency-incident-reports" element={
                <MainMaster>
                  <ProtectedRoute>
                    <EmergencyIncidentReports />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ECCChecklists />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/appliance-bay-doors" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ApplianceBayDoors />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/two-way-radios" element={
                <MainMaster>
                  <ProtectedRoute>
                    <TwoWayRadios />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/telephones" element={
                <MainMaster>
                  <ProtectedRoute>
                    <Telephones />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/refuelling-log-book" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RefuellingLogbookLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/refuelling-log-book/entry" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RefuellingLogbookEntry />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/refuelling-log-book/records" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RefuellingLogbookRecords />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/refuelling-log-book/safety" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RefuellingLogbookSafety />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/ecc-checklists/refuelling-log-book/reconciliation" element={
                <MainMaster>
                  <ProtectedRoute>
                    <RefuellingLogbookReconciliation />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/notams" element={
                <MainMaster>
                  <ProtectedRoute>
                    <Notams />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/notams/register" element={
                <MainMaster>
                  <ProtectedRoute>
                    <NotamsRegister />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/control/notams/capture" element={
                <MainMaster>
                  <ProtectedRoute>
                    <NotamCapture />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/operations" element={
                <MainMaster>
                  <ProtectedRoute>
                    <OperationsLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              <Route path="/operations/:section" element={
                <MainMaster>
                  <ProtectedRoute>
                    <OperationsLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/fire-safety" element={
                <MainMaster>
                  <ProtectedRoute>
                    <FireSafetyLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              <Route path="/fire-safety/:section" element={
                <MainMaster>
                  <ProtectedRoute>
                    <FireSafetyLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              <Route path="/fire-safety/:section/:sub" element={
                <MainMaster>
                  <ProtectedRoute>
                    <UnderConstruction />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/maintenance" element={
                <MainMaster>
                  <ProtectedRoute>
                    <MaintenanceLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              <Route path="/maintenance/:section" element={
                <MainMaster>
                  <ProtectedRoute>
                    <MaintenanceLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              <Route path="/training" element={
                <MainMaster>
                  <ProtectedRoute>
                    <TrainingLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              <Route path="/training/:section" element={
                <MainMaster>
                  <ProtectedRoute>
                    <TrainingLanding />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* VirtualFireHouse Organizational Content Pages */}
              <Route path="/vision" element={
                <MainMaster>
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Our Vision Statement</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      To be the premier airport rescue and firefighting service, setting the standard for emergency response excellence 
                      at King Fahd International Airport. We envision a future where our highly trained professionals, cutting-edge 
                      technology, and unwavering commitment to safety ensure the protection of all lives and property within our jurisdiction.
                    </p>
                  </div>
                </MainMaster>
              } />
              
              <Route path="/mission" element={
                <MainMaster>
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Our Mission Statement</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      Our mission is to provide rapid, professional, and effective emergency response services to King Fahd International Airport. 
                      We are committed to protecting lives, property, and the environment through proactive fire prevention, emergency medical services, 
                      hazardous materials response, and technical rescue operations. We strive to maintain the highest standards of training, 
                      equipment readiness, and operational excellence.
                    </p>
                  </div>
                </MainMaster>
              } />
              
              <Route path="/about" element={
                <MainMaster>
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>About VirtualFireHouse</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
                      VirtualFireHouse is the comprehensive emergency services management system for Airport Rescue & FireFighting Services 
                      at King Fahd International Airport. Our system provides integrated management for all aspects of emergency operations, 
                      from personnel administration to incident response coordination.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      Established to enhance operational efficiency and safety standards, VirtualFireHouse serves as the central hub for 
                      emergency service activities, training coordination, equipment management, and regulatory compliance at one of the 
                      Middle East's busiest international airports.
                    </p>
                  </div>
                </MainMaster>
              } />
              
              <Route path="/philosophy" element={
                <MainMaster>
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Our Philosophy</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      We believe in the principle that every emergency response begins with thorough preparation. Our philosophy centers on 
                      continuous improvement, proactive safety measures, and maintaining the highest level of readiness. We are committed to 
                      fostering a culture of excellence, integrity, and service to our aviation community.
                    </p>
                  </div>
                </MainMaster>
              } />
              
              <Route path="/fd-way" element={
                <MainMaster>
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>The FD Way</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      The Fire Department Way represents our core values and operational principles. It encompasses our commitment to 
                      excellence in emergency response, continuous professional development, community service, and maintaining the 
                      highest safety standards. The FD Way guides every decision we make and every action we take in service to our mission.
                    </p>
                  </div>
                </MainMaster>
              } />
              
              <Route path="/contact" element={
                <MainMaster>
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Contact Us</h2>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <p><strong>Airport Rescue & FireFighting Services</strong></p>
                      <p>King Fahd International Airport</p>
                      <p>Dammam, Eastern Province, Saudi Arabia</p>
                      <br />
                      <p><strong>Emergency Services:</strong> 911</p>
                      <p><strong>Administration:</strong> +966-13-XXX-XXXX</p>
                      <p><strong>Email:</strong> arff@kfia.gov.sa</p>
                    </div>
                  </div>
                </MainMaster>
              } />
              
              {/* Visitor Statistics Page */}
              <Route path="/visitor-statistics" element={
                <MainMaster>
                  <VisitorStatistics />
                </MainMaster>
              } />
              
              {/* Auth Pages */}
              <Route path="/login" element={
                <MainMaster>
                  <Login />
                </MainMaster>
              } />
              
              <Route path="/register" element={
                <MainMaster>
                  <Register />
                </MainMaster>
              } />
              
              <Route path="/account/manage" element={
                <MainMaster>
                  <ProtectedRoute>
                    <ProfileManagement />
                  </ProtectedRoute>
                </MainMaster>
              } />
              
              {/* PDF Viewer Route */}
              <Route path="/pdf-viewer/*" element={
                <MainMaster>
                  <PDFViewer />
                </MainMaster>
              } />
              
              {/* Access Denied Page */}
              <Route path="/access-denied" element={
                <MainMaster>
                  <AccessDenied />
                </MainMaster>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={
                <MainMaster>
                  <UnderConstruction />
                </MainMaster>
              } />
              </Routes>
              </Suspense>
            </RootMaster>
          </RouteGuard>
            </Router>
            </ModalProvider>
          </AuthProvider>
        </HeaderProvider>
      </UIProvider>
    </>
  );
}

export default App;