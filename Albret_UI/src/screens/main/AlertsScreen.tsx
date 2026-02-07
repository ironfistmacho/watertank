import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/alertStore';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { formatRelativeTime } from '@/utils/formatting';
import { AlertSeverity } from '@/types';

export default function AlertsScreen() {
    const user = useAuthStore(state => state.user);
    const { alerts, fetchAlerts, acknowledgeAlert, subscribeToAlerts } = useAlertStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchAlerts(user.id);
            const unsubscribe = subscribeToAlerts(user.id);
            return unsubscribe;
        }
    }, [user?.id]);

    const handleRefresh = async () => {
        if (user?.id) {
            setIsRefreshing(true);
            await fetchAlerts(user.id);
            setIsRefreshing(false);
        }
    };

    const handleAcknowledge = async (alertId: string) => {
        await acknowledgeAlert(alertId);
    };

    const getSeverityColor = (severity: AlertSeverity) => {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return colors.danger;
            case AlertSeverity.WARNING:
                return colors.warning;
            default:
                return colors.info;
        }
    };

    const renderAlert = ({ item }: any) => (
        <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
                <View style={[styles.severityDot, { backgroundColor: getSeverityColor(item.severity) }]} />
                <Text style={styles.alertType}>{item.alert_type}</Text>
                <Text style={styles.alertTime}>{formatRelativeTime(item.created_at)}</Text>
            </View>

            <Text style={styles.alertMessage}>{item.message}</Text>

            {item.sensor_value !== null && item.threshold_value !== null && (
                <Text style={styles.alertDetails}>
                    Value: {item.sensor_value.toFixed(1)} (Threshold: {item.threshold_value.toFixed(1)})
                </Text>
            )}

            {!item.is_acknowledged && (
                <TouchableOpacity
                    style={styles.acknowledgeButton}
                    onPress={() => handleAcknowledge(item.id)}
                >
                    <Text style={styles.acknowledgeText}>Acknowledge</Text>
                </TouchableOpacity>
            )}

            {item.is_acknowledged && (
                <Text style={styles.acknowledgedText}>✓ Acknowledged</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Alerts</Text>
                <Text style={styles.subtitle}>System notifications and warnings</Text>
            </View>

            <FlatList
                data={alerts}
                renderItem={renderAlert}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No alerts</Text>
                    </View>
                }
            />
        </View>
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
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    listContainer: {
        padding: spacing.md,
    },
    alertCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    severityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    alertType: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    alertTime: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    alertMessage: {
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    alertDetails: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    acknowledgeButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    acknowledgeText: {
        color: colors.white,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    acknowledgedText: {
        fontSize: typography.fontSize.sm,
        color: colors.success,
        fontWeight: typography.fontWeight.medium,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: spacing['2xl'],
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
});
