import { styles } from "@/constants/styles";
import { ActivityIndicator, Pressable, Text } from "react-native";


type AppButtonProps = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
};


export function AppButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
}: AppButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            disabled={isDisabled}
            onPress={onPress}
            unstable_pressDelay={0}
            hitSlop={8}
            android_ripple={{
                color: '#ffffff33',
            }}
            accessibilityRole="button"
            accessibilityState={{
                disabled: isDisabled,
                busy: loading,
            }}
            style={({ pressed }) => [
                styles.appButton,
                styles[variant],
                isDisabled && styles.appButtonDisabled,
                pressed && !isDisabled && styles.appButtonPressed,
            ]}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.appButtonText}>{title}</Text>
            )}
        </Pressable>
    );
}