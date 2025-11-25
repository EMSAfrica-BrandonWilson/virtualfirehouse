import React from 'react';

interface RefuellingLogbookHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export const RefuellingLogbookHeader: React.FC<RefuellingLogbookHeaderProps> = ({ 
  className, 
  style 
}) => {
  return (
    <div 
      className={className}
      style={{
        width: '224px', 
        height: '160px', 
        background: 'linear-gradient(135deg, #1177BB 0%, #0f5c99 100%)',
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Fuel pump icon */}
      <div style={{
        fontSize: '48px',
        marginBottom: '8px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      }}>⛽</div>
      
      {/* Title */}
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '4px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}>
        Fuel Log Book
      </div>
      
      {/* Subtitle */}
      <div style={{
        fontSize: '11px',
        opacity: '0.9',
        textShadow: '0 1px 1px rgba(0,0,0,0.2)'
      }}>
        Refuelling Records
      </div>
      
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '16px',
        opacity: '0.3'
      }}>📋</div>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        fontSize: '14px',
        opacity: '0.3'
      }}>🚛</div>
    </div>
  );
};

export default RefuellingLogbookHeader;