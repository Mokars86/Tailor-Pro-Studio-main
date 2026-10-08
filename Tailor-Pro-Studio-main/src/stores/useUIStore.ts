import { create } from 'zustand';
import { AppNotification, TabType } from '../types';
import { getStoredNotifications } from '../services/pushNotificationService';
import { SupportedLanguage } from '../i18n/translations';

const SESSION_STORAGE_KEY = 'tailor_user_session';
const THEME_STORAGE_KEY = 'tailor_app_theme';
const LANGUAGE_STORAGE_KEY = 'tailor_app_language';

interface SavedSession {
  authScreen: 'signin' | 'register' | 'app';
  userRole: string;
  activeUserEmail: string;
  activeUserFullName: string;
}

const getInitialSession = (): Partial<SavedSession> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return {};
};

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark';
      if (saved && (saved === 'light' || saved === 'dark')) {
        return saved;
      }
    }
  } catch (e) {}
  return 'light';
};

const getInitialLanguage = (): SupportedLanguage => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (saved && ['en', 'tw', 'fr', 'ar'].includes(saved)) {
        return saved;
      }
    }
  } catch (e) {}
  return 'en';
};

const applyLanguageToDocument = (lang: SupportedLanguage) => {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  } catch (e) {}
};

const applyThemeToDocument = (theme: 'light' | 'dark') => {
  try {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  } catch (e) {}
};

const initialSession = getInitialSession();
const initialTheme = getInitialTheme();
const initialLang = getInitialLanguage();

applyThemeToDocument(initialTheme);
applyLanguageToDocument(initialLang);

interface UIState {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedArtistFilter: string;
  setSelectedArtistFilter: (filter: string) => void;

  // Notifications
  notifications: AppNotification[];
  activeToastNotification: AppNotification | null;
  setNotifications: (notifications: AppNotification[]) => void;
  setActiveToastNotification: (notification: AppNotification | null) => void;
  getUnreadNotificationCount: () => number;

  // Auth & Session
  authScreen: 'signin' | 'register' | 'app';
  setAuthScreen: (screen: 'signin' | 'register' | 'app') => void;
  userRole: string;
  setUserRole: (role: string) => void;
  activeUserEmail: string;
  setActiveUserEmail: (email: string) => void;
  activeUserFullName: string;
  setActiveUserFullName: (name: string) => void;
  clearSession: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Language & i18n
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useUIStore = create<UIState>((set, get) => {
  const persistCurrentSession = (overrides?: Partial<SavedSession>) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const state = get();
        const sessionToSave: SavedSession = {
          authScreen: overrides?.authScreen !== undefined ? overrides.authScreen : state.authScreen,
          userRole: overrides?.userRole !== undefined ? overrides.userRole : state.userRole,
          activeUserEmail: overrides?.activeUserEmail !== undefined ? overrides.activeUserEmail : state.activeUserEmail,
          activeUserFullName: overrides?.activeUserFullName !== undefined ? overrides.activeUserFullName : state.activeUserFullName
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToSave));
      }
    } catch (e) {}
  };

  return {
    activeTab: 'clients',
    setActiveTab: (tab) => set({ activeTab: tab }),

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    selectedFilter: 'all',
    setSelectedFilter: (filter) => set({ selectedFilter: filter }),
    selectedArtistFilter: 'all',
    setSelectedArtistFilter: (filter) => set({ selectedArtistFilter: filter }),

    notifications: getStoredNotifications(),
    activeToastNotification: null,
    setNotifications: (notifications) => set({ notifications }),
    setActiveToastNotification: (notification) => set({ activeToastNotification: notification }),
    getUnreadNotificationCount: () => get().notifications.filter((n) => !n.read).length,

    authScreen: initialSession.authScreen || 'signin',
    setAuthScreen: (screen) => {
      set({ authScreen: screen });
      persistCurrentSession({ authScreen: screen });
    },
    userRole: initialSession.userRole || 'Master (Studio Owner & Financial Control)',
    setUserRole: (role) => {
      set({ userRole: role });
      persistCurrentSession({ userRole: role });
    },
    activeUserEmail: initialSession.activeUserEmail || '',
    setActiveUserEmail: (email) => {
      set({ activeUserEmail: email });
      persistCurrentSession({ activeUserEmail: email });
    },
    activeUserFullName: initialSession.activeUserFullName || '',
    setActiveUserFullName: (name) => {
      set({ activeUserFullName: name });
      persistCurrentSession({ activeUserFullName: name });
    },
    clearSession: () => {
      set({
        authScreen: 'signin',
        activeUserEmail: '',
        activeUserFullName: '',
        userRole: 'Master (Studio Owner & Financial Control)'
      });
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (e) {}
    },

    theme: initialTheme,
    setTheme: (theme) => {
      set({ theme });
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
      } catch (e) {}
      applyThemeToDocument(theme);
    },
    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },

    language: initialLang,
    setLanguage: (lang) => {
      set({ language: lang });
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        }
      } catch (e) {}
      applyLanguageToDocument(lang);
    }
  };
});
