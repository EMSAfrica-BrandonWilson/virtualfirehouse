import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import styled from 'styled-components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, applyFinalPageNumbers } from '../../utils/pdfReportHelper';
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
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    flex-wrap: wrap;
  }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '18.5%'};
  vertical-align: top;
  text-align: left;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 10px;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #4caf50;
  border-radius: 3px;
  margin: 15px 0;
`;

const Paragraph = styled.p`
  margin-bottom: 8px;
  line-height: 1.6;
  color: #333;
`;

const SummaryCard = styled.div`
  background: white;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
  text-align: center;
`;

const CountNumber = styled.div<{ $isTotal?: boolean }>`
  font-size: ${props => props.$isTotal ? '3.5rem' : '2.8rem'};
  font-weight: bold;
  margin: 8px 0;
  text-align: center;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #45a049;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 8px;
  text-align: left;
  border-right: 1px solid #e0e0e0;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  transition: none;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: #4caf50;
    color: white;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 20px 0;
  border: 2px solid #1177BB;
  border-radius: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.thead`
  background-color: #1177BB;
  color: white;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TableCell = styled.td`
  padding: 12px 8px;
  text-align: left;
  border-right: 1px solid #e0e0e0;
  
  &:last-child {
    border-right: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
`;

const ErrorAlert = styled.div`
  background-color: #ffebee;
  border: 2px solid #f44336;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
`;

const FooterSection = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
`;

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  status: string;
  readiness: string;
  assigned_station: string;
  driver_name?: string;
  call_sign?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  in_service_date?: string;
  out_of_service_date?: string;
  last_maintenance?: string;
  fuel_level?: number;
  equipment_status?: string;
  maintenance_type?: 'Corrective Maintenance' | 'Planned Maintenance';
  reason_text?: string;
  created_at: string;
  updated_at: string;
}

export const VehiclesInService: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, getDisplayName } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    loadVehiclesInService();
  }, []);

  const getDaysInService = (inServiceDate?: string, outOfServiceDate?: string) => {
    if (!inServiceDate) return 'N/A';
    
    const startDate = new Date(inServiceDate);
    
    // If vehicle has been taken out of service, calculate complete duration
    if (outOfServiceDate) {
      const endDate = new Date(outOfServiceDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    
    // If still in service, calculate from start date to today
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const loadVehiclesInService = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date for filtering
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading vehicles in service for date:', today);

      // Load all vehicle assignments for today to get total counts
      const { data: allAssignments, error: allError } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select('*')
        .eq('assignment_date', today)
        .order('station_assignment', { ascending: true })
        .order('call_sign', { ascending: true });

      if (allError) {
        console.error('Error loading all assignments:', allError);
        throw allError;
      }

      console.log('All assignments loaded:', allAssignments?.length || 0, 'vehicles');
      // Sort all vehicles by station assignment first, then call sign
      const sortedAllVehicles = (allAssignments || []).sort((a, b) => {
        const stationA = (a.station_assignment || 'Unassigned').toUpperCase();
        const stationB = (b.station_assignment || 'Unassigned').toUpperCase();
        const stationComparison = stationA.localeCompare(stationB);
        if (stationComparison !== 0) return stationComparison;
        
        const callSignA = (a.call_sign || '').toUpperCase();
        const callSignB = (b.call_sign || '').toUpperCase();
        return callSignA.localeCompare(callSignB);
      });
      setAllVehicles(sortedAllVehicles);

      // Load only vehicles that are currently in service
      const { data: assignments, error: assignmentsError } = await supabase
        .from('03_ecc_02_duty_roster_01_station_assignments')
        .select('*')
        .eq('assignment_date', today)
        .eq('status', 'In Service')
        .order('station_assignment', { ascending: true })
        .order('call_sign', { ascending: true });

      if (assignmentsError) {
        console.error('Error loading in-service assignments:', assignmentsError);
        throw assignmentsError;
      }

      console.log('In-service assignments loaded:', assignments?.length || 0, 'vehicles');

      // Transform data to match Vehicle interface
      const vehiclesInService: Vehicle[] = assignments?.map((assignment: any) => {
        return {
          id: assignment.id || `temp-${Math.random()}`,
          vehicle_number: assignment.call_sign || 'N/A',
          vehicle_type: assignment.vehicle_type || 'N/A',
          status: assignment.status || 'In Service',
          readiness: assignment.readiness || 'N/A',
          assigned_station: assignment.station_assignment || 'Unassigned',
          driver_name: assignment.crew_members || '',
          call_sign: assignment.call_sign || '',
          vehicle_make: assignment.vehicle_make || '',
          vehicle_model: assignment.vehicle_model || '',
          in_service_date: assignment.updated_at || new Date().toISOString(),
          out_of_service_date: assignment.status === 'Out of Service' ? assignment.updated_at || new Date().toISOString() : undefined,
          last_maintenance: assignment.updated_at || new Date().toISOString(),
          fuel_level: 85, // Default fuel level
          equipment_status: 'Good',
          maintenance_type: 'Planned Maintenance' as 'Corrective Maintenance' | 'Planned Maintenance',
          reason_text: '',
          created_at: assignment.created_at || new Date().toISOString(),
          updated_at: assignment.updated_at || new Date().toISOString()
        };
      }).filter(Boolean) || [];

      console.log('Transformed vehicles:', vehiclesInService.length, 'vehicles');
      // Sort vehicles by station assignment first, then call sign
      const sortedVehicles = vehiclesInService.sort((a, b) => {
        const stationA = (a.assigned_station || 'Unassigned').toUpperCase();
        const stationB = (b.assigned_station || 'Unassigned').toUpperCase();
        const stationComparison = stationA.localeCompare(stationB);
        if (stationComparison !== 0) return stationComparison;
        
        const callSignA = (a.call_sign || '').toUpperCase();
        const callSignB = (b.call_sign || '').toUpperCase();
        return callSignA.localeCompare(callSignB);
      });
      setVehicles(sortedVehicles || []);
      
      // Log vehicle breakdown by category for debugging
      const fireVehicles = allAssignments?.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')) || [];
      const commandVehicles = allAssignments?.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')) || [];
      const ambulances = allAssignments?.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')) || [];
      const utilityVehicles = allAssignments?.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')) || [];
      
      console.log('Vehicle breakdown:');
      console.log('- Fire Vehicles (F*):', fireVehicles.length, 'total,', vehiclesInService.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')).length, 'in service');
      console.log('- Command Vehicles (C*):', commandVehicles.length, 'total,', vehiclesInService.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')).length, 'in service');
      console.log('- Ambulances (Med*):', ambulances.length, 'total,', vehiclesInService.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')).length, 'in service');
      console.log('- Utility Vehicles (X*):', utilityVehicles.length, 'total,', vehiclesInService.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')).length, 'in service');
      
    } catch (err: any) {
      console.error('Error in loadVehiclesInService:', err);
      setError(err.message || 'Failed to load vehicles in service');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const handlePrintPDF = async () => {
    if (vehicles.length === 0) {
      alert('No vehicles to print.');
      return;
    }
    
    try {
      setPdfGenerating(true);
      console.log('Creating jsPDF document...');
      console.log('Number of vehicles to print:', vehicles.length);
      console.log('Sample vehicle data:', vehicles[0]);
      
      // Create VFH standard PDF document in portrait orientation
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log('jsPDF document created successfully');
      
      // Get current user info with error handling
      let currentUser;
      let userDisplayName = 'Unknown User';
      try {
        console.log('Getting current user...');
        console.log('userProfile available:', userProfile);
        console.log('userProfile display_name:', userProfile?.display_name);
        console.log('user email:', user?.email);
        console.log('user user_metadata:', user?.user_metadata);
        
        const userResponse = await supabase.auth.getUser();
        currentUser = userResponse?.data?.user || null;
        
        console.log('Current user from auth:', currentUser);
        console.log('Current user email:', currentUser?.email);
        console.log('Current user metadata:', currentUser?.user_metadata);
        
        // Use the AuthContext's getDisplayName function for consistent display name extraction
        userDisplayName = getDisplayName();
        console.log('Using getDisplayName() result:', userDisplayName);
        
        console.log('Final user display name:', userDisplayName);
      } catch (userError) {
        console.warn('Could not get current user:', userError);
        currentUser = null;
      }
      
      console.log('Loading company logo...');
      const logoBase64 = await getCompanyLogo();
      console.log('Logo loaded, base64 length:', logoBase64.length);
      
      // Setup VFH A4-P portrait standard PDF with proper user display name
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Vehicles In Service Report",
          summaryText: `Total Vehicles In Service: ${vehicles.length} - Generated on ${new Date().toLocaleDateString()}`,
          currentUser: {
            profile: {
              display_name: userDisplayName,
              full_name: userProfile?.full_name || user?.user_metadata?.full_name || userDisplayName,
              first_name: user?.user_metadata?.first_name || '',
              last_name: user?.user_metadata?.last_name || '',
              email: user?.email || userProfile?.email || ''
            }
          }
        }
      });
      
      console.log('VFH setup completed, table start Y:', vfhSetup.tableStartY);
      
      // Prepare table data (without Driver/Operator field) - Combined Call Sign and Vehicle details
      const tableHeaders = ['Call Sign & Vehicle Details', 'Vehicle Type', 'Days In Service', 'Assigned Station'];
      const tableData = vehicles.map(vehicle => {
        const callSign = vehicle.vehicle_number || vehicle.call_sign || 'N/A';
        const vehicleMakeModel = `${vehicle.vehicle_make || ''} ${vehicle.vehicle_model || ''}`.trim();
        const combinedDetails = vehicleMakeModel ? `${callSign} - ${vehicleMakeModel}` : callSign;
        
        return [
          combinedDetails,
          vehicle.vehicle_type || 'N/A',
          getDaysInService(vehicle.in_service_date, vehicle.out_of_service_date).toString(),
          vehicle.assigned_station || 'Unassigned'
        ];
      });
      
      console.log('Table data prepared for', vehicles.length, 'vehicles');
      console.log('Table headers:', tableHeaders);
      console.log('First few rows of table data:', tableData.slice(0, 3));
      
      // Validate table data before creating autoTable
      if (!tableData || tableData.length === 0) {
        console.error('No table data to display');
        throw new Error('No table data available for PDF generation');
      }
      
      // Create table using VFH A4 standard configuration with compact styling and centering
      try {
        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: vfhSetup.tableStartY,
          ...vfhSetup.tableConfig,
          headStyles: {
            fillColor: [76, 175, 80] as [number, number, number], // Green color for in-service
            textColor: 255,
            fontStyle: 'bold' as any,
            fontSize: 10,
            halign: 'center' // Center header text
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 2, // Reduced padding for compact rows
            halign: 'center' // Center body text
          },
          columnStyles: {
            0: { cellWidth: 65, halign: 'left' }, // Call Sign & Vehicle Details column - left aligned for readability
            1: { cellWidth: 35, halign: 'left' }, // Vehicle Type column - left aligned as requested
            2: { cellWidth: 25, halign: 'center' }, // Days In Service column
            3: { cellWidth: 45, halign: 'center' }  // Assigned Station column
          },
          rowPageBreak: 'avoid', // Avoid breaking rows across pages
          tableWidth: 180, // Fixed width to center on A4 portrait page (210mm total width)
          margin: { left: 15, right: 15 }, // Center the table with equal margins
          horizontalPageBreak: false, // Prevent horizontal page breaks
          tableLineWidth: 0.1, // Thinner table lines for cleaner look
          tableLineColor: [200, 200, 200] // Light gray table lines
        });
        console.log('autoTable completed successfully');
      } catch (autoTableError) {
        console.error('Error in autoTable:', autoTableError);
        throw new Error(`Failed to create PDF table: ${autoTableError}`);
      }
      
      // Apply final page numbering after table creation
      console.log('Applying final page numbering...');
      try {
        applyFinalPageNumbers(doc, {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services", 
          reportTitle: "Vehicles In Service Report",
          summaryText: `Total Vehicles In Service: ${vehicles.length} - Generated on ${new Date().toLocaleDateString()}`,
          currentUser: {
            profile: {
              display_name: userDisplayName,
              full_name: userProfile?.full_name || user?.user_metadata?.full_name || userDisplayName,
              first_name: user?.user_metadata?.first_name || '',
              last_name: user?.user_metadata?.last_name || '',
              email: user?.email || userProfile?.email || ''
            }
          }
        });
        console.log('Page numbering applied successfully');
      } catch (pageNumberError) {
        console.warn('Could not apply page numbering:', pageNumberError);
        // Continue without page numbering if this fails
      }
      
      // Convert to data URI and store
      console.log('Converting to data URI...');
      let dataUri: string;
      try {
        dataUri = doc.output('datauristring');
        console.log('Data URI generated, length:', dataUri.length);
        
        // Validate data URI
        if (!dataUri || !dataUri.startsWith('data:')) {
          throw new Error('Invalid data URI generated');
        }
      } catch (outputError) {
        console.error('Error generating data URI:', outputError);
        throw new Error(`Failed to generate PDF data URI: ${outputError}`);
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `pdf_vehicles_in_service_report_${timestamp}`;
      console.log('Generated filename:', fileName);
      
      // Store in sessionStorage for PDF viewer
      console.log('Storing in sessionStorage...');
      try {
        sessionStorage.setItem(fileName, dataUri);
        console.log('Stored in sessionStorage successfully');
        
        // Verify storage worked
        const verifyData = sessionStorage.getItem(fileName);
        if (!verifyData || verifyData !== dataUri) {
          throw new Error('SessionStorage verification failed');
        }
        console.log('SessionStorage verification successful');
      } catch (storageError) {
        console.error('Error storing in sessionStorage:', storageError);
        throw new Error(`Failed to store PDF in sessionStorage: ${storageError}`);
      }
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/control/daily-duty-rostering');
      sessionStorage.setItem('pdf_source_path', '/control/daily-duty-rostering/vehicles-in-service');
      
      // Navigate to PDF viewer with proper URL encoding
      const encodedFileName = encodeURIComponent(fileName);
      console.log('Navigating to PDF viewer:', `/pdf-viewer/${encodedFileName}`);
      navigate(`/pdf-viewer/${encodedFileName}`);
      
      console.log('PDF generated and opened successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Refresh data
  const handleRefreshData = () => {
    console.log('Refreshing data...');
    loadVehiclesInService();
  };

  if (loading) {
    return (
      <MainContent>
        <Section>
          <Title>Vehicles: In Service</Title>
          <Divider />
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading vehicles in service...
          </div>
        </Section>
      </MainContent>
    );
  }

  return (
    <MainContent>
      {/* Header Section */}
      <Section>
        <Title>Vehicles: In Service</Title>
        <Divider />
      </Section>

      {/* Summary Cards with X/Y format */}
      <Section>
        <FlexRow>
          <Column $width="18.5%">
            <SummaryCard>
              <CardTitle>Command Vehicles</CardTitle>
              <CountNumber>
                {`${vehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')).length} / ${allVehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('C')).length}`}
              </CountNumber>
            </SummaryCard>
          </Column>
          <Column $width="18.5%">
            <SummaryCard>
              <CardTitle>Fire Vehicles</CardTitle>
              <CountNumber>
                {`${vehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')).length} / ${allVehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('F')).length}`}
              </CountNumber>
            </SummaryCard>
          </Column>
          <Column $width="18.5%">
            <SummaryCard>
              <CardTitle>Ambulances</CardTitle>
              <CountNumber>
                {`${vehicles.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')).length} / ${allVehicles.filter(v => (v.call_sign || '').toLowerCase().startsWith('med')).length}`}
              </CountNumber>
            </SummaryCard>
          </Column>
          <Column $width="18.5%">
            <SummaryCard>
              <CardTitle>Utility Vehicles</CardTitle>
              <CountNumber>
                {`${vehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')).length} / ${allVehicles.filter(v => (v.call_sign || '').toUpperCase().startsWith('X')).length}`}
              </CountNumber>
            </SummaryCard>
          </Column>
          <Column $width="18.5%">
            <SummaryCard>
              <CardTitle>Total Vehicles In Service</CardTitle>
              <CountNumber $isTotal>
                {`${vehicles.length} / ${allVehicles.length}`}
              </CountNumber>
            </SummaryCard>
          </Column>
        </FlexRow>
      </Section>

      {/* Action Buttons */}
      <Section>
        <ButtonContainer>
          <ActionButton onClick={handlePrintPDF} disabled={pdfGenerating || vehicles.length === 0}>
            {pdfGenerating ? 'Generating PDF...' : 'Print to PDF'}
          </ActionButton>
          <ActionButton onClick={handleRefreshData} disabled={loading}>
            Refresh Data
          </ActionButton>
        </ButtonContainer>
      </Section>

      {/* Error Display */}
      {error && (
        <Section>
          <ErrorAlert>
            <strong>Error:</strong> {error}
          </ErrorAlert>
        </Section>
      )}

      {/* Vehicles Table */}
      <Section>
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <TableHeaderCell><strong>Call Sign</strong></TableHeaderCell>
                <TableHeaderCell><strong>Vehicle Type</strong></TableHeaderCell>
                <TableHeaderCell><strong>Days In Service</strong></TableHeaderCell>
                <TableHeaderCell><strong>Assigned Station</strong></TableHeaderCell>
                <TableHeaderCell><strong>Driver/Operator</strong></TableHeaderCell>
                <TableHeaderCell><strong>Status</strong></TableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#757575' }}>
                    No vehicles currently in service
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <strong>{vehicle.vehicle_number || vehicle.call_sign || 'N/A'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                        {vehicle.vehicle_make} {vehicle.vehicle_model}
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.vehicle_type || 'N/A'}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{getDaysInService(vehicle.in_service_date, vehicle.out_of_service_date)}</TableCell>
                    <TableCell>{vehicle.assigned_station || 'Unassigned'}</TableCell>
                    <TableCell>{vehicle.driver_name || 'TBD'}</TableCell>
                    <TableCell>
                      <span style={{ 
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {vehicle.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </StyledTable>
        </TableContainer>
      </Section>

    </MainContent>
  );
};