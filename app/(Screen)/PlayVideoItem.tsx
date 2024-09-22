import { View, StyleSheet, ActivityIndicator, useWindowDimensions, SafeAreaView, Image, Text } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';

export default function PlayVideoItem({ video, activeIndex, index }: any) {
    const { width: windowWidth } = useWindowDimensions();
    const isFocused = useIsFocused();

    const videoRef = useRef(null);
    const [status, setStatus] = useState({});
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if ((status as any).isLoaded) {
            setIsLoading(false);
        }
        if ((status as any).isPlaying) {
            setIsMuted(false);
        } else {
            setIsMuted(true);
        }
    }, [status]);



    useEffect(() => {
        if (videoRef.current) {
            if (isFocused) {
                (videoRef.current as any).playAsync();
            } else {
                (videoRef.current as any).pauseAsync();
            }
        }
    }, [isFocused]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, { width: windowWidth, height: '100%' }]}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                <View style={{
                    position: 'absolute', zIndex: 10, bottom: 30, left: 10, paddingLeft: 10, paddingRight: 30,
                    display: 'flex', flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image
                                source={{ uri: video.thumbnailUrl }}
                                style={[{
                                    width: 40, height: 40,
                                    borderRadius: 99, backgroundColor: Colors.WHITE
                                }, styles.avatarShadow]} />
                            <Text style={[{
                                color: Colors.WHITE, fontSize: 16,
                                fontFamily: 'Outfit-Regular'
                            }, styles.textShadow]}>{video.Users.name}</Text>
                        </View>
                        <Text style={[{
                            color: Colors.WHITE, fontSize: 16,
                            fontFamily: 'Outfit-Regular',
                            marginTop: 8
                        }, styles.textShadow]}>{video.description}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Ionicons name="heart-outline" size={40} color="white" style={styles.icon} />
                        <Ionicons name="chatbubble-outline" size={35} color="white" style={styles.icon} />
                        <Ionicons name="paper-plane-outline" size={35} color="white" style={styles.icon} />
                    </View>
                </View>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{
                        uri: video.videoUrl,
                    }}
                    useNativeControls={false}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isFocused && activeIndex == index}
                    isMuted={isMuted}
                    isLooping={true}
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        zIndex: 1,
    },
    icon: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    avatarShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    textShadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
});