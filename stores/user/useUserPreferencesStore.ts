import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '../types';
import { STORAGE_PREFIX } from '../utils';

interface UserPreferencesState extends UserPreferences {}

interface UserPreferencesActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotificationEmail: (enabled: boolean) => void;
  setNotificationPush: (enabled: boolean) => void;
  setNotificationSound: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  resetPreferences: () => void;
}

type UserPreferencesStore = UserPreferencesState & UserPreferencesActions;

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    sound: true,
  },
  language: 'es',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setTheme: (theme) => {
        set({ theme });
      },

      setNotificationEmail: (enabled) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            email: enabled,
          },
        }));
      },

      setNotificationPush: (enabled) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            push: enabled,
          },
        }));
      },

      setNotificationSound: (enabled) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            sound: enabled,
          },
        }));
      },

      setLanguage: (language) => {
        set({ language });
      },

      setTimezone: (timezone) => {
        set({ timezone });
      },

      resetPreferences: () => {
        set(defaultPreferences);
      },
    }),
    {
      name: `${STORAGE_PREFIX}user-preferences`,
      version: 1,
    }
  )
);
