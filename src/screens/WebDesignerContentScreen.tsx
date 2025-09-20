import React from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebDesignerContentScreenProps {
  route: {
    params: {
      url: string;
    };
  };
}

const WebDesignerContentScreen: React.FC<WebDesignerContentScreenProps> = ({ route }) => {
  const { url } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
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

export default WebDesignerContentScreen;
