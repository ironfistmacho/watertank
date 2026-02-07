import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { formatSensorValue, getStatusText } from '@/utils/formatting';

interface SensorCardProps {
    label: string;
    value: number;
    unit: string;
    min?: number;
    max?: number;
    icon?: string;
    decimals?: number;
}

export default function SensorCard({
    label,
    value,
    unit,
    min,
    max,
    icon,
    decimals = 1,
}: SensorCardProps) {
    const status = getStatusText(value, min, max);

    const getStatusColor = () => {
        switch (status) {
            case 'Normal':
                return colors.sensorNormal;
            case 'Warning':
                return colors.sensorWarning;
            case 'Critical':
                return colors.sensorCritical;
            default:
                return colors.sensorOffline;
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            </View>

            <View style={styles.valueContainer}>
                <Text style={styles.value}>{value.toFixed(decimals)}</Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>

            {(min !== undefined || max !== undefined) && (
                <View style={styles.rangeContainer}>
                    <Text style={styles.rangeText}>
                        Range: {min !== undefined ? min.toFixed(1) : '-'} - {max !== undefined ? max.toFixed(1) : '-'} {unit}
                    </Text>
                </View>
            )}

            <Text style={[styles.status, { color: getStatusColor() }]}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    value: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    unit: {
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    rangeContainer: {
        marginBottom: spacing.xs,
    },
    rangeText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    status: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});
