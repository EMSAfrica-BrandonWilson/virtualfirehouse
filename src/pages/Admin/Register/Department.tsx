import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../../lib/supabase';
import { usePageImage } from '../../../hooks/usePageImage';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDateTime } from '../../../lib/utils';


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

const FormSection = styled.div`
  margin-bottom: 3rem;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
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

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
  
  &:invalid {
    border-color: #e74c3c;
  }
`;

const FileInput = styled.input`
  padding: 8px;
  border: 2px dashed #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: #1177BB;
    background-color: #f0f7ff;
  }
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
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
  margin-top: 10px;
  
  &:hover {
    background-color: #0f5c99;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

interface DepartmentFormData {
  deptName: string;
  deptCity: string;
  deptSuburb: string;
  deptStreetName: string;
  deptBuildingNumber: string;
  deptTelephone: string;
  deptPicture: File | null;
}

interface ContactFormData {
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactTelephone: string;
  contactPicture: File | null;
}

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background-color: #4682B4;
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 13px;
  border-bottom: 1px solid #e1e1e1;
`;

const PrintButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e08800;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RegisterDepartment: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('register-department', '/images/EMSA-Introduction.png');

  const [departmentData, setDepartmentData] = useState<DepartmentFormData>({
    deptName: '',
    deptCity: '',
    deptSuburb: '',
    deptStreetName: '',
    deptBuildingNumber: '',
    deptTelephone: '',
    deptPicture: null
  });

  const [contactData, setContactData] = useState<ContactFormData>({
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactTelephone: '',
    contactPicture: null
  });

  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState('');
  const [contactError, setContactError] = useState('');
  const [departmentSuccess, setDepartmentSuccess] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  
  // State for registered departments

  const [logoBase64, setLogoBase64] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentType, setDepartmentType] = useState('');
  const [lastDepartmentId, setLastDepartmentId] = useState<number | null>(null);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Check for editing data on component mount
  useEffect(() => {
    const editingData = sessionStorage.getItem('editing_department');
    if (editingData) {
      try {
        const department = JSON.parse(editingData);
        setIsEditing(true);
        setEditingDepartmentId(department.id);
        
        // Populate form with existing data
        setDepartmentData({
          deptName: department.name || '',
          deptCity: department.city || '',
          deptSuburb: department.suburb || '',
          deptStreetName: department.street_name || '',
          deptBuildingNumber: department.street_number || '',
          deptTelephone: department.telephone || '',
          deptPicture: null
        });
        
        setDepartmentSuccess('Editing existing department data. Make your changes and submit to update.');
        
        // Clear the editing data from sessionStorage
        sessionStorage.removeItem('editing_department');
      } catch (error) {
        console.error('Error parsing editing data:', error);
      }
    }
  }, []);





  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepartmentLoading(true);
    setDepartmentError('');
    setDepartmentSuccess('');

    try {
      let pictureData = null;
      let fileName = null;

      // Handle file upload if a picture is selected
      if (departmentData.deptPicture) {
        pictureData = await fileToBase64(departmentData.deptPicture);
        fileName = departmentData.deptPicture.name;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('register-department', {
        body: {
          deptName: departmentData.deptName,
          deptCity: departmentData.deptCity,
          deptSuburb: departmentData.deptSuburb,
          deptStreetName: departmentData.deptStreetName,
          deptStreetNumber: departmentData.deptBuildingNumber,
          deptTelephone: departmentData.deptTelephone,
          pictureData,
          fileName,
          ...(isEditing && { departmentId: editingDepartmentId }) // Include ID if editing
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to register department');
      }

      // Handle successful response
      if (data?.data?.success) {
        setDepartmentSuccess(isEditing ? 'Department updated successfully!' : 'Department registered successfully!');
        setLastDepartmentId(data.data.department.id);
        setIsEditing(false); // Reset editing mode
        // Reset form
        setDepartmentData({
          deptName: '',
          deptCity: '',
          deptSuburb: '',
          deptStreetName: '',
          deptBuildingNumber: '',
          deptTelephone: '',
          deptPicture: null
        });
        // Reset file input
        const fileInput = document.getElementById('deptPicture') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data?.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      setDepartmentError(error.message || 'An error occurred during registration');
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSuccess('');

    try {
      let pictureData = null;
      let fileName = null;

      // Handle file upload if a picture is selected
      if (contactData.contactPicture) {
        pictureData = await fileToBase64(contactData.contactPicture);
        fileName = contactData.contactPicture.name;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('register-contact', {
        body: {
          contactName: contactData.contactName,
          contactTitle: contactData.contactTitle,
          contactEmail: contactData.contactEmail,
          contactTelephone: contactData.contactTelephone,
          departmentId: lastDepartmentId,
          pictureData,
          fileName
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to register contact');
      }

      // Handle successful response
      if (data?.data?.success) {
        setContactSuccess('Contact person registered successfully!');
        // Reset form
        setContactData({
          contactName: '',
          contactTitle: '',
          contactEmail: '',
          contactTelephone: '',
          contactPicture: null
        });
        // Reset file input
        const fileInput = document.getElementById('contactPicture') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data?.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      setContactError(error.message || 'An error occurred during registration');
    } finally {
      setContactLoading(false);
    }
  };

  const handleDepartmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setDepartmentData(prev => ({
      ...prev,
      [name]: files && files[0] ? files[0] : value
    }));
  };

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: files && files[0] ? files[0] : value
    }));
  };
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="department-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="department-title">
                {isEditing ? 'Edit Emergency Department' : 'Register Your Emergency Department'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Department Registration system provides comprehensive registration information of the Emergency Service departments within the King Fahd International Airport Emergency Services Organisation.
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
                  alt="Register Department" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/EMSA-Introduction.png';
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

      {/* Registration Forms Section */}
      <Section aria-labelledby="registration-forms">
        {/* Department Registration Form */}
        <FormSection>
          <SubTitle id="registration-forms">
            {isEditing ? 'Edit Department Information' : 'Department Registration Process'}
          </SubTitle>
          {departmentError && <ErrorMessage>{departmentError}</ErrorMessage>}
          {departmentSuccess && <SuccessMessage>{departmentSuccess}</SuccessMessage>}
          <FormContainer onSubmit={handleDepartmentSubmit}>
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="deptName">Department Name</Label>
                <Input
                  type="text"
                  id="deptName"
                  name="deptName"
                  value={departmentData.deptName}
                  onChange={handleDepartmentInputChange}
                  required
                  placeholder="Enter department name"
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptCity">Department City</Label>
                <Input
                  type="text"
                  id="deptCity"
                  name="deptCity"
                  value={departmentData.deptCity}
                  onChange={handleDepartmentInputChange}
                  required
                  placeholder="Enter city"
                />
              </FieldColumn>
            </FieldRow>
            
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="deptSuburb">Department Suburb</Label>
                <Input
                  type="text"
                  id="deptSuburb"
                  name="deptSuburb"
                  value={departmentData.deptSuburb}
                  onChange={handleDepartmentInputChange}
                  required
                  placeholder="Enter suburb"
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptStreetName">Department Street Name</Label>
                <Input
                  type="text"
                  id="deptStreetName"
                  name="deptStreetName"
                  value={departmentData.deptStreetName}
                  onChange={handleDepartmentInputChange}
                  required
                  placeholder="Enter street name"
                />
              </FieldColumn>
            </FieldRow>
            
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="deptBuildingNumber">Department Street/Building #</Label>
                <Input
                  type="text"
                  id="deptBuildingNumber"
                  name="deptBuildingNumber"
                  value={departmentData.deptBuildingNumber}
                  onChange={handleDepartmentInputChange}
                  required
                  placeholder="Enter building number"
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="deptTelephone">Department Telephone #</Label>
                <Input
                  type="tel"
                  id="deptTelephone"
                  name="deptTelephone"
                  value={departmentData.deptTelephone}
                  onChange={handleDepartmentInputChange}
                  required
                  placeholder="Enter telephone number"
                />
              </FieldColumn>
            </FieldRow>
            
            <FieldRow>
              <FieldColumn $flex="1">
                <Label htmlFor="deptPicture">Department Picture</Label>
                <FileInput
                  type="file"
                  id="deptPicture"
                  name="deptPicture"
                  onChange={handleDepartmentInputChange}
                  accept="image/*"
                />
              </FieldColumn>
              <FieldColumn $flex="1">
                <div style={{ paddingTop: '24px' }}>
                  <SubmitButton type="submit" disabled={departmentLoading}>
                    {departmentLoading ? 'Submitting...' : (isEditing ? 'Update Department Information' : 'Submit Department Information')}
                  </SubmitButton>
                </div>
              </FieldColumn>
            </FieldRow>
          </FormContainer>
        </FormSection>

        {/* Contact Person Registration Form */}
        <FormSection>
          <SubTitle>
            Department Contact Person
          </SubTitle>
          {contactError && <ErrorMessage>{contactError}</ErrorMessage>}
          {contactSuccess && <SuccessMessage>{contactSuccess}</SuccessMessage>}
          <FormContainer onSubmit={handleContactSubmit}>
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="contactName">Department Contact Name</Label>
                <Input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={contactData.contactName}
                  onChange={handleContactInputChange}
                  required
                  placeholder="Enter contact name"
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="contactTitle">Department Contact Title</Label>
                <Input
                  type="text"
                  id="contactTitle"
                  name="contactTitle"
                  value={contactData.contactTitle}
                  onChange={handleContactInputChange}
                  required
                  placeholder="Enter contact title"
                />
              </FieldColumn>
            </FieldRow>
            
            <FieldRow>
              <FieldColumn>
                <Label htmlFor="contactEmail">Department Contact Email</Label>
                <Input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={contactData.contactEmail}
                  onChange={handleContactInputChange}
                  required
                  placeholder="Enter email address"
                />
              </FieldColumn>
              <FieldColumn>
                <Label htmlFor="contactTelephone">Department Contact Telephone #</Label>
                <Input
                  type="tel"
                  id="contactTelephone"
                  name="contactTelephone"
                  value={contactData.contactTelephone}
                  onChange={handleContactInputChange}
                  required
                  placeholder="Enter telephone number"
                />
              </FieldColumn>
            </FieldRow>
            
            <FieldRow>
              <FieldColumn $flex="1">
                <Label htmlFor="contactPicture">Contact Person Picture</Label>
                <FileInput
                  type="file"
                  id="contactPicture"
                  name="contactPicture"
                  onChange={handleContactInputChange}
                  accept="image/*"
                />
              </FieldColumn>
              <FieldColumn $flex="1">
                <div style={{ paddingTop: '24px' }}>
                  <SubmitButton type="submit" disabled={contactLoading}>
                    {contactLoading ? 'Submitting...' : 'Submit Contact Information'}
                  </SubmitButton>
                </div>
              </FieldColumn>
            </FieldRow>
          </FormContainer>
        </FormSection>
      </Section>


    </MainContent>
  );
};