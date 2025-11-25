import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF } from '../../utils/pdfReportHelper';
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
  
  @media print {
    font-size: 24pt;
    color: black;
    text-align: center;
    margin-bottom: 0.5rem;
  }
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
  
  @media print {
    display: none;
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
  
  @media print {
    display: none;
  }
`;

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
  
  @media print {
    display: none;
  }
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
  
  @media print {
    display: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const FileInput = styled.input`
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  width: 100%;
  cursor: pointer;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
  }
  
  &::file-selector-button {
    padding: 8px 16px;
    margin-right: 12px;
    background-color: #1177BB;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #0f5c99;
    }
  }
`;

const SelectedFileName = styled.div`
  font-size: 14px;
  color: #333;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  width: fit-content;
  margin-top: 10px;
  
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

const PrintHeader = styled.div`
  display: none;
  
  @media print {
    display: block;
    text-align: center;
    margin-bottom: 1rem;
  }
`;

const PrintDate = styled.div`
  font-size: 12pt;
  margin-bottom: 0.5rem;
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
  
  @media print {
    display: none;
  }
`;

const DocumentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media print {
    box-shadow: none;
    border: 1px solid #000;
  }
`;

const TableHeader = styled.thead`
  background: #1177BB;
  color: white;
  
  @media print {
    background: #f0f0f0 !important;
    color: black !important;
  }
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
  
  @media print {
    border: 1px solid #000;
    font-size: 10pt;
    padding: 8px;
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
  
  @media print {
    &:hover {
      background-color: transparent;
    }
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
  
  @media print {
    border: 1px solid #000;
    font-size: 9pt;
    padding: 6px;
  }
`;

const StatusBadge = styled.span<{ $status: 'current' | 'due' | 'expired' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    if (props.$status === 'expired') {
      return `
        background-color: #dc3545;
        color: white;
      `;
    } else if (props.$status === 'due') {
      return `
        background-color: #ffc107;
        color: #212529;
      `;
    } else {
      return `
        background-color: #28a745;
        color: white;
      `;
    }
  }}
  
  @media print {
    background-color: transparent !important;
    color: black !important;
    border: 1px solid black;
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
  
  @media print {
    display: none;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
  
  @media print {
    display: none;
  }
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
  
  @media print {
    display: none;
  }
`;

interface StationOrderDocument {
  id: string;
  document_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
  description: string | null;
  order_ref_number: string | null;
  order_title: string | null;
  issued_date: string | null;
  review_by_date: string | null;
  order_version: string | null;
}

interface FormData {
  orderRefNumber: string;
  orderTitle: string;
  issuedDate: string;
  reviewByDate: string;
  orderVersion: string;
}

export const AdminOrders: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('orders', '/images/EMSA-Introduction.png');
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<StationOrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    orderRefNumber: '',
    orderTitle: '',
    issuedDate: '',
    reviewByDate: '',
    orderVersion: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [editingDoc, setEditingDoc] = useState<StationOrderDocument | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departmentLogo, setDepartmentLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchCurrentUser();
    loadDepartmentLogo();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

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
      // Try fallback to JPG logo if PNG fails
      try {
        const fallbackResponse = await fetch('/images/daco-new-logo.jpg');
        const fallbackBlob = await fallbackResponse.blob();
        const fallbackReader = new FileReader();
        fallbackReader.onloadend = () => {
          setDepartmentLogo(fallbackReader.result as string);
        };
        fallbackReader.readAsDataURL(fallbackBlob);
      } catch (fallbackErr) {
        console.error('Error loading fallback logo:', fallbackErr);
      }
    }
  };

  /**
   * Convert logo image to base64 format for PDF generation
   * @returns Promise<string | null> - base64 data URL or null if conversion fails
   */
  const convertLogoToBase64 = async (): Promise<string | null> => {
    try {
      // If logo is already loaded and cached, use it
      if (departmentLogo) {
        return departmentLogo;
      }

      // Convert logo from path to base64
      const response = await fetch('/images/daco-new-logo.jpg');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error converting logo to base64:', err);
      // Try fallback to JPG logo if PNG conversion fails
      try {
        const fallbackResponse = await fetch('/images/daco-new-logo.jpg');
        const fallbackBlob = await fallbackResponse.blob();
        return new Promise((resolve, reject) => {
          const fallbackReader = new FileReader();
          fallbackReader.onloadend = () => resolve(fallbackReader.result as string);
          fallbackReader.onerror = reject;
          fallbackReader.readAsDataURL(fallbackBlob);
        });
      } catch (fallbackErr) {
        console.error('Error converting fallback logo to base64:', fallbackErr);
        return null;
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('02_admin_regulatory_documents_station_orders')
        .select('*')
        .order('order_ref_number', { ascending: true });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(formatSupabaseError(err, 'Failed to load documents. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.orderRefNumber.trim()) errors.orderRefNumber = 'Order Ref # is required';
    if (!formData.orderTitle.trim()) errors.orderTitle = 'Order Title is required';
    
    // Check if Review By Date is after Issued Date (only if both are provided)
    if (formData.issuedDate && formData.reviewByDate) {
      if (new Date(formData.reviewByDate) <= new Date(formData.issuedDate)) {
        errors.reviewByDate = 'Review By Date must be after Issued Date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
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
    if (!selectedFile || !validateForm()) {
      if (!selectedFile) setError('Please select a PDF file.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload documents.');
      }

      // Preflight duplicate checks (file name, title and ref number)
      const fileNameOnly = selectedFile.name;
      const titleTrimmed = formData.orderTitle.trim();
      const refTrimmed = formData.orderRefNumber.trim();
      const [{ count: nameCount, error: nameErr }, { count: titleCount, error: titleErr }, { count: refCount, error: refErr }] = await Promise.all([
        supabase.from('02_admin_regulatory_documents_station_orders').select('id', { count: 'exact', head: true }).eq('document_name', fileNameOnly),
        titleTrimmed ? supabase.from('02_admin_regulatory_documents_station_orders').select('id', { count: 'exact', head: true }).eq('order_title', titleTrimmed) : Promise.resolve({ count: 0, error: null } as any),
        refTrimmed ? supabase.from('02_admin_regulatory_documents_station_orders').select('id', { count: 'exact', head: true }).eq('order_ref_number', refTrimmed) : Promise.resolve({ count: 0, error: null } as any)
      ]);
      if (nameErr) throw nameErr;
      if (titleErr) throw titleErr;
      if (refErr) throw refErr;
      if ((nameCount || 0) > 0) {
        setError('A document with this file name already exists. Please rename the PDF or choose a different file.');
        return;
      }
      if ((titleCount || 0) > 0) {
        setError('An order with this title already exists. Please use a unique title.');
        return;
      }
      if ((refCount || 0) > 0) {
        setError('This Order Ref # already exists. Please use a unique reference number.');
        return;
      }

      // Generate unique file name
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('station-orders-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Insert document metadata into database
      const { error: insertError } = await supabase
        .from('02_admin_regulatory_documents_station_orders')
        .insert({
          document_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: user.id,
          description: null,
          order_ref_number: formData.orderRefNumber,
          order_title: formData.orderTitle,
          issued_date: formData.issuedDate,
          review_by_date: formData.reviewByDate,
          order_version: formData.orderVersion
        });

      if (insertError) {
        // If database insert fails, try to delete the uploaded file
        await supabase.storage.from('station-orders-documents').remove([filePath]);
        throw insertError;
      }

      setSuccess('Station Order document uploaded successfully!');
      setSelectedFile(null);
      setFormData({
        orderRefNumber: '',
        orderTitle: '',
        issuedDate: '',
        reviewByDate: '',
        orderVersion: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
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

  const handleOpen = async (doc: StationOrderDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('station-orders-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Convert blob to data URI and store in sessionStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        const storageKey = `pdf_order_${doc.id}`;
        sessionStorage.setItem(storageKey, dataUri);
        sessionStorage.setItem('pdf_source_section', 'Station Orders');
        sessionStorage.setItem('pdf_source_path', '/admin/orders');
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

  const handleDelete = async (doc: StationOrderDocument) => {
    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${doc.order_title || doc.document_name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setError('');
      setSuccess('');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('station-orders-documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('02_admin_regulatory_documents_station_orders')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setSuccess('Station Order document deleted successfully!');
      
      // Refresh document list
      await fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(formatSupabaseError(err, 'Failed to delete document. Please try again.'));
    }
  };

  const handleEdit = (doc: StationOrderDocument) => {
    setEditingDoc(doc);
    setIsEditMode(true);
    setFormData({
      orderRefNumber: doc.order_ref_number || '',
      orderTitle: doc.order_title || '',
      issuedDate: doc.issued_date || '',
      reviewByDate: doc.review_by_date || '',
      orderVersion: doc.order_version || ''
    });
    setError('');
    setSuccess('');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingDoc(null);
    setIsEditMode(false);
    setFormData({
      orderRefNumber: '',
      orderTitle: '',
      issuedDate: '',
      reviewByDate: '',
      orderVersion: ''
    });
    setFormErrors({});
    setSelectedFile(null);
    setError('');
    setSuccess('');
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    if (!editingDoc) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      let filePath = editingDoc.file_path;
      let fileSize = editingDoc.file_size;

      // If a new file is selected, upload it
      if (selectedFile) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('You must be logged in to update documents.');
        }

        // Delete old file
        await supabase.storage
          .from('station-orders-documents')
          .remove([editingDoc.file_path]);

        // Upload new file
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}_${selectedFile.name}`;
        filePath = fileName;
        fileSize = selectedFile.size;

        const { error: uploadError } = await supabase.storage
          .from('station-orders-documents')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
      }

      // Update document metadata in database
      const { error: updateError } = await supabase
        .from('02_admin_regulatory_documents_station_orders')
        .update({
          document_name: selectedFile ? selectedFile.name : editingDoc.document_name,
          file_path: filePath,
          file_size: fileSize,
          order_ref_number: formData.orderRefNumber,
          order_title: formData.orderTitle,
          issued_date: formData.issuedDate || null,
          review_by_date: formData.reviewByDate || null,
          order_version: formData.orderVersion || null
        })
        .eq('id', editingDoc.id);

      if (updateError) {
        // If database update fails and we uploaded a new file, try to delete it
        if (selectedFile && filePath !== editingDoc.file_path) {
          await supabase.storage.from('station-orders-documents').remove([filePath]);
        }
        throw updateError;
      }

      setSuccess('Station Order document updated successfully!');
      handleCancelEdit();
      
      // Refresh document list
      await fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(formatSupabaseError(err, 'Failed to update document. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const getStatus = (reviewByDate: string | null): 'current' | 'due' | 'expired' => {
    if (!reviewByDate) return 'current';
    
    const today = new Date();
    const reviewDate = new Date(reviewByDate);
    const daysDiff = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 30) return 'due';
    return 'current';
  };

  const getStatusText = (status: 'current' | 'due' | 'expired'): string => {
    switch (status) {
      case 'expired': return 'Expired';
      case 'due': return 'Due for Review';
      case 'current': return 'Current';
    }
  };

  const generatePDF = async () => {
    if (documents.length === 0) {
      setError('No Station Order documents to print. Please upload documents first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Convert logo to base64 before PDF generation
      const logoBase64 = await convertLogoToBase64();
      
      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      
      // Calculate summary statistics
      const totalDocs = documents.length;
      const expiredDocs = documents.filter(d => getStatus(d.review_by_date) === 'expired').length;
      const dueDocs = documents.filter(d => getStatus(d.review_by_date) === 'due').length;
      const currentDocs = documents.filter(d => getStatus(d.review_by_date) === 'current').length;
      const summaryText = `Summary: Total Orders: ${totalDocs}, Current: ${currentDocs}, Due for Review: ${dueDocs}, Expired: ${expiredDocs}`;
      
      // Setup VFH A4 standard PDF with logo, header, and get table configuration
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Station Orders Report",
          summaryText: summaryText,
          currentUser: currentUser
        }
      });

      // Prepare table data
      const tableData = documents.map(doc => [
        doc.order_ref_number || 'N/A',
        doc.order_title || doc.document_name,
        doc.order_version || 'N/A',
        formatDate(doc.issued_date),
        formatDate(doc.review_by_date),
        getStatusText(getStatus(doc.review_by_date))
      ]);

      // Create table using VFH A4 standard configuration
      autoTable(doc, {
        head: [[
          'Order Ref #',
          'Order Title',
          'Version',
          'Issued Date',
          'Review By Date',
          'Status'
        ]],
        body: tableData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage
      });

      // Generate filename and save to sessionStorage
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', 'Station Orders');
      sessionStorage.setItem('pdf_source_path', '/admin/orders');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess(`PDF report generated successfully! (${documents.length} Station Order documents included)`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainContent aria-label="Main content">
      <PrintHeader>
        <Title>Station Orders List</Title>
        <PrintDate>Printed on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</PrintDate>
      </PrintHeader>
      {/* Header Section */}
      <Section aria-labelledby="orders-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="orders-title">
                Station Orders
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Station Orders system provides comprehensive management of administrative directives, operational instructions, and official communications for all emergency service operations at King Fahd International Airport. Our orders management system ensures timely distribution, proper acknowledgment, and effective implementation of all administrative and operational directives across all emergency service departments and personnel.
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
                  alt="Station Orders" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/EMSA-Introduction.png';
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

      {/* Upload Section */}
      <Section>
        <SubTitle>{isEditMode ? 'Edit Station Order Document' : 'Upload Station Order Document'}</SubTitle>
        <UploadSection>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <FormGrid>
            <FormGroup>
              <FormLabel htmlFor="order-ref-number">Order Ref # *</FormLabel>
              <FormInput
                id="order-ref-number"
                type="text"
                value={formData.orderRefNumber}
                onChange={(e) => handleInputChange('orderRefNumber', e.target.value)}
                className={formErrors.orderRefNumber ? 'error' : ''}
                placeholder="e.g., ORD-001"
              />
              {formErrors.orderRefNumber && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.orderRefNumber}</span>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="order-title">Order Title *</FormLabel>
              <FormInput
                id="order-title"
                type="text"
                value={formData.orderTitle}
                onChange={(e) => handleInputChange('orderTitle', e.target.value)}
                className={formErrors.orderTitle ? 'error' : ''}
                placeholder="e.g., Emergency Response Procedures"
              />
              {formErrors.orderTitle && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.orderTitle}</span>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="issued-date">Issued Date</FormLabel>
              <FormInput
                id="issued-date"
                type="date"
                value={formData.issuedDate}
                onChange={(e) => handleInputChange('issuedDate', e.target.value)}
                className={formErrors.issuedDate ? 'error' : ''}
              />
              {formErrors.issuedDate && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.issuedDate}</span>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="review-by-date">Review By Date</FormLabel>
              <FormInput
                id="review-by-date"
                type="date"
                value={formData.reviewByDate}
                onChange={(e) => handleInputChange('reviewByDate', e.target.value)}
                className={formErrors.reviewByDate ? 'error' : ''}
              />
              {formErrors.reviewByDate && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.reviewByDate}</span>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="order-version">Order Version</FormLabel>
              <FormInput
                id="order-version"
                type="text"
                value={formData.orderVersion}
                onChange={(e) => handleInputChange('orderVersion', e.target.value)}
                className={formErrors.orderVersion ? 'error' : ''}
                placeholder="e.g., v1.0, Rev A"
              />
              {formErrors.orderVersion && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.orderVersion}</span>}
            </FormGroup>
            
            <FileInputWrapper>
              <FormLabel>Select PDF Document {isEditMode ? '(Optional - leave blank to keep current file)' : '*'}</FormLabel>
              <FileInput
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <SelectedFileName>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1048576).toFixed(1)} MB)
                </SelectedFileName>
              )}
              {isEditMode && !selectedFile && editingDoc && (
                <SelectedFileName>
                  Current: {editingDoc.document_name}
                </SelectedFileName>
              )}
            </FileInputWrapper>
          </FormGrid>
          
          <ButtonRow>
            <UploadButton 
              onClick={isEditMode ? handleUpdate : handleUpload}
              disabled={isEditMode ? uploading : (!selectedFile || uploading)}
            >
              {uploading ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Update Document' : 'Upload Document')}
            </UploadButton>
            {isEditMode && (
              <UploadButton 
                onClick={handleCancelEdit}
                disabled={uploading}
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancel
              </UploadButton>
            )}
          </ButtonRow>
        </UploadSection>
      </Section>

      {/* Documents List Section */}
      <Section>
        <SubTitle>Station Order Documents</SubTitle>
        <PrintButton onClick={generatePDF} disabled={isGeneratingPDF || documents.length === 0}>
          {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Report'}
        </PrintButton>
        
        {loading ? (
          <LoadingMessage>Loading documents...</LoadingMessage>
        ) : documents.length === 0 ? (
          <EmptyState>
            No Station Order documents uploaded yet. Upload your first document using the form above.
          </EmptyState>
        ) : (
          <DocumentTable>
            <TableHeader>
              <tr>
                <TableHeaderCell>Order Ref #</TableHeaderCell>
                <TableHeaderCell>Order Title</TableHeaderCell>
                <TableHeaderCell>Version</TableHeaderCell>
                <TableHeaderCell>Issued Date</TableHeaderCell>
                <TableHeaderCell>Review By Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const status = getStatus(doc.review_by_date);
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.order_ref_number || 'N/A'}</TableCell>
                    <TableCell>{doc.order_title || doc.document_name}</TableCell>
                    <TableCell>{doc.order_version || 'N/A'}</TableCell>
                    <TableCell>{formatDate(doc.issued_date)}</TableCell>
                    <TableCell>{formatDate(doc.review_by_date)}</TableCell>
                    <TableCell>
                      <StatusBadge $status={status}>
                        {getStatusText(status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton 
                        $variant="primary"
                        onClick={() => handleOpen(doc)}
                      >
                        Open
                      </ActionButton>
                      <ActionButton 
                        $variant="secondary"
                        onClick={() => handleEdit(doc)}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton 
                        $variant="danger"
                        onClick={() => handleDelete(doc)}
                      >
                        Delete
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DocumentTable>
        )}
      </Section>
    </MainContent>
  );
};