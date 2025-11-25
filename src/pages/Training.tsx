import React, { useState, useEffect } from 'react';
import { ContentPane, DevExpressButton } from '../components/DevExpressStyles';
import { useCertifications } from '../hooks/useData';
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
      case 'active': return '#008000';
      case 'expired': return '#DC143C';
      case 'expiring': return '#FF9900';
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

type TabType = 'courses' | 'records' | 'evaluations' | 'programs' | 'certifications';

export const Training: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const certifications = useCertifications();

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail as TabType;
      if (['courses', 'records', 'evaluations', 'programs', 'certifications'].includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  const renderCertificationsTab = () => {
    if (certifications.loading) return <LoadingSpinner />;
    
    return (
      <div>
        <ActionBar>
          <DevExpressButton $variant="primary">Add Certification</DevExpressButton>
          <DevExpressButton $variant="secondary" onClick={certifications.refetch}>Refresh</DevExpressButton>
        </ActionBar>
        
        {certifications.data.length === 0 ? (
          <EmptyState>No certifications found.</EmptyState>
        ) : (
          <DataTable>
            <TableHeader>
              <div>Personnel ID</div>
              <div>Certification</div>
              <div>Issued Date</div>
              <div>Expiry Date</div>
              <div>Status</div>
            </TableHeader>
            {certifications.data.map((cert) => (
              <TableRow key={cert.id}>
                <div>{cert.personnel_id}</div>
                <div>{cert.certification_name}</div>
                <div>{formatDateOnly(cert.issued_date)}</div>
                <div>{formatDateOnly(cert.expiry_date)}</div>
                <div><StatusBadge $status={cert.status}>{cert.status}</StatusBadge></div>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Create Course</DevExpressButton>
              <DevExpressButton $variant="secondary">Course Catalog</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Training Courses<br />
              Fire service training courses, curriculum management, and course scheduling.
            </EmptyState>
          </div>
        );
      case 'records':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">Training Record</DevExpressButton>
              <DevExpressButton $variant="secondary">Attendance Log</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Training Records<br />
              Individual training history, completion records, and continuing education tracking.
            </EmptyState>
          </div>
        );
      case 'evaluations':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">New Evaluation</DevExpressButton>
              <DevExpressButton $variant="secondary">Evaluation Reports</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Training Evaluations<br />
              Training effectiveness assessments, skills evaluations, and competency testing.
            </EmptyState>
          </div>
        );
      case 'programs':
        return (
          <div>
            <ActionBar>
              <DevExpressButton $variant="primary">New Program</DevExpressButton>
              <DevExpressButton $variant="secondary">Program Management</DevExpressButton>
            </ActionBar>
            <EmptyState>
              Training Programs<br />
              Comprehensive training programs for recruit, ongoing, and specialized training.
            </EmptyState>
          </div>
        );
      case 'certifications':
        return renderCertificationsTab();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ContentPane>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Training and Development</h2>
      
      <TabContainer>
        <TabButton 
          $active={activeTab === 'courses'} 
          onClick={() => setActiveTab('courses')}
        >
          Training Courses
        </TabButton>
        <TabButton 
          $active={activeTab === 'records'} 
          onClick={() => setActiveTab('records')}
        >
          Training Records
        </TabButton>
        <TabButton 
          $active={activeTab === 'evaluations'} 
          onClick={() => setActiveTab('evaluations')}
        >
          Training Evaluations
        </TabButton>
        <TabButton 
          $active={activeTab === 'programs'} 
          onClick={() => setActiveTab('programs')}
        >
          Training Programs
        </TabButton>
        <TabButton 
          $active={activeTab === 'certifications'} 
          onClick={() => setActiveTab('certifications')}
        >
          Certifications
        </TabButton>
      </TabContainer>

      {renderTabContent()}
    </ContentPane>
  );
};
