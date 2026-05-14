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
    // Only show overlay for desktop file drops, not in-app moves
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
      className="flex-1 overflow-y-auto p-4 bg-gray-50 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {uploadProgress !== null && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex justify-between text-sm text-blue-700 mb-1.5">
            <span>Yükleniyor...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-4 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-2">📂</div>
            <p className="text-blue-700 font-bold text-xl">Dosyaları buraya bırakın</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-4xl animate-spin">⏳</div>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
          <div className="text-5xl">📭</div>
          <p className="font-medium">Bu klasör boş</p>
          <p className="text-sm">Dosya yüklemek için sürükleyin veya "Yükle" butonuna tıklayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
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
