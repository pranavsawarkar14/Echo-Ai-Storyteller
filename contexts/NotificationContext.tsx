import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOverlayVisible: boolean;
  showOverlay: () => void;
  hideOverlay: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Sample notifications for demo
    {
      id: '1',
      title: 'Welcome to Echo!',
      message: 'Thanks for joining us. Explore amazing stories and create your own.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
    {
      id: '2',
      title: 'New Story Available',
      message: 'A new story "The Midnight Adventure" has been added to your library.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: '3',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated with new preferences.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
  ]);

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const showOverlay = useCallback(() => {
    setIsOverlayVisible(true);
  }, []);

  const hideOverlay = useCallback(() => {
    setIsOverlayVisible(false);
  }, []);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isOverlayVisible,
    showOverlay,
    hideOverlay,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper functions to add different types of notifications
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message: string) => {
    addNotification({ title, message, type: 'success' });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string) => {
    addNotification({ title, message, type: 'error' });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    addNotification({ title, message, type: 'warning' });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    addNotification({ title, message, type: 'info' });
  }, [addNotification]);

  return { showSuccess, showError, showWarning, showInfo };
};