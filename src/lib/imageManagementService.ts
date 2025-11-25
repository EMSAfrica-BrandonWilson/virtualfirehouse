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

interface UpdateImageParams {
  imageId: string;
  file: File;
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
 * Service for managing page images through Supabase edge functions
 */
export class ImageManagementService {
  /**
   * Upload a new image for a specific page
   */
  static async uploadImage({ file, pageName }: UploadImageParams): Promise<PageImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          
          const { data, error } = await supabase.functions.invoke('upload-page-image', {
            body: {
              imageData: base64Data,
              fileName: file.name,
              pageName: pageName
            }
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (data?.error) {
            throw new Error(data.error.message);
          }
          
          resolve(data.data.image);
        } catch (err) {
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
   * Get the active image for a specific page
   */
  static async getPageImage(pageName: string): Promise<PageImage | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-page-image', {
        body: { pageName }
      });
      
      if (error) {
        console.warn(`No image found for page '${pageName}':`, error);
        return null;
      }
      
      if (data?.error) {
        console.warn(`No image found for page '${pageName}':`, data.error);
        return null;
      }
      
      return data?.data?.image || null;
    } catch (err) {
      console.error('Error fetching page image:', err);
      return null;
    }
  }

  /**
   * List all page images with pagination (admin only)
   */
  static async listImages(page = 1, limit = 20): Promise<PaginatedImagesResult> {
    try {
      const { data, error } = await supabase.functions.invoke('list-page-images', {
        body: {
          page,
          limit
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.error) {
        throw new Error(data.error.message);
      }
      
      return data.data;
    } catch (err) {
      console.error('Error listing images:', err);
      throw err;
    }
  }

  /**
   * Delete an image (admin only)
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('delete-page-image', {
        body: { imageId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.error) {
        throw new Error(data.error.message);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      throw err;
    }
  }

  /**
   * Update an existing image (admin only)
   */
  static async updateImage({ imageId, file }: UpdateImageParams): Promise<PageImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          
          const { data, error } = await supabase.functions.invoke('update-page-image', {
            body: {
              imageId,
              imageData: base64Data,
              fileName: file.name
            }
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (data?.error) {
            throw new Error(data.error.message);
          }
          
          resolve(data.data.image);
        } catch (err) {
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
   * Validate image file before upload
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.'
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default ImageManagementService;