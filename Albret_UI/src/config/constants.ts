// App Configuration Constants

// Sensor Thresholds (Default Values)
export const DEFAULT_THRESHOLDS = {
    PH_MIN: 6.5,
    PH_MAX: 8.5,
    TDS_MIN: 50,
    TDS_MAX: 500,
    TURBIDITY_MAX: 5,
    WATER_LEVEL_MIN: 20,
    TEMPERATURE_MAX: 35,
};

// Refresh Intervals (milliseconds)
export const REFRESH_INTERVALS = {
    SENSOR_DATA: 2000, // 2 seconds
    DEVICE_STATUS: 5000, // 5 seconds
    ALERTS: 10000, // 10 seconds
};

// Chart Configuration
export const CHART_CONFIG = {
    DAYS_7: 7,
    DAYS_30: 30,
    DAYS_90: 90,
    MAX_DATA_POINTS: 100,
};

// Actuator Constants
export const ACTUATOR_TYPES = {
    VALVE_1: 'valve_1',
    VALVE_2: 'valve_2',
    DC_MOTOR: 'dc_motor',
    UV_LIGHT: 'uv_light',
} as const;

// Alert Severity Levels
export const ALERT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical',
} as const;

// Sensor Units
export const SENSOR_UNITS = {
    PH: 'pH',
    TDS: 'ppm',
    TURBIDITY: 'NTU',
    TEMPERATURE: '°C',
    WATER_LEVEL: '%',
};

// Sensor Labels
export const SENSOR_LABELS = {
    PH: 'pH Level',
    TDS: 'Total Dissolved Solids',
    TURBIDITY: 'Water Clarity',
    TEMPERATURE: 'Temperature',
    WATER_LEVEL: 'Water Level',
};

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3,
};

// Performance Targets
export const PERFORMANCE = {
    MAX_APP_LOAD_TIME: 3000,
    MAX_SENSOR_UPDATE_LATENCY: 2000,
    MAX_ACTUATOR_RESPONSE_TIME: 3000,
};
