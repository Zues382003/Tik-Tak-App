import { View, FlatList, RefreshControl, ActivityIndicator, Dimensions, Pressable, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { PostListService } from '@/Service/PostListService';
import { FriendService } from '@/Service/FriendService';
import UserPostList from '@/app/(tabs)/(profileNav)/UserPostList';
import ProfileIntro from '@/app/(tabs)/(profileNav)/ProfileIntro';
import { SceneMap, TabView } from 'react-native-tab-view';
import { Box, useColorModeValue } from 'native-base';
import Animated from 'react-native-reanimated';
type profileComponent = {
    isOwner: boolean,
    user: any
}
const ProfileComponent = (props: profileComponent) => {
    const [postList, setPostList] = useState([]);
    const [likedVideoList, setLikedVideoList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const [dataUser, setDataUser] = useState<{ id: number }[]>([]);
    const [followings, setFollowings] = useState([]);
    const [followers, setFollowers] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading to true before fetching
            await getUserPostsFromService();
            await getListVideoLikedFromService();
            await getDataUserFromService();
            setIsLoading(false); // Set loading to false after fetching
        };

        fetchData();
    }, [props.user]);

    useEffect(() => {
        const fetchFollowData = async () => {
            setIsLoading(true); // Set loading to true before fetching
            if (dataUser.length > 0) {
                await getUserPostsFromService(); // Fetch posts when dataUser is updated
                await getListVideoLikedFromService();
                await getFollowingFromService();
                await getFollowerFromService();
            }
            setIsLoading(false); // Set loading to false after fetching
        };

        fetchFollowData();
    }, [dataUser]);

    const getUserPostsFromService = async () => {
        let userEmail: string | undefined;
        if (props.isOwner) {
            userEmail = props.user?.primaryEmailAddress?.emailAddress?.toString();
        } else {
            userEmail = props.user.email;
        }

        if (!userEmail) {
            console.error("User email is undefined");
            return;
        }

        try {
            const userPosts = await PostListService.getUserPostsByEmail(userEmail);
            setPostList(userPosts as any);
        } catch (error) {
            console.error("Error fetching user posts from service:", error);
        }
    };

    const getListVideoLikedFromService = async () => {
        let userEmail: string | undefined;
        if (props.isOwner) {
            userEmail = props.user?.primaryEmailAddress?.emailAddress?.toString();
        } else {
            userEmail = props.user.email;
        }

        if (!userEmail) {
            console.error("User email is undefined");
            return;
        }

        try {
            const listVideoLiked = await PostListService.getListVideoLikedByEmail(userEmail);
            setLikedVideoList(listVideoLiked as any);
        } catch (error) {
            console.error("Error fetching user posts from service:", error);
        }
    };

    const getDataUserFromService = async () => {
        const userEmail = props.isOwner
            ? props.user?.primaryEmailAddress?.emailAddress?.toString()
            : props.user.email;

        if (!userEmail) {
            console.error("User email is undefined");
            return;
        }

        try {
            const data = await PostListService.getDataUser(userEmail);
            setDataUser(data as any);
        } catch (error) {
            console.error("Error fetching data user from service:", error);
        }
    }

    const getFollowingFromService = async () => {
        let userEmail: string | undefined;
        if (props.isOwner) {
            userEmail = props.user?.primaryEmailAddress?.emailAddress?.toString();
        } else {
            userEmail = props.user.email;
        }
        if (!userEmail) {
            console.error("User email is undefined");
            return;
        }
        try {
            const data = await FriendService.getFollowing(userEmail);
            setFollowings(data as any);
        } catch (error) {
            console.error("Error fetching following from service:", error);
        }
    }

    const getFollowerFromService = async () => {
        if (!dataUser || dataUser.length === 0) {
            console.error("Data user is undefined or empty");
            return;
        }
        try {
            const data = await FriendService.getFollower(dataUser[0]?.id);
            setFollowers(data as any);
        } catch (error) {
            console.error("Error fetching followers from service:", error);
        }
    }

    const FirstRoute: React.FC = () => {

        return (
            <View style={{ flex: 1, marginTop: 6 }}>
                <UserPostList postList={postList} isOwner={props.isOwner} getLastesPosts={getUserPostsFromService} isLoading={isLoading} />
            </View>
        );
    }

    const SecondRoute: React.FC = () => {

        return (
            <View style={{ flex: 1, marginTop: 6 }}>
                <UserPostList postList={likedVideoList} isOwner={false} getLastesPosts={getListVideoLikedFromService} isLoading={isLoading} />
            </View>
        );
    }

    const initialLayout = {
        width: Dimensions.get('window').width,
    };

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    const Tabs: React.FC<{ tabIndex: any }> = (props) => {
        const [index, setIndex] = React.useState<number>(props.tabIndex | 0);
        const [routes] = React.useState<{ key: string; title: string }[]>([
            { key: 'first', title: 'Posts' },
            { key: 'second', title: 'Likes' },
        ]);

        const renderTabBar = (props: any) => {
            const inputRange = props.navigationState.routes.map((x: any, i: number) => i);
            return (
                <Box
                    flexDirection="row">
                    {props.navigationState.routes.map((route: any, i: number) => {
                        const opacity = props.position.interpolate({
                            inputRange,
                            outputRange: inputRange.map((inputIndex: number) => (inputIndex === i ? 1 : 0.5))
                        });
                        const color = index === i ? useColorModeValue('#000', '#e5e5e5') : useColorModeValue('#1f2937', '#a1a1aa');
                        const borderColor = index === i ? 'black' : useColorModeValue('coolGray.200', 'gray.400');
                        return (
                            <Box
                                borderBottomWidth="3" borderColor={borderColor} flex={1} alignItems="center" p="3" key={route.key}>
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
                style={{ flex: 1, height: index === 0 ? calculateListHeight(postList.length) : calculateListHeight(likedVideoList.length) }}
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

    const calculateListHeight = (itemCount: number) => {
        // Số hàng cần thiết để hiển thị tất cả các item
        const rows = Math.ceil(itemCount / 2);

        // Tổng chiều cao = (chiều cao item * số hàng) + (khoảng cách giữa các item * (số hàng - 1))
        const totalHeight = (rows * 330) - (rows - 1) * 60;

        return totalHeight;
    };

    return (
        <View style={{ flex: 1 }}
        >
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={[{ key: 'profile' }]}
                    keyExtractor={(item) => item.key}
                    removeClippedSubviews={true} //React Native sẽ tự động loại bỏ các thành phần con (subviews) không nằm trong vùng nhìn thấy (viewport) của danh sách.
                    ListHeaderComponent={
                        <View style={{ paddingHorizontal: 10, paddingBottom: 10, flex: 1 }}>
                            <ProfileIntro
                                isOwner={props.isOwner}
                                postList={postList}
                                dataUser={dataUser[0]}
                                followings={followings}
                                followers={followers}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={{ flex: 1, paddingHorizontal: 6 }}>
                            <Tabs tabIndex={0} />
                        </View>
                    )}
                    contentContainerStyle={{ flexGrow: 1 }} // Đảm bảo rằng FlatList có thể mở rộng
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={() => {
                                getUserPostsFromService();
                                getDataUserFromService();
                                getFollowerFromService();
                                getFollowingFromService();
                            }}
                        />
                    }
                />
            )}
        </View>
    );

}

export default ProfileComponent