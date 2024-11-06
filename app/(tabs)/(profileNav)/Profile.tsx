import { View, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import ProfileIntro from './ProfileIntro';
import { useUser } from '@clerk/clerk-expo';
import UserPostList from './UserPostList';
import { PostListService } from '@/Service/PostListService';

const profileScreen = () => {
    const { user } = useUser();
    const [postList, setPostList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataUser, setDataUser] = useState([]);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getUserPostsFromService();
            getDataUserFromService();
            setIsLoading(false);
        }
    }, [user]);

    const getUserPostsFromService = async () => {
        const userEmail = user?.primaryEmailAddress?.emailAddress?.toString();
        if (!userEmail) {
            console.error("User email is undefined");
            return;
        }
        try {
            const userPosts = await PostListService.getUserPosts(userEmail);
            setPostList(userPosts as any);
        } catch (error) {
            console.error("Error fetching user posts from service:", error);
        }
    };

    const getDataUserFromService = async () => {
        const userEmail = user?.primaryEmailAddress?.emailAddress?.toString();
        if (!userEmail) {
            console.error("User email is undefined");
            return;
        }
        try {
            const data = await PostListService.getDataUser(userEmail);
            setDataUser(data as any);
        } catch (error) {
            console.error("Error fetching data user from service:", error);
        }
    }

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={{ paddingHorizontal: 10 }}>
                <UserPostList postList={postList} getLastesPosts={getUserPostsFromService} isLoading={isLoading} />
            </View>
        );
    };

    return (
        <FlatList
            data={[{ key: 'profile' }]} // Dữ liệu giả để render các thành phần con
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            ListHeaderComponent={
                <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                    <ProfileIntro postList={postList} dataUser={dataUser[0]} />
                </View>
            }
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={getUserPostsFromService} />
            }
        />
    )
}

export default profileScreen