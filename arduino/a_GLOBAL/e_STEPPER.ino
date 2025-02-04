
// Variables
int stepsPerRevolution = 200; // 1.8° step angle -> 200 steps per revolution
//e_STEPPER.ino

void stopMotor() {
  digitalWrite(stepPin, LOW); // Stop sending step pulses
  Serial.println("Motor stopped.");
}

void startMotor() {
  unsigned long currentTime = micros();
  if (currentTime - lastStepTime >= currentMotorSpeed) { // Hardcoded value for testing
    lastStepTime = currentTime;

    // Determine direction
    if (motorDirection == true) {
      digitalWrite(directionPin, HIGH); // Move forward
    } else {
      digitalWrite(directionPin, LOW);  // Move backward
    }

    // Generate a step pulse
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(2); // Short pulse to ensure step is registered
    digitalWrite(stepPin, LOW);
  }
}

// Set motor speed
void setMotorSpeed(int speed) {
  currentMotorSpeed = constrain(speed, 200, 4000); // Limit speed to a valid range
  unsigned long lastStepTime = 0; 
  Serial.print("Motor speed set to: ");
  Serial.println(currentMotorSpeed);
}

// Set motor direction
void setMotorDirection(bool direction) {
  motorDirection = direction;
  Serial.print("Motor direction set to: ");
  Serial.println(direction ? "Forward" : "Backward");
}