import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const login = (password) => api.post('/auth/login', { password });

export const listFiles = (path) => api.get('/files/list', { params: { path } });

export const uploadFiles = (path, files, onProgress) => {
  const form = new FormData();
  form.append('path', path);
  Array.from(files).forEach(f => form.append('files', f));
  return api.post('/files/upload', form, {
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
};

export const createFolder = (path, name) => api.post('/files/mkdir', { path, name });

export const moveFile = (from, to) => api.post('/files/move', { from, to });

export const deleteFile = (path) => api.delete('/files/delete', { params: { path } });

export const downloadFile = (filePath) => {
  const token = localStorage.getItem('token');
  const url = `/api/files/download?path=${encodeURIComponent(filePath)}&t=${token}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filePath.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
