import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DevExpressButton } from '../DevExpressStyles';
import { UserDisplayNameManager } from '../Admin/UserDisplayNameManager';

interface FireDepartment {
  id: string;
  fire_dept_name: string;
  fire_dept_address: string;
  fire_dept_city: string;
  fire_dept_state: string;
  fire_dept_zip: string;
  fire_dept_phone: string;
  fire_dept_email: string;
  fire_dept_website?: string;
  fire_dept_chief_name: string;
  fire_dept_chief_phone: string;
  fire_dept_chief_email: string;
}

interface SectionHead {
  id: number;
  department_id: number;
  name: string;
  title: string;
  image_url?: string;
  bio?: string;
  is_active: boolean;
}

interface Advertiser {
  id: number;
  department_id: number;
  name: string;
  content_type: string;
  content_url?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

export const EmergencyManagement: React.FC = () => {
  const [departments, setDepartments] = useState<FireDepartment[]>([]);
  const [sectionHeads, setSectionHeads] = useState<SectionHead[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'departments' | 'section-heads' | 'advertisers' | 'user-management'>('departments');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load fire departments
      const { data: deptData } = await supabase
        .from('fire_departments')
        .select('*')
        .order('fire_dept_name');
      
      if (deptData) setDepartments(deptData);

      // Load section heads
      const { data: sectionData } = await supabase
        .from('section_heads')
        .select('*')
        .order('name');
      
      if (sectionData) setSectionHeads(sectionData);

      // Load advertisers
      const { data: adData } = await supabase
        .from('advertisers')
        .select('*')
        .order('display_order');
      
      if (adData) setAdvertisers(adData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'section-head' | 'advertiser', itemId: number) => {
    try {
      setUploadingFile(true);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        
        // Determine bucket name
        const bucketName = type === 'section-head' ? 'section-head-photos' : 'advertising-content';
        
        // Upload file using edge function
        const { data: uploadData, error: uploadError } = await supabase.functions.invoke('file-upload-handler', {
          body: {
            fileData,
            fileName: file.name,
            fileType: file.type,
            contentType: file.type,
            bucketName
          }
        });

        if (uploadError) {
          throw uploadError;
        }

        if (uploadData?.data?.publicUrl) {
          // Update database record with new URL
          if (type === 'section-head') {
            const { error: updateError } = await supabase
              .from('section_heads')
              .update({ image_url: uploadData.data.publicUrl })
              .eq('id', itemId);
            
            if (updateError) throw updateError;
          } else {
            const { error: updateError } = await supabase
              .from('advertisers')
              .update({ content_url: uploadData.data.publicUrl })
              .eq('id', itemId);
            
            if (updateError) throw updateError;
          }
          
          // Reload data
          await loadData();
          alert('File uploaded successfully!');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error as Error).message);
    } finally {
      setUploadingFile(false);
    }
  };

  const updateSectionHead = async (id: number, updates: Partial<SectionHead>) => {
    try {
      const { error } = await supabase
        .from('section_heads')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error updating section head:', error);
      alert('Error updating section head: ' + (error as Error).message);
    }
  };

  const updateAdvertiser = async (id: number, updates: Partial<Advertiser>) => {
    try {
      const { error } = await supabase
        .from('advertisers')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error updating advertiser:', error);
      alert('Error updating advertiser: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading emergency management data...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1177BB', marginBottom: '20px' }}>Emergency Management System</h2>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <DevExpressButton 
          $variant={activeTab === 'departments' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('departments')}
        >
          Fire Departments
        </DevExpressButton>
        <DevExpressButton 
          $variant={activeTab === 'section-heads' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('section-heads')}
        >
          Section Heads
        </DevExpressButton>
        <DevExpressButton 
          $variant={activeTab === 'advertisers' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('advertisers')}
        >
          Advertisers
        </DevExpressButton>
        <DevExpressButton 
          $variant={activeTab === 'user-management' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('user-management')}
        >
          User Management
        </DevExpressButton>
      </div>

      {/* Fire Departments Tab */}
      {activeTab === 'departments' && (
        <div>
          <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Fire Departments</h3>
          <div style={{ background: 'white', border: '1px solid #CCCCCC', borderRadius: '4px', overflow: 'hidden' }}>
            {departments.map((dept) => (
              <div key={dept.id} style={{ padding: '15px', borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1177BB', marginBottom: '10px' }}>
                  {dept.fire_dept_name}
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                  <p><strong>Address:</strong> {dept.fire_dept_address}, {dept.fire_dept_city}, {dept.fire_dept_state} {dept.fire_dept_zip}</p>
                  <p><strong>Phone:</strong> {dept.fire_dept_phone} | <strong>Email:</strong> {dept.fire_dept_email}</p>
                  <p><strong>Chief:</strong> {dept.fire_dept_chief_name} | <strong>Phone:</strong> {dept.fire_dept_chief_phone} | <strong>Email:</strong> {dept.fire_dept_chief_email}</p>
                  {dept.fire_dept_website && <p><strong>Website:</strong> {dept.fire_dept_website}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Heads Tab */}
      {activeTab === 'section-heads' && (
        <div>
          <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Section Heads Management</h3>
          <div style={{ background: 'white', border: '1px solid #CCCCCC', borderRadius: '4px', overflow: 'hidden' }}>
            {sectionHeads.map((head) => (
              <div key={head.id} style={{ padding: '15px', borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 200px', gap: '15px', alignItems: 'start' }}>
                  <div>
                    {head.image_url ? (
                      <img 
                        src={head.image_url} 
                        alt={head.name}
                        style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', border: '1px solid #CCCCCC' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '150px', 
                        background: '#F0F0F0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #CCCCCC',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        No Photo
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ marginTop: '10px', fontSize: '11px', width: '100%' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, 'section-head', head.id);
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Name:</label>
                      <input 
                        type="text" 
                        value={head.name}
                        onChange={(e) => updateSectionHead(head.id, { name: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Title:</label>
                      <input 
                        type="text" 
                        value={head.title}
                        onChange={(e) => updateSectionHead(head.id, { title: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Bio:</label>
                      <textarea 
                        value={head.bio || ''}
                        onChange={(e) => updateSectionHead(head.id, { bio: e.target.value })}
                        style={{ width: '100%', height: '80px', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Status:</label>
                    <select 
                      value={head.is_active ? 'active' : 'inactive'}
                      onChange={(e) => updateSectionHead(head.id, { is_active: e.target.value === 'active' })}
                      style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advertisers Tab */}
      {activeTab === 'advertisers' && (
        <div>
          <h3 style={{ color: '#1177BB', marginBottom: '15px' }}>Advertising Content Management</h3>
          <div style={{ background: 'white', border: '1px solid #CCCCCC', borderRadius: '4px', overflow: 'hidden' }}>
            {advertisers.map((advertiser) => (
              <div key={advertiser.id} style={{ padding: '15px', borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 150px', gap: '15px', alignItems: 'start' }}>
                  <div>
                    {advertiser.content_url ? (
                      <img 
                        src={advertiser.content_url} 
                        alt={advertiser.name}
                        style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', border: '1px solid #CCCCCC' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '120px', 
                        background: '#F0F0F0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #CCCCCC',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        No Content
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*,video/*"
                      style={{ marginTop: '10px', fontSize: '11px', width: '100%' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, 'advertiser', advertiser.id);
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Company Name:</label>
                      <input 
                        type="text" 
                        value={advertiser.name}
                        onChange={(e) => updateAdvertiser(advertiser.id, { name: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Content Type:</label>
                      <select 
                        value={advertiser.content_type}
                        onChange={(e) => updateAdvertiser(advertiser.id, { content_type: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description:</label>
                      <textarea 
                        value={advertiser.description || ''}
                        onChange={(e) => updateAdvertiser(advertiser.id, { description: e.target.value })}
                        style={{ width: '100%', height: '60px', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Status:</label>
                      <select 
                        value={advertiser.is_active ? 'active' : 'inactive'}
                        onChange={(e) => updateAdvertiser(advertiser.id, { is_active: e.target.value === 'active' })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Display Order:</label>
                      <input 
                        type="number" 
                        value={advertiser.display_order}
                        onChange={(e) => updateAdvertiser(advertiser.id, { display_order: parseInt(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', border: '1px solid #CCCCCC' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* User Management Tab */}
      {activeTab === 'user-management' && (
        <div>
          <UserDisplayNameManager />
        </div>
      )}
      
      {uploadingFile && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white', 
          padding: '20px', 
          border: '2px solid #1177BB',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Uploading File...</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Please wait while the file is being uploaded.</div>
          </div>
        </div>
      )}
    </div>
  );
};