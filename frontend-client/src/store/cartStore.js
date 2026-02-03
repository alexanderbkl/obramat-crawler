import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '../api';
import { useAuthStore } from './authStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      isLoading: false,

      // Fetch cart from server (for authenticated users)
      fetchCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return;

        set({ isLoading: true });
        try {
          const { data } = await cartApi.get();
          if (data.success) {
            set({
              items: data.data.items,
              itemCount: data.data.itemCount,
              subtotal: data.data.subtotal,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Failed to fetch cart:', error);
        }
      },

      // Add item to cart
      addItem: async (product, quantity = 1, variantId = null) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (isAuthenticated) {
          // Add to server cart
          set({ isLoading: true });
          try {
            const { data } = await cartApi.add({
              productId: product.id,
              quantity,
              variantId,
            });
            if (data.success) {
              set({
                items: data.data.items,
                itemCount: data.data.itemCount,
                subtotal: data.data.subtotal,
                isLoading: false,
              });
              return { success: true };
            }
            return { success: false, error: data.message };
          } catch (error) {
            set({ isLoading: false });
            return {
              success: false,
              error: error.response?.data?.message || 'Failed to add item',
            };
          }
        } else {
          // Add to local cart
          const items = get().items;
          const existingIndex = items.findIndex(
            (item) => item.productId === product.id && item.variantId === variantId
          );

          let newItems;
          if (existingIndex > -1) {
            newItems = items.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [
              ...items,
              {
                id: `local-${Date.now()}`,
                productId: product.id,
                variantId,
                quantity,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  comparePrice: product.comparePrice,
                  currency: product.currency || 'EUR',
                  stock: product.stock,
                  imageUrl: product.imageUrl || product.images?.[0]?.url,
                },
                itemTotal: Number(product.price) * quantity,
              },
            ];
          }

          const subtotal = newItems.reduce((sum, item) => sum + item.itemTotal, 0);
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          set({ items: newItems, subtotal, itemCount });
          return { success: true };
        }
      },

      // Update item quantity
      updateQuantity: async (itemId, quantity) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            const { data } = await cartApi.update(itemId, quantity);
            if (data.success) {
              set({
                items: data.data.items,
                itemCount: data.data.itemCount,
                subtotal: data.data.subtotal,
                isLoading: false,
              });
              return { success: true };
            }
            return { success: false, error: data.message };
          } catch (error) {
            set({ isLoading: false });
            return {
              success: false,
              error: error.response?.data?.message || 'Failed to update quantity',
            };
          }
        } else {
          const items = get().items.map((item) =>
            item.id === itemId
              ? { ...item, quantity, itemTotal: Number(item.product.price) * quantity }
              : item
          );

          const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          set({ items, subtotal, itemCount });
          return { success: true };
        }
      },

      // Remove item from cart
      removeItem: async (itemId) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            const { data } = await cartApi.remove(itemId);
            if (data.success) {
              set({
                items: data.data.items,
                itemCount: data.data.itemCount,
                subtotal: data.data.subtotal,
                isLoading: false,
              });
              return { success: true };
            }
            return { success: false, error: data.message };
          } catch (error) {
            set({ isLoading: false });
            return {
              success: false,
              error: error.response?.data?.message || 'Failed to remove item',
            };
          }
        } else {
          const items = get().items.filter((item) => item.id !== itemId);
          const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          set({ items, subtotal, itemCount });
          return { success: true };
        }
      },

      // Clear cart
      clearCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            await cartApi.clear();
            set({ items: [], itemCount: 0, subtotal: 0, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
          }
        } else {
          set({ items: [], itemCount: 0, subtotal: 0 });
        }
      },

      // Clear local cart (used on logout)
      clearLocalCart: () => {
        set({ items: [], itemCount: 0, subtotal: 0 });
      },

      // Merge local cart with server cart (on login)
      mergeCart: async (localItems) => {
        if (localItems.length === 0) {
          return get().fetchCart();
        }

        set({ isLoading: true });
        try {
          const itemsToMerge = localItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId,
          }));

          const { data } = await cartApi.merge(itemsToMerge);
          if (data.success) {
            set({
              items: data.data.items,
              itemCount: data.data.itemCount,
              subtotal: data.data.subtotal,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Failed to merge cart:', error);
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        itemCount: state.itemCount,
        subtotal: state.subtotal,
      }),
    }
  )
);
