import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase, isSupabaseFallback } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RefuellingLogbookHeader from '../../../components/RefuellingLogbookHeader';

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

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InfoBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  strong {
    color: #856404;
  }
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

const FormCard = styled.div`
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label<{ $hasError?: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const FormInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: ${props => props.$hasError ? '#ffeaea' : 'white'};
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  
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

const FormSelect = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: ${props => props.$hasError ? '#ffeaea' : 'white'};
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const FormTextarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: ${props => props.$hasError ? '#ffeaea' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#1177BB'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(17, 119, 187, 0.1)'};
  }
`;

const SubmitButton = styled.button`
  background-color: #28a745;
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
    background-color: #218838;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const UpdateButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

interface RefuellingFormData {
  vehicle_call_sign: string;
  refuelling_date: string;
  vehicle_id: string;
  odometer_reading: string;
  fuel_type: string;
  quantity_litres: string;
  pump_start_reading: string;
  pump_end_reading: string;
  operator_name: string;
  spills_incidents: string;
  tank_fill_percentage: string;
  authorization_code: string;
}

interface CallSign {
  id: number;
  name: string;
  active: boolean;
}

interface Vehicle {
  id: string;
  veh_call_sign: string;
  veh_type: string;
  veh_make: string;
  vehicle_model: string;
  call_sign_name: string;
  vehicle_type_name: string;
  vehicle_make_name: string;
}

interface StaffMember {
  id: string;
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  employment_status?: string;
}

const getLocalDateTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const RefuellingLogbookEntry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RefuellingFormData>({
    vehicle_call_sign: '',
    refuelling_date: getLocalDateTimeString(),
    vehicle_id: '',
    odometer_reading: '',
    fuel_type: 'Diesel',
    quantity_litres: '',
    pump_start_reading: '',
    pump_end_reading: '',
    operator_name: '',
    spills_incidents: '',
    tank_fill_percentage: '',
    authorization_code: ''
  });
  
  const [callSigns, setCallSigns] = useState<CallSign[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editId) {
      loadRecordForEdit(editId);
    }
  }, [editId]);

  const loadRecordForEdit = async (logId: string) => {
    try {
      const { data, error } = await supabase
        .from('refuelling_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;

      if (data) {
        setIsEditMode(true);
        setCurrentLogId(logId);
        
        // Convert the UTC date from database to Saudi Arabia time for display
        // Database stores UTC, we need to show Saudi time (UTC+3)
        const utcDate = new Date(data.refuelling_date);
        
        // Convert to Saudi Arabia timezone
        const saudiTimeString = utcDate.toLocaleString('en-US', {
          timeZone: 'Asia/Riyadh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        // Parse the Saudi time string to get components
        const [datePart, timePart] = saudiTimeString.split(', ');
        const [month, day, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');
        
        // Format for datetime-local input
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        
        setFormData({
          vehicle_call_sign: data.vehicle_call_sign || '',
          refuelling_date: formattedDate,
          vehicle_id: data.vehicle_id || '',
          odometer_reading: data.odometer_reading?.toString() || '',
          fuel_type: data.fuel_type || 'Diesel',
          quantity_litres: data.quantity_litres?.toString() || '',
          pump_start_reading: data.pump_start_reading?.toString() || '',
          pump_end_reading: data.pump_end_reading?.toString() || '',
          operator_name: data.operator_name || '',
          spills_incidents: data.spills_incidents || '',
          tank_fill_percentage: data.tank_fill_percentage?.toString() || '',
          authorization_code: data.authorization_code || ''
        });
      }
    } catch (error: any) {
      console.error('Failed to load record:', error);
      setErrorMessage('Failed to load the refuelling log entry for editing.');
    }
  };

  const fetchEdge = async (name: string) => {
    const client = supabase;
    const first = await client.functions.invoke(name);
    if (!(first as any).error && (first as any).data) return { data: (first as any).data, error: null };
    const baseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
    if (!baseUrl) return first as any;
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    const url = `${baseUrl}/functions/v1/${name}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    const ct = res.headers.get('content-type') || '';
    if (!res.ok) return { data: null, error: new Error(`Edge Function ${name} returned status ${res.status}`) };
    if (!ct.includes('application/json')) return { data: null, error: new Error(`Edge Function ${name} did not return JSON`) };
    const json = await res.json();
    return { data: json, error: null };
  };


  const loadData = async () => {
    setDropdownsLoading(true);
    setErrorMessage('');
    
    try {
      if (isSupabaseFallback) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      }
      const [callSignResponse, staffResponse] = await Promise.all([
        supabase
          .from('02_admin_register_fd5_vehicle_call_signs')
          .select('*')
          .order('name', { ascending: true }),
        supabase
          .from('02_admin_staff_1_registration')
          .select('staff_id, first_name, middle_name, last_name')
          .order('first_name', { ascending: true })
      ]);

      if ((callSignResponse as any).error) throw (callSignResponse as any).error;
      if ((staffResponse as any).error) throw (staffResponse as any).error;

      const callSignRows = (callSignResponse as any).data || [];
      const parsedCallSigns: CallSign[] = callSignRows
        .map((row: any) => ({
          id: Number(row?.id ?? row?.call_sign_id ?? row?.pk ?? 0),
          name: String(row?.name ?? row?.call_sign_name ?? row?.vehicle_callsign ?? row?.call_sign ?? '').trim(),
          active: row?.is_active === undefined ? true : !!row?.is_active
        }))
        .filter((cs: CallSign) => !!cs.name);
      setCallSigns(parsedCallSigns);
      
      setVehicles([]);
      
      const staffRows = (staffResponse as any).data || [];
      const staffList = Array.isArray(staffRows) ? staffRows.map((row: any) => ({
        id: String(row?.staff_id ?? row?.id ?? ''),
        first_name: String(row?.first_name ?? '').trim(),
        middle_name: String(row?.middle_name ?? '').trim(),
        last_name: String(row?.last_name ?? '').trim(),
        full_name: [row?.first_name, row?.middle_name, row?.last_name].filter(Boolean).join(' ').trim()
      })) : [];
      setStaffMembers(staffList);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to load form data');
    } finally {
      setDropdownsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vehicle_call_sign') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        vehicle_id: value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.vehicle_call_sign.trim()) {
      errors.vehicle_call_sign = 'Vehicle Call Sign is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      setErrorMessage('Please fix the validation errors above');
      return;
    }
    
    if (!user) {
      setErrorMessage('You must be logged in to save refuelling logs. Please log in and try again.');
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Convert the local datetime input to UTC
      // The input is in Saudi Arabia time (UTC+3), we need to store as UTC
      // The datetime-local value is like "2025-10-16T15:38"
      // We need to treat this as Saudi time and convert to UTC
      
      // Add the Saudi Arabia timezone offset to the string
      const saudiDateTimeWithOffset = formData.refuelling_date + ':00+03:00';
      
      // Create a Date object - this will properly parse the timezone offset
      const dateInUTC = new Date(saudiDateTimeWithOffset);
      
      // Convert to ISO string (UTC format)
      const utcISOString = dateInUTC.toISOString();
      
      const dbData = {
        vehicle_call_sign: formData.vehicle_call_sign.trim(),
        refuelling_date: utcISOString,
        vehicle_id: formData.vehicle_id || null,
        odometer_reading: formData.odometer_reading ? parseFloat(formData.odometer_reading) : null,
        fuel_type: formData.fuel_type,
        quantity_litres: parseFloat(formData.quantity_litres),
        pump_start_reading: formData.pump_start_reading ? parseFloat(formData.pump_start_reading) : null,
        pump_end_reading: formData.pump_end_reading ? parseFloat(formData.pump_end_reading) : null,
        operator_name: formData.operator_name,
        spills_incidents: formData.spills_incidents || null,
        tank_fill_percentage: formData.tank_fill_percentage ? parseInt(formData.tank_fill_percentage) : null,
        authorization_code: formData.authorization_code || null,
        created_by: user.id
      };
      
      if (isEditMode && currentLogId) {
        // Update existing record
        const { data, error } = await supabase
          .from('03_ecc_01_edob_05_refuelling_logs')
          .update(dbData)
          .eq('id', currentLogId)
          .select();
        
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        console.log('Refuelling log updated successfully:', data);
        setSuccessMessage('Refuelling log entry updated successfully!');
        
        setTimeout(() => {
          navigate('/control/ecc-checklists/refuelling-log-book/records');
        }, 1500);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('03_ecc_01_edob_05_refuelling_logs')
          .insert([dbData])
          .select();
        
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        console.log('Refuelling log saved successfully:', data);
        setSuccessMessage('Refuelling log entry saved successfully! You can view it in Logbook Records.');
        
        setTimeout(() => {
          setFormData({
            vehicle_call_sign: '',
            refuelling_date: getLocalDateTimeString(),
            vehicle_id: '',
            odometer_reading: '',
            fuel_type: 'Diesel',
            quantity_litres: '',
            pump_start_reading: '',
            pump_end_reading: '',
            operator_name: '',
            spills_incidents: '',
            tank_fill_percentage: '',
            authorization_code: ''
          });
        }, 1000);
        
        setTimeout(() => setSuccessMessage(''), 10000);
      }
    } catch (error: any) {
      console.error('Failed to save refuelling log:', error);
      const errorMsg = error?.message || 'Failed to save refuelling log. Please try again.';
      setErrorMessage(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentLogId) return;
    
    if (!window.confirm('Are you sure you want to delete this refuelling log entry? This action cannot be undone.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const { data, error, count } = await supabase
        .from('03_ecc_01_edob_05_refuelling_logs')
        .delete()
        .eq('id', currentLogId)
        .select();

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      // Verify that a record was actually deleted
      if (!data || data.length === 0) {
        throw new Error('No record was deleted. You may not have permission to delete this entry.');
      }

      console.log('Record deleted successfully:', data);
      setSuccessMessage('Refuelling log entry deleted successfully.');
      
      setTimeout(() => {
        navigate('/control/ecc-checklists/refuelling-log-book/records');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to delete log:', error);
      setErrorMessage(error?.message || 'Failed to delete refuelling log entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/control/ecc-checklists/refuelling-log-book/records');
  };
  
  return (
    <MainContent aria-label="Main content">
      <Section>
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title>{isEditMode ? 'Edit Refuelling Log Entry' : 'Logbook Entry Tool'}</Title>
              <Divider />
              <Paragraph>
                {isEditMode 
                  ? 'Review and update the refuelling log entry details below. You can modify any field, delete the entry, or cancel to return to the records page without making changes.'
                  : 'The Logbook Entry Tool provides a streamlined digital form for recording refuelling operations in real-time. Operators can quickly document vehicle details, fuel quantities, pump readings, and any incidents with automatic timestamp capture, ensuring accurate and immediate data entry for fuel accountability and regulatory compliance.'
                }
              </Paragraph>
            </Column>
            <ImageColumn>
              <RefuellingLogbookHeader />
            </ImageColumn>
            
          </FlexRow>
          
          {!isEditMode && (
            <InfoBox>
              <strong>Important:</strong> Refuelling operations must be documented upon completion. Ensure accurate recording of vehicle identification, fuel quantity, odometer readings, and operator information for accountability and regulatory compliance.
            </InfoBox>
          )}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          
          <FormCard>
            <SubTitle>{isEditMode ? 'Edit Refuelling Log Entry' : 'Refuelling Log Entry Form'}</SubTitle>
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="vehicle_call_sign">
                    Vehicle Call Sign *
                  </FormLabel>
                  <FormSelect
                    id="vehicle_call_sign"
                    name="vehicle_call_sign"
                    value={formData.vehicle_call_sign}
                    onChange={handleChange}
                    $hasError={!!validationErrors.vehicle_call_sign}
                    required
                  >
                    <option value="">Select Call Sign</option>
                    {callSigns.filter(cs => cs.active).map(callSign => (
                      <option key={callSign.id} value={callSign.name}>
                        {callSign.name}
                      </option>
                    ))}
                  </FormSelect>
                  {validationErrors.vehicle_call_sign && (
                    <ErrorMessage>{validationErrors.vehicle_call_sign}</ErrorMessage>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="vehicle_id">Vehicle/Appliance ID *</FormLabel>
                  <FormInput
                    type="text"
                    id="vehicle_id"
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    placeholder="Auto-populated from vehicle type"
                    disabled
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="refuelling_date">Date and Time *</FormLabel>
                  <FormInput
                    type="datetime-local"
                    id="refuelling_date"
                    name="refuelling_date"
                    value={formData.refuelling_date}
                    onChange={handleChange}
                    disabled
                    required
                  />
                </FormGroup>
              </FormGrid>
              
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="operator_name">Operator Name *</FormLabel>
                  <FormSelect
                    id="operator_name"
                    name="operator_name"
                    value={formData.operator_name}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Operator</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.full_name}>
                        {staff.full_name}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="odometer_reading">Odometer/Hour Metre Reading</FormLabel>
                  <FormInput
                    type="number"
                    step="0.01"
                    id="odometer_reading"
                    name="odometer_reading"
                    value={formData.odometer_reading}
                    onChange={handleChange}
                    placeholder="Current reading"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="fuel_type">Fuel Type *</FormLabel>
                  <FormSelect
                    id="fuel_type"
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Unleaded">Unleaded</option>
                    <option value="Premium">Premium</option>
                  </FormSelect>
                </FormGroup>
              </FormGrid>
              
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="pump_start_reading">Pump Start Reading</FormLabel>
                  <FormInput
                    type="number"
                    step="0.01"
                    id="pump_start_reading"
                    name="pump_start_reading"
                    value={formData.pump_start_reading}
                    onChange={handleChange}
                    placeholder="Starting metre"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="pump_end_reading">Pump End Reading</FormLabel>
                  <FormInput
                    type="number"
                    step="0.01"
                    id="pump_end_reading"
                    name="pump_end_reading"
                    value={formData.pump_end_reading}
                    onChange={handleChange}
                    placeholder="Ending metre"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="quantity_litres">Quantity (Litres) *</FormLabel>
                  <FormInput
                    type="number"
                    step="0.01"
                    id="quantity_litres"
                    name="quantity_litres"
                    value={formData.quantity_litres}
                    onChange={handleChange}
                    placeholder="Fuel dispensed"
                    required
                  />
                </FormGroup>
              </FormGrid>
              
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="tank_fill_percentage">Tank Fill Percentage</FormLabel>
                  <FormInput
                    type="number"
                    min="0"
                    max="100"
                    id="tank_fill_percentage"
                    name="tank_fill_percentage"
                    value={formData.tank_fill_percentage}
                    onChange={handleChange}
                    placeholder="0-100%"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="authorization_code">Authorization Code</FormLabel>
                  <FormInput
                    type="text"
                    id="authorization_code"
                    name="authorization_code"
                    value={formData.authorization_code}
                    onChange={handleChange}
                    placeholder="Approval reference"
                  />
                </FormGroup>
                
                <div></div>
              </FormGrid>
              
              <FormGroup>
                <FormLabel htmlFor="spills_incidents">Fuel Spills or Incidents</FormLabel>
                <FormTextarea
                  id="spills_incidents"
                  name="spills_incidents"
                  value={formData.spills_incidents}
                  onChange={handleChange}
                  placeholder="Record any spills, incidents, or notes..."
                />
              </FormGroup>
              
              {isEditMode ? (
                <ButtonGroup>
                  <UpdateButton 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Entry'}
                  </UpdateButton>
                  <DeleteButton 
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Delete Entry
                  </DeleteButton>
                  <CancelButton 
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </CancelButton>
                </ButtonGroup>
              ) : (
                <SubmitButton 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </SubmitButton>
              )}
            </form>
          </FormCard>
        </div>
      </Section>
    </MainContent>
  );
};
