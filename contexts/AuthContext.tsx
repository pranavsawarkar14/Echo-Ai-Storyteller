import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  // Auth state
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: any;
  
  // Auth actions
  signOut: () => Promise<void>;
  
  // Admin functionality
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin user IDs - you can move this to environment variables
const ADMIN_USER_IDS = [
  'user_2qV7X9Z8K3mN4pL6rT8wY1sA', // Replace with actual admin user IDs
  // Add more admin user IDs as needed
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useAuth();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user?.id) {
      const adminStatus = ADMIN_USER_IDS.includes(user.id);
      setIsAdmin(adminStatus);
      
      // Store admin status locally for quick access
      AsyncStorage.setItem('isAdmin', JSON.stringify(adminStatus));
    } else {
      setIsAdmin(false);
      AsyncStorage.removeItem('isAdmin');
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      // Clear any local storage
      await AsyncStorage.multiRemove([
        'userStories',
        'isAdmin',
        'lastSyncTime',
        'cloudSyncEnabled'
      ]);
      
      // Sign out from Clerk
      await clerkSignOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isLoaded,
    isSignedIn: isSignedIn || false,
    userId: user?.id || null,
    user,
    signOut: handleSignOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};