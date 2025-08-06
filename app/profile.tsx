import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Mail, Phone, Calendar, Save } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  colors: any;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  colors,
}) => (
  <View style={[styles.fieldContainer, { backgroundColor: colors.card }]}>
    <View style={styles.fieldHeader}>
      <View style={[styles.fieldIcon, { backgroundColor: colors.softBlue }]}>
        {icon}
      </View>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
    </View>
    <TextInput
      style={[styles.fieldInput, { color: colors.text, borderColor: colors.border }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedText}
      keyboardType={keyboardType}
    />
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, isLoaded } = useAuthContext();
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    joinDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from Clerk when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      console.log('Loading user data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        userId: user.id
      });

      const joinDate = user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })
        : 'Recently';

      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: user.primaryPhoneNumber?.phoneNumber || "",
        joinDate: joinDate,
      });
      
      setIsLoading(false);
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  // Create full name for display
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Echo User";

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please try again.");
      return;
    }

    try {
      console.log('Saving profile:', {
        currentFirstName: user.firstName,
        currentLastName: user.lastName,
        newFirstName: profile.firstName,
        newLastName: profile.lastName
      });

      // Check if there are actual changes
      const hasChanges = profile.firstName !== (user.firstName || "") || 
                        profile.lastName !== (user.lastName || "");

      if (hasChanges) {
        // Update the user profile in Clerk
        await user.update({
          firstName: profile.firstName.trim() || undefined,
          lastName: profile.lastName.trim() || undefined,
        });
        
        console.log('Profile updated successfully in Clerk');
        
        Alert.alert(
          "Profile Updated",
          "Your profile information has been saved successfully.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "No Changes",
          "No changes were made to your profile.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        "Update Failed",
        "Failed to update your profile. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.avatarContainer}
          >
            <User size={48} color="white" />
          </LinearGradient>
          <Text style={[styles.avatarName, { color: colors.text }]}>{fullName}</Text>
          <Text style={[styles.avatarSubtitle, { color: colors.mutedText }]}>
            {isLoading ? "Loading..." : "Echo Storyteller"}
          </Text>
          {user && (
            <Text style={[styles.userIdText, { color: colors.mutedText }]}>
              ID: {user.id.slice(-8)}
            </Text>
          )}
        </View>

        <View style={styles.formSection}>
          <ProfileField
            icon={<User size={20} color={colors.primary} />}
            label="First Name"
            value={profile.firstName}
            onChangeText={(text) => setProfile({ ...profile, firstName: text })}
            placeholder="Enter your first name"
            colors={colors}
          />

          <ProfileField
            icon={<User size={20} color={colors.primary} />}
            label="Last Name"
            value={profile.lastName}
            onChangeText={(text) => setProfile({ ...profile, lastName: text })}
            placeholder="Enter your last name"
            colors={colors}
          />

          <View style={[styles.fieldContainer, { backgroundColor: colors.card }]}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.softBlue }]}>
                <Mail size={20} color={colors.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Email Address</Text>
            </View>
            <View style={[styles.readOnlyField, { borderColor: colors.border }]}>
              <Text style={[styles.readOnlyText, { color: colors.mutedText }]}>
                {profile.email || "No email address"}
              </Text>
            </View>
            <Text style={[styles.helpText, { color: colors.mutedText }]}>
              Email cannot be changed here. Contact support if needed.
            </Text>
          </View>

          <ProfileField
            icon={<Phone size={20} color={colors.primary} />}
            label="Phone Number"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            colors={colors}
          />

          <View style={[styles.fieldContainer, { backgroundColor: colors.card }]}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.softBlue }]}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Member Since</Text>
            </View>
            <View style={[styles.readOnlyField, { borderColor: colors.border }]}>
              <Text style={[styles.readOnlyText, { color: colors.mutedText }]}>{profile.joinDate}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  avatarSubtitle: {
    fontSize: 16,
  },
  userIdText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  formSection: {
    paddingHorizontal: 20,
    gap: 24,
  },
  fieldContainer: {
    gap: 12,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  fieldInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  readOnlyField: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    opacity: 0.7,
  },
  readOnlyText: {
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});