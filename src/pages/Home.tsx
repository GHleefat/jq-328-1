import React, { useState, useCallback, useRef } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { ColorblindSelector } from '@/components/ColorblindSelector';
import { SplitCompare } from '@/components/SplitCompare';
import { CanvasPreview } from '@/components/CanvasPreview';
import { Toolbar } from '@/components/Toolbar';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { ColorblindType, ViewMode } from '@/types';
import { downloadImage } from '@/utils/imageUtils';
import { COLORBLIND_OPTIONS } from '@/utils/colorMatrix';

export default function Home() {
  const {
    imageState,
    isProcessing,
    error,
    currentType,
    setCurrentType,
    handleFileUpload,
    reset,
  } = useImageProcessor();

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleTypeChange = useCallback((type: ColorblindType) => {
    setCurrentType(type);
  }, [setCurrentType]);

  const handleToggleMode = useCallback(() => {
    setViewMode(prev => {
      if (prev === 'split') return 'original';
      if (prev === 'original') return 'processed';
      return 'split';
    });
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = viewMode === 'original' ? originalCanvasRef.current : processedCanvasRef.current;
    if (canvas) {
      const typeOption = COLORBLIND_OPTIONS.find(opt => opt.value === currentType);
      const suffix = viewMode === 'original' ? 'original' : typeOption?.value || 'processed';
      downloadImage(canvas, `colorblind-${suffix}.png`);
    }
  }, [viewMode, currentType]);

  const handleCanvasReady = useCallback((original: HTMLCanvasElement, processed: HTMLCanvasElement) => {
    originalCanvasRef.current = original;
    processedCanvasRef.current = processed;
  }, []);

  const handleSingleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    if (viewMode === 'original') {
      originalCanvasRef.current = canvas;
    } else {
      processedCanvasRef.current = canvas;
    }
  }, [viewMode]);

  const hasImage = !!imageState.originalData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-800 via-dark-700 to-dark-800 noise-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6 animate-bounce-in">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-accent-500">无障碍设计工具</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4">
            <span className="text-dark-100">色盲</span>
            <span className="text-gradient">友好检查器</span>
          </h1>
          
          <p className="text-lg text-dark-400 max-w-2xl mx-auto leading-relaxed">
            上传设计稿或截屏，实时模拟不同色盲类型用户看到的效果，
            帮助你优化配色方案，让产品对所有人都友好。
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-accent-500" />
                </div>
                选择色盲类型
              </h2>
              
              <ColorblindSelector
                value={currentType}
                onChange={handleTypeChange}
                disabled={!hasImage}
              />

              {hasImage && currentType !== 'normal' && (
                <div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 animate-fade-in">
                  <p className="text-sm text-primary-400">
                    💡 <span className="font-medium">提示：</span>拖动中间的分割线可以对比原图和模拟效果的差异。
                  </p>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-lg font-semibold text-dark-100 mb-4">操作工具</h2>
              <Toolbar
                onReset={reset}
                onDownload={handleDownload}
                onToggleMode={handleToggleMode}
                viewMode={viewMode}
                hasImage={hasImage}
              />
            </div>

            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-lg font-semibold text-dark-100 mb-4">关于色盲</h2>
              <div className="space-y-3 text-sm text-dark-400">
                <p>
                  <span className="font-medium text-dark-200">红绿色盲</span> 是最常见的类型，
                  约影响 8% 的男性和 0.5% 的女性。
                </p>
                <p>
                  <span className="font-medium text-dark-200">蓝黄色盲</span> 较为罕见，
                  男女患病率相近。
                </p>
                <p>
                  <span className="font-medium text-dark-200">全色盲</span> 非常罕见，
                  患者只能看到灰度。
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <ImageUploader
                onFileSelect={handleFileUpload}
                isProcessing={isProcessing}
                error={error}
                currentFile={imageState.file}
              />
            </div>

            {hasImage && (
              <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
                {viewMode === 'split' && (
                  <SplitCompare
                    originalData={imageState.originalData}
                    colorblindType={currentType}
                    onCanvasReady={handleCanvasReady}
                  />
                )}
                
                {viewMode === 'original' && (
                  <div>
                    <div className="mb-3 px-4 py-2 rounded-lg bg-dark-700/50 inline-block">
                      <span className="text-sm font-medium text-dark-300">📷 原始图片</span>
                    </div>
                    <CanvasPreview
                      imageData={imageState.originalData}
                      colorblindType="normal"
                      onCanvasReady={handleSingleCanvasReady}
                    />
                  </div>
                )}
                
                {viewMode === 'processed' && (
                  <div>
                    <div className="mb-3 px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/30 inline-block">
                      <span className="text-sm font-medium text-accent-500">👁️ 色盲模拟效果</span>
                    </div>
                    <CanvasPreview
                      imageData={imageState.originalData}
                      colorblindType={currentType}
                      onCanvasReady={handleSingleCanvasReady}
                    />
                  </div>
                )}
              </div>
            )}

            {!hasImage && (
              <div className="glass rounded-2xl p-8 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-accent-500" />
                </div>
                <h3 className="text-xl font-semibold text-dark-100 mb-2">开始检查</h3>
                <p className="text-dark-400 max-w-md mx-auto">
                  上传一张设计稿或截取屏幕，选择色盲类型，即可实时查看模拟效果。
                  所有处理都在浏览器本地完成，不会上传到服务器。
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-dark-600/50 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-dark-500">
            🔒 所有图片处理都在浏览器本地完成，保护您的隐私
          </p>
        </footer>
      </div>
    </div>
  );
}
