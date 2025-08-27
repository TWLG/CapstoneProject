import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const PORT = 8080;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Example REST route (no auth)
app.post('/api/instr/:deviceId', (req, res) => {
  // ... handle instruction as needed
  res.sendStatus(204);
});

// --- HTTP server (no TLS)
const server = http.createServer(app);

// --- WebSocket (no auth)
const wss = new WebSocketServer({ server });

const frontends = new Set();
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WS] New connection from ${ip}`);
  frontends.add(ws);

  ws.on('close', () => {
    console.log(`[WS] Disconnected: ${ip}`);
    frontends.delete(ws);
  });

  ws.on('message', (msg) => {
    console.log(`[WS] Message from ${ip}: ${msg}`);
    ws.send(`Received: ${msg}`);
  });
});

server.listen(PORT, () => console.log(`WS server listening on ${PORT}`));