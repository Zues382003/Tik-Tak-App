import { View, StyleSheet, Text, Image, Pressable, Animated } from 'react-native';
import React, { useRef, useCallback } from 'react';
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';
import { Link } from 'expo-router'
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { supabase } from '../Utils/SupabaseConfig';
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

    const handlePressInGoogle = () => {
        Animated.spring(scaleAnimGoogle, {
            toValue: 0.8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOutGoogle = () => {
        Animated.spring(scaleAnimGoogle, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handlePressInFacebook = () => {
        Animated.spring(scaleAnimFacebook, {
            toValue: 0.8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOutFacebook = () => {
        Animated.spring(scaleAnimFacebook, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };


    const onPressGoogle = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startGoogleOAuthFlow({
                redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
            })

            if (createdSessionId) {
                setActive!({ session: createdSessionId })
                // Delay navigation
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 100);

                if (signUp?.emailAddress) {

                    const { data, error } = await supabase
                        .from('Users')
                        .insert([
                            {
                                name: signUp?.firstName,
                                email: signUp?.emailAddress,
                                username: signUp?.emailAddress?.split('@')[0]
                            }
                        ])
                        .select()
                    if (data) {
                        console.log(data);
                    } else {
                        console.log(error);
                    }
                }
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }, [router])

    const onPressFacebook = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startFacebookOAuthFlow({
                redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
            })

            if (createdSessionId) {
                setActive!({ session: createdSessionId })

            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }, [startFacebookOAuthFlow])


    return (
        <View style={{ flex: 1 }}>
            <Video
                style={styles.video}
                source={{
                    uri: 'https://videos.pexels.com/video-files/27871293/12250710_360_640_60fps.mp4',
                }}
                shouldPlay
                resizeMode={ResizeMode.COVER}
                isLooping={true}
            />
            <View style={{
                display: 'flex',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 100,
                flex: 1,
                backgroundColor: Colors.BACKGROUND_TRANSNP,
            }}>
                <Text
                    style={{
                        fontFamily: 'Outfit-Bold',
                        color: Colors.WHITE,
                        fontSize: 40,
                    }}
                >
                    Tik Tak
                </Text>
                <Text
                    style={{
                        fontFamily: 'Outfit-Regular',
                        color: Colors.WHITE,
                        fontSize: 16,
                        textAlign: 'center',
                        marginTop: 10
                    }}
                >
                    Ultimate Place to Share your Short Videos with Great Community
                </Text>

                <View style={{ position: 'absolute', bottom: 130 }}>
                    <Animated.View style={{ transform: [{ scale: scaleAnimGoogle }] }}>
                        <Pressable
                            onPress={onPressGoogle}
                            onPressIn={handlePressInGoogle}
                            onPressOut={handlePressOutGoogle}
                            style={styles.oauthButton}>

                            <Image style={{ width: 30, height: 30 }}
                                source={require('../../assets/images/logo_google.jpg')} />
                            <Text style={{ fontFamily: 'Outfit-Medium', color: Colors.BLACK, fontSize: 16 }}>
                                Continue with Google
                            </Text>
                        </Pressable>
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: scaleAnimFacebook }], marginTop: 20 }}>
                        <Pressable
                            onPress={onPressFacebook}
                            onPressIn={handlePressInFacebook}
                            onPressOut={handlePressOutFacebook}
                            style={styles.oauthButton}>

                            <Image style={{ width: 32, height: 32 }}
                                source={require('../../assets/images/logo_facebook.png')} />
                            <Text style={{ fontFamily: 'Outfit-Medium', color: Colors.BLACK, fontSize: 16 }}>
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
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
    }
});