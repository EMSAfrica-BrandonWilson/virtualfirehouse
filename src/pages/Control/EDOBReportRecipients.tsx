import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { useModal } from '../../hooks/useModal';

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
  width: ${props => props.$width || '48%'};
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

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
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

const FormContainer = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin: 15px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1177BB;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: #333;
  
  &:focus {
    border-color: #1177BB;
    outline: none;
    box-shadow: 0 0 5px rgba(17, 119, 187, 0.3);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  
  &:focus {
    border-color: #1177BB;
    outline: none;
    box-shadow: 0 0 5px rgba(17, 119, 187, 0.3);
  }
`;

const StaffList = styled.div`
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
`;

const StaffItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const StaffName = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const StaffInfo = styled.div`
  font-size: 13px;
  color: #666;
`;

const SelectedStaffDisplay = styled.div`
  margin-top: 15px;
  padding: 15px;
  background-color: #e8f4fd;
  border: 2px solid #1177BB;
  border-radius: 8px;
`;

const SelectedStaffName = styled.div`
  color: #1177BB;
  font-size: 16px;
  margin-bottom: 8px;
`;

const SelectedStaffEmail = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

const SelectedStaffDetails = styled.div`
  font-size: 13px;
  color: #666;
`;

const LoadingText = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const NoResultsText = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  color: #1177BB;
  margin-bottom: 20px;
  font-size: 1.4rem;
`;

const ModalText = styled.p`
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
  font-size: 1.1rem;
  font-weight: 500;
`;

const ModalButton = styled.button`
  background-color: #1177BB;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0f5a8a;
  }
`;

const PDFReportType = {
  DAILY_BRIEF: 'daily-brief',
  EMERGENCY_INCIDENTS: 'emergency-incidents'
} as const;

type PDFReportType = typeof PDFReportType[keyof typeof PDFReportType];

interface PDFReport {
  type: PDFReportType;
  name: string;
  description: string;
  path: string;
}

interface StaffMember {
  employee_number: string;
  first_name: string;
  last_name: string;
  email_address: string;
}

export const EDOBReportRecipients: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('edob-report-recipients', '/images/ControlRoom.png');
  const { showModal } = useModal();
  
  // State for PDF reports dropdown
  const [selectedReport, setSelectedReport] = useState<PDFReportType | ''>('');
  const [availableReports] = useState<PDFReport[]>([
    {
      type: PDFReportType.DAILY_BRIEF,
      name: 'eDOB Daily Brief Report',
      description: 'Emergency & Standby Incidents Daily Brief',
      path: '/control/daily-occurrence-book/emergency-reports'
    },
    {
      type: PDFReportType.EMERGENCY_INCIDENTS,
      name: 'eDOB Emergency Incident Reports',
      description: 'Emergency Incident Reports',
      path: '/control/daily-occurrence-book/emergency-reports'
    }
  ]);

  // State for staff search
  const [searchTerm, setSearchTerm] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // State for recipients (now from database)
  const [recipients, setRecipients] = useState<Array<{
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    email_address: string;
    report_type: string;
  }>>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // State for selected recipients to remove
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());

  // State for duplicate modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateRecipientInfo, setDuplicateRecipientInfo] = useState<{
    name: string;
    email: string;
    reportName: string;
  } | null>(null);

  // Load staff members and recipients on component mount
  useEffect(() => {
    loadStaffMembers();
    loadRecipients();
  }, []);

  // Filter staff based on search term (real-time filtering)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStaff(staffMembers);
    } else {
      const searchLower = searchTerm.toLowerCase().trim();
      
      const filtered = staffMembers.filter(staff => {
        // Search by employee number (exact or partial match)
        const employeeNumberMatch = staff.employee_number?.toLowerCase().includes(searchLower);
        
        // Search by first name (exact or partial match)
        const firstNameMatch = staff.first_name?.toLowerCase().includes(searchLower);
        
        // Search by last name (exact or partial match) 
        const lastNameMatch = staff.last_name?.toLowerCase().includes(searchLower);
        
        return employeeNumberMatch || firstNameMatch || lastNameMatch;
      });
      
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staffMembers]);



  const loadStaffMembers = async () => {
    setLoadingStaff(true);
    try {
      console.log('Loading staff from 02_admin_staff_1_registration table...');
      
      // Query the 02_admin_staff_1_registration table with correct field names
      const { data, error } = await supabase
        .from('02_admin_staff_1_registration')
        .select('employee_number, first_name, last_name, email_address')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error loading staff from staff_basic_info:', error);
        setStaffMembers([]);
        await showModal('Error Loading Staff Data', `Error loading staff data: ${error.message}. Please check the database.`, 'error');
        return;
      }

      console.log('Raw staff data from 02_admin_staff_1_registration:', data);

      if (!data || data.length === 0) {
        console.log('No staff data found in 02_admin_staff_1_registration');
        setStaffMembers([]);
        await showModal('No Staff Data Found', 'No staff data found in the database.', 'warning');
        return;
      }

      // Map the data to our expected format
      const mappedStaff = data.map((staff: any) => ({
        employee_number: staff.employee_number || '',
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        email_address: staff.email_address || ''
      }));
      
      console.log('Mapped staff data:', mappedStaff);
      setStaffMembers(mappedStaff);
    } catch (err) {
      console.error('Error loading staff members:', err);
      await showModal('Error', 'Error loading staff members from the database.', 'error');
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadRecipients = async () => {
    setLoadingRecipients(true);
    try {
      console.log('Loading recipients from report_recipients table...');
      
      // Query the report_recipients table
      const { data, error } = await supabase
        .from('report_recipients')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading recipients:', error);
        await showModal('Error Loading Recipients', `Error loading recipients: ${error.message}. Please check the database.`, 'error');
        setRecipients([]);
        return;
      }

      console.log('Loaded recipients from database:', data);
      setRecipients(data || []);
    } catch (err) {
      console.error('Error loading recipients:', err);
      await showModal('Error', 'Error loading recipients from the database.', 'error');
    } finally {
      setLoadingRecipients(false);
    }
  };



  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setSearchTerm('');
  };

  const handleAddRecipient = async () => {
    if (!selectedStaff || !selectedReport) return;

    const selectedReportInfo = availableReports.find(r => r.type === selectedReport);
    if (!selectedReportInfo) return;

    // Check for duplicate entries (same employee_number and same report_type)
    const isDuplicate = recipients.some(recipient => 
      recipient.employee_number === selectedStaff.employee_number && 
      recipient.report_type === selectedReport
    );

    if (isDuplicate) {
      // Show modal with duplicate information
      setDuplicateRecipientInfo({
        name: `${selectedStaff.first_name} ${selectedStaff.last_name}`,
        email: selectedStaff.email_address,
        reportName: selectedReportInfo.name
      });
      setShowDuplicateModal(true);
      return;
    }

    try {
      // Insert into database
      const { data, error } = await supabase
        .from('report_recipients')
        .insert([
          {
            employee_number: selectedStaff.employee_number,
            first_name: selectedStaff.first_name,
            last_name: selectedStaff.last_name,
            email_address: selectedStaff.email_address,
            report_type: selectedReport
          }
        ])
        .select();

      if (error) {
        console.error('Error adding recipient to database:', error);
        await showModal('Error Adding Recipient', `Error adding recipient: ${error.message}`, 'error');
        return;
      }

      console.log('Recipient added to database:', data);
      
      // Reload recipients from database to reflect changes
      await loadRecipients();
      
      // Clear selection
      setSelectedStaff(null);
      setSearchTerm('');
      
      await showModal('Success', 'Recipient added successfully!', 'success');
    } catch (err) {
      console.error('Error adding recipient:', err);
      await showModal('Error', 'Error adding recipient to the database.', 'error');
    }
  };

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicateRecipientInfo(null);
  };

  const handleSelectRecipient = (recipientId: string) => {
    setSelectedRecipients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipientId)) {
        newSet.delete(recipientId);
      } else {
        newSet.add(recipientId);
      }
      return newSet;
    });
  };

  const handleRemoveSelected = async () => {
    if (selectedRecipients.size === 0) {
      await showModal('No Selection', 'Please select recipients to remove.', 'warning');
      return;
    }

    try {
      // Convert selected IDs to array
      const selectedIds = Array.from(selectedRecipients);
      
      // Delete from database
      const { error } = await supabase
        .from('report_recipients')
        .delete()
        .in('id', selectedIds);

      if (error) {
        console.error('Error removing recipients from database:', error);
        await showModal('Error Removing Recipients', `Error removing recipients: ${error.message}`, 'error');
        return;
      }

      console.log('Recipients removed from database');
      
      // Reload recipients from database to reflect changes
      await loadRecipients();
      
      // Clear selection
      setSelectedRecipients(new Set());
      
      await showModal('Success', 'Selected recipients removed successfully!', 'success');
    } catch (err) {
      console.error('Error removing recipients:', err);
      await showModal('Error', 'Error removing recipients from the database.', 'error');
    }
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="recipients-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="recipients-title">
                eDOB Incident Report Recipients
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The eDOB Incident Report Recipients system provides a comprehensive framework for identifying, managing, and distributing emergency incident reports to designated personnel and agencies. This system ensures that critical incident information is properly disseminated to all relevant stakeholders according to established protocols and regulatory requirements.
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
                  alt="eDOB Incident Report Recipients" 
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

      {/* Distribution Management Section */}
      <Section aria-labelledby="distribution-management">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="distribution-management">
              Assign Recipients
            </SubTitle>
            <FormContainer>
              {/* PDF Reports Dropdown */}
              <FormGroup>
                <Label htmlFor="pdf-report">Select Emergency Incident Report</Label>
                <Select 
                  id="pdf-report"
                  value={selectedReport} 
                  onChange={(e) => setSelectedReport(e.target.value as PDFReportType)}
                >
                  <option value="">Choose a report type...</option>
                  {availableReports.map((report) => (
                    <option key={report.type} value={report.type}>
                      {report.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Staff Search */}
              <FormGroup>
                <Label htmlFor="staff-search">Search Report Recipients</Label>
                <Input
                  id="staff-search"
                  type="text"
                  placeholder="Search by employee number, first name, or last name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Auto-select if exactly one result
                    if (e.target.value.trim() !== '') {
                      const searchLower = e.target.value.toLowerCase().trim();
                      const filtered = staffMembers.filter(staff => {
                        const employeeNumberMatch = String(staff.employee_number || '').toLowerCase().includes(searchLower);
                        const firstNameMatch = String(staff.first_name || '').toLowerCase().includes(searchLower);
                        const lastNameMatch = String(staff.last_name || '').toLowerCase().includes(searchLower);
                        return employeeNumberMatch || firstNameMatch || lastNameMatch;
                      });
                      if (filtered.length === 1) {
                        setSelectedStaff(filtered[0]);
                      }
                    }
                  }}
                />
              </FormGroup>
                
                {/* Recipient Information Display */}
                <div style={{ marginTop: '15px' }}>
                  <SelectedStaffDisplay id="recipient-info">
                    {selectedStaff ? (
                      <div>
                        <SelectedStaffName>
                          <div style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold' }}>Employee #:</span> {selectedStaff.employee_number}
                          </div>
                          <div>
                            {selectedStaff.first_name} {selectedStaff.last_name} - 
                            <a 
                              href={`mailto:${selectedStaff.email_address}`}
                              style={{ 
                                color: '#1177BB', 
                                textDecoration: 'none',
                                marginLeft: '5px'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              {selectedStaff.email_address}
                            </a>
                          </div>
                        </SelectedStaffName>
                      </div>
                    ) : (
                      <SelectedStaffDetails style={{ fontStyle: 'italic', color: '#999' }}>
                        No recipient selected
                      </SelectedStaffDetails>
                    )}
                  </SelectedStaffDisplay>
                </div>
                
                {/* Staff Results - Hidden */}
                {loadingStaff ? (
                  <LoadingText>Loading staff members...</LoadingText>
                ) : null}
                
                {/* Add Recipient Button - Last Item on Form */}
                <FormGroup style={{ marginBottom: '0', marginTop: '25px' }}>
                  {/* Blue separator line */}
                  <div style={{ 
                    borderTop: '2px solid #1177BB',
                    marginBottom: '15px'
                  }}></div>
                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={handleAddRecipient}
                      disabled={!selectedStaff || !selectedReport}
                      style={{
                        backgroundColor: selectedStaff && selectedReport ? '#1177BB' : '#ccc',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: selectedStaff && selectedReport ? 'pointer' : 'not-allowed',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                      title={selectedStaff && selectedReport ? 'Add recipient to the list' : 'Please select both a PDF report and staff member'}
                    >
                      Add Recipient
                    </button>
                  </div>
                </FormGroup>
            </FormContainer>
          </Column>
          <Column $width="48%">
            <SubTitle>
              Report Recipients
            </SubTitle>
            <FormContainer>
              {loadingRecipients ? (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Loading recipients...
                </div>
              ) : recipients.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', padding: '20px' }}>
                  No recipients added yet. Select a staff member and click "Add Recipient" to add them to the list.
                </div>
              ) : (
                <div>
                  {/* Recipients ordered by report_type */}
                  {[...recipients]
                    .sort((a, b) => {
                      // Map report types to display names for sorting
                      const getReportDisplayName = (reportType: string) => {
                        const report = availableReports.find(r => r.type === reportType);
                        return report ? report.name : reportType;
                      };
                      return getReportDisplayName(a.report_type).localeCompare(getReportDisplayName(b.report_type));
                    })
                    .map((recipient) => {
                      const reportDisplayName = availableReports.find(r => r.type === recipient.report_type)?.name || recipient.report_type;
                      return (
                        <div 
                          key={recipient.id}
                          style={{
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '12px',
                            marginBottom: '10px',
                            backgroundColor: '#f9f9f9'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontWeight: 'bold', color: '#1177BB', flex: '1' }}>
                              {reportDisplayName} - Employee #: {recipient.employee_number}
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedRecipients.has(recipient.id.toString())}
                              onChange={() => handleSelectRecipient(recipient.id.toString())}
                              style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer'
                              }}
                            />
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <span>{recipient.first_name} {recipient.last_name}</span>
                            <span>-</span>
                            <a 
                              href={`mailto:${recipient.email_address}`}
                              style={{ color: '#1177BB', textDecoration: 'none' }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              {recipient.email_address}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                    
                  {/* Remove Selected Button */}
                  {recipients.length > 0 && (
                    <div style={{ 
                      marginTop: '20px', 
                      textAlign: 'right',
                      borderTop: '2px solid #1177BB',
                      paddingTop: '15px'
                    }}>
                      <button
                        onClick={handleRemoveSelected}
                        disabled={selectedRecipients.size === 0}
                        style={{
                          backgroundColor: selectedRecipients.size > 0 ? '#dc3545' : '#ccc',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: selectedRecipients.size > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                        title={selectedRecipients.size > 0 ? `Remove ${selectedRecipients.size} selected recipient(s)` : 'Select recipients to remove'}
                      >
                        Remove Selected ({selectedRecipients.size})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </FormContainer>
          </Column>
        </FlexRow>
      </Section>

      {/* Compliance and Reporting Section */}
      <Section aria-labelledby="compliance-reporting">
        <SubTitle id="compliance-reporting">
          Compliance and Regulatory Requirements
        </SubTitle>
        <Paragraph>
          The eDOB Report Recipients system maintains compliance with ICAO regulations, GACAR requirements, and local aviation authority mandates for incident reporting and notification. Distribution lists are regularly updated to reflect organizational changes, regulatory updates, and evolving emergency response protocols, ensuring that all stakeholders receive appropriate incident information according to established guidelines and timelines.
        </Paragraph>
      </Section>

      {/* Duplicate Entry Modal */}
      {showDuplicateModal && duplicateRecipientInfo && (
        <ModalOverlay onClick={handleCloseDuplicateModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Duplicate Entry Detected</ModalTitle>
            <ModalText>
              The recipient <strong>{duplicateRecipientInfo.name}</strong> (
              <a 
                href={`mailto:${duplicateRecipientInfo.email}`}
                style={{ color: '#1177BB', textDecoration: 'none' }}
              >
                {duplicateRecipientInfo.email}
              </a>
              ) is already added to <strong>{duplicateRecipientInfo.reportName}</strong>.
              <br /><br />
              Duplicate entries are not allowed.
            </ModalText>
            <ModalButton onClick={handleCloseDuplicateModal}>
              OK
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainContent>
  );
};