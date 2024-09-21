import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../Utils/Colors'
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VideoThumbnailItem({ video }: any) {
    return (
        <View style={{ margin: 5, flex: 1 }}>
            <View style={{
                position: 'absolute', zIndex: 10, bottom: 0, padding: 5,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                paddingHorizontal: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
            }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Image source={{ uri: video?.Users?.profileImageUrl }} style={{ width: 20, height: 20, borderRadius: 99, backgroundColor: Colors.WHITE }} />
                    <Text style={{ color: Colors.WHITE, fontFamily: 'Outfit-Regular', fontSize: 12 }}>{video?.Users?.name}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Text style={{ color: Colors.WHITE, fontFamily: 'Outfit-Regular', fontSize: 12 }}>36</Text>
                    <Ionicons name="heart-outline" size={24} color="white" />
                </View>
            </View>
            <Image source={{ uri: video.thumbnail }} style={{ width: '100%', height: 250, borderRadius: 10 }} />
        </View>

    )
}