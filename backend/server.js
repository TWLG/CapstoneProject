// ws-server/index.js (trimmed to what's changed)
import fs from 'fs';
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';

const {
  PORT = 8443,
  DB_URL,
  JWT_SECRET,
} = process.env;

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- Login route sets HttpOnly cookie (no JS access, no query tokens)
app.post('/api/login', (req, res) => {
  // TODO: verify user creds
  const user = { sub: 'user-123', role: 'Owner' };           // example
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('sid', token, {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 3600_000
  });
  res.sendStatus(204);
});

// Example protected REST route using cookie
app.post('/api/instr/:deviceId', (req, res) => {
  const token = req.cookies.sid;
  try {
    const { sub: userId, role } = jwt.verify(token, JWT_SECRET);
    if (!['Owner','User'].includes(role)) return res.sendStatus(403);
    // ... handle instruction as before
    res.sendStatus(204);
  } catch {
    res.sendStatus(401);
  }
});

// --- HTTPS server (server-only TLS)
const server = https.createServer({

}, app);

// --- WebSocket (auth via cookie during upgrade)
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  // Pull JWT from HttpOnly cookie
  const cookieHeader = req.headers.cookie || '';
  const sid = Object.fromEntries(cookieHeader.split(';').map(s => s.trim().split('=')))['sid'];

  try {
    const user = jwt.verify(sid || '', JWT_SECRET);
    // If you want guests blocked here, check user.role
    req.user = user;
  } catch {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy(); return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.user = req.user;
    wss.emit('connection', ws, req);
  });
});

const frontends = new Set();
wss.on('connection', (ws) => {
  frontends.add(ws);
  ws.on('close', () => frontends.delete(ws));
});

server.listen(PORT, () => console.log(`WS server listening on ${PORT}`));
