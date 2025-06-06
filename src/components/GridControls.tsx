
'use client';

import type React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GridControlsProps {
  numCols: number;
  setNumCols: (value: number) => void;
  numRows: number;
  setNumRows: (value: number) => void;
  gapSize: number;
  setGapSize: (value: number) => void;
}

const GridControls: React.FC<GridControlsProps> = ({
  numCols,
  setNumCols,
  numRows,
  setNumRows,
  gapSize,
  setGapSize,
}) => {
  const handleIntegerChange = (setter: (value: number) => void, min: number, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      setter(value);
    } else if (e.target.value === '') {
      // Allow empty input temporarily, or handle as needed (e.g., set to min)
    }
  };
  
  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Grid Configuration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="flex-1 space-y-2">
          <Label htmlFor="numCols" className="text-accent font-body">Columns</Label>
          <Input
            id="numCols"
            type="number"
            value={numCols}
            onChange={handleIntegerChange(setNumCols, 1, 100)}
            min="1"
            max="100"
            className="bg-input text-foreground border-border focus:ring-primary"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="numRows" className="text-accent font-body">Rows</Label>
          <Input
            id="numRows"
            type="number"
            value={numRows}
            onChange={handleIntegerChange(setNumRows, 1, 100)}
            min="1"
            max="100"
            className="bg-input text-foreground border-border focus:ring-primary"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="gapSize" className="text-accent font-body">Gap Size (px)</Label>
          <Input
            id="gapSize"
            type="number"
            value={gapSize}
            onChange={handleIntegerChange(setGapSize, 0, 50)}
            min="0"
            max="50"
            className="bg-input text-foreground border-border focus:ring-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GridControls;
