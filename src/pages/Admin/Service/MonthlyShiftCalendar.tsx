import React, { useState } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '100%'};
  vertical-align: top;
  text-align: left;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const CalendarContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #FF9900;
`;

const MonthYearDisplay = styled.h2`
  font-size: 1.8rem;
  color: #1177BB;
  margin: 0;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const NavButton = styled.button`
  background-color: #1177BB;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0f5c99;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TodayButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #ddd;
  border: 1px solid #ddd;
`;

const DayHeader = styled.div`
  background-color: #1177BB;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
`;

const DayCell = styled.div<{ $isToday?: boolean; $isCurrentMonth?: boolean }>`
  background-color: ${props => props.$isToday ? '#fff3cd' : 'white'};
  min-height: 100px;
  padding: 8px;
  position: relative;
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.4};
  border: ${props => props.$isToday ? '2px solid #FF9900' : 'none'};
  
  @media (max-width: 768px) {
    min-height: 80px;
    padding: 4px;
  }
`;

const DayNumber = styled.div<{ $isToday?: boolean }>`
  font-size: 0.9rem;
  font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
  color: ${props => props.$isToday ? '#FF9900' : '#333'};
  margin-bottom: 5px;
`;

const ShiftBadge = styled.div<{ $color: string }>`
  background-color: ${props => props.$color};
  color: white;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  margin-bottom: 3px;
  text-align: center;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const Legend = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const LegendTitle = styled.h3`
  color: #1177BB;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 30px;
  height: 20px;
  background-color: ${props => props.$color};
  border-radius: 3px;
  border: 1px solid #ddd;
`;

const LegendLabel = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border: 1px solid #fcc;
`;

interface ShiftInfo {
  name: string;
  color: string;
}

// Shift pattern starting from October 1, 2025
// Blue Shift: Oct 1, Red Shift: Oct 2, Green Shift: Oct 3, then repeats
const SHIFT_PATTERN: ShiftInfo[] = [
  { name: 'Red Shift', color: '#DC3545' },
  { name: 'Green Shift', color: '#28A745' },
  { name: 'Blue Shift', color: '#1177BB' }
];

// Start date September 29, 2025 (to account for timezone offset)
const PATTERN_START_DATE = new Date(Date.UTC(2025, 8, 29)); // Month 8 = September, day 29

export const MonthlyShiftCalendar: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('monthly-shift-calendar', '/images/EMSA-Introduction.png');
  
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate which shift falls on a given date
  const calculateShiftForDate = (date: Date): ShiftInfo => {
    // Normalize date to UTC midnight to avoid timezone issues
    const normalizedDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStartDate = PATTERN_START_DATE.getTime();
    
    // Calculate days elapsed since pattern start (Oct 1, 2025)
    const msPerDay = 1000 * 60 * 60 * 24;
    const timeDiff = normalizedDate - normalizedStartDate;
    const daysSinceStart = Math.floor(timeDiff / msPerDay);
    
    // Use modulo to determine position in 3-day cycle
    // Oct 1 = Blue (index 0), Oct 2 = Red (index 1), Oct 3 = Green (index 2)
    const shiftIndex = ((daysSinceStart % 3) + 3) % 3; // Handle negative numbers
    
    return SHIFT_PATTERN[shiftIndex];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getShiftForDate = (date: Date): ShiftInfo => {
    return calculateShiftForDate(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];

    // Add previous month's trailing days
    const prevMonthDays = startingDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDay = prevMonth.getDate();
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push(
        <DayCell key={`prev-${day}`} $isCurrentMonth={false}>
          <DayNumber>{day}</DayNumber>
        </DayCell>
      );
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const shift = getShiftForDate(date);
      const isTodayDate = isToday(date);

      days.push(
        <DayCell key={`current-${day}`} $isToday={isTodayDate} $isCurrentMonth={true}>
          <DayNumber $isToday={isTodayDate}>{day}</DayNumber>
          <ShiftBadge 
            $color={shift.color}
            title={shift.name}
          >
            {shift.name}
          </ShiftBadge>
        </DayCell>
      );
    }

    // Add next month's leading days to complete the grid
    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <DayCell key={`next-${day}`} $isCurrentMonth={false}>
          <DayNumber>{day}</DayNumber>
        </DayCell>
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthYearString = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getAllShifts = (): ShiftInfo[] => {
    return SHIFT_PATTERN;
  };

  return (
    <MainContent>
      <Section>
        <FlexRow>
          <Column $width="100%">
            <Paragraph>
              View the continuous operational shift cycle starting from October 1, 2025. 
              The pattern repeats every three days: Blue Shift, Red Shift, Green Shift. 
              Use the navigation buttons to browse different months.
            </Paragraph>

            {/* Calendar removed as requested */}
          </Column>
        </FlexRow>
      </Section>
    </MainContent>
  );
};
