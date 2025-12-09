import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../hooks/usePageImage';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

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
  background: white;
  border: 2px solid #1177BB;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FullWidthFormGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #1177BB;
  font-size: 14px;
  font-weight: bold;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #E1E1E1;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.3);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #E1E1E1;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.3);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #E1E1E1;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.3);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #E1E1E1;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => {
    if (props.$variant === 'danger') return '#DC143C';
    if (props.$variant === 'secondary') return '#6c757d';
    return '#FF9900';
  }};
  color: white;
  
  &:hover {
    background-color: ${props => {
      if (props.$variant === 'danger') return '#b01030';
      if (props.$variant === 'secondary') return '#5a6268';
      return '#e08800';
    }};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    box-shadow: none;
  }
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

const StatusBadge = styled.span<{ $color: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  background-color: ${props => props.$color};
  color: white;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'view' }>`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => {
    if (props.$variant === 'delete') return '#DC143C';
    if (props.$variant === 'view') return '#1177BB';
    return '#FF9900';
  }};
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

const ErrorMessage = styled.div`
  color: #DC143C;
  font-size: 14px;
  margin-top: 10px;
  padding: 12px;
  background: #FFE4E1;
  border: 2px solid #DC143C;
  border-radius: 6px;
`;

const SuccessMessage = styled.div`
  color: #008000;
  font-size: 14px;
  margin-top: 10px;
  padding: 12px;
  background: #F0FFF0;
  border: 2px solid #008000;
  border-radius: 6px;
`;

const HelpText = styled.div`
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
`;

interface NotamFormData {
  notam_ref: string;
  date_issued: string;
  effective_from: string;
  effective_to: string;
  category: string;
  category_text: string;
  description: string;
  status: string;
  actions_taken: string;
}

interface NotamRecord extends NotamFormData {
  id: number;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export const NotamCapture: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('notam-capture', '/images/notam.jpg');
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<NotamFormData>({
    notam_ref: 'OEJDYNYX',
    date_issued: '',
    effective_from: '',
    effective_to: '',
    category: '',
    category_text: '',
    description: '',
    status: '',
    actions_taken: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notams, setNotams] = useState<NotamRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchNotams();
  }, []);

  const fetchNotams = async () => {
    try {
      const { data, error } = await supabase
        .from('03_ecc_01_edob_06_notams')
        .select('*')
        .order('effective_from', { ascending: false });

      if (error) throw error;
      setNotams(data || []);
    } catch (err: any) {
      console.error('Error fetching NOTAMs:', err);
      setError('Failed to fetch NOTAMs: ' + err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.notam_ref.trim()) {
      setError('NOTAM Address is required');
      return false;
    }
    if (!formData.date_issued) {
      setError('Date and Time of Filing is required');
      return false;
    }
    if (!formData.effective_from) {
      setError('Effective From is required');
      return false;
    }
    if (!formData.effective_to) {
      setError('Effective To is required');
      return false;
    }
    if (new Date(formData.effective_from) >= new Date(formData.effective_to)) {
      setError('Effective From must be before Effective To');
      return false;
    }
    if (!formData.category) {
      setError('NOTAM Category is required');
      return false;
    }
    if (!formData.category_text.trim()) {
      setError('New Information Details is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('NOTAM Text is required');
      return false;
    }
    if (!formData.status) {
      setError('NOTAM Status is required');
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.notam_ref.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notam-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notam-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading file:', err);
      throw new Error('Failed to upload document: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let documentUrl = existingDocumentUrl;

      // Upload new file if selected
      if (selectedFile) {
        documentUrl = await uploadFile(selectedFile);
      }

      const notamData = {
        ...formData,
        document_url: documentUrl
      };

      if (editingId) {
        // Update existing NOTAM
        const { error: updateError } = await supabase
          .from('03_ecc_01_edob_06_notams')
          .update(notamData)
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccess('NOTAM updated successfully!');
      } else {
        // Create new NOTAM
        const { error: insertError } = await supabase
          .from('03_ecc_01_edob_06_notams')
          .insert([notamData]);

        if (insertError) throw insertError;
        setSuccess('NOTAM created successfully!');
      }

      // Reset form
      resetForm();
      fetchNotams();
    } catch (err: any) {
      console.error('Error saving NOTAM:', err);
      setError(err.message || 'Failed to save NOTAM. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      notam_ref: 'OEJDYNYX',
      date_issued: '',
      effective_from: '',
      effective_to: '',
      category: '',
      category_text: '',
      description: '',
      status: '',
      actions_taken: ''
    });
    setSelectedFile(null);
    setEditingId(null);
    setExistingDocumentUrl(null);
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getDisplayStatus = (notam: NotamRecord): string => {
    const now = new Date();
    const effectiveTo = new Date(notam.effective_to);
    
    // Check if expired
    if (notam.status === 'NOTAM is Active' && now > effectiveTo) {
      return 'NOTAM has Expired';
    }
    
    return notam.status;
  };

  const getStatusColor = (status: string): string => {
    if (status.includes('Active')) return '#4CAF50';
    if (status.includes('Cancelled')) return '#f44336';
    if (status.includes('Expired')) return '#9e9e9e';
    return '#2196F3';
  };

  const handleEdit = (notam: NotamRecord) => {
    setFormData({
      notam_ref: notam.notam_ref,
      date_issued: notam.date_issued.substring(0, 16),
      effective_from: notam.effective_from.substring(0, 16),
      effective_to: notam.effective_to.substring(0, 16),
      category: notam.category,
      category_text: notam.category_text || '',
      description: notam.description,
      status: notam.status,
      actions_taken: notam.actions_taken || ''
    });
    setEditingId(notam.id);
    setExistingDocumentUrl(notam.document_url);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, notamRef: string) => {
    if (!window.confirm(`Are you sure you want to delete NOTAM ${notamRef}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase
        .from('03_ecc_01_edob_06_notams')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess('NOTAM deleted successfully!');
      fetchNotams();
      
      if (editingId === id) {
        resetForm();
      }
    } catch (err: any) {
      console.error('Error deleting NOTAM:', err);
      setError('Failed to delete NOTAM: ' + err.message);
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

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="notam-capture-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="notam-capture-title">
                NOTAM Capture Tool
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The NOTAM Capture Tool provides a centralized interface for recording, managing, 
                and tracking all Notice to Airmen (NOTAM) information at KFIA. This system enables 
                ECC personnel to efficiently capture NOTAM details, upload supporting documentation, 
                and maintain comprehensive records of all aeronautical information notifications 
                affecting airport operations.
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
                  alt="NOTAM Capture" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/notam.jpg';
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

      {/* NOTAM Entry Form (without heading) */}
      <Section aria-labelledby="entry-form">
        <FormContainer>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <FormLabel htmlFor="notam_ref">
                  NOTAM Address <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="notam_ref"
                  name="notam_ref"
                  value={formData.notam_ref}
                  onChange={handleInputChange}
                  placeholder="e.g., A0123/25"
                  disabled={true}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="date_issued">
                  Date and Time of Filing <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormInput
                  type="datetime-local"
                  id="date_issued"
                  name="date_issued"
                  value={formData.date_issued}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="effective_from">
                  Effective From <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormInput
                  type="datetime-local"
                  id="effective_from"
                  name="effective_from"
                  value={formData.effective_from}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="effective_to">
                  Effective To <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormInput
                  type="datetime-local"
                  id="effective_to"
                  name="effective_to"
                  value={formData.effective_to}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="category">
                  NOTAM Category <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormSelect
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="NOTAMN">NOTAMN (containing new information)</option>
                  <option value="NOTAMR">NOTAMR (replacing a previous NOTAM)</option>
                  <option value="NOTAMC">NOTAMC (cancelling a previous NOTAM)</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="category_text">
                  New Information Details <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="category_text"
                  name="category_text"
                  value={formData.category_text}
                  onChange={handleInputChange}
                  placeholder="Describe the new information, replacement reference, or cancellation reference."
                  disabled={loading}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="description">
                  NOTAM Text: Plain Language Entry (using ICAO Abbreviations) <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a clear and concise description of the aeronautical information using ICAO standard abbreviations..."
                  disabled={loading}
                  required
                />
                
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="actions_taken">
                  Actions Taken (Optional)
                </FormLabel>
                <FormTextarea
                  id="actions_taken"
                  name="actions_taken"
                  value={formData.actions_taken}
                  onChange={handleInputChange}
                  placeholder="Document any actions taken by airport personnel or required by stakeholders."
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="status">
                  NOTAM Status <span style={{ color: '#DC143C' }}>*</span>
                </FormLabel>
                <FormSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="">Select a status</option>
                  <option value="NOTAM is Active">NOTAM is Active</option>
                  <option value="NOTAM is Cancelled">NOTAM is Cancelled</option>
                  <option value="NOTAM has Expired">NOTAM has Expired</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="document-upload">
                  Upload NOTAM Document (PDF, max 10MB)
                </FormLabel>
                <FileInput
                  type="file"
                  id="document-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <HelpText>
                  {editingId && existingDocumentUrl ? (
                    <>
                      Current document: <a href={existingDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1177BB' }}>View PDF</a>
                      {' '}(Upload a new file to replace)
                    </>
                  ) : selectedFile ? (
                    `Selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                  ) : (
                    'No file selected'
                  )}
                </HelpText>
              </FormGroup>
            </FormGrid>

            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
            {success && <SuccessMessage role="status">{success}</SuccessMessage>}

            <ButtonGroup>
              <Button type="submit" disabled={loading}>
                {loading ? 'Processing...' : editingId ? 'Update NOTAM' : 'Create NOTAM'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  $variant="secondary" 
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel Edit
                </Button>
              )}
              <Button 
                type="button" 
                $variant="secondary" 
                onClick={resetForm}
                disabled={loading}
              >
                Clear Form
              </Button>
            </ButtonGroup>
          </form>
        </FormContainer>
      </Section>

      <Section>
        {/* Table content previously added via search replace */}
        <SubTitle>NOTAM Records</SubTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>NOTAM Address</th>
                <th>Category</th>
                <th>Date Issued</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notams.map(notam => {
                const displayStatus = getDisplayStatus(notam);
                return (
                  <tr key={notam.id}>
                    <td>{notam.notam_ref || 'N/A'}</td>
                    <td>{notam.category}</td>
                    <td>{formatDateTime(notam.date_issued)}</td>
                    <td>{formatDateTime(notam.effective_from)}</td>
                    <td>{formatDateTime(notam.effective_to)}</td>
                    <td><StatusBadge $color={getStatusColor(displayStatus)}>{displayStatus}</StatusBadge></td>
                    <td>
                      <ActionButton 
                        $variant="edit"
                        onClick={() => handleEdit(notam)}
                        disabled={loading}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton 
                        $variant="delete"
                        onClick={() => handleDelete(notam.id, notam.notam_ref)}
                        disabled={loading}
                      >
                        Delete
                      </ActionButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      </Section>
    </MainContent>
  );
};
