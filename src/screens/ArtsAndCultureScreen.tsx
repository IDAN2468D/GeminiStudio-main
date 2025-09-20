import React from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const ArtsAndCultureScreen = () => {
  const artsAndCultureUrl = 'https://artsandculture.google.com/'; // You can change this to a specific exhibit or collection

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: artsAndCultureUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            style={styles.loadingIndicator}
            size="large"
            color="#0000ff"
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }], // Center the indicator
  },
});

export default ArtsAndCultureScreen;
