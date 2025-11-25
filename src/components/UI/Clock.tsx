import React, { useState, useEffect } from 'react';
import { ClockDisplay } from '../DevExpressStyles';
import { formatDateTimeReadable } from '../../lib/utils';

export const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getDayName = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  return (
    <ClockDisplay>
      <div style={{ fontSize: '8pt', marginBottom: '1px' }}>
        {getDayName(currentTime)}
      </div>
      <div style={{ fontSize: '8pt' }}>
        {formatDate(currentTime)} {formatTime(currentTime)}
      </div>
      <div style={{ fontSize: '6pt', color: '#666', marginTop: '2px' }}>
        Timezone: {new Intl.DateTimeFormat().resolvedOptions().timeZone}
      </div>
    </ClockDisplay>
  );
};
