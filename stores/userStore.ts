import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: string;
  userKeyType: string;
  userKey: string;
  isAdmin: boolean;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    {
      name: 'user-storage'
    }
  )
);
