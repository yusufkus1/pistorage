import { useState } from 'react';

function getTypeStyle(name, isDirectory) {
  if (isDirectory) return { bg: '#FEF9C3', color: '#CA8A04', label: 'KLS' };
  const ext = name.split('.').pop().toLowerCase();
  const label = ext.length > 4 ? ext.slice(0, 4).toUpperCase() : ext.toUpperCase();

  if (['jpg','jpeg','png','gif','webp','svg','bmp','heic'].includes(ext))
    return { bg: '#DCFCE7', color: '#16A34A', label };
  if (['mp4','mkv','avi','mov','wmv','flv','webm'].includes(ext))
    return { bg: '#EDE9FE', color: '#7C3AED', label };
  if (['mp3','wav','flac','aac','ogg','m4a'].includes(ext))
    return { bg: '#FCE7F3', color: '#DB2777', label };
  if (['pdf'].includes(ext))
    return { bg: '#FEE2E2', color: '#DC2626', label };
  if (['zip','rar','tar','gz','7z'].includes(ext))
    return { bg: '#FFEDD5', color: '#EA580C', label };
  if (['js','jsx','ts','tsx','py','go','rs','java','html','css','json'].includes(ext))
    return { bg: '#DBEAFE', color: '#2563EB', label };
  if (['doc','docx','txt','md','csv','xls','xlsx','ppt','pptx'].includes(ext))
    return { bg: '#E0F2FE', color: '#0284C7', label };
  return { bg: '#F1F5F9', color: '#64748B', label };
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Bugün';
  if (diff < 172800000) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function FileItem({ file, draggingItem, onNavigate, onMove, onDelete, onDownload, onUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const { bg, color, label } = getTypeStyle(file.name, file.isDirectory);

  const handleDragStart = (e) => {
    draggingItem.current = file.path;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.path);
  };
  const handleDragEnd = () => { draggingItem.current = null; };
  const handleDragOver = (e) => {
    if (!file.isDirectory || draggingItem.current === file.path) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => { e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e) => {
    if (!file.isDirectory) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0 && !draggingItem.current) {
      onUpload(file.path, e.dataTransfer.files);
    } else if (draggingItem.current && draggingItem.current !== file.path) {
      onMove(draggingItem.current, file.path);
      draggingItem.current = null;
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => file.isDirectory && onNavigate(file.path)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`flex items-center gap-3 px-4 py-2.5 select-none transition-colors duration-75 border-b border-slate-100 last:border-0 ${
        file.isDirectory ? 'cursor-pointer' : 'cursor-default'
      } ${isDragOver ? 'bg-indigo-50' : isHover ? 'bg-slate-50' : 'bg-white'}`}
    >
      {/* Type badge */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold tracking-wide"
        style={{ backgroundColor: bg, color }}
      >
        {label}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
      </div>

      {/* Meta + Actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {!file.isDirectory && (
          <span className="text-xs text-slate-400 w-16 text-right tabular-nums">{formatSize(file.size)}</span>
        )}
        <span className="text-xs text-slate-400 w-12 text-right">{formatDate(file.modified)}</span>

        <div
          className={`flex items-center gap-0.5 transition-opacity duration-100 ${isHover ? 'opacity-100' : 'opacity-0'}`}
          onClick={e => e.stopPropagation()}
        >
          {!file.isDirectory && (
            <button
              onClick={() => onDownload(file.path)}
              title="İndir"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(file.path)}
            title="Sil"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
