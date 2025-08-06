const primaryColor = "#6366F1"; // Indigo - more modern and appealing
const secondaryColor = "#EC4899"; // Pink
const lightBackground = "#F8FAFC"; // Very light blue-gray
const cardBackground = "#FFFFFF"; // Pure white
const lightText = "#1E293B"; // Slate gray
const mutedText = "#64748B"; // Medium slate
const accentColor = "#10B981"; // Emerald
const gradientStart = "#6366F1"; // Indigo
const gradientEnd = "#8B5CF6"; // Purple
const softBlue = "#EEF2FF"; // Very light indigo
const softPurple = "#F3E8FF"; // Very light purple

// Dark mode colors
const darkBackground = "#0F172A"; // Dark slate
const darkCardBackground = "#1E293B"; // Darker slate
const darkTextColor = "#F1F5F9"; // Light slate
const darkMutedText = "#94A3B8"; // Medium light slate
const darkBorder = "#334155"; // Slate border

export default {
  primary: primaryColor,
  secondary: secondaryColor,
  background: lightBackground,
  card: cardBackground,
  text: lightText,
  mutedText: mutedText,
  accent: accentColor,
  gradientStart: gradientStart,
  gradientEnd: gradientEnd,
  softBlue: softBlue,
  softPurple: softPurple,
  tabIconDefault: mutedText,
  tabIconSelected: primaryColor,
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  surfaceLight: "#F8FAFC",
  primaryLight: "#C7D2FE",
  shadow: "#000000",
  
  // Dark mode variants
  dark: {
    background: darkBackground,
    card: darkCardBackground,
    text: darkTextColor,
    mutedText: darkMutedText,
    border: darkBorder,
    tabIconDefault: darkMutedText,
    tabIconSelected: primaryColor,
  }
};