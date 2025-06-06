export interface GridItemType {
  id: string;
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  content: string;
  backgroundColor: string;
}

export interface DragDataType {
  itemId: string;
  offsetX: number;
  offsetY: number;
}
