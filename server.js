const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Replit's reverse proxy so cookies work correctly over HTTPS on all devices
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'streamrooms-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Path to users.json
const usersFilePath = path.join(__dirname, 'users.json');

// Path to streams.json
const streamsFilePath = path.join(__dirname, 'streams.json');
const streamsTmpPath  = path.join(os.tmpdir(), 'kcon_streams_state.json');

// In-memory streams state — loaded from file at startup, updated via PATCH
let streamsState = {
  rooms: [
    { id: 1, name: 'Artist Stage',     live: false },
    { id: 2, name: 'X Stage',          live: false },
    { id: 3, name: 'Mcountdown Stage', live: false }
  ]
};

// Load order: /tmp (most recent toggle) → repo streams.json → hardcoded defaults
(function loadInitialState() {
  const sources = [streamsTmpPath, streamsFilePath];
  for (const src of sources) {
    try {
      const saved = JSON.parse(fs.readFileSync(src, 'utf8'));
      if (saved && Array.isArray(saved.rooms)) { streamsState = saved; console.log('Streams loaded from', src); return; }
    } catch (e) { /* try next */ }
  }
  console.log('Streams using hardcoded defaults');
})();

function readStreams() { return streamsState; }
function writeStreams(data) {
  streamsState = data;
  // Try repo file first, then /tmp — /tmp is always writable even on read-only hosts
  let persisted = false;
  try { fs.writeFileSync(streamsFilePath, JSON.stringify(data, null, 2), 'utf8'); persisted = true; } catch (e) {}
  try { fs.writeFileSync(streamsTmpPath,  JSON.stringify(data, null, 2), 'utf8'); persisted = true; } catch (e) {}
  if (!persisted) console.warn('writeStreams: could not persist to any path');
}

// Helper function to read users from JSON
function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data).users || [];
  } catch (error) {
    console.error('Error reading users.json:', error);
    return [];
  }
}

// Helper function to write users to JSON
function writeUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to users.json:', error);
    return false;
  }
}

// Auth middleware — protects stream pages
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  const redirect = encodeURIComponent(req.originalUrl);
  res.redirect(`/index.html?authRequired=1&redirect=${redirect}`);
}


// ── Streams API ──

// SSE client registry — one entry per connected browser tab
const sseClients = new Set();

// Push the current state to every connected SSE client
function broadcastStreams(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(msg); } catch (e) { sseClients.delete(client); }
  });
  console.log(`[sse] Broadcast to ${sseClients.size} client(s)`);
}

// SSE endpoint — browser connects once, server pushes updates instantly
app.get('/api/streams/events', (req, res) => {
  res.set({
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',   // prevent nginx from buffering
  });
  res.flushHeaders();

  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify(readStreams())}\n\n`);

  sseClients.add(res);
  console.log(`[sse] Client connected (total: ${sseClients.size})`);

  // Keepalive every 25s so proxies don't close the connection
  const keepalive = setInterval(() => {
    try { res.write(': keepalive\n\n'); } catch (e) { clearInterval(keepalive); }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepalive);
    sseClients.delete(res);
    console.log(`[sse] Client disconnected (total: ${sseClients.size})`);
  });
});

// Get all room live statuses (public — never cached)
app.get('/api/streams', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.json(readStreams());
});

// Toggle a room's live status — POST so all hosts/proxies support it
function handleStreamToggle(req, res) {
  const id = parseInt(req.params.id);
  const { live } = req.body;
  if (typeof live === 'undefined') return res.status(400).json({ error: 'Missing live field' });
  const data = readStreams();
  const room = data.rooms.find(r => r.id === id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  room.live = !!live;
  writeStreams(data);
  console.log(`[streams] Room ${id} (${room.name}) → live=${room.live}`);
  broadcastStreams(data);   // ← push to all connected devices instantly
  res.json({ success: true, room });
}
app.patch('/api/streams/:id', handleStreamToggle); // keep for backwards compat
app.post('/api/streams/:id', handleStreamToggle);  // POST alias — works on all hosts

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Check session status
app.get('/api/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = { id: user.id, username: user.username, email: user.email };
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = 6 * 60 * 60 * 1000; // 6 hours
    } else {
      req.session.cookie.expires = false; // session cookie — expires when browser closes
    }
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Protected stream pages
app.get('/video-stream.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'video-stream.html'));
});

app.get('/video-stream2.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'video-stream2.html'));
});

app.get('/video-stream3.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'video-stream3.html'));
});

app.get('/downloads.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'downloads.html'));
});

app.get('/video-stream(4).html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'video-stream(4).html'));
});

// Get all users
app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

// Get single user by ID
app.get('/api/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Create new user
app.post('/api/users', (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password,
    email
  };
  users.push(newUser);
  if (writeUsers(users)) {
    res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
  } else {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const { username, password, email } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (username) users[userIndex].username = username;
  if (password) users[userIndex].password = password;
  if (email) users[userIndex].email = email;
  if (writeUsers(users)) {
    res.json({ success: true, message: 'User updated successfully', user: users[userIndex] });
  } else {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  const deletedUser = users.splice(userIndex, 1);
  if (writeUsers(users)) {
    res.json({ success: true, message: 'User deleted successfully', user: deletedUser[0] });
  } else {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Serve static files (non-protected)
app.use(express.static(__dirname));

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Stream Rooms Server is running on http://localhost:${PORT}`);
  console.log(`🔒 Protected routes: /video-stream.html, /video-stream2.html, /video-stream3.html`);
  console.log(`📊 Database: ${usersFilePath}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   POST   /api/login          - Login with username/password`);
  console.log(`   POST   /api/logout         - Logout and destroy session`);
  console.log(`   GET    /api/session        - Check current session`);
  console.log(`   GET    /api/users          - Get all users`);
  console.log(`   GET    /api/users/:id      - Get user by ID`);
  console.log(`   POST   /api/users          - Create new user`);
  console.log(`   PUT    /api/users/:id      - Update user`);
  console.log(`   DELETE /api/users/:id      - Delete user`);
  console.log(`   GET    /api/health         - Health check\n`);
});
