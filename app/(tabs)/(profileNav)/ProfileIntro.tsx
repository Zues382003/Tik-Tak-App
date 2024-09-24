import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import Colors from '@/app/Utils/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileIntroProps {
    postList: any[];
}

const ProfileIntro: React.FC<ProfileIntroProps> = ({ postList }) => {
    const { user } = useUser();
    const [totalLikes, setTotalLikes] = useState(0);

    useEffect(() => {
        calculateToltalLikes();
    }, [postList])

    const calculateToltalLikes = () => {
        let totalLikes = 0;
        postList?.forEach((post) => {
            totalLikes += post?.VideoLikes?.length;
        })
        setTotalLikes(totalLikes);
    }
    return (
        <View style={{ marginTop: 30 }}>
            <Text style={{
                fontSize: 24,
                fontFamily: 'Outfit-Bold'
            }}>Profile</Text>
            <View style={{ marginTop: 10, alignItems: 'center' }}>
                <Image source={{ uri: user?.imageUrl }}
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 99,
                    }} />
                <Text style={{
                    fontSize: 22,
                    fontFamily: 'Outfit-Medium'
                }}>{user?.fullName}</Text>
                <Text style={{
                    fontSize: 17,
                    fontFamily: 'Outfit-Regular',
                    color: Colors.BACKGROUND_TRANSNP
                }}>{user?.primaryEmailAddress?.emailAddress}</Text>
            </View>
            <View style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <View style={{
                    padding: 20,
                    alignItems: 'center'
                }}>
                    <Ionicons name="videocam" size={24} color="black" />
                    <Text style={{
                        fontFamily: 'Outfit-Bold',
                        fontSize: 20
                    }}>
                        {postList?.length} Posts
                    </Text>
                </View>
                <View style={{
                    padding: 20,
                    alignItems: 'center'
                }}>
                    <Ionicons name="heart" size={24} color="black" />
                    <Text style={{
                        fontFamily: 'Outfit-Bold',
                        fontSize: 20
                    }}>
                        {totalLikes} Likes
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default ProfileIntro