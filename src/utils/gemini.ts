import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

export let genAI: GoogleGenerativeAI | null = null;
export let textModel: any = null;
export let imageGenModel: any = null;

/**
 * Initialize Gemini API models
 */
export const initializeGemini = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Text model
    textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Image model
    imageGenModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    console.log('Gemini API initialized successfully');
  }
};

/**
 * Generate a text response using Gemini
 */
export const generateResponse = async (text: string): Promise<string> => {
  try {
    initializeGemini();
    if (!textModel) throw new Error('Gemini text model not initialized');

    console.log('Sending text generation request...');
    const result = await textModel.generateContent({ prompt: text });
    console.log('Received response from Gemini API');

    return result.response[0].outputText || '';
  } catch (error: any) {
    console.error('Error generating response:', error);
    if (error.message?.includes('API key')) {
      throw new Error('בעיה עם מפתח ה-API. אנא ודא שהמפתח תקין ומוגדר כראוי');
    }
    throw new Error('שגיאה בקבלת תשובה מ-Gemini: ' + (error.message || 'שגיאה לא ידועה'));
  }
};

/**
 * Generate an image using Gemini
 */
export const generateImage = async (prompt: string, size = '1024x1024'): Promise<string> => {
  try {
    initializeGemini();
    if (!imageGenModel) throw new Error('Gemini image model not initialized');

    console.log('Sending image generation request...');
    const result = await imageGenModel.images.generate({ prompt, size });
    console.log('Received image from Gemini API');

    return result[0].url;
  } catch (error: any) {
    if (error.message?.includes('Quota exceeded') || error.message?.includes('429')) {
      throw new Error(
        'חרגת מהמכסה החינמית ל-Gemini API. נא לבדוק את המנוי/קרדיטים שלך: https://ai.dev/usage?tab=rate-limit'
      );
    }
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Placeholder for audio transcription (not yet supported)
 */
export const transcribeAudio = async (): Promise<string> => {
  try {
    initializeGemini();
    throw new Error('שירות התמלול עדיין לא זמין. בקרוב נוסיף תמיכה בשירותי תמלול של Google.');
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

/**
 * Define a live session type (not yet supported)
 */
export interface Session {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  onMessage: (callback: (message: string) => void) => void;
  sendMessage: (message: string) => Promise<void>;
}

/**
 * Placeholder for live session (not yet supported)
 */
export const startLiveSession = (): Session => {
  try {
    initializeGemini();
    throw new Error('שיחות שמע חיות עדיין לא נתמכות. בקרוב נוסיף תמיכה בשיחות חיות.');
  } catch (error) {
    console.error('Error starting live session:', error);
    throw error;
  }
};
