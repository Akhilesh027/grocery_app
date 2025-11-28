import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Lock } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(true);

  const adminPIN = '1234'; // In production, this should be secured properly

  const handlePinSubmit = () => {
    if (pin === adminPIN) {
      setIsAuthenticated(true);
      setShowPinModal(false);
      setPin('');
    } else {
      Alert.alert('Invalid PIN', 'Please enter the correct admin PIN');
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <Modal visible={showPinModal} animationType="slide">
        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <Lock size={48} color="#2563EB" />
            <Text style={styles.authTitle}>Admin Access</Text>
            <Text style={styles.authSubtitle}>Enter PIN to continue</Text>
            
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
            />
            
            <TouchableOpacity style={styles.submitButton} onPress={handlePinSubmit}>
              <Text style={styles.submitButtonText}>Access Admin Panel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '80%',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  pinInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});