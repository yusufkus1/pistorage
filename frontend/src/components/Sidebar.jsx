import { useState } from 'react';

export default function Sidebar({ folders, currentPath, onNavigate, draggingItem, onMove, onUpload, onLogout }) {
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

  const isRootActive = currentPath === '';

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-sm">Pi Storage</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* All files */}
        <button
          onClick={() => onNavigate('')}
          onDragOver={e => handleDragOver(e, '')}
          onDragLeave={handleDragLeave}
          onDrop={e => handleDrop(e, '')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all mb-0.5 ${
            isRootActive
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100'
          } ${dragOver === '' ? 'bg-indigo-100 ring-1 ring-indigo-300' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Tüm Dosyalar
        </button>

        {/* Folders */}
        {folders.length > 0 && (
          <div className="mt-3 mb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Klasörler</p>
            {folders.map(folder => {
              const isActive = currentPath === folder.path || currentPath.startsWith(folder.path + '/');
              const isDragOver = dragOver === folder.path;
              return (
                <button
                  key={folder.path}
                  onClick={() => onNavigate(folder.path)}
                  onDragOver={e => handleDragOver(e, folder.path)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, folder.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all mb-0.5 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  } ${isDragOver ? 'bg-indigo-100 ring-1 ring-indigo-300' : ''}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive ? '#6366F1' : '#94A3B8'} stroke="none">
                    <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/>
                  </svg>
                  <span className="truncate">{folder.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
