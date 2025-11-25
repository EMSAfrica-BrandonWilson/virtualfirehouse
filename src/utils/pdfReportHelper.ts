/**
 * VFH A4 PDF Document Landscape Layout - Helper Functions
 * 
 * Implements the standardized PDF formatting logic according to 
 * the "VFH A4 PDF Document Landscape Layout" specification v1.0.
 * 
 * Specification: /docs/VFH_A4_PDF_Document_Landscape_Layout_Specification.md
 */

import jsPDF from 'jspdf';
import { PDF_REPORT_CONFIG } from './pdfReportConfig';
import { formatDateTimeReadable, formatDateOnly } from '../lib/utils';

export interface PDFReportData {
  departmentName: string;
  departmentType?: string;
  reportTitle: string;
  summaryText: string;
  currentUser?: any;
}

export interface PDFLogoOptions {
  logoBase64: string;
  doc: jsPDF;
}

export interface PDFHeaderOptions {
  doc: jsPDF;
  data: PDFReportData;
}

export interface PDFFooterOptions {
  doc: jsPDF;
  data: PDFReportData;
  pageData: any;
  totalPages: number;
  renderPageNumber?: boolean;
}

/**
 * Role ordering helpers (VFH standard top-to-bottom order)
 * Normalizes common variants and plural forms to stable keys,
 * and returns an index suitable for sorting.
 */
// Enforce top-three priorities; others fall back to existing sort keys
export const ROLE_ORDER: string[] = [
  'duty chief fire officer',
  'station captain',
  'crew chief',
  'firefighter',
  // Ensure Paramedic precedes Ambulance Assistant in ordering
  'paramedic',
  'ambulance assistant',
];

const ROLE_ORDER_MAP = new Map(ROLE_ORDER.map((name, idx) => [name, idx]));

export const normalizeRoleLabel = (name?: string): string => {
  if (!name) return '';
  let n = name.toLowerCase().trim();
  // Remove punctuation
  n = n.replace(/[\.\-]/g, ' ').replace(/\s+/g, ' ').trim();
  // Common misspellings / synonyms
  n = n.replace(/attendent/g, 'attendant');
  n = n.replace(/ambulance attendant/g, 'ambulance assistant');
  n = n.replace(/duty chief fire office\b/g, 'duty chief fire officer');
  // Treat any "captain" role as Station Captain for ordering
  if (/\bcaptain\b/.test(n)) {
    n = 'station captain';
  }
  // Collapse any role containing "paramedic" to the base paramedic key
  if (/\bparamedic\b/.test(n)) {
    n = 'paramedic';
  }
  // Collapse any role containing "firefighter" to the base firefighter key
  if (/\bfire\s*fighter\b/.test(n)) {
    n = 'firefighter';
  }
  // Singularize simple trailing plurals
  if (n.endsWith('s')) n = n.slice(0, -1);
  return n;
};

export const getRoleIndex = (name?: string): number => {
  const key = normalizeRoleLabel(name);
  return ROLE_ORDER_MAP.has(key) ? (ROLE_ORDER_MAP.get(key) as number) : 9999;
};

/**
 * Add standardized logo to PDF
 */
export const addStandardizedLogo = ({ logoBase64, doc }: PDFLogoOptions): void => {
  try {
    const imageFormat = PDF_REPORT_CONFIG.UTILS.detectImageFormat(logoBase64);
    // Position logo near the right margin dynamically based on page width
    const pageWidth = (doc.internal.pageSize as any).width || (doc.internal.pageSize as any).getWidth?.();
    const pageHeight = (doc.internal.pageSize as any).height || (doc.internal.pageSize as any).getHeight?.();
    const isPortrait = pageWidth < pageHeight;

    // Base dimensions from config
    const baseWidth = PDF_REPORT_CONFIG.LOGO.WIDTH;
    const baseHeight = PDF_REPORT_CONFIG.LOGO.HEIGHT;

    // Scale down logo in portrait to avoid overlapping header text
    const scale = isPortrait ? 0.7 : 1.0;
    const maxPortraitWidth = isPortrait ? pageWidth * 0.18 : baseWidth; // cap width to ~18% of page
    const scaledWidthCandidate = baseWidth * scale;
    const width = isPortrait ? Math.min(scaledWidthCandidate, maxPortraitWidth) : baseWidth;
    const height = baseHeight * (width / baseWidth);

    const rightMargin = 14; // consistent right margin
    const x = Math.max(0, pageWidth - rightMargin - width);
    // Raise the logo so its top aligns with the header's top text area
    // Use standardized logo Y from config for consistent alignment across orientations
    const y = Math.max(8, PDF_REPORT_CONFIG.LOGO.Y);
    
    doc.addImage(
      logoBase64,
      imageFormat,
      x,
      y,
      width,
      height
    );
  } catch (error) {
    console.warn('Could not add department logo to PDF:', error);
  }
};

/**
 * Add standardized header to PDF according to VFH A4 specification
 */
export const addStandardizedHeader = ({ doc, data }: PDFHeaderOptions): void => {
  const { departmentName, departmentType, reportTitle } = data;
  // Compute dynamic center X based on current page width to support both
  // portrait and landscape orientations.
  const pageWidth = (doc.internal.pageSize as any).width || (doc.internal.pageSize as any).getWidth?.();
  const centerX = pageWidth / 2;
  
  // 1. Department Name (18pt, bold, centered)
  doc.setFontSize(PDF_REPORT_CONFIG.HEADER.DEPARTMENT_NAME.FONT_SIZE);
  doc.setFont('helvetica', PDF_REPORT_CONFIG.HEADER.DEPARTMENT_NAME.FONT_WEIGHT);
  doc.text(
    departmentName,
    centerX,
    PDF_REPORT_CONFIG.HEADER.DEPARTMENT_NAME.Y,
    { align: PDF_REPORT_CONFIG.HEADER.DEPARTMENT_NAME.ALIGN }
  );

  // 2. Department Type (16pt, bold, centered) - optional
  if (departmentType) {
    doc.setFontSize(PDF_REPORT_CONFIG.HEADER.DEPARTMENT_TYPE.FONT_SIZE);
    doc.setFont('helvetica', PDF_REPORT_CONFIG.HEADER.DEPARTMENT_TYPE.FONT_WEIGHT);
    doc.text(
      departmentType,
      centerX,
      PDF_REPORT_CONFIG.HEADER.DEPARTMENT_TYPE.Y,
      { align: PDF_REPORT_CONFIG.HEADER.DEPARTMENT_TYPE.ALIGN }
    );
  }

  // 3. Report Title (14pt, normal, centered)
  doc.setFontSize(PDF_REPORT_CONFIG.HEADER.REPORT_TITLE.FONT_SIZE);
  doc.setFont('helvetica', PDF_REPORT_CONFIG.HEADER.REPORT_TITLE.FONT_WEIGHT);
  const reportTitleY = departmentType ? 
    PDF_REPORT_CONFIG.HEADER.REPORT_TITLE.Y_WITH_TYPE : 
    PDF_REPORT_CONFIG.HEADER.REPORT_TITLE.Y_WITHOUT_TYPE;
  doc.text(
    reportTitle,
    centerX,
    reportTitleY,
    { align: PDF_REPORT_CONFIG.HEADER.REPORT_TITLE.ALIGN }
  );
};

/**
 * Get user name for PDF attribution (VFH A4 Standard)
 * Prioritizes display_name over email for better user experience
 */
export const getUserName = (currentUser: any): string => {
  // First priority: display_name
  if (currentUser?.profile?.display_name && currentUser.profile.display_name.trim()) {
    return currentUser.profile.display_name.trim();
  }
  
  // Second priority: full_name
  if (currentUser?.profile?.full_name && currentUser.profile.full_name.trim()) {
    return currentUser.profile.full_name.trim();
  }
  
  // Third priority: first_name + last_name combination
  const firstName = currentUser?.profile?.first_name?.trim() || '';
  const lastName = currentUser?.profile?.last_name?.trim() || '';
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  
  // Do not fall back to email; show neutral label to avoid exposing addresses
  return 'Unknown User';
};

/**
 * Get standardized table start Y position
 */
export const getTableStartY = (hasDepartmentType: boolean): number => {
  return hasDepartmentType ? 
    PDF_REPORT_CONFIG.TABLE.START_Y_WITH_TYPE : 
    PDF_REPORT_CONFIG.TABLE.START_Y_WITHOUT_TYPE;
};

/**
 * Create standardized footer for PDF pages (VFH A4 Standard)
 */
export const createStandardizedFooter = ({ doc, data, pageData, totalPages, renderPageNumber }: PDFFooterOptions): void => {
  const { summaryText, currentUser } = data;
  
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  const footerStartY = PDF_REPORT_CONFIG.UTILS.getFooterStartY(pageHeight);
  
  // Add separator line above footer
  const [sepR, sepG, sepB] = PDF_REPORT_CONFIG.FOOTER.SEPARATOR_COLOR;
  doc.setDrawColor(sepR, sepG, sepB);
  doc.setLineWidth(PDF_REPORT_CONFIG.FOOTER.SEPARATOR_LINE_WIDTH);
  doc.line(14, footerStartY, pageWidth - 14, footerStartY);
  
  // Add orange background to footer area
  const [bgR, bgG, bgB] = PDF_REPORT_CONFIG.FOOTER.BACKGROUND_COLOR;
  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(0, footerStartY, pageWidth, PDF_REPORT_CONFIG.FOOTER.HEIGHT, 'F');
  
  // Set white text color for footer content
  const [txtR, txtG, txtB] = PDF_REPORT_CONFIG.FOOTER.TEXT_COLOR;
  doc.setTextColor(txtR, txtG, txtB);
  
  // TOP ROW - Summary text (left) and Uncontrolled notice (right)
  const topRowY = footerStartY + PDF_REPORT_CONFIG.FOOTER.TOP_ROW.Y_OFFSET;
  
  // Summary text (left-aligned)
  doc.setFontSize(PDF_REPORT_CONFIG.FOOTER.TOP_ROW.SUMMARY_TEXT.FONT_SIZE);
  doc.setFont('helvetica', PDF_REPORT_CONFIG.FOOTER.TOP_ROW.SUMMARY_TEXT.FONT_WEIGHT);
  doc.text(summaryText, PDF_REPORT_CONFIG.FOOTER.TOP_ROW.SUMMARY_TEXT.X, topRowY);
  
  // Uncontrolled notice (right-aligned)
  doc.setFontSize(PDF_REPORT_CONFIG.FOOTER.TOP_ROW.UNCONTROLLED_NOTICE.FONT_SIZE);
  doc.setFont('helvetica', PDF_REPORT_CONFIG.FOOTER.TOP_ROW.UNCONTROLLED_NOTICE.FONT_WEIGHT);
  doc.text(
    PDF_REPORT_CONFIG.FOOTER.TOP_ROW.UNCONTROLLED_NOTICE.TEXT,
    pageWidth - 14,
    topRowY,
    { align: PDF_REPORT_CONFIG.FOOTER.TOP_ROW.UNCONTROLLED_NOTICE.ALIGN }
  );
  
  // BOTTOM ROW - Generated info (left), Company info (center), Page numbers (right)
  const bottomRowY = footerStartY + PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.Y_OFFSET;
  
  // Generated date and user information (left-aligned)
  const generatedDate = PDF_REPORT_CONFIG.UTILS.formatGeneratedDate();
  const userName = getUserName(currentUser);
  doc.setFontSize(PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.GENERATED_INFO.FONT_SIZE);
  doc.setFont('helvetica', PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.GENERATED_INFO.FONT_WEIGHT);
  doc.text(
    `Generated on: ${generatedDate} by: ${userName}`,
    PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.GENERATED_INFO.X,
    bottomRowY
  );
  
  // Company information with hyperlink (center-aligned)
  // Remove company information from footer as per request
  
  // Page number (right-aligned) - Format: Page X of Y
  if (renderPageNumber !== false) {
    doc.setFontSize(PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.PAGE_NUMBER.FONT_SIZE);
    doc.setFont('helvetica', PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.PAGE_NUMBER.FONT_WEIGHT);
    doc.text(
      `Page ${pageData.pageNumber} of ${totalPages}`,
      pageWidth - 14,
      bottomRowY,
      { align: PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.PAGE_NUMBER.ALIGN }
    );
  }
  
  // Reset text color to black for other content
  doc.setTextColor(0, 0, 0);
};

/**
 * Generate standardized filename for PDF report
 */
export const generateReportFilename = (departmentName: string, reportType: string): string => {
  return PDF_REPORT_CONFIG.UTILS.generateFilename(departmentName, reportType);
};

/**
 * Complete VFH A4 standardized PDF setup
 */
export interface VFHStandardPDFSetupOptions {
  doc: jsPDF;
  logoBase64?: string;
  data: PDFReportData;
}

export interface VFHStandardPDFSetupResult {
  tableStartY: number;
  tableConfig: {
    styles: typeof PDF_REPORT_CONFIG.TABLE.STYLES;
    headStyles: typeof PDF_REPORT_CONFIG.TABLE.HEAD_STYLES;
    alternateRowStyles: typeof PDF_REPORT_CONFIG.TABLE.ALTERNATE_ROW_STYLES;
    margin: typeof PDF_REPORT_CONFIG.TABLE.MARGIN;
    tableWidth: typeof PDF_REPORT_CONFIG.TABLE.TABLE_WIDTH;
    didDrawPage: (data: any) => void;
  };
  filename: string;
}

/**
 * Remove any trailing blank pages caused by autoTable or layout overflow.
 * Uses lastAutoTable.pageNumber to detect the last page that actually contains table content.
 * If jsPDF reports more pages than lastAutoTable.pageNumber, delete the extras.
 */
export const cleanupTrailingBlankPages = (doc: jsPDF): void => {
  try {
    const totalPages = doc.getNumberOfPages();
    const lastAutoTable = (doc as any).lastAutoTable;
    if (lastAutoTable && typeof lastAutoTable.pageNumber === 'number') {
      const lastContentPage = lastAutoTable.pageNumber;
      if (totalPages > lastContentPage) {
        for (let p = totalPages; p > lastContentPage; p--) {
          // Use any-cast to avoid TS type issues on deletePage
          (doc as any).deletePage(p);
        }
      }
    }
  } catch (err) {
    // Non-fatal: if cleanup fails, keep the document as-is
    console.warn('cleanupTrailingBlankPages failed:', err);
  }
};

/**
 * Apply final page numbers after all content is generated.
 * Ensures "Page X of Y" uses the true total page count.
 */
export const applyFinalPageNumbers = (doc: jsPDF, data: PDFReportData): void => {
  try {
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      (doc as any).setPage(p);

      const pageWidth = (doc.internal.pageSize as any).width || (doc.internal.pageSize as any).getWidth?.();
      const pageHeight = (doc.internal.pageSize as any).height || (doc.internal.pageSize as any).getHeight?.();
      const footerStartY = PDF_REPORT_CONFIG.UTILS.getFooterStartY(pageHeight);
      const bottomRowY = footerStartY + PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.Y_OFFSET;

      const [txtR, txtG, txtB] = PDF_REPORT_CONFIG.FOOTER.TEXT_COLOR;
      doc.setTextColor(txtR, txtG, txtB);
      doc.setFontSize(PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.PAGE_NUMBER.FONT_SIZE);
      doc.setFont('helvetica', PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.PAGE_NUMBER.FONT_WEIGHT);
      doc.text(
        `Page ${p} of ${totalPages}`,
        pageWidth - 14,
        bottomRowY,
        { align: PDF_REPORT_CONFIG.FOOTER.BOTTOM_ROW.PAGE_NUMBER.ALIGN }
      );
      doc.setTextColor(0, 0, 0);
    }
  } catch (err) {
    console.warn('applyFinalPageNumbers failed:', err);
  }
};

export const setupVFHStandardPDF = ({ 
  doc, 
  logoBase64, 
  data 
}: VFHStandardPDFSetupOptions): VFHStandardPDFSetupResult => {
  // Set VFH A4 standard document properties
  const docProperties = PDF_REPORT_CONFIG.UTILS.generateDocumentProperties(
    data.departmentName, 
    data.reportTitle
  );
  doc.setProperties(docProperties);
  
  // Standardize header defaults across all reports
  const effectiveData: PDFReportData = {
    departmentName: data.departmentName || 'King Fahd International Airport',
    departmentType: data.departmentType || 'Airport Rescue & Fire Fighting Services',
    reportTitle: data.reportTitle,
    summaryText: data.summaryText,
    currentUser: data.currentUser,
  };
  
  // Add logo if provided
  if (logoBase64) {
    addStandardizedLogo({ logoBase64, doc });
  }
  
  // Add header
  addStandardizedHeader({ doc, data: effectiveData });
  
  // Get table start position
  const tableStartY = getTableStartY(!!effectiveData.departmentType);
  
  // Generate VFH A4 standard filename
  const filename = PDF_REPORT_CONFIG.UTILS.generateFilename(effectiveData.departmentName, effectiveData.reportTitle);
  
  // Return configuration with page handler
  return {
    tableStartY,
    tableConfig: {
      styles: PDF_REPORT_CONFIG.TABLE.STYLES,
      headStyles: PDF_REPORT_CONFIG.TABLE.HEAD_STYLES,
      alternateRowStyles: PDF_REPORT_CONFIG.TABLE.ALTERNATE_ROW_STYLES,
      margin: PDF_REPORT_CONFIG.TABLE.MARGIN,
      tableWidth: PDF_REPORT_CONFIG.TABLE.TABLE_WIDTH,
      didDrawPage: (pageData: any) => {
        // Defer accurate total page count until after table completes
        const totalPages = 0;
        
        // Add header on each page (skip first page as it's already added)
        if (pageData.pageNumber > 1) {
          if (logoBase64) {
            addStandardizedLogo({ logoBase64, doc });
          }
          addStandardizedHeader({ doc, data: effectiveData });
        }
        
        // Add footer on every page (skip page number; will add in a final pass)
        createStandardizedFooter({ doc, data: effectiveData, pageData, totalPages, renderPageNumber: false });
      }
    },
    filename
  };
};

/**
 * VFH-A4-P / VFH-A4-L convenience wrappers
 * These create a jsPDF document with the requested orientation
 * and apply the standardized VFH A4 header/footer/table configuration.
 */
export interface VFHA4SetupOptions {
  data: PDFReportData;
  logoBase64?: string;
}

export interface VFHA4SetupReturn extends VFHStandardPDFSetupResult {
  doc: jsPDF;
}

export const setupVFH_A4_P = ({ data, logoBase64 }: VFHA4SetupOptions): VFHA4SetupReturn => {
  const doc = new jsPDF('portrait');
  const setup = setupVFHStandardPDF({ doc, logoBase64, data });
  return { doc, ...setup };
};

export const setupVFH_A4_L = ({ data, logoBase64 }: VFHA4SetupOptions): VFHA4SetupReturn => {
  const doc = new jsPDF('landscape');
  const setup = setupVFHStandardPDF({ doc, logoBase64, data });
  return { doc, ...setup };
};

export default {
  addStandardizedLogo,
  addStandardizedHeader,
  getTableStartY,
  getUserName,
  createStandardizedFooter,
  generateReportFilename,
  setupVFHStandardPDF,
  setupVFH_A4_P,
  setupVFH_A4_L,
  cleanupTrailingBlankPages,
  applyFinalPageNumbers,
};