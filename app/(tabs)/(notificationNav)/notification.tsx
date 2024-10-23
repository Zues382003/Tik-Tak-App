import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/app/Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';

type Notification = {
    id: number,
    userEmail: string,
    notificationText: string
    isRead: boolean,
    created_at: string
}

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useUser();

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('Notifications')
                .select('*')
                .eq('userEmail', user?.primaryEmailAddress?.emailAddress)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
            } else {
                setNotifications(data);
            }
        };

        fetchNotifications();

        // Lắng nghe sự kiện realtime
        const subscription = supabase
            .channel('notifications-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Notifications' }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    // ... existing code ...

    const handleNotificationPress = (item: Notification) => {
        // Điều hướng đến video và mở modal bình luận
        // navigation.navigate('PlayVideoItem', {
        //     videoId: notification.postIdRef,
        //     commentId: notification.commentId,
        //     isNotification: true // Thêm tham số để xác định đây là từ thông báo
        // });
    };

    // ... existing code ...

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
                        <Text>{item.notificationText}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}