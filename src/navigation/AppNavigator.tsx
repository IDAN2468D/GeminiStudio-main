import React, { useContext } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  NavigationContainerRef,
  NavigatorScreenParams, // Import NavigatorScreenParams
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { navigationRef } from '../utils/navigationRef';
import { useDeepLinkHandler } from '../hooks/useDeepLinkHandler';

// Define BottomTabParamList
export type BottomTabParamList = {
  Home: undefined;
  Chat: undefined;
  ImageGen: undefined;
  LiveAudio: undefined;
  History: undefined;
};

// ✅ הגדרת סוגי המסכים (כולל token אופציונלי)
export type RootStackParamList = {
  RootTab: NavigatorScreenParams<BottomTabParamList>; // Correctly type RootTab
  Settings: undefined;
  About: undefined;
  WebDesignerContent: { url: string };
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string }; // <-- token אופציונלי כדי למנוע שגיאת TypeScript
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// screens imports
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import ImageGenScreen from '../screens/ImageGenScreen';
import StoryGeneratorScreen from '../screens/StoryGeneratorScreen';
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
      ResetPassword: 'resetpassword/:token',
    },
  },
};

const AppNavigator = () => {
  const { state } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  useDeepLinkHandler(navigationRef as unknown as React.RefObject<NavigationContainerRef<RootStackParamList>>);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={theme}
    >
      <Stack.Navigator initialRouteName="RootTab" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RootTab" component={BottomTabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="WebDesignerContent" component={WebDesignerContentScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;