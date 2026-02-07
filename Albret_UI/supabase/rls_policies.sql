-- Row-Level Security Policies for Water Tank Monitoring System

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuator_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_operations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Users Table Policies
-- =============================================
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- Devices Table Policies
-- =============================================
CREATE POLICY "Users can view their own devices"
  ON public.devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON public.devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON public.devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices"
  ON public.devices FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Sensor Readings Table Policies
-- =============================================
CREATE POLICY "Users can view sensor readings for their devices"
  ON public.sensor_readings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = sensor_readings.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow insert sensor readings from any authenticated user"
  ON public.sensor_readings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- Actuator Logs Table Policies
-- =============================================
CREATE POLICY "Users can view actuator logs for their devices"
  ON public.actuator_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert actuator logs"
  ON public.actuator_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Alerts Table Policies
-- =============================================
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- Settings Table Policies
-- =============================================
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- Calibration Data Table Policies
-- =============================================
CREATE POLICY "Users can view calibration data for their devices"
  ON public.calibration_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = calibration_data.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert calibration data for their devices"
  ON public.calibration_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = calibration_data.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update calibration data for their devices"
  ON public.calibration_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = calibration_data.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- =============================================
-- Device Operations Table Policies
-- =============================================
CREATE POLICY "Users can view operations for their devices"
  ON public.device_operations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = device_operations.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert operations for their devices"
  ON public.device_operations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = device_operations.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow update device operations status"
  ON public.device_operations FOR UPDATE
  USING (auth.role() = 'authenticated');
