import React, { useCallback, useRef, useState } from 'react';
import { Upload, Monitor, Image as ImageIcon, X } from 'lucide-react';
import { isValidImageFile, captureScreen, blobToFile, formatFileSize } from '@/utils/imageUtils';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
  currentFile: File | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  isProcessing,
  error,
  currentFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (isValidImageFile(file)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (isValidImageFile(file)) {
          onFileSelect(file);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleScreenCapture = useCallback(async () => {
    const blob = await captureScreen();
    if (blob) {
      const file = blobToFile(blob, `screenshot-${Date.now()}.png`);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full animate-fade-in">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-accent-500 bg-accent-500/10 scale-[1.02]'
            : 'border-dark-500/50 hover:border-accent-500/50 hover:bg-dark-700/50'
          }
          ${isProcessing ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="relative p-8 md:p-12 text-center">
          {currentFile ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/20 animate-bounce-in">
                <ImageIcon className="w-8 h-8 text-accent-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-dark-100">{currentFile.name}</p>
                <p className="text-sm text-dark-400 font-mono">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-600 hover:bg-dark-500 text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                更换图片
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`
                inline-flex items-center justify-center w-20 h-20 rounded-2xl
                transition-all duration-300
                ${isDragging
                  ? 'bg-accent-500/30 scale-110'
                  : 'bg-dark-600/50'
                }
              `}>
                <Upload className={`w-10 h-10 transition-colors ${isDragging ? 'text-accent-500' : 'text-dark-300'}`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-dark-100">
                  上传设计稿或截屏
                </h3>
                <p className="text-dark-400 max-w-md mx-auto">
                  拖拽图片到此处，或点击浏览，支持 JPG、PNG、WebP 等格式
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScreenCapture();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-600 hover:bg-dark-500 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                >
                  <Monitor className="w-4 h-4" />
                  截取屏幕
                </button>
              </div>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-dark-200">正在处理图片...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};
