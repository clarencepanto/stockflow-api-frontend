import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      hydrate: () => {
        const token = localStorage.getItem("token");
        const storedData = localStorage.getItem("auth-storage");

        if (token && storedData) {
          try {
            const parsed = JSON.parse(storedData);
            if (parsed.state?.user && parsed.state?.token) {
              set({
                user: parsed.state.user,
                token: parsed.state.token,
                isAuthenticated: true,
              });
            }
          } catch (error) {
            console.error("Failed to hydrate auth state:", error);
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
