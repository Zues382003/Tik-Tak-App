import { View, StyleSheet, ActivityIndicator, useWindowDimensions, SafeAreaView, Image, Text, TouchableOpacity, FlatList, Share, TouchableWithoutFeedback, Dimensions } from 'react-native'
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { ResizeMode, Video } from 'expo-av';
import Colors from '../Utils/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { VideoItem } from '../(tabs)/(homeNav)/PlayVideoList';
import { router } from 'expo-router';
import { supabase } from '../Utils/SupabaseConfig';
import { Modal, TextInput, Button, } from 'react-native';


interface PlayVideoItemProps {
    video: VideoItem;
    activeIndex: number;
    index: number;
    userLikeHandler: (video: VideoItem, isLiked: boolean) => void;
    userFollowHandler: (userId: number, isFollowing: boolean) => void;
    isFollowing: boolean;
    isOwnVideo: boolean;
    user: any;
    isLoading: boolean;
}

interface Comment {
    id: any;
    userEmail: any;
    commentText: any;
    created_at: any;
    avatar: any
}

function PlayVideoItem({ video, activeIndex, index, userLikeHandler, userFollowHandler, isFollowing, isOwnVideo, user, isLoading }: PlayVideoItemProps) {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const isFocused = useIsFocused();
    const videoRef = useRef(null);
    const [status, setStatus] = useState({});
    const [isMuted, setIsMuted] = useState(true);
    const [likeCount, setLikeCount] = useState(video.VideoLikes?.length);
    const [isModalVisible, setIsModalVisible] = useState(false); // Thêm state cho modal
    const [commentText, setCommentText] = useState(''); // Thêm state cho nội dung bình luận
    const [comments, setComments] = useState<Comment[]>([]); // Sửa: Thêm [] để chỉ định danh sách bình luận
    const isUserAlreadyLiked = useMemo(() => {
        const result = video.VideoLikes?.some((item: any) => item.userEmail === user?.primaryEmailAddress?.emailAddress);
        console.log("User already liked:", result);
        return result;
    }, [video.VideoLikes, user?.primaryEmailAddress?.emailAddress]);
    const [localIsLiked, setLocalIsLiked] = useState(isUserAlreadyLiked);
    const [localVideo, setLocalVideo] = useState(video);
    const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
    // Thêm state cho modal tùy chọn bình luận
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Khai báo state cho modal chỉnh sửa

    useEffect(() => {
        setLocalVideo(video);
    }, [video]);

    useEffect(() => {
        setLocalIsLiked(isUserAlreadyLiked);
    }, [isUserAlreadyLiked]);

    useEffect(() => {
        setLikeCount(video.VideoLikes?.length);
    }, [video.VideoLikes]);

    useEffect(() => {
        if ((status as any).isLoaded) {
            setIsMuted(!(status as any).isPlaying);
        }
    }, [status]);

    const onOtherUserProfile = () => {
        router.push({
            pathname: '/otherUserProfile', // Corrected pathname
            params: {
                video: JSON.stringify(video) // Convert video object to a JSON string
            }
        })
    }

    useEffect(() => {
        if (videoRef.current) {
            if (isFocused && activeIndex === index) {
                (videoRef.current as any).playAsync();
            } else {
                (videoRef.current as any).pauseAsync();
            }
        }
    }, [isFocused, activeIndex, index]);


    const handleLike = useCallback(async () => {

        const newIsLiked = !localIsLiked;
        setLocalIsLiked(newIsLiked);
        const updatedVideo = await userLikeHandler(localVideo, localIsLiked as boolean);
        if (updatedVideo as any) {
            setLocalVideo(updatedVideo as any);
        }
    }, [localVideo, localIsLiked, userLikeHandler]);

    const handleFollow = useCallback(async () => {
        if (isOwnVideo) return; // Don't allow following own video
        try {
            await userFollowHandler(video.Users.id, localIsFollowing);
            setLocalIsFollowing(!localIsFollowing);
        } catch (error) {
            console.error('Failed to update follow status:', error);
        }
    }, [video.Users.id, localIsFollowing, userFollowHandler, isOwnVideo]);

    useEffect(() => {
        setLocalIsFollowing(isFollowing);
    }, [isFollowing]);



    //////Comment
    // Hàm để lấy bình luận từ Supabase
    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('Comments')
            .select('id, userEmail, commentText, created_at, avatar')
            .eq('postIdRef', video.id) // Lọc theo postIdRef
        // .order('created_at', { ascending: false }); // Sắp xếp theo thời gian tạo, mới nhất trước
        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data); // Đảm bảo data là một mảng
        }
    };

    // Hàm để gửi bình luận
    const handleCommentSubmit = async () => {
        const { error } = await supabase
            .from('Comments')
            .insert([
                { postIdRef: video.id, userEmail: user.primaryEmailAddress.emailAddress, commentText: commentText, avatar: user?.imageUrl }
            ]);

        if (error) {
            console.error('Error inserting comment:', error);
        } else {
            setCommentText(''); // Reset nội dung bình luận
            fetchComments(); // Lấy lại danh sách bình luận
        }
    };

    useEffect(() => {
        fetchComments();
    }, [])

    useEffect(() => {

        // Thiết lập subscription cho realtime
        const subscription = supabase
            .channel('comments-channel') // Tạo kênh cho bình luận
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Comments' }, (payload) => {
                // Cập nhật state comments với bình luận mới
                setComments(prevComments => [...prevComments, payload.new as Comment]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Comments' }, (payload) => {
                console.log('Comment updated:', payload.new); // In ra thông tin bình luận đã cập nhật
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.id === payload.new.id ? { ...comment, ...payload.new as Comment } : comment
                    )
                );

            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Comments' }, (payload) => {
                console.log('Comment deleted:', payload.old); // In ra thông tin bình luận đã xóa
                setComments(prevComments => prevComments.filter(comment => comment.id !== payload.old.id));

            })
            .subscribe()

        // Dọn dẹp subscription khi component unmount
        return () => {
            supabase.removeChannel(subscription); // Dọn dẹp kênh
        };

    }, [comments]);


    // Hàm để chỉnh sửa bình luận
    // const handleEditComment = async () => {
    //     if (selectedComment) {
    //         const { error } = await supabase
    //             .from('Comments')
    //             .update({ commentText: commentText }) // Cập nhật nội dung bình luận
    //             .eq('id', selectedComment.id); // Tìm bình luận theo ID

    //         if (error) {
    //             console.error('Error updating comment:', error);
    //         } else {
    //             setCommentText(''); // Reset nội dung bình luận
    //             fetchComments(); // Lấy lại danh sách bình luận
    //             setIsOptionsModalVisible(false); // Đóng modal tùy chọn
    //             setIsEditing(false); // Đóng modal chỉnh sửa
    //         }
    //     }
    // };

    // Hàm để xóa bình luận
    const handleDeleteComment = async (commentId: any) => {
        const { error } = await supabase
            .from('Comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Error deleting comment:', error);
        } else {
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        }
    };

    // Hàm để mở modal tùy chọn
    const openOptionsModal = (comment: Comment) => {
        setSelectedComment(comment);
        setIsOptionsModalVisible(true);
    };
    //////Comments

    const showFollowButton = useMemo(() => {
        return user?.primaryEmailAddress?.emailAddress !== video.emailRef;
    }, [user?.primaryEmailAddress?.emailAddress, video.emailRef]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, { width: windowWidth }]}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                <View style={styles.overlay}>
                    <View style={styles.mainContent}>
                        <View style={styles.userInfo}>
                            <TouchableOpacity onPress={onOtherUserProfile}>
                                <Image
                                    source={{ uri: video.Users.profileImage }}
                                    style={[styles.avatar, styles.avatarShadow]}
                                />
                            </TouchableOpacity>
                            {showFollowButton && (
                                <TouchableOpacity onPress={handleFollow}>
                                    <AntDesign
                                        name={localIsFollowing ? "checkcircle" : "pluscircle"}
                                        style={styles.plusIcon}
                                        size={18}
                                        color={localIsFollowing ? "#21bef4" : Colors.BLACK}
                                    />
                                </TouchableOpacity>
                            )}
                            <Text style={[styles.username, styles.textShadow]}>{video.Users.name}</Text>
                        </View>
                        <Text style={[styles.description, styles.textShadow]}>{video.description}</Text>
                    </View>
                    <View style={styles.actions}>
                        <View style={styles.likeCountContainer}>
                            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                                {localIsLiked ? (
                                    <AntDesign name="heart" size={40} color={Colors.WHITE} style={styles.icon} />
                                ) : (
                                    <AntDesign name="hearto" size={40} color={Colors.WHITE} style={styles.icon} />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.likeCount}>{localVideo.VideoLikes?.length}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setIsModalVisible(true)}>
                            <Ionicons name="chatbubble-outline" size={35} color={Colors.WHITE} style={styles.icon} />
                            <Text style={styles.commentCount}>{comments.length}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="paper-plane-outline" size={35} color={Colors.WHITE} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: video.videoUrl }}
                    useNativeControls={false}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isFocused && activeIndex === index}
                    isMuted={isMuted}
                    isLooping
                    onPlaybackStatusUpdate={setStatus}
                />
                {/* Modal cho bình luận */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Bình luận</Text>
                        <View style={styles.scrollView}>
                            <FlatList
                                data={comments}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.commentItem}>
                                        <Image
                                            source={{ uri: item.avatar }}
                                            style={styles.avatarComment}
                                        />
                                        <View style={styles.commentContent}>
                                            <Text style={styles.commentText}>{item.commentText}</Text>
                                            <Text style={styles.commentTime}>{new Date(item.created_at).toLocaleString()}</Text>
                                        </View>
                                        {/* Chỉ hiển thị nút ba chấm nếu người dùng là người đã bình luận */}
                                        {user?.primaryEmailAddress?.emailAddress === item.userEmail && (
                                            <TouchableOpacity onPress={() => openOptionsModal(item)}>
                                                <Ionicons name="ellipsis-vertical" size={24} color="gray" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Image
                                source={{ uri: user?.imageUrl }}
                                style={styles.avatarInput}
                            />
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Nhập bình luận..."
                                value={commentText}
                                onChangeText={setCommentText}
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleCommentSubmit}>
                                <Ionicons name="paper-plane" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Modal cho tùy chọn bình luận */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isOptionsModalVisible}
                    onRequestClose={() => setIsOptionsModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setIsOptionsModalVisible(false)}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(128, 128, 128, 0.5)' }} />
                    </TouchableWithoutFeedback>

                    {/* Modal chính */}
                    <View style={{
                        backgroundColor: 'white', // Nền trắng cho modal
                        borderRadius: 10, // Bo góc cho modal
                        padding: 5, // Padding cho nội dung bên trong modal
                        width: '80%', // Chiều rộng modal
                        shadowColor: '#000', // Màu bóng
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5, // Độ cao của bóng
                        position: 'absolute', // Đặt vị trí là tuyệt đối
                        top: '50%', // Đặt từ trên xuống 50% chiều cao
                        left: '50%', // Đặt từ trái sang 50% chiều rộng
                        transform: [{ translateX: -0.5 * (windowWidth * 0.8) }, { translateY: -0.3 * (windowHeight * 0.5) }], // Dịch chuyển để căn giữa
                    }}>
                        <TouchableOpacity onPress={() => {
                            setCommentText(selectedComment?.commentText);
                            setIsOptionsModalVisible(false);
                            setIsEditing(true);
                        }}>
                            {/* <Text style={styles.optionText}>Chỉnh sửa</Text> */}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { handleDeleteComment(selectedComment?.id); setIsOptionsModalVisible(false); }}>
                            <Text style={styles.optionText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                {/* Modal cho chỉnh sửa bình luận */}
                {/* <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isEditing} // Kiểm soát hiển thị modal chỉnh sửa
                    onRequestClose={() => setIsEditing(false)}
                >
                    <View style={styles.modalEditContainer}>
                        <Text style={styles.modalTitle}>Chỉnh sửa bình luận</Text>
                        <TextInput
                            style={styles.commentEditInput}
                            value={commentText}
                            onChangeText={setCommentText}
                            placeholder="Nhập bình luận mới..."
                            placeholderTextColor="gray"
                        />
                        <TouchableOpacity onPress={handleEditComment}>
                            <Text style={styles.saveButton}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setCommentText('');
                            setIsEditing(false);
                        } // Reset nội dung bình luận
                        }>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </Modal> */}
            </View>
        </SafeAreaView>
    )
}

export default React.memo(PlayVideoItem, (prevProps, nextProps) => {
    return prevProps.video.id === nextProps.video.id &&
        prevProps.activeIndex === nextProps.activeIndex &&
        prevProps.index === nextProps.index &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.user?.id === nextProps.user?.id
});

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        zIndex: 1,
    },
    icon: {
        textShadowRadius: 10,
        paddingVertical: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
    },
    avatarShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    textShadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
    overlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: 10,
        zIndex: 10,
    },
    mainContent: {
        flex: 1,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 2,
        borderColor: Colors.WHITE,
    },
    username: {
        color: Colors.WHITE,
        fontSize: 18,
        fontFamily: 'Outfit-Medium',
    },
    description: {
        color: Colors.WHITE,
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
        marginBottom: 10,
    },
    actions: {
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5,
    },
    actionButton: {
        marginBottom: 15,
        justifyContent: 'center', // Căn giữa icon theo chiều dọc
        alignItems: 'center', // Căn giữa icon theo chiều ngang
    },
    likeCount: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
        paddingBottom: 10,
        marginTop: -15,
    },
    commentCount: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
        marginBottom: -10
    },
    likeCountContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: -5,
    },
    plusIcon: {
        position: 'absolute',
        bottom: -26,
        right: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 99,
        padding: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    scrollView: {
        width: '100%',
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'lightgray', // Thêm đường viền trên cùng
    },
    avatarInput: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    sendButton: {
        backgroundColor: '#21bef4',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        width: '100%',
    },
    avatarComment: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginLeft: 10,
    },
    commentText: {
        fontSize: 16,
        color: 'black',
    },
    commentTime: {
        fontSize: 12,
        color: 'gray',
    },
    optionsModalContainer: {
        position: 'absolute', // Đặt vị trí là tuyệt đối
        justifyContent: 'center', // Căn giữa theo chiều dọc
        alignItems: 'center', // Căn giữa theo chiều ngang
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    optionText: {
        fontSize: 18,
        color: 'black', // Chữ đen
        padding: 10,
        textAlign: 'center',
        backgroundColor: 'transparent', // Nền trong suốt cho các tùy chọn
        borderRadius: 5,
        marginVertical: 5,
    },
    cancelText: {
        fontSize: 18,
        color: 'red',
        padding: 10,
        textAlign: 'center',
        marginTop: 10,
    },
    modalEditContainer: {
        flex: 1,
        justifyContent: 'center', // Căn giữa theo chiều dọc
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10, // Bo góc cho modal
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    saveButton: {
        backgroundColor: '#21bef4', // Màu nền cho nút Lưu
        color: 'white', // Màu chữ
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
        marginVertical: 10, // Khoảng cách giữa các nút
    },
    commentEditInput: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    },
});