import { useState, useRef } from 'react';
import FileItem from './FileItem';

export default function FileGrid({
  files,
  currentPath,
  loading,
  error,
  uploadProgress,
  draggingItem,
  onNavigate,
  onUpload,
  onMove,
  onDelete,
  onDownload,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (!draggingItem.current && e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  };
  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0 && !draggingItem.current) {
      onUpload(currentPath, e.dataTransfer.files);
    }
  };

  return (
    <main
      className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="mx-4 mt-4 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-medium">Yükleniyor...</span>
            <span className="tabular-nums">{uploadProgress}%</span>
          </div>
          <div className="bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-indigo-500/5 border-2 border-dashed border-indigo-400 rounded-none flex items-center justify-center z-20 pointer-events-none m-3 rounded-xl">
          <div className="text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="text-indigo-700 font-semibold">Dosyaları buraya bırakın</p>
            <p className="text-indigo-500 text-sm mt-1">Mevcut klasöre yüklenecek</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm0-8a1 1 0 011 1v3a1 1 0 11-2 0V5a1 1 0 011-1z"/>
          </svg>
          {error}
        </div>
      )}

      {/* File list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span className="text-sm">Yükleniyor...</span>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <p className="font-medium text-slate-500">Bu klasör boş</p>
          <p className="text-sm text-slate-400">Dosya yüklemek için buraya sürükleyin</p>
        </div>
      ) : (
        <div className="m-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50">
            <div className="w-9 flex-shrink-0" />
            <div className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ad</div>
            <div className="w-16 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Boyut</div>
            <div className="w-12 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarih</div>
            <div className="w-16 flex-shrink-0" />
          </div>

          {files.map(file => (
            <FileItem
              key={file.path}
              file={file}
              draggingItem={draggingItem}
              onNavigate={onNavigate}
              onMove={onMove}
              onDelete={onDelete}
              onDownload={onDownload}
              onUpload={onUpload}
            />
          ))}
        </div>
      )}
    </main>
  );
}
