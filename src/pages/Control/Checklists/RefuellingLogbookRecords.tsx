import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../../utils/pdfReportHelper';
import RefuellingLogbookHeader from '../../../components/RefuellingLogbookHeader';

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

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

const PrintButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #E68A00;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DocumentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background: #1177BB;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
  
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #e3f2fd;
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  font-size: 14px;
  border-right: 1px solid #eee;
  vertical-align: middle;
  
  &:last-child {
    border-right: none;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' }>`
  background-color: ${props => 
    props.$variant === 'primary' ? '#1177BB' : 
    props.$variant === 'secondary' ? '#FF9900' : 
    props.$variant === 'danger' ? '#dc3545' :
    '#6c757d'
  };
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-right: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => 
      props.$variant === 'primary' ? '#0f5c99' : 
      props.$variant === 'secondary' ? '#e08800' : 
      props.$variant === 'danger' ? '#c82333' :
      '#5a6268'
    };
    transform: translateY(-1px);
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

interface RefuellingLog {
  id: string;
  vehicle_call_sign: string;
  refuelling_date: string;
  vehicle_id: string;
  odometer_reading: string;
  fuel_type: string;
  quantity_litres: string;
  pump_start_reading: string | null;
  pump_end_reading: string | null;
  operator_name: string;
  spills_incidents: string | null;
  created_at: string;
  created_by: string;
}

export const RefuellingLogbookRecords: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [logs, setLogs] = useState<RefuellingLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [departmentLogo, setDepartmentLogo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLogs();
    loadDepartmentLogo();
  }, []);

  const loadDepartmentLogo = async () => {
    try {
      const response = await fetch('/images/daco-new-logo.jpg');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepartmentLogo(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading department logo:', err);
    }
  };
  
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from('03_ecc_01_edob_05_refuelling_logs')
        .select('*')
        .order('refuelling_date', { ascending: false });
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error: any) {
      console.error('Failed to fetch logs:', error);
      setErrorMessage('Failed to load refuelling logs. Please refresh the page.');
    } finally {
      setLogsLoading(false);
    }
  };
  
  const generatePDF = async () => {
    if (logs.length === 0) {
      setErrorMessage('No refuelling logs available to generate PDF report.');
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
      setErrorMessage('');
      
      const doc = new jsPDF('landscape');
      
      const totalQuantity = logs.reduce((sum, log) => sum + parseFloat(log.quantity_litres.toString()), 0);
      const summaryText = `Summary: Total Entries: ${logs.length}, Total Fuel Dispensed: ${totalQuantity.toFixed(2)} Litres`;
      
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: departmentLogo,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Refuelling Log Book Report",
          summaryText: summaryText,
          currentUser: user
        }
      });
      
      const tableData = logs.map(log => [
        formatDateTime(log.refuelling_date),
        log.vehicle_call_sign,
        log.operator_name,
        log.odometer_reading || 'N/A',
        log.fuel_type,
        log.quantity_litres.toString(),
        `${log.pump_start_reading || 'N/A'} / ${log.pump_end_reading || 'N/A'}`
      ]);
      
      autoTable(doc, {
        head: [[
          'Date/Time',
          'Vehicle',
          'Operator',
          'Odometer',
          'Fuel Type',
          'Qty (L)',
          'Pump Readings'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });
      
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      sessionStorage.setItem('pdf_source_section', '/control/ecc-checklists/refuelling-log-book/records');
      sessionStorage.setItem('pdf_source_path', '/control/ecc-checklists/refuelling-log-book/records');
      
      navigate(`/pdf-viewer/${pdfKey}`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const formatDateTime = (dateString: string): string => {
    // Create date object from the ISO string
    // The database stores in UTC, we need to display in Saudi Arabia time
    const date = new Date(dateString);
    
    // Use toLocaleString with proper timezone configuration
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Riyadh',
      hour12: false
    };
    
    return date.toLocaleString('en-GB', options);
  };

  const handleEdit = (logId: string) => {
    // Navigate to entry page with the log ID as a query parameter
    navigate(`/control/ecc-checklists/refuelling-log-book/entry?edit=${logId}`);
  };
  
  return (
    <MainContent aria-label="Main content">
      <Section>
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title>Logbook Records</Title>
              <Divider />
              <Paragraph>
                The Logbook Records database provides comprehensive access to all refuelling entries with advanced search, filtering, and export capabilities. Users can review historical data, analyze fuel consumption patterns, generate PDF reports for auditing purposes, and maintain complete accountability for all fuel dispensing operations across the fire appliance fleet.
              </Paragraph>
            </Column>
            <ImageColumn>
              <RefuellingLogbookHeader />
            </ImageColumn>
          </FlexRow>
          
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
          
          <PrintButton onClick={generatePDF} disabled={isGeneratingPDF || logs.length === 0}>
            {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Report'}
          </PrintButton>
          
          {logsLoading ? (
            <LoadingMessage>Loading refuelling logs...</LoadingMessage>
          ) : logs.length === 0 ? (
            <EmptyState>
              No refuelling log entries yet. Add your first entry using the Logbook Entry Tool.
            </EmptyState>
          ) : (
            <DocumentTable>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date/Time</TableHeaderCell>
                  <TableHeaderCell>Vehicle</TableHeaderCell>
                  <TableHeaderCell>Operator</TableHeaderCell>
                  <TableHeaderCell>Odometer</TableHeaderCell>
                  <TableHeaderCell>Fuel Type</TableHeaderCell>
                  <TableHeaderCell>Qty (L)</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateTime(log.refuelling_date)}</TableCell>
                    <TableCell>{log.vehicle_call_sign}</TableCell>
                    <TableCell>{log.operator_name}</TableCell>
                    <TableCell>{log.odometer_reading || 'N/A'}</TableCell>
                    <TableCell>{log.fuel_type}</TableCell>
                    <TableCell>{log.quantity_litres}</TableCell>
                    <TableCell>
                      <ActionButton $variant="primary" onClick={() => handleEdit(log.id)}>
                        Edit
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DocumentTable>
          )}
        </div>
      </Section>
    </MainContent>
  );
};
