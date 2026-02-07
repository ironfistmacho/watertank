# ESP32 Water Tank Monitor - Hardware Guide

## Pin Configuration

### Sensor Connections

| Sensor | ESP32 Pin | Type | Notes |
|--------|-----------|------|-------|
| pH Sensor | GPIO 34 | Analog | 0-3.3V input |
| TDS Sensor | GPIO 35 | Analog | 0-3.3V input |
| Turbidity Sensor | GPIO 32 | Analog | 0-3.3V input |
| Temperature Sensor | GPIO 33 | Analog | LM35 or similar |
| Ultrasonic TRIG | GPIO 5 | Digital Out | HC-SR04 |
| Ultrasonic ECHO | GPIO 18 | Digital In | HC-SR04 |

### Actuator Connections (via Relay Modules)

| Actuator | ESP32 Pin | Relay | Notes |
|----------|-----------|-------|-------|
| Solenoid Valve 1 | GPIO 25 | 12V Relay | Normally closed |
| Solenoid Valve 2 | GPIO 26 | 12V Relay | Normally closed |
| DC Motor | GPIO 27 | 12V Relay/PWM | Speed control |
| UV Light | GPIO 14 | 12V Relay | On/Off control |

### Button Connections

| Button | ESP32 Pin | Function |
|--------|-----------|----------|
| Button 1 | GPIO 12 | Toggle Valve 1 |
| Button 2 | GPIO 13 | Toggle Valve 2 |
| Button 3 | GPIO 15 | Toggle UV Light |
| Button 4 | GPIO 4 | Emergency Stop |

**Note**: All buttons use internal pull-up resistors. Connect one side to GND and the other to the GPIO pin.

## Wiring Diagram

```
ESP32 WROOM 32
┌─────────────────────────┐
│                         │
│  34 ──────► pH Sensor   │
│  35 ──────► TDS Sensor  │
│  32 ──────► Turbidity   │
│  33 ──────► Temperature │
│   5 ──────► TRIG (HC-SR04)
│  18 ◄────── ECHO (HC-SR04)
│                         │
│  25 ──────► Valve 1 Relay
│  26 ──────► Valve 2 Relay
│  27 ──────► Motor Relay │
│  14 ──────► UV Relay    │
│                         │
│  12 ◄────┬─ Button 1    │
│  13 ◄────┼─ Button 2    │
│  15 ◄────┼─ Button 3    │
│   4 ◄────┴─ Button 4    │
│          │              │
│         GND             │
│                         │
│  VIN ◄── 5V Power       │
│  GND ◄── GND            │
└─────────────────────────┘
```

## Power Supply

### ESP32
- Input: 5V DC (via microUSB or VIN pin)
- Current: ~500mA minimum

### Actuators (12V)
- Solenoid Valves: 12V DC @ 0.5A each
- DC Motor: 12V DC @ 1-2A
- UV Light: 12V DC @ 0.3A
- Total: 12V @ 3-4A power supply recommended

**Important**: Use separate power supplies for ESP32 (5V) and actuators (12V). Connect grounds together.

## Relay Module Setup

Use 4-channel 5V relay module:
1. Connect VCC to ESP32 3.3V
2. Connect GND to ESP32 GND
3. Connect IN1-IN4 to GPIO pins (25, 26, 27, 14)
4. Connect COM to 12V+
5. Connect NO (Normally Open) to actuator positive
6. Connect actuator negative to 12V GND

## Sensor Calibration

### pH Sensor
1. Prepare pH 7.0 buffer solution
2. Read voltage at pH 7.0
3. Adjust `PH_CALIBRATION_OFFSET` in config.h
4. Test with pH 4.0 and pH 10.0 buffers

### TDS Sensor
1. Use known TDS solution (e.g., 500 ppm)
2. Compare reading with expected value
3. Adjust `TDS_CALIBRATION_MULTIPLIER` in config.h

### Turbidity Sensor
1. Use clear distilled water as reference (0 NTU)
2. Adjust `TURBIDITY_CALIBRATION_OFFSET` if needed

### Ultrasonic Sensor
1. Measure actual tank height
2. Update `TANK_HEIGHT_CM` in the main sketch
3. Test with known water levels

## Safety Considerations

⚠️ **IMPORTANT SAFETY WARNINGS**:

1. **Electrical Safety**
   - Keep ESP32 and electronics away from water
   - Use proper waterproof enclosures
   - Ensure all connections are insulated

2. **Water Safety**
   - Test all sensors in clean water first
   - Never touch sensors while circuit is powered
   - Use food-grade materials for drinking water

3. **Actuator Safety**
   - Verify relay ratings match actuator requirements
   - Add flyback diodes for inductive loads
   - Test emergency stop before deployment

4. **Power Safety**
   - Use fused power supplies
   - Never mix 5V and 12V connections
   - Double-check polarity before powering on

## Troubleshooting

### ESP32 Won't Connect to WiFi
- Check SSID and password in config.h
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Move closer to router

### Sensors Reading 0 or Max Values
- Check wiring connections
- Verify sensor power supply (usually 3.3V or 5V)
- Test with multimeter

### Actuators Not Responding
- Check relay module LED indicators
- Verify GPIO pin assignments
- Test relay with manual trigger
- Check 12V power supply

### Data Not Appearing in App
- Verify Supabase URL and key in config.h
- Check device UUID matches database
- Monitor Serial output for errors
- Confirm internet connection

## Arduino Libraries Required

Install via Arduino Library Manager:
- ArduinoJson (v6.x)
- WiFi (built-in)
- HTTPClient (built-in)

## Upload Instructions

1. Connect ESP32 via USB
2. Select board: "ESP32 Dev Module"
3. Select port
4. Upload code
5. Open Serial Monitor (115200 baud)
6. Press EN button to restart
7. Verify WiFi connection and sensor readings

## Maintenance

- Clean sensors monthly
- Calibrate pH sensor every 3 months
- Check relay contacts periodically
- Replace UV bulb as per manufacturer specs
- Inspect wiring for corrosion

---

For more information, see the main README.md
