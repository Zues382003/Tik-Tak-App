import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name="Profile" options={{ headerShown: false }} />
            {/* <Stack.Screen name="PlayVideoList" options={{ title: 'Video', presentation: 'modal', headerShown: false }} /> */}
        </Stack>
    )
}

export default _layout