// Type declarations for @react-pdf-viewer/core components
declare module '@react-pdf-viewer/core' {
  import { ComponentType, ReactNode } from 'react';

  export interface WorkerProps {
    workerUrl: string;
    children: ReactNode;
  }

  export interface ViewerProps {
    fileUrl: string | File;
    plugins?: any[];
    renderError?: (props: any) => ReactNode;
    renderLoader?: (props: any) => ReactNode;
  }

  export const Worker: ComponentType<WorkerProps>;
  export const Viewer: ComponentType<ViewerProps>;
  
  // Add other exports as needed
  export interface DocumentLoadEvent {
    doc: any;
  }
  
  export interface PageChangeEvent {
    currentPage: number;
    totalPages: number;
  }
}