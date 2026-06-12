export type ColorblindType =
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'protanomaly'
  | 'deuteranomaly';

export type ColorMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export interface ColorblindOption {
  value: ColorblindType;
  label: string;
  description: string;
  prevalence: string;
}

export interface ImageState {
  file: File | null;
  url: string | null;
  originalData: ImageData | null;
  width: number;
  height: number;
}

export interface ProcessedCache {
  [key: string]: ImageData;
}

export type ViewMode = 'split' | 'original' | 'processed';

export interface ToolbarActions {
  onReset: () => void;
  onDownload: () => void;
  onToggleMode: () => void;
  viewMode: ViewMode;
  hasImage: boolean;
}
