import { useState } from 'react';

export default function Sidebar({ folders, currentPath, onNavigate, draggingItem, onMove, onUpload }) {
  const [dragOver, setDragOver] = useState(null);

  const handleDragOver = (e, folderPath) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(folderPath);
  };

  const handleDragLeave = () => setDragOver(null);

  const handleDrop = (e, folderPath) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);

    if (e.dataTransfer.files.length > 0 && !draggingItem.current) {
      onUpload(folderPath, e.dataTransfer.files);
    } else if (draggingItem.current) {
      onMove(draggingItem.current, folderPath);
      draggingItem.current = null;
    }
  };

  return (
    <aside className="w-52 bg-slate-800 overflow-y-auto flex-shrink-0">
      <div className="p-2 pt-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Klasörler
        </p>
        {folders.length === 0 && (
          <p className="text-xs text-slate-500 px-2">Henüz klasör yok</p>
        )}
        {folders.map(folder => {
          const isActive =
            currentPath === folder.path || currentPath.startsWith(folder.path + '/');
          const isDragOver = dragOver === folder.path;
          return (
            <button
              key={folder.path}
              onClick={() => onNavigate(folder.path)}
              onDragOver={e => handleDragOver(e, folder.path)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, folder.path)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all mb-0.5
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}
                ${isDragOver ? 'bg-blue-500 text-white ring-2 ring-blue-300' : ''}
              `}
            >
              <span>📁</span>
              <span className="truncate">{folder.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
