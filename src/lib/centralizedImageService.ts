import { authenticatedSupabase } from './authenticatedSupabaseClient';

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

interface UploadImageParams {
  file: File;
  pageName: string;
}

interface PaginatedImagesResult {
  images: PageImage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Centralized Image Management Service using the authenticated Supabase wrapper
 * This ensures all API calls automatically include proper authentication
 */
export class CentralizedImageService {
  /**
   * Upload a new image for a specific page
   */
  static async uploadImage({ file, pageName }: UploadImageParams): Promise<PageImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          
          console.log('Uploading image via centralized service:', {
            pageName,
            fileName: file.name,
            fileSize: file.size
          });
          
          // Use the authenticated wrapper - it will automatically handle session validation
          const { data, error } = await authenticatedSupabase.functions.invoke('upload-page-image', {
            body: {
              imageData: base64Data,
              fileName: file.name,
              pageName: pageName
            }
          });
          
          if (error) {
            console.error('Upload function error:', error);
            throw new Error(error.message || 'Function invocation failed');
          }
          
          if (data?.error) {
            console.error('Upload business logic error:', data.error);
            throw new Error(data.error.message || 'Upload failed');
          }
          
          if (!data?.data?.image) {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response from upload service');
          }
          
          resolve(data.data.image);
        } catch (err: any) {
          console.error('Upload error:', err);
          reject(err);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * List all page images with pagination (admin only)
   */
  static async listImages(page = 1, limit = 20): Promise<PaginatedImagesResult> {
    try {
      console.log('Listing images via centralized service');
      
      // Use the authenticated wrapper - automatic session validation
      const { data, error } = await authenticatedSupabase.functions.invoke('list-page-images', {
        body: {
          page,
          limit
        }
      });
      
      if (error) {
        console.error('List images function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (data?.error) {
        console.error('List images business logic error:', data.error);
        throw new Error(data.error.message || 'Failed to list images');
      }
      
      return data.data || { images: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    } catch (err: any) {
      console.error('Error listing images:', err);
      throw err;
    }
  }

  /**
   * Delete an image (admin only)
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      console.log('Deleting image via centralized service:', imageId);
      
      // Use the authenticated wrapper - automatic session validation
      const { data, error } = await authenticatedSupabase.functions.invoke('delete-page-image', {
        body: { imageId }
      });
      
      if (error) {
        console.error('Delete image function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (data?.error) {
        console.error('Delete image business logic error:', data.error);
        throw new Error(data.error.message || 'Failed to delete image');
      }
    } catch (err: any) {
      console.error('Error deleting image:', err);
      throw err;
    }
  }

  /**
   * Setup storage policies (system admin only)
   */
  static async setupStoragePolicies(): Promise<any> {
    try {
      console.log('Setting up storage policies via centralized service');
      
      const { data, error } = await authenticatedSupabase.functions.invoke('setup-storage-policies', {
        body: {}
      });
      
      if (error) {
        console.error('Storage policy setup function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (data?.error) {
        console.error('Storage policy setup business logic error:', data.error);
        throw new Error(data.error.message || 'Failed to setup storage policies');
      }
      
      return data.data;
    } catch (err: any) {
      console.error('Error setting up storage policies:', err);
      throw err;
    }
  }

  /**
   * Test authentication and permissions
   */
  static async testAuthentication(): Promise<any> {
    try {
      console.log('Testing authentication via centralized service');
      
      const { data, error } = await authenticatedSupabase.functions.invoke('debug-auth-check', {
        body: {}
      });
      
      if (error) {
        console.error('Auth test function error:', error);
        throw new Error(error.message || 'Auth test failed');
      }
      
      return data;
    } catch (err: any) {
      console.error('Auth test error:', err);
      throw err;
    }
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5242880; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit.' };
    }
    
    return { valid: true };
  }
}