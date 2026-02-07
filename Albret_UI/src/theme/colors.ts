export const colors = {
    // Primary Colors
    primary: '#0066cc',
    primaryDark: '#004c99',
    primaryLight: '#3385d6',

    // Secondary Colors
    secondary: '#00cc99',
    secondaryDark: '#009973',
    secondaryLight: '#33d6ad',

    // Accent Colors
    accent: '#ff6b35',
    accentDark: '#ff4500',
    accentLight: '#ff8c5c',

    // Status Colors
    success: '#00c853',
    warning: '#ffa726',
    danger: '#f44336',
    info: '#29b6f6',

    // Neutral Colors
    white: '#ffffff',
    black: '#000000',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',

    // Background Colors
    background: '#f8f9fa',
    backgroundDark: '#121212',
    surface: '#ffffff',
    surfaceDark: '#1e1e1e',

    // Text Colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#bdbdbd',
    textPrimaryDark: '#ffffff',
    textSecondaryDark: '#b0b0b0',

    // Sensor Status Colors
    sensorNormal: '#00c853',
    sensorWarning: '#ffa726',
    sensorCritical: '#f44336',
    sensorOffline: '#9e9e9e',

    // Chart Colors
    chartPH: '#2196f3',
    chartTDS: '#4caf50',
    chartTurbidity: '#ff9800',
    chartTemperature: '#f44336',
    chartWaterLevel: '#00bcd4',
};

export type ColorKey = keyof typeof colors;

export default colors;
