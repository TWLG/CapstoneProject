//d_LED_MATRIX.ino

const int blinkDelay = 500;         // Blink delay in milliseconds

// Clear the LED grid (set all LEDs to off)
void clearGrid() {
  for (int i = 0; i < 8; i++) {
    for (int j = 0; j < 12; j++) {
      grid[i][j] = 0;
    }
  }
  displayGrid();
}

// Render the grid on the matrix
void displayGrid() {
  matrix.renderBitmap(grid, 8, 12);
}

// Flash the entire matrix a specified number of times
void flashMatrix(int times) {
  for (int t = 0; t < times; t++) {
    // Turn on all LEDs
    for (int i = 0; i < 8; i++) {
      for (int j = 0; j < 12; j++) {
        grid[i][j] = 1;
      }
    }
    displayGrid();
    delay(blinkDelay);

    // Turn off all LEDs
    clearGrid();
    delay(blinkDelay);
  }
}

// Incrementally turn on LEDs for Wi-Fi (left) or WebSocket (right)
void turnOnIncrementally(bool isWiFi) {
  static int currentRow = 0, currentCol = 0;
  int startCol = isWiFi ? 0 : 6;   // Left half starts at 0, right half starts at 6
  int endCol = isWiFi ? 6 : 12;    // Left half ends at 6, right half ends at 12

  if (currentRow < 8 && currentCol < endCol) {
    grid[currentRow][currentCol] = 1;
    currentCol++;
    if (currentCol >= endCol) {
      currentCol = startCol;
      currentRow++;
    }
    displayGrid();
  }
}

// Blink half of the matrix (left for Wi-Fi, right for WebSocket)
void blinkMatrixHalf(bool isWiFi) {
  int startCol = isWiFi ? 0 : 6;   // Left half starts at 0, right half starts at 6
  int endCol = isWiFi ? 6 : 12;    // Left half ends at 6, right half ends at 12

  for (int t = 0; t < 2; t++) { // Blink twice
    // Turn on the half
    for (int row = 0; row < 8; row++) {
      for (int col = startCol; col < endCol; col++) {
        grid[row][col] = 1;
      }
    }
    displayGrid();
    delay(blinkDelay);

    // Turn off the half
    for (int row = 0; row < 8; row++) {
      for (int col = startCol; col < endCol; col++) {
        grid[row][col] = 0;
      }
    }
    displayGrid();
    delay(blinkDelay);
  }
}

// Turn on half of the matrix solidly
void solidMatrixHalf(bool isWiFi) {
  int startCol = isWiFi ? 0 : 6;   // Left half starts at 0, right half starts at 6
  int endCol = isWiFi ? 6 : 12;    // Left half ends at 6, right half ends at 12

  for (int row = 0; row < 8; row++) {
    for (int col = startCol; col < endCol; col++) {
      grid[row][col] = 1;
    }
  }
  displayGrid();
}