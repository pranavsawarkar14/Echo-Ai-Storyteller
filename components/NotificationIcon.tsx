import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationIconProps {
  size?: number;
  color?: string;
  style?: any;
}

export default function NotificationIcon({ 
  size = 24, 
  color,
  style 
}: NotificationIconProps) {
  const { colors } = useTheme();
  const { unreadCount, showOverlay } = useNotifications();
  
  const iconColor = color || colors.text;

  return (
    <TouchableOpacity
      onPress={showOverlay}
      style={[styles.container, style]}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Bell color={iconColor} size={size} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
});