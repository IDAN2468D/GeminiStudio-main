import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid, Platform } from 'react-native';
import axios from 'axios';
import { GEMINI_API_KEY } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { saveToHistory } from '../utils/storage';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

const storyGenres = ['פנטזיה', 'מדע בדיוני', 'קומדיה', 'אימה'];
const songGenres = ['פופ', 'רוק', 'היפ הופ', 'ג\'אז'];
const lengths = ['קצר', 'בינוני', 'ארוך'];

export default function StoryGeneratorScreen() {
  const { isDarkMode } = useTheme(); // Use theme
  const styles = getStyles(isDarkMode); // Get dynamic styles

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'song' | 'story'>('story');
  const [genre, setGenre] = useState('');
  const [length, setLength] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sendPromptToGemini = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    let prompt = '';
    const lengthText = length ? `באורך ${length}` : '';
    const genreText = genre ? `בסגנון ${genre}` : '';

    if (mode === 'song') {
      prompt = `כתוב לי שיר ${lengthText} ${genreText} בנושא: ${input}`;
    } else {
      prompt = `כתוב לי סיפור קצר ${lengthText} ${genreText} בנושא: ${input}`;
    }

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY,
        { contents: [{ parts: [{ text: prompt }] }] }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'לא התקבלה תשובה';
      setResult(text);
      await saveToHistory({
        type: 'story',
        content: `נושא: ${input} (${genre}, ${length})\n---\n${text}`,
      });
    } catch (e: any) {
      if (e.response && e.response.status === 429) {
        setResult('שגיאה: חרגת ממכסת הבקשות ל-API. נסה שוב בעוד מספר דקות.');
      } else if (e.response && e.response.status === 503) {
        setResult('שגיאה: שירות Gemini אינו זמין כרגע. אנא נסה שוב מאוחר יותר.');
      }
      else {
        setResult('שגיאה בשליחה ל-Gemini: ' + (e.response?.data ? JSON.stringify(e.response.data) : e.message));
      }
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result) {
      Clipboard.setString(result);
      setCopied(true);
      if (Platform.OS === 'android') {
        ToastAndroid.show('הטקסט הועתק', ToastAndroid.SHORT);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentGenres = mode === 'story' ? storyGenres : songGenres;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Ionicons name="create-outline" size={36} color={styles.title.color} />
        <Text style={styles.title}>מחולל היצירות</Text>
        <Text style={styles.subtitle}>הפיחו חיים ברעיונות שלכם עם Gemini</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'story' && styles.modeButtonActive]}
            onPress={() => { setMode('story'); setGenre(''); }}
          >
            <Ionicons name="book-outline" size={20} color={mode === 'story' ? styles.modeButtonActiveText.color : styles.modeButtonText.color} />
            <Text style={[styles.modeButtonText, mode === 'story' && styles.modeButtonActiveText]}>סיפור קצר</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'song' && styles.modeButtonActive]}
            onPress={() => { setMode('song'); setGenre(''); }}
          >
            <Ionicons name="musical-notes-outline" size={20} color={mode === 'song' ? styles.modeButtonActiveText.color : styles.modeButtonText.color} />
            <Text style={[styles.modeButtonText, mode === 'song' && styles.modeButtonActiveText]}>שיר</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>בחרו ז'אנר</Text>
        <View style={styles.optionsRow}>
          {currentGenres.map(g => (
            <TouchableOpacity key={g} style={[styles.chip, genre === g && styles.chipActive]} onPress={() => setGenre(g)}>
              <Text style={[styles.chipText, genre === g && styles.chipActiveText]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>בחרו אורך</Text>
        <View style={styles.optionsRow}>
          {lengths.map(l => (
            <TouchableOpacity key={l} style={[styles.chip, length === l && styles.chipActive]} onPress={() => setLength(l)}>
              <Text style={[styles.chipText, length === l && styles.chipActiveText]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>כתבו נושא</Text>
        <TextInput
          style={styles.input}
          placeholder="לדוגמה: 'אסטרונאוט שמוצא חתול על מאדים'"
          value={input}
          onChangeText={setInput}
          multiline
          placeholderTextColor={styles.subtitle.color}
        />
        <TouchableOpacity
          style={[styles.generateButton, (loading || !input.trim()) && styles.generateButtonDisabled]}
          onPress={sendPromptToGemini}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={22} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.generateButtonText}>הפעל את הקסם</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>היצירה שלכם מוכנה!</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Ionicons name={copied ? "checkmark-done" : "copy-outline"} size={22} color={styles.copyButtonText.color} />
              <Text style={styles.copyButtonText}>{copied ? 'הועתק' : 'העתק'}</Text>
            </TouchableOpacity>
          </View>
          <Text selectable style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean) => {
  const colors = {
    background: isDarkMode ? '#121212' : '#F3F6FA',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#E0E0E0' : '#222222',
    subtitle: isDarkMode ? '#A0A0A0' : '#666666',
    primary: '#3B82F6', // A slightly different blue
    primaryLight: isDarkMode ? '#253962' : '#E0E7FF',
    chip: isDarkMode ? '#333333' : '#F0F0F0',
    chipText: isDarkMode ? '#E0E0E0' : '#444444',
    input: isDarkMode ? '#252525' : '#F8FAFC',
    inputBorder: isDarkMode ? '#303030' : '#dbeafe',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.subtitle,
      marginTop: 4,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginHorizontal: 16,
      padding: 20,
      elevation: isDarkMode ? 5 : 3,
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0.2 : 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    modeRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
      backgroundColor: colors.chip,
      borderRadius: 12,
      padding: 4,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
    },
    modeButtonActive: {
      backgroundColor: colors.primary,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    modeButtonText: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 8,
    },
    modeButtonActiveText: {
      color: '#FFFFFF',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'right',
    },
    optionsRow: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      marginBottom: 24,
      gap: 10,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.chip,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipText: {
      color: colors.chipText,
      fontWeight: '500',
      fontSize: 14,
    },
    chipActiveText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    input: {
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      fontSize: 16,
      color: colors.text,
      textAlign: 'right',
      minHeight: 60,
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      elevation: 3,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    generateButtonDisabled: {
      backgroundColor: isDarkMode ? '#555' : '#A5B4FC',
      elevation: 0,
    },
    generateButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 18,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginHorizontal: 16,
      marginTop: 24,
      padding: 20,
      elevation: isDarkMode ? 5 : 3,
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0.2 : 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    resultHeader: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primaryLight,
    },
    copyButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
      marginLeft: 6,
      fontSize: 15,
    },
    resultText: {
      fontSize: 17,
      color: colors.text,
      lineHeight: 28,
      textAlign: 'right',
    },
  });
};
 