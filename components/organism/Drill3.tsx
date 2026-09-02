import { styles } from "@/constants/styles";
import { useRef, useState } from "react";
import { Button, Keyboard, KeyboardAvoidingView, Platform, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { ThemedText } from "../themed-text";


export default function Drill3() {
    const [title, setTitle] = useState(String);
    const [body, setBody] = useState(String);
    const [tag, setTag] = useState(String);

    const titleRef = useRef<TextInput>(null);
    const bodyRef = useRef<TextInput>(null);

    const titleInvalid = title.trim() === '' || title.length > 60;

    const handleSave = () => {
        if (titleInvalid) return;

        console.log({
            title,
            body,
            tag,
        });

        Keyboard.dismiss();
    };
    return <>
        <TextInput defaultValue='Write something here' style={styles.input} />
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <ThemedText style={styles.header}>Headers</ThemedText>
                    <TextInput placeholder="Username" style={styles.textInput} />
                    <View style={styles.btnContainer}>
                        <Button title="Submit" onPress={() => null} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.composerContainer}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.composer}>
                    <ThemedText style={styles.composerTitle}>Create Note</ThemedText>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <TextInput
                                ref={titleRef}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Title"
                                returnKeyType="next"
                                onSubmitEditing={() => bodyRef.current?.focus()}
                                style={[
                                    styles.formTextInput,
                                    titleInvalid && styles.invalidInput,
                                ]}
                            />
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>

                    <TextInput
                        ref={bodyRef}
                        value={body}
                        onChangeText={setBody}
                        placeholder="Write your note..."
                        multiline
                        textAlignVertical="top"
                        style={styles.bodyInput}
                    />
                    <TextInput
                        value={tag}
                        onChangeText={setTag}
                        placeholder="Tag"
                        returnKeyType="done"
                        style={styles.formTextInput}
                    />
                    <View style={styles.btnContainer}>
                        <Button
                            title="Save"
                            disabled={titleInvalid}
                            onPress={handleSave}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    </>
}