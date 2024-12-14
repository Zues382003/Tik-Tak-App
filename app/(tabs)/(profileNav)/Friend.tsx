import { Animated, Dimensions, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Avatar, Box, FlatList, Icon, Input, KeyboardAvoidingView, Pressable, ScrollView, Text, useColorModeValue } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/app/Utils/Colors';
import { TabView, SceneMap } from 'react-native-tab-view';
import AntDesign from '@expo/vector-icons/AntDesign';
import { UserService } from '@/Service/UserService';
import { debounce } from 'lodash';

export default function FriendScreen() {
    const params = useLocalSearchParams();
    const followings = Array.isArray(params?.followings) ? params.followings : JSON.parse(params?.followings || '[]');
    const followers = Array.isArray(params?.followers) ? params.followers : JSON.parse(params?.followers || '[]');
    const dataUser = Array.isArray(params?.dataUser) ? params.dataUser : JSON.parse(params?.dataUser || '[]');
    const tabIndex = params?.tabIndex as any;
    const [followingUsers, setFollowingUsers] = useState<any[]>([]);
    const [followerUsers, setFollowerUsers] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);


    useEffect(() => {
        setFollowingUsers([]);
        setFollowerUsers([]);
        fetchFollowingUser();
        fetchFollowerUser();
    }, [])

    useEffect(() => {

        const mutualFriends = followingUsers.filter(following =>
            followerUsers.some(follower => follower.id === following.id)
        );
        setFriends(mutualFriends);
    }, [followingUsers, followerUsers]);

    const fetchFollowingUser = () => {
        if (!followings) {
            return;
        }

        followings.forEach((item: { followedId: number; followerEmail: string; id: number }) => {
            UserService.getUserById(item.followedId).then(userArray => {
                if (userArray) {
                    const user = userArray[0];
                    setFollowingUsers(prev => [...prev, user]);
                }
            });
        });
    }

    const fetchFollowerUser = () => {
        if (!followers) {
            return;
        }

        followers.forEach((item: { followedId: number; followerEmail: string; id: number }) => {
            UserService.getDataUserByEmail(item.followerEmail).then(userArray => {
                if (userArray) {
                    const user = userArray[0];
                    setFollowerUsers(prev => [...prev, user]);
                }
            });
        });
    }

    const handleOpenProfile = async (user: any) => {
        router.push({
            pathname: '/(tabs)/(profileNav)/Profile',
            params: {
                user: JSON.stringify(user),
            }
        });
    }


    const FirstRoute: React.FC = () => {

        const [searchQuery, setSearchQuery] = useState<string>('');

        const debouncedSearch = debounce((text: string) => {
            setSearchQuery(text);
        }, 500);

        return (
            <View style={{ flex: 1 }}>
                <Box
                    style={{ marginTop: 12, marginBottom: 16 }}
                >
                    <Input
                        placeholder="Search People" width="100%" borderRadius="8" py="2" px="1" fontSize="14"
                        onChangeText={debouncedSearch}
                        InputLeftElement={<Icon m="2" ml="3" size="6" color="gray.400"
                            as={<MaterialIcons name="search" />} />}
                        InputRightElement={<Icon m="2" mr="3" size="6" color="gray.400" as={<MaterialIcons name="mic" />} />}
                    />
                </Box>
                <FlatList
                    removeClippedSubviews={true}
                    data={followingUsers.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    renderItem={({ item }: { item: { id: number, name: string, username: string, profileImage: string, email: string, bio: string } }) =>
                        <TouchableOpacity
                            onPress={() => handleOpenProfile(item)}
                        >
                            <View
                                style={{ display: 'flex', flexDirection: 'row', marginVertical: 8, marginHorizontal: 4 }}
                            >
                                <Avatar
                                    size="52px" source={{
                                        uri: item.profileImage
                                    }} />
                                <View
                                    style={{ marginLeft: 12 }}
                                >
                                    <Text
                                        style={{ fontFamily: 'Outfit-Medium', fontSize: 16 }}
                                        _dark={{
                                            color: "warmGray.50"
                                        }} color="coolGray.800">
                                        {item.name}
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'Outfit-Regular', fontSize: 14 }}

                                        color="coolGray.600" _dark={{
                                            color: "warmGray.200"
                                        }}>
                                        {item.username}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>} keyExtractor={item => item.id ? item.id.toString() : 'defaultKey'} />
            </View>
        );
    }

    const SecondRoute: React.FC = () => {

        const [searchQuery2, setSearchQuery2] = useState<string>('');

        const debouncedSearch = debounce((text: string) => {
            setSearchQuery2(text);
        }, 500);

        return (
            <View style={{ flex: 1 }}>
                <Box
                    style={{ marginTop: 12, marginBottom: 16 }}
                >
                    <Input
                        placeholder="Search People" width="100%" borderRadius="8" py="2" px="1" fontSize="14"
                        onChangeText={debouncedSearch}
                        InputLeftElement={<Icon m="2" ml="3" size="6" color="gray.400"
                            as={<MaterialIcons name="search" />} />}
                        InputRightElement={<Icon m="2" mr="3" size="6" color="gray.400" as={<MaterialIcons name="mic" />} />}
                    />
                </Box>
                <FlatList
                    removeClippedSubviews={true}
                    data={followerUsers.filter(user => user.name.toLowerCase().includes(searchQuery2.toLowerCase()))}
                    renderItem={({ item }: { item: { id: number, name: string, username: string, profileImage: string, email: string, bio: string } }) =>
                        <TouchableOpacity
                            onPress={() => handleOpenProfile(item)}

                        >
                            <View
                                style={{ display: 'flex', flexDirection: 'row', marginVertical: 8, marginHorizontal: 4 }}
                            >
                                <Avatar
                                    size="52px" source={{
                                        uri: item.profileImage
                                    }} />
                                <View
                                    style={{ marginLeft: 12 }}
                                >
                                    <Text
                                        style={{ fontFamily: 'Outfit-Medium', fontSize: 16 }}
                                        _dark={{
                                            color: "warmGray.50"
                                        }} color="coolGray.800">
                                        {item.name}
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'Outfit-Regular', fontSize: 14 }}

                                        color="coolGray.600" _dark={{
                                            color: "warmGray.200"
                                        }}>
                                        {item.username}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>} keyExtractor={item => item.id ? item.id.toString() : 'defaultKey2'} />
            </View>
        );
    }

    const ThirdRoute: React.FC = () => {
        const [searchQuery3, setSearchQuery3] = useState<string>('');

        const debouncedSearch = debounce((text: string) => {
            setSearchQuery3(text);
        }, 500);
        return (
            <View style={{ flex: 1 }}>
                <Box
                    style={{ marginTop: 12, marginBottom: 16 }}
                >
                    <Input
                        placeholder="Search Friend" width="100%" borderRadius="8" py="2" px="1" fontSize="14"
                        onChangeText={debouncedSearch}
                        InputLeftElement={<Icon m="2" ml="3" size="6" color="gray.400"
                            as={<MaterialIcons name="search" />} />}
                        InputRightElement={<Icon m="2" mr="3" size="6" color="gray.400" as={<MaterialIcons name="mic" />} />}
                    />
                </Box>
                <FlatList
                    removeClippedSubviews={true}
                    data={friends.filter(user => user.name.toLowerCase().includes(searchQuery3.toLowerCase()))}
                    renderItem={({ item }: { item: { id: number, name: string, username: string, profileImage: string, email: string, bio: string } }) =>
                        <TouchableOpacity
                            onPress={() => handleOpenProfile(item)}

                        >
                            <View
                                style={{ display: 'flex', flexDirection: 'row', marginVertical: 8, marginHorizontal: 4 }}
                            >
                                <Avatar
                                    size="52px" source={{
                                        uri: item.profileImage
                                    }} />
                                <View
                                    style={{ marginLeft: 12 }}
                                >
                                    <Text
                                        style={{ fontFamily: 'Outfit-Medium', fontSize: 16 }}
                                        _dark={{
                                            color: "warmGray.50"
                                        }} color="coolGray.800">
                                        {item.name}
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'Outfit-Regular', fontSize: 14 }}

                                        color="coolGray.600" _dark={{
                                            color: "warmGray.200"
                                        }}>
                                        {item.username}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>} keyExtractor={item => item.id ? item.id.toString() : 'defaultKey3'} />
            </View>
        )
    }


    const initialLayout = {
        width: Dimensions.get('window').width
    };

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
        third: ThirdRoute,
    });

    const Tabs: React.FC<{ tabIndex: any }> = (props) => {
        const [index, setIndex] = React.useState<number>(props.tabIndex | 0);
        const [routes] = React.useState<{ key: string; title: string }[]>([
            { key: 'first', title: 'Following ' + followings.length },
            { key: 'second', title: 'Follower ' + followers.length },
            { key: 'third', title: 'Friend' },
        ]);

        const renderTabBar = (props: any) => {
            const inputRange = props.navigationState.routes.map((x: any, i: number) => i);
            return (
                <Box flexDirection="row">
                    {props.navigationState.routes.map((route: any, i: number) => {
                        const opacity = props.position.interpolate({
                            inputRange,
                            outputRange: inputRange.map((inputIndex: number) => (inputIndex === i ? 1 : 0.5))
                        });
                        const color = index === i ? useColorModeValue('#000', '#e5e5e5') : useColorModeValue('#1f2937', '#a1a1aa');
                        const borderColor = index === i ? 'black' : useColorModeValue('coolGray.200', 'gray.400');
                        return (
                            <Box borderBottomWidth="3" borderColor={borderColor} flex={1} alignItems="center" p="3" key={route.key}>
                                <Pressable onPress={() => {
                                    // console.log(i);
                                    setIndex(i);
                                }}>
                                    <Animated.Text style={{ color }}>{route.title}</Animated.Text>
                                </Pressable>
                            </Box>
                        );
                    })}
                </Box>
            );
        };

        return (
            <TabView
                style={{ flex: 1 }}
                navigationState={{
                    index,
                    routes
                }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
            />
        );
    }

    return (
        <KeyboardAvoidingView style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
            <View
                style={{ marginLeft: 10, marginRight: 10, marginTop: 30, flex: 1 }}
            // showsVerticalScrollIndicator={false}
            // showsHorizontalScrollIndicator={false}
            // contentContainerStyle={{ flexGrow: 1 }} // Đảm bảo ScrollView có thể mở rộng
            >
                <TouchableOpacity
                    style={{ position: 'absolute', left: 0, top: 0 }}
                    onPress={() => router.back()}
                >
                    <AntDesign name="arrowleft" size={28} color="black" />
                </TouchableOpacity>
                <View
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}
                >
                    <Text
                        style={{ fontFamily: 'Outfit-Medium', fontSize: 18 }}
                    >
                        {dataUser?.username}
                    </Text>
                </View>

                <Tabs tabIndex={tabIndex} />
            </View>
        </KeyboardAvoidingView>
    );

}               
