import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@/screens/main/DashboardScreen';
import ControlsScreen from '@/screens/main/ControlsScreen';
import AlertsScreen from '@/screens/main/AlertsScreen';
import SettingsScreen from '@/screens/main/SettingsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray500,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.gray200,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: () => <></>,
                }}
            />
            <Tab.Screen
                name="Controls"
                component={ControlsScreen}
                options={{
                    tabBarLabel: 'Controls',
                    tabBarIcon: () => <></>,
                }}
            />
            <Tab.Screen
                name="Alerts"
                component={AlertsScreen}
                options={{
                    tabBarLabel: 'Alerts',
                    tabBarIcon: () => <></>,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: () => <></>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: () => <></>,
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    );
}
