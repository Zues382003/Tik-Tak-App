import { View, Text, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../../Utils/SupabaseConfig';
import VideoThumbnailItem from '../../(Screen)/VideoThumbnailItem';

export default function HomeScreen() {
    const { user } = useUser();
    const [videoList, setVideoList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);


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
                .select('*, Users(username, name, profileImage)')
                .range(loadCount, loadCount + 7)
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
        <View style={{ padding: 10, paddingTop: 25, flex: 1 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 30, fontFamily: 'Outfit-Bold' }}>Tik Tak</Text>
                <Image source={{ uri: user?.imageUrl }} style={{ width: 50, height: 50, borderRadius: 99 }}></Image>

            </View>
            <View style={{ flex: 1 }}>
                <FlatList
                    style={{ display: 'flex' }}
                    numColumns={2}
                    data={videoList}
                    onRefresh={() => getLastesPosts()}
                    refreshing={isLoading}
                    onEndReached={() => setLoadCount(loadCount + 7)}
                    renderItem={({ item, index }) => (<VideoThumbnailItem video={item} index={index} />)}
                />

            </View>
        </View>
    )
}