import { View, StyleSheet, Dimensions } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { ResizeMode, Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function PlayVideoItem({ video }: any) {
    const videoRef = useRef(null);
    const [status, setStatus] = useState({});
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (status.isPlaying) {
            setIsMuted(false);
        } else {
            setIsMuted(true);
        }
    }, [status.isPlaying]);

    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                style={styles.video}
                source={{
                    uri: video.videoUrl,
                }}
                useNativeControls={false}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                isMuted={isMuted}
                isLooping={true}
                onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },

});