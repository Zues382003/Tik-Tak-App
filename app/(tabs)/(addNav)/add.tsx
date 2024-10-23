import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors'
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddScreen() {
    const router = useRouter();

    // Select a video from the gallery
    const selectVideoFile = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            const videoUri = result.assets[0].uri;
            console.log("Selected video URI:", videoUri);

            // Check if the file exists
            const fileInfo = await FileSystem.getInfoAsync(videoUri);
            console.log("File exists:", fileInfo.exists);
            console.log("File info:", fileInfo);

            if (fileInfo.exists) {
                generateVideoThumbnail(videoUri);
            } else {
                console.warn("Selected video file does not exist");
                // Handle the error, maybe show an alert to the user
            }
        }
    };

    // Used to generate a thumbnail for the video
    const generateVideoThumbnail = async (videoUri: string) => {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(
                videoUri,
                {
                    time: 0
                }
            );
            console.log("Thumbnail generated at:", uri);
            console.log("Video URI being passed:", videoUri);

            // Before navigation
            await AsyncStorage.setItem('videoUri', videoUri);

            // Navigate to PreviewScreen in the add tab
            router.push({
                pathname: '/(tabs)/(addNav)/Preview',
                params: {
                    thumbnailUri: uri
                }
            });
        } catch (e) {
            console.warn(e);
        }
    };

    return (
        <View style={{
            padding: 20,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            flex: 1
        }}>
            <Image source={require('../../../assets/images/folder.png')}
                style={{
                    width: 100,
                    height: 100
                }}
            />
            <Text style={{
                fontFamily: 'Outfit-Bold',
                fontSize: 20,
                marginTop: 20,
            }}>Start Uploading Short Video</Text>
            <Text style={{
                textAlign: 'center',
                marginTop: 13,
                fontFamily: 'Outfit-Regular'
            }}>Let's upload short video and start sharing your creativity with community</Text>

            <TouchableOpacity
                style={{
                    backgroundColor: Colors.BLACK,
                    padding: 10,
                    paddingHorizontal: 25,
                    borderRadius: 99,
                    marginTop: 20
                }}
                onPress={selectVideoFile}
            >
                <Text style={{ color: Colors.WHITE, fontFamily: 'Outfit-Regular' }}>Select Video File</Text>
            </TouchableOpacity>
        </View>
    )
}