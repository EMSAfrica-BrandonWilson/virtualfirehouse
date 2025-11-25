import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFH_A4_P, applyFinalPageNumbers, cleanupTrailingBlankPages } from '../../utils/pdfReportHelper';
import { useAuth } from '../../contexts/AuthContext';
import { formatSupabaseError } from '../../lib/utils';
import { usePageImage } from '../../hooks/usePageImage';

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
  
  @media print {
    display: none;
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

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
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
  margin-bottom: 40px;
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
  line-height: 1.2;
`;

const FormInput = styled.input`
  padding: 6px 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.2;
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
  padding: 6px 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.2;
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
  padding: 6px 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  line-height: 1.2;
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
  margin-bottom: 4px;
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

interface SOPDocument {
  id: string;
  document_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
  description: string | null;
  sop_ref_number: string | null;
  sop_title: string | null;
  issued_date: string | null;
  review_by_date: string | null;
  sop_version: string | null;
}

interface FormData {
  sopRefNumber: string;
  sopTitle: string;
  issuedDate: string;
  reviewByDate: string;
  sopVersion: string;
}

export const AdminSOPs: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<SOPDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    sopRefNumber: '',
    sopTitle: '',
    issuedDate: '',
    reviewByDate: '',
    sopVersion: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [editingDoc, setEditingDoc] = useState<SOPDocument | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departmentLogo, setDepartmentLogo] = useState<string | null>(null);
  
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('sops', '/images/standard-operating-procedure.png');

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
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('02_admin_regulatory_documents_sops')
        .select('*')
        .order('sop_ref_number', { ascending: true });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.sopRefNumber.trim()) errors.sopRefNumber = 'SOP Ref # is required';
    if (!formData.sopTitle.trim()) errors.sopTitle = 'SOP Title is required';
    
    // Check if Review By Date is after Issued Date (only if both are provided)
    if (formData.issuedDate && formData.reviewByDate) {
      if (new Date(formData.reviewByDate) <= new Date(formData.issuedDate)) {
        errors.reviewByDate = 'Review By Date must be after Issued Date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Using shared formatter from utils for consistent, friendly messages

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

  const handleSaveMetadata = async () => {
    if (!validateForm()) {
      return;
    }

    // If a file is selected, call handleUpload instead
    if (selectedFile) {
      await handleUpload();
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Preflight duplicate checks (title and ref number)
      const titleTrimmed = formData.sopTitle.trim();
      const refTrimmed = formData.sopRefNumber.trim();
      if (titleTrimmed) {
        const { count: titleCount, error: titleErr } = await supabase
          .from('02_admin_regulatory_documents_sops')
          .select('id', { count: 'exact', head: true })
          .eq('sop_title', titleTrimmed);
        if (titleErr) throw titleErr;
        if ((titleCount || 0) > 0) {
          setError('An SOP with this title already exists. Please use a unique title.');
          return;
        }
      }
      if (refTrimmed) {
        const { count: refCount, error: refErr } = await supabase
          .from('02_admin_regulatory_documents_sops')
          .select('id', { count: 'exact', head: true })
          .eq('sop_ref_number', refTrimmed);
        if (refErr) throw refErr;
        if ((refCount || 0) > 0) {
          setError('This SOP Ref # already exists. Please use a unique reference number.');
          return;
        }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to save records.');
      }

      // Insert metadata only (without file) into database
      const { error: insertError } = await supabase
        .from('02_admin_regulatory_documents_sops')
        .insert({
          document_name: null,
          file_path: null,
          file_size: null,
          uploaded_by: user.id,
          description: null,
          sop_ref_number: formData.sopRefNumber,
          sop_title: formData.sopTitle,
          issued_date: formData.issuedDate || null,
          review_by_date: formData.reviewByDate || null,
          sop_version: formData.sopVersion || null
        });

      if (insertError) throw insertError;

      setSuccess('SOP record saved successfully! You can add the PDF document later by editing this record.');
      setSelectedFile(null);
      setFormData({
        sopRefNumber: '',
        sopTitle: '',
        issuedDate: '',
        reviewByDate: '',
        sopVersion: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh document list
      await fetchDocuments();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(formatSupabaseError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Preflight duplicate checks (file name, title and ref number)
      const originalFileName = selectedFile.name;
      const titleTrimmed = formData.sopTitle.trim();
      const refTrimmed = formData.sopRefNumber.trim();
      const [{ count: nameCount, error: nameErr }, { count: titleCount, error: titleErr }, { count: refCount, error: refErr }] = await Promise.all([
        supabase.from('02_admin_regulatory_documents_sops').select('id', { count: 'exact', head: true }).eq('document_name', originalFileName),
        titleTrimmed ? supabase.from('02_admin_regulatory_documents_sops').select('id', { count: 'exact', head: true }).eq('sop_title', titleTrimmed) : Promise.resolve({ count: 0, error: null } as any),
        refTrimmed ? supabase.from('02_admin_regulatory_documents_sops').select('id', { count: 'exact', head: true }).eq('sop_ref_number', refTrimmed) : Promise.resolve({ count: 0, error: null } as any)
      ]);
      if (nameErr) throw nameErr;
      if (titleErr) throw titleErr;
      if (refErr) throw refErr;
      if ((nameCount || 0) > 0) {
        setError('A document with this file name already exists. Please rename the PDF or choose a different file.');
        return;
      }
      if ((titleCount || 0) > 0) {
        setError('An SOP with this title already exists. Please use a unique title.');
        return;
      }
      if ((refCount || 0) > 0) {
        setError('This SOP Ref # already exists. Please use a unique reference number.');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload documents.');
      }

      // Generate unique file name
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sop-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Insert document metadata into database
      const { error: insertError } = await supabase
        .from('02_admin_regulatory_documents_sops')
        .insert({
          document_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: user.id,
          description: null,
          sop_ref_number: formData.sopRefNumber,
          sop_title: formData.sopTitle,
          issued_date: formData.issuedDate || null,
          review_by_date: formData.reviewByDate || null,
          sop_version: formData.sopVersion || null
        });

      if (insertError) {
        // If database insert fails, try to delete the uploaded file
        await supabase.storage.from('sop-documents').remove([filePath]);
        throw insertError;
      }

      setSuccess('SOP document uploaded successfully!');
      setSelectedFile(null);
      setFormData({
        sopRefNumber: '',
        sopTitle: '',
        issuedDate: '',
        reviewByDate: '',
        sopVersion: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh document list
      await fetchDocuments();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(formatSupabaseError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleOpen = async (doc: SOPDocument) => {
    // Check if PDF document exists
    if (!doc.file_path) {
      alert('No PDF document attached to this record. Please edit the record and upload a PDF document.');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('sop-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Convert blob to data URI and store in sessionStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        const storageKey = `pdf_sop_${doc.id}`;
        sessionStorage.setItem(storageKey, dataUri);
        sessionStorage.setItem('pdf_source_section', '/admin/sops');
        sessionStorage.setItem('pdf_source_path', '/admin/sops');
        
        // Navigate to PDF viewer
        navigate(`/pdf-viewer/${storageKey}`);
      };
      reader.readAsDataURL(data);
    } catch (err: any) {
      console.error('Open error:', err);
      alert('Failed to open document. Please try again.');
    }
  };

  const handleDelete = async (doc: SOPDocument) => {
    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${doc.sop_title || doc.document_name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setError('');
      setSuccess('');

      // Delete from storage only if file exists
      if (doc.file_path) {
        const { error: storageError } = await supabase.storage
          .from('sop-documents')
          .remove([doc.file_path]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('02_admin_regulatory_documents_sops')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setSuccess('SOP record deleted successfully!');
      
      // Refresh document list
      await fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete record. Please try again.');
    }
  };

  const handleEdit = (doc: SOPDocument) => {
    setEditingDoc(doc);
    setIsEditMode(true);
    setFormData({
      sopRefNumber: doc.sop_ref_number || '',
      sopTitle: doc.sop_title || '',
      issuedDate: doc.issued_date || '',
      reviewByDate: doc.review_by_date || '',
      sopVersion: doc.sop_version || ''
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
      sopRefNumber: '',
      sopTitle: '',
      issuedDate: '',
      reviewByDate: '',
      sopVersion: ''
    });
    setFormErrors({});
    setSelectedFile(null);
    setError('');
    setSuccess('');
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    if (!editingDoc) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Update only metadata in database (no file changes)
      const { error: updateError } = await supabase
        .from('02_admin_regulatory_documents_sops')
        .update({
          sop_ref_number: formData.sopRefNumber,
          sop_title: formData.sopTitle,
          issued_date: formData.issuedDate || null,
          review_by_date: formData.reviewByDate || null,
          sop_version: formData.sopVersion || null
        })
        .eq('id', editingDoc.id);

      if (updateError) throw updateError;

      setSuccess('SOP document saved successfully!');
      handleCancelEdit();
      
      // Refresh document list
      await fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(formatSupabaseError(err));
    } finally {
      setUploading(false);
    }
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
          .from('sop-documents')
          .remove([editingDoc.file_path]);

        // Upload new file
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}_${selectedFile.name}`;
        filePath = fileName;
        fileSize = selectedFile.size;

        const { error: uploadError } = await supabase.storage
          .from('sop-documents')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
      }

      // Update document metadata in database
      const { error: updateError } = await supabase
        .from('02_admin_regulatory_documents_sops')
        .update({
          document_name: selectedFile ? selectedFile.name : editingDoc.document_name,
          file_path: filePath,
          file_size: fileSize,
          sop_ref_number: formData.sopRefNumber,
          sop_title: formData.sopTitle,
          issued_date: formData.issuedDate || null,
          review_by_date: formData.reviewByDate || null,
          sop_version: formData.sopVersion || null
        })
        .eq('id', editingDoc.id);

      if (updateError) {
        // If database update fails and we uploaded a new file, try to delete it
        if (selectedFile && filePath !== editingDoc.file_path) {
          await supabase.storage.from('sop-documents').remove([filePath]);
        }
        throw updateError;
      }

      setSuccess('SOP document updated successfully!');
      handleCancelEdit();
      
      // Refresh document list
      await fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(formatSupabaseError(err));
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
      setError('No SOP documents to print. Please upload documents first.');
      return;
    }

    setIsGeneratingPDF(true);
    setError('');
    setSuccess('');

    try {
      // Setup VFH A4 Portrait standardized PDF with logo, header, and table configuration
      
      // Calculate summary statistics
      const totalDocs = documents.length;
      const expiredDocs = documents.filter(d => getStatus(d.review_by_date) === 'expired').length;
      const dueDocs = documents.filter(d => getStatus(d.review_by_date) === 'due').length;
      const currentDocs = documents.filter(d => getStatus(d.review_by_date) === 'current').length;
      const summaryText = `Summary: Total SOPs: ${totalDocs}, Current: ${currentDocs}, Due for Review: ${dueDocs}, Expired: ${expiredDocs}`;
      
      const { doc, tableStartY, tableConfig, filename } = setupVFH_A4_P({
        logoBase64: departmentLogo,
        data: {
          departmentName: "King Fahd International Airport",
          departmentType: "Airport Rescue & Fire Fighting Services",
          reportTitle: "Standard Operating Procedures Report",
          summaryText: summaryText,
          currentUser: { profile: userProfile }
        }
      });

      // Prepare table data
      const tableData = documents.map(doc => [
        doc.sop_ref_number || 'N/A',
        doc.sop_title || doc.document_name,
        doc.sop_version || 'N/A',
        formatDate(doc.issued_date),
        formatDate(doc.review_by_date),
        getStatusText(getStatus(doc.review_by_date))
      ]);

      // Create table using VFH A4 standard configuration
      const adjustedStartY = tableStartY - 6;
      autoTable(doc, {
        head: [[
          'SOP Ref #',
          'SOP Title',
          'Version',
          'Issued Date',
          'Review By Date',
          'Status'
        ]],
        body: tableData,
        startY: adjustedStartY,
        // Apply base config first, then override for tighter line height
        ...tableConfig,
        styles: { ...tableConfig.styles, fontSize: 7, cellPadding: 2 },
        headStyles: { ...tableConfig.headStyles, fontSize: 8, cellPadding: 2 },
        didDrawPage: tableConfig.didDrawPage
      });

      // Clean up any trailing blank pages and finalize page numbers
      cleanupTrailingBlankPages(doc);
      applyFinalPageNumbers(doc, {
        departmentName: "King Fahd International Airport",
        departmentType: "Airport Rescue & Fire Fighting Services",
        reportTitle: "Standard Operating Procedures Report",
        summaryText,
        currentUser: { profile: userProfile }
      });

      // Generate filename and save to sessionStorage
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${filename.replace('.pdf', '')}`;
      sessionStorage.setItem(pdfKey, pdfDataUri);
      
      // Store navigation context for PDF viewer
      sessionStorage.setItem('pdf_source_section', '/admin/sops');
      sessionStorage.setItem('pdf_source_path', '/admin/sops');
      
      navigate(`/pdf-viewer/${pdfKey}`);
      
      setSuccess(`PDF report generated successfully! (${documents.length} SOP documents included)`);
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
        <Title>Standard Operating Procedures List</Title>
        <PrintDate>Printed on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</PrintDate>
      </PrintHeader>
      
      {/* Header Section */}
      <Section aria-labelledby="sops-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="sops-title">
                Standard Operating Procedures
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The SOP's section maintains comprehensive documentation of operational procedures, 
                protocols, and guidelines that govern emergency service activities at KFIA. Our SOP 
                library provides detailed procedures for Emergency Response, Administrative Functions, 
                and Operational Activities to ensure consistent, professional, and effective service 
                delivery. We maintain current, accessible procedures supporting Training, Operations, 
                Fire Prevention, and Quality Assurance across all departments.
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
                  alt="Standard Operating Procedures" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to static image if dynamic image fails to load
                    (e.target as HTMLImageElement).src = '/images/SOPs.jpg';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      {/* Upload Section */}
      <Section>
        <SubTitle>{isEditMode ? 'Edit SOP Document' : 'Upload a Standard Operating Procedure Document'}</SubTitle>
        <UploadSection>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <FormGrid>
            <FormGroup>
              <FormLabel htmlFor="sop-ref-number">SOP Ref # *</FormLabel>
              <FormInput
                id="sop-ref-number"
                type="text"
                value={formData.sopRefNumber}
                onChange={(e) => handleInputChange('sopRefNumber', e.target.value)}
                className={formErrors.sopRefNumber ? 'error' : ''}
                placeholder="e.g., SOP-001"
              />
              {formErrors.sopRefNumber && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.sopRefNumber}</span>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="sop-title">SOP Title *</FormLabel>
              <FormInput
                id="sop-title"
                type="text"
                value={formData.sopTitle}
                onChange={(e) => handleInputChange('sopTitle', e.target.value)}
                className={formErrors.sopTitle ? 'error' : ''}
                placeholder="e.g., Emergency Response Procedures"
              />
              {formErrors.sopTitle && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.sopTitle}</span>}
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
              <FormLabel htmlFor="sop-version">SOP Version</FormLabel>
              <FormInput
                id="sop-version"
                type="text"
                value={formData.sopVersion}
                onChange={(e) => handleInputChange('sopVersion', e.target.value)}
                className={formErrors.sopVersion ? 'error' : ''}
                placeholder="e.g., v1.0, Rev A"
              />
              {formErrors.sopVersion && <span style={{ color: '#dc3545', fontSize: '12px' }}>{formErrors.sopVersion}</span>}
            </FormGroup>
            
            <FileInputWrapper>
              <FormLabel>PDF Document {isEditMode ? '(Optional - leave blank to keep current file)' : '(Optional)'}</FormLabel>
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
                  {editingDoc.document_name ? `Current: ${editingDoc.document_name}` : 'No PDF document attached - select a file to upload'}
                </SelectedFileName>
              )}
            </FileInputWrapper>
          </FormGrid>
          
          <ButtonRow>
            <UploadButton 
              onClick={isEditMode ? (selectedFile ? handleUpdate : handleSave) : handleSaveMetadata}
              disabled={uploading}
              style={{ backgroundColor: '#28a745' }}
            >
              {uploading ? 'Saving...' : 'Save'}
            </UploadButton>
            {isEditMode && (
              <>
                <UploadButton 
                  onClick={() => editingDoc && handleOpen(editingDoc)}
                  disabled={uploading || !editingDoc?.file_path}
                  style={{ 
                    backgroundColor: '#007bff',
                    opacity: !editingDoc?.file_path ? 0.5 : 1,
                    cursor: !editingDoc?.file_path ? 'not-allowed' : 'pointer'
                  }}
                  title={!editingDoc?.file_path ? 'No PDF document attached' : 'Open PDF document'}
                >
                  Open
                </UploadButton>
                <UploadButton 
                  onClick={() => editingDoc && handleDelete(editingDoc)}
                  disabled={uploading}
                  style={{ backgroundColor: '#dc3545' }}
                >
                  Delete
                </UploadButton>
                <UploadButton 
                  onClick={handleCancelEdit}
                  disabled={uploading}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancel
                </UploadButton>
              </>
            )}
          </ButtonRow>
        </UploadSection>
      </Section>

      {/* Documents List Section */}
      <Section>
        <SectionHeaderRow>
          <SubTitle>Registered Standard Operating Procedures</SubTitle>
          <PrintButton onClick={generatePDF} disabled={isGeneratingPDF || documents.length === 0}>
            {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Report'}
          </PrintButton>
        </SectionHeaderRow>
        
        {loading ? (
          <LoadingMessage>Loading documents...</LoadingMessage>
        ) : documents.length === 0 ? (
          <EmptyState>
            No SOP documents uploaded yet. Upload your first document using the form above.
          </EmptyState>
        ) : (
          <DocumentTable>
            <TableHeader>
              <tr>
                <TableHeaderCell>SOP Ref #</TableHeaderCell>
                <TableHeaderCell>Standard Operating Procedure Title</TableHeaderCell>
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
                    <TableCell>{doc.sop_ref_number || 'N/A'}</TableCell>
                    <TableCell>
                      {doc.sop_title || doc.document_name}
                      {!doc.file_path && (
                        <span style={{ 
                          marginLeft: '8px', 
                          padding: '2px 6px', 
                          backgroundColor: '#ffc107', 
                          color: '#000', 
                          fontSize: '11px', 
                          borderRadius: '3px',
                          fontWeight: 'bold'
                        }}>
                          No PDF
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{doc.sop_version || 'N/A'}</TableCell>
                    <TableCell>{formatDate(doc.issued_date)}</TableCell>
                    <TableCell>{formatDate(doc.review_by_date)}</TableCell>
                    <TableCell>
                      <StatusBadge $status={status}>
                        {getStatusText(status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton 
                        $variant="secondary"
                        onClick={() => handleEdit(doc)}
                      >
                        Edit
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