/**
 * Company Logo Utilities for VirtualFireHouse
 * 
 * Centralized management of company logos for PDF reports
 * Ensures consistent DACO branding across all generated documents
 */

/**
 * Convert image file to base64 for PDF embedding
 */
const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Load image from URL and convert to base64
 */
const urlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Get the standard DACO company logo for PDF reports
 * Returns base64 encoded image data ready for PDF embedding
 */
export const getCompanyLogo = async (): Promise<string> => {
  try {
    // Try to load DACO logo from public images
    const dacoLogoUrl = '/images/daco-new-logo.jpg';
    return await urlToBase64(dacoLogoUrl);
  } catch (error) {
    console.warn('Could not load DACO logo, falling back to no logo:', error);
    return '';
  }
};

/**
 * Get logo for PDF reports with fallback logic
 * Priority: 1. DACO company logo, 2. Department logo (if provided), 3. No logo
 */
export const getPDFLogo = async (departmentLogoUrl?: string | null): Promise<string> => {
  try {
    // Always prioritize DACO company logo
    const companyLogo = await getCompanyLogo();
    if (companyLogo) {
      return companyLogo;
    }
    
    // Fallback to department logo if DACO logo fails
    if (departmentLogoUrl) {
      return await urlToBase64(departmentLogoUrl);
    }
    
    return '';
  } catch (error) {
    console.warn('Could not load any logo for PDF:', error);
    return '';
  }
};

/**
 * Utility to check if logo is available
 */
export const isLogoAvailable = async (): Promise<boolean> => {
  try {
    const logo = await getCompanyLogo();
    return logo !== '';
  } catch {
    return false;
  }
};

export default {
  getCompanyLogo,
  getPDFLogo,
  isLogoAvailable,
  imageToBase64,
  urlToBase64,
};
