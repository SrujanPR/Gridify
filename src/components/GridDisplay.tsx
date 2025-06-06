'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { GridItemType, DragDataType } from '@/types';
import GridItemComponent from './GridItemComponent';
import { PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridDisplayProps {
  numCols: number;
  numRows: number;
  gapSize: number;
  gridItems: GridItemType[];
  onAddItem: (row: number, col: number) => void;
  onUpdateItem: (id: string, updates: Partial<GridItemType>) => void;
  onRemoveItem: (id: string) => void;
}

const GridDisplay: React.FC<GridDisplayProps> = ({
  numCols,
  numRows,
  gapSize,
  gridItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);

  useEffect(() => {
    const calculateCellDimensions = () => {
      if (gridContainerRef.current) {
        const { offsetWidth, offsetHeight } = gridContainerRef.current;
        const totalGapWidth = (numCols - 1) * gapSize;
        const totalGapHeight = (numRows - 1) * gapSize;
        
        setCellWidth(Math.max(10, (offsetWidth - totalGapWidth) / numCols)); // Ensure min width
        setCellHeight(Math.max(10, (offsetHeight - totalGapHeight) / numRows)); // Ensure min height
      }
    };

    calculateCellDimensions();
    const resizeObserver = new ResizeObserver(calculateCellDimensions);
    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }
    
    window.addEventListener('resize', calculateCellDimensions);

    return () => {
      if (gridContainerRef.current) {
        resizeObserver.unobserve(gridContainerRef.current);
      }
      window.removeEventListener('resize', calculateCellDimensions);
    };
  }, [numCols, numRows, gapSize]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!gridContainerRef.current) return;

    const dragDataString = e.dataTransfer.getData('application/json');
    if (!dragDataString) return;
    
    const dragData: DragDataType = JSON.parse(dragDataString);
    const { itemId, offsetX, offsetY } = dragData;

    const item = gridItems.find(i => i.id === itemId);
    if (!item) return;

    const gridRect = gridContainerRef.current.getBoundingClientRect();
    const dropX = e.clientX - gridRect.left;
    const dropY = e.clientY - gridRect.top;

    // Adjust drop position based on where the item was grabbed
    const itemEffectiveTopLeftX = dropX - offsetX;
    const itemEffectiveTopLeftY = dropY - offsetY;

    let targetCol = Math.floor(itemEffectiveTopLeftX / (cellWidth + gapSize / numCols)) + 1; // Approximate
    let targetRow = Math.floor(itemEffectiveTopLeftY / (cellHeight + gapSize / numRows)) + 1; // Approximate

    // More precise calculation taking into account cell widths and gaps
    targetCol = Math.max(1, Math.min(numCols, Math.round(itemEffectiveTopLeftX / (cellWidth + (gapSize * (numCols-1)/numCols) )) +1 ));
    targetRow = Math.max(1, Math.min(numRows, Math.round(itemEffectiveTopLeftY / (cellHeight + (gapSize * (numRows-1)/numRows) )) +1 ));


    const colSpan = item.gridColumnEnd - item.gridColumnStart;
    const rowSpan = item.gridRowEnd - item.gridRowStart;

    let newColStart = Math.max(1, Math.min(targetCol, numCols - colSpan + 1));
    let newRowStart = Math.max(1, Math.min(targetRow, numRows - rowSpan + 1));
    
    const newColEnd = newColStart + colSpan;
    const newRowEnd = newRowStart + rowSpan;

    onUpdateItem(itemId, {
      gridColumnStart: newColStart,
      gridColumnEnd: newColEnd,
      gridRowStart: newRowStart,
      gridRowEnd: newRowEnd,
    });
  };

  const renderAddButtons = () => {
    const buttons = [];
    const occupiedCells = new Set<string>();

    gridItems.forEach(item => {
      for (let r = item.gridRowStart; r < item.gridRowEnd; r++) {
        for (let c = item.gridColumnStart; c < item.gridColumnEnd; c++) {
          occupiedCells.add(`${r}-${c}`);
        }
      }
    });

    for (let r = 1; r <= numRows; r++) {
      for (let c = 1; c <= numCols; c++) {
        if (!occupiedCells.has(`${r}-${c}`)) {
          buttons.push(
            <button
              key={`add-${r}-${c}`}
              onClick={() => onAddItem(r, c)}
              className="border border-dashed border-accent/30 hover:bg-accent/10 transition-colors duration-150 flex items-center justify-center group"
              style={{
                gridRowStart: r,
                gridColumnStart: c,
                gridRowEnd: r + 1,
                gridColumnEnd: c + 1,
              }}
              aria-label={`Add item at row ${r}, column ${c}`}
            >
              <PlusSquare size={24} className="text-accent/50 group-hover:text-accent icon-glow-accent" />
            </button>
          );
        }
      }
    }
    return buttons;
  };
  
  return (
    <div
      ref={gridContainerRef}
      className="w-full h-full bg-background border border-border rounded-lg shadow-inner p-2 overflow-auto relative"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        gap: `${gapSize}px`,
        minHeight: '400px', // Ensure a minimum height for the grid
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {gridItems.map((item) => (
        <GridItemComponent
          key={item.id}
          item={item}
          onUpdate={onUpdateItem}
          onRemove={onRemoveItem}
          containerRef={gridContainerRef}
          numCols={numCols}
          numRows={numRows}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
      ))}
      {cellWidth > 0 && cellHeight > 0 && renderAddButtons()}
    </div>
  );
};

export default GridDisplay;
