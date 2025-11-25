import React, { useState, useEffect } from 'react';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import { usePreventionPrograms } from '../hooks/useData';
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
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
`;

const TableRow = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid #E1E1E1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
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

type TabType = 'inspections' | 'codes' | 'bylaws' | 'publications' | 'prevention';

export const FireSafety: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inspections');
  const preventionPrograms = usePreventionPrograms();

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail as TabType;
      if (['inspections', 'codes', 'bylaws', 'publications', 'prevention'].includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  const renderPreventionTab = () => {
    if (preventionPrograms.loading) return <LoadingSpinner />;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">New Prevention Program</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={preventionPrograms.refetch}>Refresh</DevExpressButton>
        </ActionBar>
        
        {preventionPrograms.data.length === 0 ? (
          <EmptyState>No fire prevention programs found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Program Name</div>
              <div>Start Date</div>
              <div>Status</div>
              <div>Created</div>
            </TableHeader>
            {preventionPrograms.data.map((program) => (
              <TableRow key={program.id}>
                <div>{program.name}</div>
                <div>{formatDateOnly(program.start_date)}</div>
                <div>{program.status}</div>
                <div>{formatDateOnly(program.created_at)}</div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inspections':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Schedule Inspection</DevExpressButton>
              <DevExpressButton $variant="secondary">Inspection Reports</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Fire Safety Inspections<br />
              Building and facility fire safety inspection management and compliance tracking.
            </EmptyState>
          </div>
        );
      case 'codes':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Code Reference</DevExpressButton>
              <DevExpressButton $variant="secondary">Compliance Check</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Fire Codes & Standards<br />
              Reference library for fire safety codes, regulations, and compliance standards.
            </EmptyState>
          </div>
        );
      case 'bylaws':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">View Bylaws</DevExpressButton>
              <DevExpressButton $variant="secondary">Amendment History</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Safety Bylaws<br />
              Local fire safety bylaws, ordinances, and regulatory compliance information.
            </EmptyState>
          </div>
        );
      case 'publications':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">New Publication</DevExpressButton>
              <DevExpressButton $variant="secondary">Publication Library</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Safety Publications<br />
              Fire safety educational materials, bulletins, and public information resources.
            </EmptyState>
          </div>
        );
      case 'prevention':
        return renderPreventionTab();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ContentPane>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Fire and Life Safety</h2>
      
      <TabContainer>
        <TabButton 
          $active={activeTab === 'inspections'} 
          onClick={() => setActiveTab('inspections')}
        >
          Fire Inspections
        </TabButton>
        <TabButton 
          $active={activeTab === 'codes'} 
          onClick={() => setActiveTab('codes')}
        >
          Fire Codes & Standards
        </TabButton>
        <TabButton 
          $active={activeTab === 'bylaws'} 
          onClick={() => setActiveTab('bylaws')}
        >
          Safety Bylaws
        </TabButton>
        <TabButton 
          $active={activeTab === 'publications'} 
          onClick={() => setActiveTab('publications')}
        >
          Safety Publications
        </TabButton>
        <TabButton 
          $active={activeTab === 'prevention'} 
          onClick={() => setActiveTab('prevention')}
        >
          Fire Prevention Programs
        </TabButton>
      </TabContainer>

      {renderTabContent()}
    </ContentPane>
  );
};
