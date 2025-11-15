import React from 'react';
import { SafeAreaView, ActivityIndicator, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const ArtsAndCultureScreen = () => {
  const artsAndCultureUrl = 'https://artsandculture.google.com/'; // You can change this to a specific exhibit or collection

  return (
    <View style={styles.flex1}>
      <SafeAreaView>
        <WebView
          source={{ uri: artsAndCultureUrl }}
          style={styles.flex1}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color="#0000ff"
              />
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
});

export default ArtsAndCultureScreen;
