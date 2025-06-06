'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { GridItemType, DragDataType } from '@/types';
import { cn } from '@/lib/utils';
import { X, Expand } from 'lucide-react';
import { Button } from './ui/button';

interface GridItemComponentProps {
  item: GridItemType;
  onUpdate: (id: string, updates: Partial<GridItemType>) => void;
  onRemove: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  numCols: number;
  numRows: number;
  cellWidth: number;
  cellHeight: number;
}

const GridItemComponent: React.FC<GridItemComponentProps> = ({
  item,
  onUpdate,
  onRemove,
  containerRef,
  numCols,
  numRows,
  cellWidth,
  cellHeight,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    initialMouseX: number;
    initialMouseY: number;
    originalColEnd: number;
    originalRowEnd: number;
  } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const dragData: DragDataType = {
      itemId: item.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent drag when starting resize
    setIsResizing(true);
    resizeRef.current = {
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      originalColEnd: item.gridColumnEnd,
      originalRowEnd: item.gridRowEnd,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current || !containerRef.current) return;

      const { initialMouseX, initialMouseY, originalColEnd, originalRowEnd } = resizeRef.current;
      
      const deltaX = e.clientX - initialMouseX;
      const deltaY = e.clientY - initialMouseY;

      const colChange = Math.round(deltaX / cellWidth);
      const rowChange = Math.round(deltaY / cellHeight);

      let newColEnd = originalColEnd + colChange;
      let newRowEnd = originalRowEnd + rowChange;

      newColEnd = Math.max(item.gridColumnStart + 1, Math.min(newColEnd, numCols + 1));
      newRowEnd = Math.max(item.gridRowStart + 1, Math.min(newRowEnd, numRows + 1));
      
      if (newColEnd !== item.gridColumnEnd || newRowEnd !== item.gridRowEnd) {
        onUpdate(item.id, { gridColumnEnd: newColEnd, gridRowEnd: newRowEnd });
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        resizeRef.current = null;
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, item, onUpdate, cellWidth, cellHeight, numCols, numRows, containerRef]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'group/item relative p-2 border text-foreground shadow-lg transition-all duration-150 ease-out select-none overflow-hidden',
        isResizing ? 'cursor-nwse-resize' : 'cursor-grab',
      )}
      style={{
        gridColumnStart: item.gridColumnStart,
        gridColumnEnd: item.gridColumnEnd,
        gridRowStart: item.gridRowStart,
        gridRowEnd: item.gridRowEnd,
        backgroundColor: item.backgroundColor,
        borderColor: 'hsl(var(--primary))',
        boxShadow: `0 0 10px hsl(var(--primary) / 0.5), inset 0 0 5px hsl(var(--primary) / 0.3)`,
      }}
      aria-label={`Grid item ${item.content}`}
    >
      <div className="flex justify-between items-start h-full">
        <span className="text-sm font-medium truncate">{item.content}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag
            onRemove(item.id);
          }}
          className="absolute top-1 right-1 opacity-50 group-hover/item:opacity-100 transition-opacity w-6 h-6 text-destructive hover:text-destructive/80"
          aria-label={`Remove ${item.content}`}
        >
          <X size={16} />
        </Button>
      </div>

      <div
        onMouseDown={handleResizeMouseDown}
        className={cn(
          "absolute bottom-0 right-0 w-5 h-5 bg-primary/50 hover:bg-primary/80 cursor-nwse-resize rounded-tl-md flex items-center justify-center opacity-50 group-hover/item:opacity-100 transition-opacity",
        )}
        aria-label={`Resize ${item.content}`}
      >
        <Expand size={12} className="text-primary-foreground" />
      </div>
    </div>
  );
};

export default GridItemComponent;
