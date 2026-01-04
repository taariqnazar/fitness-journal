import { create } from 'zustand';

interface EntryStore {
  isEntryModalOpen: boolean;
  openEntryModal: () => void;
  closeEntryModal: () => void;
}

export const useEntryStore = create<EntryStore>((set) => ({
  isEntryModalOpen: false,
  openEntryModal: () => set({ isEntryModalOpen: true }),
  closeEntryModal: () => set({ isEntryModalOpen: false }),
}));
