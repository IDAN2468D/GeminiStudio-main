import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, ActivityIndicator, Image, SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { saveToHistory } from '../utils/storage';
import { GEMINI_API_KEY } from '@env';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from '../context/ThemeContext';
import { ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'gemini';
  imageUri?: string;
}

const ChatScreen = () => {
  const { isDarkMode } = useTheme();
  const { styles, colors } = getStyles(isDarkMode);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.didCancel || response.errorMessage) {
        console.log('ImagePicker Error or Cancel:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri && asset.base64) {
          setSelectedImage({ uri: asset.uri, base64: asset.base64 });
        }
      }
    });
  };

  useEffect(() => {
      AsyncStorage.getItem('user').then((data) => {
      if (data) {
        const u = JSON.parse(data);
        if (u.provider === 'google') {
          setGoogleUser(u);
        }
      }
    });
  }, [])

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      imageUri: selectedImage?.uri,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    try {
      await saveToHistory({ type: 'chat', content: `You: ${input}` });

      const parts: any[] = [];
      if (selectedImage) {
        parts.push({
          inline_data: { mime_type: 'image/jpeg', data: selectedImage.base64 }
        });
      }
      if (input.trim()) {
        parts.push({ text: input });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!geminiText) throw new Error('Invalid response from Gemini.');

      const geminiMsg: Message = { id: (Date.now() + 1).toString(), text: geminiText, sender: 'gemini' };
      setMessages((prev) => [...prev, geminiMsg]);
      await saveToHistory({ type: 'chat', content: `Gemini: ${geminiText}` });

    } catch (e: any) {
      const errorMsg = e.message || 'Failed to send message.';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: `שגיאה: ${errorMsg}`, sender: 'gemini' }]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    showToast('הועתק ללוח');
  };

  const handleCopyConversation = () => {
    const conversationText = messages
      .map(m => `${m.sender === 'user' ? 'You' : 'Gemini'}: ${m.text}`)
      .join('\n\n');
    Clipboard.setString(conversationText);
    showToast('השיחה הועתקה');
  };

  const renderItem = useCallback(({ item }: { item: Message }) => {
    const isGemini = item.sender === 'gemini';
    return (
      <View style={[styles.messageRow, isGemini ? styles.geminiRow : styles.userRow]}>
        {isGemini && <View style={styles.avatar}><Ionicons name="sparkles" size={20} color="#fff" /></View>}
        <View style={[styles.bubble, isGemini ? styles.geminiBubble : styles.userBubble]}>
          {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.chatImage} />}
          {item.text.trim().length > 0 && <Text style={[styles.messageText, isGemini ? styles.geminiText : styles.userText]} selectable>{item.text}</Text>}
          <View style={styles.bubbleFooter}>
            <Text style={styles.timeText}>{new Date(Number(item.id)).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</Text>
            {isGemini && (
              <TouchableOpacity onPress={() => handleCopy(item.text)}>
                <Ionicons name="copy-outline" size={18} color={styles.timeText.color} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!isGemini && <View ><Image source={{ uri: googleUser.photo }} style={styles.googleImage} /></View>}
      </View>
    );
  }, [styles]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCopyConversation} style={styles.headerButton}>
          <Ionicons name="copy-outline" size={24} color={styles.headerIcon.color} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>צ'אט עם Gemini</Text>
        </View>
        <TouchableOpacity onPress={() => setMessages([])} style={styles.headerButton}>
          <Ionicons name="trash-outline" size={24} color={styles.headerIcon.color} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {loading && <ActivityIndicator style={styles.typingIndicator} color={styles.geminiText.color} />}

        <View style={styles.inputContainer}>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImageButton}>
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconButton} onPress={selectImage}>
              <Ionicons name="image-outline" size={24} color={styles.iconButton.color} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="כתוב הודעה..."
              placeholderTextColor={colors.subtitle}
              multiline
            />
            <TouchableOpacity
              style={[styles.iconButton, styles.sendButton, (loading || (!input.trim() && !selectedImage)) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={loading || (!input.trim() && !selectedImage)}
            >
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (isDarkMode: boolean) => {
  const colors = {
    background: isDarkMode ? '#121212' : '#F3F6FA',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#E0E0E0' : '#222222',
    subtitle: isDarkMode ? '#A0A0A0' : '#666666',
    primary: '#3B82F6',
    userBubble: isDarkMode ? '#3B82F6' : '#3B82F6',
    geminiBubble: isDarkMode ? '#333333' : '#E5E7EB',
    input: isDarkMode ? '#252525' : '#F0F0F0',
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: Platform.OS === 'android' ? 24 : 16,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerButton: {
      padding: 8,
    },
    googleImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    //marginRight: 15,
    borderWidth: 1,
    borderColor: '#EAECEF',
    },
    headerIcon: {
      color: colors.subtitle,
    },
    list: { paddingHorizontal: 10, paddingTop: 16, paddingBottom: 8 },
    messageRow: { flexDirection: 'row', marginVertical: 10, alignItems: 'flex-end', gap: 8 },
    userRow: { justifyContent: 'flex-end' },
    geminiRow: { justifyContent: 'flex-start' },
    avatar: {
      width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: isDarkMode ? colors.geminiBubble : colors.primary,
    },
    userAvatarText: {
      color: isDarkMode ? colors.primary : '#FFFFFF',
    },
    bubble: {
      maxWidth: '75%',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    userBubble: {
      backgroundColor: colors.userBubble,
      borderBottomRightRadius: 5,
    },
    geminiBubble: {
      backgroundColor: colors.geminiBubble,
      borderBottomLeftRadius: 5,
    },
    messageText: { fontSize: 16, lineHeight: 24, writingDirection: 'rtl' },
    userText: { color: '#FFFFFF' },
    geminiText: { color: colors.text },
    bubbleFooter: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 8 },
    timeText: { fontSize: 12, color: colors.subtitle },
    chatImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
    typingIndicator: { marginVertical: 10 },
    inputContainer: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
      paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    input: {
      flex: 1,
      backgroundColor: colors.input,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      fontSize: 16,
      color: colors.text,
      maxHeight: 100,
      textAlign: 'right',
    },
    iconButton: {
      padding: 8,
      color: colors.subtitle,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    sendButtonDisabled: { backgroundColor: isDarkMode ? '#555' : '#A5B4FC' },
    imagePreviewContainer: {
      padding: 8,
      alignItems: 'flex-start',
    },
    imagePreview: {
      width: 70,
      height: 70,
      borderRadius: 10,
    },
    removeImageButton: {
      position: 'absolute',
      top: 0,
      right: -10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
    },
  });

  return { styles, colors };
};

export default ChatScreen;
