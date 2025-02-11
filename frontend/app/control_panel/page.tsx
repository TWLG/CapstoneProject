"use client";

import {useEffect, useState} from "react";

export default function Control_Panel() {
  interface Connection {
    deviceName: string;
    timestamp: string;
  }

  const [devices, setDevices] = useState<Connection[]>([]);
  const [frontends, setFrontends] = useState<Connection[]>([]);
  const [clientDeviceName, setClientDeviceName] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({length: 8}, () => Array(12).fill(0))
  );
  const [motorSpeed, setMotorSpeed] = useState<number>(1000);

  useEffect(() => {
    const socketInstance = new WebSocket(
      `ws://89.117.76.156:4000?role=frontend&userID=device-api-key-123`
    );

    socketInstance.onopen = () => {
      setSocketStatus(true);
      setSocket(socketInstance);
    };

    socketInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "initial") {
          setClientDeviceName(data.deviceName);
          setDevices(data.devices);
          setFrontends(data.frontends);
        } else if (data.type === "update") {
          setDevices(data.devices);
          setFrontends(data.frontends);
        }
      } catch (error) {
        setSocketStatus(false);
      }
    };

    socketInstance.onclose = () => {
      setSocketStatus(false);
    };

    socketInstance.onerror = () => {
      setSocketStatus(false);
    };

    return () => {
      socketInstance.close();
    };
  }, []);

  const sendMessage = (payload: object) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      alert("WebSocket is not connected.");
      return;
    }
    socket.send(JSON.stringify(payload));
  };

  const updateMatrix = (newMatrix: number[][]) => {
    setMatrix(newMatrix);
    if (selectedDevice) {
      sendMessage({
        type: "updateLEDMatrix",
        deviceName: selectedDevice,
        matrix: newMatrix,
      });
    }
  };

  const updateMotorConfig = (speed: number, direction: boolean) => {
    if (selectedDevice) {
      sendMessage({
        type: "setMotorSpeed",
        deviceName: selectedDevice,
        speed,
      });
      sendMessage({
        type: "setMotorDirection",
        deviceName: selectedDevice,
        direction,
      });
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1 style={{textAlign: "center", fontSize: "1.5em"}}>Control Panel</h1>
      <p style={{textAlign: "center", fontSize: "1em"}}>
        Your Device Name: <strong>{clientDeviceName || "Unknown"}</strong>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: socketStatus ? "green" : "red",
            marginRight: "8px",
          }}
        />
        <span>{socketStatus ? "Connected" : "Disconnected"}</span>
      </div>

      <h2 style={{fontSize: "1.2em"}}>Connected Devices</h2>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>
            <strong>{device.deviceName}</strong> - {device.timestamp}
          </li>
        ))}
      </ul>

      <h2 style={{fontSize: "1.2em"}}>Connected Frontends</h2>
      <ul>
        {frontends.map((frontend, index) => (
          <li key={index}>
            <strong>{frontend.deviceName}</strong> - {frontend.timestamp}
          </li>
        ))}
      </ul>

      <h2 style={{fontSize: "1.2em"}}>Matrix Control</h2>
      <form style={{marginBottom: "20px"}}>
        <select
          onChange={(e) => setSelectedDevice(e.target.value)}
          value={selectedDevice || ""}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "10px",
          }}
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
            overflowX: "auto",
            display: "grid",
            gridTemplateColumns: `repeat(12, 1fr)`,
            gap: "4px",
            marginBottom: "10px",
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
                      ri === rowIndex && ci === colIndex ? 1 - c : c
                    )
                  );
                  updateMatrix(newMatrix);
                }}
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            ))
          )}
        </div>
      </form>

      <h2 style={{fontSize: "1.2em"}}>Motor Control</h2>
      <div>
        <label style={{display: "block", marginBottom: "10px"}}>
          Direction:
          <select
            id="motorDirection"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
            onChange={(e) =>
              updateMotorConfig(motorSpeed, e.target.value === "true")
            }
          >
            <option value="true">Forward</option>
            <option value="false">Backward</option>
          </select>
        </label>

        <label style={{display: "block", marginBottom: "20px"}}>
          Speed (lower is faster):
          <input
            type="range"
            min="200"
            max="4000"
            step="100"
            value={motorSpeed}
            onChange={(e) => {
              const speed = Number(e.target.value);
              setMotorSpeed(speed);
              updateMotorConfig(
                speed,
                (document.getElementById("motorDirection") as HTMLSelectElement)
                  .value === "true"
              );
            }}
            style={{width: "100%"}}
          />
          <div style={{textAlign: "center", marginTop: "5px"}}>
            {motorSpeed} µs
          </div>
        </label>

        <div style={{display: "flex", flexWrap: "wrap", gap: "10px"}}>
          <button
            onClick={() =>
              sendMessage({
                type: "stopMotor",
                deviceName: selectedDevice,
              })
            }
            style={{
              flex: "1 1 calc(50% - 10px)",
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Stop Motor
          </button>
          <button
            onClick={() =>
              sendMessage({
                type: "startMotor",
                deviceName: selectedDevice,
              })
            }
            style={{
              flex: "1 1 calc(50% - 10px)",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Start Motor
          </button>
        </div>
      </div>
    </div>
  );
}
