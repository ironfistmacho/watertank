# Quick Start Guide - Water Tank Monitor

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Copy your **Project URL** and **anon/public API key**
4. Go to SQL Editor and run these scripts **in order**:
   - Copy/paste `supabase/schema.sql` → Run
   - Copy/paste `supabase/rls_policies.sql` → Run
   - Copy/paste `supabase/functions.sql` → Run

### Step 2: Configure & Run Mobile App (10 min)

```powershell
# Open PowerShell in project directory
cd "C:\Users\jacob\OneDrive\Documents\project app"

# Install dependencies (first time only)
npm install

# Install Babel module resolver (required)
npm install --save-dev babel-plugin-module-resolver
```

**Configure Supabase** - Edit `app.json`:
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

**Run the app:**
```powershell
npm start
```

Then press `a` to run on Android, or scan QR code with Expo Go app.

### Step 3: Upload ESP32 Firmware (15 min)

**Install Arduino IDE:**
1. Download from [arduino.cc](https://www.arduino.cc/en/software)
2. Go to File → Preferences → Additional Board Manager URLs
3. Add: `https://dl.espressif.com/dl/package_esp32_index.json`
4. Tools → Board → Boards Manager → Search "ESP32" → Install

**Install Libraries:**
1. Tools → Manage Libraries
2. Search and install "ArduinoJson" (version 6.x)

**Configure & Upload:**
1. Open `esp32/water_tank_monitor/water_tank_monitor.ino`
2. Create `config.h` from `config.h.example`:
   ```cpp
   #define WIFI_SSID "YourWiFiName"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define SUPABASE_URL "https://your-project.supabase.co"
   #define SUPABASE_ANON_KEY "your-anon-key"
   #define DEVICE_ID "get-from-app-after-creating-device"
   ```
3. Connect ESP32 via USB
4. Select: Tools → Board → "ESP32 Dev Module"
5. Select: Tools → Port → (your ESP32 port)
6. Click Upload ⬆️
7. Open Serial Monitor (115200 baud) to verify

---

## 📱 First Time App Usage

1. **Sign Up**
   - Launch app
   - Click "Sign Up"
   - Enter email, password, full name
   - Check email for verification

2. **Add Device**
   - Log in to app
   - Go to Settings (future feature: will be in Device Management)
   - For now, add device directly in Supabase:
     - Go to Supabase Table Editor
     - Open `devices` table
     - Insert row:
       - user_id: (your user ID from `users` table)
       - device_name: "My Tank Monitor"
       - device_id_hardware: "ESP32-001" (or any unique ID)
     - Copy the generated UUID

3. **Update ESP32 Config**
   - Paste the device UUID into `config.h` as `DEVICE_ID`
   - Re-upload firmware

4. **Start Monitoring!**
   - Go to Dashboard tab
   - You should see sensor readings updating every 2 seconds
   - Try the Controls tab to test actuators

---

## 🔧 Hardware Minimal Test Setup

Don't have all sensors yet? Test with this minimal setup:

**Required:**
- ESP32 WROOM 32
- USB cable
- WiFi connection

**Optional (for testing):**
- 1 LED + resistor (for UV light test)
- 1 push button (for emergency stop test)

**Wiring:**
```
LED (UV Light test):
- ESP32 GPIO 14 → LED (+) → 220Ω resistor → GND

Button (Emergency Stop):
- ESP32 GPIO 4 → Button → GND
```

The firmware will run without sensors (will send placeholder data).

---

## 🐛 Common Issues

**"Module not found" errors:**
```powershell
npm install
```

**Expo "Network response timed out":**
- Make sure PC and phone are on same WiFi
- Try: `expo start --tunnel`

**ESP32 won't upload:**
- Hold BOOT button while clicking Upload
- Check correct COM port selected
- Try different USB cable

**No sensor data in app:**
- Check Serial Monitor for ESP32 errors
- Verify WiFi connection
- Confirm Supabase URL/key are correct
- Check device UUID matches database

**App crashes on startup:**
- Clear Expo cache: `npm start --clear`
- Reinstall: `npm install`

---

## 📊 What You Should See

### On ESP32 Serial Monitor:
```
Water Tank Monitor Starting...
Connecting to WiFi....
WiFi Connected!
IP: 192.168.1.100
=== Sensor Readings ===
pH: 7.12
TDS: 245 ppm
Turbidity: 2.34 NTU
Temperature: 25.6°C
Water Level: 75%
Data sent successfully: 201
```

### In Mobile App:
- Dashboard shows live sensor values
- Water level gauge animates
- Device shows "Online" status
- Alerts appear for threshold violations

---

## ⚡ Quick Test Commands

**Test Supabase connection:**
```sql
-- In Supabase SQL Editor
SELECT * FROM users;
SELECT * FROM devices;
SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 10;
```

**Test real-time updates:**
1. Keep app open on Dashboard
2. Watch Serial Monitor on ESP32
3. Sensor values should update in app within 2 seconds

**Test hardware control:**
1. Go to Controls tab in app
2. Toggle UV Light
3. Check `actuator_logs` table in Supabase
4. ESP32 should execute command (check Serial Monitor)

---

## 📞 Need Help?

1. Check the main [README.md](README.md)
2. Review [ESP32 Hardware Guide](esp32/README.md)
3. Check Supabase SQL Editor for errors
4. Check ESP32 Serial Monitor output
5. Review browser console for app errors

---

**You're all set! Happy monitoring! 💧**
