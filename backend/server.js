require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const bcrypt = require('bcryptjs');
const { v2: webdav } = require('webdav-server');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();

// WebDAV — mounts storage as a network drive at /dav
const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT || './storage');
const davServer = new webdav.WebDAVServer({ requireAuthentification: false });
davServer.setFileSystemSync('/', new webdav.PhysicalFileSystem(STORAGE_ROOT));

async function davAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Pi Storage"');
    return res.status(401).end();
  }
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const password = decoded.slice(decoded.indexOf(':') + 1);
  const valid = await bcrypt.compare(password, process.env.PASSWORD_HASH || '');
  if (!valid) {
    res.set('WWW-Authenticate', 'Basic realm="Pi Storage"');
    return res.status(401).end();
  }
  next();
}

app.use('/dav', davAuth);
app.use(webdav.extensions.express('/dav', davServer));

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Sertifika indirme — cihazlara güven tanımlamak için
const CERT_PATH = '/data/certs/server.crt';
app.get('/cert', (req, res) => {
  if (fs.existsSync(CERT_PATH)) {
    res.download(CERT_PATH, 'pistorage.crt');
  } else {
    res.status(404).json({ error: 'Sertifika bulunamadı' });
  }
});

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// HTTP
const PORT = parseInt(process.env.PORT) || 3001;
http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`Pi Storage HTTP  → http://0.0.0.0:${PORT}`);
});

// HTTPS (sertifika varsa)
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 3443;
const KEY_PATH = '/data/certs/server.key';
if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
  https.createServer(
    { key: fs.readFileSync(KEY_PATH), cert: fs.readFileSync(CERT_PATH) },
    app
  ).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`Pi Storage HTTPS → https://0.0.0.0:${HTTPS_PORT}`);
  });
}
