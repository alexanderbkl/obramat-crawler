import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';
import { useCartStore } from './cartStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: !!user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            // Merge local cart with server cart
            const localCart = useCartStore.getState().items;
            if (localCart.length > 0) {
              await useCartStore.getState().mergeCart(localCart);
            } else {
              await useCartStore.getState().fetchCart();
            }

            return { success: true };
          }
          return { success: false, error: data.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Login failed',
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(userData);
          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            // Merge local cart with server cart
            const localCart = useCartStore.getState().items;
            if (localCart.length > 0) {
              await useCartStore.getState().mergeCart(localCart);
            }

            return { success: true };
          }
          return { success: false, error: data.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with logout even if API call fails
        }
        set({ user: null, token: null, isAuthenticated: false });
        useCartStore.getState().clearLocalCart();
      },

      updateProfile: async (data) => {
        try {
          const response = await authApi.updateProfile(data);
          if (response.data.success) {
            set({ user: response.data.data });
            return { success: true };
          }
          return { success: false, error: response.data.message };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || 'Update failed',
          };
        }
      },

      fetchProfile: async () => {
        if (!get().token) return;
        try {
          const { data } = await authApi.getProfile();
          if (data.success) {
            set({ user: data.data });
          }
        } catch (error) {
          // Token might be invalid, logout
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
