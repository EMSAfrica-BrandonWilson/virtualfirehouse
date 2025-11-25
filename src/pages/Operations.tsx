import React, { useState, useEffect } from 'react';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
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

type TabType = 'arff' | 'hazmat' | 'rescue' | 'equipment' | 'sops';

export const Operations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('arff');

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail as TabType;
      if (['arff', 'hazmat', 'rescue', 'equipment', 'sops'].includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'arff':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">New ARFF Procedure</DevExpressButton>
              <DevExpressButton $variant="secondary">Training Schedule</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Aircraft Rescue & Fire Fighting Operations<br />
              Emergency response procedures for aircraft incidents at King Fahd International Airport.
            </EmptyState>
          </div>
        );
      case 'hazmat':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Log Hazmat Incident</DevExpressButton>
              <DevExpressButton $variant="secondary">Material Database</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Hazardous Materials Management<br />
              Protocols for handling and responding to hazardous material incidents.
            </EmptyState>
          </div>
        );
      case 'rescue':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Rescue Protocol</DevExpressButton>
              <DevExpressButton $variant="secondary">Equipment Check</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Rescue Operations<br />
              Technical rescue operations including confined space, high angle, and water rescue.
            </EmptyState>
          </div>
        );
      case 'equipment':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Equipment Inventory</DevExpressButton>
              <DevExpressButton $variant="secondary">Inspection Log</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Equipment Management<br />
              Operational equipment tracking, maintenance, and deployment management.
            </EmptyState>
          </div>
        );
      case 'sops':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">New SOP</DevExpressButton>
              <DevExpressButton $variant="secondary">Review Queue</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Standard Operating Procedures<br />
              Comprehensive operational procedures and protocols for emergency response.
            </EmptyState>
          </div>
        );
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ContentPane>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Emergency Operations</h2>
      
      <TabContainer>
        <TabButton 
          $active={activeTab === 'arff'} 
          onClick={() => setActiveTab('arff')}
        >
          Aircraft Rescue & Fire Fighting
        </TabButton>
        <TabButton 
          $active={activeTab === 'hazmat'} 
          onClick={() => setActiveTab('hazmat')}
        >
          Hazardous Materials
        </TabButton>
        <TabButton 
          $active={activeTab === 'rescue'} 
          onClick={() => setActiveTab('rescue')}
        >
          Rescue Operations
        </TabButton>
        <TabButton 
          $active={activeTab === 'equipment'} 
          onClick={() => setActiveTab('equipment')}
        >
          Equipment Management
        </TabButton>
        <TabButton 
          $active={activeTab === 'sops'} 
          onClick={() => setActiveTab('sops')}
        >
          Standard Operating Procedures
        </TabButton>
      </TabContainer>

      {renderTabContent()}
    </ContentPane>
  );
};
