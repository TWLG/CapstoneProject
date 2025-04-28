#include <ArduinoJson.h>
#include <cstring>

// c_LOOP.ino
unsigned long lastWebSocketCheck = 0;         // Store the last execution time
const unsigned long webSocketInterval = 1000; // Run every 100ms (adjust as needed)

// …existing code…

void loop()
{
    unsigned long currentMillis = millis();
    if (isWebSocketConnected && (currentMillis - lastWebSocketCheck >= webSocketInterval))
    {
        lastWebSocketCheck = currentMillis;
        webSocket.loop();
    }

    if (newCommand)
    {
        newCommand = false;
        StaticJsonDocument<256> doc;
        auto err = deserializeJson(doc, lastPayload);
        if (err)
        {
            Serial.print("JSON parse error: ");
            Serial.println(err.c_str());
        }
        else
        {
            const char *messageType = doc["type"];
            if (strcmp(messageType, "ping") == 0)
            {
                // respond with pong
                StaticJsonDocument<128> reply;
                reply["type"] = "pong";
                String out;
                serializeJson(reply, out);
                webSocket.sendTXT(out);
                Serial.println("Handled: ping");
            }
            else if (strcmp(messageType, "updateLEDMatrix") == 0)
            {
                // copy matrix into grid
                auto matrixArr = doc["matrix"].as<JsonArray>();
                for (int i = 0; i < 8; i++)
                    for (int j = 0; j < 12; j++)
                        grid[i][j] = matrixArr[i][j];
                displayGrid();
                Serial.println("Handled: updateLEDMatrix");
            }
            else if (strcmp(messageType, "setMotorSpeed") == 0)
            {
                int speed = doc["speed"] | currentMotorSpeed;
                setMotorSpeed(speed);
                Serial.println("Handled: setMotorSpeed");
            }
            else if (strcmp(messageType, "setMotorDirection") == 0)
            {
                bool dir = doc["direction"] | motorDirection;
                setMotorDirection(dir);
                Serial.println("Handled: setMotorDirection");
            }
            else if (strcmp(messageType, "startMotor") == 0)
            {
                motorActive = true;
                Serial.println("Handled: startMotor");
            }
            else if (strcmp(messageType, "stopMotor") == 0)
            {
                motorActive = false;
                stopMotor();
                Serial.println("Handled: stopMotor");
            }
        }
    }

    if (motorActive)
        startMotor();
}