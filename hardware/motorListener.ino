// Motor A (Left)
const int enA = 9;
const int in1 = 2;
const int in2 = 3;

// Motor B (Right)
const int enB = 10;
const int in3 = 4;
const int in4 = 5;

void setup() {
  // Initialize Serial Monitor at 9600 baud
  Serial.begin(9600);

  // Set all motor control pins as outputs
  pinMode(enA, OUTPUT);
  pinMode(enB, OUTPUT);
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);

  // Debug message: Pin mode setup
  Serial.println("Motor control system initialized. Waiting for camera input...");
  
  // Initialize motors in stopped state
  stopMotors();
}

void loop() {
  // Check if data is available from serial (camera system)
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    
    // Process the command from camera
    if (input == "trash" || input == "food_organics" || input == "miscellaneous_trash") {
      // For trash items, move clockwise, then return
      Serial.println("Trash detected! Flipping panel clockwise.");
      
      // Move clockwise (flip) - very short duration
      moveClockwise(1);  // Slightly higher speed for reliable movement
      delay(4);         // Drastically reduced time (100ms)
      stopMotors();
      
      // Pause briefly while item drops
      delay(3000);
      
      // Return to starting position (counter-clockwise)
      Serial.println("Returning panel to starting position.");
      moveCounterClockwise(1);
      delay(4);         // Same short time to return
      stopMotors();
    } 
    else if (input == "recycle" || input == "paper" || input == "glass" || 
             input == "metal" || input == "cardboard") {
      // For recyclable items, move counter-clockwise, then return
      Serial.println("Recyclable item detected! Flipping panel counter-clockwise.");
      
      // Move counter-clockwise (flip) - very short duration
      moveCounterClockwise(1);
      delay(4);         // Drastically reduced time (100ms)
      stopMotors();
      
      // Pause briefly while item drops
      delay(3000);
      
      // Return to starting position (clockwise)
      Serial.println("Returning panel to starting position.");
      moveClockwise(1);
      delay(4);         // Same short time to return
      stopMotors();
    }
    else {
      Serial.println("Unknown command received: " + input);
    }
  }
}

// Function to move both motors clockwise (for trash)
void moveClockwise(int speed) {
  // Motor A forward
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  analogWrite(enA, speed);
  
  // Motor B forward
  digitalWrite(in3, HIGH);
  digitalWrite(in4, LOW);
  analogWrite(enB, speed);
  
  Serial.println("Motors moving clockwise at speed: " + String(speed));
}

// Function to move both motors counter-clockwise (for recyclables)
void moveCounterClockwise(int speed) {
  // Motor A backward
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  analogWrite(enA, speed);
  
  // Motor B backward
  digitalWrite(in3, LOW);
  digitalWrite(in4, HIGH);
  analogWrite(enB, speed);
  
  Serial.println("Motors moving counter-clockwise at speed: " + String(speed));
}

// Function to stop both motors
void stopMotors() {
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enA, 0);
  analogWrite(enB, 0);
  
  Serial.println("Motors stopped");
}
