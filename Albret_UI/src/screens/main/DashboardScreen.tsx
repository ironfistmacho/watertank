import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSensorStore } from '@/store/sensorStore';
import SensorCard from '@/components/SensorCard';
import WaterLevelGauge from '@/components/WaterLevelGauge';
import { DEFAULT_THRESHOLDS, SENSOR_LABELS, SENSOR_UNITS } from '@/config/constants';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { formatRelativeTime } from '@/utils/formatting';

export default function DashboardScreen() {
    const user = useAuthStore(state => state.user);
    const selectedDevice = useDeviceStore(state => state.selectedDevice);
    const { latestReading, lastUpdate, fetchLatestReading, subscribeToReadings } = useSensorStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (selectedDevice?.id) {
            fetchLatestReading(selectedDevice.id);
            const unsubscribe = subscribeToReadings(selectedDevice.id);
            return unsubscribe;
        }
    }, [selectedDevice?.id]);

    const handleRefresh = async () => {
        if (selectedDevice?.id) {
            setIsRefreshing(true);
            await fetchLatestReading(selectedDevice.id);
            setIsRefreshing(false);
        }
    };

    if (!selectedDevice) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No device selected</Text>
                <Text style={styles.emptySubtext}>Please add a device to start monitoring</Text>
            </View>
        );
    }

    if (!latestReading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading sensor data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                </View>
                <View style={styles.deviceStatus}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: selectedDevice.is_online ? colors.success : colors.danger }
                    ]} />
                    <Text style={styles.deviceName}>{selectedDevice.device_name}</Text>
                </View>
            </View>

            {lastUpdate && (
                <Text style={styles.lastUpdate}>
                    Last updated: {formatRelativeTime(lastUpdate.toISOString())}
                </Text>
            )}

            <WaterLevelGauge percentage={latestReading.water_level_percentage} />

            <View style={styles.sensorsGrid}>
                <SensorCard
                    label={SENSOR_LABELS.PH}
                    value={latestReading.ph_value}
                    unit={SENSOR_UNITS.PH}
                    min={DEFAULT_THRESHOLDS.PH_MIN}
                    max={DEFAULT_THRESHOLDS.PH_MAX}
                    decimals={2}
                />

                <SensorCard
                    label={SENSOR_LABELS.TDS}
                    value={latestReading.tds_value}
                    unit={SENSOR_UNITS.TDS}
                    min={DEFAULT_THRESHOLDS.TDS_MIN}
                    max={DEFAULT_THRESHOLDS.TDS_MAX}
                    decimals={0}
                />

                <SensorCard
                    label={SENSOR_LABELS.TURBIDITY}
                    value={latestReading.turbidity_value}
                    unit={SENSOR_UNITS.TURBIDITY}
                    max={DEFAULT_THRESHOLDS.TURBIDITY_MAX}
                    decimals={1}
                />

                <SensorCard
                    label={SENSOR_LABELS.TEMPERATURE}
                    value={latestReading.temperature}
                    unit={SENSOR_UNITS.TEMPERATURE}
                    max={DEFAULT_THRESHOLDS.TEMPERATURE_MAX}
                    decimals={1}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    welcomeText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    deviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    deviceName: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    lastUpdate: {
        padding: spacing.md,
        paddingTop: spacing.sm,
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    sensorsGrid: {
        padding: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    emptyText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
});
