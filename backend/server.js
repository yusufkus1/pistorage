require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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

app.use('/dav', davAuth, webdav.extensions.express('/', davServer));

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pi Storage running at http://0.0.0.0:${PORT}`);
});
