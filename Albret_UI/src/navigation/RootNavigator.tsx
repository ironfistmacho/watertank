import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme/colors';

const Stack = createStackNavigator();

export default function RootNavigator() {
    const { isAuthenticated, isLoading, checkSession, user } = useAuthStore();
    const fetchDevices = useDeviceStore(state => state.fetchDevices);

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchDevices(user.id);
        }
    }, [isAuthenticated, user?.id]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
