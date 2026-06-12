import React from 'react';
import { RotateCcw, Download, LayoutGrid, Image, Eye } from 'lucide-react';
import { ViewMode, ToolbarActions } from '@/types';

export const Toolbar: React.FC<ToolbarActions> = ({
  onReset,
  onDownload,
  onToggleMode,
  viewMode,
  hasImage,
}) => {
  const getModeIcon = () => {
    switch (viewMode) {
      case 'split':
        return <LayoutGrid className="w-4 h-4" />;
      case 'original':
        return <Image className="w-4 h-4" />;
      case 'processed':
        return <Eye className="w-4 h-4" />;
    }
  };

  const getModeLabel = () => {
    switch (viewMode) {
      case 'split':
        return '分屏对比';
      case 'original':
        return '仅原图';
      case 'processed':
        return '仅模拟图';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <button
        onClick={onToggleMode}
        disabled={!hasImage}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-200
          ${hasImage
            ? 'bg-dark-600/80 hover:bg-dark-500 text-dark-100 hover:scale-105 active:scale-95'
            : 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
          }
        `}
      >
        {getModeIcon()}
        {getModeLabel()}
      </button>

      <button
        onClick={onDownload}
        disabled={!hasImage}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-200
          ${hasImage
            ? 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white hover:scale-105 active:scale-95 shadow-lg shadow-accent-500/20'
            : 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
          }
        `}
      >
        <Download className="w-4 h-4" />
        下载模拟图
      </button>

      <button
        onClick={onReset}
        disabled={!hasImage}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-200
          ${hasImage
            ? 'bg-dark-600/80 hover:bg-red-500/20 text-dark-100 hover:text-red-400 hover:scale-105 active:scale-95'
            : 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
          }
        `}
      >
        <RotateCcw className="w-4 h-4" />
        重置
      </button>
    </div>
  );
};
