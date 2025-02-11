const express = require('express');
const protectedRoutes = require('./routes/protected');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connectionCounter = 0; // Track total WebSocket connections
const connectedDevices = new Set(); // Track device connections
const connectedFrontends = new Set(); // Track frontend connections
const userDeviceMap = new Map();

const API_KEYS = ['device-api-key-123', 'device-api-key-456'];
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'; // JWT secret for token verification


app.get('/', (req, res) => {
    res.status(200).send('Backend is running and ready for WebSocket connections.');
});



// Broadcast updated connection list
const broadcastToFrontends = () => {
    const payload = {
        type: 'update',
        devices: Array.from(connectedDevices).map((ws) => ({
            deviceName: ws.deviceName,
            timestamp: ws.timestamp,
        })),
        frontends: Array.from(connectedFrontends).map((ws) => ({
            deviceName: ws.deviceName,
            timestamp: ws.timestamp,
        })),
    };

    connectedFrontends.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }
    });
};


wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const role = urlParams.get('role'); // "device" or "frontend"
    const apiKey = urlParams.get('apiKey'); // API key for devices
    const userID = urlParams.get('userID'); // UserID for frontends


    let deviceName;
    if (role === 'frontend') {
        if (userDeviceMap.has(userID)) {
            deviceName = userDeviceMap.get(userID);
        } else {
            deviceName = `FrontendClient-${Math.random().toString(36).substring(7)}`;
            userDeviceMap.set(userID, deviceName);
        }
    } else {
        deviceName = urlParams.get('deviceName') || `Unnamed-${Math.random().toString(36).substring(7)}`;
    }

    ws.deviceName = deviceName;
    ws.timestamp = new Date().toISOString();

    if (role === 'device') {
        console.log(`Device connected: ${deviceName}`);
        connectedDevices.add(ws);
    } else if (role === 'frontend') {
        console.log(`Frontend connected: ${deviceName}`);
        connectedFrontends.add(ws);

        // Send the initial state of devices and frontends to the newly connected frontend
        ws.send(
            JSON.stringify({
                type: 'initial',
                deviceName: deviceName,
                devices: Array.from(connectedDevices).map((d) => ({
                    deviceName: d.deviceName,
                    timestamp: d.timestamp,
                })),
                frontends: Array.from(connectedFrontends).map((f) => ({
                    deviceName: f.deviceName,
                    timestamp: f.timestamp,
                })),
            })
        );
    }

    // Broadcast updated lists to frontends whenever a new connection is established
    broadcastToFrontends();

    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'ping') {
                ws.isAlive = true; // Mark the connection as alive on receiving a ping
            } else if (data.type === 'updateLEDMatrix') {
                console.log(`Received LED matrix update from ${deviceName}`);
                const targetDevice = Array.from(connectedDevices).find(
                    (device) => device.deviceName === data.deviceName
                );
                if (targetDevice) {
                    targetDevice.send(
                        JSON.stringify({
                            type: 'updateLEDMatrix',
                            matrix: data.matrix,
                        })
                    );
                } else {
                    console.warn(`Device not found: ${data.deviceName}`);
                }
            } else if (data.type === 'setMotorSpeed') {
                console.log(`Received motor speed update from ${deviceName}`);
                const targetDevice = Array.from(connectedDevices).find(
                  (device) => device.deviceName === data.deviceName
                );
          
                if (targetDevice) {
                    targetDevice.send(
                        JSON.stringify({
                            type: 'setMotorSpeed',
                            speed: data.speed,
                        })
                    );                } else {
                  console.warn(`Device not found: ${data.deviceName}`);
                }
              }
              else if (data.type === 'setMotorDirection') {
                console.log(`Received motor direction update from ${deviceName}`);
                const targetDevice = Array.from(connectedDevices).find(
                  (device) => device.deviceName === data.deviceName
                );
          
                if (targetDevice) {
                    targetDevice.send(
                        JSON.stringify({
                            type: 'setMotorDirection',
                            direction: data.direction,
                        })
                    );                } else {
                  console.warn(`Device not found: ${data.deviceName}`);
                }
              }
              else if (data.type === 'stopMotor') {
                const targetDevice = Array.from(connectedDevices).find(
                  (device) => device.deviceName === data.deviceName
                );
          
                if (targetDevice) {
                    targetDevice.send(
                        JSON.stringify({
                            type: 'stopMotor',                        })
                    );                } else {
                  console.warn(`Device not found: ${data.deviceName}`);
                }
              } 
              else if (data.type === 'startMotor') {
                const targetDevice = Array.from(connectedDevices).find(
                  (device) => device.deviceName === data.deviceName
                );
          
                if (targetDevice) {
                    targetDevice.send(
                        JSON.stringify({
                            type: 'startMotor',                        })
                    );                } else {
                  console.warn(`Device not found: ${data.deviceName}`);
                }
              }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('close', () => {
        console.log(`${deviceName} disconnected`);
        if (role === 'device') {
            connectedDevices.delete(ws);
        } else if (role === 'frontend') {
            connectedFrontends.delete(ws);
        }

        // Broadcast updated lists to frontends on disconnection
        broadcastToFrontends();
    });

    ws.on('error', (err) => {
        console.error(`WebSocket error from ${deviceName}:`, err.message);
    });
});

// Periodically check for dead connections
const checkInterval = 60000; // 1 minute
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log(`Terminating dead connection: ${ws.deviceName || 'Unknown'}`);
            //return ws.terminate(); // Forcefully close the WebSocket connection
        }

        ws.isAlive = false;
        ws.send(JSON.stringify({ type: 'ping' })); // Send ping to client
    });
}, checkInterval);

// Graceful shutdown handler
let isShuttingDown = false;
const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('\nShutting down gracefully...');
    clearInterval(interval); // Clear the heartbeat interval

    // Close all WebSocket connections
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.terminate();
        }
    });

    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database connection:', err.message);
    }

    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
    if (data.trim().toLowerCase() === 'exit') {
        shutdown();
    }
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
const PORT = 4000;
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`Backend running on http://0.0.0.0:${PORT}`);

});
