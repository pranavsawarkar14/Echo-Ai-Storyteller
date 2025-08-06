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
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Home, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function SignInScreen() {
  const { colors } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.error('Sign in not complete', completeSignIn);
        Alert.alert('Error', 'Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      let errorMessage = 'An error occurred during sign in.';
      
      if (err.errors && err.errors[0]) {
        errorMessage = err.errors[0].message;
      }
      
      Alert.alert('Sign In Failed', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        router.replace('/(tabs)');
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. You are now signed in.'
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

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            style={styles.logoContainer}
          >
            <Text style={styles.logoText}>📚</Text>
          </LinearGradient>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Sign in to access your stories
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!showResetForm ? (
            <>
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
                    placeholder="Enter your password"
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

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={onSignInPress}
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
                      <LogIn size={20} color="white" />
                      <Text style={styles.buttonText}>Sign In</Text>
                    </>
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
                <Text style={[styles.inputLabel, { color: colors.text }]}>Reset Code</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, textAlign: 'center', fontSize: 18, letterSpacing: 2 }]}
                    value={resetCode}
                    onChangeText={setResetCode}
                    placeholder="000000"
                    placeholderTextColor={colors.mutedText}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isResettingWithCode}
                  />
                </View>
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isResettingWithCode}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isResettingWithCode}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handlePasswordReset}
                disabled={isResettingWithCode}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark || colors.primary]}
                  style={styles.buttonGradient}
                >
                  {isResettingWithCode ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <LogIn size={20} color="white" />
                      <Text style={styles.buttonText}>Reset Password</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* Sign Up Link - Only show when not in reset form */}
          {!showResetForm && (
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.mutedText }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToSignUp}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  },
  form: {
    width: '100%',
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
  signInButton: {
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
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
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
});