import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  Alert 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api/api';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const GOOGLE_SIGN_IN_CONFIG = {
  webClientId: "239218305388-1dglouttmr56ku8lnt7af75a9ji0nan3.apps.googleusercontent.com",
   offlineAccess: true,
};

function isErrorWithCode(error: any): error is { code: string } {
  return error && typeof error === 'object' && 'code' in error;
}

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { dispatch } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG); 
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/users/login', { email, password });
      const token = response.data?.token;

      if (token) {
        await AsyncStorage.setItem('token', token);
        dispatch({ type: 'LOGIN', payload: { user: { email }, token } });
        navigation.navigate('RootTab');
      } else {
        Alert.alert('שגיאה', 'תגובה לא חוקית מהשרת.');
      }
    } catch (error: any) {
      Alert.alert('הכניסה נכשלה', error.response?.data?.message || 'שגיאת שרת.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        if (currentUser.idToken) {
          const { user, idToken } = currentUser;
          await AsyncStorage.setItem('token', idToken);
          dispatch({ type: 'LOGIN', payload: { user, token: idToken } });
          navigation.navigate('RootTab');
        } else {
          Alert.alert('Error', 'Sign-in was successful, but the ID Token could not be retrieved.');
        }
      } else {
        Alert.alert('Error', 'Could not get user information after sign-in.');
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (e.g. sign in) is in progress already
            Alert.alert('Operation in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // play services not available or outdated
            Alert.alert('Play services not available or outdated');
            break;
          default:
            // some other error happened
            console.error(error);
            Alert.alert(
              'Google Sign-In Error',
              `An error occurred. Code: ${error.code}. This may be due to a configuration issue. Please check that the webClientId is correct and the SHA-1 fingerprint is configured in your Google API Console project.`
            );
        }
      } else {
        // an error that's not related to google sign in occurred
        Alert.alert('Error', 'An unexpected error occurred.');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <Icon name="robot-outline" size={70} color="#00ffff" style={styles.icon} />
        <Text style={styles.title}>Gemini Studio</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
          </TouchableOpacity>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'טוען...' : 'כניסה'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={signIn} disabled={loading}>
          <Icon name="google" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>כניסה עם Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>אין לך חשבון? הרשמה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>שכחתי סיסמה</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  formContainer: { 
    alignItems: 'center', 
    paddingHorizontal: 30 
  },
  icon: { 
    marginBottom: 15 
  },
  title: { 
    fontSize: 32, 
    color: '#00ffff', 
    marginBottom: 30, 
    fontWeight: 'bold' 
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    textAlign: 'right', // יישור לימין לטקסט בעברית
  },
  button: {
    backgroundColor: '#00ffff',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  linkText: { 
    color: '#00ffff', 
    marginTop: 15 
  },
  forgotPasswordText: { 
    color: '#00ffff', 
    marginTop: 10, 
    fontSize: 14 
  },
  passwordContainer: {
    flexDirection: 'row-reverse', // כדי לשים את העין מימין
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
    textAlign: 'right', // יישור לימין
  },
  eyeIcon: {
    padding: 15,
  },
  googleButton: {
    backgroundColor: '#db4437',
    flexDirection: 'row-reverse', // יישור לימין עם האייקון בצד
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});