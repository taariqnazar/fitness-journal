import { create } from 'zustand';

type AuthView = 'login' | 'register-1' | 'register-2';

interface AuthStore {
  isOpen: boolean;
  view: AuthView;
  formData: any; // Stores registration data across steps
  openModal: (view?: AuthView) => void;
  closeModal: () => void;
  setView: (view: AuthView) => void;
  updateFormData: (data: any) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  view: 'login',
  formData: {},
  openModal: (view = 'login') => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false, view: 'login', formData: {} }),
  setView: (view) => set({ view }),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
}));
