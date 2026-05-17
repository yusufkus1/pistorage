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

// WebDAV — bcrypt auth entegre edilmiş, Express middleware'ine bağımlı değil
const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT || './storage');

const davUserManager = new webdav.SimpleUserManager();
const davAdmin = davUserManager.addUser('pi', '', true);
const davAnon  = davUserManager.addUser('anon', '', false);
const davPrivileges = new webdav.SimplePathPrivilegeManager();
davPrivileges.setRights(davAdmin, '/', ['all']);

// Auth sonucunu 60 sn cache'le — Pi 3'te her istekte bcrypt çalışmasın
const authCache = new Map();
const CACHE_TTL = 60000;

class BcryptHTTPAuth {
  askForAuthentication() {
    return { 'WWW-Authenticate': 'Basic realm="Pi Storage"' };
  }
  getUser(ctx, callback) {
    const header = ctx.request.headers['authorization'];
    if (!header?.startsWith('Basic ')) return callback(null, davAnon);
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const password = decoded.slice(decoded.indexOf(':') + 1);

    const cached = authCache.get(password);
    if (cached && cached.expires > Date.now()) {
      return callback(null, cached.valid ? davAdmin : davAnon);
    }

    bcrypt.compare(password, process.env.PASSWORD_HASH || '')
      .then(valid => {
        authCache.set(password, { valid, expires: Date.now() + CACHE_TTL });
        callback(null, valid ? davAdmin : davAnon);
      })
      .catch(() => callback(null, davAnon));
  }
}

const davServer = new webdav.WebDAVServer({
  requireAuthentification: true,
  httpAuthentication: new BcryptHTTPAuth(),
  privilegeManager: davPrivileges,
  userManager: davUserManager,
});
davServer.setFileSystemSync('/', new webdav.PhysicalFileSystem(STORAGE_ROOT));

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

const PORT = parseInt(process.env.PORT) || 3001;
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 3443;
const KEY_PATH = '/data/certs/server.key';

// HTTPS
if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
  https.createServer(
    { key: fs.readFileSync(KEY_PATH), cert: fs.readFileSync(CERT_PATH) },
    app
  ).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`Pi Storage HTTPS → https://0.0.0.0:${HTTPS_PORT}`);
  });
}

// HTTP — WebDAV geçer (iOS cert olmadan bağlanabilsin), diğerleri HTTPS'e
http.createServer((req, res) => {
  if (req.url.startsWith('/dav')) {
    app(req, res);
  } else {
    const host = req.headers.host?.split(':')[0] || '127.0.0.1';
    res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
    res.end();
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Pi Storage HTTP  → http://0.0.0.0:${PORT} (/dav açık, diğerleri HTTPS redirect)`);
});
