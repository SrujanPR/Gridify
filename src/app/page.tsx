
'use client';

import { useState, useEffect } from 'react';
import GridControls from '@/components/GridControls';
import GridDisplay from '@/components/GridDisplay';
import CodeOutput from '@/components/CodeOutput';
import type { GridItemType } from '@/types';
import { LayoutDashboard, Settings, Code2 } from 'lucide-react'; // Icons for panels
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  // Futuristic colors: prefer blues, cyans, purples, greens. Avoid warm colors if possible.
  // Use HSL for better control: S between 70-100, L between 40-60 for vibrant but not too light/dark
  const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
  const lightness = Math.floor(Math.random() * 20) + 40;  // 40-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


export default function HomePage() {
  const [numCols, setNumCols] = useState(12);
  const [numRows, setNumRows] = useState(8);
  const [gapSize, setGapSize] = useState(10);
  const [gridItems, setGridItems] = useState<GridItemType[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // State for panel visibility on smaller screens
  const [activePanel, setActivePanel] = useState<'controls' | 'grid' | 'code'>('grid');


  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddItem = (row: number, col: number) => {
    const newItemId = crypto.randomUUID();
    const newItem: GridItemType = {
      id: newItemId,
      gridColumnStart: col,
      gridColumnEnd: col + 1,
      gridRowStart: row,
      gridRowEnd: row + 1,
      content: `Item ${gridItems.length + 1}`,
      backgroundColor: generateRandomColor(),
    };
    setGridItems((prevItems) => [...prevItems, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<GridItemType>) => {
    setGridItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setGridItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <h1 className="text-4xl font-headline text-primary animate-pulse">Gridify</h1>
      </div>
    );
  }

  const PanelNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-2 flex justify-around z-50">
      <TooltipProvider>
        {[
          { id: 'controls', label: 'Controls', icon: Settings },
          { id: 'grid', label: 'Grid', icon: LayoutDashboard },
          { id: 'code', label: 'Code', icon: Code2 },
        ].map(panel => (
          <Tooltip key={panel.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === panel.id ? "default" : "ghost"}
                size="icon"
                onClick={() => setActivePanel(panel.id as 'controls' | 'grid' | 'code')}
                className={activePanel === panel.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                aria-label={`Show ${panel.label}`}
              >
                <panel.icon className={`h-5 w-5 ${activePanel === panel.id ? '' : 'icon-glow'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{panel.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground p-4 md:p-6 lg:p-8 relative">
      <header className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-headline text-primary tracking-wider" style={{textShadow: '0 0 10px hsl(var(--primary))'}}>
          Gridify
        </h1>
        <p className="text-lg md:text-xl text-accent font-body mt-2">
          Craft your perfect CSS grid layout with precision.
        </p>
      </header>

      <main className="flex-grow flex flex-col gap-6 md:gap-8 pb-16 md:pb-0">
        {/* Controls Panel */}
        <aside className={`${activePanel === 'controls' ? 'block' : 'hidden'} md:block w-full`}>
          <GridControls
            numCols={numCols}
            setNumCols={setNumCols}
            numRows={numRows}
            setNumRows={setNumRows}
            gapSize={gapSize}
            setGapSize={setGapSize}
          />
        </aside>

        {/* Grid Display Area */}
        <section className={`${activePanel === 'grid' ? 'block' : 'hidden'} md:block w-full flex flex-col`}>
          <GridDisplay
            numCols={numCols}
            numRows={numRows}
            gapSize={gapSize}
            gridItems={gridItems}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        </section>

        {/* Code Output Panel */}
        <aside className={`${activePanel === 'code' ? 'block' : 'hidden'} md:block w-full`}>
          <CodeOutput
            numCols={numCols}
            numRows={numRows}
            gapSize={gapSize}
            gridItems={gridItems}
          />
        </aside>
      </main>
      <PanelNav />
    </div>
  );
}
