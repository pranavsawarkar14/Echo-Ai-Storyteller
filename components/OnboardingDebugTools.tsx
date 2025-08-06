import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { RotateCcw, Settings, Info } from 'lucide-react-native';

interface OnboardingDebugToolsProps {
  onReset?: () => void;
}

export function OnboardingDebugTools({ onReset }: OnboardingDebugToolsProps) {
  const { colors } = useTheme();

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      Alert.alert(
        'Onboarding Reset', 
        'Onboarding has been reset. Please restart the app to see the onboarding flow again.',
        [
          {
            text: 'OK',
            onPress: onReset,
          }
        ]
      );
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('hasCompletedOnboarding');
      Alert.alert(
        'Onboarding Status', 
        `Has completed onboarding: ${status === 'true' ? 'Yes' : 'No'}`
      );
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      Alert.alert('Error', 'Failed to check onboarding status');
    }
  };

  if (__DEV__) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Debug Tools</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={resetOnboarding}
        >
          <RotateCcw size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reset Onboarding</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.secondary }]} 
          onPress={checkOnboardingStatus}
        >
          <Info size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Check Status</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    minWidth: 150,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
});