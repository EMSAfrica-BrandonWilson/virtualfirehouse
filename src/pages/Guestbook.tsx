import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDateOnly } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../utils/pdfReportHelper';
import { PDF_REPORT_CONFIG } from '../utils/pdfReportConfig';

// Define GuestbookEntry type
interface GuestbookEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  location?: string;
  created_at: string;
  is_approved: boolean;
}
import { useAuth } from '../contexts/AuthContext';
import { usePageImage } from '../hooks/usePageImage';

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

const TwoColumnRow = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const RightColumn = styled.div`
  flex: 1;
  min-width: 300px;
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

const GuestbookForm = styled.form`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #1177BB;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
`;

const SubmitButton = styled.button`
  background: #1177BB;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #0e5a8a;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const GuestbookEntry = styled.div`
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EntriesContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px 0;
  border-top: 1px solid #e0e0e0;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$active ? '#1177BB' : '#ddd'};
  background: ${props => props.$active ? '#1177BB' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  
  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#0e5a8a' : '#f8f9fa'};
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const InfoText = styled.span`
  color: #666;
  font-size: 14px;
`;

const PrintButton = styled.button`
  background: #FF9900;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #E68A00;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;



export const Guestbook: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('guestbook', '/images/EMSA-GuestBook.png');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    message: ''
  });

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Auto-populate form fields for logged-in users
  useEffect(() => {
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.display_name || userProfile.full_name || '',
        email: userProfile.email || user.email || '',
        // Note: location would need to be added to user profile if available
        // For now, we'll leave it empty as it's not in the current profile schema
      }));
    }
  }, [user, userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load entries on component mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('01_home_guestbook')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntries(data);
      setError(null);
      setCurrentPage(1); // Reset to first page when new entries are loaded
    } catch (err) {
      console.error('Failed to load guestbook entries:', err);
      setError('Failed to load guestbook entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const { data: newEntry, error } = await supabase
        .from('01_home_guestbook')
        .insert([{
          name: formData.name,
          email: formData.email,
          location: formData.location,
          message: formData.message,
          is_approved: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      setEntries(prev => [newEntry, ...prev]);
      setFormData({ name: '', email: '', location: '', message: '' });
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error('Failed to submit guestbook entry:', err);
      setError('Failed to submit your entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintEntries = async () => {
    try {
      setIsGeneratingPDF(true);
      setPdfError(null);
      
      // Fetch all entries from database
      const { data: allEntries, error } = await supabase
        .from('01_home_guestbook')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!allEntries || allEntries.length === 0) {
        setPdfError('No entries to print.');
        return;
      }

      // Create VFH A4 standard PDF document
      const doc = new jsPDF(
        PDF_REPORT_CONFIG.PAGE.ORIENTATION,
        'mm',
        PDF_REPORT_CONFIG.PAGE.FORMAT
      );
      
      // Prepare data for VFH standard PDF setup
      const pdfData = {
        departmentName: 'King Fahd International Airport',
        departmentType: 'Airport Rescue and Firefighting Services',
        reportTitle: 'Guestbook Entries Report',
        summaryText: 'Guestbook entries from website visitors',
        currentUser: userProfile
      };

      // Load logo if available
      let logoBase64 = null;
      try {
        const logoResponse = await fetch('/images/daco-new-logo.jpg');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (logoError) {
        console.warn('Could not load logo for PDF:', logoError);
      }

      // Set up VFH standard PDF
      const pdfResult = setupVFHStandardPDF({
        doc,
        logoBase64,
        data: pdfData
      });

      // Prepare table data
      const tableData = allEntries.map(entry => [
        entry.name || '',
        entry.email || '',
        entry.location || '',
        entry.message || '',
        entry.created_at ? formatDateOnly(entry.created_at) : ''
      ]);

      // Generate table using VFH standard configuration
      autoTable(doc, {
        head: [['Name', 'Email', 'Location', 'Message', 'Date']],
        body: tableData,
        startY: pdfResult.tableStartY,
        ...pdfResult.tableConfig
      });

      const filename = pdfResult.filename;

      // Generate PDF data URI and navigate to global viewer
      const pdfDataUri = doc.output('datauristring');
      const timestamp = Date.now();
      const pdfKey = `pdf_guestbook_${timestamp}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Only clean up very old PDFs to prevent conflicts, but be conservative
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('pdf_guestbook_') || key.startsWith('pdf_contactus_')) {
          const keyTimestamp = parseInt(key.split('_').pop() || '0');
          if (keyTimestamp < twoHoursAgo) {
            sessionStorage.removeItem(key);
          }
        }
      });
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/guestbook');
      sessionStorage.setItem('pdf_source_path', '/guestbook');
      
      // Navigate to PDF viewer
      navigate(`/pdf-viewer/${pdfKey}`);
      
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = entries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="guestbook-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="guestbook-title">
                Sign Our Guestbook
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                We welcome visitors from around the world to share their thoughts and 
                experiences with our Airport Rescue and Firefighting Services. Please 
                take a moment to sign our guestbook and let us know how we're doing.
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
                  alt="Guestbook" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-GuestBook.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>

          {isSubmitted && (
            <div style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              Thank you for signing our guestbook!
            </div>
          )}

          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          <TwoColumnRow>
            <LeftColumn>
              <GuestbookForm onSubmit={handleSubmit}>
                <SubTitle>Add Your Entry:</SubTitle>
                <FormGroup>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="message">Your Message *</Label>
                  <TextArea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Share your thoughts about our services..."
                    required
                  />
                </FormGroup>
                
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Sign Guestbook'}
                </SubmitButton>
              </GuestbookForm>
            </LeftColumn>

            <RightColumn>
              <EntriesContainer>
                <SubTitle>Recent Entries:</SubTitle>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading entries...
                  </div>
                ) : entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No entries yet. Be the first to sign our guestbook!
                  </div>
                ) : (
                  <>
                    {currentEntries.map(entry => (
                      <GuestbookEntry key={entry.id}>
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#1177BB', fontSize: '18px' }}>{entry.name}</strong>
                          {entry.location && (
                            <span style={{ color: '#666', marginLeft: '10px' }}>from {entry.location}</span>
                          )}
                          <span style={{ color: '#999', float: 'right' }}>
                            {entry.created_at ? formatDateOnly(entry.created_at) : ''}
                          </span>
                        </div>
                        <div style={{ fontSize: '16px', lineHeight: '1.5', color: '#333' }}>
                          {entry.message}
                        </div>
                      </GuestbookEntry>
                    ))}
                    
                    {pdfError && (
                      <div style={{ 
                        background: '#f8d7da', 
                        color: '#721c24', 
                        padding: '10px', 
                        borderRadius: '4px', 
                        marginTop: '10px',
                        fontSize: '14px'
                      }}>
                        {pdfError}
                      </div>
                    )}
                    
                    {/* Pagination Bar */}
                    <PaginationBar>
                      <PaginationControls>
                        <PageButton 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          ← Previous
                        </PageButton>
                        
                        <InfoText>
                          Page {currentPage} of {totalPages}
                        </InfoText>
                        
                        <PageButton 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next →
                        </PageButton>
                      </PaginationControls>
                      
                      <PrintButton 
                        onClick={handlePrintEntries}
                        disabled={isGeneratingPDF || entries.length === 0}
                        title={entries.length === 0 ? 'No entries to print' : 'Print all entries to PDF'}
                      >
                        {isGeneratingPDF ? 'Generating PDF...' : 'Print to PDF'}
                      </PrintButton>
                    </PaginationBar>
                  </>
                )}
              </EntriesContainer>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>
    </MainContent>
  );
};
