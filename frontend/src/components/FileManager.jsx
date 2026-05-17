import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import Sidebar from './Sidebar';
import FileGrid from './FileGrid';
import Breadcrumb from './Breadcrumb';
import PreviewModal from './PreviewModal';

export default function FileManager() {
  const { logout } = useAuth();
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [rootFolders, setRootFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showMkdir, setShowMkdir] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [toast, setToast] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const draggingItem = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadFiles = useCallback(async (path) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.listFiles(path);
      setFiles(data);
    } catch {
      setError('Dosyalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRootFolders = useCallback(async () => {
    try {
      const { data } = await api.listFiles('');
      setRootFolders(data.filter(f => f.isDirectory));
    } catch {}
  }, []);

  useEffect(() => { loadFiles(currentPath); }, [currentPath, loadFiles]);
  useEffect(() => { loadRootFolders(); }, [loadRootFolders]);

  const reload = () => { loadFiles(currentPath); loadRootFolders(); };

  const handleUpload = async (uploadPath, fileList) => {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    setUploadProgress(0);
    try {
      await api.uploadFiles(uploadPath, arr, setUploadProgress);
      showToast(`${arr.length} dosya yüklendi`);
      reload();
    } catch (err) {
      showToast(err.response?.data?.error || 'Yükleme başarısız', 'error');
    } finally {
      setUploadProgress(null);
    }
  };

  const handleMove = async (fromPath, toFolderPath) => {
    const fileName = fromPath.split('/').pop();
    const toPath = toFolderPath ? `${toFolderPath}/${fileName}` : fileName;
    if (fromPath === toPath) return;
    try {
      await api.moveFile(fromPath, toPath);
      showToast('Taşındı');
      reload();
    } catch {
      showToast('Taşıma başarısız', 'error');
    }
  };

  const handleDelete = async (filePath) => {
    if (!window.confirm(`"${filePath.split('/').pop()}" silinsin mi?`)) return;
    try {
      await api.deleteFile(filePath);
      showToast('Silindi');
      reload();
    } catch {
      showToast('Silme başarısız', 'error');
    }
  };

  const handleMkdir = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await api.createFolder(currentPath, name);
      showToast('Klasör oluşturuldu');
      setShowMkdir(false);
      setNewFolderName('');
      reload();
    } catch (err) {
      showToast(err.response?.data?.error || 'Klasör oluşturulamadı', 'error');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-10">
        <Breadcrumb path={currentPath} onNavigate={setCurrentPath} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowMkdir(true); setNewFolderName(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Klasör
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Yükle
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => { handleUpload(currentPath, e.target.files); e.target.value = ''; }}
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          folders={rootFolders}
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          draggingItem={draggingItem}
          onMove={handleMove}
          onUpload={handleUpload}
          onLogout={logout}
        />
        <FileGrid
          files={files}
          currentPath={currentPath}
          loading={loading}
          error={error}
          uploadProgress={uploadProgress}
          draggingItem={draggingItem}
          onNavigate={setCurrentPath}
          onUpload={handleUpload}
          onMove={handleMove}
          onDelete={handleDelete}
          onDownload={api.downloadFile}
          onPreview={setPreviewFile}
        />
      </div>

      {/* Preview modal */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={api.downloadFile}
        />
      )}

      {/* New folder modal */}
      {showMkdir && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowMkdir(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Yeni Klasör</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleMkdir(); if (e.key === 'Escape') setShowMkdir(false); }}
              placeholder="Klasör adı"
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm mb-4 transition-all"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowMkdir(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleMkdir}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 border ${
          toast.type === 'error'
            ? 'bg-white text-red-600 border-red-200 shadow-red-100'
            : 'bg-white text-emerald-700 border-emerald-200 shadow-emerald-100'
        }`}>
          {toast.type === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm0-8a1 1 0 011 1v3a1 1 0 11-2 0V5a1 1 0 011-1z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.78 5.78l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 111.06 1.06z"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
