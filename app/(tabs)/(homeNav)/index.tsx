import { View, Text, Image, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../../Utils/SupabaseConfig';
import VideoThumbnailItem from '../../(Screen)/VideoThumbnailItem';
import { PostListService } from '@/Service/PostListService';

export default function HomeScreen() {
    const { user } = useUser();
    const [videoList, setVideoList] = useState<PostVideo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải không
    const [loadCount, setLoadCount] = useState(0);
    const [dataUser, setDataUser] = useState<{ profileImage: string }[]>([]);


    type PostVideo = {
        id: number;
        videoUrl: string;
        thumbnail: string;
        description: string;
        emailRef: string;
        created_at: Date;
    };

    useEffect(() => {
        if (user) {
            getDataUserFromService();
            loadMorePosts(true); // Tải dữ liệu ban đầu
        }
    }, [user]);

    const getDataUserFromService = async () => {
        if (user && user.primaryEmailAddress?.emailAddress) {
            try {
                const data = await PostListService.getDataUser(user?.primaryEmailAddress?.emailAddress);
                setDataUser(data as any);
            } catch (error) {
                console.error("Error fetching data user from service:", error);
            }
        }
    }

    const loadMorePosts = useCallback(async (isInitialLoad = false) => {
        if (isLoading || !hasMore) return; // Nếu đang tải hoặc không còn dữ liệu, dừng xử lý
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('PostList')
                .select('*, Users(id, username, name, profileImage, email), VideoLikes(postIdRef, userEmail)')
                .range(isInitialLoad ? 0 : loadCount, isInitialLoad ? 5 : loadCount + 5) // Tải từ đầu nếu là lần đầu
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching data:", error);
                return;
            }

            if (data) {
                const newPosts = data as PostVideo[];
                setVideoList(prevList => (isInitialLoad ? newPosts : [...prevList, ...newPosts]));
                setHasMore(newPosts.length > 0); // Nếu không có dữ liệu mới, dừng tải thêm
                setLoadCount(prev => (isInitialLoad ? 6 : prev + 6)); // Đặt lại bộ đếm nếu là lần đầu
            }
        } catch (e) {
            console.error("Exception occurred:", e);
        } finally {
            setIsLoading(false);
        }
    }, [loadCount, isLoading, hasMore]);


    const screenWidth = Dimensions.get('window').width;
    const itemWidth = useMemo(() => (screenWidth - 30) / 2, [screenWidth]);

    const renderItem = ({ item }: { item: PostVideo | null }) => {
        if (!item) {
            return <View style={{ width: itemWidth, margin: 5 }} />;
        }
        return <VideoThumbnailItem video={item} isDisplayTrashIcon={false} index={item.id} width={itemWidth} />;
    };

    const keyExtractor = (item: PostVideo | null) => item ? item.id.toString() : `dummy-${Math.random()}`;

    return (
        <View style={{ padding: 5, paddingTop: 30, flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 30, fontFamily: 'Outfit-Bold' }}>Tik Tak</Text>
            </View>
            <View style={{ flex: 1 }}>
                {isLoading && videoList.length === 0 ? ( // Hiển thị loader khi không có dữ liệu
                    <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
                ) : (
                    <FlatList
                        style={{ flex: 1 }}
                        data={videoList}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        numColumns={2}
                        onRefresh={() => {
                            // Đặt trạng thái ban đầu trước khi tải lại
                            setVideoList([]);
                            setLoadCount(0);
                            setHasMore(true);
                            // Tải dữ liệu ngay lập tức sau khi reset
                            loadMorePosts(true);
                        }}
                        refreshing={isLoading && videoList.length === 0}
                        onEndReached={() => loadMorePosts()} // Tải thêm dữ liệu khi cuộn đến cuối
                        onEndReachedThreshold={0.2}
                        ListFooterComponent={
                            isLoading && hasMore ? (
                                <ActivityIndicator size="small" color="#0000ff" style={{ marginVertical: 10 }} />
                            ) : null
                        }
                    />

                )}
            </View>
        </View>
    );
}
