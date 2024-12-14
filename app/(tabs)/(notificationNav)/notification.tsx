import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Colors from '@/app/Utils/Colors';
import { router } from 'expo-router';

type User = {
    username: string,
    email: string,
    profileImage: string
}

type Comment = {
    postIdRef: number
}

type Notification = {
    Users: User,
    id: number,
    userEmail: string,
    notificationText: string
    isRead: boolean,
    created_at: string,
    Comments: Comment,
}

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const { user } = useUser();

    const fetchNotifications = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('Notifications')
            .select('*, Users(username, profileImage, email), Comments(postIdRef)')
            .eq('userEmail', user?.primaryEmailAddress?.emailAddress)
            .neq('pushCommentEmail', user?.primaryEmailAddress?.emailAddress)
            // .order('isRead', { ascending: true }) // Sắp xếp theo isRead trước
            .order('created_at', { ascending: false }) // Sau đó sắp xếp theo created_at

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data);
        }
        setIsLoading(false);

    };


    useEffect(() => {
        fetchNotifications();

        // Lắng nghe sự kiện realtime
        const subscription = supabase
            .channel('notifications-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Notifications' }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);

            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Notifications' }, (payload) => {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === payload.new.id ? (payload.new as Notification) : notification
                    )
                );
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Notifications' }, (payload) => {
                setNotifications(prev =>
                    prev.filter(notification => notification.id !== payload.old.id)
                );
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const formatTimeAgo = (timestamp: string): string => {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - commentTime.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };


    const handleNotificationPress = async (item: Notification) => {

        if (!item.isRead) {
            const { error } = await supabase
                .from('Notifications')
                .update({ isRead: true })
                .eq('id', item.id);

            if (error) {
                console.error('Error updating notification:', error);
            } else {
                fetchNotifications();
            }
        }

        const { data } = await supabase
            .from('PostList')
            .select('*, Users(username, name, profileImage, email), VideoLikes(postIdRef, userEmail)')
            .range(0, 1)
            .eq('id', item.Comments.postIdRef)

        router.push({
            pathname: '/PlayVideoList',
            params: { video: JSON.stringify(data) }
        });
    };


    return (
        <View style={{ padding: 20, flex: 1 }}>
            <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 26, fontFamily: 'Outfit-Bold' }}>Notification</Text>
                <View style={{ position: 'absolute', right: 0, top: 12 }}>
                    <AntDesign name="setting" size={32} color={Colors.BLACK} />
                </View>
            </View>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                onRefresh={() => {
                    fetchNotifications();
                }}
                refreshing={isLoading}
                renderItem={({ item }) => (
                    item.isRead ? (<TouchableOpacity
                        style={{ marginVertical: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => handleNotificationPress(item)}>
                        <Image
                            source={{ uri: item.Users?.profileImage }}
                            style={{ width: 40, height: 40, borderRadius: 99, borderWidth: 1, borderColor: Colors.BLACK }} />
                        <View style={{ marginLeft: 10, flex: 1, justifyContent: 'center' }}>
                            <Text
                                style={{ fontSize: 18, fontFamily: 'Outfit-Medium' }}
                            >{item.Users?.username}
                            </Text>
                            <Text
                                style={{ fontSize: 14, fontFamily: 'Outfit-Regular' }}
                            >{item.notificationText}
                            </Text>
                        </View>
                        <Text
                            style={{ position: 'absolute', right: 0, top: 0, fontSize: 12, fontFamily: 'Outfit-Regular', color: 'gray' }}
                        >{formatTimeAgo(item.created_at)}
                        </Text>
                    </TouchableOpacity>
                    )
                        : (<TouchableOpacity
                            style={{ marginVertical: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'gray', padding: 8, borderRadius: 12 }}
                            onPress={() => handleNotificationPress(item)}>
                            <Image
                                source={{ uri: item.Users?.profileImage }}
                                style={{ width: 40, height: 40, borderRadius: 99, borderWidth: 1, borderColor: Colors.BLACK }} />
                            <View style={{ marginLeft: 10, flex: 1, justifyContent: 'center' }}>
                                <Text
                                    style={{ fontSize: 18, fontFamily: 'Outfit-Medium' }}
                                >{item.Users?.username}
                                </Text>
                                <Text
                                    style={{ fontSize: 14, fontFamily: 'Outfit-Regular' }}
                                >{item.notificationText}
                                </Text>
                            </View>
                            <Text
                                style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, fontFamily: 'Outfit-Regular', color: 'white' }}
                            >{formatTimeAgo(item.created_at)}
                            </Text>
                        </TouchableOpacity>
                        )
                )}
            />
        </View>
    );
}