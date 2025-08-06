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
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Check, Home } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Sign up error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.errors?.[0]?.code === 'form_password_pwned') {
        errorMessage = 'This password has been found in a data breach. Please choose a different password.';
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Check if email is verified and handle missing requirements
      if (completeSignUp.verifications?.emailAddress?.status === 'verified') {
        // Email is verified, now check if there are missing requirements
        if (completeSignUp.status === 'missing_requirements') {
          const missingFields = completeSignUp.missingFields || [];
          
          if (missingFields.includes('phone_number')) {
            // Phone number is required but we don't have it - skip for now
            // Try to complete with what we have
            try {
              const finalResult = await signUp.update({});
              if (finalResult.status === 'complete') {
                await setActive({ session: finalResult.createdSessionId });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/(tabs)');
                return;
              }
            } catch (updateError) {
              console.log('Could not complete without phone, will proceed anyway');
            }
            
            // If we can't complete without phone, show success anyway since email is verified
            Alert.alert(
              'Account Created!', 
              'Your email has been verified. You can now sign in to your account.',
              [
                {
                  text: 'Sign In',
                  onPress: () => router.replace('/sign-in')
                }
              ]
            );
            return;
          }
        }
        
        if (completeSignUp.status === 'complete') {
          await setActive({ session: completeSignUp.createdSessionId });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)');
        } else {
          // Email verified but not complete - redirect to sign-in
          Alert.alert(
            'Email Verified!', 
            'Your email has been verified. Please sign in to continue.',
            [
              {
                text: 'Sign In',
                onPress: () => router.replace('/sign-in')
              }
            ]
          );
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to verify email. Please try again.';
      
      if (err.errors?.[0]?.code === 'form_code_incorrect') {
        errorMessage = 'Incorrect verification code. Please check and try again.';
      } else if (err.errors?.[0]?.code === 'verification_already_verified') {
        // Email already verified - redirect to sign in
        Alert.alert(
          'Already Verified!', 
          'Your email is already verified. Please sign in to continue.',
          [
            {
              text: 'Sign In',
              onPress: () => router.replace('/sign-in')
            }
          ]
        );
        return;
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignIn = () => {
    router.push('/sign-in');
  };

  const goBack = () => {
    if (pendingVerification) {
      setPendingVerification(false);
    } else {
      // Navigate to home instead of router.back()
      router.replace('/(tabs)');
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Success', 'Verification code sent to your email');
    } catch (err) {
      console.error('Resend error:', err);
      Alert.alert('Error', 'Failed to resend verification code');
    }
  };

  if (pendingVerification) {
    return (
      <LinearGradient
        colors={[colors.background, colors.card]}
        style={styles.container}
      >
        <View style={styles.verificationContainer}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={goBack}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.verificationIcon}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || colors.primary]}
              style={styles.iconGradient}
            >
              <Mail size={32} color="white" />
            </LinearGradient>
          </View>

          <Text style={[styles.verificationTitle, { color: colors.text }]}>
            Check your email
          </Text>
          <Text style={[styles.verificationSubtitle, { color: colors.mutedText }]}>
            We sent a verification code to{'\n'}{emailAddress}
          </Text>

          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.codeInput, { color: colors.text }]}
              placeholder="Enter verification code"
              placeholderTextColor={colors.mutedText}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={6}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.verifyButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={onPressVerify}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                style={styles.verifyGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Check size={18} color="white" />
                    <Text style={styles.verifyButtonText}>Verify Email</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendContainer} onPress={resendCode}>
              <Text style={[styles.resendText, { color: colors.mutedText }]}>
                Didn't receive the code?{' '}
              </Text>
              <Text style={[styles.resendLink, { color: colors.primary }]}>
                Resend
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.card]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={goBack}
            >
              <Home size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                Just need your email and password to get started
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            {/* Name Inputs */}
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.nameInput]}>
                <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
                  <User size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="First name (optional)"
                  placeholderTextColor={colors.mutedText}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, styles.nameInput]}>
                <TextInput
                  style={[styles.input, { color: colors.text, marginLeft: 48 }]}
                  placeholder="Last name"
                  placeholderTextColor={colors.mutedText}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
                <Mail size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.mutedText}
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
                <Lock size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text, flex: 1 }]}
                placeholder="Password (min. 8 characters)"
                placeholderTextColor={colors.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.mutedText} />
                ) : (
                  <Eye size={20} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={onSignUpPress}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                style={styles.signUpGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={[styles.termsText, { color: colors.mutedText }]}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={[styles.signInText, { color: colors.mutedText }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={goToSignIn}>
              <Text style={[styles.signInLink, { color: colors.primary }]}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  signUpGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Verification styles
  verificationContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  verificationIcon: {
    marginTop: 40,
    marginBottom: 32,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
    letterSpacing: 4,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  verifyGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});