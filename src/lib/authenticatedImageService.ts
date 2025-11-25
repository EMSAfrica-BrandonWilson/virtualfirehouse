import { supabase } from './supabase';

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
 * Enhanced Image Management Service with proper authentication handling
 */
export class AuthenticatedImageService {
  /**
   * Get current user session and ensure authentication
   */
  private static async ensureAuthenticated() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      throw new Error('No active session found. Please login.');
    }
    
    return session;
  }

  /**
   * Upload a new image for a specific page with proper authentication
   */
  static async uploadImage({ file, pageName }: UploadImageParams): Promise<PageImage> {
    // Ensure user is authenticated
    await this.ensureAuthenticated();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          
          // Get current session to ensure we have the latest token
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            throw new Error('Session expired. Please login again.');
          }
          
          console.log('Uploading image with authenticated session:', {
            userId: session.user.id,
            email: session.user.email,
            pageName,
            fileName: file.name
          });
          
          const { data, error } = await supabase.functions.invoke('upload-page-image', {
            body: {
              imageData: base64Data,
              fileName: file.name,
              pageName: pageName
            }
          });
          
          console.log('Upload response:', { data, error });
          
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
        } catch (err) {
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
    // Ensure user is authenticated
    await this.ensureAuthenticated();
    
    try {
      console.log('Listing images with authenticated session');
      
      const { data, error } = await supabase.functions.invoke('list-page-images', {
        body: {
          page,
          limit
        }
      });
      
      console.log('List images response:', { data, error });
      
      if (error) {
        console.error('List images function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (data?.error) {
        console.error('List images business logic error:', data.error);
        throw new Error(data.error.message || 'Failed to list images');
      }
      
      return data.data || { images: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    } catch (err) {
      console.error('Error listing images:', err);
      throw err;
    }
  }

  /**
   * Delete an image (admin only)
   */
  static async deleteImage(imageId: string): Promise<void> {
    // Ensure user is authenticated
    await this.ensureAuthenticated();
    
    try {
      console.log('Deleting image with authenticated session:', imageId);
      
      const { data, error } = await supabase.functions.invoke('delete-page-image', {
        body: { imageId }
      });
      
      console.log('Delete image response:', { data, error });
      
      if (error) {
        console.error('Delete image function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (data?.error) {
        console.error('Delete image business logic error:', data.error);
        throw new Error(data.error.message || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      throw err;
    }
  }

  /**
   * Test authentication and role permissions
   */
  static async testAuthentication(): Promise<any> {
    try {
      // Ensure user is authenticated
      const session = await this.ensureAuthenticated();
      
      console.log('Testing authentication with session:', {
        userId: session.user.id,
        email: session.user.email
      });
      
      const { data, error } = await supabase.functions.invoke('debug-auth-check', {
        body: {}
      });
      
      console.log('Auth test response:', { data, error });
      
      if (error) {
        throw new Error(error.message || 'Auth test failed');
      }
      
      return data;
    } catch (err) {
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