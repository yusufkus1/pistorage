import { useState } from 'react';

function getIcon(name, isDirectory) {
  if (isDirectory) return '📁';
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️', bmp: '🖼️', heic: '🖼️',
    mp4: '🎬', mkv: '🎬', avi: '🎬', mov: '🎬', wmv: '🎬', flv: '🎬', webm: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', ogg: '🎵', m4a: '🎵',
    pdf: '📕', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑',
    txt: '📄', md: '📄', csv: '📄',
    zip: '📦', rar: '📦', tar: '📦', gz: '📦', '7z': '📦',
    js: '💻', jsx: '💻', ts: '💻', tsx: '💻', py: '💻', go: '💻', rs: '💻', java: '💻',
    html: '🌐', css: '🎨', json: '⚙️',
  };
  return map[ext] || '📄';
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FileItem({ file, draggingItem, onNavigate, onMove, onDelete, onDownload, onUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleDragStart = (e) => {
    draggingItem.current = file.path;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.path);
  };

  const handleDragEnd = () => {
    draggingItem.current = null;
  };

  const handleDragOver = (e) => {
    if (!file.isDirectory || draggingItem.current === file.path) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

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
      className={`
        relative rounded-xl p-3 flex flex-col items-center gap-1.5 select-none
        transition-all duration-150 cursor-pointer
        ${file.isDirectory ? 'hover:bg-amber-50' : 'hover:bg-blue-50'}
        ${isDragOver ? 'bg-blue-100 ring-2 ring-blue-400 scale-105 shadow-md' : 'bg-white shadow-sm'}
      `}
    >
      <div className="text-4xl pointer-events-none">{getIcon(file.name, file.isDirectory)}</div>

      <p className="text-xs text-center text-slate-700 w-full truncate font-medium leading-tight">
        {file.name}
      </p>

      {!file.isDirectory && (
        <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
      )}

      {isHover && (
        <div
          className="absolute top-1 right-1 flex gap-0.5"
          onClick={e => e.stopPropagation()}
        >
          {!file.isDirectory && (
            <button
              onClick={() => onDownload(file.path)}
              title="İndir"
              className="p-1 bg-white rounded shadow text-base hover:bg-blue-50 transition-colors"
            >
              ⬇️
            </button>
          )}
          <button
            onClick={() => onDelete(file.path)}
            title="Sil"
            className="p-1 bg-white rounded shadow text-base hover:bg-red-50 transition-colors"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
