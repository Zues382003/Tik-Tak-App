import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="PlayVideoList" options={{ title: 'Video', presentation: 'modal', headerShown: false }} />
        </Stack>
    );
}