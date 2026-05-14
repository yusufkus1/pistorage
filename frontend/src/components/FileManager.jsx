import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import Sidebar from './Sidebar';
import FileGrid from './FileGrid';
import Breadcrumb from './Breadcrumb';

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

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  useEffect(() => {
    loadRootFolders();
  }, [loadRootFolders]);

  const reload = () => {
    loadFiles(currentPath);
    loadRootFolders();
  };

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🗄️</span>
          <span className="font-bold text-lg tracking-tight">Pi Storage</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            ⬆️ Yükle
          </button>
          <button
            onClick={() => { setShowMkdir(true); setNewFolderName(''); }}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm font-medium transition-colors"
          >
            + Klasör
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            Çıkış
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => { handleUpload(currentPath, e.target.files); e.target.value = ''; }}
        />
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <Breadcrumb path={currentPath} onNavigate={setCurrentPath} />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          folders={rootFolders}
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          draggingItem={draggingItem}
          onMove={handleMove}
          onUpload={handleUpload}
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
        />
      </div>

      {/* Create Folder Modal */}
      {showMkdir && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowMkdir(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-semibold text-slate-800 mb-4">Yeni Klasör</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMkdir()}
              placeholder="Klasör adı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowMkdir(false)}
                className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleMkdir}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 transition-all ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
