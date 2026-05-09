const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
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

function readStreams() {
  try {
    return JSON.parse(fs.readFileSync(streamsFilePath, 'utf8'));
  } catch (e) {
    return { rooms: [] };
  }
}

function writeStreams(data) {
  fs.writeFileSync(streamsFilePath, JSON.stringify(data, null, 2), 'utf8');
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
// Get all room live statuses (public)
app.get('/api/streams', (req, res) => {
  res.json(readStreams());
});

// Toggle a room's live status (admin only — must be logged in)
app.patch('/api/streams/:id', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = parseInt(req.params.id);
  const { live } = req.body;
  const data = readStreams();
  const room = data.rooms.find(r => r.id === id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  room.live = !!live;
  writeStreams(data);
  res.json({ success: true, room });
});

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
