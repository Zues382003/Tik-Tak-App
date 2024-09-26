import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import OtherUserProfileIntro from './otherUserProfileIntro';
import { supabase } from '@/app/Utils/SupabaseConfig';
import OtherUserPostList from './otherUserPostList';

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

    useEffect(() => {
        if (params.video) {
            const parsedVideo = JSON.parse(params.video as string);
            console.log("Parsed video:", parsedVideo);
            setVideoList(parsedVideo);
        }
    }, []);

    const [postList, setPostList] = useState<any[]>([]); // Explicitly type the state as an array of any
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (params.video) {
            const parsedVideo = JSON.parse(params.video as string);
            console.log("Parsed video:", parsedVideo);
            setVideoList(parsedVideo);
        }
    }, [])

    useEffect(() => {
        if (videoList) {
            getUserPosts();
        }
    }, [videoList])

    const getUserPosts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('PostList')
            .select('*, Users(*), VideoLikes(postIdRef,userEmail)')
            .eq('emailRef', videoList?.Users.email) // Access the Users property of the first VideoItem
            .order('created_at', { ascending: false });

        console.log(data?.length);
        if (data) {
            setPostList(data as any[]); // Type assertion to any[]
            setIsLoading(false);
            console.log("postList: ", data);
        } else {
            setIsLoading(false);
            console.log("error: ", error);
        }
    }

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View>
                <OtherUserProfileIntro user={videoList?.Users} postList={postList} />
                <OtherUserPostList postList={postList} getLastesPosts={getUserPosts} isLoading={isLoading} />
            </View>
        );
    };
    return (
        <FlatList
            style={{ padding: 8, paddingTop: 25 }}
            data={[{ key: 'other user profile' }]} // Dữ liệu giả để render các thành phần con
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            refreshing={isLoading}
            onRefresh={getUserPosts}
        />
    )
}