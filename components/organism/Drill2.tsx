import { styles } from "@/constants/styles";
import { Image } from "expo-image";
import { View } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function Drill2() {
    return <>
        <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome! Wasjo</ThemedText>
        </ThemedView>

        <View style={styles.row}>
            <View style={styles.avatar}>
                <Image
                    source={require('@/assets/images/motor.jpg')}
                    style={styles.avatarImage}
                />
                <View style={styles.unreadDot} />
            </View>

            <View style={styles.messageBody}>
                <ThemedText style={styles.message}>
                    This is a very looooooooooooooooooooooooooooooooooooooooooooooooooooooong message that should wrap without overflowing .
                </ThemedText>
            </View>

            <ThemedText style={styles.timestamp}>10:42 AM</ThemedText>
        </View>
    </>
}