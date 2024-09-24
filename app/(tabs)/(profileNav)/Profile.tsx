import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import ProfileIntro from './ProfileIntro'; // Import the component
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';
const profileScreen = () => {
    const { user } = useUser();
    const [postList, setPostList] = useState<any[]>([]); // Explicitly type the state as an array of any

    useEffect(() => {
        user && getUserPosts();
        console.log("user", user);
    }, [user])

    const getUserPosts = async () => {
        const { data, error } = await supabase
            .from('PostList')
            .select('*, VideoLikes(postIdRef,userEmail)')
            .eq('emailRef', user?.primaryEmailAddress?.emailAddress)

        console.log(data?.length);
        if (data) {
            setPostList(data as any[]); // Type assertion to any[]
        }
    }
    return (
        <View style={{ padding: 20, paddingTop: 25 }}>
            <ProfileIntro postList={postList} />
        </View>
    )
}

export default profileScreen