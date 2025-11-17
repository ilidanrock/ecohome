import { create } from 'zustand';
import type { Notification, NotificationType } from '../types';
import { generateNotificationId, sortNotificationsByDate, isRecentNotification } from '../utils';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationsActions {
  addNotification: (title: string, message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadNotifications: () => Notification[];
  getRecentNotifications: () => Notification[];
}

type NotificationsStore = NotificationsState & NotificationsActions;

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  ...initialState,

  addNotification: (title, message, type = 'info') => {
    const notification: Notification = {
      id: generateNotificationId(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    set((state) => {
      const newNotifications = sortNotificationsByDate([...state.notifications, notification]);
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      };
    });
  },

  removeNotification: (id) => {
    set((state) => {
      const newNotifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const newNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set(initialState);
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.read);
  },

  getRecentNotifications: () => {
    return get().notifications.filter(isRecentNotification);
  },
}));
