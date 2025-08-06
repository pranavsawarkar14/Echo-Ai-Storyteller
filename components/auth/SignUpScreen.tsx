import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, ArrowLeft, Check, Home } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function SignUpScreen() {
  const { colors } = useTheme();
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!firstName.trim() || !lastName.trim() || !emailAddress.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Sign up error:', err);
      let errorMessage = 'An error occurred during sign up.';
      
      if (err.errors && err.errors[0]) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error('Verification not complete', completeSignUp);
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      let errorMessage = 'An error occurred during verification.';
      
      if (err.errors && err.errors[0]) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Verification Failed', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/sign-in');
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pendingVerification) {
      setPendingVerification(false);
    } else {
      // Navigate to home instead of router.back()
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          {pendingVerification ? (
            <ArrowLeft size={24} color={colors.text} />
          ) : (
            <Home size={24} color={colors.text} />
          )}
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            style={styles.logoContainer}
          >
            <Text style={styles.logoText}>📚</Text>
          </LinearGradient>
          <Text style={[styles.title, { color: colors.text }]}>
            {pendingVerification ? 'Verify Email' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            {pendingVerification 
              ? `We sent a verification code to ${emailAddress}`
              : 'Join Echo to create and save your stories'
            }
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!pendingVerification ? (
            <>
              {/* Name Inputs */}
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, styles.nameInput]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <User size={20} color={colors.mutedText} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="First name"
                      placeholderTextColor={colors.mutedText}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.nameInput]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <User size={20} color={colors.mutedText} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Last name"
                      placeholderTextColor={colors.mutedText}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Mail size={20} color={colors.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password (min 8 characters)"
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={onSignUpPress}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark || colors.primary]}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <UserPlus size={20} color="white" />
                      <Text style={styles.buttonText}>Create Account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.mutedText }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToSignIn}>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Verification Code Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Verification Code</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, textAlign: 'center', fontSize: 18, letterSpacing: 4 }]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    placeholderTextColor={colors.mutedText}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={onPressVerify}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark || colors.primary]}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Check size={20} color="white" />
                      <Text style={styles.buttonText}>Verify & Continue</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={() => signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Didn't receive a code? Resend
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  footerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});