import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Styled Components Definitions
const PageContainer = styled.div`
  padding: 20px;
  font-family: Verdana, Arial, sans-serif;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #1177BB;
  padding-bottom: 10px;
`;

const PageTitle = styled.h1`
  color: #1177BB;
  font-size: 24px;
  margin: 0;
`;

const ContentWrapper = styled.div`
  background: white;
  border: 1px solid #CCCCCC;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Section = styled.div`
  margin-bottom: 25px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
`;

const SectionHeader = styled.h2`
  color: #333;
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
  color: #444;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  background-color: white;
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  resize: vertical;
  min-height: 80px;
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 3px;
  font-weight: bold;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;

  background-color: ${props => props.$variant === 'primary' ? '#1177BB' : '#6c757d'};
  color: white;

  &:hover {
    background-color: ${props => props.$variant === 'primary' ? '#0d5a8e' : '#5a6268'};
  }
`;

const CallTakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  background-color: ${props => {
    switch(props.$status.toLowerCase()) {
      case 'active': return '#e3f2fd';
      case 'pending': return '#fff3e0';
      case 'closed': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.$status.toLowerCase()) {
      case 'active': return '#1565c0';
      case 'pending': return '#ef6c00';
      case 'closed': return '#c62828';
      default: return '#616161';
    }
  }};
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid currentColor;
`;

export const IncidentCallTaking: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    callerName: '',
    callerPhone: '',
    incidentType: '',
    location: '',
    description: '',
    priority: 'Medium',
    dateTime: new Date().toISOString().slice(0, 16)
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting incident call:', formData);
    // TODO: Implement actual submission logic
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Incident Call Taking</PageTitle>
        <StatusBadge $status="Active">New Call</StatusBadge>
      </PageHeader>

      <ContentWrapper>
        <form onSubmit={handleSubmit}>
          <CallTakingContainer>
            <Section>
              <SectionHeader>Caller Information</SectionHeader>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="callerName">Caller Name</Label>
                  <Input
                    id="callerName"
                    name="callerName"
                    value={formData.callerName}
                    onChange={handleInputChange}
                    placeholder="Enter caller name"
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="callerPhone">Contact Number</Label>
                  <Input
                    id="callerPhone"
                    name="callerPhone"
                    value={formData.callerPhone}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                  />
                </FormGroup>
              </FormGrid>
            </Section>

            <Section>
              <SectionHeader>Incident Details</SectionHeader>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="dateTime">Date & Time</Label>
                  <Input
                    type="datetime-local"
                    id="dateTime"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select
                    id="incidentType"
                    name="incidentType"
                    value={formData.incidentType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Incident Type...</option>
                    <option value="Fire">Fire</option>
                    <option value="Medical">Medical Emergency</option>
                    <option value="Rescue">Rescue Operation</option>
                    <option value="HazMat">Hazardous Materials</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter incident location"
                  />
                </FormGroup>
              </FormGrid>
              <FormGroup style={{ marginTop: '20px' }}>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the incident..."
                />
              </FormGroup>
            </Section>

            <ButtonContainer>
              <ActionButton type="button" $variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" $variant="primary">
                Create Incident
              </ActionButton>
            </ButtonContainer>
          </CallTakingContainer>
        </form>
      </ContentWrapper>
    </PageContainer>
  );
};
