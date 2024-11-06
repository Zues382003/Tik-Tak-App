import { View, StyleSheet, Text, Image, Pressable, Animated } from 'react-native';
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useRouter } from 'expo-router';

// Move this outside of the component
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    useWarmUpBrowser();
    const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: 'oauth_facebook' });

    // Animation
    const scaleAnimGoogle = useRef(new Animated.Value(1)).current;
    const scaleAnimFacebook = useRef(new Animated.Value(1)).current;

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false); // Flag to check if component is mounted

    useEffect(() => {
        setIsMounted(true); // Set mounted to true when component mounts
        return () => {
            setIsMounted(false); // Set mounted to false when component unmounts
        };
    }, []);

    const onPressGoogle = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startGoogleOAuthFlow({
                // redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
            });

            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                setSessionId(createdSessionId); // Lưu sessionId
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    }, [startGoogleOAuthFlow]);

    const onPressFacebook = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startFacebookOAuthFlow({
                // redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
            });

            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                setSessionId(createdSessionId); // Lưu sessionId
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    }, [startFacebookOAuthFlow]);

    useEffect(() => {
        if (sessionId && isMounted) {
            // Delay navigation
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 1000);
        }
    }, [sessionId, router, isMounted]);

    return (
        <View style={styles.container}>
            <Video
                style={styles.video}
                source={{
                    uri: 'https://videos.pexels.com/video-files/27871293/12250710_360_640_60fps.mp4',
                }}
                shouldPlay
                resizeMode={ResizeMode.COVER}
                isLooping={true}
            />
            <View style={styles.innerContainer}>
                <Text style={styles.title}>
                    Tik Tak
                </Text>
                <Text style={styles.subtitle}>
                    Ultimate Place to Share your Short Videos with Great Community
                </Text>

                <View style={styles.buttonContainer}>
                    <Animated.View style={{ transform: [{ scale: scaleAnimGoogle }] }}>
                        <Pressable
                            onPress={onPressGoogle}
                            style={styles.oauthButton}>
                            <Image style={styles.icon}
                                source={require('../../assets/images/logo_google.jpg')} />
                            <Text style={styles.buttonText}>
                                Continue with Google
                            </Text>
                        </Pressable>
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: scaleAnimFacebook }], marginTop: 20 }}>
                        <Pressable
                            onPress={onPressFacebook}
                            style={styles.oauthButton}>
                            <Image style={styles.icon}
                                source={require('../../assets/images/logo_facebook.png')} />
                            <Text style={styles.buttonText}>
                                Continue with Facebook
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    innerContainer: {
        display: 'flex',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 100,
        flex: 1,
        backgroundColor: Colors.BACKGROUND_TRANSNP,
    },
    title: {
        fontFamily: 'Outfit-Bold',
        color: Colors.WHITE,
        fontSize: 40,
    },
    subtitle: {
        fontFamily: 'Outfit-Regular',
        color: Colors.WHITE,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 130,
    },
    oauthButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        padding: 10,
        borderRadius: 99,
        paddingHorizontal: 30,
        gap: 10,
    },
    icon: {
        width: 30,
        height: 30,
    },
    buttonText: {
        fontFamily: 'Outfit-Medium',
        color: Colors.BLACK,
        fontSize: 16,
    },
});