import { View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/app/Utils/Colors';
import { Divider, Input, Text } from 'native-base';
import { UserService } from '@/Service/UserService';

const EditDetail = () => {
    const params = useLocalSearchParams();
    const [textInput, setTextInput] = useState(params.data as string)

    const getDisplayLabel = (label: string) => {
        switch (label?.toLowerCase()) {
            case 'name':
                return 'Name';
            case 'username':
                return 'Username';
            case 'bio':
                return 'Bio';
            case 'facebook':
                return 'Facebook';
            case 'youtube':
                return 'Youtube';
            default:
                return params.label;
        }
    };

    const handleSave = async () => {
        await UserService.updateDetail(params.label as string, textInput, params.email as string);
        router.replace({
            pathname: '/(tabs)/(profileNav)/Profile',
        });
    }

    return (
        <View style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
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
                        <Text
                            color={'gray.400'}
                            style={{ fontFamily: 'Outfit-Regular', fontSize: 18 }}
                        >
                            Hủy
                        </Text>
                    </TouchableOpacity>
                    <Text
                        style={{ fontFamily: 'Outfit-Medium', fontSize: 18 }}
                    >
                        {getDisplayLabel(params.label as string)}
                    </Text>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', right: 0, top: 0, position: 'absolute' }}
                        onPress={handleSave}
                    >
                        <Text
                            style={{ fontFamily: 'Outfit-Regular', fontSize: 18 }}
                        >
                            Lưu
                        </Text>
                    </TouchableOpacity>
                </View>

                <Divider my="2" _light={{
                    bg: "gray.300"
                }} _dark={{
                    bg: "gray.200"
                }} />

                <View
                    style={{ marginTop: 20, flex: 1 }}
                >
                    <Text
                        ml={1}
                        mr={1}
                        color={'gray.600'}
                        style={{ fontFamily: 'Outfit-Medium', fontSize: 16, marginBottom: 10 }}
                    >
                        {getDisplayLabel(params.label as string)}
                    </Text>

                    <Input
                        marginLeft={1}
                        mr={1}
                        value={textInput}
                        variant="underlined"
                        onChange={(e) => setTextInput(e.nativeEvent.text)}
                        size={'md'}
                        placeholder="Please enter the information." />

                </View>

            </View>
        </View>
    )
}

export default EditDetail