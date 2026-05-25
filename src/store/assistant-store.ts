import { create } from "zustand";

type AssistantStore = {
  open: boolean;
  prefill: string | null;
  setOpen: (open: boolean) => void;
  openWithMessage: (message: string) => void;
};

export const useAssistantStore = create<AssistantStore>((set) => ({
  open: false,
  prefill: null,
  setOpen: (open) =>
    set((state) => ({
      open,
      prefill: open ? state.prefill : null,
    })),
  openWithMessage: (message) => set({ open: true, prefill: message }),
}));
