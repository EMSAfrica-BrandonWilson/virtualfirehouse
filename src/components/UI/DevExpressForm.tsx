import React, { useState } from 'react';
import styled from 'styled-components';
import { DevExpressButton } from '../DevExpressStyles';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'number' | 'email';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
}

interface DevExpressFormProps {
  fields: FormField[];
  title?: string;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const FormContainer = styled.div`
  background: white;
  border: 1px solid #CCCCCC;
  max-width: 600px;
  margin: 20px auto;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
`;

const FormHeader = styled.div`
  background: linear-gradient(to bottom, #F8F9FA 0%, #E9ECEF 100%);
  border-bottom: 1px solid #CCCCCC;
  padding: 12px 16px;
  font-weight: bold;
`;

const FormTitle = styled.h3`
  margin: 0;
  color: #1177BB;
  font-size: 14px;
  font-weight: bold;
`;

const FormBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
  font-size: 11px;
  
  &.required::after {
    content: ' *';
    color: red;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #CCCCCC;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 3px rgba(17, 119, 187, 0.3);
  }
  
  &:disabled {
    background: #F5F5F5;
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 6px 8px;
  border: 1px solid #CCCCCC;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
  resize: vertical;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 3px rgba(17, 119, 187, 0.3);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #CCCCCC;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 3px rgba(17, 119, 187, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #E0E0E0;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 10px;
  margin-top: 3px;
`;

export const DevExpressForm: React.FC<DevExpressFormProps> = ({
  fields,
  title,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || field.defaultValue || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <TextArea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={loading}
          />
        );
        
      case 'select':
        return (
          <Select
            value={value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(field.name, e.target.value)}
            disabled={loading}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
        
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={loading}
          />
        );
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>{title || 'Form'}</FormTitle>
      </FormHeader>
      
      <FormBody>
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <FormGroup key={field.name}>
              <Label className={field.required ? 'required' : ''}>
                {field.label}
              </Label>
              {renderField(field)}
              {errors[field.name] && (
                <ErrorMessage>{errors[field.name]}</ErrorMessage>
              )}
            </FormGroup>
          ))}
          
          <ButtonGroup>
            {onCancel && (
              <DevExpressButton 
                type="button" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </DevExpressButton>
            )}
            <DevExpressButton 
              type="submit" 
              $variant={'primary' as const}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </DevExpressButton>
          </ButtonGroup>
        </form>
      </FormBody>
    </FormContainer>
  );
};