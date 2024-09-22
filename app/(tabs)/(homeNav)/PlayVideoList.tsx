import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import PlayVideoItem from '../../(Screen)/PlayVideoItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import { supabase } from '@/app/Utils/SupabaseConfig';

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
    const [isLoading, setIsLoading] = useState(true);

    // Update your state declaration
    const [videoList, setVideoList] = useState<VideoItem[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState();


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
        getLastesPosts();
    }, []);

    const getLastesPosts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('PostList')
                .select('*, Users(username, name, profileImage)')
                .range(0, 7)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching data:", error);
                return;
            }

            console.log("Data video", data);
            if (data === null || data.length === 0) {
                console.log("No data returned from the query");
            } else {
                setVideoList(videoList => [...videoList, ...data] as any);
            }
            setIsLoading(false);

        } catch (e) {
            console.error("Exception occurred:", e);
        }
    }


    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 100,
                        margin: 15,
                        padding: 5,
                        borderRadius: 20,
                    },
                    styles.iconShadow
                ]}
                onPress={() => router.back()}>
                <Ionicons name="arrow-back-sharp" size={28} color="white" />
            </TouchableOpacity>
            <FlatList
                style={{ flex: 1 }}
                data={videoList}
                pagingEnabled
                keyExtractor={(item, index) => index.toString()}
                horizontal
                onScroll={e => {
                    const contentOffsetX = e.nativeEvent.contentOffset.x;
                    const index = Math.round(contentOffsetX / e.nativeEvent.layoutMeasurement.width);
                    setCurrentVideoIndex(index);
                }}
                renderItem={({ item, index }) => (
                    <PlayVideoItem style={{ flex: 1 }}
                        video={item} key={index}
                        activeIndex={currentVideoIndex}
                        index={index} />
                )}
            />
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
});