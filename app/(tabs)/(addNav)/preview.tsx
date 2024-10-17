import { View, Text, Image, TextInput, KeyboardAvoidingView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/app/Utils/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { firebase } from '../../../Config/ConfigFireBase';


export default function PreviewScreen() {
    const [videoUri, setVideoUri] = useState('');
    const params = useLocalSearchParams();
    const thumbnailUri = params.thumbnailUri as string;
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const cloudName = 'dp8hznqy4';
    const uploadPreset = 'ml_default';
    const { user } = useUser();

    useEffect(() => {
        const getVideoUri = async () => {
            const uri = await AsyncStorage.getItem('videoUri');
            if (uri) setVideoUri(uri);
        };
        getVideoUri();
    }, []);

    useEffect(() => {
        console.log('Thumbnail URI:', thumbnailUri);
    }, [thumbnailUri]);

    useEffect(() => {
        const checkFile = async () => {
            console.log('Video URI in preview:', videoUri);
            try {
                const fileInfo = await FileSystem.getInfoAsync(videoUri);
                console.log('File exists in preview:', fileInfo.exists);
                console.log('File info in preview:', fileInfo);
            } catch (error) {
                console.error('Error checking file:', error);
            }
        };
        checkFile();
    }, [videoUri]);

    const uploadContent = async () => {
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const thumbnailUrl = await uploadFile(thumbnailUri, 'image');
            setUploadProgress(50);
            const videoUrl = await uploadFile(videoUri, 'video');
            setUploadProgress(75);

            // Save data to Supabase
            const { data, error } = await supabase
                .from('PostList')
                .insert([
                    {
                        videoUrl: videoUrl,
                        thumbnail: thumbnailUrl,
                        description: description,
                        emailRef: user?.primaryEmailAddress?.emailAddress
                    }
                ]);

            if (error) throw error;

            setUploadProgress(100);
            console.log('Upload and save complete. Data:', data);

            Alert.alert('Upload Successful', 'Your content has been uploaded and saved successfully.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Upload or save failed:', error);
            Alert.alert('Upload Failed', 'There was an error uploading or saving your content. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }

    // const uploadFile = async (fileUri: string, resourceType: 'image' | 'video') => {
    //     try {
    //         const fileInfo = await FileSystem.getInfoAsync(fileUri);
    //         if (!fileInfo.exists) {
    //             throw new Error(`File does not exist: ${fileUri}`);
    //         }

    //         const timestamp = new Date().getTime();
    //         const fileName = `${resourceType}-${timestamp}${resourceType === 'image' ? '.jpg' : '.mp4'}`;

    //         const formData = new FormData();
    //         formData.append('file', {
    //             uri: fileUri,
    //             type: resourceType === 'image' ? 'image/jpeg' : 'video/mp4',
    //             name: fileName,
    //         } as any);
    //         formData.append('upload_preset', uploadPreset);

    //         const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    //             method: 'POST',
    //             body: formData,
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    //         }

    //         const data = await response.json();
    //         return data.secure_url;
    //     } catch (error) {
    //         console.error('Upload error:', error);
    //         if (error instanceof Error) {
    //             Alert.alert('Upload Error', error.message);
    //         } else {
    //             Alert.alert('Upload Error', 'An unknown error occurred');
    //         }
    //         throw error;
    //     }
    // }

    const uploadFile = async (fileUri: string, resourceType: 'image' | 'video') => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                throw new Error(`File does not exist: ${fileUri}`);
            }
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    resolve(xhr.response);
                }
                xhr.onerror = (e) => {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('Get', fileUri, true);
                xhr.send(null);
            })

            const timestamp = new Date().getTime();
            const fileName = `${resourceType}-${timestamp}${resourceType === 'image' ? '.jpg' : '.mp4'}`;

            const ref = firebase.storage().ref().child(fileName);

            await ref.put(blob as any);


            // Lấy URL tải xuống
            const downloadURL = await ref.getDownloadURL();
            return downloadURL; // Trả về URL tải xuống
        }
        catch (error) {
            console.error('Upload error:', error);
            if (error instanceof Error) {
                Alert.alert('Upload Error', error.message);
            } else {
                Alert.alert('Upload Error', 'An unknown error occurred');
            }
            throw error;
        }
    }

    return (
        <KeyboardAvoidingView style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
            <ScrollView style={{ marginLeft: 10, marginRight: 10, marginTop: 30 }}>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back-circle-sharp" size={38} color="black" />
                    <Text style={{ fontFamily: 'Outfit-Regular', fontSize: 20, marginLeft: 5 }}>Back</Text>
                </TouchableOpacity>
                <View style={{
                    alignItems: 'center',
                    margin: 10
                }}>
                    <Text style={{
                        fontFamily: 'Outfit-Bold',
                        fontSize: 20
                    }}>Add Details</Text>
                    <Image source={{ uri: thumbnailUri as string }}
                        style={{
                            width: 200,
                            height: 300,
                            borderRadius: 25,
                            marginTop: 15
                        }}
                    />
                    <TextInput
                        numberOfLines={3}
                        placeholder='Add a caption...'
                        style={{
                            borderWidth: 1,
                            width: '100%',
                            borderRadius: 10,
                            marginTop: 25,
                            borderColor: Colors.BACKGROUND_TRANSNP,
                            paddingHorizontal: 20
                        }}
                        value={description}
                        onChangeText={(text) => setDescription(text)}
                    ></TextInput>
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.BLACK,
                            padding: 10,
                            paddingHorizontal: 25,
                            borderRadius: 99,
                            marginTop: 20
                        }}
                        onPress={uploadContent}
                    >
                        <Text style={{ color: Colors.WHITE, fontFamily: 'Outfit-Regular' }}>Publish</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {isUploading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <ActivityIndicator size="large" color={Colors.WHITE} />
                    <Text style={{ color: Colors.WHITE, marginTop: 10 }}>{`Uploading... ${uploadProgress}%`}</Text>
                </View>
            )}
        </KeyboardAvoidingView>
    )
}