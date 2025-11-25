import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../../hooks/usePageImage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
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

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '48%'};
  vertical-align: top;
  text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
`;

const ImageColumn = styled.div`
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
  }
`;

const HeaderImage = styled.img`
  width: 200px;
  height: auto;
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 200px;
  height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FieldColumn = styled.div<{ $flex?: string }>`
  flex: ${props => props.$flex || '1'};
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const SubmitButton = styled.button`
  background-color: #1177BB;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SaveAndNextButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 15px;
  
  &:hover {
    background-color: #218838;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #363;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cfc;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const InfoBox = styled.div`
  background-color: #e3f2fd;
  border-left: 4px solid #1177BB;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
`;

const WarningBox = styled.div`
  background-color: #fff8e1;
  border-left: 4px solid #f5a623;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
  color: #856404;
`;

const FormHeading = styled.h2`
  font-size: 1.3rem;
  color: #1177BB;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FF9900;
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const DocumentsListSection = styled.div`
  margin-bottom: 2rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const DocumentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background-color: #1177BB;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #0f5c99;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #333;
`;

const StatusBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: ${props => props.$color};
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: #1177BB;
  color: white;
  
  &:hover {
    background-color: #0f5c99;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #e74c3c;
  color: white;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const AddButton = styled.button`
  background-color: #27ae60;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 15px;
  
  &:hover {
    background-color: #229954;
  }
`;

const CancelButton = styled.button`
  background-color: #95a5a6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background-color: #7f8c8d;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
  font-size: 14px;
  background-color: white;
  border-radius: 6px;
  margin-top: 15px;
`;


interface DocumentFormData {
  documentType: string;
  passportNumber: string;
  passportExpiryDate: string;
  visaType: string;
  visaExpiryDate: string;
  nationalIdExpiryDate: string;
  drivingLicenseType: string;
  drivingLicenseExpiryDate: string;
  securityAccessPermitExpiryDate: string;
  aerodromeDrivingPermitExpiryDate: string;
  medicalFitnessExpiryDate: string;
}

interface DocumentRecord {
  document_id: number;
  staff_id: number;
  document_type: string;
  passport_number?: string;
  passport_expiry_date?: string;
  visa_type?: string;
  visa_expiry_date?: string;
  national_id_expiry_date?: string;
  driving_license_type?: string;
  driving_license_expiry_date?: string;
  security_access_permit_expiry_date?: string;
  aerodrome_driving_permit_expiry_date?: string;
  medical_fitness_expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export const StaffDocumentExpiry: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: '',
    passportNumber: '',
    passportExpiryDate: '',
    visaType: '',
    visaExpiryDate: '',
    nationalIdExpiryDate: '',
    drivingLicenseType: '',
    drivingLicenseExpiryDate: '',
    securityAccessPermitExpiryDate: '',
    aerodromeDrivingPermitExpiryDate: '',
    medicalFitnessExpiryDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffId, setStaffId] = useState<number | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);
  const [basicInfoCompleted, setBasicInfoCompleted] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{ name: string; employeeNumber: string } | null>(null);
  const [staffInfoLoading, setStaffInfoLoading] = useState(true);
  const [documentRecords, setDocumentRecords] = useState<DocumentRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    const storedStaffId = sessionStorage.getItem('current_staff_id');
    const storedEmployeeNumber = sessionStorage.getItem('current_employee_number');
    const basicCompleted = sessionStorage.getItem('basic_info_completed') === 'true';
    
    setBasicInfoCompleted(basicCompleted);
    
    if (!storedStaffId) {
      setStaffInfoLoading(false);
      return;
    }
    
    setStaffId(parseInt(storedStaffId));
    setEmployeeNumber(storedEmployeeNumber || '');
    loadStaffInfo(parseInt(storedStaffId));
    loadAllDocuments(parseInt(storedStaffId));
  }, [navigate]);

  const loadStaffInfo = async (staffId: number) => {
    setStaffInfoLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: {
          action: 'read',
          table: '02_admin_staff_1_registration',
          staff_id: staffId
        }
      });

      if (error) {
        console.error('Error loading staff info:', error);
        return;
      }

      if (data?.data) {
        setStaffInfo({
          name: `${data.data.first_name || ''} ${data.data.last_name || ''}`.trim(),
          employeeNumber: data.data.employee_number || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading staff info:', error);
    } finally {
      setStaffInfoLoading(false);
    }
  };

  const loadAllDocuments = async (staffId: number) => {
    setLoadingRecords(true);
    try {
      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: {
          action: 'list',
          table: '02_admin_staff_3_permits',
          staff_id: staffId
        }
      });

      if (error) {
        console.error('Error loading documents:', error);
        setError('Failed to load document records');
        return;
      }

      if (data?.data) {
        // Create a deep copy to ensure each record has its own reference
        const uniqueRecords = data.data.map((record: DocumentRecord) => ({
          ...record,
          // Ensure all properties have their own references
          document_id: record.document_id,
          staff_id: record.staff_id,
          document_type: record.document_type || '',
          passport_number: record.passport_number || null,
          passport_expiry_date: record.passport_expiry_date || null,
          visa_type: record.visa_type || null,
          visa_expiry_date: record.visa_expiry_date || null,
          national_id_expiry_date: record.national_id_expiry_date || null,
          driving_license_type: record.driving_license_type || null,
          driving_license_expiry_date: record.driving_license_expiry_date || null,
          security_access_permit_expiry_date: record.security_access_permit_expiry_date || null,
          aerodrome_driving_permit_expiry_date: record.aerodrome_driving_permit_expiry_date || null,
          medical_fitness_expiry_date: record.medical_fitness_expiry_date || null,
          created_at: record.created_at || new Date().toISOString(),
          updated_at: record.updated_at || new Date().toISOString()
        }));
        setDocumentRecords(uniqueRecords);
      } else {
        setDocumentRecords([]);
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      setError('Failed to load document records');
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleEditDocument = (record: DocumentRecord) => {
    console.log('Editing document record:', record);
    console.log('Current document records before edit:', documentRecords);
    
    // Create a completely isolated copy of the form data
    setFormData({
      documentType: record.document_type || '',
      passportNumber: record.passport_number || '',
      passportExpiryDate: record.passport_expiry_date || '',
      visaType: record.visa_type || '',
      visaExpiryDate: record.visa_expiry_date || '',
      nationalIdExpiryDate: record.national_id_expiry_date || '',
      drivingLicenseType: record.driving_license_type || '',
      drivingLicenseExpiryDate: record.driving_license_expiry_date || '',
      securityAccessPermitExpiryDate: record.security_access_permit_expiry_date || '',
      aerodromeDrivingPermitExpiryDate: record.aerodrome_driving_permit_expiry_date || '',
      medicalFitnessExpiryDate: record.medical_fitness_expiry_date || ''
    });
    setIsEditing(true);
    setEditingDocumentId(record.document_id);
    window.scrollTo({ top: document.getElementById('document-form')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    // Create a completely new form data object to ensure no shared references
    setFormData({
      documentType: '',
      passportNumber: '',
      passportExpiryDate: '',
      visaType: '',
      visaExpiryDate: '',
      nationalIdExpiryDate: '',
      drivingLicenseType: '',
      drivingLicenseExpiryDate: '',
      securityAccessPermitExpiryDate: '',
      aerodromeDrivingPermitExpiryDate: '',
      medicalFitnessExpiryDate: ''
    });
    setIsEditing(false);
    setEditingDocumentId(null);
  };

  const handleDeleteDocument = async (documentId: number, documentType: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${documentType}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: {
          action: 'delete',
          table: '02_admin_staff_3_permits',
          id: documentId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete document');
      }

      setSuccess(`${documentType} deleted successfully!`);
      // Reload the data to ensure we get fresh records with unique references
      if (staffId) {
        loadAllDocuments(staffId);
      }
      
      // If we were editing this document, reset the form
      if (editingDocumentId === documentId) {
        handleCancelEdit();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting document');
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { status: 'unknown', color: '#999' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'Expired', color: '#e74c3c' };
    } else if (daysUntilExpiry <= 30) {
      return { status: `Expires in ${daysUntilExpiry} days`, color: '#f39c12' };
    } else {
      return { status: 'Valid', color: '#27ae60' };
    }
  };

  const getDocumentKeyDetails = (record: DocumentRecord) => {
    switch (record.document_type) {
      case 'Passport':
        return record.passport_number || 'N/A';
      case 'Visa':
        return record.visa_type || 'N/A';
      case "Driver's License":
        return record.driving_license_type || 'N/A';
      default:
        return '-';
    }
  };

  const getDocumentExpiryDate = (record: DocumentRecord) => {
    switch (record.document_type) {
      case 'Passport':
        return record.passport_expiry_date;
      case 'Visa':
        return record.visa_expiry_date;
      case 'National ID / Iqama':
        return record.national_id_expiry_date;
      case "Driver's License":
        return record.driving_license_expiry_date;
      case 'Security Access Permit':
        return record.security_access_permit_expiry_date;
      case "Aerodrome Driver's Permit":
        return record.aerodrome_driving_permit_expiry_date;
      case 'Medical Fitness':
        return record.medical_fitness_expiry_date;
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffId) {
      setError('Staff ID not found. Please complete Basic Registration Info first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData: any = {
        action: isEditing ? 'update' : 'create',
        table: 'staff_document_expiry',
        data: {
          staff_id: staffId,
          document_type: formData.documentType || null,
          passport_number: formData.passportNumber || null,
          passport_expiry_date: formData.passportExpiryDate || null,
          visa_type: formData.visaType || null,
          visa_expiry_date: formData.visaExpiryDate || null,
          national_id_expiry_date: formData.nationalIdExpiryDate || null,
          driving_license_type: formData.drivingLicenseType || null,
          driving_license_expiry_date: formData.drivingLicenseExpiryDate || null,
          security_access_permit_expiry_date: formData.securityAccessPermitExpiryDate || null,
          aerodrome_driving_permit_expiry_date: formData.aerodromeDrivingPermitExpiryDate || null,
          medical_fitness_expiry_date: formData.medicalFitnessExpiryDate || null
        }
      };
      
      // Add ID for update operation
      if (isEditing && editingDocumentId) {
        requestData.id = editingDocumentId;
      }

      const { data, error } = await supabase.functions.invoke('staff-multi-form-crud', {
        method: 'POST',
        body: requestData
      });

      if (error) {
        throw new Error(error.message || 'Failed to save document information');
      }

      setSuccess(isEditing ? 'Document information updated successfully!' : 'Document information saved successfully!');
      
      // Reload the document list
      if (staffId) {
        loadAllDocuments(staffId);
      }
      
      // Reset form after successful save
      handleCancelEdit();
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving document information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    
    if (!error) {
      setTimeout(() => {
        navigate('/admin/register/staff/training-records');
      }, 1500);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="staff-document-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="staff-document-title">Add Document Expiry Information</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Track and manage expiry dates for important staff documents including passports, visas, work permits, driving licenses, and medical certificates.
              </Paragraph>
              {!basicInfoCompleted && (
                <WarningBox>
                  Notice: Please complete the Basic Information form first before entering data on this page.
                </WarningBox>
              )}
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Staff Registration" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/Staff.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <FormSection id="document-form">
        {staffInfo && (
          <FormHeading>
            {isEditing ? `Edit Document: ${formData.documentType}` : 'Add New Document'} For: {staffInfo.name} {staffInfo.employeeNumber}
          </FormHeading>
        )}
        
        {isEditing && (
          <AddButton onClick={handleCancelEdit} type="button">
            + Add New Document
          </AddButton>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <FormContainer onSubmit={handleSubmit}>
          {/* Document Type Dropdown */}
          <FieldRow>
            <FieldColumn>
              <Label htmlFor="documentType">Document Type *</Label>
              <Select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                disabled={!basicInfoCompleted}
                required
              >
                <option value="">-- Select Document Type --</option>
                <option value="Aerodrome Driver's Permit">Aerodrome Driver's Permit</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Medical Fitness">Medical Fitness</option>
                <option value="National ID / Iqama">National ID / Iqama</option>
                <option value="Passport">Passport</option>
                <option value="Security Access Permit">Security Access Permit</option>
                <option value="Visa">Visa</option>
              </Select>
            </FieldColumn>
            <FieldColumn>
            </FieldColumn>
          </FieldRow>

          {/* Conditional Fields Based on Document Type */}
          {formData.documentType === 'Passport' && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="passportNumber">Passport Number *</Label>
                  <Input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    placeholder="Enter passport number"
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
                <FieldColumn>
                  <Label htmlFor="passportExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="passportExpiryDate"
                    name="passportExpiryDate"
                    value={formData.passportExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
              </FieldRow>
            </>
          )}

          {formData.documentType === 'Visa' && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="visaType">Visa Type *</Label>
                  <Input
                    type="text"
                    id="visaType"
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleInputChange}
                    placeholder="Enter visa type"
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
                <FieldColumn>
                  <Label htmlFor="visaExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="visaExpiryDate"
                    name="visaExpiryDate"
                    value={formData.visaExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
              </FieldRow>
            </>
          )}

          {formData.documentType === 'National ID / Iqama' && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="nationalIdExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="nationalIdExpiryDate"
                    name="nationalIdExpiryDate"
                    value={formData.nationalIdExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
                <FieldColumn>
                </FieldColumn>
              </FieldRow>
            </>
          )}

          {formData.documentType === "Driver's License" && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="drivingLicenseType">License Type *</Label>
                  <Select
                    id="drivingLicenseType"
                    name="drivingLicenseType"
                    value={formData.drivingLicenseType}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  >
                    <option value="">-- Select License Type --</option>
                    <option value="Dangerous Goods">Dangerous Goods</option>
                    <option value="Extra Heavy">Extra Heavy</option>
                    <option value="Passenger Vehicle">Passenger Vehicle</option>
                  </Select>
                </FieldColumn>
                <FieldColumn>
                  <Label htmlFor="drivingLicenseExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="drivingLicenseExpiryDate"
                    name="drivingLicenseExpiryDate"
                    value={formData.drivingLicenseExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
              </FieldRow>
            </>
          )}

          {formData.documentType === 'Security Access Permit' && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="securityAccessPermitExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="securityAccessPermitExpiryDate"
                    name="securityAccessPermitExpiryDate"
                    value={formData.securityAccessPermitExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
                <FieldColumn>
                </FieldColumn>
              </FieldRow>
            </>
          )}

          {formData.documentType === "Aerodrome Driver's Permit" && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="aerodromeDrivingPermitExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="aerodromeDrivingPermitExpiryDate"
                    name="aerodromeDrivingPermitExpiryDate"
                    value={formData.aerodromeDrivingPermitExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
                <FieldColumn>
                </FieldColumn>
              </FieldRow>
            </>
          )}

          {formData.documentType === 'Medical Fitness' && (
            <>
              <FieldRow>
                <FieldColumn>
                  <Label htmlFor="medicalFitnessExpiryDate">Expiry Date *</Label>
                  <Input
                    type="date"
                    id="medicalFitnessExpiryDate"
                    name="medicalFitnessExpiryDate"
                    value={formData.medicalFitnessExpiryDate}
                    onChange={handleInputChange}
                    disabled={!basicInfoCompleted}
                    required
                  />
                </FieldColumn>
                <FieldColumn>
                </FieldColumn>
              </FieldRow>
            </>
          )}

          <div style={{ marginTop: '20px' }}>
            <SubmitButton type="submit" disabled={loading || !formData.documentType}>
              {loading ? 'Saving...' : 'Save Information'}
            </SubmitButton>
            {isEditing && (
              <CancelButton onClick={handleCancelEdit} type="button" disabled={loading}>
                Cancel
              </CancelButton>
            )}
            <SaveAndNextButton onClick={handleSaveAndNext} type="button" disabled={loading || !formData.documentType}>
              {loading ? 'Saving...' : 'Save and Next'}
            </SaveAndNextButton>
          </div>
        </FormContainer>
      </FormSection>

      {/* Document Records List */}
      {staffInfo && basicInfoCompleted && (
        <DocumentsListSection>
          <FormHeading>Existing Document Records For: {staffInfo.name} {staffInfo.employeeNumber}</FormHeading>
          
          {loadingRecords ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading documents...</div>
          ) : documentRecords.length === 0 ? (
            <EmptyMessage>No documents found. Add your first document below.</EmptyMessage>
          ) : (
            <DocumentsTable>
              <thead>
                <tr>
                  <TableHeader>Document Type</TableHeader>
                  <TableHeader>Key Details</TableHeader>
                  <TableHeader>Expiry Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {documentRecords.map((record, index) => {
                  console.log(`Rendering record ${index}:`, record);
                  const expiryDate = getDocumentExpiryDate(record);
                  const expiryStatus = getExpiryStatus(expiryDate || '');
                  
                  return (
                    <TableRow key={`${record.document_id}-${index}`}>
                      <TableCell>{record.document_type}</TableCell>
                      <TableCell>{getDocumentKeyDetails(record)}</TableCell>
                      <TableCell>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <StatusBadge $color={expiryStatus.color}>
                          {expiryStatus.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <EditButton 
                          onClick={() => handleEditDocument({...record})}
                          disabled={loading}
                        >
                          Edit
                        </EditButton>
                        <DeleteButton 
                          onClick={() => handleDeleteDocument(record.document_id, record.document_type)}
                          disabled={loading}
                        >
                          Delete
                        </DeleteButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </DocumentsTable>
          )}
        </DocumentsListSection>
      )}
    </MainContent>
  );
};
