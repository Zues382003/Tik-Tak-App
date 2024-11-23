import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '@/app/Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ProfileIntroProps {
    postList: any[];
    dataUser: any
}

const OtherUserProfileIntro: React.FC<ProfileIntroProps> = (props) => {


    const [totalLikes, setTotalLikes] = useState(0);

    useEffect(() => {
        calculateToltalLikes();
    }, [props.postList])

    const calculateToltalLikes = () => {
        let totalLikes = 0;
        props.postList?.forEach((post) => {
            totalLikes += post?.VideoLikes?.length;
        })
        setTotalLikes(totalLikes);
    }
    return (
        <View>
            <Text style={{
                fontSize: 24,
                fontFamily: 'Outfit-Bold'
            }}>Profile</Text>
            <View style={{ marginTop: 10, alignItems: 'center' }}>
                <Image source={{ uri: props.dataUser?.profileImage }}  // Access the first element of the array
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 99,
                    }} />
                <Text style={{
                    fontSize: 22,
                    fontFamily: 'Outfit-Medium'
                }}>{props.dataUser?.name}</Text>
                <Text style={{
                    fontSize: 17,
                    fontFamily: 'Outfit-Regular',
                    color: Colors.BACKGROUND_TRANSNP
                }}>{props.dataUser?.bio || 'No bio available'}</Text>
            </View>
            <View style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around'
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
                        {props.postList?.length} Posts
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