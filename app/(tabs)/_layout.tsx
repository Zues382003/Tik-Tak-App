import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tabs.Screen
                name="(homeNav)"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="(notificationNav)"
                options={{
                    title: 'Notification',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="notifications-sharp" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="(addNav)"
                options={{
                    title: 'Add',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="(profileNav)"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}