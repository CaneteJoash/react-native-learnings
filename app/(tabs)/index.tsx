import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Text } from '@react-navigation/elements';

export default function HomeScreen() {
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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/motor.jpg')}
          style={styles.reactLogo}
        />
      }>
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
          <Text style={styles.message}>
            This is a very looooooooooooooooooooooooooooooooooooooooooooooooooooooong message that should wrap without overflowing .
          </Text>
        </View>

        <Text style={styles.timestamp}>10:42 AM</Text>
      </View>
      <TextInput defaultValue='Write something here' style={styles.input} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.header}>Header</Text>
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
            <Text style={styles.composerTitle}>Create Note</Text>
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

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'red'
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

});
