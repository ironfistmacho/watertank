-- Database Functions and Triggers for Water Tank Monitoring System

-- =============================================
-- Function: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Function: Create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create default settings for new user
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Function: Check sensor thresholds and create alerts
-- =============================================
CREATE OR REPLACE FUNCTION public.check_sensor_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  device_user_id UUID;
  user_settings RECORD;
BEGIN
  -- Get device owner
  SELECT user_id INTO device_user_id
  FROM public.devices
  WHERE id = NEW.device_id;
  
  -- Get user settings
  SELECT * INTO user_settings
  FROM public.settings
  WHERE user_id = device_user_id;

  -- Check pH
  IF user_settings.ph_min IS NOT NULL AND NEW.ph_value < user_settings.ph_min THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'pH Low', 'critical', 
            'pH level is below minimum threshold', NEW.ph_value, user_settings.ph_min);
  END IF;

  IF user_settings.ph_max IS NOT NULL AND NEW.ph_value > user_settings.ph_max THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'pH High', 'critical',
            'pH level is above maximum threshold', NEW.ph_value, user_settings.ph_max);
  END IF;

  -- Check TDS
  IF user_settings.tds_min IS NOT NULL AND NEW.tds_value < user_settings.tds_min THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'TDS Low', 'warning',
            'TDS level is below minimum threshold', NEW.tds_value, user_settings.tds_min);
  END IF;

  IF user_settings.tds_max IS NOT NULL AND NEW.tds_value > user_settings.tds_max THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'TDS High', 'warning',
            'TDS level is above maximum threshold', NEW.tds_value, user_settings.tds_max);
  END IF;

  -- Check Turbidity
  IF user_settings.turbidity_max IS NOT NULL AND NEW.turbidity_value > user_settings.turbidity_max THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'Turbidity High', 'critical',
            'Water turbidity is above maximum threshold', NEW.turbidity_value, user_settings.turbidity_max);
  END IF;

  -- Check Water Level
  IF user_settings.water_level_min IS NOT NULL AND NEW.water_level_percentage < user_settings.water_level_min THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'Water Level Low', 'critical',
            'Water level is below minimum threshold', NEW.water_level_percentage, user_settings.water_level_min);
  END IF;

  -- Check Temperature
  IF user_settings.temperature_max IS NOT NULL AND NEW.temperature > user_settings.temperature_max THEN
    INSERT INTO public.alerts (device_id, user_id, alert_type, severity, message, sensor_value, threshold_value)
    VALUES (NEW.device_id, device_user_id, 'Temperature High', 'warning',
            'Temperature is above maximum threshold', NEW.temperature, user_settings.temperature_max);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check thresholds on sensor reading insert
CREATE TRIGGER check_thresholds_on_sensor_reading
  AFTER INSERT ON public.sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_sensor_thresholds();

-- =============================================
-- Function: Update device online status
-- =============================================
CREATE OR REPLACE FUNCTION public.update_device_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices
  SET is_online = TRUE, last_seen = NOW()
  WHERE id = NEW.device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update device status on sensor reading
CREATE TRIGGER update_device_online_status
  AFTER INSERT ON public.sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_device_status();
