import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import PlayVideoItem from '../../(Screen)/PlayVideoItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';

export interface VideoLike {
    postIdRef: number;
    userEmail: string;
}

export interface VideoItem {
    Users: {
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

    const getLastesPosts = useCallback(async (selectedVideoId?: number) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('PostList')
                .select('*, Users(username, name, profileImage),VideoLikes(postIdRef, userEmail)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (selectedVideoId) {
                const selectedVideo = data.find(video => video.id === selectedVideoId);
                const otherVideos = data.filter(video => video.id !== selectedVideoId);
                setVideoList(selectedVideo ? [selectedVideo, ...otherVideos] : data);
            } else {
                setVideoList(data || []);
            }
        } catch (e) {
            console.error("Exception occurred:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (params.video) {
            const parsedVideo = JSON.parse(params.video as string);
            console.log("Parsed video:", parsedVideo);
            if (Array.isArray(parsedVideo)) {
                setVideoList(parsedVideo);
                getLastesPosts();
            } else {
                setVideoList([parsedVideo]);
                getLastesPosts(parsedVideo.id);
            }
        } else {
            getLastesPosts();
        }
    }, [params.video, getLastesPosts]);

    useEffect(() => {
        console.log("Updated videoList:", videoList);
    }, [videoList]);

    const renderItem = useCallback(({ item, index }: { item: VideoItem; index: number }) => {
        console.log("Rendering video item:", item);
        return (
            <PlayVideoItem
                style={{ flex: 1, width: '100%', height: '100%' }}
                video={item}
                activeIndex={currentVideoIndex}
                index={index}
                userLikeHandler={userLikeHandler}
                isLoading={isLoading}
                user={user}
            />
        );
    }, [currentVideoIndex, userLikeHandler, isLoading, user]);

    const keyExtractor = useCallback((item: VideoItem) => item.id.toString(), []);

    const memoizedFlatList = useMemo(() => (
        <FlatList
            ref={flatListRef}
            style={{ flex: 1, width: '100%', height: '100%' }}
            data={videoList}
            pagingEnabled
            horizontal
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
                const contentOffsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(contentOffsetX / e.nativeEvent.layoutMeasurement.width);
                setCurrentVideoIndex(index);
            }}
        />
    ), [videoList, keyExtractor, renderItem]);

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