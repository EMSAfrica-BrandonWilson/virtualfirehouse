import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';
import { supabase } from '../../../lib/supabase';

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

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  
  th, td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
    font-size: 0.9rem;
  }
  
  th {
    background-color: #1177BB;
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
  
  @media (max-width: 768px) {
    th, td {
      padding: 8px;
      font-size: 0.8rem;
    }
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  background-color: ${props => {
    switch (props.$status) {
      case 'Active':
        return '#4CAF50';
      case 'Cancelled':
        return '#f44336';
      case 'Expired':
        return '#9e9e9e';
      default:
        return '#2196F3';
    }
  }};
  color: white;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #1177BB;
  color: white;
  
  &:hover {
    opacity: 0.8;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #DC143C;
  font-size: 14px;
  margin: 20px 0;
  padding: 15px;
  background: #FFE4E1;
  border: 2px solid #DC143C;
  border-radius: 6px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterLabel = styled.label`
  font-weight: bold;
  color: #1177BB;
  font-size: 1rem;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #1177BB;
  border-radius: 4px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid #1177BB;
  border-radius: 4px;
  background-color: ${props => props.$active ? '#1177BB' : 'white'};
  color: ${props => props.$active ? 'white' : '#1177BB'};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #FF9900;
    border-color: #FF9900;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.95rem;
  color: #666;
  margin: 0 10px;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  background-color: #1177BB;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;
`;

const PDFContainer = styled.div`
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`;

interface NotamRecord {
  id: string;
  notam_ref: string;
  date_issued: string;
  effective_from: string;
  effective_to: string;
  category: string;
  category_text: string | null;
  description: string;
  status: string;
  actions_taken: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export const NotamsRegister: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('notams-register', '/images/NOTAM1.jpg');
  const [notams, setNotams] = useState<NotamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedNotamRef, setSelectedNotamRef] = useState<string>('');
  
  // Pagination and filtering state
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotams();
  }, []);

  const fetchNotams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('03_ecc_01_edob_06_notams')
        .select('*')
        .order('status', { ascending: true })
        .order('effective_from', { ascending: false });

      if (error) throw error;
      setNotams(data || []);
    } catch (err: any) {
      console.error('Error fetching NOTAMs:', err);
      setError('Failed to load NOTAM records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const handleViewDocument = (documentUrl: string, notamRef: string) => {
    setSelectedPdfUrl(documentUrl);
    setSelectedNotamRef(notamRef);
    setShowPdfModal(true);
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setSelectedPdfUrl(null);
    setSelectedNotamRef('');
  };

  // Filter notams by status
  const filteredNotams = statusFilter === 'All' 
    ? notams 
    : notams.filter(notam => notam.status === statusFilter);

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotams = filteredNotams.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  // Get unique status values
  const uniqueStatuses = ['All', ...Array.from(new Set(notams.map(notam => notam.status)))];
  
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="notams-register-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="notams-register-title">
                NOTAM Register
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The NOTAM Register serves as the official repository for all aeronautical information 
                notifications received and issued by the Emergency Control Centre at King Fahd International 
                Airport. This systematic record-keeping system ensures complete traceability of all 
                safety-critical communications and regulatory compliance with international aviation standards.
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
                  alt="NOTAM Register" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/NOTAM1.jpg';
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

      {/* NOTAM Register Table Section */}
      <Section aria-labelledby="register-table">
        {/* Filter Section */}
        <FilterContainer>
          <FilterLabel htmlFor="status-filter">Filter by Status:</FilterLabel>
          <FilterSelect 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </FilterSelect>
          <PageInfo>
            Showing {currentNotams.length} of {filteredNotams.length} records
          </PageInfo>
        </FilterContainer>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>NOTAM #</th>
                <th>Category</th>
                <th>Date Issued</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Subject/Description</th>
                <th>Actions Taken</th>
                <th>Status</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <LoadingMessage>Loading NOTAM records...</LoadingMessage>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9}>
                    <ErrorMessage>{error}</ErrorMessage>
                  </td>
                </tr>
              ) : filteredNotams.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                    {statusFilter === 'All' 
                      ? 'No NOTAM records found. Use the NOTAM Capture tool to create entries.'
                      : `No NOTAM records found with status "${statusFilter}".`
                    }
                  </td>
                </tr>
              ) : (
                currentNotams.map((notam) => (
                  <tr key={notam.id}>
                    <td>{notam.category_text || 'N/A'}</td>
                    <td>{notam.category}</td>
                    <td>{formatDateTime(notam.date_issued)}</td>
                    <td>{formatDateTime(notam.effective_from)}</td>
                    <td>{formatDateTime(notam.effective_to)}</td>
                    <td>{notam.description}</td>
                    <td>{notam.actions_taken || 'N/A'}</td>
                    <td><StatusBadge $status={notam.status}>{notam.status}</StatusBadge></td>
                    <td>
                      {notam.document_url ? (
                        <ActionButton
                          onClick={() => handleViewDocument(notam.document_url!, notam.notam_ref)}
                        >
                          View NOTAM
                        </ActionButton>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.85rem' }}>No document</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        {!loading && !error && filteredNotams.length > itemsPerPage && (
          <PaginationContainer>
            <PaginationButton 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </PaginationButton>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationButton
                key={page}
                $active={currentPage === page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationButton>
            ))}
            
            <PaginationButton 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </PaginationButton>
            
            <PageInfo>
              Page {currentPage} of {totalPages}
            </PageInfo>
          </PaginationContainer>
        )}
      </Section>

      {/* PDF Viewer Modal */}
      <Modal $show={showPdfModal} onClick={handleClosePdfModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>NOTAM Document - {selectedNotamRef}</ModalTitle>
            <CloseButton onClick={handleClosePdfModal}>&times;</CloseButton>
          </ModalHeader>
          <ModalBody>
            <PDFContainer>
              {selectedPdfUrl ? (
                <iframe
                  src={selectedPdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={`NOTAM Document - ${selectedNotamRef}`}
                />
              ) : (
                <div>No document available</div>
              )}
            </PDFContainer>
          </ModalBody>
        </ModalContent>
      </Modal>

    </MainContent>
  );
};
