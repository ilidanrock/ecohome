import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modals: Record<string, boolean>;
  loading: Record<string, boolean>;
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  resetUI: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  modals: {},
  loading: {},
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setMobileMenuOpen: (open) => {
    set({ mobileMenuOpen: open });
  },

  toggleMobileMenu: () => {
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
  },

  openModal: (modalId) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    }));
  },

  closeModal: (modalId) => {
    set((state) => {
      const newModals = { ...state.modals };
      delete newModals[modalId];
      return { modals: newModals };
    });
  },

  toggleModal: (modalId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: !state.modals[modalId],
      },
    }));
  },

  setLoading: (key, loading) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: loading,
      },
    }));
  },

  resetUI: () => {
    set(initialState);
  },
}));

