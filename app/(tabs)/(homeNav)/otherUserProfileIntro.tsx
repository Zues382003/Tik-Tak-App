import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '@/app/Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ProfileIntroProps {
    postList: any[]; // Replace 'any' with the correct type for postList
    user: any; // Add this line, replace 'any' with the correct type for user
}

const OtherUserProfileIntro: React.FC<ProfileIntroProps> = ({ postList, user }) => {


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
                <Image source={{ uri: user?.profileImage }}  // Access the first element of the array
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 99,
                    }} />
                <Text style={{
                    fontSize: 22,
                    fontFamily: 'Outfit-Medium'
                }}>{user?.name}</Text>
                <Text style={{
                    fontSize: 17,
                    fontFamily: 'Outfit-Regular',
                    color: Colors.BACKGROUND_TRANSNP
                }}>{user?.email}</Text>
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

export default OtherUserProfileIntro