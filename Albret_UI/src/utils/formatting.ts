import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Format sensor value with unit
export const formatSensorValue = (value: number, unit: string, decimals: number = 1): string => {
    return `${value.toFixed(decimals)} ${unit}`;
};

// Format date/time
export const formatDateTime = (dateString: string): string => {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
};

// Format relative time (e.g., "2 minutes ago")
export const formatRelativeTime = (dateString: string): string => {
    const date = parseISO(dateString);

    if (isToday(date)) {
        return `Today at ${format(date, 'HH:mm')}`;
    }

    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'HH:mm')}`;
    }

    return formatDistanceToNow(date, { addSuffix: true });
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
};

// Format large numbers (e.g., 1000 -> 1K)
export const formatNumber = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// Get status text from value and thresholds
export const getStatusText = (
    value: number,
    min?: number,
    max?: number
): 'Normal' | 'Warning' | 'Critical' => {
    if (min !== undefined && value < min) return 'Critical';
    if (max !== undefined && value > max) return 'Critical';
    if (min !== undefined && value < min * 1.1) return 'Warning';
    if (max !== undefined && value > max * 0.9) return 'Warning';
    return 'Normal';
};

// Format actuator action
export const formatActuatorAction = (action: string): string => {
    return action
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
