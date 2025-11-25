/**
 * PDF Font Configuration
 * 
 * This module handles custom font loading for jsPDF to ensure proper
 * character rendering in generated PDF documents.
 * 
 * Without custom fonts, jsPDF only supports basic ASCII characters,
 * which results in gibberish symbols for extended character sets.
 */

import { jsPDF } from 'jspdf';

// Import font as base64 string
let robotoFont: string | null = null;

/**
 * Load Roboto font file and convert to base64
 */
const loadRobotoFont = async (): Promise<string> => {
  if (robotoFont) {
    return robotoFont;
  }

  try {
    const response = await fetch('/fonts/Roboto-Regular.ttf');
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        robotoFont = base64;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load Roboto font:', error);
    // Return empty string to fall back to default font
    return '';
  }
};

/**
 * Initialize custom fonts for jsPDF
 * 
 * This function must be called on every jsPDF instance to ensure
 * proper text rendering with full Unicode support.
 * 
 * @param doc - jsPDF document instance
 */
export const initializePDFFonts = async (doc: jsPDF): Promise<void> => {
  try {
    const fontBase64 = await loadRobotoFont();
    
    if (fontBase64) {
      // Add Roboto font to jsPDF
      doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      
      // Set Roboto as the default font
      doc.setFont('Roboto', 'normal');
      
      console.log('PDF fonts initialized successfully');
    } else {
      console.warn('Could not load custom font, using default');
    }
  } catch (error) {
    console.error('Error initializing PDF fonts:', error);
    // Continue with default font if custom font fails
  }
};

/**
 * Initialize fonts synchronously for jsPDF
 * Uses Helvetica (built-in font) as a reliable fallback
 * 
 * @param doc - jsPDF document instance
 */
export const initializePDFFontsSync = (doc: jsPDF): void => {
  // Use built-in Helvetica font which should work correctly in jsPDF 3.x
  doc.setFont('helvetica', 'normal');
};

export default {
  initializePDFFonts,
  initializePDFFontsSync,
};
