import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDateOnly } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { usePageImage } from '../hooks/usePageImage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../utils/pdfReportHelper';
import { PDF_REPORT_CONFIG } from '../utils/pdfReportConfig';

// Define ContactMessage type
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'responded';
}

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

const ContactForm = styled.form`
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

const ContactInfoBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  height: 100%;
`;

const MessageEntry = styled.div`
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessagesContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
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





export const ContactUs: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('contact-us', '/images/EMSA-ContactUs.png');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // PDF-related state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 3;
  const CACHE_KEY = 'contact_us_recent_cache';

  // Auto-populate form fields for logged-in users
  useEffect(() => {
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.display_name || userProfile.full_name || '',
        email: userProfile.email || user.email || '',
        phone: userProfile.phone || '',
      }));
    }
  }, [user, userProfile]);

  // Load messages on component mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached)) {
          setMessages(cached);
          setCurrentPage(1);
          setError(null);
        }
      }
    } catch {}
    loadMessages();
  }, []);

  useEffect(() => {
    loadMessages();
  }, [user, userProfile]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('01_home_contact_us')
        .select('id, name, email, subject, message, created_at, status')
        .order('created_at', { ascending: false });
      if (error) {
        const requesterEmail = userProfile?.email || user?.email || '';
        if (requesterEmail) {
          const { data: own, error: ownErr } = await supabase
            .from('01_home_contact_us')
            .select('id, name, email, subject, message, created_at, status')
            .eq('email', requesterEmail)
            .order('created_at', { ascending: false });
          if (!ownErr) {
            const rows = own || [];
            setMessages(rows);
            setError(null);
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch {}
          } else {
            setMessages([]);
            setError('Recent messages could not be loaded.');
          }
        } else {
          setMessages([]);
          setError('Sign in to view your recent messages, or try again later.');
        }
      } else {
        const rows = data || [];
        setMessages(rows);
        setError(null);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch {}
      }
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
      setError('Failed to load recent messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const { data: newMessage, error } = await supabase
        .from('01_home_contact_us')
        .insert([{ 
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'new'
        }])
        .select()
        .single();
      
      if (error) throw error;
      setMessages(prev => [newMessage, ...prev]);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error('Failed to send contact message:', err);
      try {
        const { data: admins } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('role', 'System Administrator');
        const adminEmails = (admins || []).map((a: any) => a.email).filter(Boolean);
        for (const to of adminEmails) {
          await supabase.functions.invoke('email-pdf', {
            method: 'POST',
            body: {
              to,
              subject: 'New Contact Us Submission',
              message: `From: ${formData.name} (${formData.email})\nSubject: ${formData.subject}\n\n${formData.message}`
            }
          });
        }
        const localEntry: any = {
          id: `local_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString(),
          status: 'new'
        };
        const next = [localEntry, ...messages];
        setMessages(next);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
        setError(null);
      } catch (fallbackErr) {
        console.error('Fallback email send failed:', fallbackErr);
        setError('Failed to send your message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintMessages = async () => {
    try {
      setIsGeneratingPDF(true);
      setPdfError(null);
      
      // Fetch all messages from database
      const { data: allMessages, error } = await supabase
        .from('01_home_contact_us')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!allMessages || allMessages.length === 0) {
        setPdfError('No messages to print.');
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
        reportTitle: 'Contact Messages Report',
        summaryText: 'Contact messages received from website visitors',
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
      const tableData = allMessages.map(message => [
        message.name || '',
        message.email || '',
        message.subject || '',
        message.message || '',
        message.created_at ? formatDateOnly(message.created_at) : '',
        message.status || 'new'
      ]);

      // Generate table using VFH standard configuration
      autoTable(doc, {
        head: [['Name', 'Email', 'Subject', 'Message', 'Date', 'Status']],
        body: tableData,
        startY: pdfResult.tableStartY,
        ...pdfResult.tableConfig
      });

      const filename = pdfResult.filename;

      // Generate PDF data URI and navigate to global viewer
      const pdfDataUri = doc.output('datauristring');
      const timestamp = Date.now();
      const pdfKey = `pdf_contactus_${timestamp}`;
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
      sessionStorage.setItem('pdf_source_section', '/contact-us');
      sessionStorage.setItem('pdf_source_path', '/contact-us');
      
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
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = messages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render the Contact Us page
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="contact-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="contact-title">
                Contact Us
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                We welcome your questions, comments, and feedback. Please use the 
                information below to contact our Airport Rescue and Firefighting Services.
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
                  alt="Contact Us" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/EMSA-ContactUs.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>

          {/* First Row: Contact Information */}
          <TwoColumnRow>
            <LeftColumn>
              <ContactInfoBox>
                <SubTitle>
                  Emergency Contact:
                </SubTitle>
                <Paragraph>
                  <strong>For emergencies, always dial the airport emergency number immediately.</strong><br />
                  Emergency Dispatch: Available 24/7/365<br />
                  Response Time: Target 3 minutes to any airport location
                </Paragraph>
                

              </ContactInfoBox>
            </LeftColumn>

            <RightColumn>
              <ContactInfoBox>
                <SubTitle>
                  Administrative Contacts:
                </SubTitle>
                <div style={{ fontSize: '125%', letterSpacing: '1.25px', lineHeight: '25px' }}>
                  <p><strong>Fire Chief:</strong> Administration and Policy</p>
                  <p><strong>Training Officer:</strong> Personnel Development and Certification</p>
                  <p><strong>Operations Commander:</strong> Daily Operations and Response</p>
                  <p><strong>Fire Prevention Officer:</strong> Inspections and Safety Programs</p>
                </div>
              </ContactInfoBox>
            </RightColumn>
          </TwoColumnRow>

          {isSubmitted && (
            <div style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '20px',
              marginBottom: '20px' 
            }}>
              Thank you for your message! We have received your inquiry and will respond as soon as possible.
            </div>
          )}

          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '20px',
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          {/* Second Row: Contact Form and Recent Messages */}
          <TwoColumnRow>
            <LeftColumn>
              <ContactForm onSubmit={handleSubmit}>
                <SubTitle>Send us a Message:</SubTitle>
                <FormGroup>
                  <Label htmlFor="name">Full Name *</Label>
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
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="message">Message *</Label>
                  <TextArea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please describe your inquiry or feedback..."
                    required
                  />
                </FormGroup>
                
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </SubmitButton>
              </ContactForm>
            </LeftColumn>

            <RightColumn>
              <MessagesContainer>
                <SubTitle>Recent Messages:</SubTitle>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No messages yet. Be the first to contact us!
                  </div>
                ) : (
                  <>
                    {currentMessages.map(message => (
                      <MessageEntry key={message.id}>
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#1177BB', fontSize: '18px' }}>{message.name}</strong>
                          <span style={{ color: '#999', float: 'right' }}>
                            {message.created_at ? formatDateOnly(message.created_at) : ''}
                          </span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                          Subject: {message.subject}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#666' }}>
                          {message.message.length > 100 
                            ? `${message.message.substring(0, 100)}...` 
                            : message.message
                          }
                        </div>
                      </MessageEntry>
                    ))}
                    
                    {/* PDF Error Notification */}
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
                        onClick={handlePrintMessages}
                        disabled={isGeneratingPDF || messages.length === 0}
                        title={messages.length === 0 ? 'No messages to print' : 'Print all messages to PDF'}
                      >
                        {isGeneratingPDF ? 'Generating PDF...' : 'Print to PDF'}
                      </PrintButton>
                    </PaginationBar>
                  </>
                )}
              </MessagesContainer>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>
    </MainContent>
  );
};
