import React, { useState, useEffect } from 'react';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import { 
  usePersonnel, 
  useDepartments, 
  useStations
} from '../hooks/useData';
import styled from 'styled-components';

const TabContainer = styled.div`
  border-bottom: 2px solid #4682B4;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#FF9900' : '#E1E1E1'};
  color: ${props => props.$active ? 'white' : 'black'};
  border: 1px solid #CCCCCC;
  padding: 8px 16px;
  margin-right: 2px;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.$active ? '#FF7400' : '#D1D1D1'};
  }
`;

const DataTable = styled.div`
  border: 1px solid #CCCCCC;
  background: white;
  margin-top: 10px;
`;

const TableHeader = styled.div`
  background: #4682B4;
  color: white;
  padding: 10px;
  font-weight: bold;
  font-size: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
`;

const TableRow = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid #E1E1E1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  font-size: 11px;
  
  &:nth-child(even) {
    background: #F9F9F9;
  }
  
  &:hover {
    background: #E6F3FF;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4682B4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #DC143C;
  background: #FFE4E1;
  border: 1px solid #DC143C;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  font-size: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 12px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
`;

type TabType = 'admin-finance' | 'admin-hr' | 'admin-orders' | 'admin-regdocs' | 'admin-register' | 'admin-sops';

export const Administration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('admin-finance');
  
  // Data hooks
  const personnel = usePersonnel();
  const departments = useDepartments();
  const stations = useStations();

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail as TabType;
      if (['admin-finance', 'admin-hr', 'admin-orders', 'admin-regdocs', 'admin-register', 'admin-sops'].includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  const renderAdminFinanceTab = () => {
    return (
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Administrative Finance</h3>
        <p>Manage financial operations, budgets, and fiscal planning for emergency services.</p>
        <ActionBar>
          <DevExpressButton $variant="primary">Financial Reports</DevExpressButton>
          <DevExpressButton $variant="secondary">Budget Planning</DevExpressButton>
          <DevExpressButton $variant="secondary">Expense Tracking</DevExpressButton>
        </ActionBar>
        <EmptyState>Finance management system coming soon...</EmptyState>
      </div>
    );
  };

  const renderAdminHRTab = () => {
    return (
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Administrative Human Resources</h3>
        <p>Manage personnel, organizational structure, and workforce planning.</p>
        <ActionBar>
          <DevExpressButton $variant="primary">Management Structure</DevExpressButton>
          <DevExpressButton $variant="secondary">Organizational Chart</DevExpressButton>
          <DevExpressButton $variant="secondary">Shift Structure</DevExpressButton>
        </ActionBar>
        
        {personnel.loading ? <LoadingSpinner /> : 
         personnel.error ? <ErrorMessage>Error loading personnel: {personnel.error}</ErrorMessage> :
         personnel.data.length === 0 ? (
          <EmptyState>No personnel records found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Name</div>
              <div>Email</div>
              <div>Department</div>
              <div>Rank</div>
              <div>Status</div>
            </TableHeader>
            {personnel.data.map((person) => (
              <TableRow key={person.id}>
                <div>{person.full_name}</div>
                <div>{person.email}</div>
                <div>{person.department}</div>
                <div>{person.rank}</div>
                <div>{person.status}</div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderAdminOrdersTab = () => {
    return (
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Administrative Orders</h3>
        <p>Manage administrative orders, directives, and official communications.</p>
        <ActionBar>
          <DevExpressButton $variant="primary">Create Order</DevExpressButton>
          <DevExpressButton $variant="secondary">View Active Orders</DevExpressButton>
          <DevExpressButton $variant="secondary">Order Archive</DevExpressButton>
        </ActionBar>
        <EmptyState>Administrative orders system coming soon...</EmptyState>
      </div>
    );
  };

  const renderAdminRegDocsTab = () => {
    return (
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Administrative Regulatory Documents</h3>
        <p>Access regulatory documents, standards, and compliance materials.</p>
        <ActionBar>
          <DevExpressButton $variant="primary">ICAO Doc 9137</DevExpressButton>
          <DevExpressButton $variant="secondary">GACAR Part 139</DevExpressButton>
          <DevExpressButton $variant="secondary">GACAR Part 5</DevExpressButton>
          <DevExpressButton $variant="secondary">Annex 14</DevExpressButton>
        </ActionBar>
        <EmptyState>Regulatory documents library coming soon...</EmptyState>
      </div>
    );
  };

  const renderAdminRegisterTab = () => {
    return (
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Administrative Register</h3>
        <p>Register and manage departments, staff, stations, equipment, and other assets.</p>
        <ActionBar>
          <DevExpressButton $variant="primary">Register Department</DevExpressButton>
          <DevExpressButton $variant="secondary">Register Staff</DevExpressButton>
          <DevExpressButton $variant="secondary">Register Station</DevExpressButton>
          <DevExpressButton $variant="secondary">Register Equipment</DevExpressButton>
          <DevExpressButton $variant="secondary">Register Vehicles</DevExpressButton>
        </ActionBar>
        
        {/* Show departments and stations data in the register section */}
        {departments.loading ? <LoadingSpinner /> : 
         departments.error ? <ErrorMessage>Error loading departments: {departments.error}</ErrorMessage> :
         (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#4682B4', marginBottom: '10px' }}>Emergency Departments</h4>
            {departments.data.length === 0 ? (
              <EmptyState>No departments registered.</EmptyState>
            ) : (
              <DataTable>
                <TableHeader>
                  <div>Name</div>
                  <div>Description</div>
                  <div>Created Date</div>
                </TableHeader>
                {departments.data.map((dept) => (
                  <TableRow key={dept.id}>
                    <div>{dept.name}</div>
                    <div>{dept.description || 'N/A'}</div>
                    <div>{new Date(dept.created_at).toLocaleDateString()}</div>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </div>
        )}
        
        {stations.loading ? <LoadingSpinner /> : 
         stations.error ? <ErrorMessage>Error loading stations: {stations.error}</ErrorMessage> :
         (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#4682B4', marginBottom: '10px' }}>Registered Stations</h4>
            {stations.data.length === 0 ? (
              <EmptyState>No stations registered.</EmptyState>
            ) : (
              <DataTable>
                <TableHeader>
                  <div>Name</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div>Created Date</div>
                </TableHeader>
                {stations.data.map((station) => (
                  <TableRow key={station.id}>
                    <div>{station.name}</div>
                    <div>{station.location}</div>
                    <div>{station.status}</div>
                    <div>{new Date(station.created_at).toLocaleDateString()}</div>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAdminSOPsTab = () => {
    return (
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Administrative Standard Operating Procedures</h3>
        <p>Access and manage standard operating procedures and administrative guidelines.</p>
        <ActionBar>
          <DevExpressButton $variant="primary">SOP 001</DevExpressButton>
          <DevExpressButton $variant="secondary">SOP 002</DevExpressButton>
          <DevExpressButton $variant="secondary">SOP 008</DevExpressButton>
          <DevExpressButton $variant="secondary">SOP 014</DevExpressButton>
          <DevExpressButton $variant="secondary">Fire Prevention Program</DevExpressButton>
        </ActionBar>
        <EmptyState>Standard Operating Procedures library coming soon...</EmptyState>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admin-finance':
        return renderAdminFinanceTab();
      case 'admin-hr':
        return renderAdminHRTab();
      case 'admin-orders':
        return renderAdminOrdersTab();
      case 'admin-regdocs':
        return renderAdminRegDocsTab();
      case 'admin-register':
        return renderAdminRegisterTab();
      case 'admin-sops':
        return renderAdminSOPsTab();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ContentPane>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Emergency Administration</h2>
      
      <TabContainer>
        <TabButton 
          $active={activeTab === 'admin-finance'} 
          onClick={() => setActiveTab('admin-finance')}
        >
          Admin Finance
        </TabButton>
        <TabButton 
          $active={activeTab === 'admin-hr'} 
          onClick={() => setActiveTab('admin-hr')}
        >
          Admin HR
        </TabButton>
        <TabButton 
          $active={activeTab === 'admin-orders'} 
          onClick={() => setActiveTab('admin-orders')}
        >
          Admin Orders
        </TabButton>
        <TabButton 
          $active={activeTab === 'admin-regdocs'} 
          onClick={() => setActiveTab('admin-regdocs')}
        >
          Admin Regulatory Documents
        </TabButton>
        <TabButton 
          $active={activeTab === 'admin-register'} 
          onClick={() => setActiveTab('admin-register')}
        >
          Admin Register
        </TabButton>
        <TabButton 
          $active={activeTab === 'admin-sops'} 
          onClick={() => setActiveTab('admin-sops')}
        >
          Admin SOPs
        </TabButton>
      </TabContainer>

      {renderTabContent()}
    </ContentPane>
  );
};
