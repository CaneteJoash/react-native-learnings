import { FlatList, ScrollView, View } from 'react-native';
import { ThemedText } from '../themed-text';

const DATA = Array.from({ length: 15 }, (_, index) => ({
    id: String(index + 1),
    title: `Item ${index + 1}`,
}));

export default function Drill5() {
    return (
        <View>
            <ScrollView>
                {DATA.map((item) => (
                    <ThemedText key={item.id}> Scroll View {item.title}</ThemedText>
                ))}
            </ScrollView>

            <FlatList
                data={DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ThemedText>Flat List{item.title}</ThemedText>}
            />
        </View>
    );
}