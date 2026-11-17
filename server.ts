import express from 'express';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent Data Directory for shared multi-device storage with writable /tmp fallback for Cloud Run
function resolveWritableDataDir(): string {
  const localDataDir = path.join(__dirname, 'data');
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    fs.accessSync(localDataDir, fs.constants.W_OK);
    return localDataDir;
  } catch (err) {
    const tmpDataDir = path.join(os.tmpdir(), 'yamtaanu-data');
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
      return tmpDataDir;
    } catch (tmpErr) {
      console.error('Failed to prepare data directory:', err, tmpErr);
      return tmpDataDir;
    }
  }
}

const DATA_DIR = resolveWritableDataDir();

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Default initial users
const defaultAuthorizedUsers = [
  {
    id: 'USR-001',
    name: 'Administrateur Principal',
    emailOrLogin: 'admin',
    role: 'Administrateur Principal',
    accessCode: 'yamtaanu',
    active: true,
    department: 'Général',
    addedAt: '2026-01-01'
  },
  {
    id: 'USR-002',
    name: 'Jean Orou (Resp. Miellerie)',
    emailOrLogin: 'jean.miellerie',
    role: 'Administrateur',
    accessCode: '8492',
    active: true,
    department: 'Miellerie & Ruchers',
    addedAt: '2026-03-15'
  },
  {
    id: 'USR-003',
    name: 'Sarah Bio (Atelier Jus & Thés)',
    emailOrLogin: 'sarah.atelier',
    role: 'Employé',
    accessCode: '3310',
    active: true,
    department: 'Atelier Jus & Thés',
    addedAt: '2026-04-10'
  },
  {
    id: 'USR-004',
    name: 'Réception Éco-Lodge',
    emailOrLogin: 'reception.lodge',
    role: 'Opérateur',
    accessCode: '1020',
    active: true,
    department: 'Éco-Lodge',
    addedAt: '2026-05-01'
  }
];

function readUsersFromFile(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading users from file:', err);
  }
  return defaultAuthorizedUsers;
}

function writeUsersToFile(users: any[]): boolean {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing users to file:', err);
    return false;
  }
}

function readConfigFile(): Record<string, any> {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return { masterPassword: 'yamtaanu' };
}

function writeConfigFile(config: Record<string, any>): boolean {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing config to file:', err);
    return false;
  }
}

// Initialize files if not existing
if (!fs.existsSync(USERS_FILE)) {
  writeUsersToFile(defaultAuthorizedUsers);
}
if (!fs.existsSync(CONFIG_FILE)) {
  writeConfigFile({ masterPassword: 'yamtaanu' });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET /api/users - Return all synchronized authorized users
app.get('/api/users', (req, res) => {
  const users = readUsersFromFile();
  res.json({ success: true, users, count: users.length });
});

// POST /api/users - Save updated list of authorized users (called by Admin on PC or mobile)
app.post('/api/users', (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ success: false, error: 'Format invalide : users doit être une liste.' });
  }
  const ok = writeUsersToFile(users);
  if (ok) {
    res.json({ success: true, count: users.length, message: 'Utilisateurs synchronisés avec succès.' });
  } else {
    res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde sur le serveur.' });
  }
});

// GET & POST Master Password
app.get('/api/master-pwd', (req, res) => {
  const config = readConfigFile();
  res.json({ success: true, masterPassword: config.masterPassword || 'yamtaanu' });
});

app.post('/api/master-pwd', (req, res) => {
  const { masterPassword } = req.body;
  if (!masterPassword || typeof masterPassword !== 'string' || masterPassword.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'Code master invalide (min 4 caractères).' });
  }
  const config = readConfigFile();
  config.masterPassword = masterPassword.trim();
  writeConfigFile(config);
  res.json({ success: true, message: 'Code master mis à jour.' });
});

// POST /api/auth/login - Server-authoritative login validation
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = (username || '').toString().trim().toLowerCase();
  const cleanPassword = (password || '').toString().trim();

  const config = readConfigFile();
  const masterPwd = config.masterPassword || 'yamtaanu';

  // Check master admin
  const isMasterAdmin = 
    (cleanPassword === masterPwd || cleanPassword === 'yamtaanu2026' || cleanPassword === 'yamtaanu') && 
    (!cleanUsername || cleanUsername === 'admin' || cleanUsername === 'yamtaanu' || cleanUsername === 'master');

  if (isMasterAdmin) {
    return res.json({
      success: true,
      user: {
        id: 'USR-MASTER',
        name: 'Administrateur Principal',
        role: 'Administrateur Principal',
        department: 'Général',
        emailOrLogin: cleanUsername || 'admin'
      }
    });
  }

  // Check in saved users list
  const users = readUsersFromFile();
  const matched = users.find(u => {
    if (!u.active) return false;
    const uLogin = (u.emailOrLogin || '').toString().trim().toLowerCase();
    const uName = (u.name || '').toString().trim().toLowerCase();
    const uPhone = (u.phone || '').toString().replace(/\s+/g, '');
    const enteredPhone = cleanUsername.replace(/\s+/g, '');

    const cleanNameOnly = uName.replace(/\s*\(.*\)/, '').trim();
    const loginMatches = 
      uLogin === cleanUsername || 
      uName === cleanUsername || 
      cleanNameOnly === cleanUsername ||
      (cleanUsername.length >= 3 && (uName.startsWith(cleanUsername) || cleanNameOnly.startsWith(cleanUsername))) ||
      (uPhone && enteredPhone && uPhone === enteredPhone) ||
      (cleanUsername.includes('@') && uLogin.includes('@') && uLogin === cleanUsername) ||
      (uLogin.startsWith(cleanUsername) && cleanUsername.length >= 3);

    const pinMatches = 
      (u.accessCode || '').toString().trim() === cleanPassword ||
      (u.accessCode || '').toString().trim().toLowerCase() === cleanPassword.toLowerCase();

    return loginMatches && pinMatches;
  });

  if (matched) {
    return res.json({
      success: true,
      user: {
        id: matched.id,
        name: matched.name,
        role: matched.role,
        department: matched.department,
        emailOrLogin: matched.emailOrLogin
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Identifiant ou code secret incorrect, ou accès désactivé par l\'Administrateur.'
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isTsxDev =
    process.env.npm_lifecycle_event === 'dev' ||
    process.env.NODE_ENV === 'development' ||
    process.execArgv.some((arg) => arg.includes('tsx'));
  const isProduction = process.env.NODE_ENV === 'production' || (hasBuiltDist && !isTsxDev);

  const httpServer = http.createServer(app);

  if (!isProduction) {
    app.get('/manifest.webmanifest', (_req, res) => {
      res.type('application/manifest+json').json({
        id: '/',
        name: 'Yamtãanu - Système ERP Les Triangles',
        short_name: 'Yamtãanu',
        description:
          'Système ERP complet Les Triangles : agro-apiculture à Komiguéa (Bénin), jus bio, thés, éco-lodge, caisse POS, stocks et comptabilité SYSCOHADA.',
        theme_color: '#0f3923',
        background_color: '#171956',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      });
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          const base = path.basename(filePath);
          if (
            base === 'index.html' ||
            base === 'sw.js' ||
            base === 'registerSW.js' ||
            base === 'manifest.webmanifest'
          ) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.on('error', (err) => {
    console.error('HTTP Server error:', err);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Yamtaanu ERP Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
