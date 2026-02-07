/*
 * Water Tank Monitor - ESP32 WROOM 32 Firmware
 * 
 * Hardware:
 * - ESP32 WROOM 32
 * - pH Sensor
 * - TDS Sensor
 * - Turbidity Sensor
 * - HC-SR04 Ultrasonic Sensor
 * - 2x Solenoid Valves
 * - DC Motor
 * - UV Light
 * - 4x Tactile Buttons
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Sensor Pins
#define PH_PIN 34
#define TDS_PIN 35
#define TURBIDITY_PIN 32
#define ULTRASONIC_TRIG 5
#define ULTRASONIC_ECHO 18
#define TEMP_PIN 33

// Actuator Pins
#define VALVE_1_PIN 25
#define VALVE_2_PIN 26
#define MOTOR_PIN 27
#define UV_LIGHT_PIN 14

// Button Pins
#define BUTTON_1_PIN 12
#define BUTTON_2_PIN 13
#define BUTTON_3_PIN 15
#define BUTTON_4_PIN 4

// Constants
#define TANK_HEIGHT_CM 100 // Tank height in cm
#define SENSOR_READ_INTERVAL 2000 // 2 seconds
#define COMMAND_CHECK_INTERVAL 3000 // 3 seconds
#define DEBOUNCE_DELAY 50

// Global variables
unsigned long lastSensorRead = 0;
unsigned long lastCommandCheck = 0;
bool valve1State = false;
bool valve2State = false;
bool uvLightState = false;
int motorSpeed = 0;

// Button states
bool lastButton1State = HIGH;
bool lastButton2State = HIGH;
bool lastButton3State = HIGH;
bool lastButton4State = HIGH;
unsigned long lastDebounceTime = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Water Tank Monitor Starting...");
  
  // Initialize pins
  pinMode(VALVE_1_PIN, OUTPUT);
  pinMode(VALVE_2_PIN, OUTPUT);
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(UV_LIGHT_PIN, OUTPUT);
  
  pinMode(BUTTON_1_PIN, INPUT_PULLUP);
  pinMode(BUTTON_2_PIN, INPUT_PULLUP);
  pinMode(BUTTON_3_PIN, INPUT_PULLUP);
  pinMode(BUTTON_4_PIN, INPUT_PULLUP);
  
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  
  // Initialize actuators to OFF
  digitalWrite(VALVE_1_PIN, LOW);
  digitalWrite(VALVE_2_PIN, LOW);
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(UV_LIGHT_PIN, LOW);
  
  // Connect to WiFi
  connectWiFi();
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  // Read sensors and send data
  if (millis() - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readAndSendSensorData();
    lastSensorRead = millis();
  }
  
  // Check for commands from app
  if (millis() - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    checkForCommands();
    lastCommandCheck = millis();
  }
  
  // Handle button presses
  handleButtons();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Connection Failed!");
  }
}

float readPH() {
  int analogValue = analogRead(PH_PIN);
  float voltage = analogValue * (3.3 / 4095.0);
  // pH calculation: pH = 7 + ((2.5 - voltage) / 0.18)
  float ph = 7.0 + ((2.5 - voltage) / 0.18);
  return constrain(ph, 0, 14);
}

int readTDS() {
  int analogValue = analogRead(TDS_PIN);
  float voltage = analogValue * (3.3 / 4095.0);
  // TDS = (133.42 * voltage^3 - 255.86 * voltage^2 + 857.39 * voltage) * 0.5
  float tds = (133.42 * pow(voltage, 3) - 255.86 * pow(voltage, 2) + 857.39 * voltage) * 0.5;
  return (int)constrain(tds, 0, 2000);
}

float readTurbidity() {
  int analogValue = analogRead(TURBIDITY_PIN);
  float voltage = analogValue * (3.3 / 4095.0);
  // Turbidity in NTU (inverse relationship with voltage)
  float turbidity = -1120.4 * pow(voltage, 2) + 5742.3 * voltage - 4352.9;
  return constrain(turbidity, 0, 100);
}

float readTemperature() {
  int analogValue = analogRead(TEMP_PIN);
  float voltage = analogValue * (3.3 / 4095.0);
  // Convert voltage to temperature (assuming LM35 or similar)
  float temperature = (voltage - 0.5) * 100;
  return temperature;
}

int readWaterLevel() {
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000);
  float distance = duration * 0.034 / 2; // Convert to cm
  
  // Convert distance to percentage (100% when full)
  int percentage = (int)((TANK_HEIGHT_CM - distance) / TANK_HEIGHT_CM * 100);
  return constrain(percentage, 0, 100);
}

void readAndSendSensorData() {
  float ph = readPH();
  int tds = readTDS();
  float turbidity = readTurbidity();
  float temperature = readTemperature();
  int waterLevel = readWaterLevel();
  
  Serial.println("=== Sensor Readings ===");
  Serial.printf("pH: %.2f\n", ph);
  Serial.printf("TDS: %d ppm\n", tds);
  Serial.printf("Turbidity: %.2f NTU\n", turbidity);
  Serial.printf("Temperature: %.1f°C\n", temperature);
  Serial.printf("Water Level: %d%%\n", waterLevel);
  
  sendToSupabase(ph, tds, turbidity, temperature, waterLevel);
}

void sendToSupabase(float ph, int tds, float turbidity, float temp, int waterLevel) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/sensor_readings";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  http.addHeader("Prefer", "return=minimal");
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["ph_value"] = ph;
  doc["tds_value"] = tds;
  doc["turbidity_value"] = turbidity;
  doc["temperature"] = temp;
  doc["water_level_percentage"] = waterLevel;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.printf("Data sent successfully: %d\n", httpResponseCode);
  } else {
    Serial.printf("Error sending data: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/device_operations?device_id=eq." + 
               String(DEVICE_ID) + "&status=eq.pending&order=created_at.desc&limit=1";
  
  http.begin(url);
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String payload = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error && doc.size() > 0) {
      String command = doc[0]["command"];
      String value = doc[0]["value"];
      String operationId = doc[0]["id"];
      
      executeCommand(command, value);
      markCommandExecuted(operationId);
    }
  }
  
  http.end();
}

void executeCommand(String command, String value) {
  Serial.printf("Executing command: %s = %s\n", command.c_str(), value.c_str());
  
  if (command == "valve_1") {
    valve1State = (value == "1" || value == "true");
    digitalWrite(VALVE_1_PIN, valve1State ? HIGH : LOW);
  } else if (command == "valve_2") {
    valve2State = (value == "1" || value == "true");
    digitalWrite(VALVE_2_PIN, valve2State ? HIGH : LOW);
  } else if (command == "uv_light") {
    uvLightState = (value == "1" || value == "true");
    digitalWrite(UV_LIGHT_PIN, uvLightState ? HIGH : LOW);
  } else if (command == "motor") {
    motorSpeed = value.toInt();
    analogWrite(MOTOR_PIN, map(motorSpeed, 0, 100, 0, 255));
  } else if (command == "emergency_stop") {
    emergencyStop();
  }
}

void markCommandExecuted(String operationId) {
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/device_operations?id=eq." + operationId;
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  
  String payload = "{\"status\":\"executed\",\"executed_at\":\"now()\"}";
  http.PATCH(payload);
  http.end();
}

void handleButtons() {
  // Button 1: Toggle Valve 1
  bool button1 = digitalRead(BUTTON_1_PIN);
  if (button1 == LOW && lastButton1State == HIGH) {
    if (millis() - lastDebounceTime > DEBOUNCE_DELAY) {
      valve1State = !valve1State;
      digitalWrite(VALVE_1_PIN, valve1State ? HIGH : LOW);
      Serial.printf("Button 1: Valve 1 %s\n", valve1State ? "ON" : "OFF");
      lastDebounceTime = millis();
    }
  }
  lastButton1State = button1;
  
  // Button 2: Toggle Valve 2
  bool button2 = digitalRead(BUTTON_2_PIN);
  if (button2 == LOW && lastButton2State == HIGH) {
    if (millis() - lastDebounceTime > DEBOUNCE_DELAY) {
      valve2State = !valve2State;
      digitalWrite(VALVE_2_PIN, valve2State ? HIGH : LOW);
      Serial.printf("Button 2: Valve 2 %s\n", valve2State ? "ON" : "OFF");
      lastDebounceTime = millis();
    }
  }
  lastButton2State = button2;
  
  // Button 3: Toggle UV Light
  bool button3 = digitalRead(BUTTON_3_PIN);
  if (button3 == LOW && lastButton3State == HIGH) {
    if (millis() - lastDebounceTime > DEBOUNCE_DELAY) {
      uvLightState = !uvLightState;
      digitalWrite(UV_LIGHT_PIN, uvLightState ? HIGH : LOW);
      Serial.printf("Button 3: UV Light %s\n", uvLightState ? "ON" : "OFF");
      lastDebounceTime = millis();
    }
  }
  lastButton3State = button3;
  
  // Button 4: Emergency Stop
  bool button4 = digitalRead(BUTTON_4_PIN);
  if (button4 == LOW && lastButton4State == HIGH) {
    if (millis() - lastDebounceTime > DEBOUNCE_DELAY) {
      emergencyStop();
      lastDebounceTime = millis();
    }
  }
  lastButton4State = button4;
}

void emergencyStop() {
  Serial.println("EMERGENCY STOP ACTIVATED!");
  valve1State = false;
  valve2State = false;
  uvLightState = false;
  motorSpeed = 0;
  
  digitalWrite(VALVE_1_PIN, LOW);
  digitalWrite(VALVE_2_PIN, LOW);
  digitalWrite(UV_LIGHT_PIN, LOW);
  digitalWrite(MOTOR_PIN, LOW);
}
