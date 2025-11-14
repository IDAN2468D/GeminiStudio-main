import React, { useContext, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { navigationRef } from '../utils/navigationRef';

// ✅ הגדרת סוגי המסכים (כולל token אופציונלי)
export type RootStackParamList = {
  RootTab: undefined;
  Settings: undefined;
  About: undefined;
  WebDesignerContent: { url: string };
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string }; // <-- token אופציונלי כדי למנוע שגיאת TypeScript
};

// screens imports
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import ImageGenScreen from '../screens/ImageGenScreen';
import StoryGeneratorScreen from '../screens/StoryGeneratorScreen';
import ArtsAndCultureScreen from '../screens/ArtsAndCultureScreen';
import WebDesignerContentScreen from '../screens/WebDesignerContentScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = 'home-outline';
        switch (route.name) {
          case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
          case 'Chat': iconName = focused ? 'chatbubbles' : 'chatbubbles-outline'; break;
          case 'ImageGen': iconName = focused ? 'image' : 'image-outline'; break;
          case 'LiveAudio': iconName = focused ? 'mic' : 'mic-outline'; break;
          case 'History': iconName = focused ? 'time' : 'time-outline'; break;
          case 'ArtsAndCulture': iconName = focused ? 'easel' : 'easel-outline'; break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="ImageGen" component={ImageGenScreen} />
    <Tab.Screen name="LiveAudio" component={StoryGeneratorScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="ArtsAndCulture" component={ArtsAndCultureScreen} />
  </Tab.Navigator>
);

// ✅ הגדרת linking נכונה (לא כולל api/users)
const linking = {
  prefixes: [
    'https://test-q3enl6kqw6542vwr.mlsender.net',
    'https://shopappbackend-nl1h.onrender.com',
    'myapp://',
  ],
  config: {
    screens: {
      ResetPassword: 'api/users/resetpassword/:token',
    },
  },
};

const AppNavigator = () => {
  const scheme = useColorScheme();
  const { state } = useContext(AuthContext);

  // 🧩 מאזין לפתיחת קישורים מהאימייל
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('📩 Deep Link Received:', url);

      // תואם לשני סוגי לינקים (עם ?token= או /token)
      const tokenMatch =
        url.match(/token=([^&]+)/) || url.match(/api\/users\/resetpassword\/([A-Za-z0-9]+)/);

      if (tokenMatch) {
        const token = tokenMatch[1];
        console.log('🔑 Token from link:', token);
        await AsyncStorage.setItem('reset_token', token);

        // ✅ משתמשים ב-type הבטוח
        (navigationRef.current as NavigationContainerRef<RootStackParamList>)?.navigate('ResetPassword', { token });
      } else {
        Alert.alert('Error', 'Invalid or missing reset link.');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // בודק אם האפליקציה נפתחה מהקישור בתחילת ההפעלה
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        {state.user ? (
          <>
            <Stack.Screen name="RootTab" component={BottomTabNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="WebDesignerContent" component={WebDesignerContentScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
