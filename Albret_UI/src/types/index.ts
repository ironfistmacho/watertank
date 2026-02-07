// Sensor Reading Types
export interface SensorReading {
    id: string;
    device_id: string;
    ph_value: number;
    tds_value: number;
    turbidity_value: number;
    temperature: number;
    water_level_percentage: number;
    created_at: string;
}

// Device Types
export interface Device {
    id: string;
    user_id: string;
    device_name: string;
    device_id_hardware: string;
    is_online: boolean;
    last_seen: string;
    created_at: string;
    updated_at: string;
}

// Alert Types
export enum AlertSeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical'
}

export interface Alert {
    id: string;
    device_id: string;
    user_id: string;
    alert_type: string;
    severity: AlertSeverity;
    message: string;
    sensor_value?: number;
    threshold_value?: number;
    is_acknowledged: boolean;
    acknowledged_at?: string;
    created_at: string;
}

// Actuator Types
export enum ActuatorType {
    VALVE_1 = 'valve_1',
    VALVE_2 = 'valve_2',
    DC_MOTOR = 'dc_motor',
    UV_LIGHT = 'uv_light'
}

export interface ActuatorLog {
    id: string;
    device_id: string;
    user_id: string;
    actuator_type: ActuatorType;
    action: string;
    value?: number;
    triggered_by: 'user' | 'system' | 'button';
    created_at: string;
}

// Settings Types
export interface UserSettings {
    id: string;
    user_id: string;
    ph_min: number;
    ph_max: number;
    tds_min: number;
    tds_max: number;
    turbidity_max: number;
    water_level_min: number;
    temperature_max: number;
    notifications_enabled: boolean;
    updated_at: string;
}

// Calibration Types
export interface CalibrationData {
    id: string;
    device_id: string;
    sensor_type: 'ph' | 'tds' | 'turbidity' | 'ultrasonic';
    calibration_offset: number;
    calibration_multiplier: number;
    calibrated_at: string;
    calibrated_by: string;
}

// User Profile Types
export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

// Auth Types
export interface AuthState {
    user: UserProfile | null;
    session: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Command Types for ESP32 Communication
export interface DeviceCommand {
    device_id: string;
    command: 'valve_1' | 'valve_2' | 'motor' | 'uv_light' | 'emergency_stop';
    value: number | boolean;
    timestamp: string;
}

// Chart Data Types
export interface ChartDataPoint {
    timestamp: string;
    value: number;
}

export interface SensorChartData {
    ph: ChartDataPoint[];
    tds: ChartDataPoint[];
    turbidity: ChartDataPoint[];
    water_level: ChartDataPoint[];
    temperature: ChartDataPoint[];
}
