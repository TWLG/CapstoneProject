const WebSocket = require('ws');

let reconnecting = false; // Flag to track reconnection status
let intervalId = null;    // To store the interval ID for clearing later
const deviceName = "DummyArduinoLocal2"; // Unique device identifier
const apiKey = "device-api-key-123";

const connectToServer = () => {
    console.log('Attempting to connect to server...');
    reconnecting = false; // Reset the flag when a new connection attempt starts

    const socket = new WebSocket(
            `ws://localhost:4000?role=device&deviceName=${encodeURIComponent(deviceName)}&apiKey=${encodeURIComponent(apiKey)}`
        );

    socket.on('open', () => {
        console.log(`${deviceName} connected to server`);
        reconnecting = false; // Reset the flag on successful connection

        // Clear any existing interval to prevent duplicate intervals
        if (intervalId) clearInterval(intervalId);

        // Send simulated sensor data every 4 seconds
        intervalId = setInterval(() => {
            const sensorValue = parseFloat((Math.random() * 100).toFixed(2)); // Ensure it's a number
            const timestamp = new Date().toISOString(); // ISO 8601 formatted timestamp
            const payload = JSON.stringify({ deviceName, timestamp, sensorValue });

            try {
                socket.send(payload);
                console.log(`Sent sensor data: ${payload}`);
            } catch (err) {
                console.error('Error sending data:', err.message);
            }
        }, 4000);
    });

    socket.on('message', (message) => {
        console.log(`Message from server: ${message}`);
    });

    socket.on('close', () => {
        console.log('Disconnected from server.');
        initiateReconnection();
    });

    socket.on('error', (error) => {
        console.error('Connection error:', error.message);
        initiateReconnection();
    });
};

const initiateReconnection = () => {
    if (!reconnecting) {
        reconnecting = true; // Set the flag to prevent multiple reconnection loops
        console.log('Retrying connection in 5 seconds...');
        if (intervalId) clearInterval(intervalId); // Clear the interval to prevent redundant tasks
        setTimeout(connectToServer, 5000); // Retry after 5 seconds
    }
};

// Keep the process alive
setInterval(() => {}, 1000);

// Start connection
connectToServer();
