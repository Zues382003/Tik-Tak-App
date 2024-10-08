import { View, StyleSheet, ActivityIndicator, useWindowDimensions, SafeAreaView, Image, Text, TouchableHighlight, TouchableOpacity } from 'react-native'
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { VideoItem } from '../(tabs)/(homeNav)/PlayVideoList';
import { router } from 'expo-router';
import { supabase } from '../Utils/SupabaseConfig';

interface PlayVideoItemProps {
    video: VideoItem;
    activeIndex: number;
    index: number;
    userLikeHandler: (video: VideoItem, isLiked: boolean) => void;
    userFollowHandler: (userId: number, isFollowing: boolean) => void;
    isFollowing: boolean;
    isOwnVideo: boolean;
    user: any;
    isLoading: boolean;
}

function PlayVideoItem({ video, activeIndex, index, userLikeHandler, userFollowHandler, isFollowing, isOwnVideo, user, isLoading }: PlayVideoItemProps) {
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

    const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);

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

    const handleFollow = useCallback(async () => {
        if (isOwnVideo) return; // Don't allow following own video
        try {
            await userFollowHandler(video.Users.id, localIsFollowing);
            setLocalIsFollowing(!localIsFollowing);
        } catch (error) {
            console.error('Failed to update follow status:', error);
        }
    }, [video.Users.id, localIsFollowing, userFollowHandler, isOwnVideo]);

    useEffect(() => {
        setLocalIsFollowing(isFollowing);
    }, [isFollowing]);

    const showFollowButton = useMemo(() => {
        return user?.primaryEmailAddress?.emailAddress !== video.emailRef;
    }, [user?.primaryEmailAddress?.emailAddress, video.emailRef]);

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
                            {showFollowButton && (
                                <TouchableOpacity onPress={handleFollow}>
                                    <AntDesign
                                        name={localIsFollowing ? "checkcircle" : "pluscircle"}
                                        style={styles.plusIcon}
                                        size={18}
                                        color={localIsFollowing ? "green" : Colors.BLACK}
                                    />
                                </TouchableOpacity>
                            )}
                            <Text style={[styles.username, styles.textShadow]}>{video.Users.name}</Text>
                        </View>
                        <Text style={[styles.description, styles.textShadow]}>{video.description}</Text>
                    </View>
                    <View style={styles.actions}>
                        <View style={styles.likeCountContainer}>
                            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                                {localIsLiked ?
                                    <AntDesign name="heart" size={40} color={Colors.WHITE} style={styles.icon} /> :
                                    <AntDesign name="hearto" size={40} color={Colors.WHITE} style={styles.icon} />
                                }
                            </TouchableOpacity>
                            <Text style={styles.likeCount}>{localVideo.VideoLikes?.length}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={35} color={Colors.WHITE} style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="paper-plane-outline" size={35} color={Colors.WHITE} style={styles.icon} />
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
        textShadowRadius: 10,
        paddingVertical: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
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
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 2,
        borderColor: Colors.WHITE,
    },
    username: {
        color: Colors.WHITE,
        fontSize: 18,
        fontFamily: 'Outfit-Medium',
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
        justifyContent: 'center', // Căn giữa icon theo chiều dọc
        alignItems: 'center', // Căn giữa icon theo chiều ngang
    },
    likeCount: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
        paddingBottom: 10,
        marginTop: -15,
    },
    likeCountContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: -5,
    },
    plusIcon: {
        position: 'absolute',
        bottom: -26,
        right: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 99,
        padding: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});