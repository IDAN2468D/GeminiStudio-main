import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from './api/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [token, setToken] = useState<string | null>(route.params?.token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🧩 הפעלת אנימציה וטעינת token
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const fetchToken = async () => {
      let currentToken = route.params?.token;
      if (!currentToken) {
        currentToken = await AsyncStorage.getItem('reset_token');
      }
      if (!currentToken) {
        Alert.alert('Error', 'Reset token missing.');
        navigation.navigate('Login');
      } else {
        setToken(currentToken);
      }
    };
    fetchToken();
  }, []);

  // 🧩 שליחת בקשת איפוס סיסמה
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'Missing reset token.');
      return;
    }

    setLoading(true);
    console.log('Resetting password with:', { token, password });

    try {
      // 🔗 אם השרת שלך מצפה ל־req.params.token (ולא ב־body)
      const response = await api.post(`/users/resetpassword/${token}`, { password });

      Alert.alert('Success', response.data.message || 'Password has been reset successfully.');

      await AsyncStorage.removeItem('reset_token');

      // אנימציה לפני מעבר למסך ההתחברות
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => navigation.navigate('Login'));
    } catch (error: any) {
      console.error('Reset password error:', error.response ? error.response.data : error.message);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <Icon name="robot-outline" size={70} color="#00ffff" style={styles.icon} />
        <Text style={styles.title}>Reset Password</Text>

        <View style={styles.passwordContainer}>
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
          </TouchableOpacity>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
          />
        </View>

        <View style={styles.passwordContainer}>
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
          </TouchableOpacity>
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.passwordInput}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  formContainer: { alignItems: 'center', paddingHorizontal: 30 },
  icon: { marginBottom: 15 },
  title: { fontSize: 32, color: '#00ffff', marginBottom: 30, fontWeight: 'bold' },
  button: {
    backgroundColor: '#00ffff',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#00ffff', marginTop: 15 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 15,
    textAlign: 'left',
  },
  eyeIcon: {
    padding: 15,
  },
});
