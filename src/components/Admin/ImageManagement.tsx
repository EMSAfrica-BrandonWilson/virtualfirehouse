import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAdminCheck } from '../../hooks/useAdminCheck';
import { ImageManagementService } from '../../lib/imageManagementService';
import { formatDateOnly } from '../../lib/utils';

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

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  color: #1177BB;
  margin-bottom: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    border-color: #1177BB;
    outline: none;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  cursor: pointer;
  
  &:hover {
    border-color: #1177BB;
    background: #f0f8ff;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
      default:
        return `
          background: #1177BB;
          color: white;
          &:hover { background: #0d5d94; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ImageCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const ImageInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1177BB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress}%;
    background: #1177BB;
    transition: width 0.3s ease;
  }
`;

// Available page names for the dropdown
const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'finance', label: 'Finance (Admin)' },
  { value: 'human-resources', label: 'Human Resources (Admin)' },
  { value: 'management-structure', label: 'Management Structure' },
  { value: 'organizational-structure', label: 'Organizational Structure' },
  { value: 'shift-structure', label: 'Shift Structure' },
  { value: 'register-department', label: 'Register Department' },
  { value: 'register-stations', label: 'Register Stations' },
  { value: 'register-staff', label: 'Register Staff' },
  { value: 'register-equipment', label: 'Register Equipment' },
  { value: 'register-vehicles', label: 'Register Vehicles' },
  { value: 'about-us', label: 'About Us' },
  { value: 'mission', label: 'Mission' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'fire-safety', label: 'Fire Safety' },
  { value: 'emergency-control', label: 'Emergency Control' },
  { value: 'operations', label: 'Operations' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'training', label: 'Training' },
  { value: 'administration', label: 'Administration' },
  { value: 'contact-us', label: 'Contact Us' }
];

interface PageImage {
  id: string;
  page_name: string;
  image_url: string;
  image_name: string;
  uploaded_by: string;
  file_size: number;
  mime_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ImageManagement: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<PageImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Load images on component mount
  useEffect(() => {
    if (isAdmin) {
      loadImages();
    }
  }, [isAdmin, currentPage]);

  const loadImages = async () => {
    try {
      setLoadingImages(true);
      const result = await ImageManagementService.listImages(currentPage, 12);
      setImages(result.images);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = ImageManagementService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPage) {
      setError('Please select both a page and an image file');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      await ImageManagementService.uploadImage({
        file: selectedFile,
        pageName: selectedPage
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setSuccess('Image uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedPage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload images
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await ImageManagementService.deleteImage(imageId);
      setSuccess('Image deleted successfully!');
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (adminLoading) {
    return (
      <MainContent>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <LoadingSpinner />
          <p>Checking admin privileges...</p>
        </div>
      </MainContent>
    );
  }

  if (!isAdmin) {
    return (
      <MainContent>
        <Section>
          <Title>Access Denied</Title>
          <Divider />
          <ErrorMessage>
            You do not have administrative privileges to access this page.
          </ErrorMessage>
        </Section>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <Section>
        <Title>Image Management</Title>
        <Divider />
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {/* Upload Section */}
        <Card>
          <SubTitle>Upload New Image</SubTitle>
          
          <FormGroup>
            <Label htmlFor="page-select">Select Page</Label>
            <Select
              id="page-select"
              value={selectedPage}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPage(e.target.value)}
              disabled={uploading}
            >
              <option value="">Choose a page...</option>
              {PAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="file-input">Select Image File</Label>
            <FileInput
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Supported formats: JPEG, PNG, WebP. Maximum size: 5MB
            </small>
          </FormGroup>

          {previewUrl && (
            <PreviewContainer>
              <SubTitle>Preview</SubTitle>
              <PreviewImage src={previewUrl} alt="Preview" />
              {selectedFile && (
                <div style={{ marginTop: '10px', color: '#666' }}>
                  <strong>File:</strong> {selectedFile.name}<br />
                  <strong>Size:</strong> {ImageManagementService.formatFileSize(selectedFile.size)}<br />
                  <strong>Type:</strong> {selectedFile.type}
                </div>
              )}
            </PreviewContainer>
          )}

          {uploading && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LoadingSpinner />
                <span>Uploading... {uploadProgress}%</span>
              </div>
              <ProgressBar $progress={uploadProgress} />
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedPage || uploading}
              $variant="primary"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            
            <Button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setSelectedPage('');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={uploading}
              $variant="secondary"
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Images List Section */}
        <Card>
          <SubTitle>Current Images</SubTitle>
          
          {loadingImages ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <LoadingSpinner />
              <p>Loading images...</p>
            </div>
          ) : (
            <>
              {images.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  No images found.
                </p>
              ) : (
                <ImageGrid>
                  {images.map(image => (
                    <ImageCard key={image.id}>
                      <ThumbnailImage
                        src={image.image_url}
                        alt={image.image_name}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                      />
                      
                      <ImageInfo>
                        <strong>Page:</strong> {image.page_name}<br />
                        <strong>File:</strong> {image.image_name}<br />
                        <strong>Size:</strong> {ImageManagementService.formatFileSize(image.file_size)}<br />
                        <strong>Type:</strong> {image.mime_type}<br />
                        <strong>Status:</strong> {image.is_active ? 'Active' : 'Inactive'}<br />
                        <strong>Uploaded:</strong> {formatDateOnly(image.created_at)}
                      </ImageInfo>
                      
                      <div>
                        <Button
                          onClick={() => handleDelete(image.id)}
                          $variant="danger"
                          style={{ fontSize: '14px', padding: '5px 10px' }}
                        >
                          Delete
                        </Button>
                      </div>
                    </ImageCard>
                  ))}
                </ImageGrid>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    $variant="secondary"
                  >
                    Previous
                  </Button>
                  
                  <span style={{ margin: '0 20px', fontWeight: 'bold' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    $variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </Section>
    </MainContent>
  );
};

export default ImageManagement;