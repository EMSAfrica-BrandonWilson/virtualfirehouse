import React, { useState } from 'react';
import styled from 'styled-components';

interface SplitterProps {
  orientation: 'horizontal' | 'vertical';
  children: React.ReactNode[];
  sizes?: number[];
  minSizes?: number[];
  allowResize?: boolean;
  className?: string;
}

const SplitterContainer = styled.div<{ $orientation: string }>`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  background-color: #E1E1E1;
  /* Allow PDF content to maintain transforms while resetting others */
  transform: none !important;
  transform-origin: unset !important;
  
  /* Exception for PDF content */
  & .react-pdf__Page {
    transform-origin: center center !important;
  }
  
  & .react-pdf__Page canvas {
    transform-origin: center center !important;
  }
`;

const SplitterPane = styled.div<{ $size: number; $minSize?: number }>`
  flex: ${props => props.$size};
  min-width: ${props => props.$minSize ? `${props.$minSize}px` : 'auto'};
  min-height: ${props => props.$minSize ? `${props.$minSize}px` : 'auto'};
  overflow: auto;
  position: relative;
`;

const SplitterResizer = styled.div<{ $orientation: string }>`
  background: #CCCCCC;
  border: 1px solid #999999;
  cursor: ${props => props.$orientation === 'vertical' ? 'row-resize' : 'col-resize'};
  width: ${props => props.$orientation === 'vertical' ? '100%' : '4px'};
  height: ${props => props.$orientation === 'vertical' ? '4px' : '100%'};
  flex-shrink: 0;
  
  &:hover {
    background: #AAAAAA;
  }
`;

export const DevExpressSplitter: React.FC<SplitterProps> = ({
  orientation,
  children,
  sizes = [],
  minSizes = [],
  allowResize = true,
  className = ''
}) => {
  const [paneSizes] = useState(sizes.length ? sizes : children.map(() => 1));

  return (
    <SplitterContainer $orientation={orientation} className={className}>
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <SplitterPane 
            $size={paneSizes[index] || 1}
            $minSize={minSizes[index]}
          >
            {child}
          </SplitterPane>
          {index < children.length - 1 && allowResize && (
            <SplitterResizer $orientation={orientation} />
          )}
        </React.Fragment>
      ))}
    </SplitterContainer>
  );
};