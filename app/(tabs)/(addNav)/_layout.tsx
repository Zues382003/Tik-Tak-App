import { Stack } from 'expo-router';

export default function AddLayout() {
    return (
        <Stack>
            <Stack.Screen name="Add" options={{ headerShown: false }} />
            <Stack.Screen name="Preview" options={{ title: 'Preview', presentation: 'modal', headerShown: false }} />
        </Stack>
    );
}