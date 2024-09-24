import { View, Text, Image, FlatList, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../../Utils/SupabaseConfig';
import VideoThumbnailItem from '../../(Screen)/VideoThumbnailItem';

export default function HomeScreen() {
    const { user } = useUser();
    const [videoList, setVideoList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);

    interface Post {
        id: string; // or number, depending on your data structure
        // ... other properties
    }

    useEffect(() => {
        user && updateProfileImage();
        setLoadCount(0);
    }, [user]);

    useEffect(() => {
        getLastesPosts();
    }, [loadCount]);

    const updateProfileImage = async () => {

        const { data, error } = await supabase
            .from('Users')
            .update({
                'profileImage': user?.imageUrl,
            })
            .eq('email', user?.primaryEmailAddress?.emailAddress)
            .is('profileImage', 'null')
            .select();
        console.log(data);
    }

    const getLastesPosts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('PostList')
                .select('*, Users(username, name, profileImage, email), VideoLikes(postIdRef, userEmail)')
                .range(loadCount, loadCount + 5)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching data:", error);
                return;
            }

            console.log("Data video", data);
            if (data === null || data.length === 0) {
                console.log("No data returned from the query");
            } else {
                // Lọc ra các bài post trong data mà không có trong videoList
                const newUniqueData = (data as Post[]).filter(newPost =>
                    !(videoList as Post[]).some(existingPost => existingPost.id === newPost.id)
                );

                // Cập nhật videoList với các bài post mới và duy nhất
                setVideoList(videoList => [...videoList, ...newUniqueData] as any);
            }
            setIsLoading(false);

        } catch (e) {
            console.error("Exception occurred:", e);
        }
    }

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = (screenWidth - 30) / 2; // 30 là tổng padding

    const renderItem = ({ item, index }: { item: any, index: any }) => {
        if (item === null) {
            // Render một view trống cho item "dummy"
            return <View style={{ width: itemWidth, margin: 5 }} />;
        }
        return <VideoThumbnailItem video={item} index={index} width={itemWidth} />;
    };

    const keyExtractor = (item: { id: number } | null, index: number) => item ? item.id.toString() : `dummy-${index}`;

    return (
        <View style={{ padding: 5, paddingTop: 30, flex: 1 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 30, fontFamily: 'Outfit-Bold' }}>Tik Tak</Text>
                <Image source={{ uri: user?.imageUrl }} style={{ width: 50, height: 50, borderRadius: 99 }}></Image>

            </View>
            <View style={{ flex: 1 }}>
                <FlatList
                    style={{ display: 'flex', flex: 1 }}
                    data={videoList.length % 2 === 0 ? videoList : [...videoList, null]}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={2}
                    onRefresh={() => getLastesPosts()}
                    refreshing={isLoading}
                    onEndReached={() => setLoadCount(loadCount + 5)}
                />

            </View>
        </View>
    )
}