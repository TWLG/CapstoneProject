//a_GLOBAL.ino

#include <WiFi.h>                   // For Wi-Fi connections
#include <WebSocketsClient.h>       // WebSocket client library
#include "Arduino_LED_Matrix.h"     // LED Matrix library
#include <ArduinoJson.h>

// Pin assignments 
const int stepPin = 8; // Pin to send step pulses
const int directionPin = 9;  // Pin for direction control
const int alarmPin = 10;    // Alarm pin

// LED Matrix instance
ArduinoLEDMatrix matrix;

// Define the LED grid
uint8_t grid[8][12] = {0}; // Initialize all LEDs to off

// Function prototypes
bool connectToWiFi();
bool connectToWebSocket();
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length); // Declare the webSocketEvent function

void setMotorSpeed(int speed);
void startMotor();
void stopMotor();
void setMotorDirection(bool direction);

void clearGrid();
void displayGrid();
void flashMatrix(int times);
void turnOnIncrementally(bool isWiFi);
void blinkMatrixHalf(bool isWiFi);
void solidMatrixHalf(bool isWiFi);


// Timing variables
unsigned long lastStepTime = 0; 
bool motorActive = false;     // Motor activity flag
unsigned long currentMotorSpeed = 500; // Speed, microseconds between steps (higher = slower) ex: 2000
bool motorDirection = true; // true = forward, false = backward

// WebSocket client instance
WebSocketsClient webSocket;

bool isWebSocketConnected = false;




