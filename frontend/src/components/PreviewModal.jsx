import { useState, useEffect } from 'react';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic'];
const VIDEO_EXTS = ['mp4', 'webm'];
const AUDIO_EXTS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'];
const TEXT_EXTS  = ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'csv', 'sh', 'yaml', 'yml'];

function TextPreview({ url }) {
  const [text, setText] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url)
      .then(r => r.text())
      .then(setText)
      .catch(() => setError(true));
  }, [url]);

  if (error) return <p className="text-slate-400 text-sm">Dosya okunamadı.</p>;
  if (text === null) return <p className="text-slate-400 text-sm animate-pulse">Yükleniyor...</p>;
  return (
    <pre className="text-sm text-slate-800 whitespace-pre-wrap break-words font-mono bg-slate-50 rounded-xl p-4 overflow-auto max-h-[60vh]">
      {text}
    </pre>
  );
}

export default function PreviewModal({ file, onClose, onDownload }) {
  const token = localStorage.getItem('token');
  const url = `/api/files/download?path=${encodeURIComponent(file.path)}&t=${token}`;
  const ext = file.name.split('.').pop().toLowerCase();

  let preview;
  if (IMAGE_EXTS.includes(ext)) {
    preview = (
      <div className="flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden max-h-[65vh]">
        <img src={url} alt={file.name} className="max-w-full max-h-[65vh] object-contain" />
      </div>
    );
  } else if (VIDEO_EXTS.includes(ext)) {
    preview = (
      <video src={url} controls className="w-full max-h-[65vh] rounded-xl bg-black" />
    );
  } else if (AUDIO_EXTS.includes(ext)) {
    preview = (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <audio src={url} controls className="w-full" />
      </div>
    );
  } else if (ext === 'pdf') {
    preview = (
      <iframe src={url} className="w-full rounded-xl border border-slate-200" style={{ height: '65vh' }} title={file.name} />
    );
  } else if (TEXT_EXTS.includes(ext)) {
    preview = <TextPreview url={url} />;
  } else {
    preview = (
      <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <p className="font-medium text-slate-500">Bu dosya türü önizlenemiyor</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <p className="font-semibold text-slate-800 truncate text-sm">{file.name}</p>
          <div className="flex items-center gap-1 flex-shrink-0 ml-3">
            <button
              onClick={() => onDownload(file.path)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              İndir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-4 flex-1">
          {preview}
        </div>
      </div>
    </div>
  );
}
