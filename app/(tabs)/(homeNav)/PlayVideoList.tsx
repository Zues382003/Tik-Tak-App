import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import PlayVideoItem from '../../(Screen)/PlayVideoItem';

// At the top of your file, define an interface for your video item
interface VideoItem {
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
}

export default function PlayVideoList() {

    const params = useLocalSearchParams();


    // Update your state declaration
    const [videoList, setVideoList] = useState<VideoItem[]>([]);


    useEffect(() => {
        if (params) {
            const parsedVideo = JSON.parse(params.video as string);
            if (Array.isArray(parsedVideo)) {
                setVideoList(parsedVideo as VideoItem[]);
                console.log("Received video:", parsedVideo);
                console.log("videoList length:", parsedVideo.length);
            } else if (typeof parsedVideo === 'object' && parsedVideo !== null) {
                const videoArray = [parsedVideo as VideoItem];
                setVideoList(videoArray);
                console.log("Received video:", videoArray);
                console.log("videoList length:", videoArray.length);
            } else {
                console.log("Received data is not a valid video object");
            }
        }
    }, [params.video]);


    return (
        <View style={{ flex: 1 }}>
            <FlatList
                style={{ flex: 1 }}
                data={videoList}
                renderItem={({ item }) => (
                    <PlayVideoItem style={{ flex: 1 }} video={item} />
                )}
                keyExtractor={(item, index) => index.toString()}
                pagingEnabled
                horizontal
            />
        </View>
    )


}