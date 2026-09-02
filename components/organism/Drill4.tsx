import { styles } from "@/constants/styles";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { AppButton } from "../molecule/AppButton";
import { ThemedText } from "../themed-text";



export default function Drill4() {

    return <>
        <Pressable
            onPressIn={() => { }}
            onLongPress={() => { }}
            hitSlop={12}
            android_ripple={{ color: '#00000022', borderless: false }}
        >
            {({ pressed }) => <ThemedText>{pressed ? 'Saving…' : 'Save'}</ThemedText>}
        </Pressable>

        <ThemedText style={styles.drillTitle}>Drill 4 — AppButton</ThemedText>

        <AppButton
            title="Primary"
            variant="primary"
            onPress={() => console.log('Primary pressed')}
        />

        <AppButton
            title="Secondary"
            variant="secondary"
            onPress={() => console.log('Secondary pressed')}
        />

        <AppButton
            title="Delete"
            variant="danger"
            onPress={() => console.log('Danger pressed')}
        />

        <AppButton
            title="Loading"
            loading
            onPress={() => console.log('This will NOT fire')}
        />

        <AppButton
            title="Disabled"
            disabled
            onPress={() => console.log('This will NOT fire')}
        />

        <ThemedText style={styles.drillTitle}>24×24 Icon Button</ThemedText>

        <View style={styles.iconDebug}>
            <Pressable
                hitSlop={10}
                unstable_pressDelay={0}
                accessibilityRole="button"
                accessibilityLabel="Motor icon button"
                onPress={() => console.log('Icon pressed')}
                style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconPressed,
                ]}
                android_ripple={{
                    color: '#00000022',
                    borderless: true,
                }}
            >
                <Image
                    source={require('@/assets/images/motor.jpg')}
                    style={styles.icon}
                />
            </Pressable>
        </View>

        <ThemedText style={styles.drillTitle}>Bounds Clipping Bug</ThemedText>

        <View style={styles.clippingParent}>
            <Pressable
                style={styles.clippedButton}
                onPress={() => console.log('Clipped button pressed')}
            >
                <ThemedText style={styles.clippedText}>TAP ME</ThemedText>
            </Pressable>
        </View>

        <ThemedText style={styles.explanation}>
            The button is partly outside its parent. Because the parent uses
            overflow: hidden, the outside portion is clipped and cannot be
            tapped. The solution is to keep the effective touch target inside
            the parents bounds.
        </ThemedText>
    </>
}