const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT || './storage');

if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

function safePath(relativePath) {
  const cleaned = (relativePath || '').replace(/\.\./g, '').replace(/^\/+/, '');
  const full = path.resolve(STORAGE_ROOT, cleaned);
  if (!full.startsWith(STORAGE_ROOT)) throw new Error('Geçersiz yol');
  return full;
}

function toRelative(fullPath) {
  return path.relative(STORAGE_ROOT, fullPath);
}

// List directory
router.get('/list', auth, (req, res) => {
  try {
    const dir = safePath(req.query.path);
    const names = fs.readdirSync(dir);
    const items = names
      .map(name => {
        const full = path.join(dir, name);
        try {
          const stat = fs.statSync(full);
          return {
            name,
            path: toRelative(full),
            isDirectory: stat.isDirectory(),
            size: stat.size,
            modified: stat.mtime,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, 'tr');
      });
    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dest = safePath(req.body.path);
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

router.post('/upload', auth, upload.array('files'), (req, res) => {
  res.json({ success: true, count: req.files.length });
});

// Create folder
router.post('/mkdir', auth, (req, res) => {
  try {
    const { path: relPath, name } = req.body;
    if (!name || /[/\\<>:"|?*]/.test(name) || name.includes('..')) {
      return res.status(400).json({ error: 'Geçersiz klasör adı' });
    }
    const dir = safePath(path.join(relPath || '', name));
    fs.mkdirSync(dir);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Move / rename
router.post('/move', auth, (req, res) => {
  try {
    const { from, to } = req.body;
    fs.renameSync(safePath(from), safePath(to));
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete('/delete', auth, (req, res) => {
  try {
    const filePath = safePath(req.query.path);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Download — accepts token in query string so large files stream properly
router.get('/download', (req, res) => {
  const token = req.headers.authorization?.slice(7) || req.query.t;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Yetkisiz' });
  }
  try {
    const filePath = safePath(req.query.path);
    res.download(filePath);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
