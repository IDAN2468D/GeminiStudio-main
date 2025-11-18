import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator,
  Dimensions, SafeAreaView, StyleSheet, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useImageGenerator } from '../hooks/useImageGenerator';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ImageGenScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const [prompt, setPrompt] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [imageCount, setImageCount] = useState<number>(2);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const {
    generatedImages, loading, error,
    selectedFilter, setSelectedFilter, generateImages, shareImage, applyFilterStyle
  } = useImageGenerator();

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel || response.errorMessage) {
        console.log('ImagePicker Error or Cancel:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleGenerate = () => {
    generateImages(prompt, imageCount, selectedImageUri);
  };

  const openModal = (uri: string) => {
    setModalImage(uri);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="image-outline" size={36} color={styles.title.color} />
          <Text style={styles.title}>מחולל התמונות</Text>
          <Text style={styles.subtitle}>הפוך מילים ליצירות אמנות ויזואליות</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>תיאור התמונה (Prompt)</Text>
          <TextInput
            style={styles.input}
            placeholder="לדוגמה: 'חתול בחליפת אסטרונאוט רוכב על אופניים בירח'"
            placeholderTextColor={styles.inputPlaceholderTextColor}
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />

          <View style={styles.uploadSection}>
            {selectedImageUri ? (
              <View>
                <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImageUri(null)}>
                  <Icon name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
                <Icon name="add-circle-outline" size={24} color={styles.uploadButtonText.color} />
                <Text style={styles.uploadButtonText}>העלה תמונת רפרנס (אופציונלי)</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>כמות תמונות</Text>
          <View style={styles.optionsRow}>
            {[1, 2, 3, 4].map(count => (
              <TouchableOpacity key={count} style={[styles.chip, imageCount === count && styles.chipActive]} onPress={() => setImageCount(count)}>
                <Text style={[styles.chipText, imageCount === count && styles.chipActiveText]}>{count}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.generateButton, (loading || !prompt.trim()) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="sparkles" size={22} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.generateButtonText}>צור תמונות</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {generatedImages.length > 0 && (
          <View style={styles.galleryContainer}>
            <Text style={styles.galleryTitle}>הגלריה שלך</Text>
            <View style={styles.optionsRow}>
              {(['none', 'grayscale', 'sepia', 'blur'] as const).map(f => (
                <TouchableOpacity key={f} style={[styles.chip, selectedFilter === f && styles.chipActive]} onPress={() => setSelectedFilter(f)}>
                  <Text style={[styles.chipText, selectedFilter === f && styles.chipActiveText]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.grid}>
              {generatedImages.map((uri, index) => (
                <TouchableOpacity key={index} style={styles.gridItem} onPress={() => openModal(uri)}>
                  <Image source={{ uri }} style={[styles.gridImage, applyFilterStyle(selectedFilter)]} />
                  <TouchableOpacity onPress={() => shareImage(uri)} style={styles.shareIcon}>
                    <Icon name="share-social-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
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
    primaryLight: isDarkMode ? '#253962' : '#E0E7FF',
    chip: isDarkMode ? '#333333' : '#F0F0F0',
    chipText: isDarkMode ? '#E0E0E0' : '#444444',
    input: isDarkMode ? '#252525' : '#F8FAFC',
    inputBorder: isDarkMode ? '#303030' : '#dbeafe',
    error: isDarkMode ? '#F87171' : '#DC2626',
  };

  const createdStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 40,marginTop: 20 },
    header: { alignItems: 'center', paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginTop: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: colors.subtitle, marginTop: 4, textAlign: 'center' },
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
    // Styles moved from outside to inside StyleSheet.create for proper typing
    label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12, textAlign: 'right' },
    input: {
      backgroundColor: colors.input,
      borderWidth: 1,
      textAlign: 'right',
      minHeight: 100,
      textAlignVertical: 'top',
    },
    // The previous `uploadSection` with `placeholderColor` was incorrect for View, keeping the valid one.
    uploadSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    uploadButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: colors.chip,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    uploadButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      marginRight: 8,
    },
    previewImage: {
      width: 120,
      height: 120,
      borderRadius: 12,
    },
    removeImageButton: {
      position: 'absolute',
      top: -10,
      right: -10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 15,
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
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      marginTop: 10,
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
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginTop: 15,
      fontSize: 16,
      fontWeight: '500',
    },
    galleryContainer: {
      marginTop: 30,
      paddingHorizontal: 16,
    },
    galleryTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'right',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridItem: {
      width: (SCREEN_WIDTH - 48) / 2,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      elevation: isDarkMode ? 3 : 2,
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0.15 : 0.05,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },
    gridImage: {
      width: '100%',
      height: 180,
      borderRadius: 12,
    },
    shareIcon: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 6,
      borderRadius: 20,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalImage: {
      width: '95%',
      height: '80%',
      borderRadius: 15,
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 5,
    },
  });

  return {
    ...createdStyles,
    inputPlaceholderTextColor: colors.subtitle, // This is not a style object, so it stays outside.
  };
};

export default ImageGenScreen;