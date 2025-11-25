import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { formatSupabaseError } from '../../lib/utils';

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
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
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

const UploadSection = styled.div`
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 2px solid #1177BB;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FileInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 10px 20px;
  background-color: #1177BB;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #0f5c99;
  }
`;

const SelectedFileName = styled.div`
  font-size: 14px;
  color: #333;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
`;

const UploadButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #e08800;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentCard = styled.div`
  background: white;
  border: 2px solid #E1E1E1;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #1177BB;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const DocumentTitle = styled.h3`
  font-size: 16px;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 10px;
  word-wrap: break-word;
`;

const DocumentInfo = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
  flex-wrap: wrap;
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
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
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

const ErrorMessage = styled.div`
  background: #FFE4E1;
  border: 2px solid #DC143C;
  color: #DC143C;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #F0FFF0;
  border: 2px solid #008000;
  color: #008000;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
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

interface GACARDocument {
  id: string;
  document_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
  description: string | null;
}

export const GACARDocuments: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('gacar-documents', '/images/GACA.png');
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<GACARDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('02_admin_regulatory_documents_gacar')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(formatSupabaseError(err, 'Failed to load documents. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setSelectedFile(null);
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      setError('File size must be less than 50MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload documents.');
      }

      // Preflight duplicate check for file name
      const { count, error: dupErr } = await supabase
        .from('02_admin_regulatory_documents_gacar')
        .select('id', { count: 'exact', head: true })
        .eq('document_name', selectedFile.name);
      if (dupErr) throw dupErr;
      if ((count || 0) > 0) {
        setError('A document with this file name already exists. Please rename the PDF or choose a different file.');
        return;
      }

      // Generate unique file name
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gacar-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Insert document metadata into database
      const { error: insertError } = await supabase
        .from('02_admin_regulatory_documents_gacar')
        .insert({
          document_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: user.id,
          description: null
        });

      if (insertError) {
        // If database insert fails, try to delete the uploaded file
        await supabase.storage.from('gacar-documents').remove([filePath]);
        throw insertError;
      }

      setSuccess('Document uploaded successfully!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('gacar-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh document list
      await fetchDocuments();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(formatSupabaseError(err, 'Failed to upload document. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: GACARDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('gacar-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.document_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleOpen = async (doc: GACARDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('gacar-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Convert blob to data URI and store in sessionStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        const storageKey = `pdf_gacar_${doc.id}`;
        sessionStorage.setItem(storageKey, dataUri);
        sessionStorage.setItem('pdf_source_section', '/admin/regulatory-docs/gacar');
        sessionStorage.setItem('pdf_source_path', '/admin/regulatory-docs/gacar');
        sessionStorage.setItem('fromRegulatoryDocs', 'true');
        
        // Navigate to PDF viewer
        navigate(`/pdf-viewer/${storageKey}`);
      };
      reader.readAsDataURL(data);
    } catch (err: any) {
      console.error('Open error:', err);
      alert('Failed to open document. Please try again.');
    }
  };

  const handleEmail = (doc: GACARDocument) => {
    const subject = encodeURIComponent(`GACAR Document: ${doc.document_name}`);
    const body = encodeURIComponent(
      `I would like to share the following ICAO document with you:\n\n` +
      `Document: ${doc.document_name}\n` +
      `Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}\n\n` +
      `This document is part of our GACAR regulatory compliance documentation.\n\n` +
      `Best regards,\n` +
      `Airport Rescue & Fire Fighting Services`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDelete = async (doc: GACARDocument) => {
    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${doc.document_name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setError('');
      setSuccess('');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gacar-documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('02_admin_regulatory_documents_gacar')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setSuccess('Document deleted successfully!');
      
      // Refresh document list
      await fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(formatSupabaseError(err, 'Failed to delete document. Please try again.'));
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="gacar-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="gacar-title">
                GACAR Regulations
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The General Authority of Civil Aviation Regulations (GACAR) establish the regulatory framework for civil aviation in the Kingdom of Saudi Arabia. Issued by the General Authority of Civil Aviation (GACA), these regulations ensure compliance with international aviation standards while addressing specific national requirements. GACAR encompasses comprehensive guidelines for aircraft operations, airworthiness, personnel licensing, and safety management systems aligned with ICAO standards.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>
                  Loading image...
                </ImagePlaceholder>
              ) : imageUrl ? (
                <a 
                  href="https://www.gaca.gov.sa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Visit GACA official website"
                >
                  <HeaderImage 
                    src={imageUrl} 
                    alt="GACA - General Authority of Civil Aviation Official Logo" 
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/images/gacar-logo.png';
                    }}
                  />
                </a>
              ) : (
                <ImagePlaceholder>
                  No image available
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Upload Section */}
      <Section>
        <SubTitle>Upload GACAR Document</SubTitle>
        <UploadSection>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <FileInputWrapper>
            <FileInput
              id="gacar-file-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
            />
            <FileInputLabel htmlFor="gacar-file-upload">
              Select PDF Document
            </FileInputLabel>
            {selectedFile && (
              <SelectedFileName>
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </SelectedFileName>
            )}
          
            <UploadButton 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </UploadButton>
          </FileInputWrapper>
        </UploadSection>
      </Section>

      {/* Documents List Section */}
      <Section>
        <SubTitle>Available GACAR Regulations</SubTitle>
        {loading ? (
          <LoadingMessage>Loading documents...</LoadingMessage>
        ) : documents.length === 0 ? (
          <EmptyState>
            No ICAO documents uploaded yet. Upload your first document using the form above.
          </EmptyState>
        ) : (
          <DocumentGrid>
            {documents.map((doc) => (
              <DocumentCard key={doc.id}>
                <DocumentTitle>{doc.document_name}</DocumentTitle>
                <DocumentInfo>
                  <strong>Uploaded:</strong> {formatDate(doc.uploaded_at)}
                </DocumentInfo>
                <DocumentInfo>
                  <strong>Size:</strong> {formatFileSize(doc.file_size)}
                </DocumentInfo>
                <DocumentActions>
                  <ActionButton 
                    $variant="primary"
                    onClick={() => handleOpen(doc)}
                  >
                    Open
                  </ActionButton>
                  
                  
                  <ActionButton 
                    $variant="danger"
                    onClick={() => handleDelete(doc)}
                  >
                    Delete
                  </ActionButton>
                </DocumentActions>
              </DocumentCard>
            ))}
          </DocumentGrid>
        )}
      </Section>
    </MainContent>
  );
};
