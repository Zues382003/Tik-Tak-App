import { View, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import OtherUserProfileIntro from './otherUserProfileIntro';
import OtherUserPostList from './otherUserPostList';
import { PostListService } from '@/Service/PostListService';

export interface VideoLike {
    postIdRef: number;
    userEmail: string;
}

export interface VideoItem {
    Users: {
        name: string;
        profileImage: string;
        username: string;
        email: string;
    };
    created_at: string;
    description: string;
    emailRef: string;
    id: number;
    thumbnail: string;
    videoUrl: string;
    VideoLikes?: VideoLike[];
}


export default function OtherUserProfile() {
    const params = useLocalSearchParams();
    const [videoList, setVideoList] = useState<any>();
    const [dataUser, setDataUser] = useState([]);

    useEffect(() => {
        if (params.video) {
            const parsedVideo = JSON.parse(params.video as string);
            setVideoList(parsedVideo);
        }
    }, []);

    const [postList, setPostList] = useState<any[]>([]); // Explicitly type the state as an array of any
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (params.video) {
            const parsedVideo = JSON.parse(params.video as string);
            setVideoList(parsedVideo);
        }
    }, [])

    useEffect(() => {
        if (videoList) {
            setIsLoading(true);
            getUserPostsFromService();
            getDataUserFromService();
            setIsLoading(false);
        }
    }, [videoList])

    const getUserPostsFromService = async () => {
        try {
            const userPosts = await PostListService.getUserPostsByEmail(videoList?.Users.email);
            setPostList(userPosts as any);
        } catch (error) {
            console.error("Error fetching user posts from service:", error);
        }
    };

    const getDataUserFromService = async () => {
        try {
            const data = await PostListService.getDataUser(videoList?.Users.email);
            setDataUser(data as any);
        } catch (error) {
            console.error("Error fetching data user from service:", error);
        }
    }

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={{ paddingHorizontal: 10 }}>
                <OtherUserPostList postList={postList} getLastesPosts={getUserPostsFromService} isLoading={isLoading} />
            </View>
        );
    };

    return (
        <FlatList
            data={[{ key: 'profile' }]}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            ListHeaderComponent={
                <View style={{ paddingHorizontal: 10, paddingTop: 20 }}>
                    <OtherUserProfileIntro postList={postList} dataUser={dataUser[0]} />
                </View>
            }
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={getUserPostsFromService} />
            }
        />
    )
}