-- Water Tank Monitoring System - Database Schema
-- This SQL script creates all required tables, indexes, and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Users Table (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Devices Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_id_hardware TEXT UNIQUE NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_devices_online ON public.devices(is_online);

-- =============================================
-- Sensor Readings Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  ph_value DECIMAL(4,2) NOT NULL,
  tds_value INTEGER NOT NULL,
  turbidity_value DECIMAL(5,2) NOT NULL,
  temperature DECIMAL(4,1) NOT NULL,
  water_level_percentage INTEGER NOT NULL CHECK (water_level_percentage >= 0 AND water_level_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sensor_readings_device_id ON public.sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_created_at ON public.sensor_readings(created_at DESC);

-- =============================================
-- Actuator Logs Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.actuator_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  actuator_type TEXT NOT NULL CHECK (actuator_type IN ('valve_1', 'valve_2', 'dc_motor', 'uv_light')),
  action TEXT NOT NULL,
  value DECIMAL(5,2),
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('user', 'system', 'button')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_actuator_logs_device_id ON public.actuator_logs(device_id);
CREATE INDEX idx_actuator_logs_user_id ON public.actuator_logs(user_id);
CREATE INDEX idx_actuator_logs_created_at ON public.actuator_logs(created_at DESC);

-- =============================================
-- Alerts Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  sensor_value DECIMAL(10,2),
  threshold_value DECIMAL(10,2),
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_device_id ON public.alerts(device_id);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON public.alerts(is_acknowledged);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);

-- =============================================
-- Settings Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ph_min DECIMAL(4,2) DEFAULT 6.5,
  ph_max DECIMAL(4,2) DEFAULT 8.5,
  tds_min INTEGER DEFAULT 50,
  tds_max INTEGER DEFAULT 500,
  turbidity_max DECIMAL(5,2) DEFAULT 5.0,
  water_level_min INTEGER DEFAULT 20,
  temperature_max DECIMAL(4,1) DEFAULT 35.0,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_user_id ON public.settings(user_id);

-- =============================================
-- Calibration Data Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.calibration_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('ph', 'tds', 'turbidity', 'ultrasonic')),
  calibration_offset DECIMAL(10,4) DEFAULT 0,
  calibration_multiplier DECIMAL(10,4) DEFAULT 1,
  calibrated_at TIMESTAMPTZ DEFAULT NOW(),
  calibrated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_calibration_device_id ON public.calibration_data(device_id);
CREATE INDEX idx_calibration_sensor_type ON public.calibration_data(sensor_type);

-- =============================================
-- Device Operations Table (for ESP32 commands)
-- =============================================
CREATE TABLE IF NOT EXISTS public.device_operations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  command TEXT NOT NULL,
  value TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed')),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_device_operations_device_id ON public.device_operations(device_id);
CREATE INDEX idx_device_operations_status ON public.device_operations(status);
CREATE INDEX idx_device_operations_created_at ON public.device_operations(created_at DESC);
