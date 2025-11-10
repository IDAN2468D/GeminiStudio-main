import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Define the RootStackParamList type for your navigation stack
type RootStackParamList = {
  Onboarding: undefined; // Assuming Onboarding screen takes no parameters
  Login: undefined;      // Login screen takes no parameters
  Register: undefined;   // Register screen takes no parameters
  // Add other screens in your app's navigation stack here
};

// Define the props type for OnboardingScreen
type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // אנימציה - נענוע הראש של הרובוט
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // אנימציה - מצמוץ עיניים
  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(blink, Math.random() * 4000 + 1500);
      });
    };
    blink();
  }, []);

  // אנימציה - נשימת כפתור (זוהר עדין)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return (
    <View style={styles.container}>
      {/* דמות הרובוט */}
      <Animated.View
        style={{
          transform: [{ rotate: rotateInterpolate }],
        }}
      >
        <Svg height="160" width="160" viewBox="0 0 100 100">
          {/* ראש */}
          <Rect
            x="20"
            y="25"
            width="60"
            height="50"
            rx="15"
            ry="15"
            fill="#00E0FF"
          />

          <Circle cx="50" cy="8" r="3" fill="#00E0FF" />

          {/* עיניים */}
          <AnimatedCircle cx="35" cy="50" r="5" fill="#000" scaleY={blinkAnim} />
          <AnimatedCircle cx="65" cy="50" r="5" fill="#000" scaleY={blinkAnim} />

          {/* חיוך */}

          {/* חיוך */}
          <Path
            d="M35 65 Q50 75 65 65"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* טקסט */}
      <Text style={styles.title}>Welcome to Gemini Studio</Text>
      <Text style={styles.subtitle}>
        Your AI companion for building smarter apps.
      </Text>

      {/* כפתור עם אנימציית נשימה */}
      <Animated.View
        style={[
          styles.animatedButton,
          {
            transform: [{ scale: pulseAnim }],
            shadowOpacity: pulseAnim.interpolate({
              inputRange: [1, 1.08],
              outputRange: [0.2, 0.6],
            }),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
};

// === עיצוב ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F2D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: '#00E0FF',
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0CFDC',
    textAlign: 'center',
    marginVertical: 12,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  animatedButton: {
    marginTop: 25,
    shadowColor: '#00E0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    backgroundColor: '#00E0FF',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 16,
  },
  buttonText: {
    color: '#001F2D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    color: '#00E0FF',
    marginTop: 20,
    fontSize: 15,
  },
});

export default OnboardingScreen;
