import { View, Text, Image, FlatList, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../../Utils/SupabaseConfig';
import VideoThumbnailItem from '../../(Screen)/VideoThumbnailItem';

export default function HomeScreen() {
    const { user } = useUser();
    const [videoList, setVideoList] = useState<PostVideo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);


    interface PostVideo {
        id: number; // Sử dụng number cho id
        videoUrl: string; // Định dạng chuỗi cho videoUrl
        thumbnail: string; // Định dạng chuỗi cho thumbnail
        description: string; // Định dạng chuỗi cho description
        emailRef: string; // Định dạng chuỗi cho emailRef
        created_at: Date; // Sử dụng Date cho created_at
    }

    useEffect(() => {
        user && updateProfileImage();
        setLoadCount(0);
    }, [user]);

    useEffect(() => {
        getLastesPosts();
        // Thiết lập subscription cho realtime
        const subscription = supabase
            .channel('postlist-channel') // Tạo kênh cho danh sách video
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'PostList' }, (payload) => {
                // Khi có video mới, cập nhật danh sách video
                setVideoList(prevVideos => [...prevVideos, payload.new as PostVideo]); // Ensure payload.new has all required fields
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'PostList' }, (payload) => {
                // Khi có video được cập nhật, thay thế video cũ bằng video mới
                setVideoList(prevVideos =>
                    prevVideos.map(video =>
                        video.id === payload.new.id ? { ...video, ...payload.new } : video // Merge existing video with new data
                    ) as PostVideo[] // Cast the entire array to PostVideo[]
                )
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'PostList' }, (payload) => {
                // Khi có video bị xóa, cập nhật danh sách video
                setVideoList(prevVideos => prevVideos.filter(video => video.id !== payload.old.id));
            })
            .subscribe();

        // Dọn dẹp subscription khi component unmount
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]); // Chạy lại khi user thay đổi

    const updateProfileImage = async () => {
        if (!user?.primaryEmailAddress?.emailAddress || !user?.imageUrl) {
            console.log("User email or image URL is not available.");
            return; // Không thực hiện cập nhật nếu không có email hoặc imageUrl
        }

        const { data, error } = await supabase
            .from('Users')
            .update({
                'profileImage': user.imageUrl,
            })
            .eq('email', user.primaryEmailAddress.emailAddress)
            .is('profileImage', null) // Sử dụng null thay vì 'null'
            .select();

        if (error) {
            console.error("Error updating profile image:", error);
        }
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

            if (data === null || data.length === 0) {
                console.log("No data returned from the query");
            } else {
                // Lọc ra các bài post trong data mà không có trong videoList
                const newUniqueData = (data as PostVideo[]).filter(newPost =>
                    !(videoList as PostVideo[]).some(existingPost => existingPost.id === newPost.id)
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
            return <View style={{ width: itemWidth, margin: 5 }} />
        }
        return <VideoThumbnailItem video={item} isDisplayTrashIcon={false} index={index} width={itemWidth} />
    };

    const keyExtractor = (item: { id: number } | null, index: number) => item ? item.id.toString() : `dummy-${index}`

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
                    onRefresh={() => {
                        setVideoList([]);
                        setLoadCount(0);
                        getLastesPosts();
                    }}
                    refreshing={isLoading}
                    onEndReached={() => setLoadCount(loadCount + 5)}
                    onEndReachedThreshold={0.2}
                />
            </View>
        </View>
    )
}