import { SignedIn, SignedOut, ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot, useSegments, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from "react";
import { useFonts } from 'expo-font';
import LoginScreen from "./(Screen)/LoginScreen";
import { LogBox, View } from 'react-native';
import { NativeBaseProvider } from "native-base";
import SplashScreen from "./(Screen)/SplashScreen";



const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, token: string) => Promise<void>
  clearToken?: (key: string) => void
}

const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key)
      // if (item) {
      //   console.log(`${key} was used 🔐 \n`)
      // } else {
      //   console.log('No values stored under key: ' + key)
      // }
      return item
    } catch (error) {
      console.error('SecureStore get item error: ', error)
      await SecureStore.deleteItemAsync(key)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  },
}

export default function RootLayout() {
  // Tắt tất cả các cảnh báo
  LogBox.ignoreAllLogs();
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const [loaded, error] = useFonts({
    'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
    'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      setTimeout(() => {
        setLoading(false);
      }, 3000)
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const inAuthGroup = segments[0]?.includes('(auth)');
    // console.log('Auth state changed', inAuthGroup);
    // Add navigation logic if needed
  }, [rootNavigationState?.key, segments]);

  return (
    <NativeBaseProvider>
      {
        loading ? <SplashScreen /> :
          <View style={{ flex: 1 }}>
            <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
              <ClerkLoaded>
                <SignedIn>
                  <Slot />
                </SignedIn>
                <SignedOut>
                  <LoginScreen />
                </SignedOut>
              </ClerkLoaded>
            </ClerkProvider>
          </View>

      }
    </NativeBaseProvider>
  );
}