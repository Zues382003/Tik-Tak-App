import { View, StyleSheet, ActivityIndicator, useWindowDimensions, SafeAreaView, Image, Text } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';

export default function PlayVideoItem({ video }: any) {
    const { width: windowWidth } = useWindowDimensions();

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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, { width: windowWidth, height: '100%' }]}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                <View style={{ position: 'absolute', zIndex: 10, bottom: 30, left: 10, padding: 10 }}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Image
                            source={{ uri: video.thumbnailUrl }}
                            style={{
                                width: 40, height: 40,
                                borderRadius: 99, backgroundColor: Colors.WHITE
                            }} />
                        <Text style={{
                            color: Colors.WHITE, fontSize: 16,
                            fontFamily: 'Outfit-Regular'
                        }}>{video.Users.name}</Text>
                    </View>
                    <Text style={{
                        color: Colors.WHITE, fontSize: 16,
                        fontFamily: 'Outfit-Regular',
                        marginTop: 8
                    }}>{video.description}</Text>

                </View>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{
                        uri: video.videoUrl,
                    }}
                    useNativeControls={false}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
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
});