import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePageImage } from '../../../../hooks/usePageImage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

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

const Select = styled.select<{ $hasError?: boolean; disabled?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  background-color: ${props => props.disabled ? '#f5f5f5' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
  min-height: 80px;
  resize: vertical;
  
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
  
  &:hover {
    background-color: #218838;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #5a6268;
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

const FormHeading = styled.h2`
  font-size: 1.3rem;
  color: #1177BB;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FF9900;
`;

const InfoBox = styled.div`
  background-color: #e3f2fd;
  border-left: 4px solid #1177BB;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
`;

const TwoColumnContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AddressColumn = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
`;

const ColumnTitle = styled.h3`
  font-size: 1.3rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 20px;
  border-bottom: 2px solid #FF9900;
  padding-bottom: 10px;
`;

const WarningBox = styled.div`
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
  color: #856404;
`;

interface AddressFormData {
  // Current Address
  currentCountry: string;
  currentState: string;
  currentCity: string;
  currentSuburb: string;
  currentPostalCode: string;
  currentStreetAddress: string;
  
  // Permanent Address
  permanentCountry: string;
  permanentState: string;
  permanentCity: string;
  permanentSuburb: string;
  permanentPostalCode: string;
  permanentStreetAddress: string;
}

interface StaffBasicInfo {
  first_name: string;
  last_name: string;
  employee_number: string;
}

export const StaffAddressInfo: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('staff', '/images/Staff.png');
  const [formData, setFormData] = useState<AddressFormData>({
    currentCountry: '',
    currentState: '',
    currentCity: '',
    currentSuburb: '',
    currentPostalCode: '',
    currentStreetAddress: '',
    permanentCountry: '',
    permanentState: '',
    permanentCity: '',
    permanentSuburb: '',
    permanentPostalCode: '',
    permanentStreetAddress: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffId, setStaffId] = useState<number | null>(null);
  const [staffInfo, setStaffInfo] = useState<StaffBasicInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [basicInfoCompleted, setBasicInfoCompleted] = useState(false);
  const [formKey, setFormKey] = useState(0);
  
  // Cascading dropdown states for Current Address
  const [currentStates, setCurrentStates] = useState<IState[]>([]);
  const [currentCities, setCurrentCities] = useState<ICity[]>([]);
  const [currentSuburbs, setCurrentSuburbs] = useState<string[]>([]);
  const [currentPostalCodes, setCurrentPostalCodes] = useState<string[]>([]);
  
  // Cascading dropdown states for Permanent Address
  const [permanentStates, setPermanentStates] = useState<IState[]>([]);
  const [permanentCities, setPermanentCities] = useState<ICity[]>([]);
  const [permanentSuburbs, setPermanentSuburbs] = useState<string[]>([]);
  const [permanentPostalCodes, setPermanentPostalCodes] = useState<string[]>([]);

  useEffect(() => {
    const storedStaffId = sessionStorage.getItem('current_staff_id');
    const basicCompleted = sessionStorage.getItem('basic_info_completed') === 'true';
    
    setBasicInfoCompleted(basicCompleted);
    
    if (!storedStaffId) {
      return;
    }
    
    setStaffId(parseInt(storedStaffId));
    loadStaffBasicInfo(parseInt(storedStaffId));
    loadExistingData(parseInt(storedStaffId));
  }, [navigate]);
  
  const loadStaffBasicInfo = async (staffId: number) => {
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_1_registration')
        .select('first_name, last_name, employee_number')
        .eq('staff_id', staffId)
        .single();

      if (error) {
        console.error('Error loading staff basic info:', error);
        return;
      }

      if (data) {
        setStaffInfo({
          first_name: (data as any).first_name || '',
          last_name: (data as any).last_name || '',
          employee_number: (data as any).employee_number || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading staff basic info:', error);
    }
  };

  const loadExistingData = async (staffId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('02_admin_staff_2_address')
        .select('*')
        .eq('staff_id', staffId)
        .single();

      if (error) {
        console.error('Error loading address data:', error);
        return;
      }

      if (data) {
        const addressData = data as any;
        setFormData({
          currentCountry: addressData.current_country || '',
          currentState: addressData.current_state || '',
          currentCity: addressData.current_city || '',
          currentSuburb: addressData.current_suburb || '',
          currentPostalCode: addressData.current_postal_code || '',
          currentStreetAddress: addressData.current_street_address || '',
          permanentCountry: addressData.permanent_country || '',
          permanentState: addressData.permanent_state || '',
          permanentCity: addressData.permanent_city || '',
          permanentSuburb: addressData.permanent_suburb || '',
          permanentPostalCode: addressData.permanent_postal_code || '',
          permanentStreetAddress: addressData.permanent_street_address || ''
        });

        if (addressData.current_country) {
          handleCountryChange(addressData.current_country, 'current', addressData.current_state);
        }
        if (addressData.permanent_country) {
          handleCountryChange(addressData.permanent_country, 'permanent', addressData.permanent_state);
        }

        setIsEditing(true);
      }
    } catch (error: any) {
      console.error('Error loading address data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle country change and load states
  const handleCountryChange = (countryCode: string, addressType: 'current' | 'permanent', preSelectedState?: string) => {
    const states = State.getStatesOfCountry(countryCode).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    if (addressType === 'current') {
      setCurrentStates(states);
      setCurrentCities([]);
      setCurrentSuburbs([]);
      setCurrentPostalCodes([]);
      setFormData(prev => ({
        ...prev,
        currentCountry: countryCode,
        currentState: preSelectedState || '',
        currentCity: '',
        currentSuburb: '',
        currentPostalCode: ''
      }));
      
      if (preSelectedState) {
        handleStateChange(countryCode, preSelectedState, 'current');
      }
    } else {
      setPermanentStates(states);
      setPermanentCities([]);
      setPermanentSuburbs([]);
      setPermanentPostalCodes([]);
      setFormData(prev => ({
        ...prev,
        permanentCountry: countryCode,
        permanentState: preSelectedState || '',
        permanentCity: '',
        permanentSuburb: '',
        permanentPostalCode: ''
      }));
      
      if (preSelectedState) {
        handleStateChange(countryCode, preSelectedState, 'permanent');
      }
    }
  };
  
  // Handle state change and load cities
  const handleStateChange = (countryCode: string, stateCode: string, addressType: 'current' | 'permanent') => {
    const cities = City.getCitiesOfState(countryCode, stateCode).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    if (addressType === 'current') {
      setCurrentCities(cities);
      setCurrentSuburbs([]);
      setCurrentPostalCodes([]);
      setFormData(prev => ({
        ...prev,
        currentState: stateCode,
        currentCity: '',
        currentSuburb: '',
        currentPostalCode: ''
      }));
    } else {
      setPermanentCities(cities);
      setPermanentSuburbs([]);
      setPermanentPostalCodes([]);
      setFormData(prev => ({
        ...prev,
        permanentState: stateCode,
        permanentCity: '',
        permanentSuburb: '',
        permanentPostalCode: ''
      }));
    }
  };
  
  // Handle city change and load suburbs from database
  const handleCityChange = async (cityName: string, addressType: 'current' | 'permanent') => {
    const countryCode = addressType === 'current' ? formData.currentCountry : formData.permanentCountry;
    const stateCode = addressType === 'current' ? formData.currentState : formData.permanentState;
    
    if (addressType === 'current') {
      setFormData(prev => ({
        ...prev,
        currentCity: cityName,
        currentSuburb: '',
        currentPostalCode: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permanentCity: cityName,
        permanentSuburb: '',
        permanentPostalCode: ''
      }));
    }
    
    // Fetch unique city names from database to use as suburbs
    // Note: GeoNames postal codes don't have a separate suburb field,
    // so we use distinct city names for the selected state
    try {
      const { data, error } = await supabase
        .from('postal_codes')
        .select('city_name')
        .eq('country_code', countryCode)
        .eq('state_code', stateCode)
        .order('city_name');
      
      if (!error && data && data.length > 0) {
        // Get unique city names
        const uniqueCities = [...new Set(data.map(item => item.city_name))].sort((a, b) => (a || '').localeCompare(b || ''));
        
        if (addressType === 'current') {
          setCurrentSuburbs(uniqueCities);
          setCurrentPostalCodes([]);
        } else {
          setPermanentSuburbs(uniqueCities);
          setPermanentPostalCodes([]);
        }
      } else {
        // Fallback to generic area names if no data found
        const defaultSuburbs = ['City Center', 'North Area', 'South Area', 'East Area', 'West Area'];
        if (addressType === 'current') {
          setCurrentSuburbs(defaultSuburbs);
        } else {
          setPermanentSuburbs(defaultSuburbs);
        }
      }
    } catch (err) {
      console.error('Error loading suburbs:', err);
      // Fallback to generic area names on error
      const defaultSuburbs = ['City Center', 'East Area', 'North Area', 'South Area', 'West Area'];
      if (addressType === 'current') {
        setCurrentSuburbs(defaultSuburbs);
      } else {
        setPermanentSuburbs(defaultSuburbs);
      }
    }
  };
  
  // Handle suburb change and load postal codes from database
  const handleSuburbChange = async (suburb: string, addressType: 'current' | 'permanent') => {
    const countryCode = addressType === 'current' ? formData.currentCountry : formData.permanentCountry;
    const stateCode = addressType === 'current' ? formData.currentState : formData.permanentState;
    
    if (addressType === 'current') {
      setFormData(prev => ({
        ...prev,
        currentSuburb: suburb,
        currentPostalCode: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permanentSuburb: suburb,
        permanentPostalCode: ''
      }));
    }
    
    // Fetch postal codes from database for the selected suburb (city_name)
    try {
      const { data, error } = await supabase
        .from('postal_codes')
        .select('postal_code')
        .eq('country_code', countryCode)
        .eq('state_code', stateCode)
        .eq('city_name', suburb)
        .order('postal_code');
      
      if (!error && data && data.length > 0) {
        const codes = data.map(item => item.postal_code);
        if (addressType === 'current') {
          setCurrentPostalCodes(codes);
        } else {
          setPermanentPostalCodes(codes);
        }
      } else {
        // Fallback to sample postal codes if none found
        const sampleCodes = ['00000', '10001', '20002', '30003'];
        if (addressType === 'current') {
          setCurrentPostalCodes(sampleCodes);
        } else {
          setPermanentPostalCodes(sampleCodes);
        }
      }
    } catch (err) {
      console.error('Error loading postal codes:', err);
      // Set fallback codes on error
      const sampleCodes = ['00000', '10001', '20002', '30003'];
      if (addressType === 'current') {
        setCurrentPostalCodes(sampleCodes);
      } else {
        setPermanentPostalCodes(sampleCodes);
      }
    }
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
      if (isEditing) {
        const { error } = await supabase
          .from('02_admin_staff_2_address')
          .update({
            current_country: formData.currentCountry || null,
            current_state: formData.currentState || null,
            current_city: formData.currentCity || null,
            current_suburb: formData.currentSuburb || null,
            current_postal_code: formData.currentPostalCode || null,
            current_street_address: formData.currentStreetAddress || null,
            permanent_country: formData.permanentCountry || null,
            permanent_state: formData.permanentState || null,
            permanent_city: formData.permanentCity || null,
            permanent_suburb: formData.permanentSuburb || null,
            permanent_postal_code: formData.permanentPostalCode || null,
            permanent_street_address: formData.permanentStreetAddress || null
          })
          .eq('staff_id', staffId);
        if (error) throw new Error(error.message || 'Failed to update address information');
      } else {
        const { error } = await supabase
          .from('02_admin_staff_2_address')
          .insert([{ 
            staff_id: staffId,
            current_country: formData.currentCountry || null,
            current_state: formData.currentState || null,
            current_city: formData.currentCity || null,
            current_suburb: formData.currentSuburb || null,
            current_postal_code: formData.currentPostalCode || null,
            current_street_address: formData.currentStreetAddress || null,
            permanent_country: formData.permanentCountry || null,
            permanent_state: formData.permanentState || null,
            permanent_city: formData.permanentCity || null,
            permanent_suburb: formData.permanentSuburb || null,
            permanent_postal_code: formData.permanentPostalCode || null,
            permanent_street_address: formData.permanentStreetAddress || null
          }]);
        if (error) throw new Error(error.message || 'Failed to save address information');
      }

      setSuccess(isEditing ? 'Address information updated successfully!' : 'Address information saved successfully!');
      if (!isEditing) {
        setIsEditing(true);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving address information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    
    if (!error) {
      setTimeout(() => {
        navigate('/admin/register/staff/document-expiry');
      }, 1500);
    }
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    setIsEditing(false);
    setBasicInfoCompleted(false);
    try { sessionStorage.setItem('basic_info_completed', 'false'); } catch {}
    setFormData({
      currentCountry: '',
      currentState: '',
      currentCity: '',
      currentSuburb: '',
      currentPostalCode: '',
      currentStreetAddress: '',
      permanentCountry: '',
      permanentState: '',
      permanentCity: '',
      permanentSuburb: '',
      permanentPostalCode: '',
      permanentStreetAddress: ''
    });
    setCurrentStates([]);
    setCurrentCities([]);
    setCurrentSuburbs([]);
    setCurrentPostalCodes([]);
    setPermanentStates([]);
    setPermanentCities([]);
    setPermanentSuburbs([]);
    setPermanentPostalCodes([]);
    setFormKey(k => k + 1);
  };

  const countries = Country.getAllCountries().slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="staff-address-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="staff-address-title">Add Address Information</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Manage current and permanent address information for staff members. This information is used for official correspondence and emergency contact purposes.
              </Paragraph>
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

      <FormSection>
        {staffInfo && (
          <FormHeading>
            Add Address Information For: {staffInfo.first_name} {staffInfo.last_name} {staffInfo.employee_number}
          </FormHeading>
        )}
        
        {!basicInfoCompleted && (
          <WarningBox>
            <strong>⚠️ Notice:</strong> Please complete the Basic Information form first before entering data on this page.
          </WarningBox>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <FormContainer onSubmit={handleSubmit} key={formKey}>
          <TwoColumnContainer>
            {/* Current Address Column */}
            <AddressColumn>
              <ColumnTitle>Current Address</ColumnTitle>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="currentCountry">Country *</Label>
                <Select
                  id="currentCountry"
                  name="currentCountry"
                  value={formData.currentCountry}
                  onChange={(e) => handleCountryChange(e.target.value, 'current')}
                  disabled={!basicInfoCompleted}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="currentState">State/Province *</Label>
                <Select
                  id="currentState"
                  name="currentState"
                  value={formData.currentState}
                  onChange={(e) => handleStateChange(formData.currentCountry, e.target.value, 'current')}
                  disabled={!basicInfoCompleted || !formData.currentCountry}
                >
                  <option value="">Select State/Province</option>
                  {currentStates.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="currentCity">City *</Label>
                <Select
                  id="currentCity"
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={(e) => handleCityChange(e.target.value, 'current')}
                  disabled={!basicInfoCompleted || !formData.currentState}
                >
                  <option value="">Select City</option>
                  {currentCities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="currentSuburb">Suburb</Label>
                <Select
                  id="currentSuburb"
                  name="currentSuburb"
                  value={formData.currentSuburb}
                  onChange={(e) => handleSuburbChange(e.target.value, 'current')}
                  disabled={!basicInfoCompleted || !formData.currentCity}
                >
                  <option value="">Select Suburb</option>
                  {currentSuburbs.map((suburb) => (
                    <option key={suburb} value={suburb}>
                      {suburb}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="currentPostalCode">Postal Code</Label>
                <Select
                  id="currentPostalCode"
                  name="currentPostalCode"
                  value={formData.currentPostalCode}
                  onChange={handleInputChange}
                  disabled={!basicInfoCompleted || !formData.currentSuburb}
                >
                  <option value="">Select Postal Code</option>
                  {currentPostalCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="currentStreetAddress">Street Address</Label>
                <TextArea
                  id="currentStreetAddress"
                  name="currentStreetAddress"
                  value={formData.currentStreetAddress}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  disabled={!basicInfoCompleted}
                />
              </FieldColumn>
            </AddressColumn>
            
            {/* Permanent Address Column */}
            <AddressColumn>
              <ColumnTitle>Permanent Address</ColumnTitle>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="permanentCountry">Country *</Label>
                <Select
                  id="permanentCountry"
                  name="permanentCountry"
                  value={formData.permanentCountry}
                  onChange={(e) => handleCountryChange(e.target.value, 'permanent')}
                  disabled={!basicInfoCompleted}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="permanentState">State/Province *</Label>
                <Select
                  id="permanentState"
                  name="permanentState"
                  value={formData.permanentState}
                  onChange={(e) => handleStateChange(formData.permanentCountry, e.target.value, 'permanent')}
                  disabled={!basicInfoCompleted || !formData.permanentCountry}
                >
                  <option value="">Select State/Province</option>
                  {permanentStates.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="permanentCity">City *</Label>
                <Select
                  id="permanentCity"
                  name="permanentCity"
                  value={formData.permanentCity}
                  onChange={(e) => handleCityChange(e.target.value, 'permanent')}
                  disabled={!basicInfoCompleted || !formData.permanentState}
                >
                  <option value="">Select City</option>
                  {permanentCities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="permanentSuburb">Suburb</Label>
                <Select
                  id="permanentSuburb"
                  name="permanentSuburb"
                  value={formData.permanentSuburb}
                  onChange={(e) => handleSuburbChange(e.target.value, 'permanent')}
                  disabled={!basicInfoCompleted || !formData.permanentCity}
                >
                  <option value="">Select Suburb</option>
                  {permanentSuburbs.map((suburb) => (
                    <option key={suburb} value={suburb}>
                      {suburb}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="permanentPostalCode">Postal Code</Label>
                <Select
                  id="permanentPostalCode"
                  name="permanentPostalCode"
                  value={formData.permanentPostalCode}
                  onChange={handleInputChange}
                  disabled={!basicInfoCompleted || !formData.permanentSuburb}
                >
                  <option value="">Select Postal Code</option>
                  {permanentPostalCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </FieldColumn>
              
              <FieldColumn style={{ marginBottom: '15px' }}>
                <Label htmlFor="permanentStreetAddress">Street Address</Label>
                <TextArea
                  id="permanentStreetAddress"
                  name="permanentStreetAddress"
                  value={formData.permanentStreetAddress}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  disabled={!basicInfoCompleted}
                />
              </FieldColumn>
            </AddressColumn>
          </TwoColumnContainer>

          {/* Submit Buttons */}
          <div style={{ marginTop: '0px', display: 'flex', gap: '15px' }}>
            <SubmitButton type="submit" disabled={loading || !basicInfoCompleted}>
              {loading ? 'Saving...' : isEditing ? 'Update Address Information' : 'Save Address Information'}
            </SubmitButton>
            <SaveAndNextButton onClick={handleSaveAndNext} type="button" disabled={loading || !basicInfoCompleted}>
              {loading ? 'Saving...' : 'Save and Next'}
            </SaveAndNextButton>
            <CancelButton type="button" onClick={handleCancel} disabled={loading || !basicInfoCompleted}>
              Cancel Registration / Update
            </CancelButton>
          </div>
        </FormContainer>
      </FormSection>
      </MainContent>
  );
};
