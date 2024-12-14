import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Text, View } from 'react-native';
import { supabase } from '../Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons';

type User = {
    username: string,
    email: string,
    profileImage: string
}

type Notification = {
    Users: User,
    id: number,
    userEmail: string,
    notificationText: string
    isRead: boolean,
    created_at: string
}
export default function TabLayout() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newNotification, setNewNotification] = useState<Notification | null>(null); // Thêm state để lưu thông báo mới
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('Notifications')
            .select('*, Users(username, profileImage, email)')
            .eq('userEmail', user?.primaryEmailAddress?.emailAddress)
            .neq('pushCommentEmail', user?.primaryEmailAddress?.emailAddress)
            .eq('isRead', false)
            // .order('isRead', { ascending: true }) // Sắp xếp theo isRead trước
            .order('created_at', { ascending: false }) // Sau đó sắp xếp theo created_at

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data);
            setUnreadCount(data.length);
        }

    };

    useEffect(() => {
        fetchNotifications();
        // Lắng nghe sự kiện realtime
        const subscription = supabase
            .channel('notifications-channel2')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Notifications' }, (payload) => {
                setNewNotification(payload.new as Notification); // Cập nhật thông báo mới
                setNotifications(prev => [payload.new as Notification, ...prev]);
                fetchNotifications();

                setTimeout(() => {
                    setNewNotification(null);
                }, 5000);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Notifications' }, (payload) => {
                if (!payload.new.isRead) {
                    setNewNotification(payload.new as Notification); // Cập nhật thông báo mới khi có sự kiện UPDATE
                }
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === payload.new.id ? (payload.new as Notification) : notification
                    )
                );
                fetchNotifications();

                setTimeout(() => {
                    setNewNotification(null);
                }, 5000);
            })
            .subscribe();
        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fadeAnim = useRef(new Animated.Value(0)).current; // Khởi tạo giá trị animated cho độ mờ

    useEffect(() => {
        if (newNotification) {
            // Bắt đầu animation khi có thông báo mới
            Animated.timing(fadeAnim, {
                toValue: 1, // Độ mờ cuối cùng
                duration: 300, // Thời gian animation
                useNativeDriver: true,
            }).start();

            // Ẩn thông báo sau 5 giây
            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0, // Trở về độ mờ ban đầu
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 5000);

            return () => clearTimeout(timer); // Dọn dẹp timer
        }
    }, [newNotification]);




    return (
        <View style={{ flex: 1 }}>
            {newNotification && ( // Hiển thị khung thông báo nếu có thông báo mới
                <Animated.View style={{
                    position: 'absolute',
                    top: 30,
                    left: 30,
                    right: 30,
                    zIndex: 10,
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius: 99,
                    borderWidth: 1,
                    shadowColor: 'black', // Màu bóng
                    shadowOffset: { width: 2, height: 2 }, // Độ lệch của bóng
                    shadowOpacity: 0.3, // Độ mờ của bóng
                    shadowRadius: 4, // Bán kính của bóng
                    opacity: fadeAnim, // Sử dụng giá trị animated cho độ mờ
                }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>New Notification!</Text>
                    {/* <Text>{newNotification.notificationText}</Text> */}
                </Animated.View>
            )}
            <Tabs
                screenOptions={({ route }) => ({
                    tabBarActiveTintColor: 'black',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tabs.Screen
                    name="(homeNav)"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="(notificationNav)"
                    options={{
                        title: 'Notification',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
                        tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    }}
                />
                <Tabs.Screen
                    name="(addNav)"
                    options={{
                        title: 'Add',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => <Octicons name="diff-added" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="(profileNav)"
                    options={{
                        title: 'Profile',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
                    }}
                />
            </Tabs>
        </View>
    );
}