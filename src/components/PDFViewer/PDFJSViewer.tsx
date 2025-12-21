import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* Allow page-level scrolling by not constraining height */
  height: auto;
  min-height: 100vh;
  background: white;
  position: relative;
`;

const HiddenToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  color: #333;
  height: 48px;
  border-bottom: 1px solid #dee2e6;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  padding: 20px;
  /* Remove inner scrollbar; let the page scroll */
  overflow: visible;
  align-items: center;
`;

const PDFCanvas = styled.canvas`
  max-width: 100%;
  border: 1px solid #dee2e6;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingMessage = styled.div`
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  background: #ffe6e6;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  border: 1px solid #ff4444;
`;

const PDFControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-bottom: 1px solid #34495e;
  flex-wrap: nowrap;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ControlButton = styled.button`
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PageInfo = styled.div`
  color: white;
  font-size: 12px;
  font-weight: 500;
  margin: 0 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 3px;
  backdrop-filter: blur(10px);
  white-space: nowrap;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(10px);
`;

const getDisplayTitle = (fileName: string): string => {
  if (!fileName) return 'Document';
  
  // Remove file extension and decode
  const cleanFileName = fileName.replace(/\.[^/.]+$/, '');
  
  // Handle special cases
  if (cleanFileName.includes('_')) {
    return cleanFileName.replace(/_/g, ' ');
  }
  return cleanFileName;
};

interface PDFJSViewerProps {
  pdfBlob?: Blob;
  title?: string;
}

export const PDFJSViewer: React.FC<PDFJSViewerProps> = ({ pdfBlob, title: propTitle }: PDFJSViewerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract filename from the path - everything after /pdf-viewer/
  const pathParts = location.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.3);
  const [isRendering, setIsRendering] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isHtmlContent, setIsHtmlContent] = useState(false);

  useEffect(() => {
    return () => {
      try { renderTaskRef.current?.cancel?.(); } catch {}
      renderTaskRef.current = null;
    };
  }, []);

  // Calculate optimal zoom to fit page in viewport (favor width for landscape)
  const calculateFitToViewportZoom = async (pdf: any, pageNumber: number = 1): Promise<number> => {
    try {
      if (!pdf) return 1.0;

      const page = await pdf.getPage(pageNumber);
      // Respect the PDF page's inherent rotation so orientation is correct
      const viewport = page.getViewport({ scale: 1.0, rotation: page.rotate || 0 });

      // Get available space from the content container for consistent sizing
      const container = contentRef.current;
      const containerRect = container ? container.getBoundingClientRect() : null;
      const availableWidth = (containerRect?.width ?? (window.innerWidth - 80));
      const availableHeight = (containerRect?.height ?? (window.innerHeight - 150));

      // Calculate zoom levels for width and height
      const zoomForWidth = availableWidth / viewport.width;
      const zoomForHeight = availableHeight / viewport.height;

      // Prefer fit-to-width for landscape pages; otherwise choose the smaller to fit both
      const isLandscape = viewport.width >= viewport.height;
      const preferredZoom = isLandscape ? zoomForWidth : Math.min(zoomForWidth, zoomForHeight);
      const optimalZoom = Math.min(preferredZoom, 2.0); // Cap at 200%

      // Minimum readable zoom
      return Math.max(optimalZoom, 0.5);
    } catch (error) {
      console.warn('Error calculating optimal zoom:', error);
      return 1.0;
    }
  };


  // Load PDF document
  useEffect(() => {
    if (!fileName) return;

    async function loadPDF() {
      try {
        // Decode the filename from URL parameters
        const decodedFileName = decodeURIComponent(fileName);
        
        // If route contains a direct blob URL, load it without sessionStorage
        if (decodedFileName.startsWith('blob:')) {
          try {
            console.log('Loading PDF from direct blob URL in route');
            const response = await fetch(decodedFileName);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log('PDF loaded from route blob URL, pages:', pdf.numPages);
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
            setIsHtmlContent(false);
            const defaultZoom = 1.3;
            setZoom(defaultZoom);
            await renderPageWithZoom(1, pdf, defaultZoom);
            return;
          } catch (error) {
            console.error('Failed to load PDF from route blob URL:', error);
            alert('Failed to load the PDF. Please try regenerating the report.');
            return;
          }
        }
        
        // Check if this is a generated PDF stored in sessionStorage
        if (decodedFileName.startsWith('pdf_')) {
          console.log('Loading PDF/certificate with filename:', decodedFileName);
          const storedValue = sessionStorage.getItem(decodedFileName);
          console.log('Stored value found:', storedValue ? 'Yes' : 'No');
          
          if (decodedFileName.startsWith('pdf_certificate_')) {
            console.log('This is a certificate file');
          }
          
          if (!storedValue) {
            console.error('No data found in sessionStorage for filename:', decodedFileName);
            alert('PDF data not found. Please try generating the PDF again.');
            return;
          }
          
          // Check if the content is HTML
          if (storedValue.startsWith('data:text/html')) {
            console.log('Content is HTML, loading as HTML viewer');
            setHtmlContent(storedValue);
            setIsHtmlContent(true);
            setTotalPages(1);
            return;
          }
          
          if (storedValue) {
            // If the stored value is a blob URL, fetch it and load
            if (storedValue.startsWith('blob:')) {
              console.log('Stored value is a blob URL, fetching and loading');
              try {
                const response = await fetch(storedValue);
                if (!response.ok) {
                  throw new Error(`Blob URL fetch failed with status ${response.status}`);
                }
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                console.log('PDF loaded from blob URL successfully, pages:', pdf.numPages);
                setPdfDoc(pdf);
                setTotalPages(pdf.numPages);
                setCurrentPage(1);
                setIsHtmlContent(false);
                const defaultZoom = 1.3;
                setZoom(defaultZoom);
                await renderPageWithZoom(1, pdf, defaultZoom);
                return;
              } catch (blobErr) {
                console.error('Failed to load PDF from stored blob URL:', blobErr);
                // Blob URLs are volatile and can expire on refresh; guide user back to source
                const sourcePath = sessionStorage.getItem('pdf_source_path');
                alert('This PDF has expired due to a page refresh. You will be redirected to regenerate the report.');
                if (sourcePath) {
                  navigate(sourcePath);
                }
                return;
              }
            }
            // Validate that this is a PDF data URI
            if (!storedValue.startsWith('data:application/pdf')) {
              console.error('Invalid stored value format for PDF. Expected PDF data URI or blob URL, got:', storedValue.substring(0, 50) + '...');
              alert('Invalid certificate format. The file is not a valid PDF.');
              return;
            }
            
            console.log('Valid PDF data URI found, processing...');
            
            // Convert data URI to ArrayBuffer for PDF.js
            const base64Data = storedValue.split(',')[1];
            if (!base64Data) {
              console.error('No base64 data found in PDF data URI');
              alert('Invalid certificate data. The file appears to be corrupted.');
              return;
            }
            
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const arrayBuffer = bytes.buffer;
            console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
            
            // Load PDF with PDF.js
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            console.log('PDF loaded successfully, pages:', pdf.numPages);
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
            setIsHtmlContent(false);
            
            // Set default zoom to 130% as requested
            const defaultZoom = 1.3;
            setZoom(defaultZoom);
            
            // Render first page at 130% zoom
            await renderPageWithZoom(1, pdf, defaultZoom);
          }
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }

    loadPDF();
  }, [fileName]);

  // Render page function
  const renderPage = async (pageNumber: number, pdf?: any) => {
    const pdfDocument = pdf || pdfDoc;
    if (!pdfDocument || !canvasRef.current) return;

    setIsRendering(true);

    try {
      // Get page
      const page = await pdfDocument.getPage(pageNumber);
      
      // Set viewport scale and handle page-level rotation metadata
      const pageRotation = (page as any).rotate || 0;
      const normalizedRotation = ((pageRotation % 360) + 360) % 360;
      const viewport = page.getViewport({ scale: zoom, rotation: normalizedRotation });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Cannot get canvas context');
      }

      // Set canvas dimensions with device pixel ratio for crisp rendering
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Render PDF page into canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        // Scale drawing operations to match pixel ratio
      };
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if ((renderTaskRef as any)?.current) {
        try { (renderTaskRef as any).current.cancel(); } catch {}
        (renderTaskRef as any).current = null;
      }
      const task = page.render(renderContext);
      (renderTaskRef as any).current = task;
      try {
        await task.promise;
      } catch (e) {
        (renderTaskRef as any).current = null;
        setIsRendering(false);
        return;
      }
      (renderTaskRef as any).current = null;
      // Neutralize any global CSS rotation with highest priority
      try {
        canvas.style.setProperty('transform', 'none', 'important');
        canvas.style.setProperty('transform-origin', 'center center', 'important');
        if (contentRef.current) {
          contentRef.current.style.setProperty('transform', 'none', 'important');
          contentRef.current.style.setProperty('transform-origin', 'center center', 'important');
        }
        document.body.classList.remove('pdf-landscape');
      } catch {}

      setIsRendering(false);
    } catch (error) {
      console.error('Error rendering page:', error);
      setIsRendering(false);
    }
  };

  // Render page with specific zoom level
  const renderPageWithZoom = async (pageNumber: number, pdf?: any, zoomLevel?: number) => {
    const pdfDocument = pdf || pdfDoc;
    const currentZoom = zoomLevel !== undefined ? zoomLevel : zoom;
    if (!pdfDocument || !canvasRef.current) return;

    setIsRendering(true);

    try {
      // Get page
      const page = await pdfDocument.getPage(pageNumber);
      
      // Set viewport scale with specific zoom and handle page-level rotation metadata
      const pageRotation = (page as any).rotate || 0;
      const normalizedRotation = ((pageRotation % 360) + 360) % 360;
      const viewport = page.getViewport({ scale: currentZoom, rotation: normalizedRotation });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Cannot get canvas context');
      }

      // Set canvas dimensions with device pixel ratio for crisp rendering
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Render PDF page into canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        // Scale drawing operations to match pixel ratio
      };
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      
      if ((renderTaskRef as any)?.current) {
        try { (renderTaskRef as any).current.cancel(); } catch {}
        (renderTaskRef as any).current = null;
      }
      const task = page.render(renderContext);
      (renderTaskRef as any).current = task;
      try {
        await task.promise;
      } catch (e) {
        (renderTaskRef as any).current = null;
        setIsRendering(false);
        return;
      }
      (renderTaskRef as any).current = null;
      // Neutralize any global CSS rotation with highest priority
      try {
        canvas.style.setProperty('transform', 'none', 'important');
        canvas.style.setProperty('transform-origin', 'center center', 'important');
        if (contentRef.current) {
          contentRef.current.style.setProperty('transform', 'none', 'important');
          contentRef.current.style.setProperty('transform-origin', 'center center', 'important');
        }
        document.body.classList.remove('pdf-landscape');
      } catch {}

      setIsRendering(false);
    } catch (error) {
      console.error('Error rendering page:', error);
      setIsRendering(false);
    }
  };

  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      renderPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      renderPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoom + 0.2, 3.0);
    setZoom(newZoom);
    renderPage(currentPage);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 0.2, 0.5);
    setZoom(newZoom);
    renderPage(currentPage);
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      renderPage(pageNumber);
    }
  };

  const openEmailModal = () => {
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
  };

  const sendEmail = async (recipientEmail: string, message?: string) => {
    const decodedFileName = decodeURIComponent(fileName);
    if (!pdfDoc || !decodedFileName) return;

    setEmailSending(true);
    
    try {
      // First, automatically download the PDF
      const dataUri = sessionStorage.getItem(decodedFileName);
      if (dataUri) {
        // Create download link
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `${getDisplayTitle(fileName)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Extract department name and report details from filename
      // Format: DepartmentName_ReportType_Date.pdf
      const cleanFileName = fileName.replace(/^pdf_/, '').replace(/\.pdf$/, '');
      const parts = cleanFileName.split('_');
      
      let departmentName = 'Emergency Services';
      let reportTitle = getDisplayTitle(fileName).replace(/\.pdf$/i, '');
      let reportDate = new Date().toLocaleDateString();
      
      if (parts.length >= 3) {
        // Reconstruct department name (may have been sanitized)
        departmentName = parts.slice(0, -2).join(' ').replace(/[^a-zA-Z\s]/g, ' ').trim();
        
        // Get the actual report title from the display title, removing department and date
        const displayTitle = getDisplayTitle(fileName);
        const titleParts = displayTitle.split(' ');
        
        // Extract report title (everything except the last part which is typically the date)
        if (titleParts.length >= 2) {
          reportTitle = titleParts.slice(0, -1).join(' ').trim();
        } else {
          reportTitle = displayTitle;
        }
        
        // Extract date from the last part
        reportDate = parts[parts.length - 1] || new Date().toLocaleDateString();
        
        // Format date properly
        if (reportDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dateObj = new Date(reportDate);
          reportDate = dateObj.toLocaleDateString();
        }
      }

      // Format subject line: Report Name + Date
      const subject = encodeURIComponent(`${reportTitle} - ${reportDate}`);
      
      // Format message with professional template
      const formattedMessage = `Document Details:
Transmitted: ${new Date().toLocaleString()}

Dear Recipient,

Please find the ${reportTitle} attached. This document has been transmitted to you as part of our Emergency Services documentation and compliance requirements.

If you have any questions regarding this document, please contact us by replying to this email.

Best regards,
The VirtualFireHouse Team`;
      
      const body = encodeURIComponent(formattedMessage);
      
      // Open email client with prefilled information
      window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      
      // Show success message with clear instructions
      setTimeout(() => {
        alert('PDF Download Complete!\n\n' +
              '✅ PDF automatically downloaded\n' +
              '📧 Email client opened\n' +
              '📎 Please attach the downloaded PDF file to your email\n\n' +
              'Location: Usually in your Downloads folder');
        closeEmailModal();
        setEmailSending(false);
      }, 1500);
    } catch (error) {
      console.error('Error preparing email:', error);
      alert('Failed to prepare email. Please try again.');
      setEmailSending(false);
    }
  };

  const downloadPDF = () => {
    const decodedFileName = decodeURIComponent(fileName);
    if (!decodedFileName) return;

    try {
      // Get data from sessionStorage
      const storedValue = sessionStorage.getItem(decodedFileName);
      if (!storedValue) {
        alert('Document data not found. Please regenerate the document.');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = storedValue;
      link.download = `${getDisplayTitle(fileName)}${isHtmlContent ? '.html' : '.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const printPDF = () => {
    const decodedFileName = decodeURIComponent(fileName);
    if (!decodedFileName) return;

    try {
      // Get data from sessionStorage
      const storedValue = sessionStorage.getItem(decodedFileName);
      if (!storedValue) {
        alert('Document data not found. Please regenerate the document.');
        return;
      }

      if (isHtmlContent) {
        // For HTML content, open in new window for printing
        const printWindow = window.open(storedValue, '_blank');
        if (!printWindow) {
          alert('Please allow pop-ups to print the document.');
          return;
        }

        // Auto-print when window loads
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Close after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }, 1000);
        };
      } else {
        // For PDF content, handle both Blob URLs and data URIs
        if (storedValue.startsWith('blob:')) {
          const printWindow = window.open(storedValue, '_blank');
          if (!printWindow) {
            alert('Please allow pop-ups to print the document.');
            return;
          }
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }, 1000);
          };
        } else if (storedValue.startsWith('data:application/pdf')) {
          // Convert data URI to blob for printing
          const base64Data = storedValue.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          const printWindow = window.open(blobUrl, '_blank');
          if (!printWindow) {
            alert('Please allow pop-ups to print the document.');
            URL.revokeObjectURL(blobUrl);
            return;
          }
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                printWindow.close();
              }, 1000);
            }, 1000);
          };
        } else {
          alert('Invalid PDF format. Please regenerate the document.');
        }
      }
    } catch (error) {
      console.error('Error printing document:', error);
      alert('Failed to print document. Please try again.');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPreviousPage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNextPage();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, zoom, totalPages, pdfDoc]);

  // Window resize listener to recalculate optimal zoom
  useEffect(() => {
    if (!pdfDoc) return;

    const handleResize = async () => {
      const optimalZoom = await calculateFitToViewportZoom(pdfDoc, currentPage);
      setZoom(optimalZoom);
      await renderPageWithZoom(currentPage, pdfDoc, optimalZoom);
    };

    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [pdfDoc, currentPage]);

  if (!fileName) {
    return (
      <ViewerContainer>
        <ErrorMessage>
          <div>Invalid PDF path provided.</div>
        </ErrorMessage>
      </ViewerContainer>
    );
  }

  return (
    <ViewerContainer>
      {/* Hidden toolbar for functionality access - Hidden */}
      <HiddenToolbar style={{ display: 'none' }}>
        <ToolbarSection>
          <div style={{ color: 'white', fontSize: '16px' }}>
            {getDisplayTitle(fileName || '')}
          </div>
        </ToolbarSection>
      </HiddenToolbar>

      {/* PDF Controls */}
      <PDFControls>
        <ControlButton onClick={goToPreviousPage} disabled={currentPage <= 1 || isRendering}>
          ← Previous
        </ControlButton>
        
        <PageInfo>
          {isHtmlContent ? 'Generated Report' : `Page ${currentPage} of ${totalPages}`}
        </PageInfo>
        
        <ControlButton onClick={goToNextPage} disabled={currentPage >= totalPages || isRendering}>
          Next →
        </ControlButton>

        <ZoomControls>
          <ControlButton onClick={zoomOut} disabled={zoom <= 0.5 || isRendering}>
            🔍-
          </ControlButton>
          <span style={{ color: 'white', fontSize: '14px' }}>
            {Math.round(zoom * 100)}%
          </span>
          <ControlButton onClick={zoomIn} disabled={zoom >= 3.0 || isRendering}>
            🔍+
          </ControlButton>
        </ZoomControls>

        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', height: '20px', margin: '0 8px' }}></div>

        <ControlButton onClick={downloadPDF} disabled={(!pdfDoc && !isHtmlContent) || isRendering}>
          💾 Download
        </ControlButton>
        
        <ControlButton onClick={printPDF} disabled={(!pdfDoc && !isHtmlContent) || isRendering}>
          🖨️ Print
        </ControlButton>
        
        <ControlButton onClick={openEmailModal} disabled={(!pdfDoc && !isHtmlContent) || isRendering}>
          📧 Email
        </ControlButton>
      </PDFControls>

      {/* PDF Content */}
      <ContentArea ref={contentRef}>
        {isHtmlContent ? (
          // HTML content viewer
          <iframe
            src={htmlContent || ''}
            style={{
              width: '100%',
              /* Expand naturally and use page scroll */
              height: 'auto',
              border: 'none',
              background: 'white'
            }}
            title="Generated Report"
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          // PDF viewer
          <>
            <PDFCanvas 
              ref={canvasRef}
              style={{ 
                display: isRendering ? 'none' : 'block',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            {isRendering && (
              <div style={{ color: '#333', fontSize: '16px' }}>
                Rendering page {currentPage}...
              </div>
            )}
          </>
        )}
      </ContentArea>

      {/* Email Modal */}
      <div style={{
        display: showEmailModal ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>Email Document</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
              Recipient Email *
            </label>
            <input
              type="email"
              placeholder="Enter recipient email address"
              id="recipientEmail"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
              Message (Optional)
            </label>
            <textarea
              placeholder="Add a message to include with the email..."
              id="emailMessage"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '100px',
                marginBottom: '20px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={closeEmailModal}
              style={{
                background: '#6c757d',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                const recipientEmail = (document.getElementById('recipientEmail') as HTMLInputElement)?.value;
                const message = (document.getElementById('emailMessage') as HTMLTextAreaElement)?.value;
                
                if (!recipientEmail) {
                  alert('Please enter a recipient email address.');
                  return;
                }
                
                sendEmail(recipientEmail, message);
              }}
              disabled={emailSending}
              style={{
                background: emailSending ? '#6c757d' : '#007bff',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: emailSending ? 'not-allowed' : 'pointer',
                flex: 1
              }}
            >
              {emailSending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </ViewerContainer>
  );
};
