"use client";

import {useEffect, useState} from "react";

export default function Home() {
  interface Connection {
    deviceName: string;
    timestamp: string;
  }

  const [devices, setDevices] = useState<Connection[]>([]); // Track connected devices
  const [frontends, setFrontends] = useState<Connection[]>([]); // Track connected frontends
  const [clientDeviceName, setClientDeviceName] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<boolean>(false); // Track WebSocket connection status (true = connected)

  useEffect(() => {
    const deviceName = `FrontendClient-${Math.random()
      .toString(36)
      .substring(7)}`;
    setClientDeviceName(deviceName);

    const socket = new WebSocket(
      `ws://localhost:4000?role=frontend&deviceName=${encodeURIComponent(
        deviceName
      )}`
    );

    socket.onopen = () => {
      console.log(`Connected to WebSocket server as ${deviceName}`);
      setSocketStatus(true); // Update status to true (connected)
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "update") {
          console.log("Updated devices and frontends:", data);
          setDevices(data.devices); // Update the list of devices
          setFrontends(data.frontends); // Update the list of frontends
        }
      } catch (error) {
        setSocketStatus(false);
        console.log("Error processing message:", error);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setSocketStatus(false); // Update status to false (disconnected)
    };

    return () => {
      socket.close();
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
    </div>
  );
}
