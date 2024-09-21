import { Stack } from 'expo-router';

export default function AddLayout() {
    return (
        <Stack>
            <Stack.Screen name="add" options={{ headerShown: false }} />
            <Stack.Screen name="preview" options={{ title: 'Preview', presentation: 'modal', headerShown: false }} />
        </Stack>
    );
}