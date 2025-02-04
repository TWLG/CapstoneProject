// c_LOOP.ino
unsigned long lastWebSocketCheck = 0;  // Store the last execution time
const unsigned long webSocketInterval = 1000;  // Run every 100ms (adjust as needed)

void loop() {
    unsigned long currentMillis = millis();
    
    // Only call webSocket.loop() at the defined interval
    if (isWebSocketConnected && (currentMillis - lastWebSocketCheck >= webSocketInterval)) {
        lastWebSocketCheck = currentMillis;  // Update last execution time
        webSocket.loop();
    }

    // Other tasks
    if (motorActive) {
        startMotor();
    }
}