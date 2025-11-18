import { useState } from 'react';
import { Alert, Share } from 'react-native';
import RNFS from 'react-native-fs';
import { saveToHistory } from '../utils/storage';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { initializeGemini, imageGenModel } from '../utils/gemini';

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur';

export const useImageGenerator = () => {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');

  const saveImageLocally = async (base64Data: string) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/image_${Date.now()}.jpg`;
      await RNFS.writeFile(path, base64Data, 'base64');
      return `file://${path}`;
    } catch (err) {
      console.error('Error saving image locally:', err);
      return null;
    }
  };

  const generateImages = async (prompt: string, count: number = 3, imageUri: string | null = null) => {
    setError('');
    setGeneratedImages([]);
    setCaption('');
    setSaveSuccess(false);

    if (!prompt.trim() && !imageUri) {
      setError('נא להזין טקסט או לבחור תמונה ליצירה');
      return;
    }

    setLoading(true);

    let imageBase64 = null;
    let imageMimeType = null;

    if (imageUri) {
      try {
        imageBase64 = await RNFS.readFile(imageUri.replace('file://', ''), 'base64');
        const fileExtension = imageUri.split('.').pop()?.toLowerCase();
        if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          imageMimeType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          imageMimeType = 'image/png';
        } else {
          // Default to jpeg if unknown, or handle other types as needed
          imageMimeType = 'image/jpeg'; 
        }
      } catch (e) {
        console.error('Error reading image file:', e);
        setError('שגיאה בקריאת קובץ התמונה.');
        setLoading(false);
        return;
      }
    }

    try {
      initializeGemini();
      if (!imageGenModel) {
        throw new Error('Image generation model not initialized');
      }

      const responses = await Promise.all(Array.from({ length: count }).map(async () => {
        const parts: any[] = [];
        if (imageUri && imageBase64 && imageMimeType) {
          parts.push({
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64,
            },
          });
        }
        if (prompt.trim()) {
          parts.push({ text: prompt });
        }

        const result = await imageGenModel.generateContent({
          contents: [{ role: 'user', parts: parts }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
            responseModalities: ["TEXT", "IMAGE"],
          },
        });
        const response = await result.response;
        return response.candidates?.[0]?.content;
      }));

      const newImages: string[] = [];
      for (const data of responses) {
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((part: any) => part.inlineData?.mimeType?.startsWith('image/'));
        if (imagePart?.inlineData?.data) {
          const localUri = await saveImageLocally(imagePart.inlineData.data);
          if (localUri) {
            newImages.push(localUri);
            try { await saveToHistory({ type: 'image', content: localUri, prompt }); } 
            catch (err) { console.error('Error saving history:', err); }
          }
        }
      }

      if (newImages.length === 0) {
        setError('לא התקבלה תמונה מה־AI. נסה שוב.');
      } else {
        setGeneratedImages(newImages);
        setSaveSuccess(true);
        setCaption(`AI Caption: יצירת תמונה עבור "${prompt}"`);
      }

    } catch (e) {
      let errorMsg = 'שגיאה ביצירת תמונה.';
      if (e instanceof Error) errorMsg += ' ' + e.message;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const shareImage = async (uri: string) => {
    try {
      await Share.share({ url: uri });
    } catch (e) {
      console.error('Error sharing image:', e);
      Alert.alert('שגיאה', 'לא ניתן לשתף את התמונה', [{ text: 'אישור' }]);
    }
  };

  const applyFilterStyle = (filter: FilterType) => {
    switch(filter){
      case 'grayscale': return { tintColor: 'gray' };
      case 'sepia': return { tintColor: '#704214' };
      case 'blur': return { opacity: 0.7 };
      default: return {};
    }
  };

  return {
    generatedImages,
    loading,
    error,
    saveSuccess,
    caption,
    selectedFilter,
    setSelectedFilter,
    generateImages,
    shareImage,
    applyFilterStyle,
  };
};