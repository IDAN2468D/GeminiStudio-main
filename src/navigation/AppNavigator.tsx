import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavigationContainer, DefaultTheme, DarkTheme, NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons

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

// Define types for the bottom tab navigator
export type RootTabParamList = {
  Home: undefined;
  Chat: { conversationId?: string } | undefined;
  ImageGen: undefined;
  LiveAudio: undefined;
  History: undefined;
  ArtsAndCulture: undefined; // Add new route for Arts & Culture
};

// Update RootStackParamList to include the bottom tab navigator and other stack screens
export type RootStackParamList = {
  RootTab: NavigatorScreenParams<RootTabParamList>; // Use NavigatorScreenParams for nested navigator types
  Settings: undefined;
  About: undefined;
  WebDesignerContent: { url: string }; // Add new route for Web Designer Content
  Login: undefined; // Add Login screen to RootStackParamList
  Register: undefined; // Add Register screen to RootStackParamList
  Onboarding: undefined; // Add Onboarding screen to RootStackParamList
  ForgotPassword: undefined; // Add ForgotPassword screen to RootStackParamList
  ResetPassword: undefined; // Add ResetPassword screen to RootStackParamList
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Component for the bottom tab navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Hide the labels
        tabBarPosition: 'bottom',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ImageGen') {
            iconName = focused ? 'image' : 'image-outline';
          } else if (route.name === 'LiveAudio') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'ArtsAndCulture') {
            iconName = focused ? 'easel' : 'easel-outline';
          }

          return <Ionicons name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { textTransform: 'none' },
        tabBarStyle: {
          // ...existing code...
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'בית' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'צ׳אט' }} />
      <Tab.Screen name="ImageGen" component={ImageGenScreen} options={{ tabBarLabel: 'תמונות' }} />
      <Tab.Screen
        name="LiveAudio"
        component={StoryGeneratorScreen}
        options={{
          tabBarLabel: 'יצירה',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'היסטוריה' }} />
      <Tab.Screen name="ArtsAndCulture" component={ArtsAndCultureScreen} options={{ tabBarLabel: 'אמנות ותרבות' }} />
    </Tab.Navigator>
  );
};

const linking = {
  prefixes: ['https://test-q3enl6kqw6542vwr.mlsender.net', 'myapp://'],
  config: {
    screens: {
      ResetPassword: 'api/users/resetpassword/:token',
    },
  },
};

const AppNavigator = () => {
  const scheme = useColorScheme();
  const { state } = useContext(AuthContext);

  return (
    <NavigationContainer linking={linking} theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName='Onboarding'  screenOptions={{ headerShown: false }}>
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
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
