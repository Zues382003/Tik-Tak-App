import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useClerk, useUser } from '@clerk/clerk-expo'; // Import useClerk
import Colors from '@/app/Utils/Colors';
import { useRouter } from 'expo-router';
import { Button } from 'native-base';
import { FriendService } from '@/Service/FriendService';

interface ProfileIntroProps {
    postList: any[];
    dataUser: any;
    followings: any[];
    followers: any[];
    isOwner: boolean
}

const ProfileIntro: React.FC<ProfileIntroProps> = (props) => {
    const { signOut } = useClerk();
    const [totalLikes, setTotalLikes] = useState(0);
    const router = useRouter();
    const [isFollow, setIsFollow] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        calculateToltalLikes();
    }, [props.postList]);

    useEffect(() => {
        const checkFollowStatus = async () => { // Định nghĩa hàm async
            if (user && user.primaryEmailAddress?.emailAddress) {
                const isFollow = await FriendService.checkFollow(user.primaryEmailAddress.emailAddress, props.dataUser.id);
                setIsFollow(isFollow);
            }
        };
        checkFollowStatus();
    }, []);

    const calculateToltalLikes = () => {
        let totalLikes = 0;
        props.postList?.forEach((post) => {
            totalLikes += post?.VideoLikes?.length;
        });
        setTotalLikes(totalLikes);
    };

    const handleOpenFollowing = () => {
        router.push({
            pathname: '/(tabs)/(profileNav)/Friend',
            params: {
                followings: JSON.stringify(props.followings),
                followers: JSON.stringify(props.followers),
                dataUser: JSON.stringify(props.dataUser),
                tabIndex: JSON.stringify(0)
            }
        });
    }

    const handleOpenFollower = () => {
        router.push({
            pathname: '/(tabs)/(profileNav)/Friend',
            params: {
                followings: JSON.stringify(props.followings),
                followers: JSON.stringify(props.followers),
                tabIndex: JSON.stringify(1)
            }
        });
    }

    const handleOpenEditProfile = () => {
        router.push({
            pathname: '/(tabs)/(profileNav)/EditProfile',
            params: {
                dataUser: JSON.stringify(props.dataUser),
            }
        });
    }


    const handleSignOut = async () => {
        await signOut(); // Đăng xuất
        router.replace({ pathname: '/LoginScreen' }); // Điều hướng đến trang đăng nhập
    };

    const handlePressFollowButton = async () => {
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            return;
        }

        if (!isFollow) {
            await FriendService.insertFollow(user?.primaryEmailAddress?.emailAddress, props.dataUser.id)
            setIsFollow(true);
        }
        else {
            await FriendService.deleteFollow(user?.primaryEmailAddress?.emailAddress, props.dataUser.id)
            setIsFollow(false);

        }
    };


    return (
        <View style={{ marginTop: 30 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{
                    fontSize: 24,
                    fontFamily: 'Outfit-Bold'
                }}>Profile</Text>
                {/* Nút Đăng xuất */}
                {props.isOwner || user?.primaryEmailAddress?.emailAddress === props.dataUser?.email ? (
                    <Button
                        onPress={handleSignOut}
                        size="xs"
                        variant="outline"
                        _text={{ fontSize: 16, color: 'black', fontFamily: 'Outfit-Bold' }}
                        _pressed={{
                            _text: { color: 'white' },
                            backgroundColor: 'black'
                        }}>
                        Logout
                    </Button>
                ) : (
                    <Button
                        size="xs"
                        variant="outline"
                        onPress={handlePressFollowButton}
                        backgroundColor={isFollow ? 'black' : 'white'}
                        _text={isFollow ? { fontSize: 16, color: 'white', fontFamily: 'Outfit-Bold' } : { fontSize: 16, color: 'black', fontFamily: 'Outfit-Bold' }}
                        _pressed={{
                            _text: { color: isFollow ? 'black' : 'white' },
                            backgroundColor: isFollow ? 'white' : 'black'
                        }}>
                        {isFollow ? 'Followed' : 'Follow'}
                    </Button>
                )}
            </View>
            <View style={{ marginHorizontal: 10, alignItems: 'center' }}>
                <Image source={{ uri: props.dataUser?.profileImage }}
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 99,
                    }} />
                <Text style={{
                    fontSize: 22,
                    fontFamily: 'Outfit-Medium',
                    marginTop: 10
                }}>{props.dataUser?.name}</Text>
                <Text style={{
                    marginTop: -5,
                    fontSize: 17,
                    fontFamily: 'Outfit-Regular',
                    color: Colors.BACKGROUND_TRANSNP
                }}>@{props.dataUser?.username || 'No bio available'}
                </Text>
            </View>
            <View style={{
                marginTop: 10,
                marginBottom: 10,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'

            }}>

                <TouchableOpacity
                    onPress={handleOpenFollowing}
                    style={{
                        padding: 2,
                        alignItems: 'center',
                        flex: 1,
                        marginLeft: 30
                    }}>
                    <Text style={{
                        fontFamily: 'Outfit-Bold',
                        fontSize: 20
                    }}>
                        {props.followings?.length}
                    </Text>
                    <Text style={{
                        fontFamily: 'Outfit-Regular',
                        color: 'gray',
                        fontSize: 16
                    }}>
                        Following
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleOpenFollower}

                    style={{
                        padding: 2,
                        alignItems: 'center',
                        flex: 1
                    }}>
                    <Text style={{
                        fontFamily: 'Outfit-Bold',
                        fontSize: 20
                    }}>
                        {props.followers.length}
                    </Text>
                    <Text style={{
                        fontFamily: 'Outfit-Regular',
                        color: 'gray',
                        fontSize: 16
                    }}>
                        Followers
                    </Text>
                </TouchableOpacity>
                <View style={{
                    padding: 2,
                    alignItems: 'center',
                    flex: 1,
                    marginRight: 30
                }}>
                    <Text style={{
                        fontFamily: 'Outfit-Bold',
                        fontSize: 20
                    }}>
                        {totalLikes}
                    </Text>
                    <Text style={{
                        fontFamily: 'Outfit-Regular',
                        color: 'gray',
                        fontSize: 16
                    }}>
                        Likes
                    </Text>
                </View>
            </View>
            {props.isOwner && <View
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    marginBottom: 10
                }}>
                <Button
                    style={{ width: 140 }}
                    size="sm"
                    onPress={handleOpenEditProfile}
                    variant="outline"
                    _text={{ fontSize: 18, color: 'black', fontFamily: 'Outfit-Bold' }}
                    _pressed={{
                        _text: { color: 'white' },
                        backgroundColor: 'black'
                    }}>
                    Edit Profile
                </Button>
            </View>
            }
            <View
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    marginBottom: 10
                }}
            >
                <Text style={{
                    fontSize: 17,
                    fontFamily: 'Outfit-Regular',
                    color: Colors.BACKGROUND_TRANSNP
                }}>{props.dataUser?.bio || 'No bio available'}
                </Text>
            </View>
        </View>
    );
}

export default ProfileIntro;