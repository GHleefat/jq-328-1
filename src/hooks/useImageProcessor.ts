import { useState, useCallback, useRef, useEffect } from 'react';
import { ColorblindType, ImageState, ProcessedCache } from '@/types';
import { loadImage, getImageData, drawImageData } from '@/utils/imageUtils';
import { processImageData } from '@/utils/colorMatrix';

export function useImageProcessor() {
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    url: null,
    originalData: null,
    width: 0,
    height: 0,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<ColorblindType>('normal');
  
  const processedCache = useRef<ProcessedCache>({});
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { imageData, colorblindType, matrix } = e.data;
          const data = new Uint8ClampedArray(imageData.data);
          
          if (colorblindType !== 'normal') {
            const length = data.length;
            for (let i = 0; i < length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              const newR = Math.min(255, Math.max(0, Math.round(
                matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b
              )));
              const newG = Math.min(255, Math.max(0, Math.round(
                matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b
              )));
              const newB = Math.min(255, Math.max(0, Math.round(
                matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b
              )));
              
              data[i] = newR;
              data[i + 1] = newG;
              data[i + 2] = newB;
            }
          }
          
          self.postMessage({
            data: Array.from(data),
            width: imageData.width,
            height: imageData.height,
            type: colorblindType,
          });
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      const img = await loadImage(file);
      const { imageData, width, height } = getImageData(img);
      
      const url = URL.createObjectURL(file);
      
      setImageState({
        file,
        url,
        originalData: imageData,
        width,
        height,
      });
      
      processedCache.current = {};
      setCurrentType('normal');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getProcessedData = useCallback(
    (type: ColorblindType): ImageData | null => {
      if (!imageState.originalData) return null;
      
      if (type === 'normal') {
        return imageState.originalData;
      }
      
      if (processedCache.current[type]) {
        return processedCache.current[type];
      }
      
      const processed = processImageData(imageState.originalData, type);
      processedCache.current[type] = processed;
      
      return processed;
    },
    [imageState.originalData]
  );

  const processWithWorker = useCallback(
    (type: ColorblindType, matrix: number[][]): Promise<ImageData | null> => {
      return new Promise((resolve) => {
        if (!imageState.originalData || !workerRef.current) {
          resolve(getProcessedData(type));
          return;
        }
        
        const handler = (e: MessageEvent) => {
          const { data, width, height } = e.data;
          const imageData = new ImageData(
            new Uint8ClampedArray(data),
            width,
            height
          );
          processedCache.current[type] = imageData;
          workerRef.current?.removeEventListener('message', handler);
          resolve(imageData);
        };
        
        workerRef.current.addEventListener('message', handler);
        workerRef.current.postMessage({
          imageData: imageState.originalData,
          colorblindType: type,
          matrix,
        });
      });
    },
    [imageState.originalData, getProcessedData]
  );

  const drawToCanvas = useCallback(
    (canvas: HTMLCanvasElement, type: ColorblindType) => {
      const processedData = getProcessedData(type);
      if (processedData) {
        drawImageData(canvas, processedData);
      }
    },
    [getProcessedData]
  );

  const reset = useCallback(() => {
    if (imageState.url) {
      URL.revokeObjectURL(imageState.url);
    }
    setImageState({
      file: null,
      url: null,
      originalData: null,
      width: 0,
      height: 0,
    });
    processedCache.current = {};
    setCurrentType('normal');
    setError(null);
  }, [imageState.url]);

  return {
    imageState,
    isProcessing,
    error,
    currentType,
    setCurrentType,
    handleFileUpload,
    getProcessedData,
    processWithWorker,
    drawToCanvas,
    reset,
  };
}
