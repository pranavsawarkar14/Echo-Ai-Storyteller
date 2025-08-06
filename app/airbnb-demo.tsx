import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  ScrollView,
  StatusBar,
} from 'react-native';
import { AirbnbSearchInteraction } from '@/components/AirbnbSearchInteraction';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';

interface SearchData {
  where: string;
  when: string;
  who: string;
}

export default function AirbnbDemoScreen() {
  const { colors } = useTheme();

  const handleSearch = (searchData: SearchData) => {
    // Filter out empty fields
    const filledFields = Object.entries(searchData)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
    
    if (filledFields.length > 0) {
      Alert.alert(
        'Search Results', 
        filledFields.join('\n\n'),
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Search', 
        'Please fill in at least one search field to continue.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colors === Colors ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.background} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Airbnb Search Demo
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Experience smooth search bar expansion animation
          </Text>
        </View>
        
        <View style={styles.demoSection}>
          <View style={styles.searchWrapper}>
            <AirbnbSearchInteraction onSearch={handleSearch} />
          </View>
          
          <View style={styles.instructionsCard}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              How it works:
            </Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepText}>1</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.mutedText }]}>
                  Tap the search bar above
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepText}>2</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.mutedText }]}>
                  Watch the smooth expansion animation
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.mutedText }]}>
                  Fill in your search preferences
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepText}>4</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.mutedText }]}>
                  Tap search or close with the X button
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.featuresCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.featuresTitle, { color: colors.text }]}>
              Features:
            </Text>
            <Text style={[styles.featuresText, { color: colors.mutedText }]}>
              • Smooth spring animations with React Native Reanimated{'\n'}
              • Full-screen modal with background overlay{'\n'}
              • Interactive tabs (Homes, Experiences, Services){'\n'}
              • Touch feedback and gesture handling{'\n'}
              • Responsive design for all screen sizes{'\n'}
              • Matches Airbnb's visual design language
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  demoSection: {
    alignItems: 'center',
  },
  searchWrapper: {
    marginBottom: 60,
  },
  instructionsCard: {
    width: '100%',
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  featuresCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featuresText: {
    fontSize: 15,
    lineHeight: 22,
  },
});