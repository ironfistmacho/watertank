# 📱 How to Connect Your Phone to the App

Your computer's Metro bundler is running at:
- **Local URL**: `exp://127.0.0.1:8081` (only works on this computer)
- **Network URL**: `exp://10.241.196.106:8081` ✅ **USE THIS ONE**

## Steps to Connect Your Phone:

1. **Make sure your phone and computer are on the same WiFi network**

2. **Open Expo Go app** on your Android phone

3. **Tap "Enter URL manually"** at the bottom

4. **Type exactly**:
   ```
   exp://10.241.196.106:8082
   ```

5. **Press "Connect"**

Your app should load in a few seconds!

---

## If It Still Doesn't Work:

### Option 1: Check WiFi
- Both devices must be on the **same WiFi network**
- Turn off mobile data on your phone
- Reconnect to WiFi

### Option 2: Windows Firewall
Run this in PowerShell as Administrator:
```powershell
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8082
```

### Option 3: Use Android Emulator Instead
If you have Android Studio installed:
1. Start the emulator
2. In the terminal where Metro is running, press `a`

---

## Current Status:
✅ Metro bundler is running in offline mode
✅ No network errors  
✅ Ready to accept connections

**Your connection URL**: `exp://10.241.196.106:8082`
