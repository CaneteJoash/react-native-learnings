import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },

    reactLogo: {
        height: 300,
        width: 400,
        bottom: 50
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    avatar: {
        width: 40,
        height: 40,
        position: 'relative',
        marginRight: 5
    },

    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },

    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 50,
        backgroundColor: 'red',
    },

    messageBody: {
        flex: 1,
        minWidth: 0,
    },

    timestamp: {
        flexShrink: 0,
    },

    message: {
        flexWrap: 'wrap',
    },

    input: {
        borderBlockColor: 'red',
        backgroundColor: 'white'
    },

    container: {
        flex: 1,
    },

    inner: {
        padding: 24,
        flex: 1,
        justifyContent: 'space-around',
    },

    header: {
        fontSize: 36,
        marginBottom: 48,
    },

    textInput: {
        height: 40,
        borderColor: '#000000',
        borderBottomWidth: 1,
        marginBottom: 36,
        backgroundColor: 'red',
    },

    btnContainer: {
        backgroundColor: 'white',
        marginTop: 12,
    },

    composerContainer: {
        flex: 1,
    },

    composer: {
        padding: 20,
        gap: 12,
    },

    composerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    formTextInput: {
        height: 45,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },

    bodyInput: {
        minHeight: 140,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingTop: 12,
        backgroundColor: 'white',
    },

    invalidInput: {
        borderColor: 'red',
    },

    drillTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 12,
    },

    appButton: {
        minHeight: 48,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },

    primary: {
        backgroundColor: '#2563EB',
    },

    secondary: {
        backgroundColor: '#6B7280',
    },

    danger: {
        backgroundColor: '#DC2626',
    },

    appButtonDisabled: {
        opacity: 0.5,
    },

    appButtonPressed: {
        opacity: 0.7,
    },

    appButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    iconDebug: {
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },

    iconButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        width: 24,
        height: 24,
        borderRadius: 4,
    },

    iconPressed: {
        opacity: 0.6,
    },

    clippingParent: {
        width: 150,
        height: 100,
        backgroundColor: '#dddddd',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 12,
    },

    clippedButton: {
        position: 'absolute',
        left: -30,
        top: 30,
        width: 100,
        height: 40,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    clippedText: {
        color: 'white',
        fontWeight: 'bold',
    },

    explanation: {
        marginBottom: 20,
        lineHeight: 20,
    },
});