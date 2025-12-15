import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import { recordIncidentAudit } from '../../lib/utils';

const MEDIA_BUCKET = String(import.meta?.env?.VITE_INCIDENT_MEDIA_BUCKET || 'incident-media-files');

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;
const Section = styled.section` margin-bottom: 2rem;`;
const FlexRow = styled.div`
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;
const Column = styled.div<{ $width?: string }>`
  width: ${p => p.$width || '48%'}; vertical-align: top; text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
`;
const ImageColumn = styled.div`
  width: 240px; display: flex; justify-content: center; align-items: flex-start;
  @media (max-width: 768px) { width: 100% !important; justify-content: center; margin-top: 20px; }
`;
const Title = styled.h1` font-size: 2.2rem; color: #FF9900; font-weight: bold; margin-bottom: 10px;`;
const Divider = styled.hr` width: 100%; border: 5px solid #FF9900; border-radius: 3px; margin: 15px 0;`;
const Paragraph = styled.p` font-size: 125%; letter-spacing: 1.25px; line-height: 25px; text-align: justify; margin-bottom: 15px;`;
const HeaderImage = styled.img` width: 224px; height: auto; max-width: 224px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1);`;
const ImagePlaceholder = styled.div` width: 224px; height: 160px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; box-shadow: 0 2px 8px rgba(0,0,0,.1);`;
const Input = styled.input` width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; &:focus { border-color: #1177BB; outline: none; }`;

const UploadSection = styled.div`
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  border: 2px solid #1177BB;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background-color: #1177BB;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  margin-right: 8px;
  &:hover { background-color: #0f5c99; }
`;

const UploadButton = styled.button`
  background-color: #FF9900;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover:not(:disabled) { background-color: #e08800; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Message = styled.div<{ $variant?: 'error' | 'success' }>`
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  background-color: ${p => (p.$variant === 'error' ? '#fee' : '#efe')};
  color: ${p => (p.$variant === 'error' ? '#c33' : '#373')};
  border: 1px solid ${p => (p.$variant === 'error' ? '#fcc' : '#cfc')};
`;

const MediaList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 12px;
`;

const MediaItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 8px;
  align-items: center;
  background: white;
  border: 1px solid #E1E1E1;
  border-radius: 6px;
  padding: 10px;
`;

const MediaActionsButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  background-color: ${p => (p.$variant === 'danger' ? '#dc3545' : '#1177BB')};
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ViewerContainer = styled.div`
  background: #fafafa;
  border: 1px solid #E1E1E1;
  border-radius: 8px;
  padding: 12px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #1177BB;
  color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #1a86cc; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const IncidentMultiMediaFiles: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-multimedia-files', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [viewerItem, setViewerItem] = useState<any | null>(null);
  const viewerUrl = useMemo(() => {
    if (!viewerItem) return '';
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(viewerItem.file_path);
    return data?.publicUrl || '';
  }, [viewerItem]);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  useEffect(() => {
    const inc = localStorage.getItem('vfh_current_incident_number') || '';
    if (!inc) {
      setMediaItems([]);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('03_ecc_03_11_Multi_Media_Files')
          .select('id,incident_number,file_name,file_path,file_size,mime_type,uploaded_by,uploaded_at')
          .eq('incident_number', inc)
          .order('uploaded_at', { ascending: false });
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        setMediaItems(rows.map(r => ({ ...r, pending: false })));
      } catch (e: any) {
        setMediaItems([]);
      }
    })();
    const ch = supabase
      .channel(`incident-media-${inc}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: '03_ecc_03_11_Multi_Media_Files', filter: `incident_number=eq.${inc}` }, payload => {
        const row: any = payload?.new || payload?.old;
        if (!row) return;
        if (payload.eventType === 'INSERT') {
          setMediaItems(prev => {
            const exists = prev.some(m => m.file_path === row.file_path);
            if (exists) return prev;
            return [{ ...row, pending: false }, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setMediaItems(prev => prev.filter(m => m.id !== row.id));
        } else if (payload.eventType === 'UPDATE') {
          setMediaItems(prev => prev.map(m => (m.id === row.id ? { ...row, pending: false } : m)));
        }
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(ch); } catch {}
    };
  }, [incidentNumber]);
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existing = new Set(mediaItems.map(m => String(m.file_name).toLowerCase()));
    const unique: File[] = [];
    const dupNames: string[] = [];
    for (const f of files) {
      const name = String(f.name).toLowerCase();
      if (existing.has(name) || unique.some(u => String(u.name).toLowerCase() === name)) {
        dupNames.push(f.name);
      } else {
        unique.push(f);
      }
    }
    setSelectedFiles(unique);
    if (dupNames.length > 0) {
      setError(`Duplicate files skipped: ${dupNames.join(', ')}`);
    } else {
      setError('');
    }
    setSuccess('');
  };
  const formatSize = (n?: number | null) => {
    const v = typeof n === 'number' ? n : 0;
    if (v < 1024) return `${v} B`;
    if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
    return `${(v / (1024 * 1024)).toFixed(1)} MB`;
  };
  const handleUpload = async () => {
    if (!incidentNumber) {
      setError('Incident number is required');
      return;
    }
    if (selectedFiles.length === 0) return;
    try {
      setUploading(true);
      setError('');
      setSuccess('');
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id || null;
      const existing = new Set(mediaItems.map(m => String(m.file_name).toLowerCase()));
      const toUpload = selectedFiles.filter(f => !existing.has(String(f.name).toLowerCase()));
      if (toUpload.length < selectedFiles.length) {
        const skipped = selectedFiles.filter(f => existing.has(String(f.name).toLowerCase())).map(f => f.name);
        setError(`Duplicate files skipped: ${skipped.join(', ')}`);
      }
      for (const file of toUpload) {
        const timestamp = Date.now();
        const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
        const filePath = `${incidentNumber}/${timestamp}_${safe}`;
        const { error: upErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(filePath, file, { upsert: false, cacheControl: '3600' });
        if (upErr) throw upErr;
        setMediaItems(prev => [
          { id: undefined, incident_number: incidentNumber, file_name: file.name, file_path: filePath, file_size: file.size, mime_type: file.type || null, uploaded_by: userId, uploaded_at: new Date().toISOString(), pending: true },
          ...prev
        ]);
      }
      setSuccess('Files staged. Click Save & Continue to commit.');
      setSelectedFiles([]);
      const input = document.getElementById('incident-media-upload') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (/bucket.*not.*found/i.test(msg)) {
        setError(`Storage bucket "${MEDIA_BUCKET}" not found. Please create this bucket in Supabase Storage and try again.`);
      } else {
        setError(msg || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };
  const openItem = (item: any) => {
    setViewerItem(item);
  };
  const downloadItem = async (item: any) => {
    try {
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .download(item.file_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.file_name || 'media';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };
  const deleteItem = async (item: any) => {
    const ok = window.confirm('Delete this file?');
    if (!ok) return;
    try {
      const { error: rmErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .remove([item.file_path]);
      if (rmErr) throw rmErr;
      if (item?.pending) {
        setMediaItems(prev => prev.filter(x => x.file_path !== item.file_path));
        if (viewerItem?.file_path === item.file_path) setViewerItem(null);
      } else {
        const { error: delErr } = await supabase
          .from('03_ecc_03_11_Multi_Media_Files')
          .delete()
          .eq('id', item.id);
        if (delErr) throw delErr;
        setMediaItems(prev => prev.filter(x => x.id !== item.id));
        if (viewerItem?.id === item.id) setViewerItem(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };
  const commitPending = async () => {
    if (!incidentNumber) return;
    const pending = mediaItems.filter(m => m.pending);
    if (pending.length === 0) return;
    try {
      const rows = pending.map(p => ({
        incident_number: incidentNumber,
        file_name: p.file_name,
        file_path: p.file_path,
        file_size: p.file_size,
        mime_type: p.mime_type || null,
        uploaded_by: p.uploaded_by || null
      }));
      const { data, error } = await supabase
        .from('03_ecc_03_11_Multi_Media_Files')
        .insert(rows)
        .select('id,incident_number,file_name,file_path,file_size,mime_type,uploaded_by,uploaded_at');
      if (error) throw error;
      const inserted = Array.isArray(data) ? data : [];
      setMediaItems(prev => {
        const committedPaths = new Set(inserted.map(i => i.file_path));
        const notPending = prev.filter(m => !m.pending);
        const committed = inserted.map(i => ({ ...i, pending: false }));
        // Remove duplicates by file_path among notPending and committed
        const dedupMap: Record<string, any> = {};
        for (const m of [...committed, ...notPending]) {
          dedupMap[m.file_path] = m;
        }
        return Object.values(dedupMap);
      });
      setSuccess('Files saved successfully');
      setError('');
      try {
        await recordIncidentAudit(incidentNumber, 'media_files_committed', 'incident-media-files', `Committed ${inserted.length} files`);
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    }
  };
  const saveAndContinue = async () => {
    if (!incidentNumber) {
      navigate('/control/emergency-incident-logging/lock-status');
      return;
    }
    if (uploading) {
      setError('Uploads are still in progress. Please wait until they complete or click Save Files to commit without leaving.');
      return;
    }
    const pending = mediaItems.filter(m => m.pending);
    if (pending.length === 0) {
      navigate('/control/emergency-incident-logging/lock-status');
      return;
    }
    try {
      await commitPending();
      navigate('/control/emergency-incident-logging/lock-status');
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    }
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="media-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="media-title">Multi-Media Files</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Manage photos, videos and other media associated with the incident. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Multi-Media Files" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
          <FlexRow style={{ marginTop: '16px' }}>
            <Column $width="58%">
              <UploadSection>
                {error && <Message $variant="error">{error}</Message>}
                {success && <Message $variant="success">{success}</Message>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <FileInput id="incident-media-upload" type="file" accept="image/*,video/*" multiple onChange={onFileSelect} />
                  <FileInputLabel htmlFor="incident-media-upload">Select Files</FileInputLabel>
                  <UploadButton onClick={handleUpload} disabled={uploading || !incidentNumber || selectedFiles.length === 0}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </UploadButton>
                  {selectedFiles.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#333' }}>
                      {selectedFiles.length} selected
                    </div>
                  )}
                </div>
                <MediaList>
                  {mediaItems.map((item) => (
                    <MediaItem key={item.id}>
                      <div style={{ fontSize: '13px', color: '#1177BB', fontWeight: 600, wordBreak: 'break-word' }}>
                        {item.file_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#555' }}>{formatSize(item.file_size)}</div>
                      <MediaActionsButton onClick={() => openItem(item)}>Open</MediaActionsButton>
                      <MediaActionsButton onClick={() => downloadItem(item)}>Download</MediaActionsButton>
                      <MediaActionsButton $variant="danger" onClick={() => deleteItem(item)}>Delete</MediaActionsButton>
                    </MediaItem>
                  ))}
                </MediaList>
              </UploadSection>
            </Column>
            <Column $width="40%">
              <ViewerContainer>
                {viewerItem && viewerUrl ? (
                  (/^video\//i.test(String(viewerItem.mime_type || '')) ? (
                    <video src={viewerUrl} controls style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 6 }} />
                  ) : (
                    <img src={viewerUrl} alt={viewerItem.file_name || 'media'} style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 6 }} />
                  ))
                ) : (
                  <div style={{ color: '#666', fontSize: '13px' }}>Select a file to preview</div>
                )}
              </ViewerContainer>
            </Column>
          </FlexRow>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={commitPending} disabled={!incidentNumber || mediaItems.filter(m => m.pending).length === 0}>
          Save Files
        </ActionButton>
        <ActionButton onClick={saveAndContinue}>Save & Continue to Record Lock Status</ActionButton>
      </ButtonRow>
    </MainContent>
  );
};
