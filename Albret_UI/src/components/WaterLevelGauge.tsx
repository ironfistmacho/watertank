import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface WaterLevelGaugeProps {
    percentage: number;
    height?: number;
}

export default function WaterLevelGauge({ percentage, height = 200 }: WaterLevelGaugeProps) {
    const fillAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(fillAnimation, {
            toValue: percentage,
            useNativeDriver: false,
            tension: 40,
            friction: 7,
        }).start();
    }, [percentage]);

    const fillHeight = fillAnimation.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const getColor = () => {
        if (percentage < 20) return colors.danger;
        if (percentage < 40) return colors.warning;
        return colors.chartWaterLevel;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.tank, { height }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            height: fillHeight,
                            backgroundColor: getColor(),
                        },
                    ]}
                />
                <View style={styles.percentageContainer}>
                    <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
                </View>
            </View>
            <Text style={styles.label}>Water Level</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    tank: {
        width: 100,
        borderWidth: 3,
        borderColor: colors.gray400,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.gray100,
        position: 'relative',
        justifyContent: 'flex-end',
    },
    fill: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    percentageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentage: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    label: {
        marginTop: spacing.sm,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
    },
});
