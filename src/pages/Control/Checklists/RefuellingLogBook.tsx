import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { supabase } from '../../../lib/supabase';
import { getCurrentLocalDate, formatDateTime } from '../../../lib/utils';
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

const ChecklistCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChecklistItem = styled.div`
  padding: 10px 0;
`;

const ChecklistLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  
  input {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
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
  last_name: string;
  employment_status?: string;
}

export const RefuellingLogBook: React.FC = () => {
  
  const [formData, setFormData] = useState<RefuellingFormData>({
    vehicle_call_sign: '',
    refuelling_date: formatDateTime(getCurrentLocalDate()).slice(0, 16),
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
      // Load call signs, vehicles, and staff in parallel
      const [dropdownResponse, vehicleResponse, staffResponse] = await Promise.all([
        fetchEdge('dropdown-options-crud'),
        fetchEdge('vehicle-crud'),
        fetchEdge('staff-crud-enhanced')
      ]);

      if ((dropdownResponse as any).error) throw (dropdownResponse as any).error;
      if ((vehicleResponse as any).error) throw (vehicleResponse as any).error;
      if ((staffResponse as any).error) throw (staffResponse as any).error;

      if ((dropdownResponse as any).data?.data) {
        const callSignData = (dropdownResponse as any).data.data.callSigns || [];
        setCallSigns(callSignData);
      }
      
      if ((vehicleResponse as any).data?.data) {
        const vehicleData = (vehicleResponse as any).data.data || [];
        setVehicles(vehicleData);
      }
      
      if ((staffResponse as any).data?.data?.staff) {
        // Use the same data path as the Register Staff page
        const staffData = Array.isArray((staffResponse as any).data.data.staff) ? (staffResponse as any).data.data.staff : [];
        // Filter to only active staff members and create full_name from first_name and last_name
        const activeStaff = staffData
          .filter((staff: any) => 
            !staff.employment_status || staff.employment_status === 'Active'
          )
          .map((staff: any) => ({
            ...staff,
            full_name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
          }));
        setStaffMembers(activeStaff);
      } else {
        // Try alternative data paths
        if ((staffResponse as any).data?.data) {
          const altStaffData = Array.isArray((staffResponse as any).data.data) ? (staffResponse as any).data.data : [];
          if (altStaffData.length > 0) {
            // Create full_name from first_name and last_name
            const staffWithFullName = altStaffData.map((staff: any) => ({
              ...staff,
              full_name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
            }));
            setStaffMembers(staffWithFullName);
          }
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to load form data');
    } finally {
      setDropdownsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for vehicle_call_sign changes
    if (name === 'vehicle_call_sign') {
      // Find the vehicle with this call sign
      const selectedVehicle = vehicles.find(v => v.veh_call_sign === value);
      
      // Auto-populate vehicle_id with vehicle type
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        vehicle_id: selectedVehicle ? selectedVehicle.vehicle_type_name || selectedVehicle.veh_type || '' : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when user starts typing
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
    
    // Vehicle Call Sign is required
    if (!formData.vehicle_call_sign.trim()) {
      errors.vehicle_call_sign = 'Vehicle Call Sign is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage('Please fix the validation errors above');
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const supabase = getSupabaseClient();
      
      // Convert form data to database format
      const dbData = {
        vehicle_call_sign: formData.vehicle_call_sign.trim(),
        refuelling_date: formData.refuelling_date,
        vehicle_id: formData.vehicle_id,
        odometer_reading: formData.odometer_reading ? parseFloat(formData.odometer_reading) : null,
        fuel_type: formData.fuel_type,
        quantity_litres: parseFloat(formData.quantity_litres),
        pump_start_reading: formData.pump_start_reading ? parseFloat(formData.pump_start_reading) : null,
        pump_end_reading: formData.pump_end_reading ? parseFloat(formData.pump_end_reading) : null,
        operator_name: formData.operator_name,
        spills_incidents: formData.spills_incidents || null,
        tank_fill_percentage: formData.tank_fill_percentage ? parseInt(formData.tank_fill_percentage) : null,
        authorization_code: formData.authorization_code || null
      };
      
      const { error } = await supabase
        .from('refuelling_logs')
        .insert([dbData]);
      
      if (error) throw error;
      
      setSuccessMessage('Refuelling log entry saved successfully!');
      
      // Reset form
      setFormData({
        vehicle_call_sign: '',
        refuelling_date: formatDateTime(getCurrentLocalDate()).slice(0, 16),
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
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage('Failed to save refuelling log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="refuelling-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="refuelling-title">
                Refuelling Log Book
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The Refuelling Log Book maintains comprehensive records of all fire appliance refuelling operations at the ECC. Accurate documentation ensures fuel accountability, supports maintenance planning, tracks consumption patterns, and maintains regulatory compliance for fuel management and environmental protection.
              </Paragraph>
            </Column>
            <ImageColumn>
              <RefuellingLogbookHeader />
            </ImageColumn>
          </FlexRow>

          <InfoBox>
            <strong>Important:</strong> All refuelling operations must be documented immediately upon completion. Ensure accurate recording of vehicle identification, fuel quantity, odometer readings, and operator information for accountability and regulatory compliance.
          </InfoBox>

          <div style={{ marginTop: '30px' }}>
            <SubTitle>Refuelling Log Entry Form:</SubTitle>
            
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            
            <FormCard>
              <form onSubmit={handleSubmit}>
                {/* Row 1: Vehicle Call Sign, Vehicle/Appliance ID, Date and Time */}
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
                
                {/* Row 2: Operator Name, Odometer Reading, Fuel Type */}
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
                
                {/* Row 3: Pump Start Reading, Pump End Reading, Quantity (Litres) */}
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
                
                {/* Row 4: Tank Fill Percentage, Authorization Code, (empty slot) */}
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
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Refuelling Log Entry'}
                  </SubmitButton>
                </div>
              </form>
            </FormCard>

            <SubTitle>Safety Verification Checklist:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify engine is shut off before refuelling
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check for proper grounding during fuel transfer
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Ensure no smoking or open flames in refuelling area
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Verify fire extinguisher is readily available
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Check for fuel leaks or spills during operation
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Confirm proper fuel cap seal after refuelling
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Document spill response actions if applicable
                </ChecklistLabel>
              </ChecklistItem>
              </ChecklistGrid>
            </ChecklistCard>

            <SubTitle>Monthly Reconciliation Tasks:</SubTitle>
            
            <ChecklistCard>
              <ChecklistGrid>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Calculate total fuel consumed per vehicle
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Reconcile fuel pump readings with log book entries
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Review fuel efficiency and consumption trends
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Submit monthly fuel usage report to administration
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Archive previous month's log book records
                </ChecklistLabel>
              </ChecklistItem>
              <ChecklistItem>
                <ChecklistLabel>
                  <input type="checkbox" />
                  Investigate and document any fuel discrepancies
                </ChecklistLabel>
              </ChecklistItem>
              </ChecklistGrid>
            </ChecklistCard>
          </div>
        </div>
      </Section>
    </MainContent>
  );
};
