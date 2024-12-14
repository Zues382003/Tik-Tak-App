import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, StatusBar } from 'react-native'
import React, { useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import PlayVideoItem from '../../(Screen)/PlayVideoItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { PostListService } from '@/Service/PostListService';

export type VideoLike = {
    postIdRef: number;
    userEmail: string;
}

export type Friend = {
    id: number;
    followerEmail: string;
    followedId: number;
}

export type VideoItem = {
    Users: {
        id: number;
        name: string;
        profileImage: string;
        username: string;
    };
    created_at: string;
    description: string;
    emailRef: string;
    id: number;
    thumbnail: string;
    videoUrl: string;
    VideoLikes?: VideoLike[];
}


export default function PlayVideoList() {
    const params = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const [videoList, setVideoList] = useState<VideoItem[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const [followedUsers, setFollowedUsers] = useState<number[]>([]);


    useEffect(() => {
        if (user) {
            fetchFollowedUsers();
        }
    }, [user]);

    const fetchFollowedUsers = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('Friends')
                .select('followedId')
                .eq('followerEmail', user.primaryEmailAddress?.emailAddress);

            if (error) throw error;
            setFollowedUsers(data.map(item => item.followedId));
        } catch (e) {
            console.error("Error fetching followed users:", e);
        }
    };

    const userLikeHandler = useCallback(async (video: VideoItem, isLiked: boolean) => {
        if (!user) return;

        try {
            let updatedVideo = { ...video };
            if (!isLiked) {
                const { data, error } = await supabase
                    .from('VideoLikes')
                    .insert({
                        postIdRef: video.id,
                        userEmail: user.primaryEmailAddress?.emailAddress
                    })
                    .select();

                if (error) throw error;

                updatedVideo.VideoLikes = [...(video.VideoLikes || []), data[0]];
            } else {
                const { error } = await supabase
                    .from('VideoLikes')
                    .delete()
                    .eq('postIdRef', video.id)
                    .eq('userEmail', user.primaryEmailAddress?.emailAddress);

                if (error) throw error;

                updatedVideo.VideoLikes = video.VideoLikes?.filter(like => like.userEmail !== user.primaryEmailAddress?.emailAddress);
            }

            setVideoList(prevList =>
                prevList.map(item =>
                    item.id === video.id ? updatedVideo : item
                )
            );

            return updatedVideo;
        } catch (e) {
            console.error("Exception occurred while liking video:", e);
            return null;
        }
    }, [user]);

    const userFollowHandler = useCallback(async (userId: number, isFollowing: boolean) => {
        if (!user) return;

        try {
            if (!isFollowing) {
                const { error } = await supabase
                    .from('Friends')
                    .insert({
                        followerEmail: user.primaryEmailAddress?.emailAddress,
                        followedId: userId
                    });

                if (error) throw error;

                setFollowedUsers(prev => [...prev, userId]);
            } else {
                const { error } = await supabase
                    .from('Friends')
                    .delete()
                    .eq('followerEmail', user.primaryEmailAddress?.emailAddress)
                    .eq('followedId', userId);

                if (error) throw error;

                setFollowedUsers(prev => prev.filter(id => id !== userId));
            }

            return true;
        } catch (e) {
            console.error("Exception occurred while following/unfollowing user:", e);
            return false;
        }
    }, [user]);

    const getLastesPosts = useCallback(
        async (options: { selectedVideo?: any } = {}) => {
            const { selectedVideo } = options;
            setIsLoading(true);
            if (selectedVideo) {
                try {
                    const { data, error } = await supabase
                        .from('PostList')
                        .select('*, Users(*), VideoLikes(*)')
                        .eq('emailRef', selectedVideo[0].emailRef)
                        .order('created_at', { ascending: false })

                    if (error) throw error;

                    if (data && data.length > 0) {
                        const otherVideos = data.filter((video: any) => video.id !== selectedVideo[0].id);
                        setVideoList([selectedVideo[0], ...otherVideos]);

                    } else {
                        setVideoList(selectedVideo);
                    }
                } catch (e) {
                    console.error("Error fetching videos:", e);
                }
            }
            setIsLoading(false);
        },
        [isLoading]
    );


    // ... existing code ...
    useEffect(() => {
        if (params.video) {
            const parsedVideo = JSON.parse(params.video as string);
            setVideoList(parsedVideo);
            getLastesPosts({ selectedVideo: [parsedVideo] }); // Truyền isInitialLoad là true
        }
    }, [params.video]);
    // ... existing code ...


    // ... existing code ...

    const renderItem = useCallback(({ item, index }: { item: VideoItem; index: number }) => {
        const isFollowing = followedUsers.includes(item.Users?.id);
        const isOwnVideo = item.Users.id?.toString() === user?.id?.toString(); // Kiểm tra user?.id

        return (
            <PlayVideoItem
                video={item}
                activeIndex={currentVideoIndex}
                index={index}
                userLikeHandler={userLikeHandler}
                userFollowHandler={userFollowHandler}
                isFollowing={isFollowing}
                isOwnVideo={isOwnVideo}
                isLoading={isLoading}
                user={user}
            />
        );
    }, [currentVideoIndex, userLikeHandler, userFollowHandler, isLoading, user, followedUsers]);

    // ... existing code ...

    const keyExtractor = useCallback((item: VideoItem) => {
        return item.id?.toString() || ''; // Kiểm tra item.id
    }, []);

    const memoizedFlatList = useMemo(() => (
        <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={videoList}
            pagingEnabled
            horizontal={false} // Ensure this is set to false for vertical scrolling
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialScrollIndex={0}
            onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                    flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
            }}
            onScroll={e => {
                const contentOffsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(contentOffsetY / e.nativeEvent.layoutMeasurement.height);
                setCurrentVideoIndex(index);
            }}
            onEndReached={() => getLastesPosts()}
            onEndReachedThreshold={0.2}
            removeClippedSubviews={true}
        />
    ), [videoList, keyExtractor, renderItem]);

    // ... existing code ...

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                style={[styles.backButton, styles.iconShadow]}
                onPress={() => router.back()}>
                <Ionicons name="arrow-back-sharp" size={28} color="white" />
            </TouchableOpacity>
            {isLoading
                ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text>Đang tải video...</Text>
                    </View>
                ) : memoizedFlatList}
        </View>
    )
}

const styles = StyleSheet.create({
    iconShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 0,
        zIndex: 100,
        margin: 15,
        padding: 5,
        borderRadius: 20,
    },
});