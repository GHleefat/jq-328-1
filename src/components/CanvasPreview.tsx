import React, { useRef, useEffect } from 'react';
import { ColorblindType } from '@/types';
import { processImageData } from '@/utils/colorMatrix';

interface CanvasPreviewProps {
  imageData: ImageData | null;
  colorblindType: ColorblindType;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  imageData,
  colorblindType,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let displayData: ImageData;
    if (colorblindType === 'normal') {
      displayData = imageData;
    } else {
      displayData = processImageData(imageData, colorblindType);
    }

    canvasRef.current.width = displayData.width;
    canvasRef.current.height = displayData.height;
    ctx.putImageData(displayData, 0, 0);

    if (onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [imageData, colorblindType, onCanvasReady]);

  if (!imageData) {
    return null;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-dark-800 animate-fade-in">
      <div className="relative" style={{ aspectRatio: `${imageData.width} / ${imageData.height}` }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
