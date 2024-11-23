import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import ProfileComponent from '@/components/profile/ProfileComponent';
import { useLocalSearchParams } from 'expo-router';

const ProfileScreen = () => {
    const { user } = useUser();
    const [isOwner, setIsOwner] = useState(true);
    const [userAnother, setUserAnother] = useState<{ email: string }>();
    const params = useLocalSearchParams();


    useEffect(() => {
        if (params.user) {
            const userAnother = JSON.parse(params.user as string);
            setIsOwner(false);
            setUserAnother(userAnother);
        }
    }, [params.user])



    return (
        <ProfileComponent isOwner={isOwner} user={isOwner ? user : userAnother}></ProfileComponent>
    )
}

export default ProfileScreen;