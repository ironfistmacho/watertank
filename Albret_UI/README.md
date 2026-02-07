# Water Tank Monitoring System

A comprehensive IoT water quality monitoring system with React Native mobile app and ESP32 hardware integration.

## 🌟 Features

- **Real-time Monitoring**: Live sensor data (pH, TDS, Turbidity, Temperature, Water Level)
- **Remote Control**: Control solenoid valves, DC motor, and UV light from your phone
- **Smart Alerts**: Automatic notifications when sensor values exceed thresholds
- **Historical Analytics**: View 7, 30, and 90-day trends
- **Offline Support**: Works even without internet connection
- **Physical Controls**: 4 tactile buttons for local manual control
- **Secure Authentication**: User account management with email verification

## 📱 Mobile App

Built with:
- React Native 0.72.0
- TypeScript
- Expo SDK 49+
- Supabase (Backend & Real-time)
- Zustand (State Management)
- React Navigation

## 🔧 Hardware

### Components Required:
- ESP32 WROOM 32 development board
- pH sensor module
- TDS (Total Dissolved Solids) sensor
- Turbidity sensor
- HC-SR04 ultrasonic sensor
- 2x 12V solenoid valves
- 12V DC motor
- UV LED/lamp module
- 4x tactile push buttons
- Relay modules (for 12V actuators)
- 12V power supply
- 5V power supply (for ESP32)

### Pin Connections:
See `esp32/README.md` for detailed wiring diagram

## 🚀 Getting Started

### 1. Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL scripts in this order:
   ```bash
   # In Supabase SQL Editor
   1. supabase/schema.sql
   2. supabase/rls_policies.sql
   3. supabase/functions.sql
   ```
4. Get your project URL and anon key from Project Settings > API

### 2. Mobile App Setup

```bash
# Install dependencies
cd "project app"
npm install

# Configure Supabase credentials
# Add to app.json in "extra" section:
{
  "expo": {
    "extra": {
      "supabaseUrl": "your-supabase-url",
      "supabaseAnonKey": "your-anon-key"
    }
  }
}

# Start development server
npm start

# Run on Android
npm run android
```

### 3. ESP32 Setup

```bash
# Install Arduino IDE and ESP32 board support
# Install required libraries:
# - WiFi (built-in)
# - HTTPClient (built-in)
# - ArduinoJson

# Configure ESP32
1. Copy esp32/water_tank_monitor/config.h.example to config.h
2. Fill in your WiFi credentials
3. Fill in your Supabase URL and anon key
4. Get device UUID from app (create device first)
5. Upload to ESP32
```

## 📊 Database Schema

- **users**: User profiles and authentication
- **devices**: ESP32 device registrations
- **sensor_readings**: Time-series sensor data
- **actuator_logs**: Hardware operation history
- **alerts**: Threshold-based notifications
- **settings**: User configuration preferences
- **calibration_data**: Sensor calibration parameters
- **device_operations**: Command queue for ESP32

## 🔐 Security

- Row-Level Security (RLS) policies ensure data isolation
- JWT-based authentication
- HTTPS/WSS for all communications
- No hardcoded secrets in code

## 📈 Performance

- Sensor updates: < 2 seconds
- Actuator response: < 3 seconds
- App launch: < 3 seconds
- Real-time subscriptions via Supabase

## 🛠️ Development

```bash
# Type checking
npm run typecheck

# Build for production
npm run build:android
```

## 📖 Documentation

- [ESP32 Wiring Guide](esp32/README.md)
- [API Documentation](docs/API.md)
- [Supabase Setup Guide](docs/SUPABASE.md)

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

MIT License

## 🆘 Support

For issues or questions, please check the documentation or create an issue on GitHub.

---

**Built with ❤️ using React Native, ESP32, and Supabase**
