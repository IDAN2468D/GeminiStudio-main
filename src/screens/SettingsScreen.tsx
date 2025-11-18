import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Modal, Alert, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { AuthContext } from '../context/AuthContext';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [language, setLanguage] = useState('he');
  const [googleUser, setGoogleUser] = useState<any>(null);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    AsyncStorage.getItem('user').then((u) => {
      console.log("USER FROM STORAGE:", u);
    });

    AsyncStorage.getItem('settings').then((data) => {
      if (data) {
        const s = JSON.parse(data);
        setDarkMode(s.darkMode);
        setUsername(s.username || '');
        setLanguage(s.language || 'he');
      }
    });

    // Load logged user info
    AsyncStorage.getItem('user').then((data) => {
      if (data) {
        const u = JSON.parse(data);
        if (u.provider === 'google') {
          setGoogleUser(u);
        }
      }
    });
  }, []);

  const saveSettings = (newSettings: any) => {
    AsyncStorage.setItem('settings', JSON.stringify(newSettings));
  };

  const handleResetHistory = () => {
    Alert.alert('איפוס היסטוריה', 'האם לאפס את כל השיחות?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'איפוס', style: 'destructive', onPress: () => AsyncStorage.removeItem('conversations') },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    navigation.navigate('Onboarding');
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: '#1E2A36' }]}> 
      <Text style={[styles.header, darkMode && { backgroundColor: '#1E2A36', color: '#F9FAFB' }]}>הגדרות</Text>
      <ScrollView>
        {/* רק אם מחובר עם גוגל */}
        {googleUser && (
          <View style={[styles.googleCard, darkMode && { backgroundColor: '#2C3E50', shadowColor: '#000' }]}>
            <Text style={[styles.label, darkMode && { color: '#F9FAFB' }]}>מחובר עם Google</Text>
            <View style={styles.googleRow}>
              <Image source={{ uri: googleUser.photo }} style={styles.googleImage} />
              <View>
                <Text style={[styles.googleName, darkMode && { color: '#fff' }]}>
                  {googleUser.name}
                </Text>
                <Text style={[styles.googleEmail, darkMode && { color: '#ddd' }]}>
                  {googleUser.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, darkMode && { color: '#F9FAFB' }]}>העדפות אפליקציה</Text>

        {/* מצב כהה */}
        <View style={[styles.row, darkMode && { backgroundColor: '#2C3E50', borderBottomColor: '#34495E' }]}>
          <Text style={[styles.label, darkMode && { color: '#F9FAFB' }]}>מצב כהה</Text>
          <Switch 
            value={darkMode} 
            onValueChange={(v) => { 
              setDarkMode(v); 
              saveSettings({ darkMode: v, username, language }); 
            }} 
            thumbColor={darkMode ? "#3498DB" : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>

        {/* שם משתמש (רק אם לא Google) */}
        {!googleUser && (
          <View style={[styles.row, darkMode && { backgroundColor: '#2C3E50', borderBottomColor: '#34495E' }]}>
            <Text style={[styles.label, darkMode && { color: '#F9FAFB' }]}>שם משתמש</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={[styles.value, darkMode && { color: '#BDC3C7' }]}>{username || 'הגדר שם'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* שפה */}
        <View style={[styles.row, darkMode && { backgroundColor: '#2C3E50', borderBottomColor: '#34495E' }]}>
          <Text style={[styles.label, darkMode && { color: '#F9FAFB' }]}>שפה</Text>
          <TouchableOpacity onPress={() => setLanguage(language === 'he' ? 'en' : 'he')}>
            <Text style={[styles.value, darkMode && { color: '#BDC3C7' }]}>{language === 'he' ? 'עברית' : 'English'}</Text>
          </TouchableOpacity>
        </View>

        {/* אודות */}
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
          <View style={[styles.row, darkMode && { backgroundColor: '#2C3E50', borderBottomColor: '#34495E' }]}>
            <Text style={[styles.label, darkMode && { color: '#F9FAFB' }]}>אודות</Text>
          </View>
        </TouchableOpacity>

        {/* איפוס היסטוריה */}
        <TouchableOpacity style={[styles.button, styles.resetBtn]} onPress={handleResetHistory}>
          <Text style={styles.buttonText}>איפוס היסטוריה</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* התנתקות */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.buttonText}>התנתק</Text>
        </TouchableOpacity>
      </View>

      {/* חלונית עריכת שם משתמש */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>שם משתמש</Text>
            <TextInput value={username} onChangeText={setUsername} style={styles.input} />
            <TouchableOpacity 
              onPress={() => { 
                setModalVisible(false); 
                saveSettings({ darkMode, username, language }); 
              }} 
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>שמור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    //marginTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginTop: 30,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEF',
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '500',
  },

  googleCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  googleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  googleImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#EAECEF',
  },
  googleName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C3E50',
  },
  googleEmail: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 4,
  },

  button: {
    marginTop: 25,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resetBtn: { 
    backgroundColor: '#E74C3C',
    marginBottom: 20,
  },
  logoutBtn: { 
    backgroundColor: '#c0392b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EAECEF',
    bottom: 30,
  },

  modalBg: { 
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'right',
  },
  saveBtn: {
    backgroundColor: '#28B463',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
