import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ProfileIntro from './ProfileIntro'; // Import the component
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';
import UserPostList from './UserPostList';

const profileScreen = () => {
    const { user } = useUser();
    const [postList, setPostList] = useState<any[]>([]); // Explicitly type the state as an array of any
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        user && getUserPosts();
    }, [user])

    const getUserPosts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('PostList')
            .select('*, Users(*), VideoLikes(postIdRef,userEmail)')
            .eq('emailRef', user?.primaryEmailAddress?.emailAddress)
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
                <ProfileIntro postList={postList} />
                <UserPostList postList={postList} getLastesPosts={getUserPosts} isLoading={isLoading} />
            </View>
        );
    };

    return (
        <FlatList
            style={{ padding: 20, paddingTop: 25 }}
            data={[{ key: 'profile' }]} // Dữ liệu giả để render các thành phần con
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            refreshing={isLoading}
            onRefresh={getUserPosts}
        />
    )
}

export default profileScreen