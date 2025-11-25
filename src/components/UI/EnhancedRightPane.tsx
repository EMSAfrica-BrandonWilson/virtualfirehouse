import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DevExpressButton, DirectorImageContainer, AdvertiseImageContainer } from '../DevExpressStyles';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../lib/utils';

interface SectionHead {
  id: number;
  department_id: number;
  name: string;
  title: string;
  image_url?: string;
  bio?: string;
}

interface Advertiser {
  id: number;
  department_id: number;
  name: string;
  content_url?: string;
  description?: string;
}

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  lastUpdated: string;
}

export const EnhancedRightPane: React.FC = () => {
  const navigate = useNavigate();
  const [sectionHead, setSectionHead] = useState<SectionHead | null>(null);
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRightPaneData();
    trackPageVisit();
  }, []);

  const loadRightPaneData = async () => {
    try {
      // Load section head data (default to first available)
      const { data: sectionHeadData } = await supabase
        .from('section_heads')
        .select('*')
        .eq('is_active', true)
        .order('id')
        .maybeSingle();
      
      if (sectionHeadData) {
        setSectionHead(sectionHeadData);
      }

      // Load advertiser data (default to first available)
      const { data: advertiserData } = await supabase
        .from('advertisers')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .maybeSingle();
      
      if (advertiserData) {
        setAdvertiser(advertiserData);
      }

      // Load visitor statistics
      const { data: statsData } = await supabase.functions.invoke('statistics-processor', {
        body: {},
      });

      if (statsData?.data) {
        setVisitorStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading right pane data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackPageVisit = async () => {
    try {
      const sessionId = sessionStorage.getItem('virtual_firehouse_session_id') || crypto.randomUUID();
      sessionStorage.setItem('virtual_firehouse_session_id', sessionId);

      await supabase.functions.invoke('visitor-tracker', {
        body: {
          pageUrl: window.location.pathname,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          sessionId: sessionId,
          departmentId: 1
        }
      });
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  };

  const handleVisitorStatsClick = () => {
    navigate('/visitor-statistics');
  };

  if (loading) {
    return (
      <div style={{ padding: '10px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ background: '#E1E1E1', padding: '5px', borderLeft: '1px solid #CCCCCC', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Row 1: Section Head Title - aligned to top */}
      <div style={{
        background: '#FF9900',
        color: 'white',
        padding: '8px 16px',
        fontFamily: 'Verdana, Arial, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '1px solid #E68900',
        borderRadius: '0',
        width: '100%',
        marginBottom: '0',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)',
        cursor: 'default'
      }}>
        {sectionHead?.title || 'Section Head'}
      </div>
      
      {/* Row 2: Section Head Picture - no space between row 1 and 2 */}
      <DirectorImageContainer style={{ marginTop: '0', marginBottom: '5px' }}>
        <img 
          src={sectionHead?.image_url || '/images/Director.png'} 
          alt={sectionHead?.name || 'Section Head'}
          title={sectionHead?.name || 'Section Head'}
        />
      </DirectorImageContainer>
      
      {/* Row 3: Advertiser Name - spacing added between row 2 and 3 */}
      <div style={{
        background: '#FF9900',
        color: 'white',
        padding: '8px 16px',
        fontFamily: 'Verdana, Arial, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '1px solid #E68900',
        borderRadius: '0',
        width: '100%',
        marginTop: '0',
        marginBottom: '0',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)',
        cursor: 'default'
      }}>
        {advertiser?.name || 'Advertise Here'}
      </div>
      
      {/* Row 4: Advertising Space - bigger spacing allocation */}
      <AdvertiseImageContainer style={{ flex: '1', display: 'flex', alignItems: 'center', marginTop: '0', marginBottom: '5px' }}>
        <img 
          src={advertiser?.content_url || '/images/AdvertiseHere.png'} 
          alt={advertiser?.name || 'Advertise Here'}
          style={{ width: '100%', height: 'auto', maxHeight: '100%', objectFit: 'contain' }}
        />
      </AdvertiseImageContainer>
      
      {/* Spacer to push visitor stats to bottom */}
      <div style={{ flex: '0 0 auto' }}></div>
      
      {/* Row 5: Visitor Stats Title - spacing added between row 4 and 5 */}
      <div style={{
        background: '#FF9900',
        color: 'white',
        padding: '8px 16px',
        fontFamily: 'Verdana, Arial, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '1px solid #E68900',
        borderRadius: '0',
        width: '100%',
        marginTop: '0',
        marginBottom: '0',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)',
        cursor: 'default'
      }}>
        Visitor Stats
      </div>
      
      {/* Row 6: Visitor Statistics Counter - aligned to bottom */}
      <div 
        style={{ 
          background: '#4682B4', 
          color: 'white', 
          padding: '10px', 
          textAlign: 'center', 
          cursor: 'pointer',
          border: '1px solid #36678F',
          fontSize: '12px',
          fontWeight: 'bold',
          marginTop: '0'
        }}
        onClick={handleVisitorStatsClick}
        title="Click for detailed visitor statistics"
      >
        <div>Total Visitors: {visitorStats?.totalVisitors || 0}</div>
        <div>Today: {visitorStats?.todayVisitors || 0}</div>
        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8 }}>
          Last Updated: {visitorStats?.lastUpdated ? formatDateTime(visitorStats.lastUpdated) : 'N/A'}
        </div>
      </div>
    </div>
  );
};