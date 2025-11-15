import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

export const useDeepLinkHandler = (navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>) => {
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('📩 Deep Link Received:', url);

      const tokenMatch =
        url.match(/token=([^&]+)/) || url.match(/api\/users\/resetpassword\/([A-Za-z0-9]+)/);

      if (tokenMatch) {
        const token = tokenMatch[1];
        console.log('🔑 Token from link:', token);
        await AsyncStorage.setItem('reset_token', token);

        if (navigationRef.current) {
          navigationRef.current.navigate('ResetPassword', { token });
        } else {
          console.warn('Navigation ref not ready, could not navigate to ResetPassword');
        }
      } else {
        Alert.alert('Error', 'Invalid or missing reset link.');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [navigationRef]);
};