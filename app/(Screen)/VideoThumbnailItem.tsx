import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect } from 'react'
import Colors from '../Utils/Colors'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { supabase } from '../Utils/SupabaseConfig';

export default function VideoThumbnailItem({ video, isDisplayTrashIcon, OnProfileRefresh }: any) {
    const router = useRouter();

    useEffect(() => {
    }, [video]);

    const handlePress = () => {
        router.push({
            pathname: '/PlayVideoList',
            params: { video: JSON.stringify(video) }
        });
    };

    const showAlert = () =>
        Alert.alert(
            'Do you want to delete?',
            'Do you really want to delete this video?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => deletePostVideo(),
                    style: 'destructive',
                }
            ],
        );
    const deletePostVideo = async () => {
        await supabase.from('PostList')
            .delete()
            .eq('id', video.id);
        OnProfileRefresh();
    };

    const handleDelete = () => {
        showAlert();
    };

    return (
        <View style={{ margin: 5, flex: 1 }}>
            {isDisplayTrashIcon
                && <TouchableOpacity onPress={handleDelete} style={{
                    position: 'absolute', zIndex: 10, top: 0, right: 0, padding: 10
                }}>
                    <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>
            }
            <TouchableOpacity onPress={handlePress}>
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
                        <Image source={{ uri: video?.Users?.profileImage }} style={{ width: 20, height: 20, borderRadius: 99 }} />
                        <Text style={{ color: Colors.WHITE, fontFamily: 'Outfit-Regular', fontSize: 12 }}>{video?.Users?.name}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Text style={{ color: Colors.WHITE, fontFamily: 'Outfit-Regular', fontSize: 12 }}>{video?.VideoLikes?.length}</Text>
                        {video?.VideoLikes?.length > 0
                            ? <Ionicons name="heart" size={24} color={Colors.FILlHEART} />
                            : <Ionicons name="heart-outline" size={24} color="white" />}
                    </View>
                </View>
                <Image source={{ uri: video.thumbnail }} style={{ width: '100%', height: 260, borderRadius: 10 }} />
            </TouchableOpacity>
        </View>

    )
}