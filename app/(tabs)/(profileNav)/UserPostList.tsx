import { View, FlatList, StyleSheet, Dimensions } from 'react-native'
import VideoThumbnailItem from '@/app/(Screen)/VideoThumbnailItem';

// Định nghĩa kiểu props
interface UserPostListProps {
    postList: any[];
    getLastesPosts: () => void;
    isLoading: boolean;
    isOwner: boolean
}



const UserPostList: React.FC<UserPostListProps> = ({ postList, getLastesPosts, isLoading, isOwner }) => {

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = (screenWidth - 30) / 2; // 30 là tổng padding



    const renderItem = ({ item, index }: { item: any, index: any }) => {
        if (item === null) {
            // Render một view trống cho item "dummy"
            return <View style={{ width: itemWidth, margin: 5 }} />
        }
        return <VideoThumbnailItem video={item} isDisplayTrashIcon={isOwner} OnProfileRefresh={getLastesPosts} index={index} width={itemWidth} />
    }
    const keyExtractor = (item: { id: number } | null, index: number) => item ? item.id.toString() : `dummy-${index}`;

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.flatList}
                data={postList.length % 2 === 0 ? postList : [...postList, null]}
                renderItem={renderItem}  // Sử dụng hàm renderItem đơn giản hóa
                numColumns={2}
                onRefresh={() => getLastesPosts()}
                refreshing={isLoading}
                keyExtractor={keyExtractor} // Thêm keyExtractor để tránh cảnh báo
                contentContainerStyle={{ flexGrow: 1 }} // Ensure the content can grow
                removeClippedSubviews={true}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flatList: {
        flex: 1,
    },
});

export default UserPostList