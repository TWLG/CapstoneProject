// ws-server/index.js
import fs from 'fs';
import https from 'https';
import express from 'express';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;

const {
  PORT = 8443,
  DB_URL,
  JWT_SECRET,
  CERT_KEY_PATH = '/certs/server/server.key',
  CERT_CRT_PATH = '/certs/server/server.crt',
  CA_CRT_PATH   = '/certs/ca/ca.crt'
} = process.env;

// ——— Express App & DB ——————————————————
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: DB_URL });

// Simple health-check
app.get('/', (_req, res) => res.send('WS server healthy'));

// Protected API: post a new instruction for a device
app.post(
  '/api/instr/:deviceId',
  express.json(),
  (req, res, next) => {             // auth middleware
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) return res.sendStatus(401);
    try {
      const { sub: userId, role } = jwt.verify(auth, JWT_SECRET);
      if (role !== 'Owner' && role !== 'User')
        return res.sendStatus(403);
      req.userId = userId;
      next();
    } catch (err) {
      return res.sendStatus(401);
    }
  },
  async (req, res) => {
    const { deviceId } = req.params;
    const instr = req.body;          // { seq, command, params }
    // TODO: verify device exists & belongs to this user if role==='User' or 'Owner'
    latestInstr.set(deviceId, instr);
    logger.info(`INSTR ${deviceId} → ${JSON.stringify(instr)}`);
    // dispatch immediately if connected
    const ws = devices.get(deviceId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(instr));
    }
    res.sendStatus(204);
  }
);

// ——— HTTPS Server with mTLS ——————————————————
const server = https.createServer({
  key: fs.readFileSync(CERT_KEY_PATH),
  cert: fs.readFileSync(CERT_CRT_PATH),
  ca:   fs.readFileSync(CA_CRT_PATH),
  requestCert: true,
  rejectUnauthorized: false   // we'll check .authorized per-connection
}, app);

// ——— WebSocket Server ——————————————————
const wss = new WebSocketServer({ server, path: '/wss' });

// Active connections
const devices = new Map();    // deviceId → ws
const frontends = new Set();  // ws

// Simple Winston logger to file
import winston from 'winston';
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: '/var/log/iot/audit.log' })
  ]
});

// Instruction buffer
const latestInstr = new Map(); // deviceId → instr

wss.on('connection', (ws, req) => {
  const isDevice = req.socket.authorized;   // mTLS success
  const cert    = req.socket.getPeerCertificate();
  let clientId;

  if (isDevice && cert.subject.CN) {
    clientId = cert.subject.CN;
    devices.set(clientId, ws);
    logger.info(`DEVICE CONNECT ${clientId}`);
  } else {
    // attempt JWT auth for frontends
    const params = new URLSearchParams(req.url.split('?')[1]);
    const token  = params.get('token');
    try {
      const { sub, role } = jwt.verify(token || '', JWT_SECRET);
      if (role === 'Owner' || role === 'User' || role === 'Guest') {
        clientId = sub;
        frontends.add(ws);
        logger.info(`FRONTEND CONNECT ${clientId} (${role})`);
        // send initial state
        ws.send(JSON.stringify({
          type: 'initial',
          devices: Array.from(devices.keys()),
        }));
      } else {
        throw new Error('Bad role');
      }
    } catch {
      ws.close(1008, 'Auth failed');
      return;
    }
  }

  // heartbeat & timestamp
  ws.isAlive   = true;
  ws.clientId  = clientId;
  ws.clientType = isDevice ? 'device' : 'frontend';

  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg) }
    catch { return; }
    if (data.type === 'ping') {
      ws.isAlive = true;
    }
    // Telemetry from device → broadcast to frontends
    if (ws.clientType === 'device' && data.telemetry) {
      frontends.forEach(f => {
        if (f.readyState === WebSocket.OPEN)
          f.send(JSON.stringify({ type:'telemetry', device: clientId, data: data.telemetry }));
      });
    }
  });

  ws.on('close', () => {
    logger.info(`${ws.clientType.toUpperCase()} DISCONNECT ${clientId}`);
    if (ws.clientType === 'device') devices.delete(clientId);
    else frontends.delete(ws);
  });
});

// heartbeat checker
const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.send(JSON.stringify({ type: 'ping' }));
  });
}, 30000);

// graceful shutdown
const shutdown = () => {
  clearInterval(interval);
  wss.clients.forEach(c => c.terminate());
  pool.end().finally(() => server.close(() => process.exit(0)));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// simple health‐check page + inline WS tester
app.get('/test', (req, res) => {
  const host = req.headers.host;
  // replace YOUR_JWT_HERE with a real token for frontend testing
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>WS Server Test</title>
      </head>
      <body>
        <h1>Express+WS mTLS Server</h1>
        <p>Host: ${host}</p>
        <p><strong>WebSocket Test:</strong></p>
        <div id="status">Connecting…</div>
        <script>
          // For device testing (mTLS), use a real WebSocket client with certs.
          // For frontend testing, include a valid JWT in the URL:
          const ws = new WebSocket('wss://${host}/wss?token=YOUR_JWT_HERE');
          ws.onopen    = () => document.getElementById('status').innerText = '✅ WS open';
          ws.onmessage = evt => console.log('←', evt.data);
          ws.onerror   = e   => document.getElementById('status').innerText = '❌ WS error';
          ws.onclose   = ()  => document.getElementById('status').innerText = '⚠️ WS closed';
        </script>
      </body>
    </html>
  `);
});

// start
server.listen(PORT, () => {
  console.log(`mTLS WS server & API listening on port ${PORT}`);
});
