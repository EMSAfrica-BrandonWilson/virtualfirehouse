/**
 * VFH A4 PDF Document Landscape Layout - Configuration
 * 
 * Official standardized settings for all PDF reports in VirtualFireHouse application
 * based on the "VFH A4 PDF Document Landscape Layout" specification v1.0.
 * 
 * This configuration ensures consistent branding, professional appearance,
 * and user-friendly formatting across all reports and documents.
 * 
 * Specification: /docs/VFH_A4_PDF_Document_Landscape_Layout_Specification.md
 * 
 * Usage: Import and use these constants in all PDF generation functions
 * to maintain uniform appearance and professional presentation.
 */

// Logo Configuration
export const PDF_LOGO_CONFIG = {
  // Logo positioning coordinates
  X: 245,           // Horizontal position (closer to right edge)
  Y: 16,            // Vertical position aligned with header baseline
  
  // Logo dimensions (optimized to prevent stretching)
  WIDTH: 50,        // Logo width (balance visibility and spacing)
  HEIGHT: 18,       // Logo height (maintain aspect ratio, avoid overlap)
  
  // Image format detection
  SUPPORTED_FORMATS: ['PNG', 'JPEG', 'JPG'] as const,
};

// Header Configuration
export const PDF_HEADER_CONFIG = {
  // Department name positioning
  DEPARTMENT_NAME: {
    X: 148.5,         // Center position for landscape orientation
    Y: 22,            // Slightly lower for better spacing
    FONT_SIZE: 18,
    FONT_WEIGHT: 'bold' as const,
    ALIGN: 'center' as const,
  },
  
  // Department type positioning
  DEPARTMENT_TYPE: {
    X: 148.5,         // Center position
    Y: 30,            // Below department name with consistent spacing
    FONT_SIZE: 16,
    FONT_WEIGHT: 'bold' as const,
    ALIGN: 'center' as const,
  },
  
  // Report title positioning
  REPORT_TITLE: {
    X: 148.5,         // Center position
    Y_WITH_TYPE: 40,  // When department type is present
    Y_WITHOUT_TYPE: 32, // When department type is absent
    FONT_SIZE: 14,
    FONT_WEIGHT: 'normal' as const,
    ALIGN: 'center' as const,
  },
};

// Table Configuration
export const PDF_TABLE_CONFIG = {
  // Starting position
  START_Y_WITH_TYPE: 52,    // When department type is present (more breathing room)
  START_Y_WITHOUT_TYPE: 44, // When department type is absent
  
  // Styling
  STYLES: {
    fontSize: 8,
    cellPadding: 3,
    overflow: 'linebreak' as const,
    halign: 'left' as const,
  },
  
  // Header styling
  HEAD_STYLES: {
    fillColor: [17, 119, 187] as [number, number, number], // #1177BB in RGB
    textColor: 255,
    fontStyle: 'bold' as const,
    fontSize: 9,
  },
  
  // Alternate row styling
  ALTERNATE_ROW_STYLES: {
    fillColor: [249, 249, 249] as [number, number, number], // Light gray
  },
  
  // Margins
  MARGIN: {
    top: 50,
    right: 5,
    bottom: 20,
    left: 5,
  },
  
  // Table width
  TABLE_WIDTH: 'auto' as const,
};

// Footer Configuration - VFH A4 Standard
export const PDF_FOOTER_CONFIG = {
  // Footer dimensions (24mm as per VFH A4 specification)
  HEIGHT: 24,
  
  // VFH A4 Standard Colors
  BACKGROUND_COLOR: [255, 153, 0] as [number, number, number], // #FF9900 (Orange)
  TEXT_COLOR: [255, 255, 255] as [number, number, number],     // White text on orange background
  SEPARATOR_COLOR: [200, 200, 200] as [number, number, number], // Light gray separator line
  
  // Line styling
  SEPARATOR_LINE_WIDTH: 0.5,
  
  // Footer Content Layout - Top Row (8mm from footer top)
  TOP_ROW: {
    Y_OFFSET: 8,  // From footer top
    
    // Summary text (left-aligned)
    SUMMARY_TEXT: {
      FONT_SIZE: 9,
      FONT_WEIGHT: 'normal' as const,
      POSITION: 'left' as const,
      X: 14, // Left margin
    },
    
    // Uncontrolled notice (right-aligned)
    UNCONTROLLED_NOTICE: {
      TEXT: 'Report Uncontrolled when Downloaded or Printed',
      FONT_SIZE: 9,
      FONT_WEIGHT: 'normal' as const,
      POSITION: 'right' as const,
      ALIGN: 'right' as const,
    },
  },
  
  // Footer Content Layout - Bottom Row (17mm from footer top)
  BOTTOM_ROW: {
    Y_OFFSET: 17, // From footer top
    
    // Generated information (left-aligned)
    GENERATED_INFO: {
      FONT_SIZE: 8,
      FONT_WEIGHT: 'italic' as const,
      POSITION: 'left' as const,
      X: 14, // Left margin
    },
    
    // Page number (right-aligned)
    PAGE_NUMBER: {
      FONT_SIZE: 8,
      FONT_WEIGHT: 'normal' as const,
      POSITION: 'right' as const,
      ALIGN: 'right' as const,
    },
    
    // Company information (center-aligned with hyperlink)
    COMPANY_INFO: {
      TEXT: 'VirtualFireHouse by EMSAfrica Pty Ltd',
      URL: 'https://www.EMSAfrica.com',
      FONT_SIZE: 8,
      FONT_WEIGHT: 'normal' as const,
      POSITION: 'center' as const,
      ALIGN: 'center' as const,
      LINK_HEIGHT: 8, // Height of clickable area
    },
  },
};

// Page Configuration - VFH A4 Standard
export const PDF_PAGE_CONFIG = {
  // VFH A4 PDF Document Landscape Layout specifications
  ORIENTATION: 'landscape' as const,
  FORMAT: 'a4' as const,
  
  // VFH A4 Standard Margins (in mm)
  MARGINS: {
    TOP: 50,    // To accommodate header section
    RIGHT: 5,   // Minimal right margin
    BOTTOM: 20, // To accommodate footer section
    LEFT: 5,    // Minimal left margin
  },
  
  // Page dimensions for landscape A4 (in mm)
  LANDSCAPE_A4: {
    WIDTH: 297,      // A4 width in landscape
    HEIGHT: 210,     // A4 height in landscape
    CENTER_X: 148.5, // Horizontal center point (297/2)
  },
  
  // Content area calculations
  CONTENT_AREA: {
    EFFECTIVE_WIDTH: 287, // 297 - 5 - 5 (accounting for left/right margins)
    EFFECTIVE_HEIGHT: 140, // 210 - 50 - 20 (accounting for top/bottom margins)
  },
};

// Utility Functions - VFH A4 Standard
export const PDF_UTILS = {
  /**
   * Calculate footer start Y position
   */
  getFooterStartY: (pageHeight: number): number => {
    return pageHeight - PDF_FOOTER_CONFIG.HEIGHT;
  },
  
  /**
   * Format date for PDF generation (VFH A4 Standard)
   * Format: "Month DD, YYYY at HH:MM AM/PM" using local timezone
   */
  formatGeneratedDate: (): string => {
    // Use native browser date formatting instead of require() which doesn't work in browser
    const date = new Date();
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  },
  

  
  /**
   * Detect image format from base64 string or URL
   */
  detectImageFormat: (imageSource: string): 'PNG' | 'JPEG' => {
    if (imageSource.includes('data:image/png') || imageSource.toLowerCase().includes('.png')) {
      return 'PNG';
    } else if (imageSource.includes('data:image/jpeg') || imageSource.includes('data:image/jpg') || 
               imageSource.toLowerCase().includes('.jpg') || imageSource.toLowerCase().includes('.jpeg')) {
      return 'JPEG';
    }
    // Default fallback
    return 'JPEG';
  },
  
  /**
   * Generate standardized filename (VFH A4 Standard)
   * Format: DepartmentName_ReportType_YYYY-MM-DD.pdf using local timezone
   */
  generateFilename: (departmentName: string, reportType: string): string => {
    const sanitizedDeptName = departmentName.replace(/[^a-z0-9]/gi, '_');
    const sanitizedReportType = reportType.replace(/[^a-z0-9]/gi, '_');
    // Use local timezone date instead of UTC
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return `${sanitizedDeptName}_${sanitizedReportType}_${dateStr}.pdf`;
  },
  
  /**
   * Generate standardized document properties (VFH A4 Standard)
   */
  generateDocumentProperties: (departmentName: string, reportType: string): object => {
    return {
      title: `${departmentName} - ${reportType}`,
      author: 'MiniMax Agent',
      subject: `${reportType} Report`,
      creator: 'VFH Application',
      keywords: 'VirtualFireHouse, EMSAfrica, Report, Emergency Services',
    };
  },
  
  /**
   * Calculate page margins for content positioning
   */
  getContentBounds: () => {
    return {
      left: PDF_PAGE_CONFIG.MARGINS.LEFT,
      right: PDF_PAGE_CONFIG.LANDSCAPE_A4.WIDTH - PDF_PAGE_CONFIG.MARGINS.RIGHT,
      top: PDF_PAGE_CONFIG.MARGINS.TOP,
      bottom: PDF_PAGE_CONFIG.LANDSCAPE_A4.HEIGHT - PDF_PAGE_CONFIG.MARGINS.BOTTOM,
      centerX: PDF_PAGE_CONFIG.LANDSCAPE_A4.CENTER_X,
    };
  },
};

// Export all configurations as a single object for easy import
export const PDF_REPORT_CONFIG = {
  LOGO: PDF_LOGO_CONFIG,
  HEADER: PDF_HEADER_CONFIG,
  TABLE: PDF_TABLE_CONFIG,
  FOOTER: PDF_FOOTER_CONFIG,
  PAGE: PDF_PAGE_CONFIG,
  UTILS: PDF_UTILS,
} as const;

// Export individual configurations for granular imports
export default PDF_REPORT_CONFIG;