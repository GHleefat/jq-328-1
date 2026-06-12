import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { ColorblindType } from '@/types';
import { processImageData } from '@/utils/colorMatrix';

interface SplitCompareProps {
  originalData: ImageData | null;
  colorblindType: ColorblindType;
  onCanvasReady?: (originalCanvas: HTMLCanvasElement, processedCanvas: HTMLCanvasElement) => void;
}

export const SplitCompare: React.FC<SplitCompareProps> = ({
  originalData,
  colorblindType,
  onCanvasReady,
}) => {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedData = useRef<ImageData | null>(null);

  useEffect(() => {
    if (originalData && originalCanvasRef.current) {
      const ctx = originalCanvasRef.current.getContext('2d');
      if (ctx) {
        originalCanvasRef.current.width = originalData.width;
        originalCanvasRef.current.height = originalData.height;
        ctx.putImageData(originalData, 0, 0);
      }
    }
  }, [originalData]);

  useEffect(() => {
    if (originalData && processedCanvasRef.current) {
      if (colorblindType === 'normal') {
        processedData.current = originalData;
      } else {
        processedData.current = processImageData(originalData, colorblindType);
      }
      
      const ctx = processedCanvasRef.current.getContext('2d');
      if (ctx && processedData.current) {
        processedCanvasRef.current.width = processedData.current.width;
        processedCanvasRef.current.height = processedData.current.height;
        ctx.putImageData(processedData.current, 0, 0);
      }
    }

    if (onCanvasReady && originalCanvasRef.current && processedCanvasRef.current) {
      onCanvasReady(originalCanvasRef.current, processedCanvasRef.current);
    }
  }, [originalData, colorblindType, onCanvasReady]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(percentage);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || e.touches.length === 0) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!originalData) {
    return (
      <div className="w-full h-96 rounded-2xl bg-dark-700/30 border border-dashed border-dark-500/30 flex items-center justify-center">
        <div className="text-center text-dark-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-600/50 flex items-center justify-center">
            <MoveHorizontal className="w-8 h-8" />
          </div>
          <p>上传图片后即可查看对比效果</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-dark-800 animate-fade-in select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <div className="relative" style={{ aspectRatio: `${originalData.width} / ${originalData.height}` }}>
        <canvas
          ref={originalCanvasRef}
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        <div
          className="absolute inset-y-0 right-0 overflow-hidden"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <canvas
            ref={processedCanvasRef}
            className="absolute top-0 right-0 h-full object-contain"
            style={{ width: `${100 * 100 / (100 - splitPosition)}%`, maxWidth: 'none' }}
          />
        </div>

        <div
          className="absolute inset-y-0 w-1 bg-accent-500 cursor-ew-resize z-10 group"
          style={{ left: `calc(${splitPosition}% - 2px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-12 h-12 rounded-full bg-accent-500 text-white
            flex items-center justify-center shadow-lg
            transition-all duration-200
            ${isDragging ? 'scale-110 shadow-accent-500/50' : 'scale-100 group-hover:scale-110'}
          `}>
            <MoveHorizontal className="w-5 h-5" />
          </div>

          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-accent-500/10 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-dark-800/80 backdrop-blur-sm text-sm font-medium text-dark-100 border border-dark-600/50">
          原图
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-accent-500/20 backdrop-blur-sm text-sm font-medium text-accent-500 border border-accent-500/30">
          模拟图
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-dark-800/80 backdrop-blur-sm text-xs text-dark-300 font-mono border border-dark-600/50">
          {Math.round(splitPosition)}% / {Math.round(100 - splitPosition)}%
        </div>
      </div>
    </div>
  );
};
