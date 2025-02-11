"use client";

import {useEffect, useState} from "react";

export default function Control_Panel() {
  interface Connection {
    deviceName: string;
    timestamp: string;
  }

  const [devices, setDevices] = useState<Connection[]>([]); // Track connected devices
  const [frontends, setFrontends] = useState<Connection[]>([]); // Track connected frontends
  const [clientDeviceName, setClientDeviceName] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<boolean>(false); // Track WebSocket connection status (true = connected)
  const [socket, setSocket] = useState<WebSocket | null>(null); // Store WebSocket instance
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null); // Track selected device

  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({length: 8}, () => Array(12).fill(0))
  );

  useEffect(() => {
    const socketInstance = new WebSocket(
      `ws://localhost:4000?role=frontend&userID=device-api-key-123`
    );

    socketInstance.onopen = () => {
      console.log(`Connected to WebSocket server.`);
      setSocketStatus(true); // Update status to true (connected)
      setSocket(socketInstance); // Store WebSocket instance
    };

    socketInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initial") {
          console.log("Initial connection data:", data);
          setClientDeviceName(data.deviceName); // Set the device name
          setDevices(data.devices); // Update the list of devices
          setFrontends(data.frontends); // Update the list of frontends
        } else if (data.type === "update") {
          console.log("Updated devices and frontends:", data);
          setDevices(data.devices); // Update the list of devices
          setFrontends(data.frontends); // Update the list of frontends
        }
      } catch (error) {
        setSocketStatus(false);
        console.log("Error processing message:", error);
      }
    };

    socketInstance.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setSocketStatus(false); // Update status to false (disconnected)
    };

    socketInstance.onerror = (error) => {
      console.log("WebSocket error:", error);
      setSocketStatus(false); // Update status to false (disconnected)
    };

    return () => {
      socketInstance.close();
    };
  }, []);

  const sendMessage = (socket: WebSocket | null, payload: object) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("Cannot send message: WebSocket is not connected");
      return;
    }

    try {
      socket.send(JSON.stringify(payload));
      console.log("Sent message:", payload);
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const sendMatrix = () => {
    if (!selectedDevice) {
      alert("Please select a device to send the matrix to.");
      return;
    }
    sendMessage(socket, {
      type: "updateLEDMatrix",
      deviceName: selectedDevice,
      matrix,
    });
  };

  return (
    <div>
      <h1>Frontend Connected to WebSocket Backend</h1>
      <p>
        Your Device Name: <strong>{clientDeviceName || "Unknown"}</strong>
      </p>

      {/* Socket Status Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: socketStatus ? "green" : "red", // Green if connected, red if disconnected
          }}
        />
        <span>{socketStatus ? "Connected" : "Disconnected"}</span>
      </div>

      <h2>Connected Devices:</h2>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>
            <strong>Device Name:</strong> {device.deviceName},{" "}
            <strong>Connected At:</strong> {device.timestamp}
          </li>
        ))}
      </ul>

      <h2>Connected Frontends:</h2>
      <ul>
        {frontends.map((frontend, index) => (
          <li key={index}>
            <strong>Frontend Name:</strong> {frontend.deviceName},{" "}
            <strong>Connected At:</strong> {frontend.timestamp}
          </li>
        ))}
      </ul>

      <h2>Device Control</h2>
      <div>
        <form action="">
          <select
            onChange={(e) => setSelectedDevice(e.target.value)}
            value={selectedDevice || ""}
          >
            <option value="" disabled>
              Select a device
            </option>
            {devices.map((device, index) => (
              <option key={index} value={device.deviceName}>
                {device.deviceName}
              </option>
            ))}
          </select>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(12, 1fr)`,
              gap: "2px", // Reduced gap for tighter grouping
            }}
          >
            {matrix.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  type="checkbox"
                  checked={cell === 1}
                  onChange={() => {
                    const newMatrix = matrix.map((r, ri) =>
                      r.map((c, ci) =>
                        ri === rowIndex && ci === colIndex
                          ? c === 1
                            ? 0
                            : 1
                          : c
                      )
                    );
                    setMatrix(newMatrix);
                  }}
                  style={{
                    width: "20px", // Reduced width for tighter grouping
                    height: "20px", // Reduced height for tighter grouping
                  }}
                />
              ))
            )}
          </div>
          <button
            type="submit"
            onClick={(event) => {
              event.preventDefault();
              sendMatrix();
            }}
          >
            Send Matrix
          </button>
        </form>
      </div>
    </div>
  );
}
