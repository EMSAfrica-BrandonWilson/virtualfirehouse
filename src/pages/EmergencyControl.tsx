import React, { useState, useEffect } from 'react';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import { useLiveOperationsFeed, useData } from '../hooks/useData';
import { formatDateTime } from '../lib/utils';
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

const PriorityBadge = styled.span<{ $priority: string }>`
  background: ${props => {
    switch (props.$priority) {
      case 'high': return '#DC143C';
      case 'medium': return '#FF9900';
      case 'low': return '#008000';
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

const StatusBadge = styled.span<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'active': return '#008000';
      case 'pending': return '#FF9900';
      case 'resolved': return '#4682B4';
      case 'closed': return '#666';
      default: return '#999';
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const LiveFeedCard = styled.div`
  background: white;
  border: 1px solid #E1E1E1;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  &:hover {
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
`;

const LiveFeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const LiveFeedTitle = styled.h4`
  margin: 0;
  color: #1177BB;
  font-size: 14px;
`;

const LiveFeedMeta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const LiveFeedDescription = styled.p`
  margin: 0;
  color: #333;
  font-size: 12px;
  line-height: 1.4;
`;

const LiveFeedTime = styled.span`
  color: #666;
  font-size: 11px;
`;

type TabType = 'incidents' | 'calls' | 'dispatch' | 'logs' | 'live';

interface Incident {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface EmergencyCall {
  id: number;
  caller_name: string;
  phone_number: string;
  call_type: string;
  priority: string;
  status: string;
  location: string;
  description: string;
  created_at: string;
}

interface OccurrenceLog {
  id: number;
  title: string;
  description: string;
  log_type: string;
  severity: string;
  logged_by: string;
  created_at: string;
}

export const EmergencyControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('incidents');
  
  // Data hooks
  const incidents = useData<Incident>('incidents');
  const emergencyCalls = useData<EmergencyCall>('emergency_calls');
  const occurrenceLogs = useData<OccurrenceLog>('occurrence_logs');
  const liveFeed = useLiveOperationsFeed();

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail as TabType;
      if (['incidents', 'calls', 'dispatch', 'logs', 'live'].includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  const renderIncidentsTab = () => {
    if (incidents.loading) return <LoadingSpinner />;
    if (incidents.error) return <ErrorMessage>Error loading incidents: {incidents.error}</ErrorMessage>;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Create Incident</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={incidents.refetch}>Refresh</DevExpressButton>
        </ActionBar>
        
        {incidents.data.length === 0 ? (
          <EmptyState>No incidents found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Title</div>
              <div>Type</div>
              <div>Priority</div>
              <div>Status</div>
              <div>Location</div>
              <div>Created</div>
            </TableHeader>
            {incidents.data.map((incident) => (
              <TableRow key={incident.id}>
                <div>{incident.title}</div>
                <div>{incident.type}</div>
                <div><PriorityBadge $priority={incident.priority}>{incident.priority}</PriorityBadge></div>
                <div><StatusBadge $status={incident.status}>{incident.status}</StatusBadge></div>
                <div>{incident.location}</div>
                <div>{formatDateTime(incident.created_at)}</div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderCallsTab = () => {
    if (emergencyCalls.loading) return <LoadingSpinner />;
    if (emergencyCalls.error) return <ErrorMessage>Error loading emergency calls: {emergencyCalls.error}</ErrorMessage>;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Log Call</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={emergencyCalls.refetch}>Refresh</DevExpressButton>
        </ActionBar>
        
        {emergencyCalls.data.length === 0 ? (
          <EmptyState>No emergency calls found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Caller</div>
              <div>Phone</div>
              <div>Type</div>
              <div>Priority</div>
              <div>Status</div>
              <div>Location</div>
              <div>Time</div>
            </TableHeader>
            {emergencyCalls.data.map((call) => (
              <TableRow key={call.id}>
                <div>{call.caller_name}</div>
                <div>{call.phone_number}</div>
                <div>{call.call_type}</div>
                <div><PriorityBadge $priority={call.priority}>{call.priority}</PriorityBadge></div>
                <div><StatusBadge $status={call.status}>{call.status}</StatusBadge></div>
                <div>{call.location}</div>
                <div>{formatDateTime(call.created_at)}</div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderDispatchTab = () => {
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Dispatch Unit</DevExpressButton>
          <DevExpressButton $variant="secondary">Unit Status</DevExpressButton>
        </ActionBar>
        
        <EmptyState>
          Dispatch Centre - Real-time unit tracking and coordination system.<br />
          Connect to CAD system for live dispatch operations.
        </EmptyState>
      </div>
    );
  };

  const renderLogsTab = () => {
    if (occurrenceLogs.loading) return <LoadingSpinner />;
    if (occurrenceLogs.error) return <ErrorMessage>Error loading occurrence logs: {occurrenceLogs.error}</ErrorMessage>;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Add Log Entry</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={occurrenceLogs.refetch}>Refresh</DevExpressButton>
        </ActionBar>
        
        {occurrenceLogs.data.length === 0 ? (
          <EmptyState>No occurrence logs found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Title</div>
              <div>Type</div>
              <div>Severity</div>
              <div>Logged By</div>
              <div>Date/Time</div>
            </TableHeader>
            {occurrenceLogs.data.map((log) => (
              <TableRow key={log.id}>
                <div>{log.title}</div>
                <div>{log.log_type}</div>
                <div><PriorityBadge $priority={log.severity}>{log.severity}</PriorityBadge></div>
                <div>{log.logged_by}</div>
                <div>{formatDateTime(log.created_at)}</div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderLiveFeedTab = () => {
    if (liveFeed.loading) return <LoadingSpinner />;
    if (liveFeed.error) return <ErrorMessage>Error loading live operations feed: {liveFeed.error}</ErrorMessage>;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Add Update</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={liveFeed.refetch}>Refresh</DevExpressButton>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>Auto-refresh: ON</span>
        </ActionBar>
        
        {liveFeed.data.length === 0 ? (
          <EmptyState>No live operations updates available.</EmptyState>
        ) : (
          <div>
            {liveFeed.data.map((item) => (
              <LiveFeedCard key={item.id}>
                <LiveFeedHeader>
                  <LiveFeedTitle>{item.title}</LiveFeedTitle>
                  <LiveFeedMeta>
                    <PriorityBadge $priority={item.priority}>{item.priority}</PriorityBadge>
                    <StatusBadge $status={item.status}>{item.status}</StatusBadge>
                    <LiveFeedTime>{formatDateTime(item.created_at)}</LiveFeedTime>
                  </LiveFeedMeta>
                </LiveFeedHeader>
                <LiveFeedDescription>{item.description}</LiveFeedDescription>
              </LiveFeedCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'incidents':
        return renderIncidentsTab();
      case 'calls':
        return renderCallsTab();
      case 'dispatch':
        return renderDispatchTab();
      case 'logs':
        return renderLogsTab();
      case 'live':
        return renderLiveFeedTab();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ContentPane>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Emergency Control Centre</h2>
      
      <TabContainer>
        <TabButton 
          $active={activeTab === 'incidents'} 
          onClick={() => setActiveTab('incidents')}
        >
          Incident Management
        </TabButton>
        <TabButton 
          $active={activeTab === 'calls'} 
          onClick={() => setActiveTab('calls')}
        >
          Emergency Calls
        </TabButton>
        <TabButton 
          $active={activeTab === 'dispatch'} 
          onClick={() => setActiveTab('dispatch')}
        >
          Dispatch Centre
        </TabButton>
        <TabButton 
          $active={activeTab === 'logs'} 
          onClick={() => setActiveTab('logs')}
        >
          Occurrence Logs
        </TabButton>
        <TabButton 
          $active={activeTab === 'live'} 
          onClick={() => setActiveTab('live')}
        >
          Live Operations Feed
        </TabButton>
      </TabContainer>

      {renderTabContent()}
    </ContentPane>
  );
};
