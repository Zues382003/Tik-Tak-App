import { View, Text } from 'react-native'
import React from 'react'
import { Image } from 'native-base'

const SplashScreen = () => {
    return (
        <View>
            <Image
                source={require('../../assets/images/TikTak.gif')} // Thay đổi đường dẫn đến GIF cục bộ của bạn
                style={{ width: '100%', height: '100%' }} // Điều chỉnh kích thước theo nhu cầu
                resizeMode="contain" // Điều chỉnh cách hiển thị GIF
            />
        </View>
    )
}

export default SplashScreen