import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DevExpressButton } from '../components/DevExpressStyles';
import { formatDateTime } from '../lib/utils';

interface VisitorRecord {
  id: number;
  page_url: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
  referrer: string;
  timestamp: string;
  department_id: number;
}

interface VisitorStatsData {
  totalVisitors: number;
  todayVisitors: number;
  recentVisitors: VisitorRecord[];
}

export const VisitorStatistics: React.FC = () => {
  const [statsData, setStatsData] = useState<VisitorStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetailedStatistics();
  }, []);

  const loadDetailedStatistics = async () => {
    try {
      setLoading(true);
      
      // Get summary stats
      const { data: summaryData } = await supabase.functions.invoke('statistics-processor', {
        body: {},
      });

      // For now, let's get detailed data directly from the database
      const { data: recentVisitors } = await supabase
        .from('visitor_statistics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      setStatsData({
        totalVisitors: summaryData?.data?.totalVisitors || 0,
        todayVisitors: summaryData?.data?.todayVisitors || 0,
        recentVisitors: recentVisitors || []
      });
    } catch (err) {
      console.error('Error loading detailed statistics:', err);
      setError('Failed to load visitor statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  const getPageName = (url: string) => {
    if (url === '/') return 'Home';
    return url.replace('/', '').replace('-', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading visitor statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Visitor Statistics Dashboard</h2>
      
      {/* Summary Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#4682B4', 
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          border: '1px solid #36678F'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Total Visitors</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {statsData?.totalVisitors || 0}
          </div>
        </div>
        
        <div style={{ 
          background: '#FF9900', 
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          border: '1px solid #E68900'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Today's Visitors</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {statsData?.todayVisitors || 0}
          </div>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div>
        <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Recent Visitor Activity</h3>
        
        <div style={{ 
          background: 'white', 
          border: '1px solid #CCCCCC',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            background: '#4682B4', 
            color: 'white', 
            padding: '10px',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 2fr 2fr',
            gap: '10px',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            <div>Page Visited</div>
            <div>IP Address</div>
            <div>Session</div>
            <div>User Agent</div>
            <div>Timestamp</div>
          </div>
          
          {statsData?.recentVisitors?.map((visitor, index) => (
            <div 
              key={visitor.id}
              style={{ 
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 2fr 2fr',
                gap: '10px',
                borderBottom: index < statsData.recentVisitors.length - 1 ? '1px solid #EEEEEE' : 'none',
                fontSize: '11px',
                backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#1177BB' }}>
                {getPageName(visitor.page_url)}
              </div>
              <div>{visitor.ip_address}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                {visitor.session_id.substring(0, 8)}...
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                {visitor.user_agent.substring(0, 50)}...
              </div>
              <div>{formatDate(visitor.timestamp)}</div>
            </div>
          )) || (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No recent visitor data available
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <DevExpressButton 
          onClick={() => window.history.back()}
          style={{ padding: '10px 20px' }}
        >
          Back to Previous Page
        </DevExpressButton>
      </div>
    </div>
  );
};