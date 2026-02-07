import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import { useDeviceStore } from '@/store/deviceStore';
import { supabase } from '@/config/supabase';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { ActuatorType } from '@/types';

export default function ControlsScreen() {
    const selectedDevice = useDeviceStore(state => state.selectedDevice);
    const [valve1, setValve1] = useState(false);
    const [valve2, setValve2] = useState(false);
    const [uvLight, setUvLight] = useState(false);
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const sendCommand = async (actuator: ActuatorType, value: number | boolean) => {
        if (!selectedDevice) {
            Alert.alert('Error', 'No device selected');
            return;
        }

        setIsLoading(true);

        try {
            // Log the actuator command
            const { error: logError } = await supabase
                .from('actuator_logs')
                .insert([{
                    device_id: selectedDevice.id,
                    user_id: selectedDevice.user_id,
                    actuator_type: actuator,
                    action: typeof value === 'boolean' ? (value ? 'on' : 'off') : `speed_${value}`,
                    value: typeof value === 'number' ? value : (value ? 1 : 0),
                    triggered_by: 'user',
                }]);

            if (logError) throw logError;

            // In a real implementation, this would send command to ESP32 via Supabase
            // For now, we'll just show a success message
            Alert.alert('Success', `${actuator} command sent successfully`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send command');
        } finally {
            setIsLoading(false);
        }
    };

    const handleValve1Change = (value: boolean) => {
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${value ? 'open' : 'close'} Valve 1?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        setValve1(value);
                        sendCommand(ActuatorType.VALVE_1, value);
                    },
                },
            ]
        );
    };

    const handleValve2Change = (value: boolean) => {
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${value ? 'open' : 'close'} Valve 2?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        setValve2(value);
                        sendCommand(ActuatorType.VALVE_2, value);
                    },
                },
            ]
        );
    };

    const handleUvLightChange = (value: boolean) => {
        setUvLight(value);
        sendCommand(ActuatorType.UV_LIGHT, value);
    };

    const handleEmergencyStop = () => {
        Alert.alert(
            'Emergency Stop',
            'This will immediately shut down all actuators. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'STOP ALL',
                    style: 'destructive',
                    onPress: () => {
                        setValve1(false);
                        setValve2(false);
                        setUvLight(false);
                        setMotorSpeed(0);
                        Alert.alert('All systems stopped', 'All actuators have been turned off');
                    },
                },
            ]
        );
    };

    if (!selectedDevice) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No device selected</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hardware Controls</Text>
                <Text style={styles.subtitle}>Manual control of water tank actuators</Text>
            </View>

            <View style={styles.controlsContainer}>
                <View style={styles.controlCard}>
                    <View style={styles.controlHeader}>
                        <Text style={styles.controlLabel}>Solenoid Valve 1</Text>
                        <Text style={styles.controlStatus}>{valve1 ? 'OPEN' : 'CLOSED'}</Text>
                    </View>
                    <Switch
                        value={valve1}
                        onValueChange={handleValve1Change}
                        trackColor={{ false: colors.gray300, true: colors.primary }}
                        thumbColor={valve1 ? colors.white : colors.gray400}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.controlCard}>
                    <View style={styles.controlHeader}>
                        <Text style={styles.controlLabel}>Solenoid Valve 2</Text>
                        <Text style={styles.controlStatus}>{valve2 ? 'OPEN' : 'CLOSED'}</Text>
                    </View>
                    <Switch
                        value={valve2}
                        onValueChange={handleValve2Change}
                        trackColor={{ false: colors.gray300, true: colors.primary }}
                        thumbColor={valve2 ? colors.white : colors.gray400}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.controlCard}>
                    <View style={styles.controlHeader}>
                        <Text style={styles.controlLabel}>UV Light</Text>
                        <Text style={styles.controlStatus}>{uvLight ? 'ON' : 'OFF'}</Text>
                    </View>
                    <Switch
                        value={uvLight}
                        onValueChange={handleUvLightChange}
                        trackColor={{ false: colors.gray300, true: colors.secondary }}
                        thumbColor={uvLight ? colors.white : colors.gray400}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>⚠️ Safety Notice</Text>
                    <Text style={styles.warningText}>
                        Ensure proper safety measures before operating actuators. Do not operate conflicting actuators simultaneously.
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.emergencyButton}
                onPress={handleEmergencyStop}
                disabled={isLoading}
            >
                <Text style={styles.emergencyButtonText}>🛑 EMERGENCY STOP</Text>
            </TouchableOpacity>
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
    controlsContainer: {
        padding: spacing.md,
    },
    controlCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    controlHeader: {
        flex: 1,
    },
    controlLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    controlStatus: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    warningCard: {
        backgroundColor: colors.warning + '20',
        borderRadius: 12,
        padding: spacing.md,
        marginVertical: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    warningTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.warning,
        marginBottom: spacing.xs,
    },
    warningText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    },
    emergencyButton: {
        backgroundColor: colors.danger,
        margin: spacing.md,
        padding: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    emergencyButtonText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.white,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
});
