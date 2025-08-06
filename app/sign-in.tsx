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
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Home } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResettingWithCode, setIsResettingWithCode] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        console.error('Sign in not complete:', completeSignIn);
        // Try to handle incomplete sign-in - some accounts might have this issue
        if (completeSignIn.createdSessionId) {
          console.log('Attempting to set session despite incomplete status');
          await setActive({ session: completeSignIn.createdSessionId });
          router.replace('/(tabs)');
        } else {
          Alert.alert('Error', 'Sign in process incomplete. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.errors?.[0]?.code === 'form_password_incorrect') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignUp = () => {
    router.push('/sign-up');
  };

  const handleForgotPassword = async () => {
    if (!emailAddress.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first to reset your password.');
      return;
    }

    setIsResettingPassword(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });

      setShowResetForm(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Reset Code Sent',
        `We've sent a reset code to ${emailAddress}. Please check your email and enter the code below.`
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetCode.trim()) {
      Alert.alert('Reset Code Required', 'Please enter the reset code from your email.');
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Password Required', 'Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters long.');
      return;
    }

    setIsResettingWithCode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. You are now signed in.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      }
    } catch (err: any) {
      console.error('Password reset with code error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err.errors?.[0]?.code === 'form_code_incorrect') {
        errorMessage = 'Invalid reset code. Please check your email and try again.';
      } else if (err.errors?.[0]?.code === 'form_password_pwned') {
        errorMessage = 'This password has been found in a data breach. Please choose a different password.';
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setIsResettingWithCode(false);
    }
  };

  const goBackToSignIn = () => {
    setShowResetForm(false);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const goBack = () => {
    // Instead of router.back(), navigate to home/main screen
    router.replace('/(tabs)');
  };

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
              <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                Sign in to continue your story journey
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            {!showResetForm ? (
              <>
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
                    placeholder="Password"
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

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, { opacity: isLoading ? 0.7 : 1 }]}
                  onPress={onSignInPress}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark || colors.primary]}
                    style={styles.signInGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={handleForgotPassword}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <View style={styles.forgotPasswordContent}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={[styles.forgotPasswordText, { color: colors.primary, marginLeft: 8 }]}>
                        Sending reset code...
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                      Forgot your password?
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Password Reset Form */}
                <View style={styles.resetFormHeader}>
                  <TouchableOpacity 
                    style={[styles.backToSignInButton, { backgroundColor: colors.background }]}
                    onPress={goBackToSignIn}
                  >
                    <ArrowLeft size={20} color={colors.text} />
                    <Text style={[styles.backToSignInText, { color: colors.text }]}>
                      Back to Sign In
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.resetTitle, { color: colors.text }]}>
                  Reset Your Password
                </Text>
                <Text style={[styles.resetSubtitle, { color: colors.mutedText }]}>
                  Enter the reset code sent to {emailAddress}
                </Text>

                {/* Reset Code Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Mail size={20} color={colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.text, textAlign: 'center', fontSize: 18, letterSpacing: 2 }]}
                    placeholder="Reset Code"
                    placeholderTextColor={colors.mutedText}
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isResettingWithCode}
                  />
                </View>

                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Lock size={20} color={colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.text, flex: 1 }]}
                    placeholder="New Password"
                    placeholderTextColor={colors.mutedText}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isResettingWithCode}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Lock size={20} color={colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.text, flex: 1 }]}
                    placeholder="Confirm New Password"
                    placeholderTextColor={colors.mutedText}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isResettingWithCode}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={[styles.signInButton, { opacity: isResettingWithCode ? 0.7 : 1 }]}
                  onPress={handlePasswordReset}
                  disabled={isResettingWithCode}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark || colors.primary]}
                    style={styles.signInGradient}
                  >
                    {isResettingWithCode ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.signInButtonText}>Reset Password</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Sign Up Link - Only show when not in reset form */}
          {!showResetForm && (
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: colors.mutedText }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={goToSignUp}>
                <Text style={[styles.signUpLink, { color: colors.primary }]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  signInButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  signInGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetFormHeader: {
    marginBottom: 20,
  },
  backToSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backToSignInText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  resetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  resetSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});