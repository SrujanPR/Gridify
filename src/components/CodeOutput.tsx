'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from 'lucide-react';
import type { GridItemType } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CodeOutputProps {
  numCols: number;
  numRows: number;
  gapSize: number;
  gridItems: GridItemType[];
}

const CodeOutput: React.FC<CodeOutputProps> = ({ numCols, numRows, gapSize, gridItems }) => {
  const { toast } = useToast();

  const generateHTML = () => {
    const itemsHTML = gridItems
      .map((item, index) => `  <div class="grid-item item-${index + 1}">${item.content}</div>`)
      .join('\n');
    return `<div class="grid-container">\n${itemsHTML}\n</div>`;
  };

  const generateCSS = () => {
    const containerCSS = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${numCols}, 1fr);
  grid-template-rows: repeat(${numRows}, 1fr); /* Adjust row height as needed e.g. auto or minmax(100px, auto) */
  gap: ${gapSize}px;
  /* Add width & height for the container as needed */
  /* Example: 
  width: 100%; 
  height: 500px; 
  */
}\n`;

    const itemsCSS = gridItems
      .map(
        (item, index) => `.grid-item.item-${index + 1} {
  grid-column: ${item.gridColumnStart} / ${item.gridColumnEnd};
  grid-row: ${item.gridRowStart} / ${item.gridRowEnd};
  background-color: ${item.backgroundColor}; /* Example background */
  border: 1px solid #ccc; /* Example border */
  padding: 10px; /* Example padding */
  display: flex;
  align-items: center;
  justify-content: center;
}`
      )
      .join('\n\n');

    return `${containerCSS}\n${itemsCSS}`;
  };

  const htmlCode = generateHTML();
  const cssCode = generateCSS();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} Copied!`,
        description: `${type} code has been copied to your clipboard.`,
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: `Could not copy ${type.toLowerCase()} code.`,
        variant: 'destructive',
      });
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Generated Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-input">
            <TabsTrigger value="html" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">HTML</TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">CSS</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="mt-4">
            <div className="relative">
              <Textarea
                readOnly
                value={htmlCode}
                className="h-64 bg-background text-foreground font-code text-sm border-border focus:ring-primary resize-none"
                aria-label="Generated HTML Code"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(htmlCode, 'HTML')}
                className="absolute top-2 right-2 text-accent hover:text-accent/80"
                aria-label="Copy HTML Code"
              >
                <Copy size={18} className="icon-glow-accent" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="css" className="mt-4">
            <div className="relative">
              <Textarea
                readOnly
                value={cssCode}
                className="h-64 bg-background text-foreground font-code text-sm border-border focus:ring-primary resize-none"
                aria-label="Generated CSS Code"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(cssCode, 'CSS')}
                className="absolute top-2 right-2 text-accent hover:text-accent/80"
                aria-label="Copy CSS Code"
              >
                <Copy size={18} className="icon-glow-accent" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeOutput;
