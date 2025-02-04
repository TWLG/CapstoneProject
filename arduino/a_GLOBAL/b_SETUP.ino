//b_SETUP.ino

void setup() {
  delay(2000);

  Serial.begin(9600);
  matrix.begin();           // Initialize the LED matrix
  clearGrid();              // Clear the matrix (all LEDs off)
  displayGrid();

  pinMode(stepPin, OUTPUT);
  pinMode(directionPin, OUTPUT);
  pinMode(alarmPin, INPUT);

    // Connect to Wi-Fi
  Serial.println("Connecting to Wi-Fi...");
  if (!connectToWiFi()) {
    Serial.println("Wi-Fi connection failed. Left side blinking indefinitely.");
    while (true) {
      blinkMatrixHalf(true); // Left side blinking indefinitely
    }
  }

    // Connect to WebSocket
  Serial.println("Connecting to WebSocket...");
  if (!connectToWebSocket()) {
    Serial.println("WebSocket connection failed. Right side blinking indefinitely.");

  }

  // Both Wi-Fi and WebSocket are connected
  Serial.println("Both Wi-Fi and WebSocket connected.");
  flashMatrix(4); // Flash entire matrix 4 times
  clearGrid();    // Clear the matrix

}