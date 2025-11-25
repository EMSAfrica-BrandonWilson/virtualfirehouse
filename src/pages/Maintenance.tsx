import React, { useState, useEffect } from 'react';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import { useMaintenanceSchedule } from '../hooks/useData';
import { formatDateOnly } from '../lib/utils';
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

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 12px;
  border: 1px solid #E1E1E1;
  background: #F9F9F9;
  margin-top: 20px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
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
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 10px;
`;

const TableRow = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid #E1E1E1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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

const StatusBadge = styled.span<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#008000';
      case 'pending': return '#FF9900';
      case 'overdue': return '#DC143C';
      default: return '#666';
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

type TabType = 'work-orders' | 'equipment' | 'vehicles' | 'buildings' | 'schedule';

export const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('work-orders');
  const maintenanceSchedule = useMaintenanceSchedule();

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail as TabType;
      if (['work-orders', 'equipment', 'vehicles', 'buildings', 'schedule'].includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  const renderScheduleTab = () => {
    if (maintenanceSchedule.loading) return <LoadingSpinner />;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Schedule Maintenance</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={maintenanceSchedule.refetch}>Refresh</DevExpressButton>
        </ActionBar>
        
        {maintenanceSchedule.data.length === 0 ? (
          <EmptyState>No maintenance schedules found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Equipment ID</div>
              <div>Type</div>
              <div>Scheduled Date</div>
              <div>Status</div>
              <div>Notes</div>
            </TableHeader>
            {maintenanceSchedule.data.map((item) => (
              <TableRow key={item.id}>
                <div>{item.equipment_id}</div>
                <div>{item.maintenance_type}</div>
                <div>{formatDateOnly(item.scheduled_date)}</div>
                <div><StatusBadge $status={item.status}>{item.status}</StatusBadge></div>
                <div>{item.notes || 'N/A'}</div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'work-orders':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Create Work Order</DevExpressButton>
              <DevExpressButton $variant="secondary">Work Order Queue</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Maintenance Work Orders<br />
              Create, track, and manage maintenance work orders for all equipment and facilities.
            </EmptyState>
          </div>
        );
      case 'equipment':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Equipment Inventory</DevExpressButton>
              <DevExpressButton $variant="secondary">Maintenance Log</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Equipment Maintenance<br />
              Track maintenance history and schedules for fire suppression and rescue equipment.
            </EmptyState>
          </div>
        );
      case 'vehicles':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Vehicle Fleet</DevExpressButton>
              <DevExpressButton $variant="secondary">Service Records</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Vehicle Maintenance<br />
              Fire apparatus and emergency vehicle maintenance tracking and scheduling.
            </EmptyState>
          </div>
        );
      case 'buildings':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Facility Inspection</DevExpressButton>
              <DevExpressButton $variant="secondary">Repair History</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Building Maintenance<br />
              Fire station and facility maintenance, repairs, and improvement projects.
            </EmptyState>
          </div>
        );
      case 'schedule':
        return renderScheduleTab();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ContentPane>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Maintenance and Repairs</h2>
      
      <TabContainer>
        <TabButton 
          $active={activeTab === 'work-orders'} 
          onClick={() => setActiveTab('work-orders')}
        >
          Work Orders
        </TabButton>
        <TabButton 
          $active={activeTab === 'equipment'} 
          onClick={() => setActiveTab('equipment')}
        >
          Equipment Maintenance
        </TabButton>
        <TabButton 
          $active={activeTab === 'vehicles'} 
          onClick={() => setActiveTab('vehicles')}
        >
          Vehicle Maintenance
        </TabButton>
        <TabButton 
          $active={activeTab === 'buildings'} 
          onClick={() => setActiveTab('buildings')}
        >
          Building Maintenance
        </TabButton>
        <TabButton 
          $active={activeTab === 'schedule'} 
          onClick={() => setActiveTab('schedule')}
        >
          Maintenance Schedule
        </TabButton>
      </TabContainer>

      {renderTabContent()}
    </ContentPane>
  );
};
