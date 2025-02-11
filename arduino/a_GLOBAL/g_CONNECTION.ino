#include <ArduinoJson.h>
//g_CONNECTION.ino



// WebSocket server details
const char* server = "89.117.76.156"; 
const uint16_t port = 4000;
const char* deviceName = "ArduinoDevice1";

// Constants
const int maxRetries = 5;           // Maximum connection attempts

// Connect to Wi-Fi
bool connectToWiFi() {
  for (int attempt = 1; attempt <= maxRetries; attempt++) {
    Serial.print("Wi-Fi connection attempt ");
    Serial.println(attempt);

    // Incrementally turn on LEDs for Wi-Fi on the left half
    turnOnIncrementally(true);

    // Attempt Wi-Fi connection
    WiFi.begin(ssid, password);
    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < 5000) {
      delay(500); // Wait up to 5 seconds for connection
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Wi-Fi connected!");
      solidMatrixHalf(true); // Left side solid for Wi-Fi
      return true;
    }
  }
  return false; // All attempts failed
}

// Connect to WebSocket
bool connectToWebSocket() {
  webSocket.begin(server, port, String("/?role=device&deviceName=") + deviceName);
  webSocket.onEvent(webSocketEvent); // Attach WebSocket event handler

  for (int attempt = 1; attempt <= maxRetries; attempt++) {
    Serial.print("WebSocket connection attempt ");
    Serial.println(attempt);

    // Incrementally turn on LEDs for WebSocket on the right half
    turnOnIncrementally(false);

    // Allow time for WebSocket connection to establish
    unsigned long startTime = millis();
    while (!isWebSocketConnected && millis() - startTime < 5000) {
      webSocket.loop(); // Keep checking for connection
      delay(100);       // Avoid busy waiting
    }

    if (isWebSocketConnected) {
      return true; // Connection successful
    }
  }
  return false; // All attempts failed
}

// WebSocket event handler
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("WebSocket connected.");
      isWebSocketConnected = true;
      break;

    case WStype_DISCONNECTED:
      Serial.println("WebSocket disconnected.");
      isWebSocketConnected = false;
      break;

    case WStype_TEXT: {
      Serial.print("Received: ");
      Serial.write(payload, length); // Correctly print the payload
      Serial.println();

      // Parse JSON payload
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, payload, length);
      if (error) {
        Serial.print("JSON parse error: ");
        Serial.println(error.c_str());
        return;
      }

      // COMMAND TYPES ******************************************
      const char* messageType = doc["type"];
      if (strcmp(messageType, "ping") == 0) {
        // Respond to ping with pong
        StaticJsonDocument<128> field;
        field["type"] = "pong";
        String response;
        serializeJson(field, response);
        webSocket.sendTXT(response.c_str());
        Serial.println("Request: ping");

      } else if (strcmp(messageType, "updateLEDMatrix") == 0) {
        //update LED matrix
        JsonArray matrixArray = doc["matrix"].as<JsonArray>();
        for (int i = 0; i < 8; i++) {
          for (int j = 0; j < 12; j++) {
            grid[i][j] = matrixArray[i][j];
          }
        }
        displayGrid();
        Serial.println("Request: updateLEDMatrix");

      } else if (strcmp(messageType, "setMotorSpeed") == 0) {
        // Check if "speed" is present and is an integer
        if (doc.containsKey("speed") && doc["speed"].is<int>()) {
          int speed = doc["speed"];
          setMotorSpeed(speed);
        } else {
          Serial.println("Error: 'speed' is missing or not an integer.");
        }
        Serial.println("Request: setMotorSpeed");

      } else if (strcmp(messageType, "setMotorDirection") == 0) {
        // Check if "direction" is present and is a boolean (or can be treated as one)
        if (doc.containsKey("direction") && doc["direction"].is<bool>()) {
          bool direction = doc["direction"];
          setMotorDirection(direction);
        } else {
          Serial.println("Error: 'direction' is missing or not a valid boolean.");
        }
        Serial.println("Request: setMotorDirection");

      } else if (strcmp(messageType, "startMotor") == 0) {
        motorActive = true;
        Serial.println("Request: startMotor");
      } else if (strcmp(messageType, "stopMotor") == 0) {
        motorActive = false; 
        stopMotor();
        Serial.println("Request: stopMotor");
      }
      break;
    }

    default:
    break;
  }
}
