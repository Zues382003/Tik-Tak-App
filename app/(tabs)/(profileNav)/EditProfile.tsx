import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Avatar, Divider, Text } from 'native-base'
import Colors from '@/app/Utils/Colors'
import { router, useLocalSearchParams } from 'expo-router'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { firebase } from '../../../Config/ConfigFireBase';
import { UserService } from '@/Service/UserService'



const truncateText = (text: string, maxLength: number = 24) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

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

const EditProfile = () => {
    const params = useLocalSearchParams();
    const dataUser = Array.isArray(params?.dataUser) ? params.dataUser : JSON.parse(params?.dataUser || '[]');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);


    // Select a video from the gallery
    const selectVideoFile = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const fileInfo = await FileSystem.getInfoAsync(imageUri);

            if (fileInfo.exists) {
                try {
                    setIsUploading(true);
                    setUploadProgress(0);
                    const avatar = await uploadFile(imageUri, 'image');
                    setUploadProgress(50);

                    await UserService.updateAvatar(dataUser.email, avatar);
                    setUploadProgress(100);

                    // Thêm logic reload trang
                    Alert.alert('Upload Successful', 'Your content has been uploaded and saved successfully.', [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.replace({
                                    pathname: '/(tabs)/(profileNav)/Profile',
                                });
                            }
                        }
                    ]);
                }
                catch (error) {
                    // ... existing error handling ...
                } finally {
                    setIsUploading(false);
                }
            }
        }
    };

    const editDetail = (label: string, data: string) => {
        router.push({
            pathname: '/(tabs)/(profileNav)/EditDetail',
            params: {
                label: label,
                data: data,
                email: dataUser.email
            }
        });
    }


    return (
        <View style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
            {isUploading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <ActivityIndicator size="large" color={Colors.WHITE} />
                    <Text style={{ color: Colors.WHITE, marginTop: 10 }}>{`Uploading... ${uploadProgress}%`}</Text>
                </View>
            )}
            <View
                style={{ marginLeft: 10, marginRight: 10, marginTop: 30, flex: 1 }}

            >
                <View
                    style={{ marginBottom: 6, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                >
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', left: 0, top: 0, position: 'absolute' }}
                        onPress={() => router.back()}
                    >
                        <AntDesign name="arrowleft" size={28} color="black" />
                    </TouchableOpacity>
                    <Text
                        style={{ fontFamily: 'Outfit-Medium', fontSize: 18 }}
                    >
                        {dataUser?.username}
                    </Text>
                </View>

                <Divider my="2" _light={{
                    bg: "gray.300"
                }} _dark={{
                    bg: "gray.200"
                }} />

                <View
                    style={{ marginTop: 20, flex: 1 }}
                >
                    <TouchableOpacity
                        onPress={selectVideoFile}
                    >
                        <Avatar bg="gray.200" alignSelf="center" size="xl" source={{
                            uri: dataUser.profileImage
                        }}>
                            <Avatar.Badge
                                bg="gray.200"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderColor: 'white',
                                    borderWidth: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Ionicons name="camera-outline" size={18} color="black" />
                            </Avatar.Badge>
                        </Avatar>
                    </TouchableOpacity>
                    <Text
                        color={'gray.800'}
                        style={{
                            textAlign: 'center',
                            marginTop: 8,
                            fontSize: 14,
                            fontFamily: 'Outfit-Regular'
                        }}
                    >
                        Change photo
                    </Text>


                    <TouchableOpacity
                        style={{ marginHorizontal: 10, marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', }}
                        onPress={() => editDetail('name', dataUser.name)}
                    >
                        <Text
                            color={'gray.800'}
                            style={{
                                textAlign: 'center',
                                fontSize: 14,
                                fontFamily: 'Outfit-Regular'
                            }}
                        >
                            Name
                        </Text>
                        <View
                            style={{ flexDirection: 'row' }}
                        >
                            <Text
                                color={'gray.400'}
                                style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                    fontFamily: 'Outfit-Regular',
                                    marginRight: 4
                                }}
                            >
                                {dataUser.name}
                            </Text>
                            <AntDesign name="right" size={18} color="gray" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}
                        onPress={() => editDetail('username', dataUser.username)}

                    >
                        <Text
                            color={'gray.800'}
                            style={{
                                textAlign: 'center',
                                fontSize: 14,
                                fontFamily: 'Outfit-Regular'
                            }}
                        >
                            Username
                        </Text>
                        <View
                            style={{ flexDirection: 'row' }}
                        >
                            <Text
                                color={'gray.400'}
                                style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                    fontFamily: 'Outfit-Regular',
                                    marginRight: 4
                                }}
                            >
                                {dataUser.username}
                            </Text>
                            <AntDesign name="right" size={18} color="gray" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}
                        onPress={() => editDetail('bio', dataUser.bio)}

                    >
                        <Text
                            color={'gray.800'}
                            style={{
                                textAlign: 'center',
                                fontSize: 14,
                                fontFamily: 'Outfit-Regular'
                            }}
                        >
                            Bio
                        </Text>
                        <View
                            style={{ flexDirection: 'row' }}
                        >
                            <Text
                                color={'gray.400'}
                                style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                    fontFamily: 'Outfit-Regular',
                                    marginRight: 4
                                }}
                            >
                                {dataUser.bio ? truncateText(dataUser.bio) : 'Add to Bio to your profile'}
                            </Text>
                            <AntDesign name="right" size={18} color="gray" />
                        </View>
                    </TouchableOpacity>

                    <Divider my="8" _light={{
                        bg: "gray.300"
                    }} _dark={{
                        bg: "gray.200"
                    }} />

                    <TouchableOpacity
                        style={{ marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between' }}
                        onPress={() => editDetail('facebook', dataUser.facebook)}

                    >
                        <Text
                            color={'gray.800'}
                            style={{
                                textAlign: 'center',
                                fontSize: 14,
                                fontFamily: 'Outfit-Regular'
                            }}
                        >
                            Facebook
                        </Text>
                        <View
                            style={{ flexDirection: 'row' }}
                        >
                            <Text
                                color={'gray.400'}
                                style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                    fontFamily: 'Outfit-Regular',
                                    marginRight: 4
                                }}
                            >
                                {dataUser.facebook ? truncateText(dataUser.facebook) : 'Add to Facebook to your profile'}
                            </Text>
                            <AntDesign name="right" size={18} color="gray" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}
                        onPress={() => editDetail('youtube', dataUser.youtube)}

                    >
                        <Text
                            color={'gray.800'}
                            style={{
                                textAlign: 'center',
                                fontSize: 14,
                                fontFamily: 'Outfit-Regular'
                            }}
                        >
                            Youtube
                        </Text>
                        <View
                            style={{ flexDirection: 'row' }}
                        >
                            <Text
                                color={'gray.400'}
                                style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                    fontFamily: 'Outfit-Regular',
                                    marginRight: 4
                                }}
                            >
                                {dataUser.youtube ? truncateText(dataUser.youtube) : 'Add to Youtube to your profile'}
                            </Text>
                            <AntDesign name="right" size={18} color="gray" />
                        </View>
                    </TouchableOpacity>

                </View>

            </View>
        </View>
    )
}

export default EditProfile