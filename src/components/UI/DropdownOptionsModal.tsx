import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface DropdownOptionsModalProps {
  isOpen: boolean;
  title: string;
  options: string[];
  onClose: () => void;
  onUpdate: (next: string[]) => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1177BB;
  font-size: 1.8rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const FormSection = styled.div`
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #1177BB;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: #1177BB;
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  color: white;
  background-color: ${props =>
    props.$variant === 'secondary' ? '#6c757d' :
    props.$variant === 'danger' ? '#dc3545' : '#1177BB'};
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { 
    background-color: ${props =>
      props.$variant === 'secondary' ? '#5a6268' :
      props.$variant === 'danger' ? '#c82333' : '#1a86cc'};
  }
  &:active { transform: translateY(1px); }
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OptionItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
`;

export const DropdownOptionsModal: React.FC<DropdownOptionsModalProps> = ({
  isOpen,
  title,
  options,
  onClose,
  onUpdate
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const isAllSelected = options.length > 0 && selectedIndices.length === options.length;

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndices([]);
      setInputValue('');
    }
  }, [isOpen]);

  const toggleIndex = (idx: number) => {
    setSelectedIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const toggleAll = () => {
    setSelectedIndices(prev => (isAllSelected ? [] : options.map((_, i) => i)));
  };

  const handleBulkDelete = () => {
    if (selectedIndices.length === 0) return;
    const next = options.filter((_, i) => !selectedIndices.includes(i));
    onUpdate(next);
    setSelectedIndices([]);
  };

  const handleAdd = () => {
    const parts = inputValue.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const existing = new Set(options.map(o => o.toLowerCase()));
    const nextUnique: string[] = [];
    const seen = new Set<string>();
    for (const p of parts) {
      const lower = p.toLowerCase();
      if (seen.has(lower) || existing.has(lower)) continue;
      seen.add(lower);
      nextUnique.push(p);
    }
    if (nextUnique.length > 0) {
      onUpdate([...options, ...nextUnique]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAdd();
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <FormSection>
          <SectionTitle>Add Options</SectionTitle>
          <FormGrid>
            <div>
              <Label htmlFor="options-input">Comma-separated values</Label>
              <Input
                id="options-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Option A, Option B, Option C"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="button" onClick={handleAdd}>Add</Button>
            </div>
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>Current Options</SectionTitle>
          {options.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px 0' }}>
              <Checkbox type="checkbox" checked={isAllSelected} onChange={toggleAll} />
              <span style={{ color: '#333' }}>Select all</span>
              <span style={{ color: '#666' }}>Selected {selectedIndices.length} / {options.length}</span>
              <Button $variant="danger" type="button" onClick={handleBulkDelete} disabled={selectedIndices.length === 0}>
                Delete Selected
              </Button>
            </div>
          )}
          {options.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No options found. Add your first option above.</div>
          ) : (
            <OptionsList>
              {options.map((opt, idx) => (
                <OptionItem key={`${opt}:${idx}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Checkbox type="checkbox" checked={selectedIndices.includes(idx)} onChange={() => toggleIndex(idx)} />
                    <span>{opt}</span>
                  </div>
                </OptionItem>
              ))}
            </OptionsList>
          )}
        </FormSection>

        <ButtonGroup>
          <Button $variant="secondary" type="button" onClick={onClose}>Close</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

