import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { styles } from '@/constants/styles';
import { EchoWebSocketClient, type ConnectionStatus } from '@/lib/echo-websocket-client';
import { ThemedText } from '../themed-text';

// Public echo endpoint: whatever you send, it sends back. Good enough to prove
// reconnect-with-backoff without standing up our own server.
const ECHO_URL = 'wss://ws.postman-echo.com/raw';

export default function Drill7() {
    const [status, setStatus] = useState<ConnectionStatus>('connecting');
    const [message, setMessage] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const clientRef = useRef<EchoWebSocketClient | null>(null);

    useEffect(() => {
        const client = new EchoWebSocketClient({
            url: ECHO_URL,
            onStatusChange: setStatus,
            onMessage: (data) => setLog((prev) => [...prev, `← ${data}`]),
        });
        clientRef.current = client;
        client.connect();

        return () => client.close();
    }, []);

    const handleSend = () => {
        if (!message.trim()) return;
        clientRef.current?.send(message);
        setLog((prev) => [...prev, `→ ${message}`]);
        setMessage('');
    };

    return (
        <View>
            <ThemedText style={styles.drillTitle}>Drill 7 — Echo WebSocket</ThemedText>
            <ThemedText>Status: {status}</ThemedText>

            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Message to echo"
                onSubmitEditing={handleSend}
                style={styles.input}
            />
            <Pressable onPress={handleSend}>
                <ThemedText type="link">Send</ThemedText>
            </Pressable>

            {log.map((entry, index) => (
                <ThemedText key={index}>{entry}</ThemedText>
            ))}
        </View>
    );
}
