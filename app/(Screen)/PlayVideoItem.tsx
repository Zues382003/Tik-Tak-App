import { View, StyleSheet, ActivityIndicator, useWindowDimensions, SafeAreaView, Image, Text, TouchableHighlight, TouchableOpacity } from 'react-native'
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { VideoItem } from '../(tabs)/(homeNav)/PlayVideoList';
import { router } from 'expo-router';

interface PlayVideoItemProps {
    video: VideoItem;
    activeIndex: number;
    index: number;
    userLikeHandler: (video: VideoItem, isLiked: boolean) => void;
    user: any;
    isLoading: boolean;
}

function PlayVideoItem({ video, activeIndex, index, userLikeHandler, user, isLoading }: PlayVideoItemProps) {
    const { width: windowWidth } = useWindowDimensions();
    const isFocused = useIsFocused();
    const videoRef = useRef(null);
    const [status, setStatus] = useState({});
    const [isMuted, setIsMuted] = useState(true);
    const [likeCount, setLikeCount] = useState(video.VideoLikes?.length);

    const isUserAlreadyLiked = useMemo(() => {
        const result = video.VideoLikes?.some((item: any) => item.userEmail === user?.primaryEmailAddress?.emailAddress);
        console.log("User already liked:", result);
        return result;
    }, [video.VideoLikes, user?.primaryEmailAddress?.emailAddress]);

    const [localIsLiked, setLocalIsLiked] = useState(isUserAlreadyLiked);

    const [localVideo, setLocalVideo] = useState(video);

    useEffect(() => {
        setLocalVideo(video);
    }, [video]);

    useEffect(() => {
        setLocalIsLiked(isUserAlreadyLiked);
    }, [isUserAlreadyLiked]);

    useEffect(() => {
        setLikeCount(video.VideoLikes?.length);
    }, [video.VideoLikes]);

    useEffect(() => {
        if ((status as any).isLoaded) {
            setIsMuted(!(status as any).isPlaying);
        }
    }, [status]);

    const onOtherUserProfile = () => {
        router.push({
            pathname: '/otherUserProfile', // Corrected pathname
            params: {
                video: JSON.stringify(video) // Convert video object to a JSON string
            }
        })
    }

    useEffect(() => {
        if (videoRef.current) {
            if (isFocused && activeIndex === index) {
                (videoRef.current as any).playAsync();
            } else {
                (videoRef.current as any).pauseAsync();
            }
        }
    }, [isFocused, activeIndex, index]);


    const handleLike = useCallback(async () => {
        const newIsLiked = !localIsLiked;
        setLocalIsLiked(newIsLiked);
        const updatedVideo = await userLikeHandler(localVideo, localIsLiked as boolean);
        if (updatedVideo as any) {
            setLocalVideo(updatedVideo as any);
        }
    }, [localVideo, localIsLiked, userLikeHandler]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, { width: windowWidth }]}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                <View style={styles.overlay}>
                    <View style={styles.mainContent}>
                        <View style={styles.userInfo}>
                            <TouchableOpacity onPress={onOtherUserProfile}>
                                <Image
                                    source={{ uri: video.Users.profileImage }}
                                    style={[styles.avatar, styles.avatarShadow]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.username, styles.textShadow]}>{video.Users.name}</Text>
                        </View>
                        <Text style={[styles.description, styles.textShadow]}>{video.description}</Text>
                    </View>
                    <View style={styles.actions}>
                        <View style={styles.likeCountContainer}>
                            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                                {localIsLiked ?
                                    <AntDesign name="heart" size={38} color="white" style={styles.icon} /> :
                                    <Ionicons name="heart-outline" size={38} color="white" style={styles.icon} />
                                }
                            </TouchableOpacity>
                            <Text style={styles.likeCount}>{localVideo.VideoLikes?.length}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={35} color="white" style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="paper-plane-outline" size={35} color="white" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: video.videoUrl }}
                    useNativeControls={false}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isFocused && activeIndex === index}
                    isMuted={isMuted}
                    isLooping
                    onPlaybackStatusUpdate={setStatus}
                />
            </View>
        </SafeAreaView>
    )
}

export default React.memo(PlayVideoItem, (prevProps, nextProps) => {
    return prevProps.video.id === nextProps.video.id &&
        prevProps.activeIndex === nextProps.activeIndex &&
        prevProps.index === nextProps.index &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.user?.id === nextProps.user?.id
});

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
        textShadowOffset: { width: -0.5, height: 0.5 },
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
    overlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: 10,
        zIndex: 10,
    },
    mainContent: {
        flex: 1,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        color: Colors.WHITE,
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
    },
    description: {
        color: Colors.WHITE,
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
        marginBottom: 10,
    },
    actions: {
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5,
    },
    actionButton: {
        marginBottom: 15,
    },
    likeCount: {
        color: Colors.WHITE,
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
        marginBottom: 10,
    },
    likeCountContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: -5,
    },
});