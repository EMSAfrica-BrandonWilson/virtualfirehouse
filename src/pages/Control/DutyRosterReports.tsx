import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { formatDateTime, formatDateTimeReadable } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../utils/pdfReportHelper';
import { getCompanyLogo } from '../../utils/companyLogo';

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

const Column = styled.div`
  flex: 1;
  min-width: 0;
  vertical-align: top;
  text-align: left;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const ImageColumn = styled.div`
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
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

const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ReportSection = styled.div`
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
`;

const DatePickerLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
`;

const DatePicker = styled.input`
  padding: 10px 15px;
  border: 2px solid #1177BB;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
  
  &:hover {
    border-color: #0e5a8a;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin: 0;
`;

const PrintButton = styled.button`
  background-color: #FF9900 !important;
  color: white !important;
  padding: 10px 20px;
  border: none !important;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e68800 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1rem;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #1177BB;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.4);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 20px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: #1177BB;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  font-size: 1rem;
  border-bottom: 2px solid #0e5a8a;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
  color: #333;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
  
  &:hover {
    background: #e3f2fd;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  min-width: 80px;
  text-align: center;
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #1177BB, #0e5a8a);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const SummaryLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

interface RosterEntry {
  id: string;
  staff_name: string;
  rank: string;
  shift: string;
  station: string;
  role: string;
  qualifications: string;
  status: string;
  contact_number?: string;
  email?: string;
}

export const DutyRosterReports: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('duty-roster-reports', '/images/ControlRoom.png');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStation, setSelectedStation] = useState('all');
  const [rosterEntries, setRosterEntries] = useState<RosterEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRosterData();
  }, [selectedDate]);

  useEffect(() => {
    filterEntries();
  }, [rosterEntries, selectedShift, selectedStation]);

  const loadRosterData = async () => {
    try {
      setLoading(true);
      // Placeholder data for duty roster entries
      const mockEntries: RosterEntry[] = [
        {
          id: '1',
          staff_name: 'Ahmed Al-Rashid',
          rank: 'Captain',
          shift: 'Day (07:30-19:30)',
          station: 'Station A',
          role: 'Crew Chief',
          qualifications: 'ARFF Level 3, Hazmat Technician',
          status: 'Present',
          contact_number: '+966501234567',
          email: 'ahmed.alrashid@kfia.gov.sa'
        },
        {
          id: '2',
          staff_name: 'Mohammed Al-Zahra',
          rank: 'Lieutenant',
          shift: 'Day (07:30-19:30)',
          station: 'Station A',
          role: 'Driver/Operator',
          qualifications: 'Driver License, Equipment Operator',
          status: 'Present',
          contact_number: '+966507654321',
          email: 'mohammed.alzahra@kfia.gov.sa'
        },
        {
          id: '3',
          staff_name: 'Fatima Al-Mansouri',
          rank: 'Firefighter',
          shift: 'Day (07:30-19:30)',
          station: 'Station A',
          role: 'Firefighter',
          qualifications: 'Basic Firefighter Certification',
          status: 'Present',
          contact_number: '+966509876543',
          email: 'fatima.almansouri@kfia.gov.sa'
        },
        {
          id: '4',
          staff_name: 'Omar Al-Harbi',
          rank: 'Firefighter',
          shift: 'Night (19:30-07:30)',
          station: 'Station B',
          role: 'Firefighter',
          qualifications: 'Basic Firefighter Certification',
          status: 'On Leave',
          contact_number: '+966501112233',
          email: 'omar.alharbi@kfia.gov.sa'
        },
        {
          id: '5',
          staff_name: 'Sara Al-Qarni',
          rank: 'Firefighter Paramedic',
          shift: 'Night (19:30-07:30)',
          station: 'Station B',
          role: 'Paramedic/Firefighter',
          qualifications: 'Paramedic License, Basic Firefighter',
          status: 'Present',
          contact_number: '+966503334455',
          email: 'sara.alqarni@kfia.gov.sa'
        },
        {
          id: '6',
          staff_name: 'Hassan Al-Dosari',
          rank: 'Captain',
          shift: 'Day (07:30-19:30)',
          station: 'Station C',
          role: 'Crew Chief',
          qualifications: 'ARFF Level 3, Incident Commander',
          status: 'Present',
          contact_number: '+966505556677',
          email: 'hassan.aldosari@kfia.gov.sa'
        }
      ];
      
      setRosterEntries(mockEntries);
    } catch (error) {
      console.error('Error loading roster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = rosterEntries;

    if (selectedShift !== 'all') {
      filtered = filtered.filter(entry => entry.shift === selectedShift);
    }

    if (selectedStation !== 'all') {
      filtered = filtered.filter(entry => entry.station === selectedStation);
    }

    setFilteredEntries(filtered);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return { background: '#28a745' };
      case 'On Leave':
        return { background: '#ffc107', color: '#333' };
      case 'Sick':
        return { background: '#dc3545' };
      case 'Training':
        return { background: '#17a2b8' };
      case 'Off Duty':
        return { background: '#6c757d' };
      default:
        return { background: '#6c757d' };
    }
  };

  const getSummaryStats = () => {
    const present = filteredEntries.filter(entry => entry.status === 'Present').length;
    const onLeave = filteredEntries.filter(entry => entry.status === 'On Leave').length;
    const sick = filteredEntries.filter(entry => entry.status === 'Sick').length;
    const total = filteredEntries.length;
    
    return { present, onLeave, sick, total };
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const currentUser = { email: 'admin@kfia.gov.sa' }; // Mock current user
      const logoBase64 = await getCompanyLogo();
      
      // Setup VFH A4 standard PDF
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Duty Roster Report",
          summaryText: `Daily duty roster for ${formatDateTimeReadable(new Date(selectedDate))} - Shift: ${selectedShift === 'all' ? 'All Shifts' : selectedShift} - Station: ${selectedStation === 'all' ? 'All Stations' : selectedStation}`,
          currentUser
        }
      });

      // Add title
      doc.setFontSize(16);
      doc.setTextColor(17, 119, 187);
      doc.text('Duty Roster Report', 105, 20, { align: 'center' });

      // Add date and filters
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${formatDateTimeReadable(new Date(selectedDate))}`, 20, 30);
      doc.text(`Shift: ${selectedShift === 'all' ? 'All Shifts' : selectedShift}`, 20, 35);
      doc.text(`Station: ${selectedStation === 'all' ? 'All Stations' : selectedStation}`, 20, 40);

      // Add summary stats
      const stats = getSummaryStats();
      doc.setTextColor(17, 119, 187);
      doc.text('Summary', 20, 50);
      doc.setTextColor(50, 50, 50);
      doc.text(`Total Personnel: ${stats.total}`, 20, 55);
      doc.text(`Present: ${stats.present}`, 20, 60);
      doc.text(`On Leave: ${stats.onLeave}`, 20, 65);
      doc.text(`Sick: ${stats.sick}`, 20, 70);

      // Add table headers
      const tableHeaders = [
        'Name',
        'Rank',
        'Shift',
        'Station',
        'Role',
        'Status',
        'Contact'
      ];

      const tableData = filteredEntries.map(entry => [
        entry.staff_name,
        entry.rank,
        entry.shift,
        entry.station,
        entry.role,
        entry.status,
        entry.contact_number || 'N/A'
      ]);

      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 80,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [17, 119, 187],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Name
          1: { cellWidth: 20 }, // Rank
          2: { cellWidth: 25 }, // Shift
          3: { cellWidth: 20 }, // Station
          4: { cellWidth: 25 }, // Role
          5: { cellWidth: 20 }, // Status
          6: { cellWidth: 25 }  // Contact
        }
      });

      // Add company logo if available
      try {
        const logo = await getCompanyLogo();
        if (logo) {
          doc.addImage(logo, 'PNG', 170, 5, 30, 30);
        }
      } catch (error) {
        console.log('Logo not available');
      }

      // Save the PDF
      doc.save(`Duty_Roster_Report_${selectedDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const stats = getSummaryStats();

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="reports-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="reports-title">
                Duty Roster Reports
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Duty Roster Reports system provides comprehensive reporting and analysis capabilities for personnel duty assignments, shift coverage, and workforce management across all operational periods. This reporting platform generates detailed daily, weekly, and monthly roster summaries, availability analysis, qualification tracking, and compliance reports while maintaining accurate records of personnel deployment, operational coverage, and workforce optimization to support strategic decision-making and operational planning.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage 
                  src={imageUrl} 
                  alt="Duty Roster Reports" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/ControlRoom.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  No image available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Report Section */}
      <Section aria-labelledby="roster-report">
        <ReportSection>
          <SectionHeader>
            <SectionTitle id="roster-report">
              Daily Duty Roster Report
            </SectionTitle>
            <div>
              <DatePickerContainer>
                <DatePickerLabel htmlFor="roster-date">Date</DatePickerLabel>
                <DatePicker
                  id="roster-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </DatePickerContainer>
            </div>
          </SectionHeader>

          {/* Summary Cards */}
          <SummaryCard>
            <SummaryItem>
              <SummaryValue>{stats.total}</SummaryValue>
              <SummaryLabel>Total Personnel</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue style={{ color: '#90EE90' }}>{stats.present}</SummaryValue>
              <SummaryLabel>Present</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue style={{ color: '#FFD700' }}>{stats.onLeave}</SummaryValue>
              <SummaryLabel>On Leave</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue style={{ color: '#FFB6C1' }}>{stats.sick}</SummaryValue>
              <SummaryLabel>Sick</SummaryLabel>
            </SummaryItem>
          </SummaryCard>

          {/* Filters */}
          <FilterContainer>
            <div>
              <FilterLabel htmlFor="shift-filter">Filter by Shift:</FilterLabel>
              <FilterSelect
                id="shift-filter"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="all">All Shifts</option>
                <option value="Day (07:30-19:30)">Day Shift</option>
                <option value="Night (19:30-07:30)">Night Shift</option>
                <option value="24 Hour (00:00-23:59)">24 Hour Shift</option>
              </FilterSelect>
            </div>
            <div>
              <FilterLabel htmlFor="station-filter">Filter by Station:</FilterLabel>
              <FilterSelect
                id="station-filter"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                <option value="all">All Stations</option>
                <option value="Station A">Station A</option>
                <option value="Station B">Station B</option>
                <option value="Station C">Station C</option>
                <option value="Mobile Unit">Mobile Unit</option>
              </FilterSelect>
            </div>
          </FilterContainer>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading roster data...
            </div>
          ) : (
            <TableContainer>
              <DataTable>
                <thead>
                  <TableRow>
                    <TableHeader>Staff Name</TableHeader>
                    <TableHeader>Rank</TableHeader>
                    <TableHeader>Shift</TableHeader>
                    <TableHeader>Station</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Contact</TableHeader>
                  </TableRow>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell><strong>{entry.staff_name}</strong></TableCell>
                      <TableCell>{entry.rank}</TableCell>
                      <TableCell>{entry.shift}</TableCell>
                      <TableCell>{entry.station}</TableCell>
                      <TableCell>{entry.role}</TableCell>
                      <TableCell>
                        <StatusBadge style={getStatusBadgeStyle(entry.status)}>
                          {entry.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{entry.contact_number || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </DataTable>
            </TableContainer>
          )}

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <PrintButton onClick={generatePDF}>
              Print to PDF
            </PrintButton>
          </div>
        </ReportSection>
      </Section>
    </MainContent>
  );
};