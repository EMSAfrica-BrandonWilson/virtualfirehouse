import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { usePageImage } from '../../hooks/usePageImage';
import { formatDateTime, formatIncidentTag, formatIncidentTagFromEntry } from '../../lib/utils';
import { IncidentTypeModal } from '../../components/UI/IncidentTypeModal';

// Display time directly since incident data is stored in local Saudi Arabian time (UTC+3)
// For emergency response accuracy, we display the exact local time when the incident occurred
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  return timeStr; // Return as-is since it's already local time
};

// Display date directly since incident data is stored in local Saudi Arabian time (UTC+3)  
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr; // Return as-is since it's already local date
};

// Define EDOBEntry type
interface EDOBEntry {
  id: string;
  incident_number: number;
  incident_date: string;
  incident_time: string;
  incident_id: string;
  incident_type: string;
  location: string;
  description: string;
  action_taken: string;
  reported_by: string;
  reported_by_email: string;
  created_at: string;
}

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

const TwoColumnRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const LeftColumn = styled.div`
  width: 100%;
  max-height: 650px;
`;

const RightColumn = styled.div`
  width: 100%;
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
  width: 150px;
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

const SubTitle = styled.h2<{ $color?: string }>`
  font-size: 1.5rem;
  color: ${props => props.$color || '#1177BB'};
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
  width: 140px;
  height: auto;
  max-width: 140px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 140px;
  height: 100px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EDOBForm = styled.form`
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  height: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormTwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label<{ $color?: string }>`
  display: block;
  font-weight: 600;
  color: ${props => props.$color || '#1177BB'};
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input<{ $color?: string }>`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  color: ${props => props.$color || '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$color || '#1177BB'};
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
  
  &:invalid {
    border-color: #e74c3c;
  }
`;

const Select = styled.select<{ $color?: string }>`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  color: ${props => props.$color || '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$color || '#1177BB'};
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const SelectWithOptions = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
`;

const SelectElement = styled(Select)`
  flex: 1;
`;

const OptionsLink = styled.button<{ $color?: string }>`
  padding: 10px 12px;
  background: ${props => props.$color || '#1177BB'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  
  &:hover {
    background: ${props => props.$color ? props.$color + 'dd' : '#0f5c99'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TextArea = styled.textarea<{ $color?: string }>`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  color: ${props => props.$color || '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$color || '#1177BB'};
    box-shadow: 0 0 0 3px rgba(17, 119, 187, 0.1);
  }
`;

const ReadOnlyInput = styled(Input)`
  background-color: #f8f9fa;
  color: #6c757d;
  
  &:focus {
    outline: none;
    border-color: #e0e0e0;
    box-shadow: none;
  }
`;

const AutoGeneratedBadge = styled.span`
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
`;

const SubmitButton = styled.button<{ $color?: string }>`
  background-color: ${props => props.$color || '#1177BB'};
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$color ? props.$color + 'dd' : '#0f5c99'};
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const EDOBEntryCard = styled.div`
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LocationText = styled.span`
  font-size: 14px;
`;

const EntriesContainer = styled.div`
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
`;

const IncidentBadge = styled.span<{ type: string; color?: string }>`
  background: ${props => props.color || props.type === 'Emergency' ? '#dc3545' : props.type === 'Incident' ? '#ffc107' : props.type === 'Maintenance' ? '#17a2b8' : props.type === 'Training' ? '#28a745' : '#6c757d'};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  margin-right: 10px;
`;

export const EDOBEntryForm: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { imageUrl, loading: imageLoading, error: imageError } = usePageImage('edob-entry', '/images/eDOB.png');
  
  const [formData, setFormData] = useState({
    incident_number: 0,
    incident_date: '',
    incident_time: '',
    incident_id: '',
    incident_type: '',
    location: '',
    description: '',
    action_taken: '',
    reported_by: '',
    reported_by_email: ''
  });

  const [selectedIncidentTypeColor, setSelectedIncidentTypeColor] = useState('#1177BB');

  const [entries, setEntries] = useState<EDOBEntry[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<any[]>([]);
  const [incidentTypeMap, setIncidentTypeMap] = useState<Record<string, { display: string; color: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncidentTypeModal, setShowIncidentTypeModal] = useState(false);

  // Auto-populate form fields for logged-in users and set current local date/time
  useEffect(() => {
    // Get local date and time components directly (no UTC conversion)
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + 
                       String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(now.getDate()).padStart(2, '0'); // YYYY-MM-DD
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + 
                       String(now.getMinutes()).padStart(2, '0') + ':' + 
                       String(now.getSeconds()).padStart(2, '0'); // HH:MM:SS
    
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        incident_date: currentDate,
        incident_time: currentTime,
        reported_by: userProfile.display_name || userProfile.full_name || '',
        reported_by_email: userProfile.email || user.email || '',
      }));
    }
  }, [user, userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update color when incident type changes
    if (name === 'incident_type') {
      const selectedType = incidentTypes.find(type => type.name === value);
      if (selectedType && selectedType.color_code) {
        setSelectedIncidentTypeColor(selectedType.color_code);
      } else {
        setSelectedIncidentTypeColor('#1177BB'); // Default color
      }
    }
  };

  // Load entries on component mount
  useEffect(() => {
    (async () => {
      await loadIncidentTypes();
      await loadEntries();
    })();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('03_ecc_01_edob_01_entries')
        .select('*')
        .order('incident_date', { ascending: false })
        .order('incident_time', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      const toDate = (e: any) => {
        const d = String(e?.incident_date || '').trim();
        const tRaw = String(e?.incident_time || '').trim();
        const t = tRaw ? tRaw.split('.')[0] : '';
        if (d && t) return new Date(`${d}T${t}`);
        return new Date(e?.created_at || 0);
      };
      const sorted = (data || []).slice().sort((a: any, b: any) => toDate(b).getTime() - toDate(a).getTime());
      setEntries(sorted);
      setError(null);
    } catch (err) {
      setError('Failed to load eDOB entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const canonicalKey = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const resolveIncidentTypeInfo = (typeVal: string) => {
    const raw = String(typeVal || '').trim();
    const canon = canonicalKey(raw);
    const exact = incidentTypes.find(t => {
      const candidates = [t?.name, t?.display_name, t?.id];
      return candidates.some(v => String(v ?? '').trim() === raw);
    });
    if (exact) {
      return {
        display: String(exact.display_name || exact.name || raw),
        color: String(exact.color_code || '#1177BB')
      };
    }
    const mapped = incidentTypeMap[canon];
    return {
      display: String(mapped?.display || raw),
      color: String(mapped?.color || '#1177BB')
    };
  };

  const loadIncidentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('03_ecc_01_edob_02_incident_types')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });
      if (error) throw error;
      const rows = data || [];
      setIncidentTypes(rows);
      const map: Record<string, { display: string; color: string }> = {};
      rows.forEach((t: any) => {
        const nameKey = canonicalKey(String(t?.name || ''));
        const displayKey = canonicalKey(String(t?.display_name || ''));
        const idKey = t?.id !== undefined && t?.id !== null ? canonicalKey(String(t.id)) : '';
        const displayVal = String(t?.display_name || t?.name || '');
        const colorVal = String(t?.color_code || '#1177BB');
        if (nameKey) map[nameKey] = { display: displayVal, color: colorVal };
        if (displayKey && !map[displayKey]) map[displayKey] = { display: displayVal, color: colorVal };
        if (idKey && !map[idKey]) map[idKey] = { display: displayVal, color: colorVal };
      });
      setIncidentTypeMap(map);
      return data || [];
    } catch (err) {
      return [];
    }
  };

  const handleIncidentTypesUpdate = () => {
    loadIncidentTypes();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate required fields
    if (!formData.incident_type || !formData.location || !formData.description || !formData.action_taken) {
      setError('Please fill in all required fields: Incident Type, Location, Description, and Actions Taken.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const { data: newEntry, error } = await supabase
        .from('03_ecc_01_edob_01_entries')
        .insert([{ 
          incident_type: formData.incident_type,
          location: formData.location,
          description: formData.description,
          action_taken: formData.action_taken,
          reported_by: formData.reported_by,
          reported_by_email: formData.reported_by_email
          // Note: incident_number, incident_date, incident_time, incident_id 
          // are auto-generated by the database trigger
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Reload entries to show the new one
      await loadEntries();
      
      // Reset form for next incident, but keep date/time and user info
      // Get local date and time components directly (no UTC conversion)
      const now = new Date();
      const currentDate = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0'); // YYYY-MM-DD
      const currentTime = String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0'); // HH:MM:SS
      
      setFormData({
        incident_number: 0,
        incident_date: currentDate,
        incident_time: currentTime,
        incident_id: '',
        incident_type: '',
        location: '',
        description: '',
        action_taken: '',
        reported_by: formData.reported_by,
        reported_by_email: formData.reported_by_email
      });
      
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error('Failed to submit eDOB entry:', err);
      setError('Failed to submit your entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="edob-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column>
              <Title id="edob-title">
                eDOB Entry Form
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                The eDOB is a comprehensive system for recording all significant events, incidents, and activities at the ECC. Each incident is automatically assigned a unique identification number that includes the date, time, and incremental sequence. Use this form to document daily occurrences and view the latest entries.
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
                  alt="Daily Occurrence Book" 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = '/images/eDOB.png';
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  {imageError || 'No image available'}
                </ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>

          {isSubmitted && (
            <div style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              marginTop: '20px'
            }}>
              eDOB incident submitted successfully with auto-generated ID!
            </div>
          )}

          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              marginTop: '20px'
            }}>
              {error}
            </div>
          )}

          <TwoColumnRow>
            <LeftColumn>
              <EDOBForm onSubmit={handleSubmit}>
                {/* Auto-generated fields are hidden but still auto-populated via backend */}

                {/* Incident Type and Location - Two Column Layout */}
                <FormTwoColumnGrid>
                  <FormGroup>
                    <Label htmlFor="incident_type" $color={selectedIncidentTypeColor}>Incident Type *</Label>
                    <SelectWithOptions>
                      <SelectElement
                        id="incident_type"
                        name="incident_type"
                        value={formData.incident_type}
                        onChange={handleInputChange}
                        required
                        $color={selectedIncidentTypeColor}
                      >
                        <option value="">Select incident type...</option>
                        {incidentTypes.map(type => (
                          <option key={type.id} value={type.name}>
                            {type.display_name}
                          </option>
                        ))}
                      </SelectElement>
                      <OptionsLink 
                        type="button"
                        onClick={() => setShowIncidentTypeModal(true)}
                        title="Manage incident type options"
                        $color={selectedIncidentTypeColor}
                      >
                        ⚙️ Options
                      </OptionsLink>
                    </SelectWithOptions>
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="location" $color={selectedIncidentTypeColor}>Incident Location *</Label>
                    <Input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Terminal 1, Runway 09/27"
                      required
                      $color={selectedIncidentTypeColor}
                    />
                  </FormGroup>
                </FormTwoColumnGrid>

                {/* Description and Actions Taken - Two Column Layout */}
                <FormTwoColumnGrid>
                  <FormGroup>
                    <Label htmlFor="description" $color={selectedIncidentTypeColor}>Incident Description *</Label>
                    <TextArea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detailed description of the occurrence..."
                      required
                      $color={selectedIncidentTypeColor}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="action_taken" $color={selectedIncidentTypeColor}>Immediate Actions Taken *</Label>
                    <TextArea
                      id="action_taken"
                      name="action_taken"
                      value={formData.action_taken}
                      onChange={handleInputChange}
                      placeholder="Actions taken or recommended..."
                      required
                      $color={selectedIncidentTypeColor}
                    />
                  </FormGroup>
                </FormTwoColumnGrid>

                {/* Submit Button */}
                <FormGroup style={{ marginBottom: 0 }}>
                  <SubmitButton type="submit" disabled={isSubmitting} $color={selectedIncidentTypeColor}>
                    {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                  </SubmitButton>
                </FormGroup>

                <FormGroup style={{ display: 'none' }}>
                  <Label htmlFor="reported_by">Reported By *</Label>
                  <Input
                    type="text"
                    id="reported_by"
                    name="reported_by"
                    value={formData.reported_by}
                    onChange={handleInputChange}
                    disabled
                  />
                </FormGroup>
                
                <FormGroup style={{ display: 'none' }}>
                  <Label htmlFor="reported_by_email">Email Address</Label>
                  <Input
                    type="email"
                    id="reported_by_email"
                    name="reported_by_email"
                    value={formData.reported_by_email}
                    onChange={handleInputChange}
                    disabled
                  />
                </FormGroup>
                

              </EDOBForm>
            </LeftColumn>

            <RightColumn>
              <EntriesContainer>
                <SubTitle $color={selectedIncidentTypeColor}>Latest eDOB Entries:</SubTitle>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading entries...
                  </div>
                ) : entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No entries yet. Create the first eDOB entry!
                  </div>
                ) : (
                  (() => {
                    // Compute chronological sequence for latest entries
                    const seqSorted = entries.map(e => {
                      const createdStr = formatDateTime(e.created_at || '');
                      const [cDate, cTime] = createdStr.includes(' ') ? createdStr.split(' ') : ['', ''];
                      const keyDate = e.incident_date || cDate;
                      const keyTime = (e.incident_time || cTime).split('.')[0];
                      const key = `${keyDate} ${keyTime}`;
                      return { id: e.id, key };
                    }).sort((a, b) => a.key.localeCompare(b.key));
                    const sequenceMap = new Map<string, number>();
                    seqSorted.forEach((item, i) => sequenceMap.set(item.id, i + 1));
                    return entries.map((entry, index) => {
                    // Get the specific incident type color for this entry
                    const { display: incidentDisplay, color: incidentTypeColor } = resolveIncidentTypeInfo(String(entry.incident_type || ''));
                    const created = formatDateTime(entry.created_at || '');
                    const [createdDate, createdTime] = created.includes(' ') ? created.split(' ') : ['', ''];
                    const fallbackDate = entry.incident_date || createdDate;
                    const fallbackTime = entry.incident_time || createdTime;
                    const sequenceNum = sequenceMap.get(entry.id) ?? (index + 1);
                      
                    return (
                        <EDOBEntryCard key={entry.id}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 10, rowGap: 6 }}>
                          <span style={{ 
                            padding: '6px 10px',
                            background: '#1177BB',
                            color: 'white',
                            borderRadius: '4px',
                            fontFamily: 'Courier New, monospace',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            lineHeight: '1.4',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            gap: 4,
                            height: '100%'
                          }}>
                            <div dangerouslySetInnerHTML={{ 
                              __html: formatIncidentTagFromEntry(entry, sequenceNum, true) 
                            }} />
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ 
                                display: 'inline-block',
                                background: incidentTypeColor,
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                lineHeight: '1',
                                alignSelf: 'flex-start',
                                minWidth: '140px',
                                textAlign: 'center'
                              }}>
                                {(() => {
                                  const parts = String(incidentDisplay || '').split(':');
                                  if (parts.length > 1) {
                                    return parts.map((p, i) => {
                                      const partWithColon = i < parts.length - 1 ? `${p}:` : p;
                                      return i === 0 ? partWithColon : <React.Fragment key={`part-${i}`}><br />{partWithColon}</React.Fragment>;
                                    });
                                  }
                                  return incidentDisplay;
                                })()}
                              </span>
                              <LocationText style={{ color: incidentTypeColor }}>
                                {entry.location}
                              </LocationText>
                            </div>
                            <div style={{ fontSize: '14px', lineHeight: '1.5', color: incidentTypeColor }}>
                              <strong>Description:</strong> {entry.description}
                            </div>
                            <div style={{ fontSize: '14px', lineHeight: '1.5', color: incidentTypeColor }}>
                              <strong>Immediate Actions Taken:</strong> {entry.action_taken}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                              <span>Reported by: {entry.reported_by}</span>
                            </div>
                          </div>
                        </div>
                      </EDOBEntryCard>
                    );
                  });
                  })()
                )}
              </EntriesContainer>
            </RightColumn>
          </TwoColumnRow>
        </div>
      </Section>

      {/* Incident Type Management Modal */}
      <IncidentTypeModal
        isOpen={showIncidentTypeModal}
        onClose={() => setShowIncidentTypeModal(false)}
        onIncidentTypesUpdate={handleIncidentTypesUpdate}
      />
    </MainContent>
  );
};
