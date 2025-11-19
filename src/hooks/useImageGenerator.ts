import { useState } from 'react';
import { Alert, Share } from 'react-native';
import RNFS from 'react-native-fs';
import { GEMINI_API_KEY } from '@env';
import { saveToHistory } from '../utils/storage';

// המודל היציב והנכון!
const IMAGE_MODEL_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur';

// פונקציית עזר לטיפול בשגיאות 429 וניסיונות חוזרים
const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries: number = 3,
    delay: number = 1000
) => {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const txt = await response.text();
            
            // בדיקה אם זו שגיאת 429 (מכסה)
            if (response.status === 429 && retries > 0) {
                console.warn(`Quota exceeded (429). Retrying in ${delay}ms... Retries left: ${retries - 1}`);
                
                // ממתין זמן ההשהיה (השהייה מעריכית)
                await new Promise(res => setTimeout(res, delay));
                
                // קריאה רקורסיבית עם פחות ניסיונות והכפלת זמן ההשהיה
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            
            // זורק שגיאה אם זה לא 429 או שנגמרו הניסיונות
            throw new Error(`HTTP ${response.status}: ${txt}`);
        }

        return response;
    } catch (error) {
        throw error;
    }
};

export const useImageGenerator = () => {
  // ... (כל ה-State נשאר זהה)
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');

  // -----------------------------
  // שמירת Base64 מקומית כקובץ
  // -----------------------------
  const saveImageLocally = async (base64Data: string) => { /* ... ללא שינוי */
    try {
      const path = `${RNFS.DocumentDirectoryPath}/image_${Date.now()}.png`;
      await RNFS.writeFile(path, base64Data, 'base64');
      return `file://${path}`;
    } catch (err) {
      console.error('Error saving image locally:', err);
      return null;
    }
  };

  // -----------------------------
  // יצירת תמונה בעזרת GEMINI REST (שינוי כאן)
  // -----------------------------
  const generateImages = async (prompt: string) => {
    setError('');
    setGeneratedImages([]);
    setSaveSuccess(false);
    setCaption('');

    if (!prompt.trim()) {
      setError('נא להזין טקסט ליצירת תמונה');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      };

      // שימוש בפונקציית ה-fetch החדשה עם Retry
      const response = await fetchWithRetry(`${IMAGE_MODEL_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // (אין צורך בבדיקת !response.ok כאן, כי fetchWithRetry מטפלת בזה)

      const data = await response.json();

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData?.data);

      if (!imagePart) {
        setError('לא התקבלה תמונה מהשרת');
        return;
      }

      const base64 = imagePart.inlineData.data;
      const localUri = await saveImageLocally(base64);

      // ... (שאר הקוד נשאר זהה)
      if (localUri) {
        setGeneratedImages([localUri]);
        setSaveSuccess(true);
        setCaption(`AI Caption: "${prompt}"`);

        try {
          await saveToHistory({
            type: 'image',
            content: localUri,
            prompt
          });
        } catch (e) {
          console.log("History save failed:", e);
        }
      }

    } catch (e: any) {
      console.error('Image generation error:', e);

      // טיפול בשגיאת מכסה גנרית לאחר שכל ה-retries נכשלו
      if (e.message.includes('429')) {
        setError('חרגת מהמכסה. אנא וודא שיש לך חשבון Billing פעיל בגוגל.');
      } else {
        setError('שגיאה ביצירת תמונה: ' + e.message);
      }

    } finally {
      setLoading(false);
    }
  };

  // ... (שאר הפונקציות נשארות זהות)
  const shareImage = async (uri: string) => { /* ... */ };
  const applyFilterStyle = (filter: FilterType) => { /* ... */ };

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
    applyFilterStyle
  };
};