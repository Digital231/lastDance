import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      hasNewNotifications: false,
      setUser: (userData) =>
        set({
          user: userData,
          isLoggedIn: true,
        }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          hasNewNotifications: false,
        }),
      updateUser: (updatedUserData) =>
        set((state) => ({
          user: { ...state.user, ...updatedUserData },
        })),
      setHasNewNotifications: (value) => set({ hasNewNotifications: value }),
    }),
    {
      name: "user-storage",
      storage: localStorage,
    }
  )
);

export default useUserStore;
